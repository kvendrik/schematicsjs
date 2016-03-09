var Schematics = require('../../src'),
    request = require('request');

let httpMethod = function(settings){
    let doRequest = function(resolve, reject){
        let method = settings.type || 'get';

        request[method]({
            url: settings.url,
            data: settings.data,
            headers: {
                'User-Agent': 'schematicsjs'
            }
        }, function(err, res, body) {
            if(err){
                reject(err);
            } else {
                try {
                    let json = JSON.parse(body);
                    resolve(json);
                } catch(err) {
                    throw new Error(err);
                }
            }
        });
    };

    return new Promise(doRequest);
};

new Schematics('http://kvendrik.github.io/schematicsjs/test/schema.json', httpMethod)
.then(function(api){

    api.users.get({ username: 'kvendrik', limit: 5 })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

    api.events.post({ name: 'Koen' })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

});
