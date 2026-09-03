import { useEffect, useMemo, useState } from "react";
import { api, apiError } from "../../api";
import DoctorProfileModal from "../../components/DoctorProfileModal";
import { todayIso } from "../../lib/date";
import AvailabilityPanel from "./components/AvailabilityPanel";
import DoctorFinderPanel from "./components/DoctorFinderPanel";
import PatientAppointmentsPanel from "./components/PatientAppointmentsPanel";
import PatientHeader from "./components/PatientHeader";
import PatientHero from "./components/PatientHero";
import PatientProfilePage from "./components/PatientProfilePage";
import PatientSidebar from "./components/PatientSidebar";
import PatientSimplePage from "./components/PatientSimplePage";
import PatientStats from "./components/PatientStats";

export default function PatientDashboard({ session, setSession, notify }) {
  const [specialty, setSpecialty] = useState("All");
  const [query, setQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [profileDoctor, setProfileDoctor] = useState(null);
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("upcoming");
  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
    loadDoctors();
    loadAppointments();
    loadHistory();
  }, []);

  useEffect(() => {
    if (selected) loadSlots(selected.id, date);
  }, [selected, date]);

  const filteredDoctors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const specialtyMatch = specialty === "All" || doctor.specialty.toLowerCase().includes(specialty.toLowerCase());
      const textMatch = !needle || `${doctor.first_name} ${doctor.last_name} ${doctor.specialty}`.toLowerCase().includes(needle);
      return specialtyMatch && textMatch;
    });
  }, [doctors, query, specialty]);

  const featuredDoctor = selected || filteredDoctors[0] || doctors[0] || null;

  async function loadDoctors() {
    const { data } = await api.get("/doctors");
    setDoctors(data);
    if (!selected && data.length) setSelected(data[0]);
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

  async function book(slotTime) {
    try {
      await api.post("/appointments", { doctor_id: selected.id, slot_time: slotTime });
      notify("Appointment booked.");
      await Promise.all([loadSlots(selected.id, date), loadAppointments(), loadHistory()]);
    } catch (error) {
      notify(apiError(error));
    }
  }

  async function cancel(id) {
    try {
      await api.patch(`/appointments/${id}/cancel`);
      notify("Appointment cancelled.");
      await Promise.all([loadAppointments(), loadHistory()]);
      if (selected) await loadSlots(selected.id, date);
    } catch (error) {
      notify(apiError(error));
    }
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
          {["dashboard", "findDoctors"].includes(activeView) && (
            <section className="patient-workbench">
              <DoctorFinderPanel
                query={query}
                setQuery={setQuery}
                specialty={specialty}
                setSpecialty={setSpecialty}
                doctors={filteredDoctors}
                selected={featuredDoctor}
                setSelected={setSelected}
                openProfile={setProfileDoctor}
                onViewAll={() => setActiveView("findDoctors")}
              />
              <AvailabilityPanel selected={selected} date={date} setDate={setDate} slots={slots} onBook={book} />
              <PatientAppointmentsPanel tab={tab} setTab={setTab} appointments={appointments} history={history} onCancel={cancel} />
            </section>
          )}
          {activeView === "appointments" && (
            <section className="patient-workbench single-view">
              <PatientAppointmentsPanel tab={tab} setTab={setTab} appointments={appointments} history={history} onCancel={cancel} />
            </section>
          )}
          {activeView === "profile" && (
            <PatientProfilePage session={session} setSession={setSession} notify={notify} />
          )}
          {["records", "notifications", "settings"].includes(activeView) && (
            <PatientSimplePage view={activeView} onLogout={() => setSession(null)} />
          )}
        </div>
      </main>

      {profileDoctor && <DoctorProfileModal doctor={profileDoctor} onClose={() => setProfileDoctor(null)} onSelect={() => { setSelected(profileDoctor); setProfileDoctor(null); }} />}
    </section>
  );
}
