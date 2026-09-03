import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, FileImage, FileText, FlaskConical, NotebookPen, Pill, Plus, Search, ShieldCheck } from "lucide-react";
import { api, apiError } from "../../../api";
import { formatWhen } from "../../../lib/date";

const recordTabs = [
  { key: "all", label: "All Records", icon: FileText },
  { key: "notes", label: "Consultation Notes", icon: NotebookPen },
  { key: "labs", label: "Lab Results", icon: FlaskConical },
  { key: "prescriptions", label: "Prescriptions", icon: Pill },
  { key: "imaging", label: "Imaging Reports", icon: FileImage },
  { key: "other", label: "Other Documents", icon: FileText },
];

export default function DoctorRecordsPage({ notify }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [patient, setPatient] = useState("all");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const { data } = await api.get("/doctors/me/records");
      setRecords(data);
    } catch (error) {
      notify(apiError(error));
    }
  }

  const patients = [...new Set(records.map((record) => record.patient_name))];
  const filtered = records.filter((record) => {
    const searchMatch = `${record.patient_name} ${record.summary}`.toLowerCase().includes(query.toLowerCase());
    const patientMatch = patient === "all" || record.patient_name === patient;
    return searchMatch && patientMatch;
  });
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <section className="records-page">
      <section className="records-hero">
        <div>
          <span><CalendarDays size={18} /> {today}</span>
          <h1>Medical Records</h1>
          <p>Review consultation notes, test results and visit history.</p>
        </div>
        <aside>
          <FileText size={92} />
          <strong>Access patient<br />history, consultation<br />notes and reports<br />in one place.</strong>
        </aside>
      </section>

      <nav className="records-tabs">
        {recordTabs.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
            <Icon size={19} /> {label}
          </button>
        ))}
      </nav>

      <section className="doctor-panel records-list-card">
        <div className="records-filters">
          <div className="compact-search"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by patient name, ID, or record type..." /></div>
          <select value={patient} onChange={(event) => setPatient(event.target.value)}>
            <option value="all">All Patients</option>
            {patients.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <select value={tab} onChange={(event) => setTab(event.target.value)}>
            {recordTabs.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select defaultValue="">
            <option value="">Select date range</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
        </div>

        <div className="records-results">
          {filtered.map((record) => (
            <article key={record.appointment_id}>
              <span className={`status ${record.status.toLowerCase()}`}>{record.status}</span>
              <strong>{record.patient_name}</strong>
              <small>{formatWhen(record.slot_time)}</small>
              <p>{record.summary}</p>
            </article>
          ))}
          {!filtered.length && (
            <div className="records-empty-state">
              <FileText size={78} />
              <h2>No medical records found</h2>
              <p>Try adjusting your search or filter criteria, or start adding patient records when consultations are completed.</p>
              <button type="button" className="primary-action" onClick={() => notify("New record creation can be connected after consultation note storage is added.")}>
                <Plus size={18} /> Add New Record
              </button>
            </div>
          )}
        </div>

        <footer className="records-security-strip">
          <span><ShieldCheck size={24} /></span>
          <div>
            <strong>Patient data is secure</strong>
            <small>All medical records are encrypted and stored securely in compliance with healthcare data protection standards.</small>
          </div>
          <button type="button" onClick={() => notify("Security details are available in Account & Security settings.")}>Learn more <ChevronRight size={18} /></button>
        </footer>
      </section>
    </section>
  );
}
