import {
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Eye,
  HelpCircle,
  Image,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { useState } from "react";
import { api, apiError } from "../../../api";
import AvailabilityEditor from "../../../components/AvailabilityEditor";
import { blankAvailability } from "../../../lib/constants";
import { doctorImage } from "../../../lib/doctorAssets";
import { doctorMeta } from "../../../lib/doctorMeta";

const settingTabs = [
  { key: "profile", label: "Profile Information", icon: User },
  { key: "clinic", label: "Clinic Details", icon: Building2 },
  { key: "hours", label: "Working Hours", icon: Clock },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Account & Security", icon: ShieldCheck },
];

export default function DoctorSettingsPage({ profile, session, notify, onSaved, onLogout, onNavigate }) {
  const meta = doctorMeta(profile);
  const initialForm = {
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    specialty: profile?.specialty || "",
    phone: "+94 77 123 4567",
    registration: `SLMC ${67800 + (profile?.id || 1)}`,
    bio: `Consultant ${profile?.specialty || "Doctor"} with over ${meta.experience} years of experience in preventive care, accurate diagnosis, and patient-centered treatment.`,
    availability: profile?.availability?.length ? profile.availability.map(({ day_of_week, start_time, end_time }) => ({
      day_of_week,
      start_time: start_time.slice(0, 5),
      end_time: end_time.slice(0, 5),
    })) : blankAvailability,
  };
  const [form, setForm] = useState(initialForm);
  const [activeTab, setActiveTab] = useState("profile");

  async function save(event) {
    event.preventDefault();
    try {
      const { first_name, last_name, specialty, availability } = form;
      const { data } = await api.put("/doctors/me/profile", { first_name, last_name, specialty, availability });
      notify("Settings saved.");
      onSaved(data);
    } catch (error) {
      notify(apiError(error));
    }
  }

  function reset() {
    setForm(initialForm);
    notify("Settings reset.");
  }

  return (
    <form className="doctor-settings-page" onSubmit={save}>
      <section className="settings-hero">
        <div className="doctor-profile-breadcrumb">
          <button type="button" onClick={() => onNavigate("console")}><User size={18} /> Dashboard</button>
          <span>/</span>
          <strong>Settings</strong>
        </div>
        <h1>Settings</h1>
        <p>Update your personal information, clinic details, and preferences.</p>
        <blockquote>Better Care<br />Through Better Settings</blockquote>
      </section>

      <nav className="settings-tabs">
        {settingTabs.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" className={activeTab === key ? "active" : ""} onClick={() => setActiveTab(key)}>
            <Icon size={20} /> {label}
          </button>
        ))}
      </nav>

      <section className="settings-grid">
        <article className="doctor-panel settings-form-card">
          <div className="doctor-section-title">
            <h2><User size={22} /> {activeTab === "profile" ? "Personal Information" : settingTabs.find((tab) => tab.key === activeTab)?.label}</h2>
            <span>Keep your profile up to date for a better experience.</span>
          </div>

          {activeTab === "hours" ? (
            <AvailabilityEditor availability={form.availability} setAvailability={(availability) => setForm({ ...form, availability })} />
          ) : activeTab === "notifications" ? (
            <div className="settings-option-list">
              <label><input type="checkbox" defaultChecked /> Appointment reminders</label>
              <label><input type="checkbox" defaultChecked /> Patient cancellation alerts</label>
              <label><input type="checkbox" /> Weekly schedule summary</label>
            </div>
          ) : activeTab === "security" ? (
            <div className="settings-option-list">
              <label><input type="checkbox" defaultChecked /> Keep account session protected</label>
              <label><input type="checkbox" defaultChecked /> Notify me about profile changes</label>
              <button type="button" className="ghost logout-action" onClick={onLogout}><LogOut size={18} /> Logout</button>
            </div>
          ) : (
            <>
              <div className="two-col">
                <label>First name<input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required /></label>
                <label>Last name<input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required /></label>
              </div>
              <div className="two-col">
                <label>Email address<span className="settings-readonly-field"><Mail size={18} /> {session?.user.email}</span></label>
                <label>Phone number<span className="settings-readonly-field"><Phone size={18} /> {form.phone}</span></label>
              </div>
              <div className="two-col">
                <label>Specialty<input value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} required /></label>
                <label>Registration number<span className="settings-readonly-field"><ShieldCheck size={18} /> {form.registration}</span></label>
              </div>
              <label>Bio / About you<textarea maxLength={300} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label>
              <small className="settings-count">{form.bio.length}/300</small>
            </>
          )}

          <div className="settings-actions">
            <button className="primary-action"><Check size={18} /> Save Changes</button>
            <button type="button" className="ghost" onClick={reset}><RefreshCw size={18} /> Reset</button>
          </div>
        </article>

        <aside className="settings-side-stack">
          <article className="doctor-panel settings-photo-card">
            <div className="doctor-section-title">
              <h2><Image size={22} /> Profile Photo</h2>
              <span>Upload a clear professional photo.</span>
            </div>
            <div>
              <img src={doctorImage(profile)} alt="" />
              <button type="button" className="primary-action" onClick={() => notify("Photo upload is ready for backend storage setup.")}><Upload size={18} /> Upload Photo</button>
              <button type="button" className="ghost" onClick={() => notify("Photo remove request noted.")}><Trash2 size={18} /> Remove</button>
              <small>JPG, PNG up to 5MB</small>
            </div>
          </article>

          <article className="doctor-panel quick-actions-card">
            <h2><Stethoscope size={22} /> Quick Actions</h2>
            <div>
              <button type="button" onClick={() => onNavigate("profile")}><Eye size={22} /><span><strong>View Public Profile</strong><small>See how patients view your profile.</small></span><ChevronRight size={22} /></button>
              <button type="button" onClick={() => setActiveTab("hours")}><CalendarDays size={22} /><span><strong>Set Availability</strong><small>Manage your working hours.</small></span><ChevronRight size={22} /></button>
            </div>
          </article>

          <article className="settings-help-card">
            <span><HelpCircle size={24} /></span>
            <div>
              <strong>Need help with settings?</strong>
              <small>Our support team is here to assist you with any questions.</small>
            </div>
            <button type="button" className="ghost" onClick={() => notify("Support request noted. Our team will contact you.")}>Contact Support</button>
          </article>
        </aside>
      </section>
    </form>
  );
}
