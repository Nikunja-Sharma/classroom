import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// import { useToast } from "@/components/ui/use-toast";
const TeacherQuizPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    subject: '',
    duration: 60,
    dueDate: '',
    questions: [
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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('/quiz/teacher/quizzes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuizzes(response.data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const validateQuiz = () => {
    if (!newQuiz.title.trim()) {
      toast({ title: "Error", description: "Quiz title is required", variant: "destructive" });
      return false;
    }
    if (!newQuiz.subject.trim()) {
      toast({ title: "Error", description: "Subject is required", variant: "destructive" });
      return false;
    }
    if (!newQuiz.dueDate) {
      toast({ title: "Error", description: "Due date is required", variant: "destructive" });
      return false;
    }
    if (newQuiz.duration <= 0) {
      toast({ title: "Error", description: "Duration must be greater than 0", variant: "destructive" });
      return false;
    }
    if (newQuiz.questions.length === 0) {
      toast({ title: "Error", description: "At least one question is required", variant: "destructive" });
      return false;
    }

    // Validate each question
    for (let i = 0; i < newQuiz.questions.length; i++) {
      const question = newQuiz.questions[i];
      if (!question.questionText.trim()) {
        toast({ 
          title: "Error", 
          description: `Question ${i + 1} text is required`, 
          variant: "destructive" 
        });
        return false;
      }
      if (question.points <= 0) {
        toast({ 
          title: "Error", 
          description: `Question ${i + 1} points must be greater than 0`, 
          variant: "destructive" 
        });
        return false;
      }
      
      // Check if any option is marked as correct
      const hasCorrectOption = question.options.some(opt => opt.isCorrect);
      if (!hasCorrectOption) {
        toast({ 
          title: "Error", 
          description: `Question ${i + 1} must have a correct answer selected`, 
          variant: "destructive" 
        });
        return false;
      }

      // Validate each option has text
      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].text.trim()) {
          toast({ 
            title: "Error", 
            description: `All options in question ${i + 1} must have text`, 
            variant: "destructive" 
          });
          return false;
        }
      }
    }

    return true;
  };

  const resetQuizForm = () => {
    setNewQuiz({
      title: '',
      subject: '',
      duration: 60,
      dueDate: '',
      questions: [
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

  const handleCreateQuiz = async () => {
    if (!validateQuiz()) return;

    try {
      const token = Cookies.get('token');
      const response = await axios.post('/quiz', newQuiz, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQuizzes([...quizzes, response.data]);
      toast({
        title: "Success",
        description: "Quiz created successfully",
      });
      
      // Reset form and close sheet
      resetQuizForm();
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create quiz",
        variant: "destructive"
      });
    }
  };

  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [
        ...newQuiz.questions,
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
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...newQuiz.questions];
    const options = [...updatedQuestions[questionIndex].options];
    
    if (field === 'isCorrect') {
      // Reset all options to false first
      options.forEach(opt => opt.isCorrect = false);
    }
    
    options[optionIndex] = { ...options[optionIndex], [field]: value };
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options };
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = newQuiz.questions.filter((_, i) => i !== index);
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Sheet open={open} onOpenChange={setOpen} >
          <SheetTrigger asChild>
            <Button className="bg-indigo-500 hover:bg-indigo-600">
              Create New Quiz
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New Quiz</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newQuiz.subject}
                    onChange={(e) => setNewQuiz({...newQuiz, subject: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newQuiz.duration}
                    onChange={(e) => setNewQuiz({...newQuiz, duration: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newQuiz.dueDate}
                    onChange={(e) => setNewQuiz({...newQuiz, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-6">
                {newQuiz.questions.map((question, qIndex) => (
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
                        <div key={oIndex} className="flex items-center gap-2">
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

              <Button 
                className="w-full"
                onClick={handleCreateQuiz}
              >
                Create Quiz
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{quiz.title}</h2>
                <p className="text-gray-600 mt-1">{quiz.subject}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                quiz.status === 'published' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {quiz.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Duration:</span>
                <br />
                <span className="font-medium">{quiz.duration} mins</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Questions:</span>
                <br />
                <span className="font-medium">{quiz.totalQuestions}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Due Date:</span>
                <br />
                <span className="font-medium">
                  {new Date(quiz.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Created:</span>
                <br />
                <span className="font-medium">
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => navigate(`/quiz/${quiz._id}/results`)}
                className="text-gray-600 hover:text-gray-900"
              >
                View Results
              </button>
              {/* <button
                onClick={() => navigate(`/quiz/${quiz._id}/edit`)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Edit Quiz
              </button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherQuizPage;
