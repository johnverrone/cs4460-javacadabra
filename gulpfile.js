var gulp = require('gulp');
var connect = require('gulp-connect');
var babel = require('gulp-babel');

gulp.task('connect', function() {
    connect.server({
        livereload: true,
        port: 8080
    });
});

gulp.task('babel', function() {
    gulp.src('./src/*.js')
        .pipe(babel())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('reload', function() {
    gulp.src('./dist/**/*.*')
        .pipe(connect.reload());
});

gulp.task('watch', function() {
    gulp.watch(['./src/*.js'], ['babel']);
    gulp.watch(['./dist/*.*'], ['reload']);
});

gulp.task('default', ['connect', 'watch', 'babel']);