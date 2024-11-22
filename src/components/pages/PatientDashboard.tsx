import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Settings, Video, FileText, MapPin } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type TabType = 'appointments' | 'medical-records' | 'doctors' | 'settings';

interface Appointment {
  id: number;
  doctorFirstName: string;
  doctorLastName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'in-person' | 'video';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  consultationFee: number;
  doctorPhone: string;
}

interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { userId } = useAuth();

  useEffect(() => {
    loadPatientData();
  }, [userId]);

  const loadPatientData = async () => {
    try {
      const response = await api.get('/patients/profile');
      const { profile, upcomingAppointments, pastAppointments } = response.data;
      
      setProfile(profile);
      setUpcomingAppointments(upcomingAppointments);
      setPastAppointments(pastAppointments);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Error loading patient data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: 'cancelled' });
      await loadPatientData(); // Reload data after cancellation
      setError('');
    } catch (err) {
      setError('Erreur lors de l\'annulation du rendez-vous');
      console.error('Error cancelling appointment:', err);
    }
  };

  const handleFindDoctor = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'find-doctor' }));
  };

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Mes Rendez-vous</h3>
        <button 
          onClick={handleFindDoctor}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nouveau Rendez-vous
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {upcomingAppointments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Aucun rendez-vous à venir</p>
          <button
            onClick={handleFindDoctor}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Prendre un rendez-vous
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Rendez-vous à venir</h4>
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    {appointment.type === 'video' ? (
                      <Video className="w-6 h-6 text-blue-600" />
                    ) : (
                      <User className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      Dr. {appointment.doctorFirstName} {appointment.doctorLastName}
                    </h4>
                    <p className="text-sm text-gray-600">{appointment.specialty}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {appointment.doctorPhone}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status === 'confirmed' ? 'Confirmé' :
                     appointment.status === 'pending' ? 'En attente' : 'Annulé'}
                  </span>
                  <span className="text-sm font-medium">
                    {appointment.consultationFee} DZD
                  </span>
                  {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pastAppointments.length > 0 && (
        <div className="space-y-4 mt-8">
          <h4 className="font-medium text-gray-700">Rendez-vous passés</h4>
          {pastAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold">
                    Dr. {appointment.doctorFirstName} {appointment.doctorLastName}
                  </h5>
                  <p className="text-sm text-gray-600">{appointment.specialty}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700">
                  Terminé
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="text-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${profile?.firstName}+${profile?.lastName}&background=0D8ABC&color=fff`}
                  alt="Patient profile"
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-gray-600">Patient</p>
              </div>
            </div>

            <nav className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex items-center space-x-3 w-full px-6 py-4 text-left ${
                  activeTab === 'appointments' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Rendez-vous</span>
              </button>
              <button
                onClick={() => setActiveTab('medical-records')}
                className={`flex items-center space-x-3 w-full px-6 py-4 text-left ${
                  activeTab === 'medical-records' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Dossier Médical</span>
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                className={`flex items-center space-x-3 w-full px-6 py-4 text-left ${
                  activeTab === 'doctors' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Mes Médecins</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-3 w-full px-6 py-4 text-left ${
                  activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Paramètres</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              {activeTab === 'appointments' && renderAppointments()}
              {/* Add other tab contents as needed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}