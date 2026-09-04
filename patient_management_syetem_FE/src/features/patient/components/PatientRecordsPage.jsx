import { Activity, Beaker, FilePlus2, FileText, Filter, NotebookText, Pill, Plus, Search, ShieldCheck, Stethoscope } from "lucide-react";
import PatientPageShell from "./PatientPageShell";

const tabs = [
  { label: "Overview", icon: FileText },
  { label: "Prescription Uploads", icon: Pill },
  { label: "Lab Reports", icon: Beaker },
  { label: "Doctor Visit Notes", icon: NotebookText },
  { label: "Health Summary", icon: Activity },
];

export default function PatientRecordsPage({ onFindDoctors, notify }) {
  return (
    <PatientPageShell
      title="Medical Records"
      subtitle="Keep your health information organized and easily accessible."
      quote="Your Health Story in One Place"
      icon={FilePlus2}
    >
      <section className="patient-panel patient-tabs-toolbar">
        <nav className="patient-page-tabs">
          {tabs.map(({ label, icon: Icon }, index) => (
            <button key={label} type="button" className={index === 0 ? "active" : ""}><Icon size={19} /> {label}</button>
          ))}
        </nav>
        <button type="button" className="primary-action compact" onClick={() => notify("Upload record is ready for backend file storage setup.")}><Plus size={18} /> Upload Record</button>
      </section>

      <section className="patient-metrics">
        <article><FileText size={26} /><strong>0</strong><span>Total Records</span></article>
        <article><Pill size={26} /><strong>0</strong><span>Prescriptions</span></article>
        <article><Beaker size={26} /><strong>0</strong><span>Lab Reports</span></article>
        <article><Stethoscope size={26} /><strong>0</strong><span>Doctor Notes</span></article>
      </section>

      <section className="patient-panel patient-empty-page">
        <div className="patient-list-head">
          <div>
            <h2><Activity size={22} /> Recent Medical Records</h2>
            <p>Your latest uploads and visit summaries.</p>
          </div>
          <div className="patient-inline-filters">
            <span className="compact-search"><Search size={18} /><input placeholder="Search records..." /></span>
            <button type="button" className="ghost compact"><Filter size={18} /> All Types</button>
          </div>
        </div>
        <div className="patient-empty-state">
          <FilePlus2 size={72} />
          <h2>No medical records yet</h2>
          <p>Upload your prescriptions, lab reports, or view your past visit summaries to keep everything in one place.</p>
          <div>
            <button type="button" className="primary-action" onClick={() => notify("Upload record is ready for backend file storage setup.")}><Plus size={18} /> Upload a Record</button>
            <button type="button" className="ghost" onClick={onFindDoctors}><Search size={18} /> Find Doctors</button>
          </div>
        </div>
      </section>

      <aside className="records-security-strip">
        <span><ShieldCheck size={24} /></span>
        <div>
          <strong>Your health data is secure</strong>
          <small>We follow industry best practices to keep your information safe.</small>
        </div>
      </aside>
    </PatientPageShell>
  );
}
