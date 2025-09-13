import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { SidebarLayout } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { NotificationCenter } from './components/NotificationCenter';
import { StudentView } from './components/StudentView';
import { SurveyModal } from './components/SurveyModal';
import { Toaster } from './components/ui/sonner';
import { mockNotifications, socioeconomicSurvey, mockSurveyResponses } from './data/mockData';
import { toast } from 'sonner@2.0.3';

function AppContent() {
  const { user, updateUser } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    if (user?.role === 'apoderado' && user.firstLogin) {
      // Check if user has completed socioeconomic survey
      const hasCompletedSurvey = mockSurveyResponses.some(
        response => response.userId === user.id && response.surveyId === socioeconomicSurvey.id
      );
      
      if (!hasCompletedSurvey) {
        setShowSurvey(true);
      }
    }
  }, [user]);

  const handleSurveyComplete = () => {
    updateUser({ firstLogin: false });
    setShowSurvey(false);
    toast.success('¡Encuesta completada! Gracias por proporcionar esta información.');
  };

  if (!user) {
    return <LoginForm />;
  }

  const unreadNotifications = mockNotifications.filter(
    n => n.userId === user.id && !n.read
  ).length;

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'notifications':
        return <NotificationCenter />;
      case 'students':
        return <StudentView />;
      default:
        return (
          <div className="p-4 md:p-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Funcionalidad en desarrollo</h2>
            <p className="text-muted-foreground">
              Esta sección estará disponible próximamente.
            </p>
          </div>
        );
    }
  };

  return (
    <>
      <SidebarLayout
        activeView={activeView}
        onViewChange={setActiveView}
        notificationCount={unreadNotifications}
      >
        {renderActiveView()}
      </SidebarLayout>

      {showSurvey && (
        <SurveyModal
          survey={socioeconomicSurvey}
          isOpen={showSurvey}
          onClose={() => setShowSurvey(false)}
          onComplete={handleSurveyComplete}
        />
      )}

      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}