'use strict';
app.factory('storageAPIservice', function($http, $rootScope, $window, localStorageService) {

    // TODO ; MAKE IT RESOLVE.
    // to be used later.
    // signin state로 갈때 resolve 로 이 펑선을 불러서 트루면 바로 message.home 으로 리다이렉트 시킬 예정임.
    // 허나 지금 authController 가 화면 바뀔 때마다 매번 불러져서 hasToken 얻어오는 resolve 가 안 불려서 error 남.

    var storageAPI = {};

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
    var lastState_key = 'last-state';

    storageAPI.setTokenData = function(tokenData, prefix) {
        this.setToken(prefix, tokenData.token);
        this.setTeamId(tokenData.teamId);
        this.setUserId(tokenData.userId);
    };

    storageAPI.hasToken = function(prefix) {
        var keys = localStorageService.keys();
        return _.indexOf(keys, prefix) > -1;
    };

    /**
     * Checks whether current token is valid for current prefix(domain) by checking teamId.
     * @param curTeamId
     * @returns {boolean}
     */
    storageAPI.hasValidToken = function(curTeamId) {
        return this.getTeamId() == curTeamId;
    };

    /**
     * Updates token information on 'localStorage' from 'session'
     * @param prefix
     */
    storageAPI.updateToken = function(prefix) {
        this.setToken(prefix, this.getSessionToken());
        this.setTeamId(this.getSessionTeamId());
        this.setUserId(this.getSessionUserId());
    };

    // token getter & setter
    storageAPI.getToken = function(prefix) { return localStorageService.get(prefix); };
    storageAPI.setToken = function(prefix, token) { localStorageService.set(prefix, token); };

    // teamId getter & setter
    storageAPI.getTeamId = function() { return localStorageService.get(teamId_key); };
    storageAPI.setTeamId = function(teamId) { localStorageService.set(teamId_key, teamId); };

    // userId getter & setter
    storageAPI.getUserId = function() { return localStorageService.get(userId_key); };
    storageAPI.setUserId = function(userId) { localStorageService.set(userId_key, userId); };

    storageAPI.removeLastState = function() {
        localStorageService.remove(lastState_key);
    };
    storageAPI.removeAccessToken = function(prefix) {
        localStorageService.remove(prefix);
        localStorageService.remove(teamId_key);
        localStorageService.remove(userId_key);
    };

    /**
     *
     * $window.sessionStorage
     *
     * Storing two objects.
     *
     *  token : token
     *  prefix : prefix
     *
     *  Currently not storing 'teamId' and 'userId'.
     *
     *  If $window.session has token and corresponding prefix, it is good to 'autologin' for now.
     *
     */
    storageAPI.setWindowSessionStorage = function(tokenData, prefix) {
        this.setSessionToken(tokenData.token);
        this.setSessionTeamId(tokenData.teamId);
        this.setSessionUserId(tokenData.userId);

        this.setSessionPrefix(prefix);
    };

    storageAPI.setSessionToken = function(token) { $window.sessionStorage.token = token; };
    storageAPI.getSessionToken = function() {
        return $window.sessionStorage.token;
    };

    storageAPI.setSessionTeamId = function(teamId) { $window.sessionStorage.teamId = teamId; };
    storageAPI.getSessionTeamId = function() { return $window.sessionStorage.teamId; };

    storageAPI.setSessionUserId = function(userId) { $window.sessionStorage.userId = userId; };
    storageAPI.getSessionUserId = function() { return $window.sessionStorage.userId; };

    storageAPI.setSessionPrefix = function(prefix) { $window.sessionStorage.prefix = prefix; };
    storageAPI.getSessionPrefix = function() { return $window.sessionStorage.prefix; };

    function isSessionTokenDataDefined() {
        return !_.isUndefined($window.sessionStorage.tokenData);
    }

    storageAPI.removeSession = function() {
        $window.sessionStorage.clear();

        delete $window.sessionStorage.token;
        delete $window.sessionStorage.prefix;
        delete $window.sessionStorage.teamId;
        delete $window.sessionStorage.userId;
    };

// checking window session storage.
    storageAPI.isLoggedIn = function() {
        return this.getSessionToken();
    };

    return storageAPI;
});
