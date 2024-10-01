const Job = require("../models/Job");

const parseVErr = require("../utils/parseValidationErrs");

///////////////////////////////////////////////
const getAllJobs = async (req, res) => {
    // console.log("getAllJobs = ", req.user._id.toString());

    const userId = req.user._id.toString();

    const jobs = await Job.find({
        createdBy: userId,
    }).sort("createdAt");

    res.render("jobs", { jobs });
};

const getJob = async (req, res) => {
    // console.log("getJob - req.user = ", req.user);
    // console.log("getJob - req.params = ", req.params);
    // const userId = req.user._id.toString();
    // const { _id: userId } = req.user;
    // const { id: jobId } = req.params;

    const {
        user: { _id: userId },
        params: { id: jobId },
    } = req;

    console.log("getJob - userId = ", userId);
    console.log("getJob - jobId = ", jobId);

    const job = await Job.findOne({
        _id: jobId,
        createdBy: userId.toString(),
    });

    // console.log("editJob - job = ", job);

    if (!job) {
        req.flash("error", `No job with id ${jobId}. Can not edit!`);

        // return res.render("job", { job });
        return res.redirect("/jobs");
    }

    // res.render("editJob", { job });
    res.render("job", { job });
};

const createJob = async (req, res) => {
    // console.log("createJob - req.body = ", req.body);
    // console.log(req.user);

    if (req.body.company === "" || req.body.position === "") {
        req.flash(
            "error",
            "Company or Position can not be empty! Please try again!"
        );

        return res.render("job", {
            errors: req.flash("error"),
            job: null,
        });
    }

    const userId = req.user._id.toString();

    delete req.body._csrf;

    req.body.createdBy = userId;

    console.log("createJob - req.body = ", req.body);

    const job = await Job.create(req.body);

    res.redirect("/jobs");
};

const updateJob = async (req, res) => {
    // console.log("updateJob req.body = ", req.body);
    // console.log("updateJob req.user", req.user);
    // console.log("updateJob params", req.params);

    // const userId = req.user._id.toString();
    // const jobId = req.params.id;

    const {
        user: { _id: userId },
        params: { id: jobId },
    } = req;

    console.log("updateJob - userId = ", userId);
    console.log("updateJob - jobId = ", jobId);

    delete req.body._csrf;

    console.log("updateJob req.body = ", req.body);

    const job = await Job.findOne({
        _id: jobId,
        createdBy: userId.toString(),
    });

    if (req.body.company === "" || req.body.position === "") {
        //
        req.flash(
            "error",
            "Company or Position can not be empty! Please try again!"
        );

        return res.render("job", {
            errors: req.flash("error"),
            job,
        });
    }

    const jobUpdated = await Job.findByIdAndUpdate(
        { _id: jobId, createdBy: userId.toString() }, // find
        req.body, // update with this data
        { new: true, runValidators: true } // run validator
    );

    // console.log(jobUpdated);

    res.redirect("/jobs");
};

const deleteJob = async (req, res) => {
    // console.log("deleteJob user._id = ", req.user._id);
    // console.log("deleteJob req.params = ", req.params);

    // const userId = req.user._id.toString();
    // const jobId = req.params.id;

    const {
        user: { _id: userId },
        params: { id: jobId },
    } = req;

    console.log("deleteJob - userId = ", userId);
    console.log("deleteJob - jobId = ", jobId);

    const job = await Job.findByIdAndDelete({
        _id: jobId,
        createdBy: userId.toString(),
    });

    if (!job) {
        req.flash("error", `No job with id ${jobId} !`);

        return res.redirect("/jobs");
    }

    res.redirect("/jobs");
};

const newEntry = async (req, res) => {
    res.render("job", { job: null });

    // res.render("addJob", { jobs: null });
};

///////////////////////////////////////////////
module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    newEntry,
};
