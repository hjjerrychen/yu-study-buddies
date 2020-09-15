let mongoose = require('mongoose')

let flag = new mongoose.Schema({
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
}, { timestamps: true })


module.exports = {
    flag: mongoose.model('Flag', flag),
}