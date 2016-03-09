const browserify = require('browserify'),
	  gulp = require('gulp'),
      connect = require('gulp-connect'),
      rename = require('gulp-rename'),
      uglify = require('gulp-uglify'),
      source = require('vinyl-source-stream'),
      buffer = require('vinyl-buffer');

gulp.task('serve-test', () => {
    connect.server({
        livereload: true,
        host: '0.0.0.0',
        port: 9000,
        root: 'tests/web'
    });
});

gulp.task('watch', () => {
    gulp.watch('src/**/*.js', ['browserify']);
});

gulp.task('browserify', () => {
	browserify('src/index.js')
	  .transform('babelify', { presets: ["es2015"] })
	  .bundle()
      .pipe(source('schematics.js'))
      .pipe(buffer())
	  .pipe(gulp.dest('dist'))
      .pipe(gulp.dest('tests/web'))

      .pipe(uglify())
      .pipe(rename('schematics.min.js'))
      .pipe(gulp.dest('dist'))

      .pipe(connect.reload());
});

gulp.task('default', ['serve-test', 'watch']);
