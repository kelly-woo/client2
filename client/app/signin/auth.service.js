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
            method: 'POST',
            url: $rootScope.server_address + 'accounts/password/resetToken',
            data: {
                email: email,
                lang: accountService.getAccountLanguage()
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

    authAPI.resetPassword = function(token, password) {
        return $http({
            method  : 'PUT',
            url     : $rootScope.server_address + 'accounts/password',
            data    : {
                token: token,
                password: password,
                lang: accountService.getAccountLanguage()
            }
        });
    };

    authAPI.isSignedIn = function() {
        if (angular.isDefined(storageAPIservice.getRefreshTokenLocal()) || angular.isDefined(storageAPIservice.getRefreshTokenSession())){
            return true;
        }
        return false;
    };

    authAPI.requestAccessTokenWithRefreshToken = function() {
        var refresh_token = storageAPIservice.getRefreshTokenLocal() || storageAPIservice.getRefreshTokenSession();

        if (!refresh_token) {
            this.signOut();
            return;
        }

        return $http({
            method  : "POST",
            url     : $rootScope.server_address + 'token',
            data    : {
                'grant_type'    : 'refresh_token',
                'refresh_token' : refresh_token
            }
        });
    };

    authAPI.updateAccessToken = function(response) {
        if (angular.isDefined(storageAPIservice.getRefreshTokenLocal()))
            storageAPIservice.setAccessTokenLocal(response.access_token)
        else
            storageAPIservice.setAccessTokenSession(response.access_token);

        $state.go($state.current, {}, {reload: true}); //second parameter is for $stateParams
    };

    authAPI.signOut = function() {
                if(mixpanel.cookie) mixpanel.cookie.clear();

                storageAPIservice.removeSession();
                storageAPIservice.removeLocal();

                $state.go('signin');
        //DeleteToken()
        //    .success(function() {
        //        if(mixpanel.cookie) mixpanel.cookie.clear();
        //
        //        storageAPIservice.removeSession();
        //        storageAPIservice.removeLocal();
        //
        //        $state.go('signin');
        //
        //    });

    };

    function DeleteToken() {
        return $http({
            method: 'DELETE',
            url: $rootScope.server_address + 'token',
            data: {
                refresh_token: storageAPIservice.getRefreshTokenLocal() || storageAPIservice.getRefreshTokenSession()
            },
            headers : { "Content-Type": "application/json;charset=utf-8" }

        });
    }



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
                return $q.reject(rejection);

            }
            if (rejection.status === 400) {
                // This is just bad request.
                console.debug('BAD REQUEST');
                console.debug(rejection.config.method, rejection.config.url);
                console.debug(rejection);

                return $q.reject(rejection);

            }
            if (rejection.status === 401) {
                // Unauthorized Access.
                // What to do? - get new access_token using refresh_token
                var authAPIservice = $injector.get('authAPIservice');
                authAPIservice.requestAccessTokenWithRefreshToken()
                    .success(function(response) {
                        authAPIservice.updateAccessToken(response);
                    })
                    .error(function(error) {
                        // bad refresh_token.
                        authAPIservice.signOut();
                    });
            }

        }
    };
});
