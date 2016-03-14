# get-schema.feature

Feature: Get Schema
    As a user of Schematics.js
    I want to be able to fetch my schema from my API
    So that I can start working with the API

    Scenario: Request Successful
        Given I constructed a new instance
        When the promise callback invokes
        Then it should say the request is successful
