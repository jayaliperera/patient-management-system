import { Bell, CalendarDays, FileText, Headphones, Home, Search, Settings, User } from "lucide-react";
import AppLogo from "../../../components/AppLogo";

const navItems = [
  { label: "Dashboard", view: "dashboard", icon: Home },
  { label: "Find Doctors", view: "findDoctors", icon: Search },
  { label: "My Appointments", view: "appointments", icon: CalendarDays },
  { label: "My Profile", view: "profile", icon: User },
  { label: "Medical Records", view: "records", icon: FileText },
  { label: "Notifications", view: "notifications", icon: Bell, dot: true },
  { label: "Settings", view: "settings", icon: Settings },
];

export default function PatientSidebar({ activeView, setActiveView, onProfile, notify }) {
  function handleClick(view) {
    setActiveView(view);
  }

  return (
    <aside className="patient-sidebar">
      <div className="sidebar-brand">
        <AppLogo className="sidebar-logo" />
      </div>

      <nav className="patient-nav">
        {navItems.map(({ label, view, icon: Icon, dot }) => (
          <button key={label} className={activeView === view ? "active" : ""} onClick={() => handleClick(view)}>
            <Icon size={22} />
            <span>{label}</span>
            {dot && <i></i>}
          </button>
        ))}
      </nav>

      <div className="support-card">
        <span><Headphones size={23} /></span>
        <strong>Need Help?</strong>
        <small>We're here for you</small>
        <button onClick={() => notify("Support request noted. Our team will contact you.")}>Contact Support</button>
      </div>
    </aside>
  );
}
