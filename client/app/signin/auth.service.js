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
    // TODO ; MAKE IT RESOLVE.
    // to be used later.
    // signin state로 갈때 resolve 로 이 펑선을 불러서 트루면 바로 message.home 으로 리다이렉트 시킬 예정임.
    // 허나 지금 authController 가 화면 바뀔 때마다 매번 불러져서 hasToken 얻어오는 resolve 가 안 불려서 error 남.


    /**
     *
     * localStorage Code below.
     *
     * key-value
     *  'prefixDomain'  : token
     *  'teamId'        : teamId
     *  'userId'        : userId
     *
     * When removing localStorage, currently,
     * it deletes everything stored in localStorage including 'last-state'.
     *
     */

    var teamId_key    = 'teamId';
    var userId_key    = 'userId';

    authAPI.setTokenData = function(tokenData, prefix) {
        this.setToken(tokenData.token, prefix);
        this.setTeamId(tokenData.teamId);
        this.setUserId(tokenData.userId);
    };

    authAPI.hasToken = function(prefix) {
        var keys = localStorageService.keys();

        //console.log('looking for "', prefix, '" from ', keys);
        //console.log('have you found what youve been looking for?', _.indexOf(keys, prefix) > -1)

        //if (_.indexOf(keys, prefix) > -1) {
        //    console.log('found!');
        //    console.log('is token valid?', angular.isDefined(localStorageService.get(prefix)))
        //}

        return _.indexOf(keys, prefix) > -1;
    };

    // token getter
    authAPI.getToken = function(prefix) { return localStorageService.get(prefix); };
    authAPI.setToken = function(token, prefix) { localStorageService.set(prefix, token); };

    authAPI.getTeamId = function() { return localStorageService.get(teamId_key); };
    authAPI.setTeamId = function(teamId) { localStorageService.set(teamId_key, teamId); };

    authAPI.getUserId = function() { return localStorageService.get(userId_key); };
    authAPI.setUserId = function(userId) { localStorageService.set(userId_key, userId); };

    authAPI.removeAccessToken = function(prefix) {
        localStorageService.remove(prefix);
        localStorageService.remove(teamId_key);
        localStorageService.remove(userId_key);
    };

    /**
     *
     * $window.sessionStorage
     *
     * Setting two object.
     *
     *  token : token,
     *  prefix : prefix
     *
     *  Currently not storing 'teamId' and 'userId'.
     *
     *  If $window.session has token and corresponding prefix, it is good to 'autologin' for now.
     *
     */
    authAPI.setWindowSessionStorage = function(tokenData, prefix) {
        this.setSessionToken(tokenData.token);
        this.setSessionTeamId(tokenData.teamId);
        this.setSessionUserId(tokenData.userId);

        this.setSessionPrefix(prefix);
    };

    authAPI.setSessionToken = function(token) { $window.sessionStorage.token = token; };
    authAPI.getSessionToken = function() {
        //if (_.isUndefined($window.sessionStorage.token)) console.log($window.sessionStorage.token)
        //if ($window.sessionStorage.token === 'undefined') console.log('undefined!! but in string')
        return $window.sessionStorage.token;
    };

    authAPI.setSessionTeamId = function(teamId) { $window.sessionStorage.teamId = teamId; };
    authAPI.getSessionTeamId = function() { return $window.sessionStorage.teamId; };

    authAPI.setSessionUserId = function(userId) { $window.sessionStorage.userId = userId; };
    authAPI.getSessionUserId = function() { return $window.sessionStorage.userId; };

    authAPI.setSessionPrefix = function(prefix) { $window.sessionStorage.prefix = prefix; };
    authAPI.getSessionPrefix = function() { return $window.sessionStorage.prefix; };

    function isSessionTokenDataDefined() {
        return !_.isUndefined($window.sessionStorage.tokenData);
    };

    authAPI.removeSession = function() {
        $window.sessionStorage.clear();

        delete $window.sessionStorage.token;
        delete $window.sessionStorage.prefix;
        delete $window.sessionStorage.teamId;
        delete $window.sessionStorage.userId;
    };

    // checking window session storage.
    authAPI.isLoggedIn = function() {
        return this.getSessionToken();
    };

    return authAPI;
});

app.factory('authInterceptor', function ($rootScope, $q, $window) {
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
                console.log('401!!!!!')
                console.log('[' + rejection.status + ' ' + rejection.statusText + '] ' + rejection.data.msg);
                delete $window.sessionStorage.token;
                return null;
            }

            return $q.reject(rejection);
        }
    };
});
