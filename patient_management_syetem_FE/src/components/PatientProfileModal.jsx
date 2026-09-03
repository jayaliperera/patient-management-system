import { Check, Phone, User, X } from "lucide-react";
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
        <h2><User size={22} /> Edit Patient Profile</h2>
        <div className="two-col">
          <label>First name<span className="settings-readonly-field editable-field"><User size={18} /><input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required /></span></label>
          <label>Last name<span className="settings-readonly-field editable-field"><User size={18} /><input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required /></span></label>
        </div>
        <label>Phone<span className="settings-readonly-field editable-field"><Phone size={18} /><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></span></label>
        <button className="primary-action"><Check size={18} /> Save profile</button>
      </form>
    </div>
  );
}
