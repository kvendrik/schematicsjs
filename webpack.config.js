const webpack = require('webpack');
const PRODUCTION = process.env.PRODUCTION;

var config = {
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

if(PRODUCTION){
    config.output.filename = 'schematics.min.js';
    config.plugins = [new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
        },

        output: {
            comments: false,
            semicolons: true,
        },
    })];
}

module.exports = config;
