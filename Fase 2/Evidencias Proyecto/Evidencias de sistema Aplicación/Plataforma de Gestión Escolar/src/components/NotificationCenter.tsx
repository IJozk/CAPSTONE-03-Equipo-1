import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  BookOpen, 
  Calendar,
  Trash2,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockNotifications, mockStudents } from '../data/mockData';
import { Notification } from '../types';

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'asistencia' | 'nota'>('all');

  if (!user) return null;

  const userNotifications = notifications.filter(n => n.userId === user.id);
  
  const filteredNotifications = userNotifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => 
        n.userId === user.id ? { ...n, read: true } : n
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'asistencia':
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'nota':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'asistencia':
        return 'border-l-orange-500';
      case 'nota':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Centro de Notificaciones</h2>
          <p className="text-muted-foreground">
            Mantente al día con las actividades académicas de tus hijos.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas ({userNotifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Sin leer ({unreadCount})
        </Button>
        <Button
          variant={filter === 'asistencia' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('asistencia')}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Asistencia
        </Button>
        <Button
          variant={filter === 'nota' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('nota')}
        >
          <BookOpen className="h-4 w-4 mr-1" />
          Notas
        </Button>
      </div>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay notificaciones</h3>
            <p className="text-muted-foreground text-center">
              {filter === 'unread' 
                ? 'No tienes notificaciones sin leer.' 
                : 'No se encontraron notificaciones con los filtros seleccionados.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(notification => {
              const student = notification.studentId 
                ? mockStudents.find(s => s.id === notification.studentId)
                : null;
              
              return (
                <Card 
                  key={notification.id} 
                  className={`border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'bg-muted/30' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {notification.title}
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">
                                Nuevo
                              </Badge>
                            )}
                          </CardTitle>
                          {student && (
                            <p className="text-sm text-muted-foreground">
                              Estudiante: {student.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.date).toLocaleDateString('es-CL', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        <div className="flex space-x-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm">{notification.message}</p>
                    
                    {notification.type === 'asistencia' && (
                      <Alert className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Se ha registrado una ausencia. Si esto es incorrecto, contacta al profesor o coordinador correspondiente.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {notification.type === 'nota' && student && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          ¿Te gustaría responder una breve encuesta sobre esta evaluación?
                        </p>
                        <Button variant="outline" size="sm">
                          Responder encuesta
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
};