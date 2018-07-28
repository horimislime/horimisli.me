var gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat');

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
