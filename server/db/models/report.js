let mongoose = require('mongoose')

let report = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        trim: true
    },
    link_id: {
        type: mongoose.ObjectId,
        required: true,
        trim: true,
        ref: 'courses.sections.links'
    },
    reason: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100,
    },
    reviewed: {
        type: Boolean,
        required: true,
        default: false
    },
}, { timestamps: true })


module.exports = {
    report: mongoose.model('Report', report),
}