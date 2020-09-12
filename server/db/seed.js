// required to read environment variables
require('dotenv').config({ path: '../.env' })

const mongoose = require("mongoose");

// import model schema
const Course = require("./models/course")["course"]
const Section = require("./models/course")["section"]
const Link = require("./models/course")["link"]

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
    await Course.deleteMany();
    link1 = new Link({ type: "Discord", url: "https://discord.com/" });
    link2 = new Link({ type: "WhatsApp", url: "https://www.whatsapp.com/" });
    link3 = new Link({ type: "Facebook Messenger", url: "https://www.messenger.com/" });
    link4 = new Link({ type: "Something Else", url: "https://www.somethingelse.com" });
    section = new Section({ name: "A", links: [link1, link2, link3, link4] });
    section2 = new Section({ name: "B", links: [link1, link2, link3, link4] });

    Course.create({ name: "Introduction to Net-centric Computing", subject: "EECS", number: "1012", sections: [section, section2] }, (err, small) => {
        if (err) console.error(err);
    });
    Course.create({ name: "Programming for Mobile Computing", subject: "EECS", number: "1022", sections: section }, (err, small) => {
        if (err) console.error(err);
    });
    Course.create({ name: "Introduction to the Theory of Computation", subject: "EECS", number: "2001", sections: section }, (err, small) => {
        if (err) console.error(err);
    });
    Course.create({ name: "Computer Organization", subject: "EECS", number: "2021" }, (err, small) => {
        if (err) console.error(err);
    });
    await Course.create({ name: "Advanced Object Oriented Programming", subject: "EECS", number: "2030", sections: section }, (err, small) => {
        if (err) console.error(err);
    });

    console.log("Completed!")
});

