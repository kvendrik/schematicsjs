Schematics.js
=============
#### An API communication experiment

### What is it?
The idea behind Schematics is to keep everything API in the API and provide the front-end with all the information it needs to know what the API wants. This in oppose to traditional ways in which there is basically initially no real communication between server and client on what the client can expect.

### Example

#### #1 Schema
The first step is creating a schema which lays out what endpoints your API has and how to use them.
```json
{
    "users": "https://api.github.com/users/:username?limit&offset",
    "emojis": "https://api.github.com/emojis",
    "events": {
        "post": {
            "href": "https://api.github.com/events",
            "params": {
                "name": "String",
                "date": { "type": "String", "optional": true }
            }
        },
        "get": "https://api.github.com/events"
    }
}
```

#### #2 Library
Perfect! Now give the library the URL to your schema and your [HTTP method](#your-http-method) and start hacking. :)
```javascript
new Schematics('http://kvendrik.github.io/schematicsjs/test/schema.json', httpMethod)
.then(function(api){

    api.users.get({ username: 'kvendrik', limit: 5 })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

    api.events.post({ name: 'Koen' })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

});
```

![](http://i.giphy.com/TlQHWni5OwcCs.gif)

### Your HTTP method
While we aim to make things as easy for you as possible we also want to keep things as minimal and flexible as possible. Thats why we ask from you you provide the library with your own method to do HTTP requests.

**Interested in testing out the above example real quick?**<br>You can use the method we use for testing purposes which you can find [here](http://kvendrik.github.io/schematicsjs/test/ajax.js).

#### Using a framework?
You might be able to simply use your frameworks HTTP method. With for example Angular you can just pass in Angular's `$http` method.

#### Custom method
A few requirements: your HTTP method should:
* Accept a settings object with:
    * `type`: the request type e.g. `GET`
    * `url`: the URL to send the request to
    * `data`: an object to store the request body in
* Return a `Promise`

Example
```javascript
new Schematics('http://kvendrik.github.io/schematicsjs/test/schema.json', function(settings){
    let doRequest = function(resolve, reject){
        //do request based on settings
    };
    return new Promise(doRequest);
});
```

### Schema Syntax
Some things you might find useful to know:

* `GET`
    * A details object with a `href` is optional
    * Queries can be defined with just their key e.g. `?offset&limit`
    * Queries are always optional
    * Parameters can be defined using `:` e.g. `/:username`
    * Parameters are always required
* `POST`, `PUT` & `DELETE`
    * These all require a details object
    * This should contain a `href` String and a `params` Object
    * Params
        * An object with the properties that should go into the request body
        * As value you specify the data type the property should be
        * Currently only JavaScript data types are supported, these include: String, Number, Date, Array, Object and Boolean
        * These properties are required by default
        * If you would like to make a property optional define a details Object instead of the data type String e.g. `{ "type": "String", "optional": true }`
