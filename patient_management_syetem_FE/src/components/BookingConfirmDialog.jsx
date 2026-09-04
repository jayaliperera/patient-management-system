import { CalendarCheck, Check, X } from "lucide-react";
import { formatWhen } from "../lib/date";
import { doctorMeta } from "../lib/doctorMeta";

export default function BookingConfirmDialog({ doctor, slotTime, saving, onConfirm, onClose }) {
  const meta = doctorMeta(doctor);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <article className="profile-modal compact-modal booking-confirm-dialog" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}><X size={18} /></button>
        <span className="confirm-dialog-icon"><CalendarCheck size={28} /></span>
        <div>
          <h2>Confirm Booking</h2>
          <p>Please confirm this appointment before we reserve the doctor slot.</p>
        </div>
        <dl className="booking-confirm-details">
          <div><dt>Doctor</dt><dd>Dr. {doctor.first_name} {doctor.last_name}</dd></div>
          <div><dt>Specialty</dt><dd>{meta.specialty}</dd></div>
          <div><dt>Date & Time</dt><dd>{formatWhen(slotTime)}</dd></div>
          <div><dt>Hospital</dt><dd>{meta.hospital}</dd></div>
          <div><dt>Room</dt><dd>{meta.room}</dd></div>
          <div><dt>Fee</dt><dd>{meta.fee ? `Rs. ${meta.fee}` : "Not specified"}</dd></div>
        </dl>
        <footer>
          <button type="button" className="ghost" onClick={onClose} disabled={saving}>Close</button>
          <button type="button" className="primary-action" onClick={onConfirm} disabled={saving}>
            <Check size={18} /> {saving ? "Booking..." : "Confirm Booking"}
          </button>
        </footer>
      </article>
    </div>
  );
}
