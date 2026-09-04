import { useRef } from "react";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Clock, Plus, Users } from "lucide-react";
import { addMonthsIso, formatDateOnly, formatTime, isoDateToDisplayDate, isoMonthDays } from "../../../lib/date";

const hours = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DoctorSchedulePanel({ view, setView, date, setDate, grouped, onStepDate, fullPage = false, onAddAvailability, notify }) {
  const datePickerRef = useRef(null);
  const groups = Object.entries(grouped);
  const selectedDate = isoDateToDisplayDate(date);
  const dayItems = grouped[date] || [];
  const monthDays = isoMonthDays(date);
  const monthTitle = formatDateOnly(selectedDate, { month: "long", year: "numeric" });
  const controlDateTitle = formatDateOnly(selectedDate, { month: "long", day: "2-digit", year: "numeric" });
  const dateTitle = formatDateOnly(selectedDate, { weekday: "long", month: "long", day: "2-digit", year: "numeric" });
  const appointmentCount = groups.reduce((total, [, items]) => total + items.length, 0);
  const uniquePatients = new Set(groups.flatMap(([, items]) => items.map((item) => item.patient_id))).size;

  function handleView(nextView) {
    setView(nextView);
  }

  function addAvailability() {
    if (onAddAvailability) onAddAvailability();
  }

  function openDatePicker() {
    if (datePickerRef.current?.showPicker) datePickerRef.current.showPicker();
    else datePickerRef.current?.focus();
  }

  function stepMonth(direction) {
    setDate(addMonthsIso(date, direction));
  }

  return (
    <section className={`doctor-schedule-view ${fullPage ? "full" : "compact"}`}>
      {fullPage && (
        <div className="schedule-page-heading">
          <div>
            <h1><CalendarDays size={36} /> My Schedule</h1>
            <p>Review availability and manage your booked time slots.</p>
          </div>
          <aside>
            <CalendarPlus size={34} />
            <div>
              <strong>Keep your schedule up to date</strong>
              <span>Help more patients get the care they need.</span>
            </div>
            <button type="button" className="primary-action" onClick={addAvailability}><Plus size={18} /> Add Availability</button>
          </aside>
        </div>
      )}

      <div className="doctor-panel doctor-schedule-card">
        {!fullPage && (
          <div className="doctor-section-title">
            <h2><CalendarDays size={22} /> Schedule & Availability</h2>
          </div>
        )}
        <div className="doctor-schedule-toolbar">
          <div className="doctor-date-control schedule-date-control">
            <button type="button" onClick={() => onStepDate(-1)}><ChevronLeft size={19} /></button>
            <CalendarDays size={18} />
            <button type="button" className="schedule-date-display" onClick={openDatePicker}>{controlDateTitle}</button>
            <button type="button" className="schedule-picker-button" onClick={openDatePicker}><CalendarDays size={18} /></button>
            <input ref={datePickerRef} className="schedule-hidden-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            <button type="button" onClick={() => onStepDate(1)}><ChevronRight size={19} /></button>
          </div>
          <div className="schedule-view-tabs">
            <button className={view === "day" ? "active" : ""} onClick={() => handleView("day")}><CalendarDays size={18} /> Day</button>
            <button className={view === "week" ? "active" : ""} onClick={() => handleView("week")}><CalendarDays size={18} /> Week</button>
            <button className={view === "month" ? "active" : ""} onClick={() => handleView("month")}><CalendarDays size={18} /> Month</button>
          </div>
        </div>
      </div>

      <div className={fullPage ? "doctor-schedule-layout" : "doctor-schedule-list"}>
        {fullPage && (
          <aside className="schedule-calendar-panel doctor-panel">
            <div className="schedule-calendar-title">
              <h2>{monthTitle}</h2>
              <span>
                <button type="button" onClick={() => stepMonth(-1)}><ChevronLeft size={18} /></button>
                <button type="button" onClick={() => stepMonth(1)}><ChevronRight size={18} /></button>
              </span>
            </div>
            <div className="mini-calendar">
              {weekdayLabels.map((label) => <strong key={label}>{label}</strong>)}
              {monthDays.map((day) => (
                <button
                  key={day.iso}
                  type="button"
                  className={`${day.inMonth ? "" : "muted"} ${day.iso === date ? "selected" : ""} ${(grouped[day.iso] || []).length ? "has-booking" : ""}`}
                  onClick={() => setDate(day.iso)}
                >
                  {day.number}
                </button>
              ))}
            </div>
            <div className="calendar-legend">
              <span><i className="confirmed"></i>Confirmed</span>
              <span><i className="pending"></i>Pending</span>
              <span><i className="cancelled"></i>Cancelled</span>
              <span><i className="blocked"></i>Not available</span>
            </div>
            <div className="today-summary">
              <div className="doctor-section-title">
                <h2>Today's Summary</h2>
                <ChevronRight size={20} />
              </div>
              <section>
                <article><CalendarDays size={22} /><strong>{appointmentCount}</strong><span>Appointments</span></article>
                <article><Clock size={22} /><strong>{appointmentCount ? `${appointmentCount / 2}h` : "0h"}</strong><span>Consultation time</span></article>
                <article><Users size={22} /><strong>{uniquePatients}</strong><span>Patients</span></article>
              </section>
            </div>
          </aside>
        )}

        <section className="schedule-timeline-panel doctor-panel">
          <div className="schedule-timeline-head">
            <h2><CalendarDays size={24} /> {view === "month" ? monthTitle : dateTitle}</h2>
            <button type="button" className="ghost" onClick={() => notify?.("Block time controls are ready for availability rules.")}><Clock size={18} /> Block Time</button>
          </div>
          <div className="schedule-timeline">
            {hours.map((hour) => <div key={hour}><span>{hour}</span><i></i></div>)}
            {dayItems.map((item) => (
              <article key={item.id} className="schedule-event">
                <strong>{item.patient_name}</strong>
                <span>{formatTime(item.slot_time)} - {item.status}</span>
              </article>
            ))}
            {!dayItems.length && (
              <div className="doctor-empty-state schedule-empty-state">
                <CalendarPlus size={64} />
                <strong>No booked appointments for this {view === "day" ? "day" : "view"}.</strong>
                <span>Once patients book appointments, they will appear here.</span>
                <button type="button" className="primary-action" onClick={addAvailability}><Plus size={18} /> Add Availability</button>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
