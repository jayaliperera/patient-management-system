import { CalendarCheck, ChevronRight, Clock, Users } from "lucide-react";

export default function DoctorStats({ todayCount, totalPatients, monthCount }) {
  const stats = [
    { label: "Today's Appointments", value: todayCount, icon: CalendarCheck, tone: "blue" },
    { label: "Total Patients", value: totalPatients, icon: Users, tone: "green" },
    { label: "Consultations (This Month)", value: monthCount, icon: Clock, tone: "purple" },
  ];

  return (
    <section className="doctor-stats-row">
      {stats.map(({ label, value, icon: Icon, tone }) => (
        <article className={`doctor-stat-card ${tone}`} key={label}>
          <span><Icon size={28} /></span>
          <div>
            <strong>{value}</strong>
            <p>{label}</p>
          </div>
          <ChevronRight size={21} />
        </article>
      ))}
    </section>
  );
}
