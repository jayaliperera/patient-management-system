import { ArrowRight, Search } from "lucide-react";
import { specialties } from "../../../lib/constants";
import FeaturedDoctorCard from "./FeaturedDoctorCard";

export default function DoctorFinderPanel({
  query,
  setQuery,
  specialty,
  setSpecialty,
  locationFilter,
  setLocationFilter,
  locations,
  date,
  setDate,
  doctors,
  selected,
  setSelected,
  openProfile,
  onViewAll,
}) {
  return (
    <section className="patient-section find-doctor-section">
      <div className="section-head">
        <div>
          <h2>Find a Doctor</h2>
          <p>Search by name or specialty to find the right doctor for you.</p>
        </div>
        <button onClick={onViewAll}>View All Doctors <ArrowRight size={16} /></button>
      </div>
      <div className="doctor-filter-row">
        <div className="compact-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search doctor name or specialty..." />
        </div>
        <div className="finder-filter-controls">
          <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
            {locations.map((location) => <option key={location} value={location}>{location === "All" ? "All Locations" : location}</option>)}
          </select>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        <div className="chip-row">
          {specialties.map((item) => (
            <button key={item} className={`chip ${specialty === item ? "active" : ""}`} onClick={() => setSpecialty(item)}>{item}</button>
          ))}
        </div>
      </div>
      <div className="finder-grid">
        <FeaturedDoctorCard
          doctor={selected || doctors[0]}
          selected={Boolean(selected)}
          onSelect={() => selected && setSelected(selected)}
          onProfile={() => selected && openProfile(selected)}
        />
      </div>
    </section>
  );
}
