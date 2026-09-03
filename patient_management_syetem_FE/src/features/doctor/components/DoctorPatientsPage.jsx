import { useEffect, useMemo, useState } from "react";
import { Archive, CalendarDays, ChevronLeft, ChevronRight, Plus, Search, UserPlus, Users } from "lucide-react";
import { api, apiError } from "../../../api";
import { formatWhen } from "../../../lib/date";

export default function DoctorPatientsPage({ notify }) {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      const { data } = await api.get("/doctors/me/patients");
      setPatients(data);
    } catch (error) {
      notify(apiError(error));
    }
  }

  const filtered = useMemo(
    () => patients.filter((patient) => `${patient.patient_name} ${patient.email}`.toLowerCase().includes(query.toLowerCase())),
    [patients, query]
  );
  const activePatients = patients.filter((patient) => patient.next_visit).length;

  return (
    <section className="patients-page">
      <section className="patients-hero">
        <div>
          <span>Patients</span>
          <h1>Patients</h1>
          <p>View and manage your patients, their details, and consultation history.</p>
        </div>
        <aside>
          <Users size={118} />
          <strong>Build stronger<br />patient relationships<br />for a healthier tomorrow.</strong>
        </aside>
      </section>

      <section className="patient-metrics">
        <PatientMetric icon={Users} label="Total Patients" value={patients.length} text="Registered patients" tone="blue" />
        <PatientMetric icon={UserPlus} label="New Patients" value="0" text="This month" tone="green" />
        <PatientMetric icon={CalendarDays} label="Active Patients" value={activePatients} text="Had recent visits" tone="blue" />
        <PatientMetric icon={Archive} label="Inactive Patients" value={patients.length - activePatients} text="No recent activity" tone="red" />
      </section>

      <section className="doctor-panel patients-list-card">
        <div className="patients-list-head">
          <div>
            <h2><Users size={24} /> Patient List</h2>
            <p>Search, filter, and manage all your patients.</p>
          </div>
          <button type="button" className="primary-action" onClick={() => notify("Add patient is handled when a patient books an appointment.")}>
            <Plus size={18} /> Add Patient
          </button>
        </div>

        <div className="patients-filters">
          <div className="compact-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, phone, email or patient ID..." /></div>
          <select defaultValue="all"><option value="all">All Patients</option></select>
          <select defaultValue="all"><option value="all">All Genders</option></select>
          <select defaultValue="all"><option value="all">All Statuses</option></select>
          <select defaultValue="name"><option value="name">Sort by</option></select>
        </div>

        <div className="patients-table">
          <header>
            <span>#</span>
            <span>Patient Name</span>
            <span>Contact</span>
            <span>Date of Birth</span>
            <span>Gender</span>
            <span>Last Visit</span>
            <span>Status</span>
            <span>Actions</span>
          </header>
          {filtered.map((patient, index) => (
            <article key={patient.patient_id}>
              <span>{index + 1}</span>
              <strong>{patient.patient_name}</strong>
              <span>{patient.email}</span>
              <span>Not added</span>
              <span>Not added</span>
              <span>{patient.next_visit ? formatWhen(patient.next_visit) : "No upcoming visit"}</span>
              <span className={patient.next_visit ? "status booked" : "status cancelled"}>{patient.next_visit ? "ACTIVE" : "INACTIVE"}</span>
              <button type="button" className="doctor-soft-action inline" onClick={() => notify(`${patient.patient_name} has ${patient.total_visits} visit(s).`)}>
                View
              </button>
            </article>
          ))}
          {!filtered.length && (
            <div className="patients-empty-state">
              <Users size={78} />
              <h2>No patients found</h2>
              <p>Try adjusting your search or filter criteria, or add a new patient.</p>
              <button type="button" className="primary-action" onClick={() => notify("Add patient is handled when a patient books an appointment.")}>
                <Plus size={18} /> Add Patient
              </button>
            </div>
          )}
        </div>

        <footer className="appointment-pagination">
          <span>Showing {filtered.length} of {patients.length} patients</span>
          <div>
            <button type="button"><ChevronLeft size={18} /></button>
            <button type="button"><ChevronRight size={18} /></button>
          </div>
        </footer>
      </section>
    </section>
  );
}

function PatientMetric({ icon: Icon, label, value, text, tone }) {
  return (
    <article className={`patient-metric ${tone}`}>
      <span><Icon size={25} /></span>
      <div>
        <strong>{label}</strong>
        <b>{value}</b>
        <small>{text}</small>
      </div>
    </article>
  );
}
