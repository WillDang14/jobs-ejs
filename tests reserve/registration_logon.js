const { app } = require("../app");

const { factory, seed_db } = require("../utils/seed_db");

const faker = require("@faker-js/faker").fakerEN_US;

const get_chai = require("../utils/get_chai");

const User = require("../models/User");

///////////////////////////////////////////////////////////////////////
describe("TESTs FOR REGISTRATION AND LOGON", function () {
    // after(() => {
    //   server.close();
    // });
    it("should get the registration page", async () => {
        const { expect, request } = await get_chai();

        // chú ý thêm "s" cho get("/session/register")
        const req = request.execute(app).get("/sessions/register").send();

        const res = await req;

        // console.log(res.text); // Cái này là html file in json format

        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Enter your name");

        const textNoLineEnd = res.text.replaceAll("\n", "");

        // CSRF  token
        // trả về 1 array
        const csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
        // console.log(csrfToken);
        expect(csrfToken).to.not.be.null;
        this.csrfToken = csrfToken[1];

        expect(res).to.have.property("headers");
        expect(res.headers).to.have.property("set-cookie");
        // console.log(res.headers);

        // cái này bao gồm "csrfToken" và "connect.sid"
        const cookies = res.headers["set-cookie"];
        // console.log(cookies);

        // cái này là csrfCookie, not csrfToken
        this.csrfCookie = cookies.find((element) =>
            element.startsWith("csrfToken")
        );
        console.log("registration page csrfCookie = ", this.csrfCookie);

        // tự thêm vô ==>> có thể không cần đến
        this.sidCookie = cookies.find((element) =>
            element.startsWith("connect.sid")
        );
        console.log("registration page sidCookie = ", this.sidCookie);

        //
        expect(this.csrfCookie).to.not.be.undefined;
        // tự thêm vô
        expect(this.sidCookie).to.not.be.undefined;
    });

    ////////////////////////////////////////////////
    it("should register the user", async () => {
        const { expect, request } = await get_chai();

        this.password = faker.internet.password();

        // we use factory.build, not factory.create, because we don't want the factory to store values in the database
        // factory.create => tạo data và lưu trên DB
        this.user = await factory.build("user", { password: this.password });

        const dataToPost = {
            name: this.user.name,
            email: this.user.email,
            password: this.password,
            password1: this.password,
            _csrf: this.csrfToken, // cần cái này vì mô phỏng của From HTML
        };

        console.log("register dataToPost = ", dataToPost);

        console.log("register csrfCookie = ", this.csrfCookie);

        const req = request
            .execute(app)
            .post("/sessions/register")
            .set("Cookie", this.csrfCookie)
            .set("content-type", "application/x-www-form-urlencoded")
            .send(dataToPost);

        const res = await req;

        // console.log("register res = ", res.text);

        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Jobs List"); // home page , in "head.ejs"

        newUser = await User.findOne({ email: this.user.email });

        console.log("register newUser = ", newUser);

        expect(newUser).to.not.be.null;
    });

    ////////////////////////////////////////////////
    // Testing Logon
    it("should log the user on", async () => {
        const dataToPost = {
            email: this.user.email,
            password: this.password,
            _csrf: this.csrfToken,
        };

        const { expect, request } = await get_chai();

        const req = request
            .execute(app)
            .post("/sessions/logon")
            .set("Cookie", this.csrfCookie)
            .set("content-type", "application/x-www-form-urlencoded")
            .redirects(0) //So, a better policy is to disable redirects by doing .redirects(0) on the request
            .send(dataToPost);

        const res = await req;

        // chú ý là logon success thì redirect to homepage "/"
        // console.log("Logon page = ", res.text); // Found. Redirecting to /

        expect(res).to.have.status(302);
        expect(res.headers.location).to.equal("/");

        // console.log("Logon page res.headers = ", res.headers);

        // chú ý là set-cookie = connect.sid (không có csrfCookie)
        console.log("Logon page res.headers = ", res.headers["set-cookie"]);

        // cookies = 'connect.sid= ... ; Path=/; HttpOnly; SameSite=Strict'
        // cookies này là "connect.sid" sẽ được lưu lại vào "sessionCookie"
        const cookies = res.headers["set-cookie"];

        // "sessionCookie" được trả về bởi Server và dùng ở bước kế sau khi Logon
        // và xác nhận là chính chủ
        this.sessionCookie = cookies.find((element) =>
            element.startsWith("connect.sid")
        );

        expect(this.sessionCookie).to.not.be.undefined;
    });

    it("should get the index page", async () => {
        console.log("index page sessionCookie = ", this.sessionCookie);
        console.log("index page csrfCookie = ", this.csrfCookie);

        const { expect, request } = await get_chai();

        const req = request
            .execute(app)
            .get("/")
            // .set("Cookie", this.csrfCookie)
            // .set("Cookie", this.sessionCookie)
            // .set("Cookie", this.csrfCookie + ";" + this.sessionCookie)
            .set("Cookie", [this.csrfCookie, this.sessionCookie])
            .send();

        const res = await req;

        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include(this.user.name);

        /* tự thêm vô */
        console.log(res.text);
    });

    ////////////////////////////////////////////////
    // Testing Logoff
    it("Testing Logoff", async () => {
        console.log("Logoff csrfCookie = ", this.csrfCookie);
        console.log("Logoff csrfToken = ", this.csrfToken);
        console.log("Logoff sessionCookie = ", this.sessionCookie);

        const { expect, request } = await get_chai();

        const dataToPost = {
            email: this.user.email,
            password: this.password,
            _csrf: this.csrfToken,
        };

        // console.log("Logoff dataToPost = ", dataToPost);

        const req = request
            .execute(app)
            .post("/sessions/logoff")
            .set("Cookie", [this.csrfCookie, this.sessionCookie])
            .set("content-type", "application/x-www-form-urlencoded") // chú ý phải có cái này
            .redirects("/") // In this case, you let Chai follow the redirect, that is, do not do .redirects(0)
            .send(dataToPost);

        const res = await req;

        // console.log(res.text);

        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("link to logon");
    });
});

///////////////////////////////////////////////////////////////////////
