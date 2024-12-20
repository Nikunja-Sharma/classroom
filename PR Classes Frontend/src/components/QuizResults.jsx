import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const QuizResults = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get(`/quiz/student/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuiz(response.data);
      } catch (error) {
        console.error('Error fetching quiz results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, [quizId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!quiz || !quiz.submission) {
    return <div className="text-center">Results not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.subject}</p>
          </div>
          <button
            onClick={() => navigate('/quizzes')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Quizzes
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-medium">{quiz.duration} minutes</span>
            </div>
            <div>
              <span className="text-gray-600">Total Questions:</span>
              <span className="ml-2 font-medium">{quiz.totalQuestions}</span>
            </div>
            <div>
              <span className="text-gray-600">Submitted:</span>
              <span className="ml-2 font-medium">
                {new Date(quiz.submission.submittedAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-gray-600">Score:</span>
              <span className="ml-2 font-medium">
                {quiz.submission.score}/{quiz.submission.totalScore}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Percentage:</span>
              <span className="ml-2 font-medium">
                {quiz.submission.percentage}%
              </span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 font-medium ${
                parseFloat(quiz.submission.percentage) >= 50 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {parseFloat(quiz.submission.percentage) >= 50 ? 'Passed' : 'Failed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Analysis</h2>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                Score Percentage
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-green-600">
                {quiz.submission.percentage}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
            <div
              style={{ width: `${quiz.submission.percentage}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults; 