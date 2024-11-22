import { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, Video, Stethoscope, Search, UserPlus } from 'lucide-react';
import BookingModal from '../booking/BookingModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  city: string;
  rating: number;
  reviewsCount: number;
  consultationFee: number;
  bio?: string;
}

export default function FindDoctorPage() {
  const { isAuthenticated } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    loadDoctors();
  }, [searchTerm, cityFilter]);

  const loadDoctors = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (cityFilter) params.append('city', cityFilter);

      const response = await api.get(`/doctors?${params.toString()}`);
      setDoctors(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des médecins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = (doctor: Doctor) => {
    if (!isAuthenticated) {
      // Navigate to login page
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }));
      return;
    }
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 pt-32 pb-20">
        <div 
          className="absolute inset-0 bg-black opacity-50"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'overlay'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trouvez le Médecin qu'il vous faut
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Plus de {doctors.length} médecins certifiés à votre service
          </p>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-2">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou spécialité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Filtrer par ville..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="mt-8 text-white">
              <p className="mb-4">Connectez-vous pour prendre rendez-vous avec nos médecins</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }))}
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'register' }))}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Créer un compte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Doctors List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={`https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=0D8ABC&color=fff&size=64`}
                      alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <div className="flex items-center text-gray-600">
                        <Stethoscope className="w-4 h-4 mr-1" />
                        {doctor.specialty}
                      </div>
                    </div>
                  </div>

                  {doctor.bio && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{doctor.bio}</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2" />
                      {doctor.city}
                    </div>

                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 mr-1" />
                      <span className="font-semibold mr-2">
                        {doctor.rating ? doctor.rating.toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-gray-600">
                        ({doctor.reviewsCount} avis)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {doctor.consultationFee} DZD
                        </span>
                        <span className="flex items-center text-blue-600">
                          <Video className="w-4 h-4 mr-1" />
                          Téléconsultation
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBooking(doctor)}
                    className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isAuthenticated ? 'Prendre rendez-vous' : 'Connectez-vous pour réserver'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDoctor && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          doctorId={selectedDoctor.id.toString()}
          doctorName={`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
          location={selectedDoctor.city}
        />
      )}
    </div>
  );
}