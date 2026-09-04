import { CalendarDays, Info } from "lucide-react";
import { doctorMeta } from "../../../lib/doctorMeta";
import { formatTime } from "../../../lib/date";

export default function AvailabilityPanel({ selected, date, setDate, slots, onBook }) {
  const meta = doctorMeta(selected);

  return (
    <section className="availability-panel">
      <div className="panel-head">
        <h3><CalendarDays size={18} /> Doctor Availability</h3>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </div>
      {selected ? (
        <>
          <h4>Dr. {selected.first_name} {selected.last_name}</h4>
          <p>{meta.specialty} - {meta.hospital} - {meta.room}</p>
          <div className="patient-slot-list">
            {slots.map((slot) => (
              <button key={slot.slot_time} disabled={!slot.available} onClick={() => onBook(slot.slot_time)} className={slot.available ? "slot" : "slot disabled"}>
                {formatTime(slot.slot_time)}
              </button>
            ))}
            {!slots.length && <div className="info-strip"><Info size={16} /> No channeling sessions for this date.</div>}
          </div>
        </>
      ) : (
        <div className="info-strip"><Info size={16} /> Select a doctor to view available sessions.</div>
      )}
    </section>
  );
}
