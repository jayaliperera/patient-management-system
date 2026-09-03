import { BadgeCheck, CalendarClock, Clock, Coins, MapPin, Stethoscope, X } from "lucide-react";
import { dayNames } from "../lib/constants";
import { doctorMeta } from "../lib/doctorMeta";

export default function DoctorProfileModal({ doctor, onClose, onSelect }) {
  const meta = doctorMeta(doctor);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <article className="profile-modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} title="Close"><X size={18} /></button>
        <div className="profile-hero">
          <span className="doctor-photo large"><Stethoscope size={38} /></span>
          <div>
            <h2>Dr. {doctor.first_name} {doctor.last_name}</h2>
            <p>{doctor.specialty}</p>
          </div>
        </div>
        <div className="profile-facts">
          <span><BadgeCheck size={18} /> {meta.rating} patient rating</span>
          <span><MapPin size={18} /> {meta.hospital}</span>
          <span><Clock size={18} /> {meta.experience} years experience</span>
          <span><Coins size={18} /> Rs. {meta.fee} channeling fee</span>
        </div>
        <h3>Weekly Sessions</h3>
        <div className="schedule-chips">
          {doctor.availability.map((item) => (
            <span key={item.id || `${item.day_of_week}-${item.start_time}`}>
              <CalendarClock size={16} /> {dayNames[item.day_of_week]} {item.start_time.slice(0, 5)}-{item.end_time.slice(0, 5)}
            </span>
          ))}
          {!doctor.availability.length && <p className="empty">No weekly sessions configured.</p>}
        </div>
        <button className="primary-action" onClick={onSelect}><CalendarClock size={18} /> Book this doctor</button>
      </article>
    </div>
  );
}
