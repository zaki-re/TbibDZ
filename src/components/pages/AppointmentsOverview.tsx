import { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Download, ChevronDown } from 'lucide-react';
import api from '../../services/api';

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  type: 'in-person' | 'video';
}

export default function AppointmentsOverview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments
    .filter(appointment => {
      const matchesSearch = (
        appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateSort === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Patient', 'Doctor', 'Specialty', 'Type', 'Status'];
    const csvData = filteredAppointments.map(apt => [
      apt.date,
      apt.time,
      apt.patientName,
      apt.doctorName,
      apt.specialty,
      apt.type,
      apt.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'appointments.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Rendez-vous</h2>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par patient ou médecin..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
              <button
                onClick={() => setDateSort(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Date {dateSort === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Appointments Table */}
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun rendez-vous trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Médecin</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Spécialité</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {new Date(`${appointment.date} ${appointment.time}`).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-sm">{appointment.patientName}</td>
                      <td className="px-4 py-3 text-sm">{appointment.doctorName}</td>
                      <td className="px-4 py-3 text-sm">{appointment.specialty}</td>
                      <td className="px-4 py-3 text-sm">
                        {appointment.type === 'video' ? 'Téléconsultation' : 'En cabinet'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status === 'confirmed' ? 'Confirmé' :
                           appointment.status === 'pending' ? 'En attente' :
                           appointment.status === 'completed' ? 'Terminé' :
                           'Annulé'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}