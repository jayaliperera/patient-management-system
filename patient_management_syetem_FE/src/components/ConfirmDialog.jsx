import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export default function ConfirmDialog({ title, message, confirmLabel, tone = "danger", onConfirm, onClose }) {
  const [saving, setSaving] = useState(false);

  async function confirm() {
    setSaving(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <article className="profile-modal compact-modal confirm-dialog" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}><X size={18} /></button>
        <span className={`confirm-dialog-icon ${tone}`}><AlertTriangle size={28} /></span>
        <div>
          <h2>{title}</h2>
          <p>{message}</p>
        </div>
        <footer>
          <button type="button" className="ghost" onClick={onClose} disabled={saving}>Keep Appointment</button>
          <button type="button" className={tone === "danger" ? "danger strong" : "primary-action"} onClick={confirm} disabled={saving}>
            {saving ? "Working..." : confirmLabel}
          </button>
        </footer>
      </article>
    </div>
  );
}
