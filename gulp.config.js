// Define Default Paths
var path = {
    vendorFilePath: 'node_modules/',
    app: "./"
};
var config = {
    rootPath: "./",
    assetsPath: path.app + "/assets/",
    vendorCss: {
        dist: path.app + "/assets/css/",
        src: []
    },
    vendorJs: {
        dist: path.app + "/assets/js",
        src: [
            path.vendorFilePath + "jquery/dist/jquery.min.js",
            path.vendorFilePath + "bootstrap/dist/js/bootstrap.min.js",
            path.vendorFilePath + "underscore/underscore-min.js"
        ]
    },
    styleSheets: {
        dist: path.app + "/assets/css",
        src: [path.app + '/assets/sass/*.scss']
    },
    scripts: {
        dist: path.app + "/assets/js",
        src: [
            path.app + '/components/**/*.js'
        ]
    }

};

module.exports = config;