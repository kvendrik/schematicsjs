### Notes
* **Schema**
    * Pro: clarity about what you can use and how
* **GET Endpoints & URL Parameters**
    * Pro: dynamic endpoints, back-end can change endpoint without changes necessary in the client
* **GET Schema POST/PUT/DELETE**
    * **Param names & Data type validation?**
        * Pro: saves requests
        * Con: more tasks on the client
        * > Do we need this?
* **Get Expected Type for Param?**
    * `api.article.post.getDataType('username')` -> `String`
    * Pro: know what the API expects before doing anything
*  [Things we can learn from GraphQL](http://graphql.org/) - [Spec](http://facebook.github.io/graphql/)
    * Be able to specify what fields the client wants back
        * `api.users.get({ id: 22191 }, ['name', 'city.street'])`
        * Pro: only transfer the data we need instead of the entire blob
