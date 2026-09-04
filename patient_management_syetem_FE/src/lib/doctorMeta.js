export function doctorMeta(doctor) {
  const specialty = doctor?.specialty && /[a-z]/i.test(doctor.specialty) ? doctor.specialty : "Not set";

  return {
    specialty,
    fee: doctor?.consultation_fee ?? null,
    hospital: doctor?.hospital || "Not set",
    rating: Number(doctor?.rating || 0).toFixed(1),
    experience: doctor?.experience_years ?? 0,
    room: doctor?.room_number || "Not set",
    phone: doctor?.phone || "Not set",
    registration: doctor?.registration_number || "Not set",
    bio: doctor?.bio || "",
  };
}
