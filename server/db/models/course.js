let mongoose = require('mongoose')

let link = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (v) => /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(v),
            message: props => "The URL is not valid!"
        }
    },
}, { timestamps: true })

let section = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 20,
        trim: true,
    },
    links: [link],
}, { timestamps: true })

let course = new mongoose.Schema({
    name: {
        type: String,
        minlength: 1,
        maxlength: 100,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 4,
        trim: true,
        uppercase: true
    },
    faculty: {
        type: String,
        required: false,
        minlength: 2,
        maxlength: 2,
        trim: true,
        uppercase: true
    },
    credits: {
        type: String,
        required: false,
        minlength: 4,
        maxlength: 4,
        trim: true
    },
    number: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 4,
        trim: true
    },
    code: {
        type: String,
        unique: true,
        index: true
    },
    sections: {
        type: [section],
        default: [{
            name: "All"
        }]
    },
}, { timestamps: true })

course.pre('save', function (next) {
    this.code = `${this.faculty || ""}${this.subject}${this.number}`
    next();
});

module.exports = {
    course: mongoose.model('Course', course),
    section: mongoose.model('Section', section),
    link: mongoose.model('Link', link),
}