process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
    publicPath: '',
    pwa: {
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            swSrc: 'service-worker.js',
        }
    }
};
