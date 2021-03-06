### Notes
* [x] **Schema**
    * Pro: clarity about what you can use and how
* [x] **GET Endpoints & URL Parameters**
    * Pro: dynamic endpoints, back-end can change endpoint without changes necessary in the client
* [x] **GET Schema POST/PUT/DELETE**
    * **Param names & Data type validation?**
        * Pro: saves requests
        * Con: more tasks on the client
        * > Do we need this?
* [x] **Get Schema**
    * `api.getSchema()`
    * Pro: know what the API expects before doing anything
* **Cache**
    * Cache GET request reponses
    * Provide option to not use the cache but actually do the request
* **Do `GET` to multiple endpoints with one call**
    * Could do a `POST` instead of a `GET` with endpoint names and params but might be not very REST like 
*  [Things we can learn from GraphQL](http://graphql.org/) - [Spec](http://facebook.github.io/graphql/)
    * Be able to specify what fields the client wants back
        * `api.users.get({ id: 22191 }, ['name', 'city.street'])`
        * Pro: only transfer the data we need instead of the entire blob
* **Working with nested schema's**
    * `api.repo.get({ id: 2891 }).then((api, schema) => api.issues.get({ status: 'open' }));`
* **Switch to using [JSON schema's](http://json-schema.org/examples.html)?**
* **Switch to Github Like Schema with Ability to add data to schema?**
* **API Design Resource: [JSON Style Guide](https://google.github.io/styleguide/jsoncstyleguide.xml)**

##### Example: Github Like Schema & Add Schema to Normal Response

Pros:
* Ability to do nested schema's
* No extra requests as the schema is shipped with the data

```json
{
    "userId": 132,
    "username": "mattivdweem",
    "awesomeLevel": "over9000",
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
        }
    }
}
```
```javascript
new Schematics('http://kvendrik.github.io/schematicsjs/tests/schema.json', httpMethod)
.then((data, schema) => schema.users.get()); //url = https://api.github.com/users
.then((data, schema) => schema.users.get({ 'username': 'mattivdweem' })); //url = https://api.github.com/users/mattivdweem
```

