module.exports = (grunt) ->
  require('load-grunt-tasks')(grunt)

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    coffeelint:
      options:
        configFile: 'coffeelint.json'
      source: ['coffee/angular-rangepicker.coffee']

    coffee:
      compileJoined:
        options:
          join: true
        files:
          'js/angular-rangepicker.js': ['coffee/angular-rangepicker.coffee']

    watch:
      files: ['example.html', 'coffee/*.coffee']
      tasks: ['default']

    uglify:
      options:
        sourceMap: true
      target:
        files:
          'js/angular-rangepicker.min.js': ['js/angular-rangepicker.js']

    wiredep:
      target:
        src: [
          './example.html'
        ]

    ngAnnotate:
      options:
        singleQuotes: true

      rangepicker:
        files:
          'js/angular-rangepicker.js': ['js/angular-rangepicker.js']


  # Default task(s).
  grunt.registerTask "default", ["coffeelint", "coffee"]
  grunt.registerTask "develop", ["default", "watch"]
  grunt.registerTask "dist", ["default", "ngAnnotate", "uglify"]
