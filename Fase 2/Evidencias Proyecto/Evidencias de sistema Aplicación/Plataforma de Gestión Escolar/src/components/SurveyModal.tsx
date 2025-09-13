import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Survey, SurveyResponse } from '../types';
import { useAuth } from '../context/AuthContext';

interface SurveyModalProps {
  survey: Survey;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (response: SurveyResponse) => void;
  studentId?: string;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({
  survey,
  isOpen,
  onClose,
  onComplete,
  studentId
}) => {
  const { user } = useAuth();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (!user) return;

    const response: SurveyResponse = {
      id: Math.random().toString(36).substr(2, 9),
      surveyId: survey.id,
      userId: user.id,
      studentId,
      responses,
      completedAt: new Date().toISOString()
    };

    onComplete(response);
    setIsCompleted(true);
    
    setTimeout(() => {
      onClose();
      setIsCompleted(false);
      setCurrentQuestion(0);
      setResponses({});
    }, 2000);
  };

  const currentQ = survey.questions[currentQuestion];
  const isAnswered = responses[currentQ?.id];
  const allRequiredAnswered = survey.questions
    .filter(q => q.required)
    .every(q => responses[q.id]);

  if (isCompleted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">¡Encuesta completada!</h3>
            <p className="text-muted-foreground">
              Gracias por responder la encuesta.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={survey.mandatory ? undefined : onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{survey.title}</DialogTitle>
          <DialogDescription>
            {survey.type === 'socioeconomica' && 
              'Esta encuesta nos ayuda a conocer mejor el contexto socioeconómico de nuestros estudiantes.'
            }
            {survey.type === 'evaluacion' && 
              'Tu opinión sobre la evaluación nos ayuda a mejorar el proceso de enseñanza.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Pregunta {currentQuestion + 1} de {survey.questions.length}
            </span>
            <div className="w-32 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / survey.questions.length) * 100}%` }}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {currentQ?.question}
                {currentQ?.required && <span className="text-destructive ml-1">*</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentQ?.type === 'multiple_choice' && (
                <RadioGroup
                  value={responses[currentQ.id] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                >
                  {currentQ.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {survey.mandatory && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta encuesta es obligatoria y debe ser completada para continuar.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Anterior
            </Button>

            <div className="flex space-x-2">
              {!survey.mandatory && (
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={currentQ?.required && !isAnswered}
              >
                {currentQuestion === survey.questions.length - 1 ? 'Finalizar' : 'Siguiente'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};