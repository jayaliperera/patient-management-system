import { CalendarDays, CalendarPlus, Download, Grid2X2, Info, Pencil, Plus, Search, Trash2, XCircle } from "lucide-react";
import { formatWhen } from "../../../lib/date";
import PatientPageShell from "./PatientPageShell";

export default function PatientAppointmentsPage({ tab, setTab, appointments, history, onCancel, onDelete, onReschedule, onDownloadReceipt, onFindDoctors }) {
  const items = tab === "upcoming" ? appointments : history;

  return (
    <PatientPageShell
      title="My Appointments"
      subtitle="Track your upcoming visits and view your past consultations."
      quote="Your Health Schedule, Simplified."
      icon={CalendarPlus}
    >
      <section className="patient-panel patient-appointments-page-card">
        <div className="patient-tabs-toolbar">
          <nav className="patient-page-tabs compact-tabs">
            <button type="button" className={tab === "upcoming" ? "active" : ""} onClick={() => setTab("upcoming")}><CalendarDays size={19} /> Upcoming <span>{appointments.length}</span></button>
            <button type="button" className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}><CalendarDays size={19} /> History <span>{history.length}</span></button>
          </nav>
          <button type="button" className="primary-action compact" onClick={onFindDoctors}><Plus size={18} /> Book New Appointment</button>
        </div>

        {items.length ? (
          <div className="patient-full-list">
            {items.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.doctor_name}</strong>
                  <span>{formatWhen(item.slot_time)}</span>
                </div>
                <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
                <div className="appointment-actions">
                  <button type="button" className="ghost compact" onClick={() => onDownloadReceipt(item)}><Download size={16} /> Receipt</button>
                  {item.status === "BOOKED" && (
                    <>
                      <button type="button" className="ghost compact" onClick={() => onReschedule(item)}><Pencil size={16} /> Reschedule</button>
                      <button type="button" className="danger compact" onClick={() => onCancel(item)}><XCircle size={16} /> Cancel</button>
                    </>
                  )}
                  <button type="button" className="danger compact strong" onClick={() => onDelete(item)}><Trash2 size={16} /> Delete</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="patient-empty-state">
            <CalendarPlus size={82} />
            <h2>No {tab === "upcoming" ? "upcoming appointments" : "appointment history"} yet</h2>
            <p>You have not booked any appointments yet. Find a doctor and book your first appointment to get started.</p>
            <div>
              <button type="button" className="primary-action" onClick={onFindDoctors}><Search size={18} /> Find Doctors</button>
              <button type="button" className="ghost" onClick={onFindDoctors}><Grid2X2 size={18} /> Explore Specialties</button>
            </div>
          </div>
        )}
      </section>

      <aside className="records-security-strip">
        <span><Info size={24} /></span>
        <div>
          <strong>Need to reschedule or cancel?</strong>
          <small>You can manage your appointments from the history tab or contact our support team.</small>
        </div>
      </aside>
    </PatientPageShell>
  );
}
