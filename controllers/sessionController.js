const User = require("../models/User");

// const parseVErr = require("../util/parseValidationErr"); // this is bug
const parseVErr = require("../utils/parseValidationErrs"); // correct by this one

///////////////////////////////////////////////////////////////////////
const registerShow = (req, res) => {
    console.log("registerShow");

    res.render("register");
};

const registerDo = async (req, res, next) => {
    //
    console.log("registerDo / req.body = : ", req.body);
    //

    if (req.body.password != req.body.password1) {
        //
        req.flash("error", "The passwords entered do not match.");

        // return res.render("register", { errors: flash("errors") }); // this is bug
        return res.render("register", { errors: req.flash("error") }); // correct by this one
    }

    //
    try {
        await User.create(req.body);
    } catch (e) {
        console.log("registerDo / error = ", e);

        if (e.constructor.name === "ValidationError") {
            // lỗi ValidationError là lỗi xảy ra khi không đúng quy định của Schema
            // Mongoose validation error
            parseVErr(e, req);
            //
        } else if (e.name === "MongoServerError" && e.code === 11000) {
            // Lỗi này là trùng địa chỉ email
            req.flash("error", "That email address is already registered.");
            //
        } else {
            //
            return next(e);
            //
        }

        //
        // return res.render("register", { errors: flash("errors") }); // this is bug
        return res.render("register", { errors: req.flash("error") }); // correct by this one
    }
    res.redirect("/");
};

const logoff = (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
};

const logonShow = (req, res) => {
    if (req.user) {
        console.log("logonShow / req.user =", req.user);

        return res.redirect("/");
    }

    // res.render("logon", {
    //     errors: req.flash("error"),
    //     info: req.flash("info"),
    // });

    res.render("logon");
};

///////////////////////////////////////////////////////////////////
module.exports = {
    registerShow,
    registerDo,
    logoff,
    logonShow,
};
