var gulp = require('gulp'),
    spawn = require('child_process').spawn,
    webserver = require('gulp-webserver'),
    notifier = require('node-notifier'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    minimist = require('minimist'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat')
    ;

var SERVER_PORT = 4000;
var SERVER_ROOT = '_site/'

var knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'production' }
};
var options = minimist(process.argv.slice(2), knownOptions);

var Logger = function() {
  var logger = function() {
  };

  var _log = function(message) {
    console.log(message);
  };

  var _notify = function(title, message) {
    notifier.notify({
      title: title,
      message: message
    });
  };

  logger.prototype = {
    log : _log,
    notify : _notify
  };
  return logger;
}();

gulp.task('serve', function() {
  gulp.src(SERVER_ROOT)
    .pipe(webserver({
      livereload: true,
      open: true,
      port: SERVER_PORT
    }));
});

// Watch for changes
gulp.task('watch', function () {
    gulp.watch([
      '*.html',
      '*/*.html',
      '*.md',
      '*/*.md',
      '*/*.markdown',
      '_images',
      '_sass/*.scss',
      'js/*.js',
      '!_site/**',
      '!_site/*/**'
      ], ['jekyll']);
})

gulp.task('compress', function () {
    return gulp.src('./_images/**')
        .pipe(imagemin([
          imagemin.jpegtran({progressive: true}),
          imagemin.optipng({optimizationLevel: 5}),
          imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(gulp.dest('./images'));
});

gulp.task('minify', function() {
  return gulp.src('stylesheets/*.css')
    .pipe(cleanCSS({inline: ['local']}))
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('stylesheets'));
});

gulp.task('build', function (done) {

    var logger = new Logger();

    var args = ['build'];
    if (options.env === 'devel') {
        args.push('--unpublished');
        args.push('--future');
    }

    var jekyll = spawn('jekyll', args);

    jekyll.stderr.on('data', function(data) {
        logger.log("" + data);
        logger.notify('Build Error', data);
    });

    jekyll.on('exit', function (code) {
        var message = code ? 'error' : 'success'
        logger.log('Finished Jekyll Build : ' + message);
        done();
    });
});

gulp.task('publish', gulp.series('compress', 'minify', 'build'));
gulp.task('default', gulp.series('build', 'serve', 'watch'));
