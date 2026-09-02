import { ChevronRight, Clock, Mail, MapPin, Pencil, Phone, Stethoscope, User } from "lucide-react";
import { doctorImage } from "../../../lib/doctorAssets";
import { doctorMeta } from "../../../lib/doctorMeta";

export default function DoctorProfileOverview({ profile, session, onEditProfile }) {
  if (!profile) return <section className="doctor-panel profile-overview-card"></section>;

  const meta = doctorMeta(profile);
  const rows = [
    { label: "Hospital", value: meta.hospital, icon: MapPin },
    { label: "Specialty", value: profile.specialty, icon: Stethoscope },
    { label: "Experience", value: `${meta.experience} years`, icon: Clock },
    { label: "Phone", value: "+94 77 123 4567", icon: Phone },
    { label: "Email", value: session.user.email, icon: Mail },
  ];

  return (
    <section className="doctor-panel profile-overview-card">
      <div className="doctor-section-title">
        <h2><User size={22} /> Profile Overview</h2>
        <ChevronRight size={22} />
      </div>
      <div className="doctor-profile-head">
        <span>
          <img src={doctorImage(profile)} alt="" />
          <i></i>
        </span>
        <div>
          <em>Active</em>
          <strong>Dr. {profile.first_name} {profile.last_name}</strong>
          <small>Consultant {profile.specialty}</small>
        </div>
      </div>
      <div className="doctor-profile-rows">
        {rows.map(({ label, value, icon: Icon }) => (
          <div key={label}>
            <Icon size={17} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <button className="doctor-soft-action" onClick={onEditProfile}><Pencil size={17} /> Edit Profile</button>
    </section>
  );
}
