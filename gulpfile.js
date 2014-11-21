var gulp = require('gulp');
var gutil = require('gulp-util');

var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var eventStream = require('event-stream');
var uglify = require('gulp-uglify');
var del = require('del');

var livereload = require('gulp-livereload');
var watch = require('gulp-watch');
var less = require('gulp-less');
var templateCache = require('gulp-angular-templatecache');
var header = require('gulp-header');
var htmlmin = require('gulp-htmlmin');
var fileSort = require('gulp-angular-filesort');
var size = require('gulp-size');
var rename = require('gulp-rename');

var chalk = require('chalk');

var ignore = require('gulp-ignore');

var tsProject = ts.createProject({
    sortOutput: true,
    declarationFiles: true,
    target: 'es5',
    sourceRoot: '../',
    noExternalResolve: true
});

var sourceMapsOutOptions = {
    includeContent: false,
    //sourceRoot: '../'
};

gulp.task('color', function() {
    gutil.log(chalk.black('black') + chalk.red('red') + chalk.green('green') + chalk.yellow('yellow') + chalk.blue('blue') + chalk.magenta('magenta') + chalk.cyan('cyan') + chalk.white('white') + chalk.gray('gray'));
    gutil.log(chalk.white(
            chalk.bgBlack('black') + chalk.bgRed('red') + chalk.bgGreen('green') + chalk.bgYellow('yellow') + chalk.bgBlue('blue') + chalk.bgMagenta('magenta') + chalk.bgCyan('cyan') + chalk.bgWhite('white')
        ));
});

gulp.task('default', ['clean', 'compile:src', 'compile:partials', 'compile:less']);

gulp.task('clean', function () {
    del('output/*.*');
})

gulp.task('compile:less', function () {
    gulp.src('app/less/*.less')
      .pipe(less())
      .pipe(gulp.dest('output')) 
});

gulp.task('watch', ['default'], function () {

    livereload.listen();
        
    gulp.watch('app/**/*.ts', ['compile:src']);
    gulp.watch('app/less/*.less', ['compile:less']);
    gulp.watch('app/partials/**/*.html', ['compile:partials']);

    gulp.watch('output/**').on('change', livereload.changed);
});


gulp.task('compile:partials', function () {
    return gulp.src('app/partials/**/*.html')
            .pipe(size({ title: 'before' }))
            .pipe(htmlmin({ removeComments: true, collapseWhitespace: true }))
            .pipe(templateCache('ts-test.partials.js', {
                module: 'ts-test.partials',
                standalone: true,
                
                root: 'app/partials/'
            }))
            
            .pipe(uglify())
            .pipe(size({ title: 'after' }))
        .pipe(size({ title: 'gzip', gzip:true }))
            .pipe(gulp.dest('output'));
});

gulp.task('compile:src', function () {

    var tsResult = gulp.src(['typings/**/*.d.ts', '_references.ts', 'app/**/*.ts'])
                    .pipe(sourcemaps.init({ loadMaps: true }))
                    .pipe(ts(tsProject));

    var js = tsResult.js
        
                //.pipe(fileSort())
                .pipe(concat('app.gulp.js'))
                .pipe(ngAnnotate())
                .pipe(sourcemaps.write('./', sourceMapsOutOptions))
                .pipe(gulp.dest('output/'))
                .pipe(ignore.exclude('*.map'))
                .pipe(size({ title: 'js  ' }))

                .pipe(uglify({ output: { beautify: true } }))
                .pipe(rename('app.gulp.min.js'))
                .pipe(size({ title: 'min ' }))
                .pipe(size({ gzip: true, title: 'gzip' }))
                .pipe(sourcemaps.write('./', sourceMapsOutOptions))
                .pipe(gulp.dest('output/'))
                
    
    var dts = tsResult.dts
                .pipe(concat('app.gulp.d.ts'))
                .pipe(gulp.dest('output/'));

    return eventStream.merge(js, dts);

});