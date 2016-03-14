module.exports = function () {
    this.Given(/^I constructed a new instance$/, function (callback) {
        console.log('Given');
        callback();
    });

    this.When(/^the promise callback invokes$/, function (callback) {
        console.log('Given');
        callback();
    });

    this.Then(/^it should say the request is successful$/, function (callback) {
        console.log('Given');
        callback();
    });
};
