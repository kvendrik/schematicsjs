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
The next step is of course stating to use the library. Its quite simple: give it the URL to your schema and start hacking.
```javascript
new Schematics('https://api.example.com')
.then(function(api){

    api.articles.get()
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
    
    api.article.post({ date: new Date() })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

});
```


