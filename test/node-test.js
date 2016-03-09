new Schematics('http://localhost:9000/schema.json')
.then(function(api){

    api.users.get({ username: 'kvendrik', limit: 5 })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

    api.events.post({ name: 'Koen' })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

});