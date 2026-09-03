import { Plus, X } from "lucide-react";
import { blankAvailability, dayNames } from "../lib/constants";

export default function AvailabilityEditor({ availability, setAvailability }) {
  function update(index, field, value) {
    setAvailability(availability.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  return (
    <div className="availability-editor">
      {availability.map((item, index) => (
        <div className="availability-row" key={index}>
          <label className="time-inline">Day
            <select value={item.day_of_week} onChange={(event) => update(index, "day_of_week", Number(event.target.value))}>
              {dayNames.map((day, dayIndex) => <option key={day} value={dayIndex}>{day}</option>)}
            </select>
          </label>
          <label className="time-inline">Start<input type="time" value={item.start_time} onChange={(event) => update(index, "start_time", event.target.value)} /></label>
          <label className="time-inline">End<input type="time" value={item.end_time} onChange={(event) => update(index, "end_time", event.target.value)} /></label>
          <button type="button" className="icon-button" title="Remove" onClick={() => setAvailability(availability.filter((_, i) => i !== index))}>
            <X size={16} />
          </button>
        </div>
      ))}
      <button type="button" className="ghost" onClick={() => setAvailability([...availability, { ...blankAvailability[0] }])}><Plus size={18} /> Add availability</button>
    </div>
  );
}
