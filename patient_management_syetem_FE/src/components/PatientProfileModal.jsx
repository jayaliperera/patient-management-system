import { Check, X } from "lucide-react";
import { useState } from "react";
import { api, apiError } from "../api";

export default function PatientProfileModal({ session, setSession, notify, onClose }) {
  const parts = session.user.name.split(" ");
  const [form, setForm] = useState({ first_name: parts[0] || "", last_name: parts.slice(1).join(" ") || "", phone: "" });

  async function save(event) {
    event.preventDefault();
    try {
      const { data } = await api.put("/patients/me/profile", form);
      setSession({ ...session, user: data });
      notify("Profile updated.");
      onClose();
    } catch (error) {
      notify(apiError(error));
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="profile-modal compact-modal" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}><X size={18} /></button>
        <h2>Edit Patient Profile</h2>
        <div className="two-col">
          <label>First name<input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required /></label>
          <label>Last name<input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required /></label>
        </div>
        <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
        <button className="primary-action"><Check size={18} /> Save profile</button>
      </form>
    </div>
  );
}
