import { Check, X } from "lucide-react";
import { useState } from "react";
import { api, apiError } from "../api";
import { blankAvailability } from "../lib/constants";
import AvailabilityEditor from "./AvailabilityEditor";

export default function DoctorEditModal({ profile, onClose, notify, onSaved }) {
  const [form, setForm] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    specialty: profile.specialty,
    availability: profile.availability.length ? profile.availability.map(({ day_of_week, start_time, end_time }) => ({
      day_of_week,
      start_time: start_time.slice(0, 5),
      end_time: end_time.slice(0, 5),
    })) : blankAvailability,
  });

  async function save(event) {
    event.preventDefault();
    try {
      const { data } = await api.put("/doctors/me/profile", form);
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
        <h2>Edit Doctor Profile</h2>
        <div className="two-col">
          <label>First name<input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required /></label>
          <label>Last name<input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required /></label>
        </div>
        <label>Specialty<input value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} required /></label>
        <AvailabilityEditor availability={form.availability} setAvailability={(availability) => setForm({ ...form, availability })} />
        <button className="primary-action"><Check size={18} /> Save changes</button>
      </form>
    </div>
  );
}
