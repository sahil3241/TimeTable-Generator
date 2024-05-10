import React, { useState } from 'react';
import Layout from '../../components/Layouts/Layout.js';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const TTGenerator = () => {
    const [timetable, setTimetable] = useState({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
    });


    const [latestStartTime, setLatestStartTime] = useState('09:30'); // Default to 9:30am
    const [latestEndTime, setLatestEndTime] = useState('17:30'); // Default to 4:30pm
    const [selectedDay, setSelectedDay] = useState('Monday'); // Default selected day

    const handleAddClass = (e) => {
        e.preventDefault();
        const day = selectedDay;
        const newStartTime = e.target.startTime.value || latestStartTime; // Use latest start time as default
        const newEndTime = e.target.endTime.value || latestEndTime; // Use latest end time as default
        const newSubject = e.target.subject.value;
        const newTeacher = e.target.teacher.value; // New field for teacher prefix

        // Check if the lunch break is being added
        if (newStartTime === '12:30' && newEndTime === '13:30') {
            toast.error('Cannot add a class during lunch break.');
            return;
        }

        const updatedTimetable = { ...timetable };
        updatedTimetable[day].push({ startTime: newStartTime, endTime: newEndTime, subject: newSubject || 'No subject', teacher: newTeacher }); // Include teacher prefix
        setTimetable(updatedTimetable);
        setLatestStartTime(newStartTime); // Update latest start time
        setLatestEndTime(newEndTime); // Update latest end time
        toast.success('Class added successfully.');
        e.target.reset();
    };

    const generatePDF = () => {
        const days = Object.keys(timetable);
        const doc = new jsPDF();
        doc.text("Timetable", 10, 10);
        const columns = ["Time", ...days];
        const rows = [];
        
        // Populate rows with timings and subjects
        for (let i = 9; i <= 17; i++) { // Loop for each hour from 9:00am to 5:00pm
            const hour = i.toString().padStart(2, '0'); // Format hour as HH
            const time = `${hour}:30`; // Format time as HH:30
            
            // Skip the last hour (17:30 - 18:30)
            if (hour === '17') {
                continue;
            }
            
            const nextTime = `${(i + 1).toString().padStart(2, '0')}:30`; // Format next hour as HH:30
            const row = [`${time} - ${nextTime}`];
            
            // Check if it's lunch break time (12:30 - 13:30)
            if (time === '12:30' || (time > '12:30' && time < '13:30')) {
                days.forEach(() => {
                    row.push('Lunch Break');
                });
            } else {
                days.forEach(day => {
                    const classes = timetable[day];
                    const classInfo = classes.find(classInfo => classInfo.startTime <= time && classInfo.endTime > time);
                    if (classInfo) {
                        row.push(`${classInfo.subject} (${classInfo.teacher})`); // Include teacher prefix in brackets
                    } else {
                        row.push('-'); // No class during this time
                    }
                });
            }
            
            rows.push(row);
        }
        
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 20, // Start table at y-position 20
            styles: {
                fontSize: 12, // Increase font size
                halign: 'center', // Center align text horizontally
                valign: 'middle', // Center align text vertically
                lineWidth: 0.5, // Set border line width
                lineColor: [0, 0, 0], // Set border line color (black)
                cellPadding: 2, // Increase cell padding for better appearance
            },
            columnStyles: {
                0: { cellWidth: 40 }, // Set width for the time column
            },
            margin: { top: 30 }, // Add top margin to the table
        });
        doc.save("timetable.pdf");
    };

    const generateAutomaticPDF = () => {
        const days = Object.keys(timetable);
        const doc = new jsPDF();
        doc.text("Timetable", 10, 10);
        const columns = ["Time", ...days];
        const rows = [];
    
        // Extract subjects from the timetable
        const subjects = [];
        days.forEach(day => {
            timetable[day].forEach(classInfo => {
                if (classInfo.subject !== 'No subject') {
                    subjects.push({ subject: classInfo.subject, teacher: classInfo.teacher, day: day });
                }
            });
        });
    
        // Initialize an object to keep track of subjects placed on each day
        const subjectsPlaced = {};
        days.forEach(day => {
            subjectsPlaced[day] = [];
        });
    
        // Populate rows with timings and subjects
        for (let i = 9; i <= 17; i++) { // Loop for each hour from 9:00am to 5:00pm
            const hour = i.toString().padStart(2, '0'); // Format hour as HH
            const time = `${hour}:30`; // Format time as HH:30
    
            // Skip the last hour (17:30 - 18:30)
            if (hour === '17') {
                continue;
            }
    
            const nextTime = `${(i + 1).toString().padStart(2, '0')}:30`; // Format next hour as HH:30
            const row = [`${time} - ${nextTime}`];
    
            // Check if it's lunch break time (12:30 - 13:30)
            if (time === '12:30' || (time > '12:30' && time < '13:30')) {
                days.forEach(() => {
                    row.push('Lunch Break');
                });
            } else {
                days.forEach(day => {
                    const classes = timetable[day];
                    const classInfo = classes.find(classInfo => classInfo.startTime <= time && classInfo.endTime > time);
                    if (classInfo && classInfo.subject !== 'No subject') {
                        row.push(`${classInfo.subject} (${classInfo.teacher})`); // Include teacher prefix in brackets
                    } else {
                        // Insert dashes randomly between subjects
                        const shouldInsertDash = Math.random() < 0.2; // Adjust the probability as needed
                        if (shouldInsertDash) {
                            row.push('-');
                        } else {
                            // Filter out subjects already placed for the day
                            const availableSubjects = subjects.filter(subject => subject.day !== day && !subjectsPlaced[day].includes(subject.subject));
                            if (availableSubjects.length > 0) {
                                const randomIndex = Math.floor(Math.random() * availableSubjects.length);
                                const selectedSubject = availableSubjects[randomIndex];
                                row.push(`${selectedSubject.subject} (${selectedSubject.teacher})`);
                                subjectsPlaced[day].push(selectedSubject.subject);
                            } else {
                                row.push('-'); // No available subject to place
                            }
                        }
                    }
                });
            }
    
            rows.push(row);
        }
    
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 20, // Start table at y-position 20
            styles: {
                fontSize: 12, // Increase font size
                halign: 'center', // Center align text horizontally
                valign: 'middle', // Center align text vertically
                lineWidth: 0.5, // Set border line width
                lineColor: [0, 0, 0], // Set border line color (black)
                cellPadding: 2, // Increase cell padding for better appearance
            },
            columnStyles: {
                0: { cellWidth: 40 }, // Set width for the time column
            },
            margin: { top: 30 }, // Add top margin to the table
        });
        doc.save("autotimetable.pdf");
    };
    
    
    const handleDayChange = (e) => {
        setSelectedDay(e.target.value);
    };

    const handleReset = () => {
        window.location.reload(); // Reload the page to reset the form
    };

    return (
        <Layout title={'Timetable Generator'}>
            <div className='form-container'>
                <h1>Timetable Generator</h1>
                <form onSubmit={handleAddClass}>
                    <div className="mb-3">
                        <label htmlFor="day">Select Day:</label>
                        <select id="day" name="day" value={selectedDay} onChange={handleDayChange} className="form-select">
                            {Object.keys(timetable).map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="startTime">Start Time:</label>
                        <input type="time" name="startTime" className="form-control" id="startTime" defaultValue={latestStartTime}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="endTime">End Time:</label>
                        <input type="time" name="endTime" className="form-control" id="endTime" defaultValue={latestEndTime}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="subject">Subject Name:</label>
                        <input type="text" name="subject" className="form-control" id="subject" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="teacher">Teacher Prefix:</label> {/* New input field for teacher prefix */}
                        <input type="text" name="teacher" className="form-control" id="teacher" />
                    </div>
                    <button type="submit" className="btn btn-primary me-2">Add Class</button>
                    <button onClick={generatePDF} className="btn btn-success me-2">Generate TT</button>
                    <button onClick={generateAutomaticPDF} className="btn btn-success me-2">Generate Automatic TT</button>
                    <button type="reset" onClick={handleReset} className="btn btn-secondary">Reset</button>
                </form>
            </div>
        </Layout>
    );
    
    
};

export default TTGenerator;