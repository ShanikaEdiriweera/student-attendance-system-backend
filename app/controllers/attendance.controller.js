import moment from 'moment';
import _ from 'lodash';
import Student from '../models/student.model';
import Attendance from '../models/attendance.model';
import HttpUtil from '../util/httpUtil';
import { IDEAMART_SERVER } from '../constants';
import winston from '../../config/winston';

/**
 * attendance/date grade wise
 * attendance/date class wise 
 * attendance group by date
 * attendance group by date - date range
 */
module.exports = {
    /**
     * Create and Save a new Attendance record
     * Does not send ideamart request
     */
    create: async (req, res) => {
        const req_JSON_attencdance = req.body;
        // Validate request
        if( !req_JSON_attencdance.indexNo || 
            !req_JSON_attencdance.isEntered || 
            !req_JSON_attencdance.timestamp ) {
            
            return res.status(400).send({
                message: "Required Attendance record details can not be empty"
            });
        }

        // Find student record
        const student = await Student.findOne({ indexNo: req_JSON_attencdance.indexNo });
        if( !student ) return res.status(400).send({ message: `Student not found for index no. - ${req_JSON_attencdance.indexNo}` });

        // Create an Attendance record
        const attendance = new Attendance({
            student: student._id,
            indexNo: req_JSON_attencdance.indexNo,     
            date: req_JSON_attencdance.date,     
            time: req_JSON_attencdance.time,  
            timestamp: req_JSON_attencdance.timestamp,  
            isEntered: req_JSON_attencdance.isEntered
        });

        // Save Attendance record in the database
        try {
            const savedRecord = await attendance.save();
            const updatedStudent = await Student.findByIdAndUpdate(student._id, {$push: {attendance: savedRecord._id}}, {new: true});
            res.send({
                message: "SUCCESS",
                savedRecord,
                updatedStudent
            });
        } catch (err) {
            winston.error("error: ", err)
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Attendance record.",
                error: err.code
            });
        }
    },

    /**
     * Retrieve and return all Attendance records from the database
     * Query params 'from: Date' or 'to: Date'  can be given
     */
    findAll: (req, res) => {
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
            
            Attendance.find(query)
            .then(records => {
                res.send(records);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving Attendance records."
                });
            });
        } else {
            Attendance.find()
            .then(records => {
                res.send(records);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving Attendance records."
                });
            });
        }
    },

    /**
     * Create and Save a multiple Attendance records
     * Send requests to ideamart server
     */
    createMultiple: async (req, res) => {
        const req_JSON = req.body;

        // Validate request
        if( !req_JSON || 
            !req_JSON.records ||
            req_JSON.records.length === 0 ) {

            winston.warn("Req body validation fail: ", req_JSON)
            return res.status(400).send({
                message: "Required request data can not be empty"
            });
        }

        const req_records = req_JSON.records;
        let attendance_res = [];
        let ideamartReqBodyArray = [];
        // Validate attendance record objects
        for (let [index, req_JSON_record] of req_records.entries()) {
            if( !req_JSON_record.indexNo ||
                !req_JSON_record.isEntered || 
                !req_JSON_record.timestamp ) {

                winston.warn("Attendance record validation fail: ", req_JSON_record)
                return res.status(400).send({
                    message: `Required Attendance details can not be empty on no. ${index} record`,
                    recordWithError: req_JSON_record,
                    indexWithError: index,
                    savedRecords: attendance_res
                });
            }

            // Find student record
            const student = await Student.findOne({ indexNo: req_JSON_record.indexNo });
            if( !student ) winston.error("Student not found: ", student)
            
            if( !student ) return res.status(400).send({ 
                message: `Student not found for index no. - ${req_JSON_record.indexNo}`,
                recordWithError: req_JSON_record,
                indexWithError: index,
                savedRecords: attendance_res 
            });

            try {
                // Create an Attendance record
                let record = new Attendance({
                    student: student._id,     
                    indexNo: req_JSON_record.indexNo,     
                    date: req_JSON_record.date,     
                    time: req_JSON_record.time,     
                    timestamp: req_JSON_record.timestamp,
                    isEntered: req_JSON_record.isEntered      
                });

                // Save Attendance record in the database
                const savedRecord = await record.save();
                attendance_res.push(savedRecord);
                const updatedStudent = await Student.findByIdAndUpdate(student._id, {$push: {attendance: savedRecord._id}}, {new: true});
                if(updatedStudent) winston.info("Student updated: ", updatedStudent.indexNo)

                // let ideamartAttendanceUrl = `${IDEAMART_SERVER.ATTENDANCE_ENDPOINT}?indexNo=${updatedStudent.indexNo}&value=1&date=${req_JSON_record.date}&time=${req_JSON_record.time}`;
                // const ideamartRes = await HttpUtil.postRequest(ideamartAttendanceUrl, {});
                // winston.info("ideamartResponse", ideamartRes)
                //TODO: check 'date' and 'time' set, if not get from time stamp
                ideamartReqBodyArray.push({ indexNo: updatedStudent.indexNo, value: req_JSON_record.isEntered, date: req_JSON_record.date, time: req_JSON_record.time })
            } catch (err) {
                winston.error("Error", err.message)

                return res.status(500).send({
                    message: err.message || "Some error occurred while creating the Attendance record.",
                    recordWithError: req_JSON_record,
                    indexWithError: index,
                    savedRecords: attendance_res,
                    error: err.code
                });
            }
        }

        //TODO: check what should be done with value
        let ideamartAttendanceMultipleUrl = IDEAMART_SERVER.ATTENDANCE_MULTIPLE_ENDPOINT;
        winston.info("ideamart attendance multiple Req body: ", ideamartReqBodyArray);
        const ideamartResponse = await HttpUtil.postRequest(ideamartAttendanceMultipleUrl, ideamartReqBodyArray);
        winston.info("ideamart attendance multiple Response: ", ideamartResponse);

        return res.send({
            message: "SUCCESS",
            noOfSavedRecords: attendance_res.length,
            savedRecords: attendance_res,
            ideamartResponse
        });
    },

    /**
     * Get Attendance report - student count of school, grade, class 
     * Query params 'from: Date' or 'to: Date'  can be given
     */
    getReport: async (req, res) => {
        if (req.query.to || req.query.from) {
            const reportFrom = req.query.from ? new Date(req.query.from) : null;
            const reportTo = req.query.to ? new Date(req.query.to) : null;
            winston.info(`Attendance report from: ${reportFrom}, to: ${reportTo}`)
            if (reportFrom && !moment(reportFrom).isValid()) return res.status(400).send({ 
                message: "Query parameter 'from' should be a valid date string."
            });
            if (reportTo && !moment(reportTo).isValid()) return res.status(400).send({ 
                message: "Query parameter 'to' should be a valid date string."
            });

            let query;

            if (reportFrom && reportTo) query = { date: {$gte: reportFrom, $lte: reportTo}};
            else if (reportFrom) query = { date: {$gte: reportFrom}};
            else query = { date: {$lte: reportTo}};
            winston.info("Attendance query: ", query)

            try {
                const recordsByDate = await Attendance.aggregate([
                    { $match : query }, 
                    { $lookup: {
                        from: 'students',
                        localField: 'student',
                        foreignField: '_id',
                        as: 'student'
                    }},
                    { $group: { 
                        _id: "$date", 
                        date: { $first: '$date' },
                        recordSet: { $addToSet: { indexNo: '$indexNo', student: '$student'} }, 
                    }},
                    { $sort : { date : 1 } },
                    { $project: { 
                        _id: 0, 
                        date: 1, 
                        recordSet: 1,
                    }}
                ]);

                winston.info("records: ", recordsByDate)
                let report = {};
                for (let item of recordsByDate) {
                    // Note: aggregate $lookup gives an array
                    const date = moment(item.date).format('YYYY-MM-DD'); 
                    report[date] = {}; 
                    const attendanceByGrade = _.countBy(item.recordSet, (record) => {
                        return record.student[0]["grade"];
                    })
                    const attendanceByClass = _.countBy(item.recordSet, (record) => {
                        return record.student[0].section;
                    })
                    report[date].total = item.recordSet.length;
                    report[date].attendanceByGrade = attendanceByGrade;
                    report[date].attendanceByClass = attendanceByClass;
                }
                winston.info("report: ", report)

                res.send({
                    reportFrom: moment(reportFrom).format('YYYY-MM-DD'),
                    reportTo: moment(reportTo).format('YYYY-MM-DD'), 
                    noOfDays: recordsByDate.length,
                    report
                });

            } catch (err) {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving Attendance records."
                });
            }
        } else {
            try {
                const records = await Attendance.aggregate([ 
                    { $group: { 
                        _id: {indexNo: "$indexNo", date: "$date"}, 
                        indexNo: { $first: '$indexNo' }, 
                        // student: { $first: '$student' }, 
                        date: { $first: '$date' }
                    }},
                    // { $lookup: {
                    //     from: 'students',
                    //     localField: 'student',
                    //     foreignField: '_id',
                    //     as: 'student'
                    // }},
                    { $sort : { date : 1 } },
                    { $project: { 
                        _id: 0, 
                        indexNo: 1, 
                        date: 1, 
                        // student: 1 
                    }}
                ]);
                winston.info("records: ", records)
                const report = _.countBy(records, (record) => {
                    return moment(record.date).format('YYYY-MM-DD');
                })
                res.send({
                    report
                });

            } catch (err) {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving Attendance records."
                });
            }
        }
    },
}