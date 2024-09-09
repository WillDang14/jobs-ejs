const { CustomAPIError } = require("../errors");

const { StatusCodes } = require("http-status-codes");

//////////////////////////////////////////////////////
const errorHandlerMiddleware = (err, req, res, next) => {
    // console.log(err);
    // console.log(err.value);
    // console.log(typeof err.value);

    let customError = {
        // set default, nếu có err thì dùng statusCode của err
        // nếu không có thì dùng StatusCodes.INTERNAL_SERVER_ERROR
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,

        msg: err.message || "Something went wrong, try again later!",
    };

    // if (err instanceof CustomAPIError) {
    //     return res.status(err.statusCode).json({ msg: err.message });
    // }

    if (err.name === "ValidationError") {
        // return array of objects
        // console.log(Object.values(err.errors));

        customError.msg = Object.values(err.errors)
            .map((item) => item.message)
            .join(",");

        customError.statusCode = 400;
    }

    if (err.code && err.code === 11000) {
        // Chú ý kĩ cái này (bài 194: Duplicate Error)
        // Object.keys() là lấy tên của "key" trong Object (không phải lấy value của key)
        customError.msg = `Duplicate value entered for ${Object.keys(
            err.keyValue
        )} field, please choose another value!`;

        customError.statusCode = 400; // bad request
    }

    if (err.name === "CastError") {
        // console.log(typeof err.value);
        // console.log(err.value);

        // Cách 1
        // if (typeof err.value === "string") {
        //     customError.msg = `No item found with id: ${err.value}`;
        // } else if (typeof err.value === "object") {
        //     customError.msg = `No item found with id: ${err.value._id}`;
        // }

        // customError.msg = `No item found with id: ${err.value}`;

        // Cách 2:
        customError.msg =
            typeof err.value === "string"
                ? `No job found with id: ${err.value}`
                : `No job found with id: ${err.value._id}`;

        customError.statusCode = 404;
    }
    ////////////////////////////////////////////////
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
    return res.status(customError.statusCode).json({ msg: customError.msg });
};

//////////////////////////////////////////////////////
module.exports = errorHandlerMiddleware;
