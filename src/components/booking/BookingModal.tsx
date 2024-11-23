import { useState } from 'react';
import { X } from 'lucide-react';
import BookingCalendar from './BookingCalendar';
import BookingConfirmation from './BookingConfirmation';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number;
  doctorName: string;
  location: string;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  doctorId,
  doctorName,
  location 
}: BookingModalProps) {
  const { isAuthenticated } = useAuth();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState<{
    date: Date;
    time: string;
  } | null>(null);

  const handleBookingConfirm = async (date: Date, time: string) => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }));
      return;
    }

    try {
      setError('');
      const response = await api.post('/appointments', {
        doctorId,
        date: date.toISOString().split('T')[0],
        time,
        type: 'in-person'
      });

      if (response.data.id) {
        setAppointment({ date, time });
        setIsConfirmed(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du rendez-vous');
      console.error('Booking error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {!isConfirmed ? (
              <BookingCalendar
                doctorId={doctorId}
                doctorName={doctorName}
                onBookingConfirm={handleBookingConfirm}
              />
            ) : (
              <BookingConfirmation
                appointment={{
                  doctorName,
                  date: appointment!.date,
                  time: appointment!.time,
                  location
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}