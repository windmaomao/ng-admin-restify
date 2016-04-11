/**
 * Gulp config
 *
 * @date 03/26/16
 * @author Fang Jin <fang-a.jin@db.com>
*/

var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var connect = require('gulp-connect');
var $ = require('gulp-load-plugins')();
var proxy = require('http-proxy-middleware');
var webpack = require('webpack-stream');
var jsonServer = require('gulp-json-srv');

var config = {
  pkg : JSON.parse(fs.readFileSync('./package.json')),
  src: '/src',
  dist: '/build',
  port: {
      ui: 8080,
      api: 8079
  },
  banner:
      '/*!\n' +
      ' * <%= pkg.name %>\n' +
      ' * <%= pkg.homepage %>\n' +
      ' * Version: <%= pkg.version %> - <%= timestamp %>\n' +
      ' * License: <%= pkg.license %>\n' +
      ' */\n\n\n'
};

gulp.task('default', ['build', 'connect']);

// server connect with support to proxy
gulp.task('connect', function() {
    jsonServer.start({
        data: 'build/rest.json',
        port: config.port.api,
        baseUrl: '/v1'
    });
    connect.server({
        root: 'build',
        port: config.port.ui,
        middleware: function(connect, opt) {
            return [
                proxy('/v1', {
                    target: 'http://localhost:' + config.port.api
                })
            ]
        }
    });
});

// build source files
gulp.task('build', function() {
    var webpackConfig = require('./webpack.config.js');
    return gulp.src('./src/app.js')
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('build/'))
    ;
});

// clean folder
gulp.task('clean', function() {
    return del(['build/*.js']);
});

// watch folder
gulp.task('watch', ['build'], function() {
    // gulp.watch(['src/**/*.{js}'], ['build']);
});

gulp.task('reload', function() {
    // gulp.src('dist/**/*.{css,js}')
    //     .pipe(connect.reload());
});

var handleError = function (err) {
  console.log(err.toString());
  this.emit('end');
};
