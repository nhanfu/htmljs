var gulp = require('gulp'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify'),
    gulp = require('gulp'),
    qunit = require('node-qunit-phantomjs'),
    runSequence = require('run-sequence');

gulp.task('concat', function() {
  return gulp.src(['./src/html.engine.js', './src/html.ajax.js',
                    './src/html.ready.js', './src/html.router.js',
                    './src/html.script-loading.js', './src/html.import.js'])
    .pipe(concat('html.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('compress', function() {
  gulp.src('dist/html.js')
    .pipe(minify({
        ext:{
            min:'.min.js'
        },
        exclude: ['tasks'],
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('test', function() {
    qunit('./Tests/index.html');
});

gulp.task('build', function(callback) {
  runSequence('concat', ['compress', 'test'], callback);
});