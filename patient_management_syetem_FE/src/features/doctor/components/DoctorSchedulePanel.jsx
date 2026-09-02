import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";

export default function DoctorSchedulePanel({ view, setView, date, setDate, grouped, onStepDate }) {
  const groups = Object.entries(grouped);

  return (
    <section className="doctor-panel doctor-schedule-card">
      <div className="doctor-section-title">
        <h2><CalendarDays size={22} /> Schedule & Availability</h2>
      </div>
      <div className="doctor-schedule-controls">
        <div className="segmented inline">
          <button className={view === "day" ? "active" : ""} onClick={() => setView("day")}>Day</button>
          <button className={view === "week" ? "active" : ""} onClick={() => setView("week")}>Week</button>
        </div>
        <div className="doctor-date-control">
          <CalendarDays size={18} />
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <button type="button" onClick={() => onStepDate(-1)}><ChevronLeft size={19} /></button>
          <button type="button" onClick={() => onStepDate(1)}><ChevronRight size={19} /></button>
        </div>
      </div>
      <div className="doctor-schedule-list">
        {groups.map(([day, items]) => (
          <div className="day-group" key={day}>
            <h3>{new Date(`${day}T00:00:00`).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}</h3>
            {items.map((item) => (
              <article className="appointment-card doctor" key={item.id}>
                <span className="time-chip">{new Date(item.slot_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                <strong>{item.patient_name}</strong>
                <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
              </article>
            ))}
          </div>
        ))}
        {!groups.length && (
          <div className="doctor-empty-state">
            <CalendarPlus size={64} />
            <strong>No booked appointments for this view.</strong>
            <span>Once patients book appointments, they will appear here.</span>
          </div>
        )}
      </div>
    </section>
  );
}
