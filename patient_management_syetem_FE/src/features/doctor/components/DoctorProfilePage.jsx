import {
  BriefcaseMedical,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Image,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { useState } from "react";
import { doctorImage } from "../../../lib/doctorAssets";
import { doctorMeta } from "../../../lib/doctorMeta";

const tabs = [
  { label: "Profile", key: "profile", icon: User },
  { label: "Availability", key: "availability", icon: CalendarDays },
  { label: "Schedule", key: "schedule", icon: CalendarDays },
  { label: "Preferences", key: "preferences", icon: Stethoscope },
  { label: "Documents", key: "documents", icon: FileText },
];

export default function DoctorProfilePage({ profile, session, onEditProfile, onNavigate, notify }) {
  const [tab, setTab] = useState("profile");
  if (!profile) return <section className="doctor-profile-page"></section>;

  const meta = doctorMeta(profile);
  const rows = [
    { label: "Full Name", value: `Dr. ${profile.first_name} ${profile.last_name}`, icon: User },
    { label: "Email", value: session.user.email, icon: Mail },
    { label: "Phone", value: "+94 77 123 4567", icon: Phone },
    { label: "Hospital", value: meta.hospital, icon: Building2 },
    { label: "Specialty", value: profile.specialty, icon: Stethoscope },
    { label: "Experience", value: `${meta.experience} years`, icon: BriefcaseMedical },
    { label: "Registration No.", value: `SLMC ${67800 + (profile.id || 1)}`, icon: ClipboardCheck },
  ];

  return (
    <section className="doctor-profile-page">
      <div className="doctor-profile-breadcrumb">
        <button type="button" onClick={() => onNavigate("console")}><User size={18} /> Dashboard</button>
        <span>/</span>
        <strong>My Profile</strong>
      </div>

      <section className="doctor-profile-hero-full">
        <div className="doctor-profile-avatar-wrap">
          <img src={doctorImage(profile)} alt="" />
          <i></i>
        </div>
        <div className="doctor-profile-identity">
          <em>Active</em>
          <h1>Dr. {profile.first_name} {profile.last_name}</h1>
          <p>Consultant {profile.specialty} <span>|</span> Reg. No: SLMC {67800 + (profile.id || 1)}</p>
          <div className="doctor-profile-metrics">
            <article><Building2 size={24} /><strong>{meta.hospital}</strong><span>Hospital</span></article>
            <article><Stethoscope size={24} /><strong>{profile.specialty}</strong><span>Specialty</span></article>
            <article><Star size={25} /><strong>{meta.rating}</strong><span>Patient Rating</span></article>
            <article><BriefcaseMedical size={25} /><strong>{meta.experience}+</strong><span>Years Experience</span></article>
          </div>
        </div>
        <button className="doctor-edit-button profile-page-edit" type="button" onClick={onEditProfile}>
          <Pencil size={17} /> Edit Profile
        </button>
        <blockquote>Better Care<br />Healthier Lives</blockquote>
      </section>

      <nav className="doctor-profile-tabs">
        {tabs.map(({ label, key, icon: Icon }) => (
          <button key={key} type="button" className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
            <Icon size={19} /> {label}
          </button>
        ))}
      </nav>

      {tab === "profile" && (
        <section className="doctor-profile-content-grid">
          <article className="doctor-panel doctor-profile-info-card">
            <div className="doctor-section-title">
              <h2><User size={22} /> Personal Information</h2>
              <button type="button" className="doctor-mini-action" onClick={onEditProfile}><Pencil size={16} /> Edit</button>
            </div>
            <div className="doctor-profile-info-list">
              {rows.map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <Icon size={20} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </article>

          <div className="doctor-profile-side-stack">
            <article className="doctor-panel doctor-profile-photo-card">
              <div className="doctor-section-title">
                <h2><Image size={22} /> Profile Photo</h2>
              </div>
              <div>
                <img src={doctorImage(profile)} alt="" />
                <button type="button" className="primary-action compact" onClick={() => notify("Photo upload is ready for backend storage setup.")}>
                  <Upload size={16} /> Change Photo
                </button>
                <button type="button" className="ghost compact-delete" onClick={() => notify("Photo remove request noted.")}>
                  <Trash2 size={16} /> Remove
                </button>
                <small>JPG, PNG up to 5MB</small>
              </div>
            </article>

            <article className="doctor-panel doctor-about-card">
              <div className="doctor-section-title">
                <h2><FileText size={22} /> About Me</h2>
                <button type="button" className="doctor-mini-action" onClick={onEditProfile}><Pencil size={16} /> Edit</button>
              </div>
              <p>
                I am a Consultant {profile.specialty} with over {meta.experience} years of experience in patient-centered care.
                Committed to providing accurate diagnosis and personalized treatment plans for a healthier tomorrow.
              </p>
            </article>
          </div>
        </section>
      )}

      {tab !== "profile" && (
        <section className="doctor-panel doctor-profile-tab-panel">
          <HeartPulse size={42} />
          <h2>{tabs.find((item) => item.key === tab)?.label}</h2>
          <p>{tab === "availability" ? "Manage weekly availability from Settings or jump to Schedule for booked sessions." : "This profile section is ready and connected to the doctor dashboard navigation."}</p>
          <button type="button" className="primary-action" onClick={() => onNavigate(tab === "availability" || tab === "schedule" ? "schedule" : "settings")}>
            Open {tab === "availability" || tab === "schedule" ? "Schedule" : "Settings"}
          </button>
        </section>
      )}

      <aside className="doctor-profile-note">
        <HeartPulse size={30} />
        <div>
          <strong>Manage your profile</strong>
          <span>Keep your information up to date to provide better care for your patients.</span>
        </div>
      </aside>
    </section>
  );
}
