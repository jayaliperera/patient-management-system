import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Search, Users } from "lucide-react";
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

  return (
    <section className="doctor-panel doctor-list-page">
      <div className="doctor-section-title">
        <h2><Users size={22} /> Patients</h2>
      </div>
      <div className="compact-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patients..." /></div>
      <div className="doctor-patient-grid">
        {filtered.map((patient) => (
          <article key={patient.patient_id}>
            <strong>{patient.patient_name}</strong>
            <span><Mail size={15} /> {patient.email}</span>
            <span><Phone size={15} /> {patient.phone || "No phone added"}</span>
            <div>
              <small>Total visits</small><b>{patient.total_visits}</b>
            </div>
            <p>Next: {patient.next_visit ? formatWhen(patient.next_visit) : "No upcoming visit"}</p>
          </article>
        ))}
        {!filtered.length && <p className="empty">No patients found.</p>}
      </div>
    </section>
  );
}
