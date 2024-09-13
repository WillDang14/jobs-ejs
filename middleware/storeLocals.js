const storeLocals = (req, res, next) => {
    if (req.user) {
        res.locals.user = req.user;
        // res.locals.myUser = req.user;
    } else {
        res.locals.user = null;
        // res.locals.myUser = null;
    }

    res.locals.info = req.flash("info");

    res.locals.errors = req.flash("error");

    console.log("storeLocals : ", res.locals);

    next();
};

////////////////////////////////////////////////////
module.exports = storeLocals;

/* 
https://stackoverflow.com/questions/59921602/make-variable-available-globally-in-ejs-templates

Express res.locals object is used for this purpose. you just need to add an auth check middle-ware for the private routes. and add it to the locals object of the response which "will be accessible inside the ejs".


https://expressjs.com/en/api.html#res.locals

res.locals 
==>> Use this property to set variables accessible in templates rendered with res.render. The variables set on res.locals are available within a single request-response cycle, and will not be shared between requests.
==>>The locals object is used by view engines to render a response.



Hết sức chú ý:
res.locals là 1 "object" trong Express. Có công dụng là có thể set variables cho EJS dùng được.

==>> ví dụ: khi set 
                res.locals.myUser = req.user
            ==>> tức là tạo 1 biến có tên là "myUser" để các file EJS có thể sử dụng được


*/
