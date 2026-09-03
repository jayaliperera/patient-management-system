import { ArrowRight, HeartPulse, Search } from "lucide-react";

export default function PatientHero({ firstName, onFindDoctors }) {
  return (
    <section className="patient-hero-card">
      <div className="patient-hero-copy">
        <span><HeartPulse size={18} /> Patient Channeling</span>
        <h1>Hello, {firstName}!</h1>
        <p>Choose a specialist, review their profile, and secure a clean 30-minute appointment slot.</p>
        <button className="primary-action" onClick={onFindDoctors}><Search size={18} /> Find a Doctor <ArrowRight size={18} /></button>
      </div>
      <div className="patient-hero-art">
        <img src="/home-image.jpg" alt="Doctor consultation" />
        <strong>Better Care<br />Brighter Tomorrows</strong>
        <em>Your<br />Health<br />Matters</em>
      </div>
    </section>
  );
}
