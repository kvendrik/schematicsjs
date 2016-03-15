var path = require('path');

var rootPath = path.join(__dirname, '../');

var WebPackHelper = function(){
    this._configs = [];

    this._baseConfig = {
        context: rootPath+'/src',
        entry: './index.js',
        output: {
            path: rootPath+'/dist',
            filename: 'schematics.js'
        },
        module: {
            loaders: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }]
        }
    };
};

WebPackHelper.prototype = {
    getRootPath: function(){
        return rootPath;
    },

    getConfigs: function(){
        return this._configs;
    },

    addConfig: function(options){
        var baseCopy = Object.assign({}, this._baseConfig),
            config = Object.assign(baseCopy, options);

        this._configs.push(config);
        return this;
    }
};

module.exports = WebPackHelper;
