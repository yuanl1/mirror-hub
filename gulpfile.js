var gulp = require('gulp');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling
var browserify = require('browserify'); // Our app bundler
var watchify = require('watchify'); // Update any source file and your bundle will be recompiled on the spot.
var reactify = require('reactify'); // Transforms jsx to js
var gulpif = require('gulp-if'); // conditionally run a task
var streamify = require('gulp-streamify'); // Wrap old Gulp plugins to support streams.
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var glob = require('glob'); // Match files using the patterns
var livereload = require('gulp-livereload');
var jasminePhantomJs = require('gulp-jasmine2-phantomjs');
var connect = require('gulp-connect');

// External dependencies you do not want to rebundle while developing,
// but include in your application deployment
var external_dependencies = [
	'react',
  'react-addons-test-utils'
];

var browserifyTask = function (options) {

  // Our app bundler
	var appBundler = browserify({
		entries: [options.src], // Only need initial file, browserify finds the rest
   	transform: [reactify], // We want to convert JSX to normal javascript
		debug: options.env == 'development', // Gives us sourcemapping
    fullPaths: options.env == 'development', // Disables converting module ids into numerical indexes
		cache: {}, packageCache: {}, // Requirement of watchify
	});


  // The rebundle process
  var rebundleApp = function () {
    var start = Date.now();
    console.log('Building APP bundle');

    appBundler.bundle()
      .on('error', gutil.log)
      .pipe(source('main.js'))
      .pipe(gulp.dest(options.dest))
      .pipe(gulpif(options.env == 'development', livereload()))
      .pipe(notify(function () {
        console.log('APP bundle built in ' + (Date.now() - start) + 'ms');
      }));
  };


  if (options.env == 'development') {
    // We set our dependencies as externals on our app bundler when developing
    appBundler.external(external_dependencies);

    // Fire up Watchify when developing
    appBundler.plugin(watchify);
    appBundler.on('update', rebundleApp);

    // Setup test bundler
  	var testFiles = glob.sync('./specs/**/*-spec.js');
		var testBundler = browserify({
			entries: testFiles,
			debug: true, // Gives us sourcemapping
			transform: [reactify],
      fullPaths: true,
			cache: {}, packageCache: {}, // Requirement of watchify
      plugin: [watchify]
		});

		testBundler.external(external_dependencies);

  	var rebundleTests = function () {
  		var start = Date.now();
  		console.log('Building TEST bundle');
  		testBundler.bundle()
      .on('error', gutil.log)
	      .pipe(source('specs.js'))
	      .pipe(gulp.dest(options.dest))
	      .pipe(livereload())
	      .pipe(notify(function () {
	        console.log('TEST bundle built in ' + (Date.now() - start) + 'ms');
	      }));
  	};

    testBundler.on('update', rebundleTests);

    // Setup vendor bundler
    var vendorsBundler = browserify({
      debug: true,
      require: external_dependencies // Make file(s) available from outside the bundle
    });

    var bundleVendors = function () {
      var start = new Date();
        console.log('Building VENDORS bundle');
        vendorsBundler.bundle()
          .on('error', gutil.log)
          .pipe(source('vendors.js'))
          .pipe(gulp.dest(options.dest))
          .pipe(notify(function () {
            console.log('VENDORS bundle built in ' + (Date.now() - start) + 'ms');
          }));
    };


  }

  rebundleApp();
  rebundleTests();
  bundleVendors();

};

var cssTask = function (options) {
  if (options.env == 'development') {
    var rebundleCss = function () {
      var start = new Date();
      console.log('Building CSS bundle');
      gulp.src(options.src)
        .pipe(concat('main.css'))
        .pipe(gulp.dest(options.dest))
        .pipe(notify(function () {
          console.log('CSS bundle built in ' + (Date.now() - start) + 'ms');
        }));
    };

    gulp.watch(options.src, rebundleCss);
    rebundleCss();
  } else {
    gulp.src(options.src)
      .pipe(concat('main.css'))
      .pipe(gulp.dest(options.dest));
  }
};

// Starts our development workflow
gulp.task('development', function () {
  livereload.listen();

  browserifyTask({
    env: 'development',
    src: './app/main.js',
    dest: './build'
  });

  cssTask({
    env: 'development',
    src: './styles/**/*.css',
    dest: './build'
  });

  connect.server({
    root: 'build/',
    port: 8889
  });

});

gulp.task('production', function () {

  browserifyTask({
    env: 'production',
    src: './app/main.js',
    dest: './dist'
  });

  cssTask({
    env: 'production',
    src: './styles/**/*.css',
    dest: './dist'
  });

  connect.server({
    root: 'dist/',
    port: 8888
  });

});

gulp.task('test', function () {
    return gulp.src('./build/testrunner-phantomjs.html').pipe(jasminePhantomJs());
});
