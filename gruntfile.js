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
                    _showNearlyTscCommand: true,
                    
                    references: ['typings/**/*.d.ts', '_references.ts']
                    //nolib: false,
                    //comments: false
                }
            }
        },
    });

grunt.registerTask('default', ['typescript']);

}