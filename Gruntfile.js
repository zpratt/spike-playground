module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-sass');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        react: {
            app: {
                options: {
                    extension: 'js',
                    ignoreMTime: false
                },
                files: {
                    'js/view.js' : 'jsx/*.jsx'
                }
            }
        },
        sass: {
            dist: {
                files: {
                    'css/main.css': 'sass/*.scss'
                }
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['react','sass']);
};