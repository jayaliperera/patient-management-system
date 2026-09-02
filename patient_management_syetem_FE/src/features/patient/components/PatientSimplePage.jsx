import { Bell, FileText, LogOut, Settings, User } from "lucide-react";

const pageMeta = {
  records: {
    title: "Medical Records",
    text: "Keep prescriptions, reports, and visit summaries organized for future consultations.",
    icon: FileText,
    items: ["Prescription uploads", "Lab report history", "Doctor visit notes"],
  },
  notifications: {
    title: "Notifications",
    text: "Appointment reminders, booking updates, and clinic messages appear here.",
    icon: Bell,
    items: ["Booking confirmations", "Cancellation updates", "Schedule reminders"],
  },
  settings: {
    title: "Settings",
    text: "Manage account preferences and patient dashboard behavior.",
    icon: Settings,
    items: ["Profile preferences", "Reminder settings", "Privacy controls"],
  },
  profile: {
    title: "My Profile",
    text: "Review your patient identity and keep account details ready for every appointment.",
    icon: User,
    items: ["Name", "Phone", "Account identity"],
  },
};

export default function PatientSimplePage({ view, onLogout }) {
  const meta = pageMeta[view] || pageMeta.settings;
  const Icon = meta.icon;

  return (
    <section className="simple-page-card">
      <span><Icon size={34} /></span>
      <h2>{meta.title}</h2>
      <p>{meta.text}</p>
      <div className="simple-list">
        {meta.items.map((item) => <strong key={item}>{item}</strong>)}
      </div>
      {view === "settings" && <button className="ghost logout-action" onClick={onLogout}><LogOut size={18} /> Logout</button>}
    </section>
  );
}
