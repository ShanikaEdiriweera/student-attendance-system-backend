import moment from 'moment';
import Student from '../models/student.model';
import NumberUtil from '../util/numberUtil';
import winston from '../../config/winston';
import { response } from 'express';

module.exports = {
    // Create and Save a new Student
    create: (req, res) => {
        let req_JSON_student = req.body;
        // Validate request
        if( !req_JSON_student.indexNo || 
            // !req_JSON_student.initials ||
            // !req_JSON_student.lastName ||
            !req_JSON_student.fullName ||
            !req_JSON_student.DOB ||
            !req_JSON_student.gender ||
            // !req_JSON_student.class ||
            !req_JSON_student.address ||
            !req_JSON_student.grade ||
            !req_JSON_student.section ||
            !req_JSON_student.medium ||
            // !req_JSON_student.homeTel ||
            !req_JSON_student.contactNo1 ) {
            
            return res.status(400).send({
                message: "Required Student details can not be empty"
            });
        }
        winston.debug("dob1: "+ req_JSON_student.DOB);
        // vaidate DOB
        let DOB = moment(req_JSON_student.DOB, ["YYYY-MM-DD", "D/M/YYYY", "DD/MM/YYYY"], true);
        if (DOB.isValid()) DOB = DOB.format('YYYY-MM-DD');
        else return res.status(400).send({ message: "Invalid date format for DOB" });
        winston.debug("dob2: "+ DOB);

        // Create a Student
        const student = new Student({
            indexNo: req_JSON_student.indexNo,     
            rfid: req_JSON_student.rfid,     
            ideamartPin: NumberUtil.generatePin(5),
            // initials: req_JSON_student.initials,  
            // lastName: req_JSON_student.lastName,  
            nameWithInitials: req_JSON_student.nameWithInitials,
            fullName: req_JSON_student.fullName,  
            DOB: DOB,
            gender: req_JSON_student.gender,
            // class: req_JSON_student.class,
            profilePicture: req_JSON_student.profilePicture, 
            address: req_JSON_student.address,
            grade: req_JSON_student.grade,
            section: req_JSON_student.section,
            medium: req_JSON_student.medium,
        
            // homeTel: req_JSON_student.homeTel,
            contactNo1: req_JSON_student.contactNo1,
            contactNo2: req_JSON_student.contactNo2,
            guardianName: req_JSON_student.guardianName,
            guardianAddress: req_JSON_student.guardianAddress,
            guardianRelationship: req_JSON_student.guardianRelationship,
            // guardianContact: req_JSON_student.guardianContact, 
        
            specialCare: req_JSON_student.specialCare, // whether the student need special care or not
            specialCareInfo: req_JSON_student.specialCareInfo,
        
            active: req_JSON_student.active,
            verified: req_JSON_student.verified,
        });

        // Save Student in the database
        student.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            winston.error("error: ", err)
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Student.",
                error: err.code
            });
        });
    },

    /**
     * Retrieve and return all Students from the database
     * If query param 'updatedAfter: DateTime' given, get students added/updated after given time
     * If query param 'class: String' or 'grade: String' given, get students in given class or grade
     * Query parameter precedence - updatedAfter > grade > class
     */
    findAll: (req, res) => {
        if (req.query.updatedAfter) {
            const updatedAfter = new Date(req.query.updatedAfter);
            winston.info("Students updatedAfter: "+ updatedAfter)
            if (!moment(updatedAfter).isValid()) return res.status(400).send({ 
                message: "Query parameter 'updatedAfter' should be a valid timestamp/date string."
            });
            Student.find({ updatedAt: {$gte: moment(updatedAfter)}}, '-attendance')
            .then(students => {
                res.send(students);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving students."
                });
            });
        } else if (req.query.grade) {
            const grade = req.query.grade;
            winston.info("Students in grade: "+ grade)
            // TODO: validate grade
            Student.find({ grade }, '-attendance')
            .then(students => {
                res.send(students);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving students."
                });
            });
        } else if (req.query.class) {
            const studentClass = req.query.class;
            winston.info("Students in class: "+ studentClass)
            // TODO: validate class
            Student.find({ section: studentClass }, '-attendance')
            .then(students => {
                res.send(students);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving students."
                });
            });
        } else {
            Student.find({}, '-attendance')
            .then(students => {
                res.send(students);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving students."
                });
            });
        }
    },

    // Find a single Student with object id
    // findOne: (req, res) => {
    //     Student.findById(req.params.id)
    //     .then(student => {
    //         if(!student) {
    //             return res.status(404).send({
    //                 message: "Student not found with id " + req.params.id
    //             });            
    //         }
    //         res.send(student);
    //     }).catch(err => {
    //         if(err.kind === 'ObjectId') {
    //             return res.status(404).send({
    //                 message: "Student not found with id " + req.params.id
    //             });                
    //         }
    //         return res.status(500).send({
    //             message: "Error retrieving Student with id " + req.params.id
    //         });
    //     });
    // },

    // Update a Student identified by the object id in the request
    // update: (req, res) => {
    //     const req_JSON_student = req.body;
    //     // Validate Request
    //     if(!req_JSON_student) {
    //         return res.status(400).send({
    //             message: "Request body can not be empty"
    //         });
    //     }

    //     let updatedStudent = {};

    //     if (req_JSON_student.rfid) updatedStudent.rfid = req_JSON_student.rfid;
    //     if (req_JSON_student.initials) updatedStudent.initials = req_JSON_student.initials;
    //     if (req_JSON_student.lastName) updatedStudent.lastName = req_JSON_student.lastName;
    //     if (req_JSON_student.fullName) updatedStudent.fullName = req_JSON_student.fullName;
    //     if (req_JSON_student.DOB) updatedStudent.DOB = req_JSON_student.DOB;
    //     if (req_JSON_student.gender) updatedStudent.gender = req_JSON_student.gender;
    //     if (req_JSON_student.profilePicture) updatedStudent.profilePicture = req_JSON_student.profilePicture;
    //     if (req_JSON_student.address) updatedStudent.address = req_JSON_student.address;
    //     if (req_JSON_student.grade) updatedStudent.grade = req_JSON_student.grade;
    //     if (req_JSON_student.section) updatedStudent.section = req_JSON_student.section;
    //     if (req_JSON_student.medium) updatedStudent.medium = req_JSON_student.medium;
    //     if (req_JSON_student.homeTel) updatedStudent.homeTel = req_JSON_student.homeTel;
    //     if (req_JSON_student.guardianName) updatedStudent.guardianName = req_JSON_student.guardianName;
    //     if (req_JSON_student.guardianAddress) updatedStudent.guardianAddress = req_JSON_student.guardianAddress;
    //     if (req_JSON_student.guardianRelationship) updatedStudent.guardianRelationship = req_JSON_student.guardianRelationship;
    //     if (req_JSON_student.guardianContact) updatedStudent.guardianContact = req_JSON_student.guardianContact;
    //     if (req_JSON_student.specialCare) updatedStudent.specialCare = req_JSON_student.specialCare;
    //     if (req_JSON_student.specialCareInfo) updatedStudent.specialCareInfo = req_JSON_student.specialCareInfo;
    //     if (req_JSON_student.active) updatedStudent.active = req_JSON_student.active;
    //     if (req_JSON_student.verified) updatedStudent.verified = req_JSON_student.verified;

    //     // Find student and update it with the request body
    //     Student.findByIdAndUpdate(req.params.id, updatedStudent, {new: true})
    //     .then(student => {
    //         if(!student) {
    //             return res.status(404).send({
    //                 message: "Student not found with id " + req.params.id
    //             });
    //         }
    //         res.send(student);
    //     }).catch(err => {
    //         if(err.kind === 'ObjectId') {
    //             return res.status(404).send({
    //                 message: "Student not found with id " + req.params.id
    //             });                
    //         }
    //         return res.status(500).send({
    //             message: "Error updating Student with id " + req.params.id
    //         });
    //     });
    // },

    // Delete a Student with the specified object id in the request
    delete: (req, res) => {
        Student.findByIdAndRemove(req.params.id)
        .then(student => {
            if(!student) {
                return res.status(404).send({
                    message: "Student not found with id " + req.params.id
                });
            }
            res.send({message: "Student deleted successfully!"});
        }).catch(err => {
            if(err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "Student not found with id " + req.params.id
                });                
            }
            return res.status(500).send({
                message: "Could not delete Student with id " + req.params.id
            });
        });
    },

    // Find a single Student with Index no.
    findOneByStudentId: (req, res) => {
        const studnetIndexNo = req.params.studentId;
        Student.findOne({ indexNo: studnetIndexNo }, '-attendance')
        .then(student => {
            if(!student) {
                return res.status(404).send({
                    message: "Student not found with Index No. " + studnetIndexNo
                });            
            }
            res.send(student);
        }).catch(err => {
            //TODO: check correctness
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Student not found with Index No. " + studnetIndexNo
                });                
            }
            return res.status(500).send({
                message: "Error retrieving Student with Index No. " + studnetIndexNo
            });
        });
    },

    // Update a Student identified by the index no. in the request
    updateByStudentId: (req, res) => {
        const req_JSON_student = req.body;
        const studnetIndexNo = req.params.studentId;
        // Validate Request
        if(!req_JSON_student) {
            return res.status(400).send({
                message: "Request body can not be empty"
            });
        }

        // vaidate DOB
        let DOB = moment(req_JSON_student.DOB, ["YYYY-MM-DD", "D/M/YYYY", "DD/MM/YYYY"], true);
        if (req_JSON_student.DOB && DOB.isValid()) DOB = DOB.format('YYYY-MM-DD');
        else if (req_JSON_student.DOB) return res.status(400).send({ message: "Invalid date format for DOB" });

        let updatedStudent = {};

        if (req_JSON_student.rfid) updatedStudent.rfid = req_JSON_student.rfid;
        // if (req_JSON_student.initials) updatedStudent.initials = req_JSON_student.initials;
        // if (req_JSON_student.lastName) updatedStudent.lastName = req_JSON_student.lastName;
        if (req_JSON_student.nameWithInitials) updatedStudent.nameWithInitials = req_JSON_student.nameWithInitials;
        if (req_JSON_student.fullName) updatedStudent.fullName = req_JSON_student.fullName;
        if (req_JSON_student.DOB) updatedStudent.DOB = DOB;
        if (req_JSON_student.gender) updatedStudent.gender = req_JSON_student.gender;
        if (req_JSON_student.profilePicture) updatedStudent.profilePicture = req_JSON_student.profilePicture;
        if (req_JSON_student.address) updatedStudent.address = req_JSON_student.address;
        if (req_JSON_student.grade) updatedStudent.grade = req_JSON_student.grade;
        // if (req_JSON_student.class) updatedStudent.class = req_JSON_student.class;
        if (req_JSON_student.section) updatedStudent.section = req_JSON_student.section;
        if (req_JSON_student.medium) updatedStudent.medium = req_JSON_student.medium;
        // if (req_JSON_student.homeTel) updatedStudent.homeTel = req_JSON_student.homeTel;
        if (req_JSON_student.contactNo1) updatedStudent.contactNo1 = req_JSON_student.contactNo1;
        if (req_JSON_student.contactNo2) updatedStudent.contactNo2 = req_JSON_student.contactNo2;
        if (req_JSON_student.guardianName) updatedStudent.guardianName = req_JSON_student.guardianName;
        if (req_JSON_student.guardianAddress) updatedStudent.guardianAddress = req_JSON_student.guardianAddress;
        if (req_JSON_student.guardianRelationship) updatedStudent.guardianRelationship = req_JSON_student.guardianRelationship;
        // if (req_JSON_student.guardianContact) updatedStudent.guardianContact = req_JSON_student.guardianContact;
        if (req_JSON_student.specialCare) updatedStudent.specialCare = req_JSON_student.specialCare;
        if (req_JSON_student.specialCareInfo) updatedStudent.specialCareInfo = req_JSON_student.specialCareInfo;
        if (req_JSON_student.active) updatedStudent.active = req_JSON_student.active;
        if (req_JSON_student.verified) updatedStudent.verified = req_JSON_student.verified;

        // Find student and update it with the request body
        Student.findOneAndUpdate({ indexNo: studnetIndexNo }, updatedStudent, { new: true, projection: '-attendance' })
        .then(student => {
            if(!student) {
                return res.status(404).send({
                    message: "Student not found with Index No. " + studnetIndexNo
                });
            }
            res.send(student);
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Student not found with Index No. " + studnetIndexNo
                });                
            }
            return res.status(500).send({
                message: "Error updating Student with Index No. " + studnetIndexNo
            });
        });
    },

    // Create and Save a multiple Students
    createMultiple: async (req, res) => {
        const req_JSON = req.body;

        // Validate request
        if( !req_JSON || 
            !req_JSON.students ||
            req_JSON.students.length === 0 ) {
            
            return res.status(400).send({
                message: "Required request data can not be empty"
            });
        }

        const req_students = req_JSON.students;
        let students_res = [];
        // Validate student objects
        for (let [index, req_JSON_student] of req_students.entries()) {
            if( !req_JSON_student.indexNo || 
                // !req_JSON_student.initials ||
                // !req_JSON_student.lastName ||
                !req_JSON_student.fullName ||
                !req_JSON_student.DOB ||
                !req_JSON_student.gender ||
                // !req_JSON_student.class ||
                !req_JSON_student.address ||
                !req_JSON_student.grade ||
                !req_JSON_student.section ||
                !req_JSON_student.medium ||
                // !req_JSON_student.homeTel ||
                !req_JSON_student.contactNo1 ) {
                
                return res.status(400).send({
                    message: `Required Student details can not be empty on no. ${index} student`,
                    studentWithError: req_JSON_student,
                    indexWithError: index,
                    savedStudents: students_res
                });
            }

            // vaidate DOB
            let DOB = moment(req_JSON_student.DOB, ["YYYY-MM-DD", "D/M/YYYY", "DD/MM/YYYY"], true);
            if (DOB.isValid()) DOB = DOB.format('YYYY-MM-DD');
            else return res.status(400).send({ 
                message: `Invalid date format for DOB for no. ${index} student`, 
                studentWithError: req_JSON_student,
                indexWithError: index,
                savedStudents: students_res
            });
            
            try {
                // Create a Student
                let student = new Student({
                    indexNo: req_JSON_student.indexNo,     
                    rfid: req_JSON_student.rfid,     
                    ideamartPin: NumberUtil.generatePin(5),
                    // initials: req_JSON_student.initials,  
                    // lastName: req_JSON_student.lastName,  
                    nameWithInitials: req_JSON_student.nameWithInitials,  
                    fullName: req_JSON_student.fullName,  
                    DOB: DOB,
                    gender: req_JSON_student.gender,
                    profilePicture: req_JSON_student.profilePicture, 
                    address: req_JSON_student.address,
                    grade: req_JSON_student.grade,
                    // class: req_JSON_student.class,
                    section: req_JSON_student.section,
                    medium: req_JSON_student.medium,
                
                    // homeTel: req_JSON_student.homeTel,
                    contactNo1: req_JSON_student.contactNo1,
                    contactNo2: req_JSON_student.contactNo2,
                    guardianName: req_JSON_student.guardianName,
                    guardianAddress: req_JSON_student.guardianAddress,
                    guardianRelationship: req_JSON_student.guardianRelationship,
                    // guardianContact: req_JSON_student.guardianContact, 
                
                    specialCare: req_JSON_student.specialCare, // whether the student need special care or not
                    specialCareInfo: req_JSON_student.specialCareInfo,
                
                    active: req_JSON_student.active,
                    verified: req_JSON_student.verified,
                });

                // Save Student in the database
                let savedStudent = await student.save();
                students_res.push(savedStudent);
            } catch (err) {
                return res.status(500).send({
                    message: err.message || "Some error occurred while creating the Student.",
                    studentWithError: req_JSON_student,
                    indexWithError: index,
                    savedStudents: students_res
                });
            }
        }
        return res.send({
            message: "SUCCESS",
            noOfSavedStudents: students_res.length,
            savedStudents: students_res
        });
    },

    // Create and Save a multiple Students
    updateMultiple: async (req, res) => {
        const req_JSON = req.body;

        // Validate request
        if( !req_JSON || 
            !req_JSON.students ||
            req_JSON.students.length === 0 ) {
            
            return res.status(400).send({
                message: "Required request data can not be empty"
            });
        }
    
        const req_students = req_JSON.students;
        let students_res = [];
        // Validate student objects
        for (let [index, req_JSON_student] of req_students.entries()) {
            if( !req_JSON_student.indexNo ) {
                
                return res.status(400).send({
                    message: `Required Student details can not be empty on no. ${index} student`,
                    studentWithError: req_JSON_student,
                    indexWithError: index,
                    savedStudents: students_res
                });
            }
    
            // vaidate DOB
            let DOB;
            if (req_JSON_student.DOB) {
                DOB = moment(req_JSON_student.DOB, ["YYYY-MM-DD", "D/M/YYYY", "DD/MM/YYYY"], true);
                if (DOB.isValid()) DOB = DOB.format('YYYY-MM-DD');
                else return res.status(400).send({ 
                    message: `Invalid date format for DOB for no. ${index} student`, 
                    studentWithError: req_JSON_student,
                    indexWithError: index,
                    savedStudents: students_res
                });
            }
            
            const studnetIndexNo = req_JSON_student.indexNo;
            try {
                let updatedStudent = {};
    
                if (req_JSON_student.rfid) updatedStudent.rfid = req_JSON_student.rfid;
                if (req_JSON_student.nameWithInitials) updatedStudent.nameWithInitials = req_JSON_student.nameWithInitials;
                if (req_JSON_student.fullName) updatedStudent.fullName = req_JSON_student.fullName;
                if (req_JSON_student.DOB) updatedStudent.DOB = DOB;
                if (req_JSON_student.gender) updatedStudent.gender = req_JSON_student.gender;
                if (req_JSON_student.profilePicture) updatedStudent.profilePicture = req_JSON_student.profilePicture;
                if (req_JSON_student.address) updatedStudent.address = req_JSON_student.address;
                if (req_JSON_student.grade) updatedStudent.grade = req_JSON_student.grade;
                if (req_JSON_student.section) updatedStudent.section = req_JSON_student.section;
                if (req_JSON_student.medium) updatedStudent.medium = req_JSON_student.medium;
                if (req_JSON_student.contactNo1) updatedStudent.contactNo1 = req_JSON_student.contactNo1;
                if (req_JSON_student.contactNo2) updatedStudent.contactNo2 = req_JSON_student.contactNo2;
                if (req_JSON_student.guardianName) updatedStudent.guardianName = req_JSON_student.guardianName;
                if (req_JSON_student.guardianAddress) updatedStudent.guardianAddress = req_JSON_student.guardianAddress;
                if (req_JSON_student.guardianRelationship) updatedStudent.guardianRelationship = req_JSON_student.guardianRelationship;
                if (req_JSON_student.specialCare) updatedStudent.specialCare = req_JSON_student.specialCare;
                if (req_JSON_student.specialCareInfo) updatedStudent.specialCareInfo = req_JSON_student.specialCareInfo;
                if (req_JSON_student.active) updatedStudent.active = req_JSON_student.active;
                if (req_JSON_student.verified) updatedStudent.verified = req_JSON_student.verified;
    
                // Find student and update it with the request body
                let updated = await Student.findOneAndUpdate({ indexNo: studnetIndexNo }, updatedStudent, {new: true, projection: '-attendance'});
                
                if(!updated) {
                    return res.status(404).send({
                        message: "Student not found with Index No. " + studnetIndexNo,
                        studentWithError: req_JSON_student,
                        indexWithError: index,
                        savedStudents: students_res
                    });
                }
                students_res.push(updated);
    
            } catch (err) {
                winston.error("Error: ", err);
                if(err.kind === 'ObjectId') {
                    return res.status(404).send({
                        message: "Student not found with Index No. " + studnetIndexNo,
                        studentWithError: req_JSON_student,
                        indexWithError: index,
                        savedStudents: students_res
                    });                
                }
                return res.status(500).send({
                    message: err.message || "Error updating Student with Index No. " + studnetIndexNo,
                    studentWithError: req_JSON_student,
                    indexWithError: index,
                    savedStudents: students_res
                });
            }
        }
        return res.send({
            message: "SUCCESS",
            noOfUpdatedStudents: students_res.length,
            savedStudents: students_res
        });
    },
    
    // Find a single Student with RFID
    findOneByRFID: (req, res) => {
        const rfid = req.params.rfid;
        Student.findOne({ rfid })
        .then(student => {
            if(!student) {
                return res.status(404).send({
                    message: "Student not found with RFID: " + rfid
                });            
            }
            res.send(student);
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Student not found with RFID: " + rfid
                });                
            }
            return res.status(500).send({
                message: "Error retrieving Student with RFID: " + rfid
            });
        });
    },

    /**
     * Retrieve all Students - Populate Attendance
     * Query params 'from: Date' or 'to: Date'  can be given
     * TODO: check whether query is working with moment
     */
    getAllWithAttendance: (req, res) => {
        if (req.query.to || req.query.from) {
            const recordsFrom = req.query.from ? new Date(req.query.from) : null;
            const recordsTo = req.query.to ? new Date(req.query.to) : null;
            winston.info(`Attendance records from: ${recordsFrom}, to: ${recordsTo}`)
            if (recordsFrom && !moment(recordsFrom).isValid()) return res.status(400).send({ 
                message: "Query parameter 'from' should be a valid date string."
            });
            if (recordsTo && !moment(recordsTo).isValid()) return res.status(400).send({ 
                message: "Query parameter 'to' should be a valid date string."
            });

            let query;
            if (recordsFrom && recordsTo) query = { date: {$gte: moment(recordsFrom), $lte: moment(recordsTo)}};
            else if (recordsFrom) query = { date: {$gte: moment(recordsFrom)}};
            else query = { date: {$lte: moment(recordsTo)}};

            Student.find().populate({
                path: 'attendance',
                match: query,
                select: '-_id -student -__v -createdAt -updatedAt',
            }).exec()
            .then(students => {
                res.send(students);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving students."
                });
            });
        } else {
            Student.find().populate({
                path: 'attendance',
                select: '-_id -student -__v -createdAt -updatedAt',
            }).exec()
            .then(students => {
                res.send(students);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving students."
                });
            });
        }
    },

    /**
     * Find a single Student with Index no. - Populate Attendance
     * Query params 'from: Date' or 'to: Date'  can be given
     */
    getStudentWithAttendance: (req, res) => {
        const studnetIndexNo = req.params.studentId;

        if (req.query.to || req.query.from) {
            const recordsFrom = req.query.from ? new Date(req.query.from) : null;
            const recordsTo = req.query.to ? new Date(req.query.to) : null;
            winston.info(`Attendance records from: ${recordsFrom}, to: ${recordsTo}`)
            if (recordsFrom && !moment(recordsFrom).isValid()) return res.status(400).send({ 
                message: "Query parameter 'from' should be a valid date string."
            });
            if (recordsTo && !moment(recordsTo).isValid()) return res.status(400).send({ 
                message: "Query parameter 'to' should be a valid date string."
            });

            let query;
            if (recordsFrom && recordsTo) query = { date: {$gte: moment(recordsFrom), $lte: moment(recordsTo)}};
            else if (recordsFrom) query = { date: {$gte: moment(recordsFrom)}};
            else query = { date: {$lte: moment(recordsTo)}};

            Student.findOne({ indexNo: studnetIndexNo }).populate({
                path: 'attendance',
                match: query,
                select: '-_id -student -__v -createdAt -updatedAt',
            }).exec()
            .then(student => {
                if(!student) return res.status(404).send({ message: "Student not found with Index No. " + studnetIndexNo });
                res.send(student);
            }).catch(err => {
                return res.status(500).send({
                    message: "Error retrieving Student with Index No. " + studnetIndexNo,
                    error: err.message
                });
            });
        } else {
            Student.findOne({ indexNo: studnetIndexNo }).populate({
                path: 'attendance',
                select: '-_id -student -__v -createdAt -updatedAt',
            }).exec()
            .then(student => {
                if(!student) return res.status(404).send({ message: "Student not found with Index No. " + studnetIndexNo });
                res.send(student);
            }).catch(err => {
                return res.status(500).send({
                    message: "Error retrieving Student with Index No. " + studnetIndexNo,
                    error: err.message
                });
            });
        }
    },

    /**
     * Verify pin number with student indexNo
     * Consumed by ideamart server
     * Query params: pin
     */
    verifyPin: async (req, res) => {
        const studnetIndexNo = req.params.studentId;
        const pin = req.query.pin;

        if (!pin) return res.status(400).send({ 
            message: "Query parameter 'pin' should be provided."
        });

        // Find student record
        const student = await Student.findOne({ indexNo: studnetIndexNo });
        if( !student ) return res.status(400).send({ message: `Student not found for index no. - ${studnetIndexNo}` });

        let responseBody = { indexNo: studnetIndexNo };
        if (pin === student.ideamartPin) {
            responseBody.nameWithInitials = student.nameWithInitials;
            responseBody.status = "SUCCESS";
            responseBody.message = "Pin verified";
        } else {
            responseBody.status = "FAILED";
            responseBody.message = "Invalid pin";
        }
        winston.info("Pin verification: ", responseBody);
        return res.send(responseBody);
    },

    /**
     * Increment grade of all students
     * Query params 'grade: String' - all students in grade
     * Query params 'class' and 'grade' - all students in class
     */
    incrementGrade: (req, res) => {
        if (req.query.grade && req.query.class) {
            const grade = parseInt(req.query.grade);
            if (isNaN(grade)) return res.status(400).send({ 
                message: "Query parameter 'grade' should be a number."
            });
            const newGrade = grade + 1;
            const studentClass = req.query.class;
            winston.info("Increment Students in class: "+ studentClass);
            // TODO: validate grade
            Student.updateMany({ grade, section: studentClass }, { $set: { grade: newGrade } })
            .then(({ n, nModified }) => {
                winston.info(`No. of students in class: ${n}, grade incremented: ${nModified}`);
                res.send({ matchedCount: n, modifiedCount: nModified });
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while Incrementing students' grade."
                });
            });
        } else if (req.query.grade) {
            const grade = parseInt(req.query.grade);
            if (isNaN(grade)) return res.status(400).send({ 
                message: "Query parameter 'grade' should be a number."
            });
            const newGrade = grade + 1;
            winston.info("Increment Students in grade: "+ grade)
            // TODO: validate grade
            Student.updateMany({ grade }, { $set: { grade: newGrade } })
            .then(({ n, nModified }) => {
                winston.info(`No. of students in grade: ${n}, grade incremented: ${nModified}`);
                res.send({ matchedCount: n, modifiedCount: nModified });
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while Incrementing students' grade."
                });
            });
        } else {
            return res.status(400).send({ 
                message: "Query parameter 'grade' (current grade) is needed to increment the grade."
            });
        }
    },
}