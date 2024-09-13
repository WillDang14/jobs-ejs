const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

/////////////////////////////////////////////////////////////////
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide name"],
        minLength: 3,
        maxLength: 50,
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide valid email",
        ],
        unique: true, // create unique index, this is not validator, báo lỗi nếu trong DB đã có email này đăng kí rồi
    },
    password: {
        type: String,
        required: [true, "Please provide password"],
        minLength: 6,
    },
});

/////////////////////////////////////////////////////////////////
// Mongoose Middleware
UserSchema.pre("save", async function () {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);

    // không cần dùng với mongoose 5.x later
    // next();
});

// Instance Method in Mongos
// define our own custom document instance methods
// UserSchema.methods.getName = function () {
//     return this.name;
// };

// tạo method mới để tạo JWT
UserSchema.methods.createJWT = function () {
    // console.log(`this.id = ${this._id}`);
    // console.log(`this.name = ${this.name}`);

    return jwt.sign(
        { userId: this._id, name: this.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME }
    );
};

// compare PW with PW from DB
UserSchema.methods.comparePassword = async function (candidatePassword) {
    // console.log(`this.password = ${this.password}`);

    const isMatch = await bcrypt.compare(candidatePassword, this.password);

    return isMatch;
};

/////////////////////////////////////////////////////////////////
module.exports = mongoose.model("User", UserSchema);
