const NodeCache = require( "node-cache" );

const CACHE = new NodeCache({stdTTL: 60});
const LINK_STAT_KEY = "link-count";
const COURSE_STAT_KEY = "course-count";
const COURSE_LINK_STAT_KEY = "course-link-clicks";
const TOTAL_LINK_STAT_KEY = "link-clicks";

const Course = require("../db/models/course")["course"]

async function getLinkCount() {
    const cacheResult = CACHE.get(LINK_STAT_KEY);
    if (cacheResult !== undefined) {
        return cacheResult;
    }

    // [ { _id: null, totalLinks: 1 } ]
    const dbResponse = await Course.aggregate([
        { $unwind: "$sections" },
        { $unwind: "$sections.links" },
        {
            $group: {
                _id: null,
                totalLinks: { $sum: 1 }
            }
        }
    ])

    const dbResult = dbResponse?.[0]?.totalLinks;
    CACHE.set(LINK_STAT_KEY, dbResult);
    return dbResult;

}

async function getCourseCount() {

    const cacheResult = CACHE.get(COURSE_STAT_KEY);
    if (cacheResult !== undefined) {
        return cacheResult;
    }

    // [ { _id: null, totalLinks: 1 } ]
    const dbResponse = await Course.countDocuments();
    CACHE.set(COURSE_STAT_KEY, dbResponse);
    return dbResponse;

}

async function getLinkClicks() {

    const cacheResult = CACHE.get(TOTAL_LINK_STAT_KEY);
    if (cacheResult !== undefined) {
        return cacheResult;
    }

    const dbResponse = await Course.aggregate([
        { $unwind: "$sections" }, // Deconstructs the sections array
        { $unwind: "$sections.links" }, // Deconstructs the links array within each section
        {
            $group: {
                _id: null,
                totalClicks: { $sum: "$sections.links.clicks" }
            }
        }
    ]).exec();

    const dbResult = dbResponse?.[0].totalClicks;
    CACHE.set(TOTAL_LINK_STAT_KEY, dbResult);
    return dbResult;
}

async function getCourseLinkClicks(code) {

    const cacheKey = `${COURSE_LINK_STAT_KEY}:${code}`;

    const cacheResult = CACHE.get(cacheKey);
    if (cacheResult !== undefined) {
        return cacheResult;
    }

    const matchedCourse = await Course.findOne(
        {
            "code": code,
        }
    );

    if (!(matchedCourse && matchedCourse["sections"])) {
        CACHE.set(cacheKey, null);
        return null;
    }

    const courseStats = {};

    for (const section of matchedCourse["sections"]) {
        const sectionStats = [];

        for (const link of section.links) {
            sectionStats.push({url: link.url, clicks: link.clicks || 0});
        }

        courseStats[section.name] = sectionStats;
    }

    return courseStats;
}

module.exports = {
    getLinkCount,
    getCourseCount,
    getCourseLinkClicks,
    getLinkClicks
}
