export function doctorImage(doctor) {
  return doctor?.id % 2 === 0 ? "/female-doctor.jpg" : "/male-doctor.jpg";
}
