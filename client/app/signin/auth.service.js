'use strict';

var app = angular.module('jandiApp');

app.factory('authAPIservice', function($http, $rootScope, $state, $location, storageAPIservice, accountService, memberService) {
    var authAPI = {};

    authAPI.signIn = function(userdata) {
        return $http({
            method: "POST",
            url: $rootScope.server_address + 'token',
            data: userdata
        });
    };

    authAPI.requestPasswordEmail = function(email) {
        return $http({
            method:'POST',
            url: $rootScope.server_address + 'accounts/password/resetToken',
            data: {
                email: email,
                lang: accountService.getAccountLanguage
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
        accountService.removeAccount();
        memberService.removeMember();

        if(mixpanel.cookie) mixpanel.cookie.clear();
        $state.go('signin');
    };




    return authAPI;
});

app.factory('authInterceptor', function ($rootScope, $q, $window, $injector, configuration, localStorageService) {
    return {
        request: function (config) {
            config.headers = config.headers || {};

            // API version
            config.headers.Accept = "application/vnd.tosslab.jandi-v"+$rootScope.api_version+"+json";

            config.headers.Authorization = (localStorageService.get('token_type') || $window.sessionStorage.token_type) + " " + (localStorageService.get('access_token') || $window.sessionStorage.access_token);

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
