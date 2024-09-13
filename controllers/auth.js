const User = require("../models/User");

const { StatusCodes } = require("http-status-codes");

const { BadRequestError, UnauthenticatedError } = require("../errors");

///////////////////////////////////////////////
const register = async (req, res) => {
    /* =================================================== */
    // Self validate data, actually mongoose does it in Schema
    // const { name, email, password } = req.body;
    // if (!name || !email || !password) {
    //     throw new BadRequestError("Please provide name, email and password!");
    // }
    /* =================================================== */

    const user = await User.create({ ...req.body });
    // const user = await User.create({ ...tempUser });
    // console.log(user);

    const token = user.createJWT();

    // test
    // res.status(StatusCodes.CREATED).json(req.body);
    // res.status(StatusCodes.CREATED).json({ user });
    res.status(StatusCodes.CREATED).json({
        user: { name: user.name },
        token,
    });
};

// Login Controller Setup
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError("Please provide email and password!");
    }

    const user = await User.findOne({ email });
    // console.log(user);

    // Trường hợp có điền email và PW nhưng điền không đúng (email chẳng hạn)
    if (!user) {
        // throw new UnauthenticatedError("Invalid Credentials");
        throw new UnauthenticatedError("Invalid Email!");
    }

    //compare password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        // throw new UnauthenticatedError("Invalid Credentials");
        throw new UnauthenticatedError("Invalid Password!");
    }

    const token = user.createJWT();

    res.status(StatusCodes.OK).json({
        user: { name: user.name },
        token,
    });
};

///////////////////////////////////////////////
module.exports = { register, login };
