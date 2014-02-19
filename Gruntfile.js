module.exports = function(grunt) {
	"use strict";

	// Project configuration.
	grunt.initConfig({
		qunit: {
			files: ['test/**/*.html']
		},

		jshint: {
			files: ['Gruntfile.js', 'dialog.js', 'dialog-init.js']
		},

		uglify: {
			options: {
				report: true
			},
			min: {
				files: {
					'dialog.min.js': ['dialog.build.js']
				}
			}
		},

		concat: {
			dist: {
				src: ['dialog.js', 'dialog-init.js'],
				dest: 'dialog.build.js'
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );

	// Default task.
	grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
	grunt.registerTask('travis', ['jshint', 'qunit']);
};
