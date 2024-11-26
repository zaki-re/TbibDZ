import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Settings, Star, Video, FileText, ChevronRight, MapPin, Check, X, Search } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProfilePhotoUpload from '../ProfilePhotoUpload';
import { useLanguage } from '../../hooks/useLanguage';
import PatientsList from './DoctorDashboard/PatientsList';
import ReviewsList from './DoctorDashboard/ReviewsList';
import SettingsForm from './DoctorDashboard/SettingsForm';

type TabType = 'appointments' | 'requests' | 'patients' | 'reviews' | 'settings';

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
  photoUrl?: string;
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

interface ConsultationRequest {
  id: number;
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  date: string;
  time: string;
  type: 'in-person' | 'video';
  notes?: string;
  createdAt: string;
}

export default function DoctorDashboard() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (userId) {
      loadDoctorData();
      loadConsultationRequests();
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
        setAppointments(data.appointments || []);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des données';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConsultationRequests = async () => {
    try {
      const response = await api.get('/doctors/consultation-requests');
      setConsultationRequests(response.data);
    } catch (err) {
      console.error('Error loading consultation requests:', err);
    }
  };

  const handlePhotoUpdate = (photoUrl: string) => {
    setProfile(prev => prev ? { ...prev, photoUrl } : null);
  };

  const handleRequestAction = async (requestId: number, action: 'accept' | 'reject') => {
    try {
      await api.put(`/doctors/consultation-requests/${requestId}`, { status: action });
      loadConsultationRequests();
      loadDoctorData();
    } catch (err) {
      console.error('Error updating consultation request:', err);
    }
  };

  const handleSchedule = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'doctor-schedule' }));
  };

  const filteredAppointments = appointments.filter(appointment => {
    const fullName = `${appointment.patientFirstName} ${appointment.patientLastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const todayAppointments = filteredAppointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    return appointment.date === today;
  });

  const futureAppointments = filteredAppointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    return appointment.date > today;
  });

  const pastAppointments = filteredAppointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    return appointment.date < today;
  });

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">{t('doctor.appointments.title')}</h3>
        <button 
          onClick={handleSchedule}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('doctor.appointments.manageAvailability')}
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('doctor.appointments.searchPatient')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="mb-8">
        <h4 className="text-lg font-medium mb-4">{t('doctor.appointments.today')}</h4>
        {todayAppointments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{t('doctor.appointments.noAppointmentsToday')}</p>
        ) : (
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>

      {/* Future Appointments */}
      <div className="mb-8">
        <h4 className="text-lg font-medium mb-4">{t('doctor.appointments.upcoming')}</h4>
        {futureAppointments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{t('doctor.appointments.noUpcomingAppointments')}</p>
        ) : (
          <div className="space-y-4">
            {futureAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      <div>
        <h4 className="text-lg font-medium mb-4">{t('doctor.appointments.past')}</h4>
        {pastAppointments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{t('doctor.appointments.noPastAppointments')}</p>
        ) : (
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
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
              {appointment.patientFirstName} {appointment.patientLastName}
            </h4>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
            </div>
            <div className="text-sm text-gray-500">
              {appointment.patientPhone}
            </div>
            {appointment.notes && (
              <p className="text-sm text-gray-600 mt-2">
                Note: {appointment.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm ${
            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {t(`doctor.appointments.status.${appointment.status}`)}
          </span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">{t('common.loading')}</div>
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
                <ProfilePhotoUpload
                  currentPhotoUrl={profile?.photoUrl}
                  onPhotoUpdate={handlePhotoUpdate}
                />
                <h2 className="text-xl font-semibold mt-4">
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
                <span>{t('doctor.nav.appointments')}</span>
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex items-center space-x-3 w-full px-6 py-4 text-left ${
                  activeTab === 'requests' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>{t('doctor.nav.requests')}</span>
                {consultationRequests.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                    {consultationRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('patients')}
                className={`flex items-center space-x-3 w-full px-6 py-4 text-left ${
                  activeTab === 'patients' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span>{t('doctor.nav.patients')}</span>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center space-x-3 w-full px-6 py-4 text-left ${
                  activeTab === 'reviews' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Star className="w-5 h-5" />
                <span>{t('doctor.nav.reviews')}</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-3 w-full px-6 py-4 text-left ${
                  activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>{t('doctor.nav.settings')}</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              {activeTab === 'appointments' && renderAppointments()}
              {activeTab === 'patients' && <PatientsList />}
              {activeTab === 'reviews' && <ReviewsList />}
              {activeTab === 'settings' && <SettingsForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}