import { Menu, X, User, Globe, LogOut, Bell } from 'lucide-react';
import { useState } from 'react';
import { PageType } from '../App';
import { useLanguage } from '../hooks/useLanguage';

interface NavbarProps {
  onNavigate: (page: PageType) => void;
  currentLanguage: 'fr' | 'ar' | 'en';
  onLanguageChange: (lang: 'fr' | 'ar' | 'en') => void;
  isLoggedIn?: boolean;
  userType?: 'patient' | 'doctor';
}

export default function Navbar({ 
  onNavigate, 
  currentLanguage, 
  onLanguageChange,
  isLoggedIn = false,
  userType
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLanguageChange(e.target.value as 'fr' | 'ar' | 'en');
  };

  const handleLogout = () => {
    window.location.hash = '';
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
    window.dispatchEvent(new CustomEvent('logout'));
  };

  const notifications = [
    { id: 1, message: t('notifications.newAppointment'), time: t('notifications.fiveMinutesAgo') },
    { id: 2, message: t('notifications.appointmentReminder'), time: t('notifications.oneHourAgo') }
  ];

  const renderAuthenticatedNav = () => (
    <>
      {userType === 'patient' ? (
        <>
          <button 
            onClick={() => onNavigate('find-doctor')}
            className="text-gray-700 hover:text-blue-600"
          >
            {t('nav.findDoctor')}
          </button>
          <button 
            onClick={() => onNavigate('patient-dashboard')}
            className="text-gray-700 hover:text-blue-600"
          >
            {t('nav.appointments')}
          </button>
        </>
      ) : (
        <>
          <button 
            onClick={() => onNavigate('doctor-dashboard')}
            className="text-gray-700 hover:text-blue-600"
          >
            {t('nav.dashboard')}
          </button>
          <button 
            onClick={() => onNavigate('doctor-schedule')}
            className="text-gray-700 hover:text-blue-600"
          >
            {t('nav.schedule')}
          </button>
        </>
      )}
      
      <div className="relative">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="text-gray-700 hover:text-blue-600 relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            2
          </span>
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="font-semibold">{t('notifications.title')}</h3>
            </div>
            {notifications.map(notification => (
              <div key={notification.id} className="px-4 py-3 hover:bg-gray-50">
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={handleLogout}
        className="text-gray-700 hover:text-blue-600 flex items-center"
      >
        <LogOut className="w-5 h-5 mr-1" />
        {t('nav.logout')}
      </button>
    </>
  );

  const renderUnauthenticatedNav = () => (
    <>
      <button 
        onClick={() => onNavigate('home')}
        className="text-gray-700 hover:text-blue-600"
      >
        {t('nav.home')}
      </button>
      <button 
        onClick={() => onNavigate('find-doctor')}
        className="text-gray-700 hover:text-blue-600"
      >
        {t('nav.findDoctor')}
      </button>
      <button 
        onClick={() => onNavigate('contact')}
        className="text-gray-700 hover:text-blue-600"
      >
        {t('nav.contact')}
      </button>
    </>
  );

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span 
              className="text-2xl font-bold text-blue-600 cursor-pointer" 
              onClick={() => onNavigate(isLoggedIn ? (userType === 'doctor' ? 'doctor-dashboard' : 'patient-dashboard') : 'home')}
            >
              TabibDZ
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isLoggedIn ? renderAuthenticatedNav() : renderUnauthenticatedNav()}
            
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-gray-600" />
              <select 
                value={currentLanguage}
                onChange={handleLanguageChange}
                className="bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              >
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            {!isLoggedIn && (
              <button 
                onClick={() => onNavigate('login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <User className="w-4 h-4 mr-2" />
                {t('nav.login')}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isLoggedIn ? (
              <>
                {userType === 'patient' ? (
                  <>
                    <button 
                      onClick={() => {
                        onNavigate('find-doctor');
                        setIsOpen(false);
                      }}
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left"
                    >
                      {t('nav.findDoctor')}
                    </button>
                    <button 
                      onClick={() => {
                        onNavigate('patient-dashboard');
                        setIsOpen(false);
                      }}
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left"
                    >
                      {t('nav.appointments')}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        onNavigate('doctor-dashboard');
                        setIsOpen(false);
                      }}
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left"
                    >
                      {t('nav.dashboard')}
                    </button>
                    <button 
                      onClick={() => {
                        onNavigate('doctor-schedule');
                        setIsOpen(false);
                      }}
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left"
                    >
                      {t('nav.schedule')}
                    </button>
                  </>
                )}
                <button 
                  onClick={handleLogout}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    onNavigate('home');
                    setIsOpen(false);
                  }}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left"
                >
                  {t('nav.home')}
                </button>
                <button 
                  onClick={() => {
                    onNavigate('find-doctor');
                    setIsOpen(false);
                  }}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left"
                >
                  {t('nav.findDoctor')}
                </button>
                <button 
                  onClick={() => {
                    onNavigate('contact');
                    setIsOpen(false);
                  }}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left"
                >
                  {t('nav.contact')}
                </button>
                <button 
                  onClick={() => {
                    onNavigate('login');
                    setIsOpen(false);
                  }}
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                >
                  {t('nav.login')}
                </button>
              </>
            )}
            
            <div className="px-3 py-2">
              <select
                value={currentLanguage}
                onChange={handleLanguageChange}
                className="w-full bg-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}