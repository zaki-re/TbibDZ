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
  rating?: number;
  reviewsCount?: number;
}

export interface SearchParams {
  search?: string;
  city?: string;
  specialty?: string;
  rating?: number;
  availability?: string;
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

export const searchDoctors = async (params: SearchParams) => {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.city) queryParams.append('city', params.city);
  if (params.specialty) queryParams.append('specialty', params.specialty);
  if (params.rating) queryParams.append('rating', params.rating.toString());
  if (params.availability) queryParams.append('availability', params.availability);

  const response = await api.get(`/doctors?${queryParams.toString()}`);
  return response.data;
};

export const getDoctorAvailability = async (doctorId: number): Promise<AvailabilityResponse> => {
  const response = await api.get(`/doctors/availability/${doctorId}`);
  return response.data;
};