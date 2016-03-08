Schematics.js
=============
#### A cool API communication experiment

### What is it?
The idea behind Schematics is to keep everything API in the API and provide the front-end with all the information it needs to know what the API wants. This in oppose to traditional ways in which there is basically initially no real communication between server and client on what the client can expect.

### Example

#### #1 Schema
The first step is creating a schema which lays out what endpoints your API has and how to use them.
```json
{
    "users": "https://api.github.com/users/:username",
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
The next step is of course stating to use the library. Its quite simple: give it the URL to your schema and start hacking.
```javascript
new Schematics('http://kvendrik.github.io/schematicsjs/test/schema.json')
.then(function(api){

    api.users.get({ username: 'kvendrik' })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

    api.events.post({ name: 'Koen' })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

});
```


