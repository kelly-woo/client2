'use strict';

var app = angular.module('jandiApp');

app.controller('authController', function($scope, $state, $window, $location, $modal, loginAPI, localStorageService, analyticsService, storageAPIservice, userAPIservice) {

    // local test purpose
    var localHost = false;

    $scope.hasToken = true;

    $scope.error = {
        status      : false,
        messsage    : ''
    };

    $scope.teamInfo = {
        id          : -1,
        name        : '',
        prefix      : ''
    };

    function getPrefix() {
        return $location.host().split('.')[0];
    }

    // 최초 로드시 팀정보 받아오기
    var getTeamInfo = function() {
        var prefix = getPrefix();

        if (prefix === 'local' || prefix === 'dev') {
            if (localHost) prefix = 'tosslab';
            else prefix = 'abcd';
        }

        loginAPI.getTeamInfo(prefix)
            .success(function(data) {
                $scope.teamInfo.id = data.teamInfo.teamId;
                $scope.teamInfo.name = data.teamInfo.name;
            })
            .error(function(err) {
                console.error(err);

                storageAPIservice.removeSession();
                storageAPIservice.removeAccessToken();

                $state.go('404');
            });
    };

    $scope.signin = function(user) {
        user.teamId = -1;

        var prefix = getPrefix();

        if (!_.isUndefined(prefix)) {
            if (prefix === 'local' || prefix === 'dev') {
                if (localHost) user.teamId = 279;
                else user.teamId = 1;
            } else {
                user.teamDomain = prefix;
            }
        }

        loginAPI.login(user)
            .success(function(data) {

                storageAPIservice.setWindowSessionStorage(data, prefix);

                if (user.rememberMe) {
                    storageAPIservice.setTokenData(data, prefix);
                }

                autoLogin();
                return;
            }).error(function(err) {
                $scope.error.status = true;
                $scope.error.message = err.message;

                $scope.user.password = "";

                storageAPIservice.removeSession();
                storageAPIservice.removeAccessToken();

                return false;
            });
    };

    // Generate 'id@teamId' format string for google analytics.
    function getUserIdentify() {
        return (storageAPIservice.getSessionUserId() || storageAPIservice.getUserId()) + '-' + (storageAPIservice.getSessionTeamId() || storageAPIservice.getTeamId());
    }

    onSignInEnter();

    // Entry point!
    // EVERYTHING STARTS FROM HERE.
    function onSignInEnter() {

        if (angular.isDefined($scope.user)) {
            if ($state.current.name === 'signin') {
                validateToken();
                autoLogin();
            }
            else return;
        }

        getTeamInfo();
        $scope.prefix = getPrefix();

        if (hasSessionAlive()) {
            autoLogin();
            return;
        }

        if (hasStorageToken()) {
            setSessionStorage();
            autoLogin();
            return;
        }

        $scope.user = {
            email       : '',
            password    : '',
            rememberMe  : true
        };
        storageAPIservice.removeSession($scope.prefix);
        storageAPIservice.removeAccessToken($scope.prefix);

        $scope.hasToken = false;

    }

    // validating token by comparing teamid and current prefix.
    // matching teamId but not-matching prefix means, team name has been changed somewhere. so update team prefix.
    function validateToken() {
        var curPrefix = getPrefix();

        // team domain(prefix) has been changed so it needs to be updated without have user log out.
        if (storageAPIservice.getSessionPrefix() && curPrefix != storageAPIservice.getSessionPrefix()) {
            // updating session.
            storageAPIservice.setSessionPrefix(curPrefix);
        }

        if (!storageAPIservice.hasValidToken($scope.team.id)) {
            // user has old token with old prefix.
            // in this case, don't redirect user to login page, but instead, update token.
            storageAPIservice.updateToken(curPrefix);
        }

    }

    // Check if current tab has alive token.
    function hasSessionAlive() {
        return (storageAPIservice.getSessionPrefix() == $scope.prefix) && !_.isUndefined(storageAPIservice.getSessionToken());
    }

    // Check if Browser stores any token info.
    function hasStorageToken() {
        return storageAPIservice.hasToken($scope.prefix);
    }

    // Import all necessary data from 'localstorage' to '$window.sessionStorage'.
    function setSessionStorage() {
        var tokenData = {
            'token'     : storageAPIservice.getToken($scope.prefix),
            'teamId'    : storageAPIservice.getTeamId(),
            'userId'    : storageAPIservice.getUserId()
        };

        storageAPIservice.setWindowSessionStorage(tokenData, $scope.prefix);
    }

    function autoLogin() {
        setStatics();
        $state.go('messages.home');
    }

    function setStatics() {
        var user_identify = getUserIdentify();

        analyticsService.mixpanelIdentify(user_identify);
        analyticsService.mixpanelTrack("Sign In");

        ga('set', 'userId', user_identify);
        ga('global_tracker.set', 'userId', user_identify);
    }

    $scope.logout = function() {
        var prefix = getPrefix();
        storageAPIservice.removeSession(prefix);
        storageAPIservice.removeAccessToken(prefix);
        mixpanel.cookie.clear();
        $state.go('signin');
    };


    if ($location.search().email) {
        // if email is in query string, set the value initially
        $scope.user.email = $location.search().email;
    }

    $scope.openModal = function(selector) {
        if (selector == 'agreement') {

            var agreement = 'app/modal/terms/agreement';
            agreement = agreement + '_' + userAPIservice.getUserLanguage() + '.html';

            $modal.open({
                scope       :   $scope,
                templateUrl :   agreement,
                size        :   'lg'
            });
        }
        else if (selector == 'privacy') {
            var privacy = 'app/modal/terms/privacy';
            privacy = privacy + '_' + userAPIservice.getUserLanguage() + '.html';

            $modal.open({
                scope       :   $scope,
                templateUrl :   privacy,
                size        :   'lg'
            });
        }
        else if (selector == 'resetPassword') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/password.reset.request.html',
                controller  :   'passwordRequestController',
                size        :   'lg'
            })
        }
    };

});
