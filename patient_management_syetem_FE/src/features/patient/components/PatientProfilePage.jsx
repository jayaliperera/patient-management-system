import {
  BarChart3,
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  FileText,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, apiError } from "../../../api";
import PatientPageShell from "./PatientPageShell";

export default function PatientProfilePage({
  session,
  profile,
  setProfile,
  setSession,
  notify,
  appointmentsCount = 0,
  recordsCount = 0,
  notificationsCount = 0,
  onNavigate,
}) {
  const parts = session.user.name.split(" ");
  const [form, setForm] = useState({
    first_name: profile?.first_name || parts[0] || "",
    last_name: profile?.last_name || parts.slice(1).join(" ") || "",
    phone: profile?.phone || "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const displayName = `${form.first_name} ${form.last_name}`.trim() || session.user.name;

  async function save(event) {
    event.preventDefault();
    try {
      const { data } = await api.put("/patients/me/profile", form);
      setProfile({ ...profile, ...form });
      setSession({ ...session, user: data });
      notify("Profile updated.");
    } catch (error) {
      notify(apiError(error));
    }
  }

  function focusFirstField() {
    document.querySelector(".patient-profile-main-card input")?.focus();
  }

  const overview = [
    { label: "Appointments", detail: "View and manage your bookings", count: appointmentsCount, icon: CalendarDays, view: "appointments" },
    { label: "Medical Records", detail: "Access your health information", count: recordsCount, icon: FileText, view: "records" },
    { label: "Notifications", detail: "Stay updated with reminders", count: notificationsCount, icon: Bell, view: "notifications" },
  ];

  return (
    <form className="patient-profile-page" onSubmit={save}>
      <PatientPageShell
        title="My Profile"
        subtitle="Manage your personal information and account preferences."
        quote="Your Health Journey Starts with You"
        quoteDetail="Keep your profile up to date for a smoother care experience."
        icon={User}
      >
        <section className="patient-profile-grid">
          <article className="patient-panel patient-profile-main-card">
            <div className="patient-profile-hero-summary">
              <div className="patient-profile-avatar-wrap">
                <img src="/female-doctor.jpg" alt="" />
                <button type="button" aria-label="Change profile photo" onClick={() => notify("Photo upload can be connected to storage.")}>
                  <Camera size={18} />
                </button>
              </div>
              <div className="patient-profile-identity">
                <h2>{displayName}</h2>
                <span>Patient account</span>
                <small><Mail size={18} /> {session.user.email}</small>
                <strong><Check size={16} /> Verified Patient</strong>
              </div>
              <button className="outline-action patient-edit-profile-button" type="button" onClick={focusFirstField}>
                <Pencil size={18} /> Edit Profile
              </button>
            </div>

            <div className="patient-profile-divider" />

            <div className="patient-profile-section-title">
              <span><User size={24} /></span>
              <div>
                <h3>Personal Information</h3>
                <p>Keep your information accurate and up to date.</p>
              </div>
            </div>

            <div className="patient-profile-field-row">
              <label>
                First name
                <input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required />
              </label>
              <label>
                Last name
                <input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required />
              </label>
            </div>

            <label className="patient-profile-phone-field">
              Phone
              <span>
                <Phone size={19} />
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Enter phone number" />
              </span>
            </label>

            <div className="patient-profile-divider" />

            <div className="patient-profile-status-grid">
              <article>
                <User size={28} />
                <div>
                  <strong>Verified Patient</strong>
                  <span>Account identity is ready for bookings.</span>
                </div>
                <Check size={22} />
              </article>
              <article>
                <Phone size={28} />
                <div>
                  <strong>Contact Ready</strong>
                  <span>Keep phone details updated for clinic calls.</span>
                </div>
                <Check size={22} />
              </article>
            </div>

            <button className="primary-action profile-save-action">
              <Check size={20} /> Save Profile
            </button>
          </article>

          <aside className="patient-profile-side">
            <article className="patient-panel profile-completion-card">
              <div className="patient-card-heading">
                <span><ShieldCheck size={22} /></span>
                <h3>Profile Completion</h3>
              </div>
              <div className="profile-completion-body">
                <div className="profile-ring"><span>100%</span></div>
                <div>
                  <h4>Profile Complete</h4>
                  <p>Great! Your profile is complete and ready to use.</p>
                </div>
              </div>
              <div className="profile-completion-list">
                {["Personal information", "Phone number", "Account verification"].map((item) => (
                  <p key={item}><Check size={18} /><span>{item}</span><strong>Completed</strong></p>
                ))}
              </div>
            </article>

            <article className="patient-panel profile-overview-card">
              <div className="patient-card-heading">
                <span><BarChart3 size={22} /></span>
                <div>
                  <h3>Quick Account Overview</h3>
                  <p>Everything you need at a glance.</p>
                </div>
              </div>
              <div className="profile-overview-list">
                {overview.map(({ label, detail, count, icon: Icon, view }) => (
                  <button key={label} type="button" onClick={() => onNavigate?.(view)}>
                    <Icon size={24} />
                    <span><strong>{label}</strong><small>{detail}</small></span>
                    <em>{count}</em>
                    <ChevronRight size={20} />
                  </button>
                ))}
              </div>
              <div className="profile-secure-strip">
                <ShieldCheck size={34} />
                <span>
                  <strong>Your information is secure</strong>
                  <small>We use industry-standard security measures to keep your data safe and private.</small>
                </span>
              </div>
            </article>
          </aside>
        </section>
      </PatientPageShell>
    </form>
  );
}
