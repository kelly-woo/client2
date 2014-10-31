'use strict';

var app = angular.module('jandiApp');

app.factory('loginAPI', function($http, $rootScope, $window, localStorageService) {
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

    var token_key = 'access_token';
    // TODO ; MAKE IT RESOLVE.
    // to be used later.
    // signin state로 갈때 resolve 로 이 펑선을 불러서 트루면 바로 message.home 으로 리다이렉트 시킬 예정임.
    // 허나 지금 authController 가 화면 바뀔 때마다 매번 불러져서 hasToken 얻어오는 resolve 가 안 불려서 error 남.


    // access token getter
    authAPI.getToken = function() {
        return localStorageService.get(token_key);
    };

    // access token setter
    authAPI.setToken = function(token) {
        localStorageService.set(token_key, token);
    };

    authAPI.removeAccessToken = function() {
        localStorageService.remove(token_key);
    };

    // checking window session storage.
    authAPI.isLoggedIn = function() {
        return $window.sessionStorage.token;
    };

    return authAPI;
});

app.factory('authInterceptor', function ($rootScope, $q, $window, localStorageService) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            // API version
            config.headers.Accept = "application/vnd.tosslab.jandi-v"+$rootScope.api_version+"+json";

            // Auth token
            if ($window.sessionStorage.token) {

                if (config.method === 'POST' && config.fileFormDataName === 'userFile') {
                    // file upload api.
                    if (angular.isUndefined(FileAPI.support)) {
                        // since browser supports html5 file upload feature, FileAPI.support has not been initialized.
//                        console.log('browser supports html5 not including authorization in header.');
                        return config;
                    }
                }

                config.headers.Authorization = $window.sessionStorage.token;
            }

            return config;
        },
        responseError: function (rejection) {
            if (rejection.status === 0) {
                // net::ERR_CONNECTION_REFUSED
                // what should i do?
            }
            if (rejection.status === 401) {
                // handle the case where the user is not authenticated
                console.log('[' + rejection.status + ' ' + rejection.statusText + '] ' + rejection.data.msg);
                delete $window.sessionStorage.token;
            }

            return $q.reject(rejection);
        }
    };
});
