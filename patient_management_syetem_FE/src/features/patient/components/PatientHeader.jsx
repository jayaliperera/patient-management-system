import { Bell, CalendarCheck, Search, UserRound } from "lucide-react";

const pageCopy = {
  dashboard: ["Patient Channeling", "Find care, book slots, and manage appointments"],
  findDoctors: ["Find Doctors", "Search specialists and review availability"],
  appointments: ["My Appointments", "Track upcoming visits and previous bookings"],
  profile: ["My Profile", "Review your patient account details"],
  records: ["Medical Records", "Keep reports and visit summaries organized"],
  notifications: ["Notifications", "Appointment reminders and clinic updates"],
  settings: ["Settings", "Manage account preferences"],
};

export default function PatientHeader({ activeView, session, query, setQuery, setActiveView }) {
  const [title, subtitle] = pageCopy[activeView] || pageCopy.dashboard;
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="patient-header">
      <div className="patient-header-copy">
        <span><CalendarCheck size={18} /> {today}</span>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>

      <div className="patient-appbar-actions">
        <div className="global-search">
          <Search size={21} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setActiveView("findDoctors")}
            placeholder="Search doctors, specialties, or hospitals..."
          />
        </div>
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
          <UserRound size={18} />
        </button>
      </div>
    </header>
  );
}
