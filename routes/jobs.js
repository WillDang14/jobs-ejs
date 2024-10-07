const express = require("express");

const router = express.Router();

const {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    newEntry,
} = require("../controllers/jobs");

///////////////////////////////////////////////////
router.route("/").get(getAllJobs).post(createJob);

// Put up the form to create a new entry
router.route("/new").get(newEntry);

// Get a particular entry and show it in the edit box
// router.route("/edit/:id").get(getJob);
router.route("/edit/:id").get(getJob).post(updateJob);

// Update a particular entry
// router.route("/update/:id").post(updateJob);

// Delete an entry
router.route("/delete/:id").post(deleteJob);

///////////////////////////////////////////////////
module.exports = router;
