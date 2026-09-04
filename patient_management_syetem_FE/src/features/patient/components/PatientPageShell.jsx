import { ChevronRight, Home } from "lucide-react";

export default function PatientPageShell({ title, subtitle, kicker, quote, quoteDetail, icon: Icon, children }) {
  return (
    <section className="patient-page">
      <section className="patient-page-hero">
        <div>
          <div className="patient-breadcrumb">
            <Home size={18} />
            <span>Home</span>
            <ChevronRight size={16} />
            <strong>{title}</strong>
          </div>
          {kicker && <span className="patient-page-kicker">{kicker}</span>}
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <aside>
          {Icon && <Icon size={88} />}
          <span>
            <blockquote>{quote}</blockquote>
            {quoteDetail && <small>{quoteDetail}</small>}
          </span>
        </aside>
      </section>
      {children}
    </section>
  );
}
