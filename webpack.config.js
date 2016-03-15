const webpack = require('webpack');

var configs = [],
    baseConfig = {
        context: __dirname+'/src',
        entry: './index.js',
        output: {
            path: __dirname+'/dist',
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

var addConfig = function(options){
    var baseCopy = Object.assign({}, baseConfig),
        config = Object.assign(baseCopy, options);
    configs.push(config);
};

addConfig({});
addConfig({
    output: {
        path: __dirname+'/tests/web',
        filename: 'schematics.js'
    }
});
addConfig({
    output: {
        path: __dirname+'/dist',
        filename: 'schematics.min.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
                semicolons: true,
            },
        })
    ]
});

module.exports = configs;
