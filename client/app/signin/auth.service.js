'use strict';

var app = angular.module('jandiApp');

app.factory('loginAPI', function($http, $rootScope) {
    var authAPI = {};

    authAPI.login = function(userdata) {
        return $http({
            method  : "POST",
            url     : $rootScope.server_address + 'token',
            data    : userdata
        });
    };

    authAPI.getTeamInfo = function(prefixDomain) {
        prefixDomain = prefixDomain || 'tosslab';
        return $http({
            method  : "GET",
            url     : $rootScope.server_address + 'info/team/prefix/' + prefixDomain
        });
    };

    return authAPI;
});

app.factory('authInterceptor', function ($rootScope, $q, $window) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            // Auth token
            if ($window.sessionStorage.token) {
                config.headers.Authorization = $window.sessionStorage.token;
            }
            // API version
            config.headers.Accept = "application/vnd.tosslab.jandi-v"+$rootScope.api_version+"+json";
            return config;
        },
        responseError: function (rejection) {
            console.log(rejection)
            if (rejection.status === 0) {
                // net::ERR_CONNECTION_REFUSED
                // what should i do?
                console.log('looks like api is down.');
            }
            if (rejection.status === 401) {
                // handle the case where the user is not authenticated
                console.log('[' + rejection.status + ' ' + rejection.statusText + '] ' + rejection.data.msg);
//                delete $window.sessionStorage.token;
//                $location.path('/login');
            }

            return $q.reject(rejection);
        }
    };
});
