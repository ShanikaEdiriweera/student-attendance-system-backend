import express from 'express';

import students from './app/controllers/student.controller';
import attendance from './app/controllers/attendance.controller';
import AuthController from './app/controllers/AuthController';

const publicRoutes = express.Router();
const authenticatedRoutes = express.Router();
// var adminRoutes = express.Router();

// Public Routes 
// =============
publicRoutes.post('/register', AuthController.registerUser);
publicRoutes.post('/login', AuthController.loginUser);

/**
 * Verify pin number with student indexNo
 * Consumed by ideamart server
 * Query params: pin
 */
publicRoutes.get('/students/:studentId/verifyPin', students.verifyPin);

// student controller routes
// Create a new Student
// publicRoutes.post('/students', students.create);
// Retrieve all Students
// publicRoutes.get('/students', students.findAll);
// Retrieve a single Student with id
// publicRoutes.get('/students/:id', students.findOne);
// Update a Student with id
// publicRoutes.put('/students/:id', students.update);
// Delete a Student with object id
// publicRoutes.delete('/students/:id', students.delete);

// Retrieve a single Student with student index no.
// publicRoutes.get('/students/:studentId', students.findOneByStudentId);
// Update a Student with student index no.
// publicRoutes.put('/students/:studentId', students.updateByStudentId);
// Create a multiple Students
// publicRoutes.post('/students/multiple', students.createMultiple);
// Retrieve a single Student with student RFID
// publicRoutes.get('/students/rfid/:rfid', students.findOneByRFID);

// Authenticated Routes
// ====================

// student controller routes
// -------------------------
/**
 * Create a new Student
 */
authenticatedRoutes.post('/students', students.create);
/**
 * Retrieve all Students
 * If query param 'updatedAfter: DateTime' given, get students added/updated after given time
 * If query param 'class: String' or 'grade: String' given, get students in given class or grade
 */
authenticatedRoutes.get('/students', students.findAll);
// Retrieve a single Student with id
// authenticatedRoutes.get('/students/:id', students.findOne);
// Update a Student with id
// authenticatedRoutes.put('/students/:id', students.update);
/**
 * Delete a Student with object id
 */
// authenticatedRoutes.delete('/students/:id', students.delete);

/**
 * Update a Student with student index no.
 */
authenticatedRoutes.put('/students/:studentId', students.updateByStudentId);
/**
 * Create multiple Students
 */
authenticatedRoutes.post('/students/multiple', students.createMultiple);
/**
 * Update multiple Students
 */
authenticatedRoutes.put('/students', students.updateMultiple);
/**
 * Retrieve a single Student with student RFID
 */
authenticatedRoutes.get('/students/rfid/:rfid', students.findOneByRFID);
/**
 * Retrieve all Students - Populate Attendance
 * Query params 'from: Date' or 'to: Date'  can be given
 */
authenticatedRoutes.post('/students/attendance', students.getAllWithAttendance);
/**
 * Retrieve a Student with student index no. - Populate Attendance
 * Query params 'from: Date' or 'to: Date'  can be given
 */
authenticatedRoutes.get('/students/:studentId/attendance', students.getStudentWithAttendance);
/**
 * Increment grade of all students
 * Query params 'grade: String' or, 'class' and 'grade' can be given
 */
authenticatedRoutes.get('/students/incrementGrade', students.incrementGrade);
/**
 * Retrieve a single Student with student index no.
 */
authenticatedRoutes.get('/students/:studentId', students.findOneByStudentId);

// attendance controller routes
// ----------------------------
/**
 * Create a new Attendance record
 */
authenticatedRoutes.post('/attendance', attendance.create);
/**
 * Retrieve all Attendance records
 * Query params 'from: Date' or 'to: Date'  can be given
 */
authenticatedRoutes.get('/attendance', attendance.findAll);
/**
 * Delete a Attedance record with object id
 */
// authenticatedRoutes.delete('/attendance/:id', attendance.delete);

/**
 * Create a multiple Attendance records
 */
authenticatedRoutes.post('/attendance/multiple', attendance.createMultiple);

/**
 * Get Attendance report - student count of school, grade, class 
 * Query param 'date: Date' can be given
 */
authenticatedRoutes.get('/attendance/report', attendance.getReport);

// Admin Routes
// ============

module.exports = {
    public: publicRoutes,
    protected: authenticatedRoutes,
    // admin: adminRoutes,
};