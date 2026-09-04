import { useEffect, useMemo, useState } from "react";
import { api, apiError } from "../../api";
import BookingConfirmDialog from "../../components/BookingConfirmDialog";
import ConfirmDialog from "../../components/ConfirmDialog";
import DoctorProfileModal from "../../components/DoctorProfileModal";
import RescheduleAppointmentDialog from "../../components/RescheduleAppointmentDialog";
import { downloadAppointmentReceipt } from "../../lib/receiptPdf";
import { todayIso } from "../../lib/date";
import { doctorMeta } from "../../lib/doctorMeta";
import AvailabilityPanel from "./components/AvailabilityPanel";
import DoctorFinderPanel from "./components/DoctorFinderPanel";
import PatientAppointmentsPage from "./components/PatientAppointmentsPage";
import PatientAppointmentsPanel from "./components/PatientAppointmentsPanel";
import PatientFindDoctorsPage from "./components/PatientFindDoctorsPage";
import PatientHeader from "./components/PatientHeader";
import PatientHero from "./components/PatientHero";
import PatientProfilePage from "./components/PatientProfilePage";
import PatientRecordsPage from "./components/PatientRecordsPage";
import PatientNotificationsPage from "./components/PatientNotificationsPage";
import PatientSettingsPage from "./components/PatientSettingsPage";
import PatientSidebar from "./components/PatientSidebar";
import PatientStats from "./components/PatientStats";

export default function PatientDashboard({ session, setSession, notify }) {
  const [specialty, setSpecialty] = useState("All");
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sortMode, setSortMode] = useState("availability");
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [profileDoctor, setProfileDoctor] = useState(null);
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [tab, setTab] = useState("upcoming");
  const [activeView, setActiveView] = useState("dashboard");
  const [pendingBooking, setPendingBooking] = useState(null);
  const [bookingSaving, setBookingSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);

  useEffect(() => {
    loadDoctors();
    loadAppointments();
    loadHistory();
    loadPatientProfile();
  }, []);

  useEffect(() => {
    if (selected) loadSlots(selected.id, date);
  }, [selected, date]);

  const locations = useMemo(() => {
    return ["All", ...Array.from(new Set(doctors.map((doctor) => doctor.hospital).filter(Boolean))).sort()];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = doctors.filter((doctor) => {
      const meta = doctorMeta(doctor);
      const searchable = `${doctor.first_name} ${doctor.last_name} ${meta.specialty} ${meta.hospital} ${meta.room}`.toLowerCase();
      const specialtyMatch = specialty === "All" || meta.specialty.toLowerCase().includes(specialty.toLowerCase());
      const locationMatch = locationFilter === "All" || meta.hospital === locationFilter;
      const dateMatch = isDoctorAvailableOn(doctor, date);
      const textMatch = !needle || searchable.includes(needle);
      return specialtyMatch && locationMatch && dateMatch && textMatch;
    });

    return filtered.sort((first, second) => {
      if (sortMode === "rating") return Number(second.rating || 0) - Number(first.rating || 0);
      if (sortMode === "fee-low") return Number(first.consultation_fee || 0) - Number(second.consultation_fee || 0);
      if (sortMode === "fee-high") return Number(second.consultation_fee || 0) - Number(first.consultation_fee || 0);
      return nextSlotSortValue(first, date) - nextSlotSortValue(second, date);
    });
  }, [date, doctors, locationFilter, query, sortMode, specialty]);

  const featuredDoctor = selected || filteredDoctors[0] || doctors[0] || null;

  async function loadDoctors() {
    const { data } = await api.get("/doctors");
    setDoctors(data);
    if (!selected && data.length) {
      setSelected(data[0]);
      setDate(nextAvailableDate(data[0]));
    }
  }

  async function loadSlots(doctorId, selectedDate) {
    const { data } = await api.get(`/doctors/${doctorId}/slots`, { params: { date: selectedDate } });
    setSlots(data);
  }

  async function loadAppointments() {
    const { data } = await api.get("/appointments/my");
    setAppointments(data);
  }

  async function loadHistory() {
    const { data } = await api.get("/appointments/history");
    setHistory(data);
  }

  async function loadPatientProfile() {
    try {
      const { data } = await api.get("/patients/me/profile");
      setPatientProfile(data);
    } catch (error) {
      notify(apiError(error));
    }
  }

  function book(slotTime) {
    if (!selected) {
      notify("Select a doctor before booking.");
      return;
    }

    setPendingBooking({ doctor: selected, slotTime });
  }

  async function confirmBooking() {
    if (!pendingBooking) return;
    setBookingSaving(true);
    try {
      await api.post("/appointments", { doctor_id: pendingBooking.doctor.id, slot_time: pendingBooking.slotTime });
      notify("Appointment booked.");
      setPendingBooking(null);
      await Promise.all([loadSlots(pendingBooking.doctor.id, date), loadAppointments(), loadHistory()]);
    } catch (error) {
      notify(apiError(error));
    } finally {
      setBookingSaving(false);
    }
  }

  function selectDoctorForBooking(doctor) {
    setSelected(doctor);
    setDate(nextAvailableDate(doctor));
  }

  function refreshAppointments() {
    return Promise.all([loadAppointments(), loadHistory()]);
  }

  function refreshSelectedSlots() {
    return selected ? loadSlots(selected.id, date) : Promise.resolve();
  }

  function requestCancel(itemOrId) {
    const item = typeof itemOrId === "object" ? itemOrId : appointments.find((appointment) => appointment.id === itemOrId);
    if (item) setConfirmAction({ type: "cancel", item });
  }

  function requestDelete(item) {
    setConfirmAction({ type: "delete", item });
  }

  async function cancel(id) {
    try {
      await api.patch(`/appointments/${id}/cancel`);
      notify("Appointment cancelled.");
      await Promise.all([refreshAppointments(), refreshSelectedSlots()]);
    } catch (error) {
      notify(apiError(error));
    }
  }

  async function deleteAppointment(id) {
    try {
      await api.delete(`/appointments/${id}`);
      notify("Appointment deleted.");
      await Promise.all([refreshAppointments(), refreshSelectedSlots()]);
    } catch (error) {
      notify(apiError(error));
    }
  }

  async function reschedule(id, payload) {
    try {
      await api.put(`/appointments/${id}`, payload);
      notify("Appointment rescheduled.");
      await Promise.all([refreshAppointments(), refreshSelectedSlots()]);
    } catch (error) {
      notify(apiError(error));
      throw error;
    }
  }

  function downloadReceipt(item) {
    const doctor = doctors.find((doctorItem) => doctorItem.id === item.doctor_id);
    downloadAppointmentReceipt({
      appointment: item,
      doctor,
      patientName: session.user.name,
      patientEmail: session.user.email,
    });
  }

  return (
    <section className="patient-home">
      <PatientSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        notify={notify}
      />
      <main className="patient-main">
        <PatientHeader
          session={session}
          query={query}
          setQuery={setQuery}
          setActiveView={setActiveView}
          activeView={activeView}
        />
        <div className="patient-content">
          {activeView === "dashboard" && (
            <>
              <PatientHero firstName={session.user.name.split(" ")[0]} onFindDoctors={() => setActiveView("findDoctors")} />
              <PatientStats appointmentsCount={appointments.length} doctorsCount={doctors.length} />
            </>
          )}
          {activeView === "dashboard" && (
            <section className="patient-workbench">
              <DoctorFinderPanel
                query={query}
                setQuery={setQuery}
                specialty={specialty}
                setSpecialty={setSpecialty}
                locationFilter={locationFilter}
                setLocationFilter={setLocationFilter}
                locations={locations}
                date={date}
                setDate={setDate}
                doctors={filteredDoctors}
                selected={featuredDoctor}
                setSelected={selectDoctorForBooking}
                openProfile={setProfileDoctor}
                onViewAll={() => setActiveView("findDoctors")}
              />
              <AvailabilityPanel selected={selected} date={date} setDate={setDate} slots={slots} onBook={book} />
              <PatientAppointmentsPanel tab={tab} setTab={setTab} appointments={appointments} history={history} onCancel={requestCancel} />
            </section>
          )}
          {activeView === "findDoctors" && (
            <PatientFindDoctorsPage
              query={query}
              setQuery={setQuery}
              specialty={specialty}
              setSpecialty={setSpecialty}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              locations={locations}
              sortMode={sortMode}
              setSortMode={setSortMode}
              doctors={filteredDoctors}
              selected={featuredDoctor}
              setSelected={selectDoctorForBooking}
              openProfile={setProfileDoctor}
              date={date}
              setDate={setDate}
              slots={slots}
              appointments={appointments}
              onBook={book}
            />
          )}
          {activeView === "appointments" && (
            <PatientAppointmentsPage
              tab={tab}
              setTab={setTab}
              appointments={appointments}
              history={history}
              onCancel={requestCancel}
              onDelete={requestDelete}
              onReschedule={setRescheduleAppointment}
              onDownloadReceipt={downloadReceipt}
              onFindDoctors={() => setActiveView("findDoctors")}
            />
          )}
          {activeView === "profile" && (
            <PatientProfilePage
              session={session}
              profile={patientProfile}
              setProfile={setPatientProfile}
              setSession={setSession}
              notify={notify}
              appointmentsCount={appointments.length + history.length}
              onNavigate={setActiveView}
            />
          )}
          {activeView === "records" && (
            <PatientRecordsPage onFindDoctors={() => setActiveView("findDoctors")} notify={notify} />
          )}
          {activeView === "notifications" && (
            <PatientNotificationsPage onFindDoctors={() => setActiveView("findDoctors")} notify={notify} />
          )}
          {activeView === "settings" && (
            <PatientSettingsPage
              session={session}
              profile={patientProfile}
              setProfile={setPatientProfile}
              setSession={setSession}
              notify={notify}
              onLogout={() => setSession(null)}
            />
          )}
        </div>
      </main>

      {profileDoctor && <DoctorProfileModal doctor={profileDoctor} onClose={() => setProfileDoctor(null)} onSelect={() => { setSelected(profileDoctor); setProfileDoctor(null); }} />}
      {pendingBooking && (
        <BookingConfirmDialog
          doctor={pendingBooking.doctor}
          slotTime={pendingBooking.slotTime}
          saving={bookingSaving}
          onConfirm={confirmBooking}
          onClose={() => setPendingBooking(null)}
        />
      )}
      {rescheduleAppointment && (
        <RescheduleAppointmentDialog
          appointment={rescheduleAppointment}
          doctors={doctors}
          notify={notify}
          onSave={reschedule}
          onClose={() => setRescheduleAppointment(null)}
        />
      )}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.type === "delete" ? "Delete appointment?" : "Cancel appointment?"}
          message={
            confirmAction.type === "delete"
              ? `This will permanently remove your appointment with ${confirmAction.item.doctor_name}.`
              : `This will cancel your booked appointment with ${confirmAction.item.doctor_name}.`
          }
          confirmLabel={confirmAction.type === "delete" ? "Delete Appointment" : "Cancel Appointment"}
          onConfirm={() => confirmAction.type === "delete" ? deleteAppointment(confirmAction.item.id) : cancel(confirmAction.item.id)}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </section>
  );
}

function nextAvailableDate(doctor) {
  const today = new Date();
  const availability = doctor?.availability || [];
  if (!availability.length) return todayIso();

  const availableDays = new Set(availability.map((item) => item.day_of_week));
  for (let offset = 0; offset < 14; offset += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + offset);
    const jsDay = candidate.getDay();
    const pythonDay = (jsDay + 6) % 7;
    if (availableDays.has(pythonDay)) {
      return candidate.toISOString().slice(0, 10);
    }
  }

  return todayIso();
}

function isDoctorAvailableOn(doctor, value) {
  const availability = doctor?.availability || [];
  if (!availability.length) return false;
  const selected = new Date(`${value}T00:00:00`);
  const pythonDay = (selected.getDay() + 6) % 7;
  return availability.some((item) => item.day_of_week === pythonDay);
}

function nextSlotSortValue(doctor, value) {
  const availability = doctor?.availability || [];
  if (!availability.length) return Number.MAX_SAFE_INTEGER;
  const selected = new Date(`${value}T00:00:00`);
  const pythonDay = (selected.getDay() + 6) % 7;
  const windows = availability.filter((item) => item.day_of_week === pythonDay);
  if (!windows.length) return Number.MAX_SAFE_INTEGER;
  return Math.min(...windows.map((item) => Number(item.start_time.replace(":", "").slice(0, 4))));
}
