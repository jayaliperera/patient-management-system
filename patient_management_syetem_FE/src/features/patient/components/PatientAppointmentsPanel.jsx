import { CalendarDays, History, CalendarX, XCircle } from "lucide-react";
import { formatWhen } from "../../../lib/date";

export default function PatientAppointmentsPanel({ tab, setTab, appointments, history, onCancel }) {
  const items = tab === "upcoming" ? appointments : history;

  return (
    <section className="patient-appointments-box">
      <div className="tabs small-tabs">
        <button type="button" className={tab === "upcoming" ? "active" : ""} onClick={() => setTab("upcoming")}><CalendarDays size={15} /> Upcoming</button>
        <button type="button" className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}><History size={15} /> History</button>
      </div>
      <div className="patient-appointment-list">
        {items.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.doctor_name}</strong>
              <span>{formatWhen(item.slot_time)}</span>
            </div>
            <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
            {tab === "upcoming" && <button className="danger" onClick={() => onCancel(item)}><XCircle size={16} /> Cancel</button>}
          </article>
        ))}
        {!items.length && (
          <div className="empty-appointments">
            <CalendarX size={46} />
            <strong>No appointments yet</strong>
            <span>Your {tab} appointments will appear here.</span>
          </div>
        )}
      </div>
    </section>
  );
}
