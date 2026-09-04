import { useState } from "react";
import { Bell, Search, UserRound } from "lucide-react";
import { doctorImage } from "../../../lib/doctorAssets";
import { doctorMeta } from "../../../lib/doctorMeta";

export default function DoctorHeader({ session, profile, setActiveView }) {
  const [query, setQuery] = useState("");
  const meta = doctorMeta(profile);

  function submitSearch(event) {
    event.preventDefault();
    if (query.trim()) setActiveView("patients");
  }

  return (
    <header className="doctor-header">
      <form className="doctor-app-search" onSubmit={submitSearch}>
        <Search size={21} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search patients, appointments, or anything..."
        />
      </form>

      <div className="doctor-appbar-actions">
        <button className="notification-button" title="Open appointments" onClick={() => setActiveView("appointments")}>
          <Bell size={21} />
          <i></i>
        </button>
        <button className="doctor-profile-chip" type="button" onClick={() => setActiveView("profile")}>
          <img src={doctorImage(profile)} alt="" />
          <span>
            <strong>{session.user.name}</strong>
            <small>{meta.specialty}</small>
          </span>
          <UserRound size={18} />
        </button>
      </div>
    </header>
  );
}
