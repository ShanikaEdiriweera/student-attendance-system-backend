import mongoose from 'mongoose';

const AttendanceSchema = mongoose.Schema({
    student: {type : mongoose.Schema.ObjectId, ref : 'Student'},
    indexNo: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        // required: true
    },  
    time: {
        type: String,
        // required: true
    },  
    timestamp: {
        type: Date,
        required: true
    },  
    isEntered: {
        type: String,
        required: true
    }, 
}, {
    timestamps: true
});

module.exports = mongoose.model('Attendance', AttendanceSchema);