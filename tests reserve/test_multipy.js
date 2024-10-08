const multiply = require("../utils/multiply");

const get_chai = require("../utils/get_chai");

///////////////////////////////////////////////////////////
describe("TESTING MULTIPLY", () => {
    //
    it("should give 7*6 is 42", async () => {
        const { expect } = await get_chai();

        expect(multiply(7, 6)).to.equal(42);
    });

    //
    // it("should give 7*6 is 97", async () => {
    //     const { expect } = await get_chai();

    //     expect(multiply(7, 6)).to.equal(97);
    // });
});

///////////////////////////////////////////////////////////
