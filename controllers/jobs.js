const Job = require("../models/Job");

const { StatusCodes } = require("http-status-codes");

const { BadRequestError, NotFoundError } = require("../errors");
const User = require("../models/User");

///////////////////////////////////////////////
const getAllJobs = async (req, res) => {
    const jobs = await Job.find({
        createdBy: req.user.userId,
    }).sort("createdAt");

    res.status(StatusCodes.OK).json({ count: jobs.length, jobs });
};

const getJob = async (req, res) => {
    // console.log(req.user); //==>> { userId: '66becb3fa0ac5cbb54f09921', name: 'will' }
    // console.log(req.params); // ==>> { id: '66bf9003667d3a2da0bf0925' }

    // Chú ý: cái này là nested Destructuring Object
    // ==>> userId = 66becb3fa0ac5cbb54f09921
    // ==>> jobId = 66bf9003667d3a2da0bf0925
    const {
        user: { userId },
        params: { id: jobId },
    } = req;

    // console.log(userId); // 66becb3fa0ac5cbb54f09921
    // console.log(jobId); //  66bf9003667d3a2da0bf0925

    const job = await Job.findOne({
        _id: jobId,
        createdBy: userId,
    });

    if (!job) {
        throw new NotFoundError(`No job with id ${jobId}`);
    }

    res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
    // console.log(req.body);
    // console.log(req.user);

    req.body.createdBy = req.user.userId;

    // console.log(req.body);

    const job = await Job.create(req.body);

    res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
    const {
        body: { company, position },
        user: { userId },
        params: { id: jobId },
    } = req;

    if (company === "" || position === "") {
        throw new BadRequestError("Company or Position can not be empty!");
    }

    // Chú ý: cái này chỉ cần match ID là có thể update
    // ==>> tức là khác userId vẫn có thể update job của userId khác
    const job = await Job.findByIdAndUpdate(
        { _id: jobId, createdBy: userId }, // find
        req.body, // update with this data
        { new: true, runValidators: true } // run validator
    );

    // Chú ý: cái này phải match ID và userId thì mới update
    // ==>> tức là nếu khác userId thì không thể update job của userId khác
    // const job = await Job.findOneAndUpdate(
    //     { _id: jobId, createdBy: userId }, // find
    //     req.body, // update with this data
    //     { new: true, runValidators: true } // run validator
    // );

    // console.log(job);

    if (!job) {
        throw new NotFoundError(`No job with id ${jobId}`);
    }

    res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
    const {
        user: { userId },
        params: { id: jobId },
    } = req;

    const job = await Job.findByIdAndDelete({
        _id: jobId,
        createdBy: userId,
    });

    if (!job) {
        throw new NotFoundError(`No job with id ${jobId}`);
    }

    //
    // res.status(StatusCodes.OK).send(
    //     `Job \"${jobId}\" has successfully deleted!`
    // );

    // Sửa theo bài học week12
    res.status(StatusCodes.OK).json({
        msg: "The entry was deleted successfully!",
    });
};
///////////////////////////////////////////////
module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
};
