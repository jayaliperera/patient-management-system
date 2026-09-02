import { useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  Eye,
  EyeOff,
  HeartPulse,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { api, apiError } from "../../api";
import AvailabilityEditor from "../../components/AvailabilityEditor";
import { blankAvailability } from "../../lib/constants";

export default function AuthScreen({ mode, setMode, setSession, notify }) {
  const [role, setRole] = useState("PATIENT");
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    specialty: "Cardiology",
  });
  const [availability, setAvailability] = useState(blankAvailability);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const endpoint =
        mode === "login" ? "/auth/login" : role === "PATIENT" ? "/auth/register/patient" : "/auth/register/doctor";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : role === "PATIENT"
            ? form
            : { ...form, availability };
      const { data } = await api.post(endpoint, payload);
      setSession(data);
      notify(mode === "login" ? "Welcome back." : "Account created.");
    } catch (error) {
      notify(apiError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-landing">
      <div className="auth-copy">
        <span className="pill"><Sparkles size={16} /> {mode === "login" ? "Modern Healthcare, Made Simple" : "Smart clinic scheduling"}</span>
        <h1>{mode === "login" ? <>Book care with <span>confidence.</span></> : <>Find a doctor and reserve your <span>channeling slot.</span></>}</h1>
        <p>
          {mode === "login"
            ? "Patients can find doctors, reserve open slots, and manage appointments while doctors see their own schedule."
            : "Search specialists, inspect profiles, pick a verified open time, and manage every visit from one clean dashboard."}
        </p>

        <div className="benefit-grid">
          <article><CalendarCheck /><strong>Easy Booking</strong><small>Find and book appointments in minutes</small></article>
          <article><ShieldCheck /><strong>No double booking</strong><small>Real-time slot protection</small></article>
          <article><Stethoscope /><strong>Doctor schedules</strong><small>Availability for patients and doctors</small></article>
        </div>

        <div className="auth-cta-row">
          <button type="button" className="primary-action" onClick={() => setMode("register")}>Get Started <ArrowRight size={18} /></button>
        </div>
      </div>

      <div className="auth-image-wrap">
        <img src="/home-image.jpg" alt="Doctor consultation" />
        <div className="float-card top"><HeartPulse size={26} /><span>Better Care<br />Healthier Lives</span></div>
        <div className="float-card bottom"><CalendarCheck size={26} /><span>Your Health<br />Our Priority</span></div>
      </div>

      <form className="auth-form-panel" onSubmit={submit}>
        <div>
          <h2>{mode === "login" ? "Welcome Back" : "Create your account"}</h2>
          <p>{mode === "login" ? "Sign in to your CareSlot account" : "Join CareSlot to book appointments easily."}</p>
        </div>

        {mode === "register" && (
          <div className="segmented">
            <button type="button" className={role === "PATIENT" ? "active" : ""} onClick={() => setRole("PATIENT")}>Patient</button>
            <button type="button" className={role === "DOCTOR" ? "active" : ""} onClick={() => setRole("DOCTOR")}>Doctor</button>
          </div>
        )}

        <IconField icon={<Mail size={20} />} label="Email">
          <input autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </IconField>
        <IconField
          icon={<LockKeyhole size={20} />}
          label="Password"
          trailing={
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          }
        >
          <input autoComplete={mode === "login" ? "current-password" : "new-password"} type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={8} required />
        </IconField>

        {mode === "login" && (
          <div className="form-meta">
            <label className="checkline"><input type="checkbox" defaultChecked /> Remember me</label>
          </div>
        )}

        {mode === "register" && (
          <>
            <div className="two-col">
              <IconField icon={<User size={19} />} label="First name">
                <input autoComplete="given-name" placeholder="Enter your first name" value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required />
              </IconField>
              <IconField icon={<User size={19} />} label="Last name">
                <input autoComplete="family-name" placeholder="Enter your last name" value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required />
              </IconField>
            </div>
            {role === "PATIENT" ? (
              <IconField icon={<Users size={19} />} label="Phone">
                <input autoComplete="tel" placeholder="Enter your phone number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </IconField>
            ) : (
              <>
                <IconField icon={<Stethoscope size={19} />} label="Specialty">
                  <input value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} required />
                </IconField>
                <AvailabilityEditor availability={availability} setAvailability={setAvailability} />
              </>
            )}
          </>
        )}

        <button className="primary-action auth-submit" disabled={loading}>
          {mode === "register" ? <UserPlus size={18} /> : null}
          {loading ? "Working..." : mode === "register" ? "Create account" : "Sign in"}
          <ArrowRight size={18} />
        </button>

        <div className="form-switch">
          <span></span>
          <p>{mode === "login" ? "Don't have an account?" : "Already have an account?"} <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Register" : "Login"}</button></p>
          <span></span>
        </div>
      </form>
    </section>
  );
}

function IconField({ icon, trailing, label, children }) {
  return (
    <label className="icon-field">
      {label}
      <span>
        {icon}
        {children}
        {trailing}
      </span>
    </label>
  );
}
