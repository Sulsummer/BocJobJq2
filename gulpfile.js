'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    runSequence = require('run-sequence'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    inject = require('gulp-inject');

var app  = {
        scss: 'app/css/*.scss'
    },
    dist = {
        css: 'app/css/'
    };

gulp.task('server', ['build:scss'], function(){
    browserSync.init({
        server: './'
    });

    gulp.watch(['app/*', 'app/*.*', 'app/*/*.*'], ['build:scss']).on('change', browserSync.reload);
});
gulp.task('build:scss', function() {
    return gulp.src(app.scss)
            .pipe(sass())
            .pipe(concat('main.css'))
            .pipe(gulp.dest(dist.css));
});

gulp.task('default', ['server']);

