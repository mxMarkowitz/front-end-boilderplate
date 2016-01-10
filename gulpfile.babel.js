"use strict"

import browserify from 'browserify';
import gulp       from 'gulp';
import concat     from 'gulp-concat';
import connect    from 'gulp-connect';
import lint       from 'gulp-eslint';
import less       from 'gulp-less';
import minifyCSS  from 'gulp-minify-css';
import streamify  from 'gulp-streamify';
import uglify     from 'gulp-uglify';
import gutil      from 'gulp-util';
import source     from 'vinyl-source-stream';
import history    from 'connect-history-api-fallback';
import paths      from 'vinyl-paths';

const config = {
    port: 3003,
    devbaseUrl: 'http://localhost',
    paths: {
        html: './src/*.html',
        js: './src/**/*.js',
        less: './src/components/**/*.less',
        dist: './dist',
        mainJs: './src/main.js',
        images: './src/img/*'
    }
}

//Start a local development server
gulp.task('connect', function() {
    connect.server({
        root: ['dist'],
        https: true,
        port: config.port,
        base: config.devBaseUrl,
        livereload: true,
        middleware: function(connect, opt) {
            return [ history() ];
        }
    });
});

gulp.task('open', ['connect'], function() {
    gulp.src('dist/index.html')
        .pipe(open({ uri: config.devBaseUrl + ':' + config.port + '/'}));
});

gulp.task('html', function() {
    gulp.src(config.paths.html)
        .pipe(gulp.dest(config.paths.dist))
        .pipe(connect.reload());
});

gulp.task('js-dev', function() {
    browserify(config.paths.mainJs)
        .transform("babelify", {presets: ["es2015", "react"]})
        .bundle()
        .on('error', mapError)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(config.paths.dist + '/scripts'))
        .pipe(connect.reload());
});


gulp.task('js', function() {
    browserify(config.paths.mainJs)
        .transform("babelify", {presets: ["es2015", "react"]})
        .bundle()
        .on('error', mapError)
        .pipe(source('bundle.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest(config.paths.dist + '/scripts'))
        .pipe(connect.reload());
});

gulp.task('images', function () {
    gulp
        .src(config.paths.images)
        .pipe(gulp.dest(config.paths.dist + '/images'))
        .pipe(connect.reload());

    //publish favicon TODO: delete old favicon
    return gulp
        .src(config.paths.dist + '/images/favicon.ico')
        .pipe(gulp.dest(config.paths.dist))
});

gulp.task('less', function(){
    return gulp
        .src(config.paths.less)
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(concat('style.css'))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('less-dev', function(){
    return gulp
        .src(config.paths.less)
        .pipe(less())
        .pipe(concat('style.css'))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('lint', function() {
    return gulp.src(config.paths.js)
        .pipe(lint({config: 'eslint.config.json'}))
        .pipe(lint.format());
});

gulp.task('clean', function(){
    del(['./dist/css/common/constants.css', './dist/images/favicon.ico']);
});

gulp.task('watch', function() {
    //setup debug and release watch paths
    gulp.watch(config.paths.html, ['html']);
    gulp.watch(config.paths.html, ['images']);
    gulp.watch(config.paths.less, ['less-dev']);
    gulp.watch(config.paths.js, ['js-dev']);
});

gulp.task('default', ['html', 'js-dev', 'images', 'less-dev', 'clean', 'connect', 'watch']);
gulp.task('release', ['html', 'js', 'less', 'lint', 'connect', 'watch']);