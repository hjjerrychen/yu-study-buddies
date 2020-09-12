// required to read environment variables
require("dotenv").config();

// dependencies
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// constants
const PORT = 3000;

// import model schema
const Course = require("./db/models/course")["course"]
const Section = require("./db/models/course")["section"]
const Link = require("./db/models/course")["link"]

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

// middleware
app.use(cors());
app.use(bodyParser.json());

// ROUTES

/**
 * GET  /
 * 
 * Returns "Server is working." if the server is working.
 * 
 * PARAMETERS
 *   - none
 * 
 * RESPONSE
 *   - none
 */
app.get("/", (req, res) => res.send("Server is working."))

/**
 * GET  /courses/
 * 
 * Returns a list of all courses.
 * 
 * PARAMETERS
 *   - q(uery) (optional): return courses that matches this course code (wildcard match)
 *   - l(imit) (optional): limit the number of courses to return if over this limit 
 * 
 * RESPONSE
 *   - name: course name
 *   - code: course code
 */
app.get("/courses", (req, res) => {
    // return courses with course code that matches parameter q(uery) if provided
    const property = {};
    if (req.query.q) property.$or = [{ 'name': { $regex: req.query.q, $options: 'i' } }, { 'code': { $regex: req.query.q.replace(" ", ""), $options: 'i' } }]
    Course.find(property, "name code", { limit: parseInt(req.query.l) || 0 }, (err, courses) => {
        if (err) return console.error(err);
        console.log(courses);
        res.json(courses);
    })
})

/**
 * GET  /courses/:id 
 * 
 * Returns details for one course.
 * 
 * PARAMETERS
 *   - code: course code in XXXX #### format
 * 
 * RESPONSE
 *   - name: course name
 *   - subject: course subject code
 *   - number: course number
 *   - sections: [
 *       name: name of the section
 *       links: [
 *         type: type of link
 *         url: url of link
 *         updatedAt: date and time link was last updated
 *       ]
 *     ]
 */
app.get("/courses/:code", (req, res) => {
    let code = req.params.code.trim().toUpperCase();
    // if (!id) return poor parameters, cannot find
    Course.findOne({ code: code }, "-_id name subject number sections.name sections.links.type sections.links.url sections.links.updatedAt", (err, course) => {
        if (err) return console.error(err);
        console.log(course);
        res.json(course);
    })
})

app.post("/courses/");
app.post("/courses/:id/section");
app.post("/courses/:id/link");

// start application
app.listen(PORT, () => console.log(`Server is running at: http://localhost:${PORT}/`));