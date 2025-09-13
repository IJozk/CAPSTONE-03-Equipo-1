import React from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  GraduationCap, 
  LogOut, 
  Bell, 
  User,
  Home,
  BookOpen,
  Calendar,
  BarChart3,
  ClipboardList,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  notificationCount?: number;
}

const getNavigationItems = (role: UserRole) => {
  const common = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'notifications', label: 'Notificaciones', icon: Bell }
  ];

  switch (role) {
    case 'apoderado':
      return [
        ...common,
        { id: 'students', label: 'Mis Hijos', icon: User },
        { id: 'grades', label: 'Notas', icon: BookOpen },
        { id: 'attendance', label: 'Asistencia', icon: Calendar },
        { id: 'surveys', label: 'Encuestas', icon: ClipboardList }
      ];
    case 'docente':
      return [
        ...common,
        { id: 'classes', label: 'Mis Clases', icon: BookOpen },
        { id: 'attendance-management', label: 'Asistencia', icon: Calendar },
        { id: 'grade-management', label: 'Notas', icon: BarChart3 },
        { id: 'annotations', label: 'Anotaciones', icon: ClipboardList }
      ];
    case 'coordinador':
      return [
        ...common,
        { id: 'students-management', label: 'Estudiantes', icon: User },
        { id: 'reports', label: 'Reportes', icon: BarChart3 },
        { id: 'analytics', label: 'Inteligencia de Negocios', icon: BarChart3 },
        { id: 'settings', label: 'Configuración', icon: Settings }
      ];
    default:
      return common;
  }
};

export const Navigation: React.FC<NavigationProps> = ({
  activeView,
  onViewChange,
  notificationCount = 0
}) => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const navigationItems = getNavigationItems(user.role);

  return (
    <nav className="bg-white border-b border-border">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-lg p-2">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Sistema Académico</h1>
                <p className="text-sm text-muted-foreground">
                  {user.role === 'apoderado' && 'Portal de Apoderados'}
                  {user.role === 'docente' && 'Portal Docente'}
                  {user.role === 'coordinador' && 'Portal de Coordinación'}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const showBadge = item.id === 'notifications' && notificationCount > 0;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(item.id)}
                  className="relative"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                  {showBadge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border mt-4 pt-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const showBadge = item.id === 'notifications' && notificationCount > 0;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onViewChange(item.id)}
                  className="relative justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                  {showBadge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};