(function() {
    'use strict';

    angular
        .module('jandiApp')
        .factory('storageAPIservice', storageAPIservice);

    storageAPIservice.$inject = ['$window', 'localStorageService'];

    function storageAPIservice($window, localStorageService) {

        var accessToken_key     = 'access_token';
        var refreshToken_key    = 'refresh_token';
        var tokenType_key       = 'token_type';
        var lastState_key       = 'last-state';

        var accountId_key       = 'account_id';
        var teamId_key          = 'team_id';
        var memberId_key        = 'member_id';

        var lastLang_key        = 'last_lang';
        var lastEmail_key       = 'last_email';

        var leftDMCollapsed_key = 'is_left_dm_collapsed';
        var leftTopicCollapsed_key = 'is_left_topic_collapsed';
        var leftPGCollapsed_key = 'is_left_pg_collapsed';

        var autoSignIn_key      = 'should_auto_sign_in';

        var service = {
            setTokenLocal: setTokenLocal,

            setAccessTokenLocal: setAccessTokenLocal,
            getAccessTokenLocal: getAccessTokenLocal,

            setRefreshTokenLocal: setRefreshTokenLocal,
            getRefreshTokenLocal: getRefreshTokenLocal,

            setTokenTypeLocal: setTokenTypeLocal,
            getTokenTypeLocal: getTokenTypeLocal,

            setLastEmail: setLastEmail,
            getLastEmail: getLastEmail,

            setLastLang: setLastLang,
            getLastLang: getLastLang,

            hasAccessTokenLocal: hasAccessTokenLocal,

            setLastStateLocal: setLastStateLocal,
            getLastStateLocal: getLastStateLocal,
            removeLastStateLocal: removeLastStateLocal,

            setAccountInfoLocal: setAccountInfoLocal,
            getAccountIdLocal: getAccountIdLocal,

            getTeamIdLocal: getTeamIdLocal,
            getMemberIdLocal: getMemberIdLocal,

            removeLocal: removeLocal,

            setLeftTopicCollapsed: setLeftTopicCollapsed,
            isLeftTopicCollapsed: isLeftTopicCollapsed,

            setLeftPGCollapsed: setLeftPGCollapsed,
            isLeftPGCollapsed: isLeftPGCollapsed,

            setLeftDMCollapsed: setLeftDMCollapsed,
            isLeftDMCollapsed: isLeftDMCollapsed,

            setLeftListStatus: setLeftListStatus,

            setTokenSession: setTokenSession,

            setAccessTokenSession: setAccessTokenSession,
            getAccessTokenSession: getAccessTokenSession,

            setRefreshTokenSession: setRefreshTokenSession,
            getRefreshTokenSession: getRefreshTokenSession,

            setTokenTypeSession: setTokenTypeSession,
            getTokenTypeSession: getTokenTypeSession,

            hasAccessTokenSession: hasAccessTokenSession,

            setAcountInfoSession: setAcountInfoSession,

            getAccountIdSession: getAccountIdSession,
            getTeamIdSession: getTeamIdSession,
            getMemberIdSession: getMemberIdSession,

            removeSession: removeSession,

            setAccessTokenLocalCookie: setAccessTokenLocalCookie,

            getAccessTokenCookie: getAccessTokenCookie,
            getRefreshTokenCookie: getRefreshTokenCookie,
            getTokenTypeCookie: getTokenTypeCookie,

            removeCookie: removeCookie,

            isValidValue: isValidValue,

            getAccessToken: getAccessToken,
            getRefreshToken: getRefreshToken,

            setShouldAutoSignIn: setShouldAutoSignIn,

            shoudAutoSignIn: shoudAutoSignIn
        };

        return service;

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
        function setTokenLocal (tokenData) {
            setAccessTokenLocal(tokenData.access_token);
            setRefreshTokenLocal(tokenData.refresh_token);
            setTokenTypeLocal(tokenData.token_type);

        }

        // access_token getter & setter
        function setAccessTokenLocal (access_token) { localStorageService.set(accessToken_key, access_token); }
        function getAccessTokenLocal () { return localStorageService.get(accessToken_key); }

        // refresh_token getter & setter
        function setRefreshTokenLocal (refresh_token) { localStorageService.set(refreshToken_key, refresh_token); }
        function getRefreshTokenLocal () { return localStorageService.get(refreshToken_key); }

        // token_type getter & setter
        function setTokenTypeLocal (token_type) { localStorageService.set(tokenType_key, token_type); }
        function getTokenTypeLocal () { return localStorageService.get(tokenType_key); }

        function setLastEmail (email) { localStorageService.set(lastEmail_key, email); }
        function getLastEmail () { return localStorageService.get(lastEmail_key); }

        function setLastLang (lang) { localStorageService.set(lastLang_key, lang); }
        function getLastLang () { return localStorageService.get(lastLang_key); }

        function hasAccessTokenLocal () {
            return getAccessTokenLocal();
        }


        //////////////////////////////////////////
        //
        //            Last State
        //
        ///////////////////////////////
        function setLastStateLocal (last_state) {
            localStorageService.set(lastState_key, last_state);
        }
        function getLastStateLocal () { localStorageService.get(lastState_key); }

        function removeLastStateLocal () { localStorageService.remove(lastState_key); }

        //////////////////////////////////////////
        //
        //            Account Info
        //
        ///////////////////////////////
        function setAccountInfoLocal (accountId, teamId, memberId) {
            localStorageService.set(accountId_key, accountId);
            localStorageService.set(teamId_key, teamId);
            localStorageService.set(memberId_key, memberId);
        }

        function getAccountIdLocal () { return localStorageService.get(accountId_key); }
        function getTeamIdLocal () { return localStorageService.get(teamId_key); }
        function getMemberIdLocal () { return localStorageService.get(memberId_key); }


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
        function removeLocal () {
            localStorageService.remove(accessToken_key);
            localStorageService.remove(refreshToken_key);
            localStorageService.remove(tokenType_key);
            localStorageService.remove(accountId_key);
            localStorageService.remove(teamId_key);
            localStorageService.remove(memberId_key);
            localStorageService.remove(leftTopicCollapsed_key);
            localStorageService.remove(leftPGCollapsed_key);
            localStorageService.remove(leftDMCollapsed_key);

        }

        function setLeftTopicCollapsed (isCollapsed) { localStorageService.set(leftTopicCollapsed_key, isCollapsed); }
        function isLeftTopicCollapsed () { return localStorageService.get(leftTopicCollapsed_key) === 'true'; }

        function setLeftPGCollapsed (isCollapsed) { localStorageService.set(leftPGCollapsed_key, isCollapsed); }
        function isLeftPGCollapsed () { return localStorageService.get(leftPGCollapsed_key) === 'true';   }

        function setLeftDMCollapsed (isCollapsed) { localStorageService.set(leftDMCollapsed_key, isCollapsed); }
        function isLeftDMCollapsed () { return localStorageService.get(leftDMCollapsed_key) === 'true'; }

        function setLeftListStatus (status) {
            setLeftTopicCollapsed(status.isTopicCollapsed);
            setLeftPGCollapsed(status.isPGCollapsed);
            setLeftDMCollapsed(status.isDMCollapsed);
        }

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
        function setTokenSession (tokenData) {
            setAccessTokenSession(tokenData.access_token);
            setRefreshTokenSession(tokenData.refresh_token);
            setTokenTypeSession(tokenData.token_type);
        }

        function setAccessTokenSession (access_token) { $window.sessionStorage.access_token = access_token; }
        function getAccessTokenSession () { return $window.sessionStorage.access_token; }

        function setRefreshTokenSession (refresh_token) { $window.sessionStorage.refresh_token = refresh_token; }
        function getRefreshTokenSession () { return $window.sessionStorage.refresh_token; }

        function setTokenTypeSession (token_type) { $window.sessionStorage.token_type = token_type; }
        function getTokenTypeSession () { return $window.sessionStorage.token_type; }

        // checking window session storage.
        function hasAccessTokenSession () { return getAccessTokenSession(); }

        //////////////////////////////////////////
        //
        //            Account Info
        //
        ///////////////////////////////
        function setAcountInfoSession (accountId, teamId, memberId) {
            $window.sessionStorage.account_id   = accountId;
            $window.sessionStorage.team_id      = teamId;
            $window.sessionStorage.member_id    = memberId;
        }

        function getAccountIdSession () { return $window.sessionStorage.account_id; }
        function getTeamIdSession () { return $window.sessionStorage.team_id; }
        function getMemberIdSession () { return $window.sessionStorage.member_id; }

        // Removes everything in $window.sessionStorage.
        function removeSession () {
            delete $window.sessionStorage.access_token;
            delete $window.sessionStorage.refresh_token;
            delete $window.sessionStorage.account_id;
            delete $window.sessionStorage.team_id;
            delete $window.sessionStorage.member_id;
            $window.sessionStorage.clear();
        }


        /**
         * $CookieStore
         * @param tokenData
         */

        function setAccessTokenLocalCookie (tokenData) {
            localStorageService.cookie.set(accessToken_key, tokenData.access_token);
            localStorageService.cookie.set(refreshToken_key, tokenData.refresh_token);
            localStorageService.cookie.set(tokenType_key, tokenData.token_type);
        }

        function getAccessTokenCookie() {
            if (isValidValue(localStorageService.cookie.get(accessToken_key)))
                return localStorageService.cookie.get(accessToken_key);

            return false;
        }

        function getRefreshTokenCookie() {
            if (isValidValue(localStorageService.cookie.get(refreshToken_key)))
                return localStorageService.cookie.get(refreshToken_key);

            return false;
        }

        function getTokenTypeCookie() {
            if (isValidValue(localStorageService.cookie.get(tokenType_key)))
                return localStorageService.cookie.get(tokenType_key);

            return false;
        }

        function removeCookie() {
            localStorageService.cookie.remove(accessToken_key);
            localStorageService.cookie.remove(refreshToken_key);
            localStorageService.cookie.remove(tokenType_key);
            setShouldAutoSignIn(false);
        }

        function setShouldAutoSignIn(autoSignIn) {
            localStorageService.cookie.set(autoSignIn_key, autoSignIn);
        }

        function shoudAutoSignIn() {
            var value = localStorageService.cookie.get(autoSignIn_key);
            if (typeof value == 'string' && value == 'true') return true;
            if (typeof value == 'boolean' && value ) return true;

            return false;
        }



        function isValidValue (input) {
            if(angular.isUndefined(input) || input === null || input == 'undefined') return false;
            return true;
        }


        // Call below two functions not worrying about getting invalid value for both 'access_token' and 'refresh_token'.
        // If browser contains invalid value, it will detect such case and return false.
        function getAccessToken () {
            if (getAccessTokenCookie())
                return getAccessTokenCookie();
            if (isValidValue(getAccessTokenLocal()))
                return getAccessTokenLocal();
            if (isValidValue(getAccessTokenSession()))
                return getAccessTokenSession();

            return false;
        }
        function getRefreshToken () {
            if (getRefreshTokenCookie())
                return getRefreshTokenCookie();
            if (isValidValue(getRefreshTokenLocal()))
                return getRefreshTokenLocal();
            if (isValidValue(getRefreshTokenSession()))
                return getRefreshTokenSession();

            return false;
        }


    }
})();


