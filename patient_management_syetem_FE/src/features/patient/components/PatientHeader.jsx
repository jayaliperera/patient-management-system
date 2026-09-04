import { Bell, ChevronDown, Search } from "lucide-react";

export default function PatientHeader({ activeView, session, query, setQuery, setActiveView }) {
  return (
    <header className="patient-header">
      <form className="global-search" onSubmit={(event) => { event.preventDefault(); setActiveView("findDoctors"); }}>
        <Search size={21} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setActiveView("findDoctors")}
          placeholder="Search doctors, specialties, or hospitals..."
        />
      </form>
      <div className="patient-appbar-actions">
        <button className="notification-button" title="Notifications" onClick={() => setActiveView("notifications")}>
          <Bell size={22} />
          <i></i>
        </button>
        <button className="patient-profile-chip" type="button" onClick={() => setActiveView("profile")}>
          <img src="/female-doctor.jpg" alt="" />
          <span>
            <strong>{session.user.name}</strong>
            <small>Patient</small>
          </span>
          <ChevronDown size={18} />
        </button>
      </div>
    </header>
  );
}
