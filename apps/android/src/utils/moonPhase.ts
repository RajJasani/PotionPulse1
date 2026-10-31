/**
 * Real-world Moon Phase calculator for Madam Hexley's Mobile App
 */
export const getMobileMoonPhase = () => {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const diffDays = (Date.now() - knownNewMoon) / (1000 * 60 * 60 * 24);
  const synodicMonth = 29.53058867;
  const age = (diffDays % synodicMonth + synodicMonth) % synodicMonth;
  const illumination = Math.round(((1 - Math.cos((age / synodicMonth) * 2 * Math.PI)) / 2) * 100);

  let phase = 'New Moon';
  if (age < 1.84) phase = 'New Moon';
  else if (age < 5.53) phase = 'Waxing Crescent';
  else if (age < 9.22) phase = 'First Quarter';
  else if (age < 12.91) phase = 'Waxing Gibbous';
  else if (age < 16.61) phase = 'Full Moon';
  else if (age < 20.30) phase = 'Waning Gibbous';
  else if (age < 23.99) phase = 'Last Quarter';
  else if (age < 27.68) phase = 'Waning Crescent';

  return {
    phase,
    illumination,
    isSurgeActive: phase === 'Full Moon' || age >= 13.0,
  };
};
