import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import FileUploadModal from './FileUploadModal';

const Assignments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [assignments, setAssignments] = useState({
    submitted: [],
    pending: [],
    overdue: []
  });
  const [summary, setSummary] = useState(null);
  const [currentAssignmentId, setCurrentAssignmentId] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('/assignment/student', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssignments({
          submitted: response.data.submitted,
          pending: response.data.pending,
          overdue: response.data.overdue
        });
        setSummary(response.data.summary);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };

    fetchAssignments();
  }, []);

  const handleFileSubmit = (file) => {
    console.log('File submitted:', file);
    setSubmitted(true);
    setTimeout(() => {
      alert('Assignment submitted successfully!');
      setSubmitted(false);
    }, 500);
  };

  const renderAssignmentList = (assignmentList, status) => (
    <>
      <h2 className="text-xl font-semibold mb-4 capitalize">{status} Assignments</h2>
      <div className="grid gap-6 mb-8">
        {assignmentList.map((assignment) => (
          <div
            key={assignment._id}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{assignment.title}</h2>
                <p className="text-gray-600 mt-1">{assignment.subject}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  assignment.status === 'submitted'
                    ? 'bg-green-100 text-green-800'
                    : assignment.status === 'overdue'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {assignment.status}
              </span>
            </div>
            <p className="mt-4 text-gray-700">{assignment.description}</p>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </div>
              <div className="flex space-x-3">
                {assignment.submission?.fileUrl && (
                  <a 
                    href={assignment.submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Download Submission
                  </a>
                )}
                {assignment.status === 'pending' && (
                  <button
                    onClick={() => {
                      setIsModalOpen(true);
                      setCurrentAssignmentId(assignment._id);
                    }}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Assignments</h1>
        {summary && (
          <div className="flex gap-4">
            <span>Total: {summary.total}</span>
            <span className="text-green-600">Submitted: {summary.submitted}</span>
            <span className="text-yellow-600">Pending: {summary.pending}</span>
            <span className="text-red-600">Overdue: {summary.overdue}</span>
          </div>
        )}
      </div>

      {renderAssignmentList(assignments.submitted, 'submitted')}
      {renderAssignmentList(assignments.pending, 'pending')}
      {renderAssignmentList(assignments.overdue, 'overdue')}

      <FileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFileSubmit}
        assignmentId={currentAssignmentId}
      />
    </div>
  );
};

export default Assignments;