const generateTimeSlots = () => {
  const slots = [];
  const startHour = 8;
  const endHour = 17;
  
  for (let hour = startHour; hour < endHour; hour++) {
    // Saltar horario de almuerzo (1pm a 2pm)
    if (hour === 13) continue;
    
    for (let minute = 0; minute < 60; minute += 30) {
      // Formatear la hora a HH:MM
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  
  return slots;
};

// Validar si un horario está dentro del rango permitido
const isValidTimeSlot = (time) => {
  const slots = generateTimeSlots();
  return slots.includes(time);
};

// Obtener el próximo horario disponible
const getNextAvailableSlot = (bookedSlots) => {
  const allSlots = generateTimeSlots();
  return allSlots.find(slot => !bookedSlots.includes(slot));
};

module.exports = {
  generateTimeSlots,
  isValidTimeSlot,
  getNextAvailableSlot
};