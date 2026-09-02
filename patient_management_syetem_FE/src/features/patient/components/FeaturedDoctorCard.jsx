import { BadgeCheck, CalendarDays, Star, User } from "lucide-react";
import { doctorImage } from "../../../lib/doctorAssets";
import { doctorMeta } from "../../../lib/doctorMeta";

export default function FeaturedDoctorCard({ doctor, selected, onSelect, onProfile }) {
  if (!doctor) {
    return <div className="featured-doctor-card empty">No doctors available yet.</div>;
  }

  const meta = doctorMeta(doctor);

  return (
    <article className="featured-doctor-card">
      <div className="card-title-row">
        <strong>Featured Doctor</strong>
        <button onClick={onProfile}>View Profile</button>
      </div>
      <div className="featured-doctor-body">
        <div className="avatar-wrap">
          <img src={doctorImage(doctor)} alt={`Dr. ${doctor.first_name} ${doctor.last_name}`} />
          <span><BadgeCheck size={13} /> Online</span>
        </div>
        <div>
          <h3>Dr. {doctor.first_name} {doctor.last_name}</h3>
          <p>{doctor.specialty} at {meta.hospital}</p>
          <div className="mini-meta">
            <span><Star size={14} /> {meta.rating}</span>
            <span>Rs. {meta.fee}</span>
            <span>{meta.experience} yrs</span>
          </div>
        </div>
      </div>
      <div className="doctor-card-actions">
        <button className="outline-action slim" onClick={onProfile}><User size={16} /> View Profile</button>
        <button className={`primary-action slim ${selected ? "selected" : ""}`} onClick={onSelect}><CalendarDays size={16} /> Book a Slot</button>
      </div>
    </article>
  );
}
