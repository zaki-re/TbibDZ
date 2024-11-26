import { useState } from 'react';
import { Search, User, Phone, Calendar } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  lastVisit?: string;
  nextAppointment?: string;
}

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  const filteredPatients = patients.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">{t('doctor.patients.title')}</h3>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('doctor.patients.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t('doctor.patients.noPatients')}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {patient.firstName} {patient.lastName}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Phone className="w-4 h-4 mr-1" />
                      {patient.phone}
                    </div>
                    {patient.lastVisit && (
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">{t('doctor.patients.lastVisit')}:</span>{' '}
                        {patient.lastVisit}
                      </div>
                    )}
                    {patient.nextAppointment && (
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">{t('doctor.patients.nextAppointment')}:</span>{' '}
                        {patient.nextAppointment}
                      </div>
                    )}
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700">
                  {t('doctor.patients.viewProfile')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}