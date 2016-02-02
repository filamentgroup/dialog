module.exports = function(grunt) {
	"use strict";

	// Project configuration.
	grunt.initConfig({
		qunit: {
			files: ['test/**/*.html']
		},

		jshint: {
			all: {
				options: {
					jshintrc: ".jshintrc"
				},

				src: ['Gruntfile.js', 'src/**/*.js']
			}
		},

		uglify: {
			options: {
				report: true
			},
			min: {
				files: {
					'dist/dialog.min.js': ['dist/dialog.build.js'],
					'dist/dialog.linker.min.js': ['dist/dialog.linker.build.js']
				}
			}
		},

		concat: {
			dist: {
				src: ['src/dialog.js', 'src/dialog-init.js'],
				dest: 'dist/dialog.build.js'
			},
			distLinker: {
				src: ['src/dialog.js', 'src/dialog-linker.js', 'src/dialog-init.js'],
				dest: 'dist/dialog.linker.build.js'
			},
			css: {
				src: ['src/dialog.css'],
				dest: 'dist/dialog.css'
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );

	// Default task.
	grunt.registerTask('test', ['jshint', 'qunit']);
	grunt.registerTask('default', ['test', 'concat', 'uglify']);
	grunt.registerTask('travis', ['test']);
};
