module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    express: {
      dev: {
        options: {
          script: 'server.js'
        }
      }
    },
    compass: {
      dev: {
        options: {
          sassDir: 'public/stylesheets/sass',
          cssDir:  'public/stylesheets/css',
          environment: 'production',
          relativeAssets: true
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'public/scripts/scripts.min.js': [
            'public/scripts/vendor/*.js',
            'public/scripts/_*.js'
          ]
        },
        options: {
          // Options here
        }
      }
    },
    watch: {
      express: {
        files: [
          'server.js',
        ],
        tasks: ['express:dev'],
        options: {
          spawn: false
        }
      },
      compass: {
        files: ['**/*.{scss,sass}'],
        tasks: ['compass:dev']
      },
      js: {
        files: [
          'public/scripts/**/*.js',
          'Gruntfile.js',
          '!public/scripts/scripts.min.js'
        ],
        tasks: ['uglify'],
        options: {
          livereload: true,
        }
      }
    },
    clean: {
      dist: [
        'public/scripts/scripts.min.css'
      ]
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');

  // Default task(s).
  grunt.registerTask('default', [
    'clean',
    'uglify',
    'compass'
  ]);
  grunt.registerTask('dev', [
    'express:dev',
    'watch'
  ]);

};