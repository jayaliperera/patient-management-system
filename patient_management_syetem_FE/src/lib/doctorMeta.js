export function doctorMeta(doctor) {
  const seed = doctor?.id || 1;
  return {
    fee: 1800 + (seed % 5) * 350,
    hospital: ["Nawaloka Care", "Asiri Central", "Lanka Hospitals", "Hemas Clinic", "MediPlus Center"][seed % 5],
    rating: (4.5 + (seed % 4) / 10).toFixed(1),
    experience: 6 + (seed % 16),
    room: `Room ${120 + seed}`,
  };
}
