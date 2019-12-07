var gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat');

gulp.task('minify', function() {
  return gulp.src('stylesheets/*.css')
    .pipe(cleanCSS({inline: ['local']}))
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('stylesheets'));
});
