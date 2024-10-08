const { app } = require("../app");

const get_chai = require("../utils/get_chai");

////////////////////////////////////////////////////////////
describe("TEST GETTING A PAGE", function () {
    //
    it("should get the index page", async () => {
        //
        const { expect, request } = await get_chai();

        const req = request.execute(app).get("/").send();

        const res = await req;

        // console.log(res);
        // console.log(res.text); // Cái này là html file in json format

        expect(res).to.have.status(200);

        expect(res).to.have.property("text");

        expect(res.text).to.include("Click this link");
    });
});
