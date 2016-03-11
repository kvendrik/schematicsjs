### Notes
* Back-end
    * **Schema** = clarity about what you can use and how
* **Front-end**
    * **GET Endpoints & URL Parameters** = dynamic endpoints, back-end can change endpoint without changes necessary in the client
    * **GET Schema POST/PUT/DELETE** = 
        * **Param names & Data type validation?**
            * Pro: saves requests
            * Con: more tasks on the client
            * > Do we need this? why not just 
        * **Get Expected Type for Param?**
            * `api.article.post.getDataType('username')` -> `String`
            * Pro: know what the API expects before doing anything
    *  **[Specify what fields you want back](https://facebook.github.io/react/blog/2015/05/01/graphql-introduction.html)**
        * `api.users.get({ id: 22191 }, ['name', 'age'])`
        * Pro: only transfer the data we need instead of the entire blob 
