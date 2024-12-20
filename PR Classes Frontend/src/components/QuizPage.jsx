import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from './Modal';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get(`/quiz/student/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuiz(response.data);
        // Initialize answers object with empty values
        const initialAnswers = {};
        response.data.questions.forEach(question => {
          initialAnswers[question._id] = '';
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const token = Cookies.get('token');
      
      // Transform answers object into the required format
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption
      }));

      await axios.post(`/quiz/${quizId}/submit`, 
        { answers: formattedAnswers },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      navigate('/quizzes');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
    setIsModalOpen(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!quiz) {
    return <div className="text-center">Quiz not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Subject: {quiz.subject}</span>
          <span>Duration: {quiz.duration} mins</span>
          <span>Total Points: {quiz.questions.reduce((sum, q) => sum + q.points, 0)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((question) => (
          <div key={question._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-medium">{question.questionText}</h2>
              <span className="text-sm text-gray-600">Points: {question.points}</span>
            </div>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label key={option._id} className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name={`question-${question._id}`}
                    value={option._id}
                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    checked={answers[question._id] === option._id}
                    className="mr-3"
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate('/quizzes')}
            className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Submit Quiz
          </button>
        </div>
      </form>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        message="Are you sure you want to submit this quiz? You cannot change your answers after submission."
      />
    </div>
  );
};

export default QuizPage;