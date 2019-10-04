import mongoose from 'mongoose';

const StudentSchema = mongoose.Schema({
    attendance: [{ type: mongoose.Schema.ObjectId, ref: 'Attendance' }],

    indexNo: {
        type: String,
        unique: true,
        required: true
    }, 
    rfid: {
        type: String,
        unique: true,
        required: false,
        sparse: true
    }, 
    ideamartPin: {
        type: String,
        // required: true
    }, 
    // initials: {
    //     type: String,
    //     required: true
    // },  
    // lastName: {
    //     type: String,
    //     required: true
    // }, 
    nameWithInitials: {
        type: String,
        // required: true
    },   
    fullName: {
        type: String,
        required: true
    },  
    DOB: Date,
    gender: {
        type: String,
        enum : ['male', 'female', 'other'],
    },
    profilePicture: String, // thumbnail url
    address: String,
    grade: String,
    section: String, //section OR class
    medium: String,
    // class: String,

    // homeTel: String,
    contactNo1: String,
    contactNo2: String,
    guardianName: String,
    guardianAddress: String,
    guardianRelationship: String,
    // guardianContact: String, 

    specialCare: Boolean, // whether the student need special care or not
    specialCareInfo: String,

    active: { type: Boolean, default: true },
    verified: { type: Boolean, default: true }, // attribute to indicate ADMIN accepted the student registration
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', StudentSchema);