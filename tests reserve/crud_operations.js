const { app } = require("../app");

const { factory, seed_db, testUserPassword } = require("../utils/seed_db");

const get_chai = require("../utils/get_chai");

const Job = require("../models/Job");

// const { factory, seed_db } = require("../utils/seed_db");
// const faker = require("@faker-js/faker").fakerEN_US;
// const User = require("../models/User");

///////////////////////////////////////////////////////////////////////
describe("Testing Job CRUD Operations", function () {
    //
    before(async () => {
        const { expect, request } = await get_chai();

        this.test_user = await seed_db();

        // console.log(this.test_user);

        // gửi req lên server
        let req = request.execute(app).get("/sessions/logon").send();

        // nhận res từ server
        let res = await req;

        // console.log(res);

        // trích xuất "_csrf"
        const textNoLineEnd = res.text.replaceAll("\n", "");
        this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];

        // console.log("before csrfToken = ", this.csrfToken);

        let cookies = res.headers["set-cookie"];

        // chú ý là chứa 2 cookies là "csrfToken" và "connect.sid"
        console.log("before 1 cookies = ", cookies);

        this.csrfCookie = cookies.find((element) =>
            element.startsWith("csrfToken")
        );

        // console.log("before csrfCookie = ", this.csrfCookie);

        const dataToPost = {
            email: this.test_user.email,
            password: testUserPassword,
            _csrf: this.csrfToken,
        };

        // gửi request để logon
        req = request
            .execute(app)
            .post("/sessions/logon")
            .set("Cookie", this.csrfCookie)
            .set("content-type", "application/x-www-form-urlencoded")
            .redirects(0)
            .send(dataToPost);

        res = await req;

        cookies = res.headers["set-cookie"];

        // Lần thứ 2 chỉ có "connect.sid"
        console.log("before 2 cookies = ", cookies);

        this.sessionCookie = cookies.find((element) =>
            element.startsWith("connect.sid")
        );

        expect(this.csrfToken).to.not.be.undefined;
        expect(this.sessionCookie).to.not.be.undefined;
        expect(this.csrfCookie).to.not.be.undefined;
    });

    ////////////////////////////////////////////////
    // Chú ý phải có it() thì mới kích hoạt được before()
    it("Get the job list", async () => {
        // console.log("Job Entries");
        // console.log(this.sessionCookie);

        const { expect, request } = await get_chai();

        req = request
            .execute(app)
            .get("/jobs")
            .set("Cookie", this.sessionCookie)
            .send();

        const res = await req;

        // console.log(res.text);

        // const pageParts = res.text.split("<tr>");
        // expect(pageParts).to.equal(21); // error

        const pageParts = res.text.split("<tr>");

        // console.log(pageParts);

        expect(pageParts.length).to.equal(3);
    });

    ////////////////////////////////////////////////
    // Testing Add a job entry
    it("Testing Add a job entry", async () => {
        // console.log("Logoff csrfCookie = ", this.csrfCookie);
        // console.log("Logoff csrfToken = ", this.csrfToken);
        // console.log("Logoff sessionCookie = ", this.sessionCookie);

        const { expect, request } = await get_chai();

        this.job = await factory.build("job");

        console.log("Add a job entry Job = ", this.job);

        const dataToPost = {
            company: this.job.company,
            position: this.job.position,
            status: this.job.status,
            _csrf: this.csrfToken, // cần cái này vì mô phỏng của From HTML
        };

        const req = request
            .execute(app)
            .post("/jobs")
            .set("Cookie", [this.csrfCookie, this.sessionCookie])
            .set("content-type", "application/x-www-form-urlencoded")
            .send(dataToPost);

        const res = await req;
        // console.log(res.text);

        const jobs = await Job.find({ createdBy: this.test_user._id });
        // console.log(jobs);
        expect(jobs.length).to.equal(3);
    });
});

///////////////////////////////////////////////////////////////////////
