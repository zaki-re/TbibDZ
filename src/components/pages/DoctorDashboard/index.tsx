import { useState, useEffect } from 'react';
import { Calendar, User, Settings, Star } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import ProfilePhotoUpload from '../../ProfilePhotoUpload';
import { useLanguage } from '../../../hooks/useLanguage';
import PatientsList from './PatientsList';
import ReviewsList from './ReviewsList';
import SettingsForm from './SettingsForm';

// Rest of the file remains unchanged...