import { Bell, CalendarCheck, ChevronDown, Pencil, UserRound } from "lucide-react";
import { doctorImage } from "../../../lib/doctorAssets";

const pageCopy = {
  console: ["Doctor Console", "Live overview of your channeling day"],
  profile: ["My Profile", "Manage the details patients see before booking"],
  schedule: ["My Schedule", "Review availability and booked time slots"],
  appointments: ["Appointments", "Track today, upcoming, and completed visits"],
  patients: ["Patients", "View people connected to your appointments"],
  records: ["Medical Records", "Review consultation notes and visit history"],
  settings: ["Settings", "Update practice information and preferences"],
};

export default function DoctorHeader({ activeView, session, profile, setActiveView, onEditProfile }) {
  const [title, subtitle] = pageCopy[activeView] || pageCopy.console;
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="doctor-header">
      <div className="doctor-header-copy">
        <span><CalendarCheck size={18} /> {today}</span>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>

      <div className="doctor-appbar-actions">
        <button className="notification-button" title="Open appointments" onClick={() => setActiveView("appointments")}>
          <Bell size={21} />
          <i></i>
        </button>
        <button className="doctor-profile-chip" type="button" onClick={() => setActiveView("profile")}>
          <img src={doctorImage(profile)} alt="" />
          <span>
            <strong>{session.user.name}</strong>
            <small>{profile?.specialty || "Doctor"}</small>
          </span>
          <UserRound size={18} />
        </button>
        <button className="doctor-edit-chip" type="button" onClick={onEditProfile}>
          <Pencil size={17} />
          <span>Edit Profile</span>
        </button>
        <button className="account-menu-button" title="Edit profile" onClick={onEditProfile}><ChevronDown size={20} /></button>
      </div>
    </header>
  );
}
