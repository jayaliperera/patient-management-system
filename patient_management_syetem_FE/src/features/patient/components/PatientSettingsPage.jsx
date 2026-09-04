import {
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Link,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, apiError } from "../../../api";
import PatientPageShell from "./PatientPageShell";

const tabs = [
  { label: "Profile Preferences", icon: User },
  { label: "Notifications", icon: Bell },
  { label: "Privacy & Security", icon: ShieldCheck },
  { label: "Reminders", icon: CalendarDays },
  { label: "Connected Accounts", icon: Link },
];

export default function PatientSettingsPage({ session, profile, setProfile, setSession, notify, onLogout }) {
  const [form, setForm] = useState({
    first_name: profile?.first_name || session.user.name.split(" ")[0] || "",
    last_name: profile?.last_name || session.user.name.split(" ").slice(1).join(" ") || "",
    phone: profile?.phone || "",
    birth_date: "",
    gender: "Female",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        birth_date: "",
        gender: "Female",
      });
    }
  }, [profile]);

  async function save(event) {
    event.preventDefault();
    try {
      const { data } = await api.put("/patients/me/profile", form);
      setSession({ ...session, user: data });
      setProfile({ ...profile, ...form });
      notify("Settings saved.");
    } catch (error) {
      notify(apiError(error));
    }
  }

  return (
    <form className="patient-settings-page" onSubmit={save}>
      <PatientPageShell
        title="Settings"
        subtitle="Manage your account preferences and patient dashboard behavior."
        quote="Your Health. Your Control."
        icon={ShieldCheck}
      >
        <nav className="patient-page-tabs">
          {tabs.map(({ label, icon: Icon }, index) => (
            <button key={label} type="button" className={index === 0 ? "active" : ""}><Icon size={20} /> {label}</button>
          ))}
        </nav>
      </PatientPageShell>

      <section className="patient-settings-grid">
        <div className="patient-settings-left">
          <article className="patient-panel patient-settings-card">
            <div className="doctor-section-title">
              <h2><User size={22} /> Personal Information</h2>
              <span>Keep your profile up to date for a smoother booking experience.</span>
            </div>
            <div className="patient-profile-settings">
              <div className="patient-avatar-editor">
                <span>
                  <img src="/female-doctor.jpg" alt="" />
                  <button type="button" onClick={() => notify("Photo upload is ready for backend storage setup.")} title="Change photo"><Camera size={17} /></button>
                </span>
                <button type="button" className="ghost compact" onClick={() => notify("Photo upload is ready for backend storage setup.")}>Change Photo</button>
              </div>
              <div className="patient-form-fields">
                <div className="two-col">
                  <label>First Name<input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required /></label>
                  <label>Last Name<input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required /></label>
                </div>
                <div className="two-col">
                  <label>Email Address<span className="settings-readonly-field"><Mail size={18} /> {session.user.email}</span></label>
                  <label>Phone Number<span className="settings-readonly-field editable-field"><Phone size={18} /><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Enter phone number" /></span></label>
                </div>
                <div className="two-col">
                  <label>Date of Birth<span className="settings-readonly-field editable-field"><CalendarDays size={18} /><input type="date" value={form.birth_date} onChange={(event) => setForm({ ...form, birth_date: event.target.value })} /></span></label>
                  <label>Gender<span className="settings-readonly-field select-like"><UserRound size={18} /><select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}><option>Female</option><option>Male</option><option>Other</option></select><ChevronDown size={17} /></span></label>
                </div>
                <button className="primary-action save-patient-settings"><Check size={18} /> Save Changes</button>
              </div>
            </div>
          </article>

        </div>

        <aside className="patient-settings-side">
          <article className="patient-panel">
            <div className="doctor-section-title">
              <h2><CalendarDays size={22} /> Appointment Preferences</h2>
              <span>Set your preferred options for booking appointments.</span>
            </div>
            <label>Preferred Hospital Location<span className="settings-readonly-field select-like"><MapPin size={18} /><select defaultValue="Any Location"><option>Any Location</option></select><ChevronDown size={17} /></span></label>
            <label>Preferred Consultation Type<span className="settings-readonly-field select-like"><Stethoscope size={18} /><select defaultValue="Any Type"><option>Any Type</option></select><ChevronDown size={17} /></span></label>
            <label>Preferred Appointment Time<span className="settings-readonly-field select-like"><CalendarDays size={18} /><select defaultValue="Any Time"><option>Any Time</option></select><ChevronDown size={17} /></span></label>
          </article>

          <article className="patient-panel account-actions-card">
            <div className="doctor-section-title">
              <h2><LockKeyhole size={22} /> Account Actions</h2>
              <span>Manage your account or sign out from your session.</span>
            </div>
            <div className="patient-action-grid">
              <button type="button" className="ghost" onClick={() => notify("Password change is ready for backend setup.")}><LockKeyhole size={18} /> Change Password</button>
              <button type="button" className="danger" onClick={() => notify("Delete account request noted.")}><Trash2 size={18} /> Delete Account</button>
              <button type="button" className="ghost logout-action full" onClick={onLogout}><LogOut size={18} /> Logout</button>
            </div>
          </article>
        </aside>
      </section>
    </form>
  );
}
