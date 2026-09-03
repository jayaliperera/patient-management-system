import { formatWhen } from "../lib/date";
import { CalendarX, XCircle } from "lucide-react";

export default function AppointmentList({ items, canCancel, onCancel }) {
  return (
    <div className="appointment-list">
      {items.map((item) => (
        <article className="appointment-card" key={item.id}>
          <div>
            <strong>{item.doctor_name}</strong>
            <span>{formatWhen(item.slot_time)}</span>
          </div>
          <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
          {canCancel && <button className="danger" onClick={() => onCancel(item.id)}><XCircle size={16} /> Cancel</button>}
        </article>
      ))}
      {!items.length && (
        <div className="empty inline-empty">
          <CalendarX size={34} />
          <span>No appointments in this view.</span>
        </div>
      )}
    </div>
  );
}
