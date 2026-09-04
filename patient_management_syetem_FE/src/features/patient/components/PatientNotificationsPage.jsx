import { Bell, CalendarCheck, CalendarClock, Check, Mail, Search, XCircle } from "lucide-react";
import PatientPageShell from "./PatientPageShell";

const tabs = [
  { label: "All Notifications", icon: Bell },
  { label: "Booking Confirmations", icon: CalendarCheck },
  { label: "Cancellation Updates", icon: XCircle },
  { label: "Schedule Reminders", icon: CalendarClock },
  { label: "System Messages", icon: Mail },
];

export default function PatientNotificationsPage({ onFindDoctors, notify }) {
  return (
    <PatientPageShell
      title="Notifications"
      subtitle="Appointment reminders, booking updates, and clinic messages."
      quote="Stay Informed, Stay in Control"
      icon={Bell}
    >
      <section className="patient-panel patient-tabs-toolbar">
        <nav className="patient-page-tabs">
          {tabs.map(({ label, icon: Icon }, index) => (
            <button key={label} type="button" className={index === 0 ? "active" : ""}><Icon size={19} /> {label}</button>
          ))}
        </nav>
        <button type="button" className="ghost compact" onClick={() => notify("All notifications marked as read.")}><Check size={18} /> Mark All as Read</button>
      </section>

      <section className="patient-panel patient-empty-page tall">
        <div className="patient-empty-state">
          <Bell size={80} />
          <h2>No notifications yet</h2>
          <p>We'll notify you about appointment confirmations, reminders, updates, and important messages.</p>
          <button type="button" className="primary-action" onClick={onFindDoctors}><Search size={18} /> Find a Doctor</button>
        </div>
      </section>
    </PatientPageShell>
  );
}
