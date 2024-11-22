import { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked?: boolean;
  patientName?: string;
}

interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

const TIME_SLOTS: TimeSlot[] = [
  { startTime: '09:00', endTime: '10:00' },
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '12:00' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
  { startTime: '16:00', endTime: '17:00' }
];

export default function DoctorSchedule() {
  const { userId } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState<Date[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      const today = new Date();
      setCurrentMonth(today);
      generateWeekDays(today);
      loadSchedule();
    }
  }, [userId]);

  const generateWeekDays = (date: Date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay() + 1); // Start from Monday

    for (let i = 0; i < 7; i++) {
      week.push(new Date(start.setDate(start.getDate() + (i === 0 ? 0 : 1))));
    }
    setSelectedWeek(week);
  };

  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get doctor's availability and booked appointments
      const response = await api.get('/doctors/availability');
      const { availability, bookedSlots } = response.data;

      // Create schedule for selected week
      const newSchedule = selectedWeek.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const daySlots = TIME_SLOTS.map(slot => ({
          ...slot,
          isBooked: bookedSlots.some(
            (bookedSlot: any) => 
              bookedSlot.date === dateStr && 
              bookedSlot.time === slot.startTime
          ),
          patientName: bookedSlots.find(
            (bookedSlot: any) => 
              bookedSlot.date === dateStr && 
              bookedSlot.time === slot.startTime
          )?.patientName || undefined
        }));

        return {
          date: dateStr,
          slots: daySlots
        };
      });

      setSchedule(newSchedule);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du planning');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(selectedWeek[0]);
    newDate.setDate(newDate.getDate() - 7);
    generateWeekDays(newDate);
    loadSchedule();
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedWeek[0]);
    newDate.setDate(newDate.getDate() + 7);
    generateWeekDays(newDate);
    loadSchedule();
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'doctor-dashboard' }));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            <h2 className="text-2xl font-semibold">Planning des consultations</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-medium">
                {new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
                  .format(currentMonth)}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePreviousWeek}
                className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Semaine précédente
              </button>
              <button
                onClick={handleNextWeek}
                className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Semaine suivante
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="grid grid-cols-8 gap-4">
            {/* Time column */}
            <div className="pt-16">
              {TIME_SLOTS.map((slot, index) => (
                <div key={index} className="h-20 flex items-center justify-end pr-4 text-sm text-gray-500">
                  {slot.startTime}
                </div>
              ))}
            </div>

            {/* Days columns */}
            {selectedWeek.map((date, dayIndex) => (
              <div key={dayIndex} className="flex-1">
                <div className="h-16 flex flex-col items-center justify-center border-l">
                  <span className="text-sm font-medium">
                    {new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date)}
                  </span>
                  <span className="text-2xl font-semibold">
                    {date.getDate()}
                  </span>
                </div>
                {TIME_SLOTS.map((slot, slotIndex) => {
                  const scheduleDay = schedule.find(s => s.date === date.toISOString().split('T')[0]);
                  const scheduleSlot = scheduleDay?.slots[slotIndex];
                  
                  return (
                    <div
                      key={`${dayIndex}-${slotIndex}`}
                      className={`h-20 border-l border-t p-2 ${
                        scheduleSlot?.isBooked
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {scheduleSlot?.isBooked && (
                        <div className="h-full flex flex-col justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            Réservé
                          </span>
                          {scheduleSlot.patientName && (
                            <span className="text-xs text-gray-500">
                              {scheduleSlot.patientName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}