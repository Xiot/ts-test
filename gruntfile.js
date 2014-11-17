module.exports = function(grunt) {
 
    // Load Grunt tasks declared in the package.json file.
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
 
    grunt.option('showtsc', true);

    // Project configuration.
    grunt.initConfig({
 
        /**
         * This will load in our package.json file so we can have access
         * to the project name and appVersion number.
         */
        pkg: grunt.file.readJSON('package.json'),
        
        typescript: {
            main: {
                src: [
                	//'_references.ts',
                	//'typings/**/*.d.ts',
                	'app/**/*.ts'
                	],
                dest: 'output/app.js',
                options: {
                    target: 'es5', //or es5
                    basePath: 'app',
                    sourceMap: true,
                    declaration: true,                  
                    references: ['typings/**/*.d.ts', '_references.ts']
                    //nolib: false,
                    //comments: false
                }
            }
        },
        ngAnnotate: {
            main: {
                options: {
                    ngAnnotateOptions: {
                        sourcemap: true
                    }
                },
                files: {
                    'output/app.js' : 'output/app.js'
                }
            }
        },
        uglify: {
            options: {
                mangle: true,
                beautify: true,
                sourceMap: true,
                sourceMapIn: 'output/app.js.map',
                compress: {
                    //angular: true
                }
                //sourceMapIncludeSources: true
            },
            main: {
                files: {
                    'output/app.min.js': 'output/app.js'
                }
            }
        }
    });

    grunt.registerTask('default', ['typescript',/* 'ngAnnotate',*/ 'uglify']);
    grunt.registerTask('annotate', ['ngAnnotate']);

}