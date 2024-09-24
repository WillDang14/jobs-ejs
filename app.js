require("dotenv").config(); // to load the .env file into the process.env object

const express = require("express");
require("express-async-errors");
const app = express();

// .Protecting a Route
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");

/* ================================================================== */
app.set("view engine", "ejs");

app.use(require("body-parser").urlencoded({ extended: true }));

/* ================================================================== */
// Sessions
// These lines should be added before any of the lines that govern routes, such as the app.get and app.post statements
// require("dotenv").config(); // to load the .env file into the process.env object

const session = require("express-session");

//
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
    // may throw an error, which won't be caught
    uri: url,
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
// Add these lines right after the connect-flash line:

app.use(require("./middleware/storeLocals"));

app.get("/", (req, res) => {
    console.log("Home page!");
    console.log("req.flash", res.flash);
    console.log("req.body", res.body);
    // console.log("req.user = ", res.user);
    console.log("res.locals = ", res.locals);

    res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));

//////////////////////////////////////////////////////////////////////
// This is for Working with FLash
// app.get("/secretWord", (req, res) => {
//     console.log("req.sessionID = ", req.sessionID);
//     console.log("req.session = ", req.session);

//     if (!req.session.secretWord) {
//         req.session.secretWord = "syzygy";
//     }

//     res.locals.info = req.flash("info");

//     res.locals.errors = req.flash("error");

//     console.log("res.locals = ", res.locals);

//     res.render("secretWord", { secretWord: req.session.secretWord });
// });

// app.post("/secretWord", (req, res) => {
//     //
//     console.log("req.body = ", req.body);

//     // tạo array có tên là "error", có thể cho bao nhiêu message tùy ý
//     if (req.body.secretWord.toUpperCase()[0] == "P") {
//         req.flash("error", "That word won't work!");

//         req.flash("error", "You can't use words that start with p.");
//     } else {
//         req.session.secretWord = req.body.secretWord;

//         req.flash("info", "The secret word was changed.");
//     }

//     //
//     res.redirect("/secretWord");
// });

// app.use("/secretWord", secretWordRouter);
app.use("/secretWord", auth, secretWordRouter);

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
const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await require("./db/connect")(process.env.MONGO_URI);

        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
