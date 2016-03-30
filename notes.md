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
* Working with nested schema's
