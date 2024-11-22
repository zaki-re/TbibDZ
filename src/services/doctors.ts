import api from './api';

export interface Doctor {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  specialty: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  bio?: string;
  consultationFee?: number;
}

export interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface BookedSlot {
  date: string;
  time: string;
  patientName?: string;
  type?: 'in-person' | 'video';
}

export interface AvailabilityResponse {
  availability: Availability[];
  bookedSlots: BookedSlot[];
}

export const getDoctorAvailability = async (id: number): Promise<AvailabilityResponse> => {
  const response = await api.get(`/doctors/${id}/availability`);
  return response.data;
};

export const updateDoctorAvailability = async (availability: Availability[]) => {
  const response = await api.put('/doctors/availability', { availability });
  return response.data;
};