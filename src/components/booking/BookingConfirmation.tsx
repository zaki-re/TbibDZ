import { Check, Calendar, Clock, User, MapPin } from 'lucide-react';

interface BookingConfirmationProps {
  appointment: {
    doctorName: string;
    date: Date;
    time: string;
    location: string;
  };
}

export default function BookingConfirmation({ appointment }: BookingConfirmationProps) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Rendez-vous Confirmé!</h2>
        <p className="text-gray-600 mt-2">
          Un email de confirmation a été envoyé à votre adresse
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <User className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Médecin</p>
            <p className="font-medium">{appointment.doctorName}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">
              {new Intl.DateTimeFormat('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }).format(appointment.date)}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Heure</p>
            <p className="font-medium">{appointment.time}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Adresse</p>
            <p className="font-medium">{appointment.location}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Ajouter au calendrier
        </button>
        <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors">
          Retour à l'accueil
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Besoin d'aide? <a href="#" className="text-blue-600 hover:text-blue-700">Contactez-nous</a></p>
      </div>
    </div>
  );
}