import { CalendarDays, ClipboardList, Clock, Users } from "lucide-react";
import { formatDateOnly } from "../../../lib/date";

export default function PatientStats({ appointmentsCount, doctorsCount }) {
  const now = new Date();
  const cards = [
    { label: "Upcoming Visits", value: appointmentsCount, note: appointmentsCount ? "Scheduled appointments" : "You have no upcoming visits", icon: CalendarDays },
    { label: "Doctors Online", value: doctorsCount, note: "Available for appointments", icon: Users },
    {
      label: "Today's Date",
      value: formatDateOnly(now, { month: "short", day: "2-digit", year: "numeric" }),
      note: formatDateOnly(now, { weekday: "long" }),
      icon: Clock,
    },
    { label: "My Appointments", value: appointmentsCount, note: "Total appointments", icon: ClipboardList },
  ];

  return (
    <section className="patient-stats">
      {cards.map(({ label, value, note, icon: Icon }) => (
        <article className="patient-stat-card" key={label}>
          <span><Icon size={25} /></span>
          <div>
            <small>{label}</small>
            <strong>{value}</strong>
            <p>{note}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
