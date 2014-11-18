var gulp = require('gulp');

var ts = require('gulp-typescript');
var concatsm = require('gulp-concat-sourcemap');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var eventStream = require('event-stream');
var uglify = require('gulp-uglify');
var del = require('del');

var livereload = require('gulp-livereload');
var watch = require('gulp-watch');
var less = require('gulp-less');
var nghtmljs = require('gulp-ng-html2js');
var htmljs = require('gulp-html2js');
var header = require('gulp-header');
var htmlmin = require('gulp-htmlmin');
var fileSort = require('gulp-angular-filesort');


var tsProject = ts.createProject({
    sortOutput: true,
    declarationFiles: true,
    target: 'es5',
    sourceRoot: '../',
    noExternalResolve: true
});

var sourceMapsInOptions = {
    loadMaps: true,
    includeContent: false,
    //    sourceRoot: '/app'
};
var sourceMapsOutOptions = {
    includeContent: false,
    //sourceRoot: '../'
};


gulp.task('default', ['clean', 'compile:src', 'compile:partials', 'compile:less']);

gulp.task('clean', function () {
    del('output/*.*');
})

gulp.task('compile:less', function () {
    gulp.src('app/less/*.less')
      .pipe(less())
      .pipe(gulp.dest('output'))
    //.pipe(livereload({ auto: false }))    
});

gulp.task('watch', ['default'], function () {

    livereload.listen();
        
    gulp.watch('app/**/*.ts', ['compile:src']);
    gulp.watch('app/less/*.less', ['compile:less']);
    gulp.watch('app/partials/**/*.html', ['compile:partials']);

    gulp.watch('output/**').on('change', livereload.changed);
    //gulp.watch('build/**').on('change', livereload.changed);
});

gulp.task('notify', function () {
    livereload.changed();
})

gulp.task('compile:partials', function () {
    return gulp.src('app/partials/**/*.html')
            .pipe(htmlmin({ removeComments: true, collapseWhitespace: true }))
            .pipe(nghtmljs({ moduleName: 'ts-test.partials', declareModule: false, prefix: 'app/partials/' }))
            //.pipe(htmljs({ outputModuleName: 'ts-test.partials'}))
            .pipe(concat('ts-test.partials.js'))
            .pipe(header("angular.module('ts-test.partials',[]);\n"))
            .pipe(uglify())
            .pipe(gulp.dest('output/partials'));
});

gulp.task('compile:src', function () {

    var tsResult = gulp.src(['typings/**/*.d.ts', '_references.ts', 'app/**/*.ts'])
                    .pipe(sourcemaps.init(sourceMapsInOptions))
                    .pipe(ts(tsProject));

    var js = tsResult.js
                //.pipe(fileSort())
                .pipe(concat('app.gulp.js'))
                .pipe(ngAnnotate())
                .pipe(uglify({ output: { beautify: true } }))
                .pipe(sourcemaps.write('./', sourceMapsOutOptions)) // Now the sourcemaps are added to the .js file
                .pipe(gulp.dest('output/'))
    //.pipe(livereload({ auto: false }));

    var dts = tsResult.dts
                .pipe(concat('app.gulp.d.ts'))
                .pipe(gulp.dest('output/'));

    return eventStream.merge(js, dts);

});