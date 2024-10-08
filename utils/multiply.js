// Cần tìm hiểu kĩ thêm
const multiply = (...arguments) => {
    let result = 1;

    for (let arg of arguments) result *= arg;

    return result;
};

/////////////////////////////////////////////////////////
module.exports = multiply;
