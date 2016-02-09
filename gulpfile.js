
var gulp = require('gulp'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify');

gulp.task('dist', function () {
    'use strict';
    return gulp.src('dragon-annotated.js')
        .pipe(uglify())
        .pipe(rename('dragon.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
    'use strict';
    gulp.watch(['dragon-annotated.js']);
});

gulp.task('default', ['dist']);