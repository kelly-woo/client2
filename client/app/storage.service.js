'use strict';
app.factory('storageAPIservice', function($http, $rootScope, $window, $cookieStore, localStorageService) {

    var storageAPI = {};

    var accessToken_key     = 'access_token';
    var refreshToken_key    = 'refresh_token';
    var tokenType_key       = 'token_type';
    var lastState_key       = 'last-state';

    var accountId_key       = 'account_id'
    var teamId_key          = 'team_id';
    var memberId_key        = 'member_id';

    /**
     *
     * localStorage Code below.
     *
     * When removing localStorage, currently,
     * it deletes everything stored in localStorage including 'last-state'.
     *
     */

    //////////////////////////////////////////
    //
    //            token
    //
    ///////////////////////////////
    storageAPI.setTokenLocal = function(tokenData) {
        this.setAccessTokenLocal(tokenData.access_token);
        this.setRefreshTokenLocal(tokenData.refresh_token);
        this.setTokenTypeLocal(tokenData.token_type);

    };

    // access_token getter & setter
    storageAPI.setAccessTokenLocal = function(access_token) { localStorageService.set(accessToken_key, access_token); };
    storageAPI.getAccessTokenLocal = function() { return localStorageService.get(accessToken_key); };

    // refresh_token getter & setter
    storageAPI.setRefreshTokenLocal = function(refresh_token) { localStorageService.set(refreshToken_key, refresh_token); };
    storageAPI.getRefreshTokenLocal = function() { return localStorageService.get(refreshToken_key); };

    // token_type getter & setter
    storageAPI.setTokenTypeLocal = function(token_type) { localStorageService.set(tokenType_key, token_type); };
    storageAPI.getTokenTypeLocal = function() { return localStorageService.get(tokenType_key); };

    storageAPI.hasAccessTokenLocal = function() {
        return this.getAccessTokenLocal();
    };


    //////////////////////////////////////////
    //
    //            Last State
    //
    ///////////////////////////////
    storageAPI.setLastStateLocal = function(last_state) { localStorageService.set(lastState_key, last_state); };
    storageAPI.getLastStateLocal = function() { localStorageService.get(lastState_key); };

    storageAPI.removeLastStateLocal = function() { localStorageService.remove(lastState_key); };

    //////////////////////////////////////////
    //
    //            Account Info
    //
    ///////////////////////////////
    storageAPI.setAccountInfoLocal = function(accountId, teamId, memberId) {
        localStorageService.set(accountId_key, accountId);
        localStorageService.set(teamId_key, teamId);
        localStorageService.set(memberId_key, memberId);
    };

    storageAPI.getAccountIdLocal = function() { return localStorageService.get(accountId_key); };
    storageAPI.getTeamIdLocal = function() { return localStorageService.get(teamId_key); };
    storageAPI.getMemberIdLocal = function() { return localStorageService.get(memberId_key); };


    /*
        Removes
            access_token
            refresh_token
            account_id
            team_id
            member_id
        in localStorage.

        Basically, everything except last_state.
    */
    storageAPI.removeLocal = function() {
        console.debug('removing local');
        localStorageService.remove(accessToken_key);
        localStorageService.remove(refreshToken_key);
        localStorageService.remove(tokenType_key);
        localStorageService.remove(accountId_key);
        localStorageService.remove(teamId_key);
        localStorageService.remove(memberId_key);
    };

    /**
     *
     * $window.sessionStorage
     *
     * Storing two objects.
     * When user signs in, it automatically stores sign in info on $window.sessionStorage.
     *
     *  access_token : access_token
     *
     *  Currently not storing 'teamId' and 'userId'.
     *
     *  If $window.session has token and corresponding prefix, it is good to 'autologin' for now.
     *
     */

    //////////////////////////////////////////
    //
    //            token
    //
    ///////////////////////////////
    storageAPI.setTokenSession = function(tokenData) {
        this.setAccessTokenSession(tokenData.access_token);
        this.setRefreshTokenSession(tokenData.refresh_token);
        this.setTokenTypeSession(tokenData.token_type);
    };

    storageAPI.setAccessTokenSession = function(access_token) { $window.sessionStorage.access_token = access_token; };
    storageAPI.getAccessTokenSession = function() { return $window.sessionStorage.access_token; };

    storageAPI.setRefreshTokenSession = function(refresh_token) { $window.sessionStorage.refresh_token = refresh_token; };
    storageAPI.getRefreshTokenSession = function() { return $window.sessionStorage.refresh_token; };

    storageAPI.setTokenTypeSession = function(token_type) { $window.sessionStorage.token_type = token_type; };
    storageAPI.getTokenTypeSession = function() { return $window.sessionStorage.token_type; };

    // checking window session storage.
    storageAPI.hasAccessTokenSession = function() { return this.getAccessTokenSession(); };


    //////////////////////////////////////////
    //
    //            Account Info
    //
    ///////////////////////////////
    storageAPI.setAcountInfoSession =function(accountId, teamId, memberId) {
        $window.sessionStorage.account_id   = accountId;
        $window.sessionStorage.team_id      = teamId;
        $window.sessionStorage.member_id    = memberId;
    };

    storageAPI.getAccountIdSession = function() { return $window.sessionStorage.account_id; };
    storageAPI.getTeamIdSession = function() { return $window.sessionStorage.team_id; };
    storageAPI.getMemberIdSession = function() { return $window.sessionStorage.member_id; };

    // Removes everything in $window.sessionStorage.
    storageAPI.removeSession = function() {
        console.debug('removing session');
        delete $window.sessionStorage.access_token;
        delete $window.sessionStorage.refresh_token;
        delete $window.sessionStorage.account_id;
        delete $window.sessionStorage.team_id;
        delete $window.sessionStorage.member_id;
        $window.sessionStorage.clear();
    };


    /**
     * $CookieStore
     * @param tokenData
     */

    storageAPI.setAccessTokenLocalCookie = function(tokenData) {
        $cookieStore.put(accessToken_key, tokenData.access_token);
    };

    return storageAPI;
});


