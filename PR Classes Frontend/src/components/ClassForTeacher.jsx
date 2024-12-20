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

const ClassForTeacher = () => {
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    className: '',
    courseCode: '',
    department: '',
    schedule: [{
      day: 'Monday',
      startTime: '',
      endTime: '',
      room: ''
    }],
    semester: '',
    academicYear: '',
    description: '',
    maxStudents: 30
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('/class/teacher', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data.classes);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token');
      await axios.post('/class', newClass, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewClass({
        className: '',
        courseCode: '',
        department: '',
        schedule: [{
          day: 'Monday',
          startTime: '',
          endTime: '',
          room: ''
        }],
        semester: '',
        academicYear: '',
        description: '',
        maxStudents: 30
      });
      setIsSheetOpen(false);
      fetchClasses();
      toast({
        title: "Success",
        description: "Class created successfully",
      });
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive",
      });
    }
  };

  const updateSchedule = (index, field, value) => {
    const newSchedule = [...newClass.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setNewClass({ ...newClass, schedule: newSchedule });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Classes</h1>
          {summary && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="mr-4">Total Classes: {summary.totalClasses}</span>
              <span className="mr-4">Active Classes: {summary.activeClasses}</span>
              <span>Total Students: {summary.totalStudents}</span>
            </div>
          )}
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>Create Class</Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New Class</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleCreateClass} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  value={newClass.className}
                  onChange={(e) => setNewClass({...newClass, className: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="courseCode">Course Code</Label>
                <Input
                  id="courseCode"
                  value={newClass.courseCode}
                  onChange={(e) => setNewClass({...newClass, courseCode: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={newClass.department}
                  onChange={(e) => setNewClass({...newClass, department: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Schedule</Label>
                {newClass.schedule.map((schedule, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      placeholder="Start Time (HH:MM)"
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                      required
                    />
                    <Input
                      placeholder="End Time (HH:MM)"
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Room"
                      value={schedule.room}
                      onChange={(e) => updateSchedule(index, 'room', e.target.value)}
                      required
                    />
                    <select
                      className="border rounded-md p-2"
                      value={schedule.day}
                      onChange={(e) => updateSchedule(index, 'day', e.target.value)}
                      required
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  value={newClass.semester}
                  onChange={(e) => setNewClass({...newClass, semester: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={newClass.academicYear}
                  onChange={(e) => setNewClass({...newClass, academicYear: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newClass.description}
                  onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={newClass.maxStudents}
                  onChange={(e) => setNewClass({...newClass, maxStudents: parseInt(e.target.value)})}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Create Class</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <div
            key={classItem._id}
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <h3 className="text-xl font-semibold">{classItem.className}</h3>
            <p className="text-gray-600">{classItem.courseCode}</p>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Department: {classItem.department}</p>
              <p className="text-sm text-gray-500">
                {classItem.semester} - {classItem.academicYear}
              </p>
              <p className="text-sm text-gray-500">
                Students: {classItem.students.length}/{classItem.maxStudents}
              </p>
            </div>
            <div className="mt-3">
              <p className="font-medium">Schedule:</p>
              {classItem.schedule.map((sch, index) => (
                <p key={index} className="text-sm text-gray-600">
                  {sch.day}: {sch.startTime} - {sch.endTime} (Room {sch.room})
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassForTeacher
