import { X } from "lucide-react";
import { blankAvailability, dayNames } from "../lib/constants";

export default function AvailabilityEditor({ availability, setAvailability }) {
  function update(index, field, value) {
    setAvailability(availability.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  return (
    <div className="availability-editor">
      {availability.map((item, index) => (
        <div className="availability-row" key={index}>
          <select value={item.day_of_week} onChange={(event) => update(index, "day_of_week", Number(event.target.value))}>
            {dayNames.map((day, dayIndex) => <option key={day} value={dayIndex}>{day}</option>)}
          </select>
          <input type="time" value={item.start_time} onChange={(event) => update(index, "start_time", event.target.value)} />
          <input type="time" value={item.end_time} onChange={(event) => update(index, "end_time", event.target.value)} />
          <button type="button" className="icon-button" title="Remove" onClick={() => setAvailability(availability.filter((_, i) => i !== index))}>
            <X size={16} />
          </button>
        </div>
      ))}
      <button type="button" className="ghost" onClick={() => setAvailability([...availability, { ...blankAvailability[0] }])}>Add availability</button>
    </div>
  );
}
