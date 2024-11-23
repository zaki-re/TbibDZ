import api from './api';

export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  type: 'in-person' | 'video';
  notes?: string;
  doctorFirstName?: string;
  doctorLastName?: string;
  specialty?: string;
  patientFirstName?: string;
  patientLastName?: string;
  doctorPhone?: string;
  consultationFee?: number;
}

export const createAppointment = async (data: Omit<Appointment, 'id' | 'status'>) => {
  const response = await api.post('/appointments', data);
  return response.data;
};

export const getAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data;
};

export const updateAppointmentStatus = async (id: number, status: Appointment['status']) => {
  const response = await api.put(`/appointments/${id}`, { status });
  return response.data;
};

export const deleteAppointment = async (id: number) => {
  const response = await api.delete(`/appointments/${id}`);
  return response.data;
};