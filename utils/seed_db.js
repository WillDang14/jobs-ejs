const Job = require("../models/Job");
const User = require("../models/User");

//
const faker = require("@faker-js/faker").fakerEN_US;
const FactoryBot = require("factory-bot");

require("dotenv").config();

//
const testUserPassword = faker.internet.password();
const factory = FactoryBot.factory;
const factoryAdapter = new FactoryBot.MongooseAdapter();

////////////////////////////////////////////////////////////////////////////////////
factory.setAdapter(factoryAdapter);

//
factory.define("job", Job, {
    company: () => faker.company.name(),
    position: () => faker.person.jobTitle(),
    status: () =>
        ["interview", "declined", "pending"][Math.floor(3 * Math.random())], // random one of these
});

//
factory.define("user", User, {
    name: () => faker.person.fullName(),
    email: () => faker.internet.email(),
    password: () => faker.internet.password(),
});

//
const seed_db = async () => {
    let testUser = null;

    try {
        const mongoURL = process.env.MONGO_URI_TEST;

        await Job.deleteMany({}); // deletes all job records, cái này là xóa hết data trên DB

        await User.deleteMany({}); // and all the users, cái này là xóa hết data trên DB

        // Chú ý: cái này là tạo "user" dựa trên "User" trong models của MongoDB
        // chú ý là "create" sẽ tạo "user" trên MongoDB
        // khác với factory.build chỉ đơn giản là tạo variable trên memory
        testUser = await factory.create("user", { password: testUserPassword });

        // tương tự như tạo "job" dựa trên models của "Job"
        // await factory.createMany("job", 20, { createdBy: testUser._id }); // put 30 job entries in the database.
        await factory.createMany("job", 2, { createdBy: testUser._id }); // put 30 job entries in the database.
    } catch (e) {
        console.log("database error");

        console.log(e.message);

        throw e;
    }

    return testUser;
};

////////////////////////////////////////////////////////////////////////////////////
module.exports = { testUserPassword, factory, seed_db };
