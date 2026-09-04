import { BadgeCheck, MapPin, Pencil, Star, Stethoscope } from "lucide-react";
import { doctorImage } from "../../../lib/doctorAssets";
import { doctorMeta } from "../../../lib/doctorMeta";

export default function DoctorHero({ session, profile, onEditProfile }) {
  const meta = doctorMeta(profile);
  const displayName = profile ? `Dr. ${profile.first_name} ${profile.last_name}` : session.user.name;

  return (
    <section className="doctor-hero-card">
      <div className="doctor-hero-copy">
        <span><Stethoscope size={18} /> Doctor Console</span>
        <h1>{displayName}</h1>
        <p>Specialist schedule and profile controls.</p>
        <div className="doctor-hero-metrics">
          <article><Stethoscope size={28} /><strong>{meta.specialty}</strong><small>Specialty</small></article>
          <article><MapPin size={28} /><strong>{meta.hospital}</strong><small>Hospital</small></article>
          <article><Star size={28} /><strong>{meta.rating}</strong><small>Patient Rating</small></article>
        </div>
      </div>
      <div className="doctor-hero-art">
        <button className="doctor-edit-button" onClick={onEditProfile}><Pencil size={18} /> Edit Profile</button>
        <img src={doctorImage(profile)} alt={displayName} />
        <blockquote>Better<br />Care<br />Healthier<br />Lives</blockquote>
        <BadgeCheck className="doctor-hero-badge" size={34} />
      </div>
    </section>
  );
}
