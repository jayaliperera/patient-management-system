import { useEffect, useState } from "react";
import { CalendarCheck, CheckCircle, Search } from "lucide-react";
import { api, apiError } from "../../../api";
import { formatWhen } from "../../../lib/date";

export default function DoctorAppointmentsPage({ notify, onStatsChanged }) {
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, [status]);

  async function loadAppointments() {
    try {
      const params = status === "ALL" ? {} : { status };
      const { data } = await api.get("/doctors/me/appointments", { params });
      setAppointments(data);
    } catch (error) {
      notify(apiError(error));
    }
  }

  async function complete(id) {
    try {
      await api.patch(`/doctors/me/appointments/${id}/complete`);
      notify("Appointment marked completed.");
      await loadAppointments();
      onStatsChanged();
    } catch (error) {
      notify(apiError(error));
    }
  }

  const filtered = appointments.filter((item) => item.patient_name.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="doctor-panel doctor-list-page">
      <div className="doctor-section-title">
        <h2><CalendarCheck size={22} /> Appointments</h2>
      </div>
      <div className="doctor-list-toolbar">
        <div className="compact-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient..." /></div>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="BOOKED">Booked</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div className="doctor-table">
        {filtered.map((item) => (
          <article key={item.id}>
            <div><strong>{item.patient_name}</strong><span>{formatWhen(item.slot_time)}</span></div>
            <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
            <button className="doctor-soft-action inline" disabled={item.status !== "BOOKED"} onClick={() => complete(item.id)}>
              <CheckCircle size={16} /> Complete
            </button>
          </article>
        ))}
        {!filtered.length && <p className="empty">No appointments found.</p>}
      </div>
    </section>
  );
}
