const webpack = require('webpack'),
      WebPackHelper = require('./WebPackHelper'),
      helper = new WebPackHelper();

helper.addConfig({});
helper.addConfig({
    output: {
        path: helper.getRootPath()+'/tests/web',
        filename: 'schematics.js'
    }
});
helper.addConfig({
    output: {
        path: helper.getRootPath()+'/dist',
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

module.exports = helper.getConfigs();
