export default function AppLogo({ className = "" }) {
  return (
    <div className={`app-logo ${className}`.trim()} aria-label="CareSlot Patient Management">
      <span>
        <img src="/care-slot-mark.png" alt="" />
      </span>
      <div>
        <strong>Care<span>Slot</span></strong>
        <small>e-channeling center</small>
      </div>
    </div>
  );
}
