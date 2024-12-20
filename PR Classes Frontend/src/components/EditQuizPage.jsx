import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EditQuizPage = () => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get(`/quiz/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuiz(response.data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast({
          title: "Error",
          description: "Failed to fetch quiz details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const validateQuiz = () => {
    if (!quiz.title.trim()) {
      toast({ title: "Error", description: "Quiz title is required", variant: "destructive" });
      return false;
    }
    // ... rest of validation logic similar to TeacherQuizPage ...
    return true;
  };

  const handleUpdateQuiz = async () => {
    if (!validateQuiz()) return;

    try {
      const token = Cookies.get('token');
      await axios.put(`/quiz/${id}`, quiz, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: "Success",
        description: "Quiz updated successfully",
      });
      navigate('/teacher/quizzes');
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update quiz",
        variant: "destructive"
      });
    }
  };

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          questionText: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ],
          points: 1
        }
      ]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...quiz.questions];
    const options = [...updatedQuestions[questionIndex].options];
    
    if (field === 'isCorrect') {
      options.forEach(opt => opt.isCorrect = false);
    }
    
    options[optionIndex] = { ...options[optionIndex], [field]: value };
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options };
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!quiz) {
    return <div className="flex justify-center items-center h-screen">Quiz not found</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Quiz</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/teacher/quizzes')}
        >
          Cancel
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={quiz.title}
              onChange={(e) => setQuiz({...quiz, title: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={quiz.subject}
              onChange={(e) => setQuiz({...quiz, subject: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={quiz.duration}
              onChange={(e) => setQuiz({...quiz, duration: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={quiz.dueDate?.split('T')[0]}
              onChange={(e) => setQuiz({...quiz, dueDate: e.target.value})}
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          {quiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <Label>Question {qIndex + 1}</Label>
                  <Input
                    value={question.questionText}
                    onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                    placeholder="Enter question text"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  value={question.points}
                  onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                  className="w-24"
                />
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                {question.options.map((option, oIndex) => (
                  <div key={option._id || oIndex} className="flex items-center gap-2">
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    <input
                      type="radio"
                      checked={option.isCorrect}
                      onChange={() => updateOption(qIndex, oIndex, 'isCorrect', true)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/teacher/quizzes')}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateQuiz}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditQuizPage; 