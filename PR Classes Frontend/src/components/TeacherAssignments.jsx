import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: ''
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('/assignment/teacher', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token');
      await axios.post('/assignment', newAssignment, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewAssignment({
        title: '',
        subject: '',
        description: '',
        dueDate: ''
      });
      setIsSheetOpen(false);
      fetchAssignments();
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>Create Assignment</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create New Assignment</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleCreateAssignment} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newAssignment.subject}
                  onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Create Assignment</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <div
            key={assignment._id}
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{assignment.title}</h3>
                <p className="text-gray-600">{assignment.subject}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Due: {format(new Date(assignment.dueDate), 'PPP')}
                </p>
                <p className="text-sm text-gray-500">
                  Submissions: {assignment.submissions.length}
                </p>
              </div>
            </div>
            <p className="mt-2 text-gray-700">{assignment.description}</p>
            
            {assignment.submissions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Submissions:</h4>
                <div className="space-y-2">
                  {assignment.submissions.map((submission) => (
                    <div key={submission._id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div>
                        <p className="font-medium">{submission.student.fullName || submission.student.email}</p>
                        <p className="text-sm text-gray-500">
                          Submitted: {format(new Date(submission.submittedAt), 'PPP')}
                        </p>
                      </div>
                      <a
                        href={submission.submissionFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Submission
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherAssignments;
