// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'client/bower_components/jquery/dist/jquery.js',
      'client/bower_components/jquery-ui/jquery-ui.js',
      'client/bower_components/jquery-waypoints/waypoints.js',
      'client/bower_components/jquery.lazyload/jquery.lazyload.js',
      'client/bower_components/es5-shim/es5-shim.js',
      'client/bower_components/json3/lib/json3.js',
      'client/bower_components/angular/angular.js',
      'client/bower_components/angular-animate/angular-animate.js',
      'client/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'client/bower_components/angular-elastic/elastic.js',
      'client/bower_components/angular-gettext/dist/angular-gettext.js',
      'client/bower_components/angular-loader/angular-loader.js',
      'client/bower_components/angular-local-storage/angular-local-storage.js',
      'client/bower_components/angular-mocks/angular-mocks.js',
      'client/bower_components/angular-resource/angular-resource.js',
      'client/bower_components/angular-socket-io/socket.js',
      'client/bower_components/angular-ui-router/release/angular-ui-router.js',
      'client/bower_components/angular-xeditable/dist/js/xeditable.js',
      'client/bower_components/angulartics/dist/angulartics-ga.min.js',
      'client/bower_components/blueimp-load-image/js/load-image.js',
      'client/bower_components/bootstrap/dist/js/bootstrap.js',
      'client/bower_components/angular-cookies/angular-cookies.js',
      'client/bower_components/angular-sanitize/angular-sanitize.js',
      'client/bower_components/lodash/dist/lodash.compat.js',
      'client/bower_components/ng-file-upload/angular-file-upload.js',
      'client/bower_components/ng-file-upload-shim/angular-file-upload-shim.js',
      'client/bower_components/ngImgCrop/compile/unminified/ng-img-crop.js',
      'client/bower_components/SHA-1/sha1.js',
      'client/components/base/**/*.js',
      // 'client/components/app/session/session.js',
      // 'client/components/app/analytics/analytics.js',
      // 'client/components/app/config/config.js',
      // 'client/components/app/language/language.js',
      // 'client/components/app/storage/storage.js',
      'client/components/app/**/*.js',
      'client/app/app.js',
      'client/app/**/*.js',
      'client/app/**/*.html'
    ],

    preprocessors: {
      '**/*.html': 'html2js',
      'client/**/*.js': ['coverage']
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'client/'
    },

    ngJade2JsPreprocessor: {
      stripPrefix: 'client/'
    },

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_WARN,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,
    reporters: ['coverage', 'junit'],
    junitReporter: {
      outputFile: 'test-junit-results.xml'
    }, 

    // code coverage report
    coverageReporter: {
      type: 'cobertura',
      dir: 'coverage/',
      file: 'coverage.xml'
    },

    colors: true
  });
};
