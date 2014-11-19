'use strict';

module.exports = function(grunt) {

  var isProd = grunt.option('prod') ? true : false;

  var reqUrl = isProd ? '//battle.azurewebsites.net' : '//localhost:49385';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    trgt: isProd ? 'dst' : 'dev',
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
            // JS folder assembles separately
            //'js/**/*',
            'scripts/**/*',
            'content/**/*'
          ]
        }]
      },
    },
    assemble: {
      options: {
        engine: 'handlebars',
        data: ['package.json'],
        // Build configuration properties
        conf: {
          // Request url (begin of the path)
          // if exists - other domain (CORS requests - for local testing and side programs)
          // if empty - the same domain (simple requests)
          // Example {{requrl}}/api/values
          reqUrl: reqUrl,
          isProd: isProd
        }
      },
      // Assemble js files: replace {{}} to assemble data
      js: {
        options: {
          ext: '.js'
        },
        files: [{
          expand: true,
          cwd: '<%= src %>/js/',
          src: ['**/*.js'],
          dest: '<%= trgt %>/js/'
        }]
      }
    },
    connect: {
      main: {
        options: {
          //  //true, // Or need url string
          open: 'http://localhost:44344/btl.html?viewer_id=19064903&auth_key=1q2w3e4r5t6y7u8i9o',
          keepalive: true,
          port: 44344,
          base: '<%= trgt %>'
        }
      }
    },
    'gh-pages': {
      main: {
        options: {
          base: 'dst'
        },
        src: '**/*'
      }
    },
    'ftp-deploy': {
      build: {
        auth: {
          host: 'waws-prod-am2-001.ftp.azurewebsites.windows.net',
          port: 21,
          authKey: 'key1'
        },
        src: 'dst',
        dest: '/site/wwwroot/'
      }
    }
  });

  // These plugins provide necessary tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-ftp-deploy');

  // Default task 
  // 'jshint',
  grunt.registerTask('default', ['clean', 'copy', 'assemble']);
};
