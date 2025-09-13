import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  User, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Users, 
  GraduationCap,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  mockStudents, 
  mockGrades, 
  mockAttendance, 
  mockNotifications,
  mockClasses 
} from '../data/mockData';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const renderApoderadoDashboard = () => {
    const myStudents = mockStudents.filter(s => s.guardianId === user.id);
    const myNotifications = mockNotifications.filter(n => n.userId === user.id && !n.read);
    const recentGrades = mockGrades.filter(g => 
      myStudents.some(s => s.id === g.studentId)
    ).slice(0, 3);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Bienvenido, {user.name}</h2>
          <p className="text-muted-foreground">
            Aquí tienes un resumen de la actividad académica de tus hijos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Hijos</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myStudents.length}</div>
              <p className="text-xs text-muted-foreground">estudiantes registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notificaciones</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myNotifications.length}</div>
              <p className="text-xs text-muted-foreground">sin leer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Evaluaciones Recientes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentGrades.length}</div>
              <p className="text-xs text-muted-foreground">esta semana</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mis Hijos</CardTitle>
              <CardDescription>Estado actual de tus estudiantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myStudents.map(student => {
                  const attendance = mockAttendance.filter(a => a.studentId === student.id);
                  const attendanceRate = attendance.length > 0 
                    ? (attendance.filter(a => a.present).length / attendance.length) * 100 
                    : 100;
                  
                  return (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.grade} {student.section}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={attendanceRate >= 90 ? "default" : "destructive"}>
                          {attendanceRate.toFixed(0)}% asistencia
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calificaciones Recientes</CardTitle>
              <CardDescription>Últimas evaluaciones de tus hijos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentGrades.map(grade => {
                  const student = mockStudents.find(s => s.id === grade.studentId);
                  const percentage = (grade.value / grade.maxValue) * 100;
                  
                  return (
                    <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{student?.name}</p>
                        <p className="text-sm text-muted-foreground">{grade.subject} - {grade.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{grade.value}</p>
                        <Badge variant={percentage >= 60 ? "default" : "destructive"}>
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderDocenteDashboard = () => {
    const myClasses = mockClasses.filter(c => c.teacherId === user.id);
    const studentsInMyClasses = mockStudents.filter(s => 
      myClasses.some(c => c.grade === s.grade && c.section === s.section)
    );
    const todayAttendance = mockAttendance.filter(a => a.teacherId === user.id);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Bienvenido, {user.name}</h2>
          <p className="text-muted-foreground">
            Panel de control para gestión académica y seguimiento de estudiantes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Clases</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myClasses.length}</div>
              <p className="text-xs text-muted-foreground">cursos asignados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentsInMyClasses.length}</div>
              <p className="text-xs text-muted-foreground">bajo mi tutela</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia Hoy</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayAttendance.filter(a => a.present).length}/{todayAttendance.length}
              </div>
              <p className="text-xs text-muted-foreground">presentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockGrades.length}</div>
              <p className="text-xs text-muted-foreground">calificadas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mis Clases</CardTitle>
              <CardDescription>Cursos que tienes asignados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myClasses.map(classItem => (
                  <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{classItem.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {classItem.grade} {classItem.section} - {classItem.schedule}
                      </p>
                    </div>
                    <Badge>Activo</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Asistencia registrada</p>
                    <p className="text-sm text-muted-foreground">8° A - Matemáticas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Calificaciones subidas</p>
                    <p className="text-sm text-muted-foreground">Prueba de Álgebra</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderCoordinadorDashboard = () => {
    const totalStudents = mockStudents.length;
    const totalGrades = mockGrades.length;
    const averageGrade = mockGrades.reduce((sum, g) => sum + (g.value / g.maxValue), 0) / mockGrades.length * 100;
    const attendanceRate = mockAttendance.filter(a => a.present).length / mockAttendance.length * 100;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Panel de Coordinación</h2>
          <p className="text-muted-foreground">
            Vista general del rendimiento académico y estadísticas institucionales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">matriculados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageGrade.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">rendimiento académico</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">promedio mensual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGrades}</div>
              <p className="text-xs text-muted-foreground">este mes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Curso</CardTitle>
              <CardDescription>Promedio de notas por grado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['7°', '8°'].map(grade => {
                  const gradeGrades = mockGrades.filter(g => {
                    const student = mockStudents.find(s => s.id === g.studentId);
                    return student?.grade === grade;
                  });
                  const average = gradeGrades.length > 0 
                    ? gradeGrades.reduce((sum, g) => sum + (g.value / g.maxValue), 0) / gradeGrades.length * 100
                    : 0;
                  
                  return (
                    <div key={grade} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{grade} Básico</p>
                        <p className="text-sm text-muted-foreground">
                          {mockStudents.filter(s => s.grade === grade).length} estudiantes
                        </p>
                      </div>
                      <Badge variant={average >= 70 ? "default" : "destructive"}>
                        {average.toFixed(1)}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas Académicas</CardTitle>
              <CardDescription>Estudiantes que requieren atención</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStudents.slice(0, 3).map(student => {
                  const studentGrades = mockGrades.filter(g => g.studentId === student.id);
                  const average = studentGrades.length > 0 
                    ? studentGrades.reduce((sum, g) => sum + (g.value / g.maxValue), 0) / studentGrades.length * 100
                    : 0;
                  
                  return (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.grade} {student.section}</p>
                      </div>
                      <Badge variant={average >= 60 ? "secondary" : "destructive"}>
                        {average > 0 ? `${average.toFixed(1)}%` : 'Sin datos'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {user.role === 'apoderado' && renderApoderadoDashboard()}
      {user.role === 'docente' && renderDocenteDashboard()}
      {user.role === 'coordinador' && renderCoordinadorDashboard()}
    </div>
  );
};