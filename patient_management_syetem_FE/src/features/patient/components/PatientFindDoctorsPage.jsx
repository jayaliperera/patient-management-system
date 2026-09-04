import { Brain, CalendarDays, ChevronRight, HeartPulse, MapPin, Search, Stethoscope } from "lucide-react";
import { specialties } from "../../../lib/constants";
import { doctorImage } from "../../../lib/doctorAssets";
import { doctorMeta } from "../../../lib/doctorMeta";
import { formatDateOnly, formatWhen } from "../../../lib/date";
import AvailabilityPanel from "./AvailabilityPanel";
import PatientPageShell from "./PatientPageShell";

const specialtyIcons = {
  Cardiology: HeartPulse,
  Dermatology: Stethoscope,
  Neurology: Brain,
  Pediatrics: Stethoscope,
  "General Medicine": Stethoscope,
};

export default function PatientFindDoctorsPage({
  query,
  setQuery,
  specialty,
  setSpecialty,
  locationFilter,
  setLocationFilter,
  locations,
  sortMode,
  setSortMode,
  doctors,
  selected,
  setSelected,
  openProfile,
  date,
  setDate,
  slots,
  appointments,
  onBook,
}) {
  const nextAppointment = appointments[0];

  return (
    <PatientPageShell
      title="Find Doctors"
      subtitle="Search specialists and review availability."
      quote="Better Care Starts with the Right Doctor"
      icon={Stethoscope}
    >
      <section className="patient-panel patient-search-board">
        <div className="patient-search-grid">
          <span className="compact-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search doctor name or specialty..." /></span>
          <label className="icon-filter-control"><MapPin size={18} /><select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>{locations.map((location) => <option key={location} value={location}>{location === "All" ? "All Locations" : location}</option>)}</select></label>
          <label className="icon-filter-control"><CalendarDays size={18} /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label className="icon-filter-control"><Search size={18} /><select value={sortMode} onChange={(event) => setSortMode(event.target.value)}><option value="availability">Earliest availability</option><option value="rating">Highest rating</option><option value="fee-low">Fee low to high</option><option value="fee-high">Fee high to low</option></select></label>
        </div>
        <div className="patient-page-tabs category-tabs">
          {specialties.map((item) => {
            const Icon = specialtyIcons[item] || Search;
            return (
              <button key={item} type="button" className={specialty === item ? "active" : ""} onClick={() => setSpecialty(item)}>
                <Icon size={18} /> {item}
              </button>
            );
          })}
        </div>
      </section>

      <section className="patient-find-grid">
        <article className="patient-panel available-doctors-list">
          <div className="patient-list-head">
            <h2>Available Doctors</h2>
            <button type="button" className="ghost compact">Sort by Availability</button>
          </div>
          <div className="patient-doctor-list">
            {doctors.map((doctor) => {
              const meta = doctorMeta(doctor);
              return (
                <article key={doctor.id} className={selected?.id === doctor.id ? "selected" : ""}>
                  <img src={doctorImage(doctor)} alt="" />
                  <div>
                    <strong>Dr. {doctor.first_name} {doctor.last_name}</strong>
                    <span>Consultant {meta.specialty}</span>
                    <small><MapPin size={14} /> {meta.hospital}</small>
                    <div>
                      <em>{meta.specialty}</em>
                      <em>{meta.room}</em>
                    </div>
                  </div>
                  <aside>
                    <span>{meta.rating}</span>
                    <button type="button" className="ghost compact" onClick={() => openProfile(doctor)}>View Profile</button>
                    <button type="button" className="primary-action compact" onClick={() => setSelected(doctor)}><CalendarDays size={16} /> View Slots</button>
                  </aside>
                </article>
              );
            })}
            {!doctors.length && <div className="patient-empty-state compact-empty"><Search size={58} /><h2>No doctors found</h2><p>Try another search or specialty.</p></div>}
          </div>
        </article>

        <aside className="patient-find-side">
          <article className="patient-panel next-appointment-card">
            <h2><CalendarDays size={22} /> My Next Appointment</h2>
            {nextAppointment ? (
              <div>
                <strong>{formatDateOnly(nextAppointment.slot_time, { month: "short" })}<br /><span>{formatDateOnly(nextAppointment.slot_time, { day: "numeric" })}</span></strong>
                <p>{nextAppointment.doctor_name}<br /><small>{formatWhen(nextAppointment.slot_time)}</small></p>
              </div>
            ) : (
              <div>
                <strong>--<br /><span>--</span></strong>
                <p>No upcoming appointments<br /><small>Your upcoming appointments will appear here.</small></p>
              </div>
            )}
            <button type="button" className="ghost compact"><Search size={18} /> Browse Doctors</button>
          </article>
          <AvailabilityPanel selected={selected} date={date} setDate={setDate} slots={slots} onBook={onBook} />
          <aside className="records-security-strip">
            <span><ChevronRight size={24} /></span>
            <div>
              <strong>Your health data is secure</strong>
              <small>We keep your information safe with protected access.</small>
            </div>
          </aside>
        </aside>
      </section>
    </PatientPageShell>
  );
}
