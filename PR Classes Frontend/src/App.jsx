import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import ClassRoom from './components/Classroom';
import Assignments from './components/Assignments';
import Quizzes from './components/Quizzes';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import QuizPage from './components/QuizPage';
import QuizResults from './components/QuizResults';
import TeacherQuizPage from './components/TeacherQuizPage';
import EditQuizPage from './components/EditQuizPage';
import { Toaster } from './components/ui/toaster';
import TeacherAssignments from './components/TeacherAssignments';
import ClassForTeacher from './components/ClassForTeacher';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ClassroomDetail from './components/ClassroomDetail';

function AppLayout({ children }) {
  const location = useLocation();

  const excludedRoutes = ['/login', '/'];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {!excludedRoutes.includes(location.pathname) && <Sidebar />}
      <div className={excludedRoutes.includes(location.pathname) ? "flex-1" : "flex-1 ml-64"}>
        {!excludedRoutes.includes(location.pathname) && <Navbar />}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/classroom" element={<ClassRoom />} />
          <Route path="/classroom/:id" element={<ClassroomDetail />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/quiz/:quizId" element={<QuizPage />} />
          <Route path="/quiz/:quizId/results" element={<QuizResults />} />
          <Route path="/profile" element={<Profile />} />


          <Route path="/teacher-quizzes" element={<TeacherQuizPage />} />
          <Route path="/quiz/:id/edit" element={<EditQuizPage />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          {/* <Route path="/teacher-classroom/:id" element={<TeacherClassroom />} /> */}
          <Route path="/teacher-assignment" element={<TeacherAssignments />} />
          <Route path="/teacher-classroom" element={<ClassForTeacher />} />
          {/* <Route path="/teacher-quizzes" element={<TeacherQuizzes />} /> */}
            
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
