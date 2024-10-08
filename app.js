require("dotenv").config(); // to load the .env file into the process.env object

const express = require("express");
require("express-async-errors");
const app = express();

// extra security packages
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// .Protecting a Route
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");

// “cross site request forgery” (CSRF)
const csrf = require("host-csrf");
const cookieParser = require("cookie-parser");

// Jobs
const jobsRouter = require("./routes/jobs");

/* ================================================================== */
// applying security libs
app.set("trust proxy", 1);

app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    })
);

app.use(helmet());
app.use(xss());

/* ================================================================== */
app.set("view engine", "ejs");

app.use(require("body-parser").urlencoded({ extended: true }));

/* ================================================================== */
// “cross site request forgery” (CSRF)
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));

let csrf_development_mode = true;

if (app.get("env") === "production") {
    csrf_development_mode = false;
    app.set("trust proxy", 1);
}

const csrf_options = {
    protected_operations: ["PATCH"],
    protected_content_types: ["application/json"],
    development_mode: csrf_development_mode,
};

const csrf_middleware = csrf(csrf_options); // initialise and return middlware

// Chú ý là hướng dẫn trên web hơi lạ
// Cái này là dùng "csrf_middleware" cho tất cả các route
app.use(csrf_middleware);

// Cách lấy token ra xem
// Chú ý là hướng dẫn trên web viết có vẻ hơi sai sai
// The csrf function is called for initialization, and returns the middleware. One can retrieve the current token with
// app.use(csrf_middleware, (req, res, next) => {
//     let token = csrf.token(req, res);
//     console.log("csrf_token =", token);
//     next();
// });

//
// Chú ý là hướng dẫn trên web viết có vẻ hơi sai sai
// Cách làm mới token
// It's a good practice to refresh the token as the user logs on. You can do this with:
// app.use(csrf_middleware, (req, res, next) => {
//     let token = csrf.refresh(req, res);
//     console.log("csrf_refresh_token =", token);
//     next();
// });

/* ================================================================== */
// Sessions
// These lines should be added before any of the lines that govern routes, such as the app.get and app.post statements
// require("dotenv").config(); // to load the .env file into the process.env object

const session = require("express-session");

//
const MongoDBStore = require("connect-mongodb-session")(session);

//
const url = process.env.MONGO_URI;

// week16 => You should change it to look something like the following
let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV == "test") {
    mongoURL = process.env.MONGO_URI_TEST;
}

const store = new MongoDBStore({
    // may throw an error, which won't be caught
    // uri: url,
    uri: mongoURL,
    collection: "mySessions",
});

store.on("error", function (error) {
    console.log(error);
});

const sessionParms = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
    // cookie: { secure: false, sameSite: "strict", httpOnly: false }, // httpOnly: true(default)
};

if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy

    sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));

/* ================================================================== */
// Flash Messages
// Add the following code. Note that this code must come after the app.use that sets up sessions, because flash depends on sessions:
app.use(require("connect-flash")());

/* ================================================================== */
// app.set("view engine", "ejs");

// app.use(require("body-parser").urlencoded({ extended: true }));

//////////////////////////////////////////////////////////////////////
// Configuring Passport
const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();

app.use(passport.initialize());
app.use(passport.session());

//////////////////////////////////////////////////////////////////////
// testing week16
// You can fix the issue by setting the Content-Type header appropriately with this middleware, which should be added to app.js before your routes
app.use((req, res, next) => {
    if (req.path == "/multiply") {
        res.set("Content-Type", "application/json");
    } else {
        res.set("Content-Type", "text/html");
    }

    next();
});

//////////////////////////////////////////////////////////////////////
// Add these lines right after the connect-flash line:

app.use(require("./middleware/storeLocals"));

//////////////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
    // app.get("/", csrf_middleware, (req, res) => {
    // console.log("Home page!");
    // console.log("req.flash", res.flash);
    // console.log("req.body", res.body);
    // console.log("req.user = ", res.user);
    // console.log("req.cookie = ", req.header);
    // console.log("res.locals = ", res.locals);

    res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));
// app.use("/sessions", csrf_middleware, require("./routes/sessionRoutes"));

//////////////////////////////////////////////////////////////////////
// app.use("/secretWord", secretWordRouter);
app.use("/secretWord", auth, secretWordRouter);

// app.use("/secretWord", auth, csrf_middleware, secretWordRouter);
// app.use("/secretWord", [auth, csrf_middleware], secretWordRouter);

//////////////////////////////////////////////////////////////////////
// JOBs
app.use("/jobs", auth, jobsRouter);

//////////////////////////////////////////////////////////////////////
// testing week16
app.get("/multiply", (req, res) => {
    // console.log("multiply test : ", req.query);

    //
    const result = req.query.first * req.query.second;

    if (result.isNaN) {
        result = "NaN";
    } else if (result == null) {
        result = "null";
    }

    res.json({ result: result });
});

//////////////////////////////////////////////////////////////////////
// Error handling
app.use((req, res) => {
    res.status(404).send(`That page (${req.url}) was not found.`);
});

//
app.use((err, req, res, next) => {
    res.status(500).send(err.message);

    console.log(err);
});

/* ================================================================== */
// const port = process.env.PORT || 3000;

// const start = async () => {
//     try {
//         await require("./db/connect")(process.env.MONGO_URI);

//         app.listen(port, () =>
//             console.log(`Server is listening on port ${port}...`)
//         );
//     } catch (error) {
//         console.log(error);
//     }
// };

// start();

// testing week16
const port = process.env.PORT || 3000;

const start = () => {
    try {
        require("./db/connect")(mongoURL);

        return app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();

module.exports = { app };
