const WebPackHelper = require('./WebPackHelper'),
      helper = new WebPackHelper();

module.exports = helper.addConfig({
    devServer: {
        contentBase: 'examples/web',
        progress: true,
        stats: 'errors-only',
        host: '0.0.0.0',
        port: 9000
    },
    output: {
        path: helper.getRootPath()+'/examples/web',
        filename: 'schematics.js'
    }
}).getConfigs();
