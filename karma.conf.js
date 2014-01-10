module.exports = function(karma) {
    'use strict';
    karma.set({

        // base path, that will be used to resolve files and exclude
        basePath: '',


        // frameworks to use
        frameworks: ['mocha', 'requirejs'],


        // list of files / patterns to load in the browser
        files: [
            'js/bower_components/requirejs/require.js',
            'js/bower_components/jquery/jquery.js',
            'js/bower_components/lodash/dist/lodash.compat.js',
            'js/bower_components/backbone/backbone.js',
            'js/bower_components/react/react.js',
            'js/components/answers-model.js',
            'js/components/answer-collection.js',
            'node_modules/should/should.js',
            'test/answer-collection.spec.js'
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress'],


        // web server port
        port: 9998,


        // enable / disable colors in the output (reporters and logs)
        colors: false,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: karma.LOG_DEBUG,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        browsers: ['Chrome'],


        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 6000,


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true
    });
};