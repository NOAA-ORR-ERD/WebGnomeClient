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
				files: ['js/**/*.js'],
				tasks: ['jshint']
			},
			options: {
				livereload: true
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