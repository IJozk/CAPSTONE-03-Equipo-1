import React from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './ui/sidebar';
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
  Settings,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AppSidebarProps {
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

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeView,
  onViewChange,
  notificationCount = 0
}) => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const navigationItems = getNavigationItems(user.role);

  return (
    <Sidebar variant="inset" className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="bg-primary rounded-lg p-2 shrink-0">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="font-semibold text-sm truncate">Sistema Académico</h1>
            <p className="text-xs text-muted-foreground truncate">
              {user.role === 'apoderado' && 'Portal de Apoderados'}
              {user.role === 'docente' && 'Portal Docente'}
              {user.role === 'coordinador' && 'Portal de Coordinación'}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const showBadge = item.id === 'notifications' && notificationCount > 0;
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => onViewChange(item.id)}
                  isActive={isActive}
                  className="relative"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {showBadge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 left-6 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex items-center gap-3 px-4 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">{user.role}</p>
          </div>
        </div>
        <div className="px-4 pb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export const SidebarLayout: React.FC<{
  activeView: string;
  onViewChange: (view: string) => void;
  notificationCount?: number;
  children: React.ReactNode;
}> = ({ activeView, onViewChange, notificationCount, children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar 
          activeView={activeView}
          onViewChange={onViewChange}
          notificationCount={notificationCount}
        />
        <main className="flex-1 flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger />
            <div className="flex-1" />
          </header>
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};