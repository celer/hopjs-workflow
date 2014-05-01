module.exports = function(grunt){

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      ignore_warning: {
        options: {
          '-W061': true,
          '-W060': true,
          '-W085': true,
          '-W054': true,
        },
        src: ['lib/*.js'],
      },
    }, 
    concat:{ 
      options: { 
        seperator: ';',
      },
      dist: { 
        src:['lib/core.js','lib/script.js','lib/task.js','lib/context.js','lib/tests.js','lib/browser.js'],
        dest: 'build/hopjs-wf.js',
      }
    },
    uglify:{  
      options: {
        compress:true
      },
      build: { 
        options: {
          compress:true,
          mangle:true
        },
        src: 'build/hopjs-wf.js',
        dest: 'build/hopjs-wf.min.js'
      }
    },
    watch:{
      scripts: { 
        files: '<%= jshint.all %>',
        tasks: ['lintspaces','jshint']
      }
    },
    lintspaces:{
      src: [ 'lib/*.js' ],
      options: {
        indentation:'spaces',
        spaces:2
      }
    }
  });

  grunt.loadNpmTasks('grunt-lintspaces');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default',['jshint','concat','uglify']);
};
