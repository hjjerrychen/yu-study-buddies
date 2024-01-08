// required to read environment variables
require('dotenv').config({ path: '../.env' })

const mongoose = require("mongoose");

// import model schema
const Course = require("./models/course")["course"]
const Section = require("./models/course")["section"]
const Report = require("./models/report")["report"]
const Link = require("./models/course")["link"]

// import data for importing
const COURSES = require("./data")

console.log(process.env.MONGO_DB_URI);

// connect to database
mongoose
    .connect(process.env.MONGO_DB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log('DB Connected!'))
    .catch(err => {
        console.log(`MongoDB connection error:+ ${err.message}`);
    });

// default db connection
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', async () => {
    await Report.deleteMany();
    await Course.deleteMany();
    await Link.deleteMany();

    for (const course of COURSES) {
        sections = [new Section({ name: "All" })]
        for (const section of course.sections) {
            sections.push(new Section({ name: section }))
        }
        // console.log(`${course.faculty}/${course.subject} ${course.number} ${course.credits}: ${course.name}`)
        await Course.create(
            {
                name: course.name,
                subject: course.subject,
                number: course.number,
                faculty: course.faculty,
                credits: course.credits,
                sections: sections
            }, (err, small) => {
            if (err) console.error(err);
        });
    }

    console.log("Completed! (but not really.... monitor DB to make sure all documents load before Ctrl + C)")
});

