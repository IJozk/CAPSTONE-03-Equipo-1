import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  mockStudents, 
  mockGrades, 
  mockAttendance, 
  mockAnnotations 
} from '../data/mockData';

export const StudentView: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'apoderado') return null;

  const myStudents = mockStudents.filter(s => s.guardianId === user.id);

  const getStudentData = (studentId: string) => {
    const grades = mockGrades.filter(g => g.studentId === studentId);
    const attendance = mockAttendance.filter(a => a.studentId === studentId);
    const annotations = mockAnnotations.filter(a => a.studentId === studentId);

    const attendanceRate = attendance.length > 0 
      ? (attendance.filter(a => a.present).length / attendance.length) * 100 
      : 100;

    const averageGrade = grades.length > 0 
      ? grades.reduce((sum, g) => sum + (g.value / g.maxValue), 0) / grades.length * 100
      : 0;

    return {
      grades,
      attendance,
      annotations,
      attendanceRate,
      averageGrade
    };
  };

  const renderStudentCard = (student: any) => {
    const data = getStudentData(student.id);

    return (
      <Card key={student.id} className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="bg-primary rounded-full p-3">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>{student.name}</CardTitle>
              <CardDescription>
                RUT: {student.rut} | Curso: {student.grade} {student.section}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="grades">Notas</TabsTrigger>
              <TabsTrigger value="attendance">Asistencia</TabsTrigger>
              <TabsTrigger value="annotations">Anotaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data.averageGrade > 0 ? `${data.averageGrade.toFixed(1)}%` : 'Sin datos'}
                    </div>
                    <Progress value={data.averageGrade} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.attendanceRate.toFixed(1)}%</div>
                    <Progress value={data.attendanceRate} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.grades.length}</div>
                    <p className="text-xs text-muted-foreground">este período</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado Académico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Rendimiento Académico</span>
                      <Badge variant={data.averageGrade >= 70 ? "default" : "destructive"}>
                        {data.averageGrade >= 70 ? "Satisfactorio" : "Requiere Atención"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Asistencia</span>
                      <Badge variant={data.attendanceRate >= 85 ? "default" : "destructive"}>
                        {data.attendanceRate >= 85 ? "Adecuada" : "Requiere Mejora"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Conducta</span>
                      <Badge variant="default">Sin observaciones</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades" className="space-y-4">
              {data.grades.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay calificaciones registradas</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {data.grades
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(grade => {
                      const percentage = (grade.value / grade.maxValue) * 100;
                      return (
                        <Card key={grade.id}>
                          <CardContent className="flex items-center justify-between p-4">
                            <div>
                              <p className="font-medium">{grade.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {grade.type} - {new Date(grade.date).toLocaleDateString('es-CL')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{grade.value}</p>
                              <Badge variant={percentage >= 60 ? "default" : "destructive"}>
                                {percentage.toFixed(0)}%
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              {data.attendance.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay registros de asistencia</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {data.attendance
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(record => (
                      <Card key={record.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-3">
                            {record.present ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <div>
                              <p className="font-medium">
                                {new Date(record.date).toLocaleDateString('es-CL', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Clase ID: {record.classId}
                              </p>
                            </div>
                          </div>
                          <Badge variant={record.present ? "default" : "destructive"}>
                            {record.present ? "Presente" : "Ausente"}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="annotations" className="space-y-4">
              {data.annotations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay anotaciones registradas</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {data.annotations
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(annotation => (
                      <Card key={annotation.id} className={`border-l-4 ${
                        annotation.type === 'positiva' ? 'border-l-green-500' :
                        annotation.type === 'negativa' ? 'border-l-red-500' :
                        'border-l-yellow-500'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={
                              annotation.type === 'positiva' ? "default" :
                              annotation.type === 'negativa' ? "destructive" :
                              "secondary"
                            }>
                              {annotation.type === 'positiva' ? "Positiva" :
                               annotation.type === 'negativa' ? "Negativa" :
                               "Observación"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(annotation.date).toLocaleDateString('es-CL')}
                            </span>
                          </div>
                          <p>{annotation.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Mis Hijos</h2>
        <p className="text-muted-foreground">
          Información académica detallada de tus estudiantes.
        </p>
      </div>

      {myStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay estudiantes registrados</h3>
            <p className="text-muted-foreground text-center">
              No se encontraron estudiantes asociados a tu cuenta de apoderado.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          {myStudents.map(renderStudentCard)}
        </div>
      )}
    </div>
  );
};