import { Check, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { api, apiError } from "../../../api";

export default function PatientProfilePage({ session, setSession, notify }) {
  const parts = session.user.name.split(" ");
  const [form, setForm] = useState({
    first_name: parts[0] || "",
    last_name: parts.slice(1).join(" ") || "",
    phone: "",
  });

  async function save(event) {
    event.preventDefault();
    try {
      const { data } = await api.put("/patients/me/profile", form);
      setSession({ ...session, user: data });
      notify("Profile updated.");
    } catch (error) {
      notify(apiError(error));
    }
  }

  return (
    <form className="patient-profile-page" onSubmit={save}>
      <div className="doctor-section-title">
        <h2><User size={22} /> My Profile</h2>
      </div>

      <div className="patient-profile-summary">
        <img src="/female-doctor.jpg" alt="" />
        <div>
          <strong>{session.user.name}</strong>
          <span>Patient account</span>
          <small><Mail size={15} /> {session.user.email}</small>
        </div>
      </div>

      <div className="two-col">
        <label>First name<input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required /></label>
        <label>Last name<input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required /></label>
      </div>
      <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+94 77 123 4567" /></label>

      <div className="patient-profile-cards">
        <article><User size={20} /><strong>Verified Patient</strong><span>Account identity is ready for bookings.</span></article>
        <article><Phone size={20} /><strong>Contact Ready</strong><span>Keep phone details updated for clinic calls.</span></article>
      </div>

      <button className="primary-action"><Check size={18} /> Save Profile</button>
    </form>
  );
}
