import { Building2, Check, FileText, Phone, ShieldCheck, Stethoscope, User, X } from "lucide-react";
import { useState } from "react";
import { api, apiError } from "../api";
import { blankAvailability } from "../lib/constants";
import AvailabilityEditor from "./AvailabilityEditor";

function editableSpecialty(value) {
  return value && /[a-z]/i.test(value) ? value : "";
}

export default function DoctorEditModal({ profile, onClose, notify, onSaved }) {
  const [form, setForm] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    specialty: editableSpecialty(profile.specialty),
    phone: profile.phone || "",
    hospital: profile.hospital || "",
    registration_number: profile.registration_number || "",
    bio: profile.bio || "",
    experience_years: profile.experience_years ?? 0,
    consultation_fee: profile.consultation_fee ?? "",
    room_number: profile.room_number || "",
    availability: profile.availability.length ? profile.availability.map(({ day_of_week, start_time, end_time }) => ({
      day_of_week,
      start_time: start_time.slice(0, 5),
      end_time: end_time.slice(0, 5),
    })) : blankAvailability,
  });

  async function save(event) {
    event.preventDefault();
    try {
      const { data } = await api.put("/doctors/me/profile", {
        ...form,
        experience_years: Number(form.experience_years || 0),
        consultation_fee: form.consultation_fee === "" ? null : Number(form.consultation_fee),
      });
      notify("Doctor profile updated.");
      onSaved(data);
    } catch (error) {
      notify(apiError(error));
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="profile-modal" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}><X size={18} /></button>
        <h2><Stethoscope size={22} /> Edit Doctor Profile</h2>
        <div className="two-col">
          <label>First name<span className="settings-readonly-field editable-field"><User size={18} /><input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required /></span></label>
          <label>Last name<span className="settings-readonly-field editable-field"><User size={18} /><input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required /></span></label>
        </div>
        <label>Specialty<span className="settings-readonly-field editable-field"><Stethoscope size={18} /><input value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} required /></span></label>
        <div className="two-col">
          <label>Phone<span className="settings-readonly-field editable-field"><Phone size={18} /><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></span></label>
          <label>Hospital<span className="settings-readonly-field editable-field"><Building2 size={18} /><input value={form.hospital} onChange={(event) => setForm({ ...form, hospital: event.target.value })} /></span></label>
        </div>
        <div className="two-col">
          <label>Registration No.<span className="settings-readonly-field editable-field"><ShieldCheck size={18} /><input value={form.registration_number} onChange={(event) => setForm({ ...form, registration_number: event.target.value })} /></span></label>
          <label>Experience years<span className="settings-readonly-field editable-field"><FileText size={18} /><input type="number" min="0" value={form.experience_years} onChange={(event) => setForm({ ...form, experience_years: Number(event.target.value) })} /></span></label>
        </div>
        <AvailabilityEditor availability={form.availability} setAvailability={(availability) => setForm({ ...form, availability })} />
        <button className="primary-action"><Check size={18} /> Save changes</button>
      </form>
    </div>
  );
}
