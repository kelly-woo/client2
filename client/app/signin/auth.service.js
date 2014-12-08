'use strict';

var app = angular.module('jandiApp');

app.factory('authAPIservice', function($http, $rootScope, $state, storageAPIservice) {
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

    authAPI.requestAccessTokenWithRefreshToken = function() {
        console.log('access_token: ', storageAPIservice.getAccessTokenLocal(), storageAPIservice.getAccessTokenSession());
        return $http({
            method  : "POST",
            url     : $rootScope.server_address + 'token',
            data    : {
                'grant_type'    : 'refresh_token',
                'refresh_token' : storageAPIservice.getRefreshTokenLocal() || storageAPIservice.getRefreshTokenSession()
            }
        });
    };

    authAPI.signOut = function() {
        storageAPIservice.removeSession();
        storageAPIservice.removeLocal();
        mixpanel.cookie.clear();
        $state.go('signin');
    };

    // After getting new 'access_token', replace old 'access_token' with new one.
    authAPI.updateAccessToken = function(tokenData) {
        var access_token = tokenData.access_token;

        if (storageAPIservice.getAccessTokenLocal()) {
            storageAPIservice.setAccessTokenLocal(access_token);
        }

        if (storageAPIservice.getAccessTokenSession()) {
            storageAPIservice.setAccessTokenSession(access_token);
        }
    };

    return authAPI;
});

app.factory('authInterceptor', function ($rootScope, $q, $window, $injector, configuration, localStorageService) {
    return {
        request: function (config) {
            config.headers = config.headers || {};

            // API version
            config.headers.Accept = "application/vnd.tosslab.jandi-v"+$rootScope.api_version+"+json";

            // Auth token for file api for ie9.
            if ($window.sessionStorage.access_token) {

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
                config.headers.Authorization = (localStorageService.get('token_type') || $window.sessionStorage.token_type) + " " + (localStorageService.get('access_token') || $window.sessionStorage.access_token);

            }
            return config;
        },

        responseError: function (rejection) {
            if (rejection.status === 0) {
                // net::ERR_CONNECTION_REFUSED
                // what should i do?
            }
            if (rejection.status === 400) {
                // This is just bad request.
                console.debug('BAD REQUEST');
                console.debug(rejection.config.method, rejection.config.url);
                console.debug(rejection.config.data);

            }
            if (rejection.status === 401) {
                // Unauthorized Access.
                // What to do? - get new access_token using refresh_token
                console.debug('401 Unauthorized.');
                var authAPIservice = $injector.get('authAPIservice');
                authAPIservice.requestAccessTokenWithRefreshToken()
                    .success(function(response) {
                        authAPIservice.updateAccessToken(response);
                        return rejection;
                    })
                    .error(function(error) {

                    });
            }

            return $q.reject(rejection);
        }
    };
});
