var gulp = require('gulp');
var concat = require('gulp-concat');
// var uglify = require('gulp-uglify');
var minify = require('gulp-minify');

gulp.task('js', function(){
   return gulp.src(['js/*.js'])
        .pipe(concat('index.js'))
        .pipe(minify())
        // .pipe(uglify())
        .pipe(gulp.dest('min'));
});