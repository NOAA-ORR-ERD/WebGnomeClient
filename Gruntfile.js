module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['Gruntfile.js', 'js/collection/*.js', 'js/model/*.js', 'js/views/*.js', 'js/*.js'],
			options: {
					jshintrc: true
				}
		},
		watch: {
			scripts: {
				files: ['js/**/*', '!**/lib/**']  // Watch all files inside js/ except
			},                                    // files in lib/
			options: {
				livereload: true,      // Automatically refresh the page on change
				interval: 5007         // Set long interval to not drain system resources
			}
		},
		requirejs: {
			compile: {
				options: {
					baseUrl: 'js',
					mainConfigFile: 'js/main.js'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-requirejs');

	grunt.registerTask('build', ['requirejs', 'watch']);
	grunt.registerTask('test', ['jshint']);
};