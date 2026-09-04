import { CalendarDays, Check, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api, apiError } from "../api";
import { appointmentDateIso, formatTime, formatWhen } from "../lib/date";

export default function RescheduleAppointmentDialog({ appointment, doctors, notify, onSave, onClose }) {
  const [doctorId, setDoctorId] = useState(String(appointment.doctor_id));
  const [date, setDate] = useState(appointmentDateIso(appointment.slot_time));
  const [slots, setSlots] = useState([]);
  const [slotTime, setSlotTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignored = false;

    async function loadSlots() {
      setLoadingSlots(true);
      setSlotTime("");
      try {
        const { data } = await api.get(`/doctors/${doctorId}/slots`, { params: { date } });
        if (!ignored) setSlots(data);
      } catch (error) {
        if (!ignored) notify(apiError(error));
      } finally {
        if (!ignored) setLoadingSlots(false);
      }
    }

    loadSlots();
    return () => {
      ignored = true;
    };
  }, [doctorId, date]);

  async function save(event) {
    event.preventDefault();
    if (!slotTime) return;
    setSaving(true);
    try {
      await onSave(appointment.id, { doctor_id: Number(doctorId), slot_time: slotTime });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const availableSlots = slots.filter((slot) => slot.available);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="profile-modal reschedule-dialog" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}><X size={18} /></button>
        <div className="reschedule-dialog-head">
          <span><CalendarDays size={26} /></span>
          <div>
            <h2>Reschedule Appointment</h2>
            <p>Current booking with {appointment.doctor_name} on {formatWhen(appointment.slot_time)}.</p>
          </div>
        </div>

        <div className="two-col">
          <label>
            Doctor
            <select value={doctorId} onChange={(event) => setDoctorId(event.target.value)}>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>Dr. {doctor.first_name} {doctor.last_name}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
        </div>

        <section className="reschedule-slots">
          {loadingSlots && <div className="info-strip"><Info size={16} /> Loading available slots...</div>}
          {!loadingSlots && availableSlots.map((slot) => (
            <button
              key={slot.slot_time}
              type="button"
              className={slotTime === slot.slot_time ? "slot active" : "slot"}
              onClick={() => setSlotTime(slot.slot_time)}
            >
              {formatTime(slot.slot_time)}
            </button>
          ))}
          {!loadingSlots && !availableSlots.length && <div className="info-strip"><Info size={16} /> No available slots for this doctor and date.</div>}
        </section>

        <footer className="reschedule-actions">
          <button type="button" className="ghost" onClick={onClose} disabled={saving}>Close</button>
          <button type="submit" className="primary-action" disabled={!slotTime || saving}><Check size={18} /> {saving ? "Saving..." : "Save New Slot"}</button>
        </footer>
      </form>
    </div>
  );
}
