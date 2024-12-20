import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Quizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState({
    submitted: [],
    pending: [],
    overdue: []
  });
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('/quiz/student/quizzes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuizzes({
          submitted: response.data.submitted,
          pending: response.data.pending,
          overdue: response.data.overdue
        });
        setSummary(response.data.summary);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, []);

  const renderQuizList = (quizList, status) => (
    <>
      <h2 className="text-xl font-semibold mb-4 capitalize">{status} Quizzes</h2>
      <div className="grid gap-6 mb-8">
        {quizList.map((quiz) => (
          <div
            key={quiz._id}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{quiz.title}</h2>
                <p className="text-gray-600 mt-1">{quiz.subject}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  quiz.status === 'submitted'
                    ? 'bg-green-100 text-green-800'
                    : quiz.status === 'overdue'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {quiz.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
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
            </div>

            {quiz.status === 'completed' && quiz.submission && (
              <div className="mt-4 bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-green-800">
                      Score: {quiz.submission.score}/{quiz.submission.totalScore} ({quiz.submission.percentage}%)
                    </span>
                    <br />
                    <span className="text-sm text-gray-600">
                      Submitted: {new Date(quiz.submission.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  <button 
                    onClick={() => navigate(`/quiz/${quiz._id}/results`)}
                    className="text-green-700 hover:text-green-900"
                  >
                    View Results
                  </button>
                </div>
              </div>
            )}

            {quiz.status === 'pending' && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => navigate(`/quiz/${quiz._id}`)}
                  className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600"
                >
                  Start Quiz
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        {summary && (
          <div className="flex gap-4">
            <span>Total: {summary.total}</span>
            <span className="text-green-600">Submitted: {summary.submitted}</span>
            <span className="text-yellow-600">Pending: {summary.pending}</span>
            <span className="text-red-600">Overdue: {summary.overdue}</span>
            {summary.averageScore && (
              <span className="text-blue-600">Average Score: {summary.averageScore}%</span>
            )}
          </div>
        )}
      </div>

      {renderQuizList(quizzes.submitted, 'submitted')}
      {renderQuizList(quizzes.pending, 'pending')}
      {renderQuizList(quizzes.overdue, 'overdue')}
    </div>
  );
};

export default Quizzes;