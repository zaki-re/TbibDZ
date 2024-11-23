import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import { getDoctorAvailability, Availability, BookedSlot } from '../../services/doctors';

interface BookingCalendarProps {
  doctorId: string;
  doctorName: string;
  onBookingConfirm: (date: Date, time: string) => void;
}

export default function BookingCalendar({ doctorId, doctorName, onBookingConfirm }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAvailability();
  }, [doctorId]);

  const loadAvailability = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getDoctorAvailability(parseInt(doctorId));
      console.log('Availability response:', response); // Debug log
      setAvailability(response.availability);
      setBookedSlots(response.bookedSlots);
    } catch (err) {
      console.error('Error loading availability:', err);
      setError('Erreur lors du chargement des disponibilités');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeSlots = (date: Date) => {
    const now = new Date();
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    
    // Get available slots for the selected day
    const dayAvailability = availability.find(slot => slot.dayOfWeek === dayOfWeek);
    
    // Generate 30-minute slots within available periods
    const slots: { time: string; available: boolean }[] = [];

    if (!dayAvailability) {
      return [];
    }

    const [startHour, startMinute] = dayAvailability.startTime.split(':').map(Number);
    const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number);
    
    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMinute, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0);
    
    while (currentTime < endTime) {
      const timeStr = currentTime.toTimeString().slice(0, 5);
      const isBooked = bookedSlots.some(
        slot => slot.date === dateStr && slot.time === timeStr
      );

      // Check if the slot is in the past
      const slotDateTime = new Date(date);
      const [slotHour, slotMinute] = timeStr.split(':').map(Number);
      slotDateTime.setHours(slotHour, slotMinute, 0);
      const isPast = date.toDateString() === now.toDateString() && slotDateTime < now;

      slots.push({
        time: timeStr,
        available: !isBooked && !isPast
      });

      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    
    return slots;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      onBookingConfirm(selectedDate, selectedTime);
    }
  };

  const generateDateButtons = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) { // Show next 14 days
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Only include days that have availability
      const dayOfWeek = date.getDay();
      if (availability.some(slot => slot.dayOfWeek === dayOfWeek)) {
        dates.push(date);
      }
    }

    return dates;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    }).format(date);
  };

  const isDateSelected = (date: Date) => {
    return date.toDateString() === selectedDate?.toDateString();
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  const availableDates = generateDateButtons();
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Sélectionnez une date</h3>
        {availableDates.length === 0 ? (
          <p className="text-center text-gray-500">Aucune disponibilité dans les prochains jours</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {availableDates.map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                className={`p-3 rounded-lg text-center transition-colors ${
                  isDateSelected(date)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className="block text-sm">{formatDate(date)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Créneaux disponibles</h3>
          {timeSlots.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Aucun créneau disponible pour cette date
            </p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  disabled={!slot.available}
                  onClick={() => handleTimeSelect(slot.time)}
                  className={`
                    p-3 rounded-lg text-center transition-colors
                    ${slot.available 
                      ? selectedTime === slot.time
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <Clock className="w-4 h-4 mx-auto mb-1" />
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Récapitulatif</h4>
            <p className="text-sm text-gray-600">
              <CalendarIcon className="inline-block w-4 h-4 mr-2" />
              {formatDate(selectedDate)} à {selectedTime}
            </p>
            <p className="text-sm text-gray-600">
              <Check className="inline-block w-4 h-4 mr-2" />
              Dr. {doctorName}
            </p>
          </div>
          
          <button
            onClick={handleBooking}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirmer le rendez-vous
          </button>
        </div>
      )}
    </div>
  );
}