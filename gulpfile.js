const fs = require('fs'),
	  browserify = require('browserify'),
	  gulp = require('gulp');
 
gulp.task('default', () => {
	browserify('src/index.js')
	  .transform('babelify', {presets: ["es2015", "react"]})
	  .bundle()
	  .pipe(fs.createWriteStream('dist/schematics.js'));
});