// Cần tìm hiểu kĩ thêm
const parseValidationErrors = (e, req) => {
    const keys = Object.keys(e.errors);

    console.log("parseValidationErrors = ", keys);

    keys.forEach((key) => {
        req.flash("error", key + ": " + e.errors[key].properties.message);
    });
};

/////////////////////////////////////////////////////////
module.exports = parseValidationErrors;
