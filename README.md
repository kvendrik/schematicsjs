Schematics.js
=============
#### A cool API communication experiment

### What is it?
The idea behind Schematics.js to provide the front-end with a dynamic and adaptive way to communicate with an API. Keep everything API in the API and allow easy communication.

### Example
I can go on and lay out precisely what Schematics.js is and how it works but I personally always tend to perfer a code example so here it is:

#### #1 Schema
So as mentioned above the idea behind Schematics is to keep everything API in the API but provide the front-end with all the information it needs to know what the API wants. Thats why the first step is creating a schema which lays out what endpoints your API has and how to use them.
```json
{
    "user": "https://api.github.com/user/:username",
    "articles": "https://api.github.com/articles",
    "article": {
        "post": {
            "href": "https://api.github.com/article",
            "params": {
                "name": { "type": "String", "optional": true },
                "date": "Date"
            }
        },
        "get": "https://api.github.com/article/:id"
    }
}
```

#### #2 Library
The next step is of course stating to use the library. Its quite simple: you give it the URL to your schema and you can start using it.
```javascript
new Schematics('https://api.example.com')
.then(function(api){

    api.articles.get()
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

});
```


