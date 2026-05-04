type TimetableSlot = {
  open: string;
  close: string;
};

type Timetable = Record<string, TimetableSlot[] | undefined>;

interface RestaurantTimetableCardProps {
  timetable?: Timetable | null;
}

export default function RestaurantTimetableCard({ timetable }: RestaurantTimetableCardProps) {
  if (!timetable) return null;

  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  function isOpenNow(daySlots?: TimetableSlot[]) {
    if (!daySlots) return false;

    const now = new Date();
    const current = now.toTimeString().slice(0, 5);

    return daySlots.some((slot) => current >= slot.open && current <= slot.close);
  }

  const openNow = isOpenNow(timetable[today]);

  return (
    <div className="he-timetable-card">
      <div className="he-timetable-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="he-timetable-icon">🕒</span>
          <h3 className="he-timetable-title">Horario</h3>
        </div>

        <span className={`he-status ${openNow ? 'open' : 'closed'}`}>
          {openNow ? 'Abierto ahora' : 'Cerrado'}
        </span>
      </div>

      <div className="he-timetable-list">
        {daysOrder.map((day) => {
          const isToday = today === day;

          return (
            <div key={day} className={`he-timetable-row ${isToday ? 'active' : ''}`}>
              <span className="he-timetable-day">
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </span>

              <span className="he-timetable-hours">
                {timetable[day]
                  ? timetable[day]?.map((slot, index) => (
                      <span key={index}>
                        {slot.open} → {slot.close}
                        {index < (timetable[day]?.length ?? 0) - 1 && ' · '}
                      </span>
                    ))
                  : 'Cerrado'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}