'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    trgt: 'dist',
    src: 'src',
    // Task configuration
    clean: {
      files: ['<%= trgt %>']
    },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      main: {
        options: {
          jshintrc: '<%= src %>/js/.jshintrc'
        },
        src: ['<%= src %>/js/**/*.js']
      }
    },
    copy: {
      main: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= src %>',
          dest: '<%= trgt %>',
          src: [
            '*.{ico,png,txt,html,htm,xml}',
            'CNAME',
            'fonts/**/*',
            'images/**/*',
            'js/**/*',
            'scripts/**/*',
            'content/**/*'
          ]
        }]
      },
    },
    'gh-pages': {
      main: {
        options: {
          base: '<%= trgt %>'
        },
        src: '**/*'
      }
    }
  });

  // These plugins provide necessary tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-gh-pages');
  
  // Default task
  grunt.registerTask('default', ['jshint', 'clean', 'copy']);
};
