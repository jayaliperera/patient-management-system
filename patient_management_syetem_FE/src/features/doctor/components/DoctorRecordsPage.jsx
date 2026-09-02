import { useEffect, useState } from "react";
import { FileText, Search } from "lucide-react";
import { api, apiError } from "../../../api";
import { formatWhen } from "../../../lib/date";

export default function DoctorRecordsPage({ notify }) {
  const [query, setQuery] = useState("");
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

  const filtered = records.filter((record) => `${record.patient_name} ${record.summary}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="doctor-panel doctor-list-page">
      <div className="doctor-section-title">
        <h2><FileText size={22} /> Medical Records</h2>
      </div>
      <div className="compact-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records..." /></div>
      <div className="record-timeline">
        {filtered.map((record) => (
          <article key={record.appointment_id}>
            <span className={`status ${record.status.toLowerCase()}`}>{record.status}</span>
            <strong>{record.patient_name}</strong>
            <small>{formatWhen(record.slot_time)}</small>
            <p>{record.summary}</p>
          </article>
        ))}
        {!filtered.length && <p className="empty">No medical records found.</p>}
      </div>
    </section>
  );
}
