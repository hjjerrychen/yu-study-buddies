// required to read environment variables
require('dotenv').config({ path: '../.env' })

const mongoose = require("mongoose");

// import model schema
const Course = require("./models/course")["course"]
const Section = require("./models/course")["section"]
const Link = require("./models/course")["link"]
const Report = require("./models/report")["report"]
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
    // for (const course of await Course.find()) {
    //     course.
    //     // for (const section of course.sections) {
    //     //     await section.links.update(
    //     //         {},
    //     //         { $pull: { link: { url: "https://discord.gg/QN24TRp98D" }} },
    //     //         { multi: true }
    //     //     ).exec();
    //     // }
    // }
    await Course.update({},
        { $pull: { "sections.$.links":  { "url": "https://discord.gg/QN24TRp98D" }  } },
        { multi: true }).exec()
    console.log("Completed!")
});

