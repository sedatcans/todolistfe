;(function () {
    function todoService($http, API, user) {
        var self = this;

        self.getAll = function ($window) {
            return $http.get(API + '/items', {
                headers: {'X-CLIENT-TOKEN': user.getToken($window)}
            })
        }
        self.add = function ($window, note) {
            return $http.post(API + '/items', {
                toDoListItemDto: {
                    note: note
                }
            }, {
                headers: {
                    'X-CLIENT-TOKEN': user.getToken($window)
                }

            })
        }
        self.update = function ($window, id) {
            return $http.put(API + '/items/' + id, {
                toDoListItemDto: {
                    status: 'DONE'
                }
            }, {
                headers: {
                    'X-CLIENT-TOKEN': user.getToken($window)
                }

            })
        }
    }


    function userService($http, API) {
        var self = this;

        self.saveToken = function ($window, token) {
            $window.localStorage['jwtToken'] = token;

        }

        self.getToken = function ($window) {
            return $window.localStorage['jwtToken'];
        }

        self.register = function (email, password) {
            return $http.post(API + '/customers', {

                email: email,
                password: password
            })
        }

        self.login = function (email, password) {
            return $http.post(API + '/customer/authentication', {
                email: email,
                password: password
            })
        };

    }

    function MainCtrl($scope, $window, $location, user, todo) {
        var self = this;

        function handleRequest(res) {
            var token = res.data ? res.data.token : null;
            if (token) {
                console.log('JWT:', token);
            }
            user.saveToken($window, token);
            $window.location.href = '/todolistfe/todolist.html';
        }

        function handleError(res) {
            self.message = res.data.error ? (res.data.error.message ? res.data.error.message : res.data.error) : res.error;
        }

        function handleRequestLogin(res, headers) {
            var token = res.data ? res.data : null;
            if (token) {
                console.log('JWT:', token);
            }
            user.saveToken($window, token);
            $window.location.href = '/todolistfe/todolist.html';
        }

        self.login = function () {
            user.login(self.email, self.password)
                .then(handleRequestLogin, handleError)
        }
        self.register = function () {
            user.register(self.email, self.password)
                .then(handleRequest, handleError)
        }
    }

    function authInterceptor(API) {
        return {
            request: function (config) {
                return config;
            },

            response: function (res) {
                return res;
            },
        }
    }

    function TodoCtrl($scope, $window, $location, user, todo) {
        var self = this;

        todo.getAll($window)
            .then(handleGetAll, handleGetAllError);
        self.getAll = function () {
            todo.getAll($window)
                .then(handleGetAll, handleGetAllError);
        }

        function handleGetAll(res, headers) {
            var data = res.data ? res.data : null;
            self.todos = data.toDoListItems;
            self.message = '';
        }

        function handleGetAllError(res, headers) {
            self.message = res.data.error
            $window.location.href = '/todolistfe/index.html';
        }

        function handleAdd(res, headers) {
            var data = res.data ? res.data : null;
            todo.getAll($window)
                .then(handleGetAll, handleGetAllError);
        }

        function handleAddError(res, headers) {
            self.message = res.error ? res.error : res.data.error

        }

        function handleUpdate(res, headers) {
            var data = res.data ? res.data : null;
            todo.getAll($window)
                .then(handleGetAll, handleGetAllError);
        }

        function handleUpdateError(res, headers) {
            self.message = res.error ? res.error : res.data.error

        }

        self.markdone = function () {
            todo.update($window, self.id)
                .then(handleUpdate, handleUpdateError)
        }

        self.add = function () {
            todo.add($window, self.note)
                .then(handleAdd, handleAddError)
        }
    }

    var app = angular.module('app', [])
        .factory('authInterceptor', authInterceptor)
        .service('user', userService)
        .service('todo', todoService)
        .constant('API', 'http://localhost:8080')
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('authInterceptor');
            $httpProvider.defaults.headers.common = {};
            $httpProvider.defaults.headers.post = {'Content-Type': 'application/json'};
            $httpProvider.defaults.headers.put = {'Content-Type': 'application/json'};
            $httpProvider.defaults.headers.patch = {};
        })
    app.controller('Main', MainCtrl)
    app.controller("Todo", TodoCtrl)
})();