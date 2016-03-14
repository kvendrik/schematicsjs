module.exports = function () {
    this.Given(/^I am on the Cucumber.js GitHub repository$/, function (callback) {
        console.log('Given');
        callback();
    });

    this.When(/^I go to the README file$/, function (callback) {
        console.log('Given');
        callback();
    });

    this.Then(/^I should see "(.*)" as the page title$/, function (title, callback) {
        console.log('Given');
        callback();
    });
};
