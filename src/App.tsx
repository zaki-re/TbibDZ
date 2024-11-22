import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import FindDoctorPage from './components/pages/FindDoctorPage';
import DoctorDashboard from './components/pages/DoctorDashboard';
import DoctorSchedule from './components/pages/DoctorSchedule';
import PatientDashboard from './components/pages/PatientDashboard';

export type PageType = 'home' | 'login' | 'register' | 'about' | 'contact' | 'find-doctor' | 'doctor-dashboard' | 'doctor-schedule' | 'patient-dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [language, setLanguage] = useState<'fr' | 'ar' | 'en'>('fr');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'doctor' | undefined>();

  useEffect(() => {
    const handleNavigation = (event: CustomEvent<PageType>) => {
      setCurrentPage(event.detail);
      if (event.detail === 'doctor-dashboard') {
        setIsLoggedIn(true);
        setUserType('doctor');
      } else if (event.detail === 'patient-dashboard') {
        setIsLoggedIn(true);
        setUserType('patient');
      }
    };

    const handleLogout = () => {
      setIsLoggedIn(false);
      setUserType(undefined);
      setCurrentPage('home');
    };

    window.addEventListener('navigate', handleNavigation as EventListener);
    window.addEventListener('logout', handleLogout);

    return () => {
      window.removeEventListener('navigate', handleNavigation as EventListener);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginForm onRegisterClick={() => setCurrentPage('register')} />;
      case 'register':
        return <RegisterForm onLoginClick={() => setCurrentPage('login')} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'find-doctor':
        return <FindDoctorPage />;
      case 'doctor-dashboard':
        return <DoctorDashboard />;
      case 'doctor-schedule':
        return <DoctorSchedule />;
      case 'patient-dashboard':
        return <PatientDashboard />;
      default:
        return (
          <>
            <Hero />
            <Features />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onNavigate={setCurrentPage} 
        currentLanguage={language}
        onLanguageChange={setLanguage}
        isLoggedIn={isLoggedIn}
        userType={userType}
      />
      <main>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;