import { Check, LogOut } from "lucide-react";
import { useState } from "react";
import { api, apiError } from "../../../api";
import AvailabilityEditor from "../../../components/AvailabilityEditor";
import { blankAvailability } from "../../../lib/constants";

export default function DoctorSettingsPage({ profile, notify, onSaved, onLogout }) {
  const [form, setForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    specialty: profile?.specialty || "",
    availability: profile?.availability?.length ? profile.availability.map(({ day_of_week, start_time, end_time }) => ({
      day_of_week,
      start_time: start_time.slice(0, 5),
      end_time: end_time.slice(0, 5),
    })) : blankAvailability,
  });

  async function save(event) {
    event.preventDefault();
    try {
      const { data } = await api.put("/doctors/me/profile", form);
      notify("Settings saved.");
      onSaved(data);
    } catch (error) {
      notify(apiError(error));
    }
  }

  return (
    <form className="doctor-panel doctor-settings-page" onSubmit={save}>
      <div className="doctor-section-title">
        <h2>Settings</h2>
      </div>
      <div className="two-col">
        <label>First name<input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required /></label>
        <label>Last name<input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required /></label>
      </div>
      <label>Specialty<input value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} required /></label>
      <AvailabilityEditor availability={form.availability} setAvailability={(availability) => setForm({ ...form, availability })} />
      <div className="settings-actions">
        <button className="primary-action"><Check size={18} /> Save Settings</button>
        <button type="button" className="ghost logout-action" onClick={onLogout}><LogOut size={18} /> Logout</button>
      </div>
    </form>
  );
}
