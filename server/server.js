// required to read environment variables
require("dotenv").config();

// dependencies
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const { json } = require("body-parser");

// constants
const PORT = 3000;

//http response codes
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

// import model schema
const Course = require("./db/models/course")["course"]
const Section = require("./db/models/course")["section"]
const Link = require("./db/models/course")["link"]

// error handler
const errorHandler = (res, err) => {
    console.error(err);
    return res.status(SERVER_ERROR).json({ error: "An server error occured." })
}

// connect to database
mongoose
    .connect(process.env.MONGO_DB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .then(() => console.log('DB Connected!'))
    .catch(err => {
        console.error(`MongoDB connection error:+ ${err.message}`);
    });

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
 *   - Array of courses: [{
 *       name: course name
 *       code: course code
 *     }]
 */
app.get("/courses", async (req, res) => {
    // return courses with course code that matches parameter q(uery) if provided
    const property = {};
    if (req.query.q) property.$or = [{ 'name': { $regex: req.query.q, $options: 'i' } }, { 'code': { $regex: req.query.q.replace(" ", ""), $options: 'i' } }]
    try {
        res.json(await Course.find(property, "-_id name code", { limit: parseInt(req.query.l) || 0 }).exec())
    }
    catch (err) {
        errorHandler(res, err);
    }
})

/**
 * GET  /courses/:code 
 * 
 * Returns details for one course.
 * 
 * PARAMETERS
 *   - code: course code in XXXX#### format
 * 
 * RESPONSE
 *   - Array of course details: [{
 *       subject: course subject code
 *       number: course number
 *       sections: Array of sections: [
 *         name: name of the section
 *         links: [
 *           type: type of link
 *           url: url of link
 *           updatedAt: date and time link was last updated
 *         ]]
 *     }]
 */
app.get("/courses/:code", async (req, res) => {
    let code = req.params.code.trim().toUpperCase();
    if (!code) {
        return res.status(BAD_REQUEST).json({ error: "Bad request. Check parameters." })
    }
    try {
        const course = await Course.findOne({ code: code }, "-_id name subject number sections.name sections.links.type sections.links.url sections.links.updatedAt").exec();
        if (!course) {
            return res.status(NOT_FOUND).json({ error: "Course not found." })
        }
        res.json(course)
    }
    catch (err) {
        errorHandler(res, err);
    }
})

/**
 * POST  /courses/
 * 
 * Creates a new course.
 * 
 * PARAMETERS
 *   - name: course name
 *   - subject: course subject code
 *   - number: course number
 * 
 * RESPONSE
 *   - Error or request body if successful
 *   - HTTP Status Codes: 
 *     - 201: Section created.
 *     - 400: Bad request. Check parameters and documentation.
 *     - 409: Course already exists. 
 *     - 500: Internal server error.
 */
app.post("/courses/", async (req, res) => {
    if (!(req.body.name && req.body.subject && req.body.number)) {
        return res.status(BAD_REQUEST).json({ error: "Bad request. Check parameters." })
    }
    try {
        course = await Course.findOne({ code: `${req.body.subject}${req.body.number}` }).exec();
        if (course) {
            return res.status(CONFLICT).json({ error: "Course already exists." })
        }
        await Course.create(req.body)
        res.status(CREATED).json(req.body);
    }
    catch (err) {
        errorHandler(res, err);
    }
});

/**
 * POST  /courses/:code/sections
 * 
 * Creates a new section for a given course.
 * 
 * PARAMETERS
 *   - :code: course code in XXXX#### format
 *   - name: section name
 *   - number: course number
 * 
 * RESPONSE
 *   - Error or request body if successful
 *   - HTTP Status Codes: 
 *     - 201: Section created.
 *     - 400: Bad request. Check parameters and documentation.
 *     - 409: Section already exists. 
 *     - 404: Course not found.
 *     - 500: Internal server error.
 */
app.post("/courses/:code/sections", async (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const section = new Section(req.body)
    if (!(code && section && req.body.name)) {
        return res.status(BAD_REQUEST).json({ error: "Bad request. Check parameters." })
    }
    try {
        let course = await Course.findOne({ code: code, "sections.name": req.body.name }).exec();
        if (course) {
            return res.status(CONFLICT).json({ error: "Section already exists." })
        }

        course = await Course.findOneAndUpdate({ code: code }, { $push: { sections: section } }).exec();
        if (!course) {
            return res.status(NOT_FOUND).json({ error: "Course not found." })
        }
        res.status(CREATED).json(req.body);
    }
    catch (err) {
        errorHandler(res, err);
    }
});

/**
 * POST  /courses/:code/sections/:section/link
 * 
 * Creates a new link for a given course and section.
 * 
 * PARAMETERS
 *   - :code: course code in XXXX#### format
 *   - :section: section name (case sensitive)
 *   - link: link type
 *   - url: link url
 * 
 * RESPONSE
 *   - Error or request body if successful
 *   - HTTP Status Codes: 
 *     - 201: Link created.
 *     - 400: Bad request. Check parameters and documentation.
 *     - 409: Link already exists. 
 *     - 404: Course or section not found.
 *     - 500: Internal server error.
 */
app.post("/courses/:code/sections/:section/link", async (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const section = req.params.section;
    if (!(code && section && req.body.type && req.body.url)) {
        return res.status(BAD_REQUEST).json({ error: "Bad request. Check parameters." })
    }
    try {
        const link = new Link(req.body)
        let course = await Course.findOne({ code: code, "sections.name": section, "sections.links.url": req.body.url }).exec();
        if (course) {
            return res.status(CONFLICT).json({ error: "Link already exists." })
        }

        course = await Course.findOneAndUpdate({ code: code, "sections.name": section }, { $push: { "sections.$.links": link } });
        if (!course) {
            return res.status(NOT_FOUND).json({ error: "Course or section not found." })
        }
        res.status(CREATED).json(req.body);
    }
    catch (err) {
        errorHandler(res, err);
    }
});

// start application
app.listen(PORT, () => console.log(`Server is running at: http://localhost:${PORT}/`));