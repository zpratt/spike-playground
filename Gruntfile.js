module.exports = function(grunt) {

    var _ = require('lodash'),

        thirdPartyDependencies = [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/lodash/dist/lodash.compat.min.js',
            'bower_components/backbone/backbone.js',
            'bower_components/react/react.min.js',
            'bower_components/d3/d3.min.js'
        ],
        sharedProdDependencies = [
            'js/namespace.js',
            'js/map.js',
            'js/iowa.js',

            'js/components/answers-model.js',
            'js/components/answer-collection.js'
        ],
        reactExample = [
            'js/view.js'
        ],
        boundaryExample = [
            'js/donut-graph.js',
            'js/ground-view.js',
            'js/ground-view-example.js'
        ],
        quadtreeExample = [
            'js/quadtree-example.js'
        ];

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');

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
                    'dist/css/main.css': 'sass/*.scss'
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            thirdparty: {
                src: thirdPartyDependencies,
                dest: 'dist/js/deps.js'
            },
            quadtreeExample: {
                options: {
                    sourceMap: true
                },
                src: _.union(sharedProdDependencies, quadtreeExample),
                dest: 'dist/js/quadtree.js'
            }
        },
        clean: {
            build: ['dist']
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['clean', 'react', 'sass', 'concat']);
};