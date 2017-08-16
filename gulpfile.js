var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('default', () => {
    gulp.src('./styles.scss')
        .pipe(sass())
        .pipe(gulp.dest('./'));
});