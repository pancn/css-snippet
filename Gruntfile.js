module.exports = function (grunt) {

    // Configurable paths
    var config = {
        app: 'src/main/webapp',
        dist: 'dist'
    };

    // Include the rewriteRequest snippet.
    var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;
	
	// Include the proxy snippet.
    var connectProxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

    // Define the configuration for all the tasks
    grunt.initConfig({
        // Project settings
        config: config,
        pkg: grunt.file.readJSON('package.json'),

		// ### connect config
        connect: {
            options: {
                port: 8080,
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    base: '<%= config.app%>',
                    open: true,
                    middleware: function (connect, options) {
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }
                        var middlewares = [rewriteRulesSnippet,
                            connectProxySnippet
                        ];
                        options.base.forEach(function (base) {
                            // Serve static files.
                            middlewares.push(connect.static(base));
                        });
                        return middlewares;
                    }
                }
            },
            // Add a section named rules to your existing Connect or Express definition.
            // rules cannot be set per server,
            rules: [
                {from: '^.*/resource.root/(.*)$', to: '/$1'}
            ],
            proxies: [
                {
                    context: '/rest',
                    host: '127.0.0.1',
                    port: 11100}
            ],
            development: { // not used
                options: {
                    base: '<%= config.app%>',
                    open: true
                }
            }
        },
		
		// ### rewrite rules
        configureRewriteRules: {
            options: {
                rulesProvider: 'connect.rules'
            }
        },

        // ### Watches files for changes and runs tasks based on the changed files
        watch: {
            options: {
                livereload: '<%= connect.options.livereload %>'
            },
            js: {
                files: ['<%= config.app %>/js/{,*/}*.js']
            },
            css: {
                files: ['<%= config.app %>/css/{,*/}*.css']
            },
            template: {
                files: ['<%= config.app%>/*.html', '<%= config.app%>/template/{,*/}*.html']
            }
        },
		
		// ### rest mock config
        mock: {
            user: {
                options: {
                    port: 11100
                },
                cwd: 'src/test/webapp/json',
                src: ['*.json']
            }

        }


    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-connect-rewrite');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-restful-mock');
    grunt.loadNpmTasks('grunt-connect-proxy');

    grunt.registerTask('default', [
		'configureRewriteRules',
        'configureProxies:server', // added before livereload
        'connect:livereload',
        'watch']);
};