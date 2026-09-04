function pdfEscape(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function money(value) {
  return value || value === 0 ? `Rs. ${value}` : "Not specified";
}

function appointmentLines({ appointment, doctor, patientName, patientEmail }) {
  const when = new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(appointment.slot_time));

  return [
    ["Receipt No", `CS-${String(appointment.id).padStart(6, "0")}`],
    ["Appointment ID", appointment.id],
    ["Status", appointment.status],
    ["Booked Date & Time", when],
    ["Patient Name", patientName],
    ["Patient Email", patientEmail],
    ["Doctor", appointment.doctor_name],
    ["Specialty", doctor?.specialty || "Not specified"],
    ["Hospital", doctor?.hospital || "Not specified"],
    ["Room", doctor?.room_number || "Not specified"],
    ["Doctor Phone", doctor?.phone || "Not specified"],
    ["Consultation Fee", money(doctor?.consultation_fee)],
    ["Issued At", new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date())],
  ];
}

export function downloadAppointmentReceipt({ appointment, doctor, patientName, patientEmail }) {
  const lines = appointmentLines({ appointment, doctor, patientName, patientEmail });
  const content = [
    "BT",
    "/F1 22 Tf",
    "72 760 Td",
    "(CareSlot e-channeling center) Tj",
    "/F1 10 Tf",
    "0 -18 Td",
    "(Digital Appointment Receipt) Tj",
    "0 -8 Td",
    "(________________________________________________________________) Tj",
    "/F1 12 Tf",
    ...lines.flatMap(([label, value]) => [
      "0 -26 Td",
      `(${pdfEscape(label)}:) Tj`,
      "170 0 Td",
      `(${pdfEscape(value)}) Tj`,
      "-170 0 Td",
    ]),
    "0 -34 Td",
    "(Please bring this receipt and a valid patient ID to your appointment.) Tj",
    "0 -20 Td",
    "(This is a computer-generated receipt.) Tj",
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `CareSlot-Receipt-${appointment.id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
