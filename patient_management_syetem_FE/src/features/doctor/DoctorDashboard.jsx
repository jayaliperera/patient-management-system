import { useEffect, useMemo, useState } from "react";
import { api, apiError } from "../../api";
import DoctorEditModal from "../../components/DoctorEditModal";
import { addDaysIso, addMonthsIso, appointmentDateIso, todayIso } from "../../lib/date";
import DoctorAppointmentsPage from "./components/DoctorAppointmentsPage";
import DoctorHeader from "./components/DoctorHeader";
import DoctorHero from "./components/DoctorHero";
import DoctorPatientsPage from "./components/DoctorPatientsPage";
import DoctorProfilePage from "./components/DoctorProfilePage";
import DoctorProfileOverview from "./components/DoctorProfileOverview";
import DoctorRecordsPage from "./components/DoctorRecordsPage";
import DoctorSchedulePanel from "./components/DoctorSchedulePanel";
import DoctorSettingsPage from "./components/DoctorSettingsPage";
import DoctorSidebar from "./components/DoctorSidebar";
import DoctorStats from "./components/DoctorStats";

export default function DoctorDashboard({ session, setSession, notify }) {
  const [view, setView] = useState("day");
  const [date, setDate] = useState(todayIso());
  const [schedule, setSchedule] = useState([]);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ today_appointments: 0, week_appointments: 0, total_patients: 0, completed_consultations: 0 });
  const [editing, setEditing] = useState(false);
  const [activeView, setActiveView] = useState("console");

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [view, date]);

  async function loadSchedule() {
    try {
      const { data } = await api.get("/doctors/me/schedule", { params: { view, on: date } });
      setSchedule(data);
    } catch (error) {
      notify(apiError(error));
    }
  }

  async function loadProfile() {
    try {
      const { data } = await api.get("/doctors/me/profile");
      setProfile(data);
    } catch (error) {
      notify(apiError(error));
    }
  }

  async function loadStats() {
    try {
      const { data } = await api.get("/doctors/me/stats");
      setStats(data);
    } catch (error) {
      notify(apiError(error));
    }
  }

  const grouped = useMemo(() => schedule.reduce((acc, item) => {
    const key = appointmentDateIso(item.slot_time);
    acc[key] = [...(acc[key] || []), item];
    return acc;
  }, {}), [schedule]);

  function stepDate(direction) {
    if (view === "month") setDate(addMonthsIso(date, direction));
    else setDate(addDaysIso(date, direction * (view === "week" ? 7 : 1)));
  }

  return (
    <section className="doctor-home">
      <DoctorSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onEditProfile={() => setEditing(true)}
        notify={notify}
      />
      <main className="doctor-main">
        <DoctorHeader
          activeView={activeView}
          session={session}
          profile={profile}
          setActiveView={setActiveView}
          onEditProfile={() => setEditing(true)}
        />
        <div className="doctor-content">
          {activeView === "console" && (
            <>
              <DoctorHero session={session} profile={profile} onEditProfile={() => setEditing(true)} />
              <section className="doctor-workbench">
                <DoctorProfileOverview profile={profile} session={session} onEditProfile={() => setEditing(true)} />
                <DoctorSchedulePanel
                  view={view}
                  setView={setView}
                  date={date}
                  setDate={setDate}
                  grouped={grouped}
                  onStepDate={stepDate}
                  onAddAvailability={() => setActiveView("settings")}
                  notify={notify}
                />
              </section>
              <DoctorStats
                todayCount={stats.today_appointments}
                totalPatients={stats.total_patients}
                monthCount={stats.completed_consultations}
              />
            </>
          )}
          {activeView === "profile" && (
            <DoctorProfilePage
              profile={profile}
              session={session}
              onEditProfile={() => setEditing(true)}
              onNavigate={setActiveView}
              notify={notify}
            />
          )}
          {["schedule", "appointments"].includes(activeView) && (
            activeView === "schedule"
              ? (
                <DoctorSchedulePanel
                  view={view}
                  setView={setView}
                  date={date}
                  setDate={setDate}
                  grouped={grouped}
                  onStepDate={stepDate}
                  fullPage
                  onAddAvailability={() => setActiveView("settings")}
                  notify={notify}
                />
              )
              : <DoctorAppointmentsPage notify={notify} onNavigate={setActiveView} onStatsChanged={() => { loadSchedule(); loadStats(); }} />
          )}
          {activeView === "patients" && <DoctorPatientsPage notify={notify} />}
          {activeView === "records" && <DoctorRecordsPage notify={notify} />}
          {activeView === "settings" && profile && (
            <DoctorSettingsPage
              profile={profile}
              session={session}
              notify={notify}
              onLogout={() => setSession(null)}
              onNavigate={setActiveView}
              onSaved={(updated) => {
                setProfile(updated);
                setSession({ ...session, user: { ...session.user, name: `Dr. ${updated.first_name} ${updated.last_name}` } });
                loadStats();
              }}
            />
          )}
        </div>
      </main>

      {editing && profile && (
        <DoctorEditModal
          profile={profile}
          onClose={() => setEditing(false)}
          notify={notify}
          onSaved={(updated) => {
            setProfile(updated);
            setSession({ ...session, user: { ...session.user, name: `Dr. ${updated.first_name} ${updated.last_name}` } });
            setEditing(false);
          }}
        />
      )}
    </section>
  );
}
