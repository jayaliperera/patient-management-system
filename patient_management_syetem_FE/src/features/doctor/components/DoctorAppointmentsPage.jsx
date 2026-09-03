import { useEffect, useState } from "react";
import { CalendarCheck, CheckCircle, ChevronLeft, ChevronRight, Clock, Search, XCircle } from "lucide-react";
import { api, apiError } from "../../../api";
import { formatWhen } from "../../../lib/date";

export default function DoctorAppointmentsPage({ notify, onStatsChanged, onNavigate }) {
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
  const today = new Date().toISOString().slice(0, 10);
  const counts = {
    today: appointments.filter((item) => item.slot_time.slice(0, 10) === today).length,
    upcoming: appointments.filter((item) => item.status === "BOOKED").length,
    completed: appointments.filter((item) => item.status === "COMPLETED").length,
    cancelled: appointments.filter((item) => item.status === "CANCELLED").length,
  };

  return (
    <section className="appointments-page">
      <div className="appointments-heading">
        <div>
          <span>Appointments</span>
          <h1>Appointments</h1>
          <p>View and manage your patient appointments, track consultation status, and stay organized.</p>
        </div>
        <button type="button" className="primary-action" onClick={() => onNavigate("schedule")}><CalendarCheck size={18} /> View Schedule</button>
      </div>

      <section className="appointment-metrics">
        <Metric icon={CalendarCheck} label="Today" value={counts.today} text="Appointments today" tone="blue" />
        <Metric icon={Clock} label="Upcoming" value={counts.upcoming} text="Scheduled appointments" tone="blue" />
        <Metric icon={CheckCircle} label="Completed" value={counts.completed} text="Finished consultations" tone="green" />
        <Metric icon={XCircle} label="Cancelled" value={counts.cancelled} text="Cancelled appointments" tone="red" />
      </section>

      <section className="doctor-panel appointment-list-card">
        <div className="appointment-list-head">
          <div>
            <h2><CalendarCheck size={24} /> Appointment List</h2>
            <p>Search, filter and view all your appointments.</p>
          </div>
          <div className="appointment-filters">
            <div className="compact-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient name..." /></div>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="BOOKED">Booked</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select defaultValue="">
              <option value="">Select date range</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
        </div>

        <div className="appointment-table">
          <header>
            <span>#</span>
            <span>Patient Name</span>
            <span>Date & Time</span>
            <span>Type</span>
            <span>Status</span>
            <span>Actions</span>
          </header>
          {filtered.map((item, index) => (
            <article key={item.id}>
              <span>{index + 1}</span>
              <strong>{item.patient_name}</strong>
              <span>{formatWhen(item.slot_time)}</span>
              <span>Consultation</span>
              <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
              <button className="doctor-soft-action inline" disabled={item.status !== "BOOKED"} onClick={() => complete(item.id)}>
                <CheckCircle size={16} /> Complete
              </button>
            </article>
          ))}
          {!filtered.length && (
            <div className="appointment-empty-state">
              <CalendarCheck size={72} />
              <h2>No appointments found</h2>
              <p>There are no appointments matching your search or filter criteria.</p>
              <button type="button" className="primary-action" onClick={() => onNavigate("schedule")}><CalendarCheck size={18} /> View Schedule</button>
            </div>
          )}
        </div>

        <footer className="appointment-pagination">
          <span>Showing {filtered.length} of {appointments.length} appointments</span>
          <div>
            <button type="button"><ChevronLeft size={18} /></button>
            <button type="button"><ChevronRight size={18} /></button>
          </div>
        </footer>
      </section>
    </section>
  );
}

function Metric({ icon: Icon, label, value, text, tone }) {
  return (
    <article className={`appointment-metric ${tone}`}>
      <span><Icon size={25} /></span>
      <div>
        <strong>{label}</strong>
        <b>{value}</b>
        <small>{text}</small>
      </div>
    </article>
  );
}
