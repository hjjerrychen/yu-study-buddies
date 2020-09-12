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
        },
    },
}, { timestamps: true })

let section = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 20,
        trim: true
    },
    links: [link],
}, { timestamps: true })

let course = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        minlength: 1,
        maxlength: 100,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 4,
        trim: true,
        uppercase: true
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
    sections: [section],
}, { timestamps: true })

course.pre('save', function (next) {
    this.code = `${this.subject}${this.number}`
    next();
});

course.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error('This course already exists!'));
    } else {
        next(error);
    }
});

module.exports = {
    course: mongoose.model('Course', course),
    section: mongoose.model('Section', section),
    link: mongoose.model('Link', link),
}