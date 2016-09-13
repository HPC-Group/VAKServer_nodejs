/**
 * Created by my on 12.07.16.
 */

var API_PREFIX = '/api';

angular.module('VAK.apps', ['VAK.directives', 'angular-clipboard'])
    .service('RepositoryService', ['$http', function ($http) {
        'use strict';
        // -

        this.getApps = function () {
            return $http.get('/api/apps');
        };

        this.getSessionsByApp = function (app) {
            return $http.get('/api/sessions', { params: { app_name: app } });
        };

        this.getStatesBySessionId = function (sessionId) {
            return $http.get('/api/states', { params: { session_id: sessionId } });
        };

        this.getSessionProvenance = function (sessionId) {
            return $http.get('/api/session/prov', { params: { session_id: sessionId } });
        };

        this.createProvBundle = function (sessionId) {
            return $http.get('/api/session/prov-bundle', { params: { session_id: sessionId} });
        };
    }])

    .service('StateManagerService', [function () {
        'use strict';

        var currentState = {};

        this.set = function (key, value) {
            var obj;

            if (angular.isObject(key)) {
                obj = key;
                angular.forEach(obj, function (value, tmpKey) {
                   currentState[tmpKey] = value;
                });
            } else {
                currentState[key] = value;
            }
            return this;
        };

        this.get = function (key) {
            if (key === '__ALL__') {
                return currentState;
            }
            return currentState[key] || null;
        };

        this.reset = function (key) {
            var arr;

            if (angular.isArray(key)) {
                arr = key;
                angular.forEach(arr, function (value) {
                   resetAttr(value);
                });
            } else {
                resetAttr(key);
            }
            return this;
        };

        this.clear = function () {
            currentState = {};
        };

        function resetAttr(key) {
            if (currentState && currentState[key]) {
                currentState[key] = null;
            }
        }
    }])

    // --
    // CONTROLLERS

    .controller('AppsController', ['StateManagerService', 'apps', function (StateManagerService, apps) {
        'use strict';

        var vm = this;
        vm.apps = apps.data;

        StateManagerService.clear();
    }])

    .controller('SessionsController', ['$state', 'StateManagerService', 'sessions', function ($state, StateManagerService, sessions) {
        'use strict';

        var vm = this;
        vm.appName = $state.params.app;
        vm.sessions = sessions.data;

        StateManagerService
            .reset('session')
            .set({
                'app': vm.appName,
                'sessions': vm.sessions
            });
    }])

    .controller('SessionDetailsController', ['StateManagerService', 'RepositoryService', 'states', 'sessionProv', function (StateManagerService, RepositoryService, states, sessionProv) {
        'use strict';

        var vm = this;
        vm.states = states.data;
        vm.activeSession = StateManagerService.get('session');
        vm.provJSON = sessionProv.data[0].provenance;
        vm.app = StateManagerService.get('app');
        vm.showProv = false;
        vm.noBundle = false;

        vm.buildProvBundle = function (sessionId) {
            RepositoryService.createProvBundle(sessionId)
                .then(function (results) {
                    vm.provBundleJSONString = JSON.stringify(results.data);

                }, function(reason) {
                    console.log(reason);
                    vm.noBundle = true;
            });
        };
    }])
    ;

// -----------------

angular.module('visApp', ['ui.router', 'VAK.apps', 'oc.lazyLoad'])
    .config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
        'use strict';

        $ocLazyLoadProvider.config({
            events: true,
            modules: [{
                name: 'd3',
                files: [
                    '/bower_components/d3/d3.min.js'
                ]
            }]
        });
    }])
    // ------
    // ROUTES
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        'use strict';
        $urlRouterProvider.otherwise('/apps');
        $stateProvider
            .state('apps', {
                url: '/apps',
                resolve: {
                    apps: ['RepositoryService', function (RepositoryService) {
                        return RepositoryService.getApps();
                    }]
                },
                templateUrl:'partials/apps.html',
                controller: 'AppsController',
                controllerAs: 'apps',
                data: {
                    pageTitle: 'Apps by identifier'
                }
            })

            .state('sessions', {
                url: '/sessions/:app',
                templateUrl: 'partials/sessions.html',
                controller: 'SessionsController',
                controllerAs: 'sessions',
                data: {
                    pageTitle: 'Sessions by app identifier'
                },
                resolve: {
                    sessions: ['$stateParams', 'RepositoryService', function ($stateParams, RepositoryService) {
                        return RepositoryService.getSessionsByApp($stateParams.app);
                    }]
                }
            })

            .state('session-details', {
                url: '/session-details/:session_id',
                templateUrl: 'partials/session-details.html',
                controller: 'SessionDetailsController',
                controllerAs: 'details',
                data: {
                    pageTitle: 'States by session'
                },
                resolve: {
                    states: ['$stateParams', 'RepositoryService', 'StateManagerService', function ($stateParams, RepositoryService, StateManagerService) {
                        var sessions = StateManagerService.get('sessions'),
                            sessionId = $stateParams.session_id;

                        angular.forEach(sessions, function (session) {
                            if (session.entityId === sessionId) {
                                StateManagerService.set('session', session);
                            }
                        });

                        return RepositoryService.getStatesBySessionId(sessionId);
                    }],

                    sessionProv: ['$stateParams', 'RepositoryService', function ($stateParams, RepositoryService) {
                        return RepositoryService.getSessionProvenance($stateParams.session_id);
                    }],

                    nvd3: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load('d3');
                    }]
                }
            })
        ;
    }]);