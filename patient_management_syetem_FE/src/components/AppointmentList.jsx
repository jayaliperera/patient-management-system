import { formatWhen } from "../lib/date";

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
          {canCancel && <button className="danger" onClick={() => onCancel(item.id)}>Cancel</button>}
        </article>
      ))}
      {!items.length && <p className="empty">No appointments in this view.</p>}
    </div>
  );
}
