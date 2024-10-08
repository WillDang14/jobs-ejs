const puppeteer = require("puppeteer");

require("../app");

const { factory, seed_db, testUserPassword } = require("../utils/seed_db");

const Job = require("../models/Job");

const get_chai = require("../utils/get_chai");

//////////////////////////////////////////////////////////////////////////////
let testUser = null;

let newJob = null;

let page = null;
let browser = null;

// Create a delay function
function myDelay_ms(time_ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time_ms);
    });
}

//////////////////////////////////////////////////////////////////////////////
// Launch the browser and open a new blank page
// we call this.timeout() to set a reasonable number of milliseconds after which the operation should be abandoned.
describe("jobs-ejs puppeteer test", function () {
    before(async function () {
        this.timeout(10000);

        // puppeteer.launch() call actually launches the browser, which by default is a version of Chrome
        // browser = await puppeteer.launch();

        // rerun the test, you'll see the test in progress
        browser = await puppeteer.launch({
            headless: false,
            // slowMo: 100,
            slowMo: 20,
            defaultViewport: false, // tu them vo
        });

        page = await browser.newPage();

        await page.goto("http://localhost:3000");
    });

    after(async function () {
        this.timeout(5000);
        // this.timeout(60000);

        // await browser.close();
    });

    //////////////////////////////////////////////////////////////////////////////
    //
    describe("got to site", function () {
        it("should have completed a connection", async function () {
            await page.evaluate(async () => {
                await new Promise(function (resolve) {
                    setTimeout(resolve, 2000);
                });
            });
        });
    });

    /////////////////////////////////////////////////////////
    describe("index page test", function () {
        this.timeout(10000);

        // page.waitForSelector(): Waits for DOM entry matching the selector to appear on the page
        it("finds the index page logon link", async () => {
            this.logonLink = await page.waitForSelector(
                "a ::-p-text(Click this link to logon)"
            );
        });

        // page.waitForNavigation(): Waits for the next page to display.
        it("gets to the logon page", async () => {
            await this.logonLink.click({ delay: 1500 }); // click vào link tới logon page

            await page.waitForNavigation();

            const email = await page.waitForSelector('input[name="email"]');
        });
    });

    /////////////////////////////////////////////////////////
    describe("logon page test", function () {
        this.timeout(20000);

        // get DOM values trước
        it("Resolves all the fields", async () => {
            this.email = await page.waitForSelector('input[name="email"]');

            this.password = await page.waitForSelector(
                'input[name="password"]'
            );

            this.submit = await page.waitForSelector("button ::-p-text(Logon)");
        });

        // entry.type(): Types a value into an entry field.
        // entry.click(): Clicks on a button or other control.
        // chú ý là đang ở page Logon
        it("Sends the logon", async () => {
            testUser = await seed_db();

            // tu them vo
            console.log("logon page test - testUser = ", testUser);

            // điền thông tin vào form
            await this.email.type(testUser.email);
            await this.password.type(testUserPassword);

            // click vào link chuyển Form tới server
            await this.submit.click({ delay: 1500 });

            // sau đó chờ server chuyển về homepage
            await page.waitForNavigation();

            //
            await page.waitForSelector(
                `p ::-p-text(${testUser.name} is logged on.)`
            );

            await page.waitForSelector("a ::-p-text(change the secret)");
            await page.waitForSelector('a[href="/secretWord"]');

            const copyr = await page.waitForSelector("p ::-p-text(copyright)");

            // get text content of copyr and return its value
            const copyrText = await copyr.evaluate((el) => el.textContent);

            console.log("copyright text: ", copyrText);
        });
    });

    /////////////////////////////////////////////////////////
    describe("puppeteer job operations", function () {
        this.timeout(20000);

        // Cái này ở index page
        it("Find the jobs page link", async () => {
            this.jobsLink = await page.waitForSelector(
                "a ::-p-text(change the jobs)"
            );
        });

        // page.waitForNavigation(): Waits for the next page to display.
        // cái này chuyển đến jobs page
        it("Get to the jobs page", async () => {
            const { expect } = await get_chai();

            await this.jobsLink.click({ delay: 1500 });
            await page.waitForNavigation();

            // header ejs
            await page.waitForSelector(
                `p ::-p-text(${testUser.name} is logged on.)`
            );

            const pageContent = await page.content();
            // console.log(pageContent);

            // footer ejs
            const copyr = await page.waitForSelector("p ::-p-text(copyright)");
            const copyrText = await copyr.evaluate((el) => el.textContent);
            console.log("copyright text: ", copyrText);

            //
            expect(pageContent).to.include("Jobs List");
            expect(pageContent).to.include(testUser.name);
        });

        //
        it("Find the Add new job link", async () => {
            this.newJobLink = await page.waitForSelector(
                "button ::-p-text(Add new job)"
            );
        });

        //
        it("Get to Add A Job page", async () => {
            const { expect } = await get_chai();

            newJob = await factory.build("job");
            console.log("New Job data - newJob = ", newJob);

            await this.newJobLink.click({ delay: 2000 });
            await page.waitForNavigation();

            // header ejs
            await page.waitForSelector(
                `p ::-p-text(${testUser.name} is logged on.)`
            );

            const pageContent = await page.content();
            // console.log(pageContent);

            //
            expect(pageContent).to.include("Create New Job");

            ////////////////////////////////////////////////////////////
            // resolve fields
            this.company = await page.waitForSelector('input[name="company"]');
            this.position = await page.waitForSelector(
                'input[name="position"]'
            );

            this.createButton = await page.waitForSelector(
                "button ::-p-text(Create)"
            );

            myDelay_ms(1000);

            ////////////////////////////////////////////////////////////
            // Move this part to another it()
            //
            // // Fill the values to input
            // await this.company.type(newJob.company);
            // await this.position.type(newJob.position);

            // // Pick the value from select options
            // // https://pptr.dev/api/puppeteer.page.select
            // await page.select("select#status", newJob.status);

            // ////////////////////////////////////////////////////////////
            // // sau khi điền info xong thì nhấn Button Create and go back to jobs page
            // await this.createButton.click({ delay: 2000 });
            // await page.waitForNavigation();

            // // const pageContent2 = await page.content();
            // // console.log(pageContent2);

            // await page.waitForSelector(
            //     `p ::-p-text(${testUser.name} is logged on.)`
            // );

            // // check database again
            // const jobs = await Job.find({ createdBy: testUser._id });
            // // console.log(jobs);

            // const copyr = await page.waitForSelector("p ::-p-text(copyright)");
            // const copyrText = await copyr.evaluate((el) => el.textContent);
            // console.log("copyright text: ", copyrText);
        });

        //
        it("Create New Job!", async () => {
            // Fill the values to input
            await this.company.type(newJob.company);
            await this.position.type(newJob.position);

            // Pick the value from select options
            // https://pptr.dev/api/puppeteer.page.select
            await page.select("select#status", newJob.status);

            myDelay_ms(1000);
            ////////////////////////////////////////////////////////////
            // sau khi điền info xong thì nhấn Button Create and go back to jobs page
            await this.createButton.click({ delay: 1500 });
            await page.waitForNavigation();

            const pageContent = await page.content();
            // console.log(pageContent);

            await page.waitForSelector(
                `p ::-p-text(${testUser.name} is logged on.)`
            );

            // check database again
            const jobs = await Job.find({ createdBy: testUser._id });

            // console.log(jobs);
            // const copyr = await page.waitForSelector("p ::-p-text(copyright)");
            // const copyrText = await copyr.evaluate((el) => el.textContent);
            // console.log("copyright text: ", copyrText);

            myDelay_ms(1000);
        });
    });

    /////////////////////////////////////////////////////////
    // My Additional task
    describe("Job delete", function () {
        this.timeout(20000);

        it("Randomly delete an entry: ", async function () {
            // https://stackoverflow.com/questions/52224816/puppeteer-getting-list-of-elements-with-same-selector
            let deleteBtns = await page.$$("button ::-p-text(Delete)");

            await deleteBtns[
                Math.floor(deleteBtns.length * Math.random())
            ].click({ delay: 2000 });

            await page.waitForSelector(
                `p ::-p-text(${testUser.name} is logged on.)`
            );

            const pageContent = await page.content();
            // console.log(pageContent);

            // const copyr = await page.waitForSelector("p ::-p-text(copyright)");
            // const copyrText = await copyr.evaluate((el) => el.textContent);
            // console.log("copyright text: ", copyrText);

            ////////////////////////
            await myDelay_ms(4000);
        });
    });
});

/* 
Cách tạo delay cho page trước khi thực hiện bước kế tiếp

https://stackoverflow.com/questions/46919013/puppeteer-wait-n-seconds-before-continuing-to-the-next-line

await page.evaluate(async() => {
    await new Promise(function(resolve) { 
           setTimeout(resolve, 1000)
    });
});

OR 

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}

console.log('before waiting');
await delay(4000);
console.log('after waiting');
*/
