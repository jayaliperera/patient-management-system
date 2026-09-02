import { CalendarDays, FileText, Headphones, Home, Settings, User, Users } from "lucide-react";
import AppLogo from "../../../components/AppLogo";

const navItems = [
  { label: "Doctor Console", view: "console", icon: Home },
  { label: "My Profile", view: "profile", icon: User },
  { label: "My Schedule", view: "schedule", icon: CalendarDays },
  { label: "Appointments", view: "appointments", icon: CalendarDays },
  { label: "Patients", view: "patients", icon: Users },
  { label: "Medical Records", view: "records", icon: FileText },
  { label: "Settings", view: "settings", icon: Settings },
];

export default function DoctorSidebar({ activeView, setActiveView, onEditProfile, notify }) {
  function handleClick(view) {
    setActiveView(view);
  }

  return (
    <aside className="doctor-sidebar">
      <div className="sidebar-brand">
        <AppLogo className="sidebar-logo" />
      </div>

      <nav className="doctor-nav">
        {navItems.map(({ label, view, icon: Icon }) => (
          <button key={label} className={activeView === view ? "active" : ""} onClick={() => handleClick(view)}>
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="support-card">
        <span><Headphones size={23} /></span>
        <strong>Need Help?</strong>
        <small>Contact support</small>
        <button onClick={() => notify("Support request noted. Our team will contact you.")}>Contact Support</button>
      </div>
    </aside>
  );
}
