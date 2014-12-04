'use strict';

var app = angular.module('jandiApp');

app.factory('loginAPI', function($http, $rootScope, storageAPIservice) {
    var authAPI = {};

    authAPI.login = function(userdata) {
        return $http({
            method  : "POST",
            url     : $rootScope.server_address + 'token',
            data    : userdata,
            version : 2
        });
    };

    authAPI.getTeamInfo = function(prefixDomain) {
        prefixDomain = prefixDomain || 'tosslab';
        return $http({
            method  : "GET",
            url     : $rootScope.server_address + 'info/team/prefix/' + prefixDomain
        });
    };

    authAPI.requestPasswordEmail = function(teamId, email, lang) {
        return $http({
            method  :'POST',
            url     : $rootScope.server_address + 'account/password/resetToken',
            data    : {
                'teamId'    : parseInt(teamId),
                'email'     : email,
                'lang'      : lang
            }
        });
    };

    authAPI.validatePasswordToken = function(teamId, token) {
        return $http({
            method  : 'POST',
            url     : $rootScope.server_address + 'validation/passwordResetToken',
            data    : {
                'teamId'    : parseInt(teamId),
                'token'     : token
            }
        });
    };

    authAPI.resetPassword = function(teamId, token, password, lang) {
        return $http({
            method  : 'PUT',
            url     : $rootScope.server_address + 'account/password',
            data    : {
                'teamId'    : parseInt(teamId),
                'token'     : token,
                'password'  : password,
                'lang'      : lang
            }
        });
    };

    authAPI.isSignedIn = function() {
        return storageAPIservice.hasAccessTokenLocal() || storageAPIservice.hasAccessTokenSession();
    };

    return authAPI;
});

app.factory('authInterceptor', function ($rootScope, $q, $window, configuration, localStorageService) {
    return {
        request: function (config) {

            if (config.method == 'POST')
                console.log(config);

            config.headers = config.headers || {};

            // API version
            config.headers.Accept = "application/vnd.tosslab.jandi-v"+$rootScope.api_version+"+json";

            // Auth token for file api for ie9.
            if ($window.sessionStorage.token) {

                if (config.method === 'POST' && config.fileFormDataName === 'userFile') {
                    // file upload api.
                    if (angular.isUndefined(FileAPI.support)) {
                        // since browser supports html5 file upload feature, FileAPI.support has not been initialized.
//                        console.log('browser supports html5 not including authorization in header.');
                        return config;
                    }
                }

                // Somehow, I was unable to use 'storageAPIservice' in 'authInterceptor' due to circular dependency.
                // Get 'access_token' from localStorage directly using localStorageService api.
                // If localStorage does not contain 'access_token', get it from $window.sessionStorage.
                config.headers.Authorization = localStorageService.get('access_token') || $window.sessionStorage.access_token;
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
                console.log('401!!!!!')
                console.log('[' + rejection.status + ' ' + rejection.statusText + '] ' + rejection.data.msg);
            }

            return $q.reject(rejection);
        }
    };
});
