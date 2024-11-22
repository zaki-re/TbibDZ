import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Settings, Star, Video, FileText, ChevronRight, MapPin } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type TabType = 'appointments' | 'patients' | 'reviews' | 'settings';

interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  bio: string;
  consultationFee: number;
  totalReviews: number;
  averageRating: number;
}

interface Appointment {
  id: number;
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  date: string;
  time: string;
  type: 'in-person' | 'video';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

interface Review {
  id: number;
  patientFirstName: string;
  patientLastName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function DoctorDashboard() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      loadDoctorData();
    }
  }, [userId]);

  const loadDoctorData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get('/doctors/profile');
      const data = response.data;

      if (data) {
        setProfile(data.profile || null);
        setTodayAppointments(data.todayAppointments || []);
        setUpcomingAppointments(data.upcomingAppointments || []);
        setReviews(data.reviews || []);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des données';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedProfile: Partial<Profile>) => {
    try {
      setError('');
      await api.put('/doctors/profile', updatedProfile);
      await loadDoctorData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
    }
  };

  const handleAppointmentStatusUpdate = async (appointmentId: number, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      setError('');
      await api.put(`/appointments/${appointmentId}`, { status });
      await loadDoctorData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du rendez-vous';
      setError(errorMessage);
    }
  };

  const handleSchedule = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'doctor-schedule' }));
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
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="text-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${profile?.firstName}+${profile?.lastName}&background=0D8ABC&color=fff`}
                  alt="Doctor profile"
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold">
                  Dr. {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-gray-600">{profile?.specialty}</p>
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
                onClick={() => setActiveTab('patients')}
                className={`flex items-center space-x-3 w-full px-6 py-4 text-left ${
                  activeTab === 'patients' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Patients</span>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center space-x-3 w-full px-6 py-4 text-left ${
                  activeTab === 'reviews' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Star className="w-5 h-5" />
                <span>Avis</span>
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
              {activeTab === 'appointments' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Rendez-vous du jour</h3>
                    <button 
                      onClick={handleSchedule}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Gérer les disponibilités
                    </button>
                  </div>

                  {todayAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun rendez-vous aujourd'hui</p>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments.map((appointment) => (
                        <div key={appointment.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <div className="bg-blue-100 p-3 rounded-full">
                                {appointment.type === 'video' ? (
                                  <Video className="w-6 h-6 text-blue-600" />
                                ) : (
                                  <User className="w-6 h-6 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  {appointment.patientFirstName} {appointment.patientLastName}
                                </h4>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {appointment.time}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {appointment.patientPhone}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {appointment.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleAppointmentStatusUpdate(appointment.id, 'confirmed')}
                                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200"
                                  >
                                    Confirmer
                                  </button>
                                  <button
                                    onClick={() => handleAppointmentStatusUpdate(appointment.id, 'cancelled')}
                                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200"
                                  >
                                    Annuler
                                  </button>
                                </>
                              )}
                              {appointment.status === 'confirmed' && (
                                <button
                                  onClick={() => handleAppointmentStatusUpdate(appointment.id, 'completed')}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                                >
                                  Terminer
                                </button>
                              )}
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {appointment.status === 'confirmed' ? 'Confirmé' :
                                 appointment.status === 'completed' ? 'Terminé' : 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Paramètres du profil</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spécialité
                      </label>
                      <input
                        type="text"
                        value={profile?.specialty || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, specialty: e.target.value} : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={profile?.phone || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={profile?.city || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, city: e.target.value} : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tarif consultation (DZD)
                      </label>
                      <input
                        type="number"
                        value={profile?.consultationFee || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, consultationFee: Number(e.target.value)} : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={profile?.address || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, address: e.target.value} : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={profile?.bio || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => profile && handleProfileUpdate(profile)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}