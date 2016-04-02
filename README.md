Schematics.js [WIP]
===================
#### An API communication experiment

### What is it?
The idea behind Schematics is to keep everything API in the API and provide the front-end with all the information it needs to know what the API wants. This in oppose to traditional ways in which there is basically initially no real communication between server and client on what the client can expect.

### Examples
Check out the [Web](https://github.com/kvendrik/schematicsjs/blob/gh-pages/examples/web/index.html) and [Node.js](https://github.com/kvendrik/schematicsjs/blob/feature/package-managers-support/examples/node/index.js) examples.

### Usage

#### #1 Schema
The first step is creating a schema which lays out what endpoints your API has and how to use them. You can use these schema's to navigate through your API. 

Basically every property in a `GET` response body named `$schema` is recognized as a schema so that you can send them along with your usual responses.
```json
{
    "$schema": {
        "users": "https://api.github.com/users{/username}{?limit,offset}",
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
        },
        "repos": "http://kvendrik.github.io/schematicsjs/examples/schema-repos.json"
    }
}
```

#### #2 Library
Grab the library:
* `npm i schematicsjs --save`
* `bower i schematicsjs --save`
* Grab the source from the `dist/` folder

Perfect! Now give the library the URL to your schema and your [HTTP method](#your-http-method) and start hacking. :)
```javascript
new Schematics('http://kvendrik.github.io/schematicsjs/examples/schema.json', httpMethod)
.then(function({ api, body }){

    api.users.get({ username: 'kvendrik', limit: 5 })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

    api.events.post({ name: 'Koen' })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

    //With GET requests you can also give in an array with fields you want 
    //back from the server. The server will receive these as a GET parameter 
    //named `return_fields[]`
    api.users.get({ username: 'kvendrik' }, ['id', 'url'])

    //get the raw schema object using getSchema
    api.getSchema()

});
```

![](http://i.giphy.com/TlQHWni5OwcCs.gif)

### Your HTTP method
While we aim to make things as easy for you as possible we also want to keep things as minimal and flexible as possible. Thats why we ask from you you provide the library with your own method to do HTTP requests.

#### Using a framework or library?
You might be able to simply use your framework's HTTP method. Using for example Angular? You can just pass in Angular's `$http` method. Using jQuery? With one extra line of code you can use jQuery's `$.ajax`.

Example with jQuery
```javascript
new Schematics('https://api.someurl.com', function(settings){
    //use a native JavaScript promise instead of jQuery's version
    return new Promise((resolve, reject) => $.ajax(settings).done(resolve).fail(reject));
});
```

Example with [Fetch](https://github.com/github/fetch)
```javascript
new Schematics('https://api.someurl.com', function(settings){
    return fetch(settings.url, { method: settings.type, body: JSON.stringify(settings.data) })
});
```

#### Custom method
A few requirements: your HTTP method should:
* Accept a settings object with:
    * `type`: the request type e.g. `GET`
    * `url`: the URL to send the request to
    * `data`: an object to store the request body or `GET` parameters in
* Return a `Promise`

Example
```javascript
new Schematics('https://api.someurl.com', function(settings){
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
