/* jshint node: true, browser: false */
/* globals global, require, process, -$ */

'use strict';

// ==================================== REQUIRES ==================================================== //

let gulp = require('gulp');

let path = require('path');

let run_sequence = require('run-sequence');

let $ = require('gulp-load-plugins')({
	camelize: true
});

let exit = function() {
	setTimeout(function() {
		process.exit(0);
	}, 100);
};

global.api_path = path.join(__dirname, '/');

// ==================================== Default Task `gulp` ==================================================== //

gulp.task('default', ['test']);

// ====================================  Test ============================================================ //

gulp.task('clean-test-reports', $.shell.task([
	'test -d test-reports && rm -rf test-reports || echo "[ Clean Test Reports ] No Test Reports Folder"',
	'test -d test-coverage && rm -rf test-coverage || echo "[ Clean Test Coverage ] No Test Coverage Folder"'
]));

gulp.task('istanbul', function () {
	return gulp.src(['./**/*.js',
		'!./index.js', '!./gulpfile.js',
		'!./{test-coverage,test-coverage/**}',
		'!./bower_components/**',
		'!./node_modules/**'])
		.pipe($.istanbul({ includeUntested: true }))
		.pipe($.istanbul.hookRequire());
});

gulp.task('jsinspect', function () {
	return gulp.src(['./**/*.js',
		'!./tests/**', '!./gulpfile.js',
		'!./{test-coverage,test-coverage/**}',
		'!./bower_components/**',
		'!./node_modules/**'])
		.pipe($.jsinspect({
			'suppress': 0,
			'threshold': 30,
			'identifiers': true
		}));
});

gulp.task('lint', function() {
	return gulp.src(['./**/*.js',
		'!./{test-coverage,test-coverage/**}',
		'!./bower_components/**',
		'!./node_modules/**'])
		.pipe($.jshint())
		.pipe($.jshint.reporter('jshint-stylish'))
		.pipe($.jshint.reporter('fail'));
});

gulp.task('lint-ci', function() {
	return gulp.src(['./**/*.js',
		'!./{test-coverage,test-coverage/**}',
		'!./bower_components/**',
		'!./node_modules/**'])
		.pipe($.jshint())
		.pipe($.jshint.reporter('gulp-checkstyle-jenkins-reporter', {
			filename:'./test-reports/api-jshint-tests-report.xml'
		}));
});

gulp.task('mocha', function(){
	return gulp.src('tests/index.js')
		.pipe($.shell(['export NODE_TLS_REJECT_UNAUTHORIZED=0']))
		.pipe(gulp.src('tests/index.js', { read: false }))
		.pipe($.mocha({ reporter: 'spec', timeout: 20000 }))
		.pipe($.istanbul.writeReports({ dir: './test-coverage' }))
		.pipe($.istanbul.enforceThresholds({ thresholds: { global: 90 } }))
		.on('end', function(){ return gulp.start('clean-test-reports'); });
});

gulp.task('mocha-ci', function(){
	return gulp.src('tests/index.js')
		.pipe($.shell(['export NODE_TLS_REJECT_UNAUTHORIZED=0']))
		.pipe(gulp.src('tests/index.js', { read: false }))
		.pipe($.mocha({
			timeout: 20000,
			reporter: 'mocha-jenkins-reporter',
			reporterOptions: {
				junit_report_stack: 1,
				junit_report_name: 'API Tests',
				junit_report_path: './test-reports/api-mocha-tests-report.xml'
			}
		}))
		.pipe($.istanbul.writeReports({
			dir: './test-coverage',
			reporters: [ 'lcov', 'json', 'text', 'text-summary', 'cobertura' ]
		}))
		.pipe($.istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task('test', function(done) {
	return run_sequence('istanbul', 'jsinspect', 'lint', 'mocha', function() {
		exit(); done();
	});
});

gulp.task('test-ci', function(done){
	return run_sequence('clean-test-reports', 'istanbul', 'jsinspect', 'lint-ci', 'mocha-ci', function() {
		exit(); done();
	});
});
