'use strict';

var app = angular.module('jandiApp');

app.controller('authController', function($scope, $state, $window, $location, $modal, loginAPI, localStorageService, analyticsService) {

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
            //prefix = 'tosslab';
            prefix = 'abcd';
        }

        loginAPI.getTeamInfo(prefix)
            .success(function(data) {
                $scope.teamInfo.id = data.teamInfo.teamId;
                $scope.teamInfo.name = data.teamInfo.name;
            })
            .error(function(err) {
                console.error(err);

                loginAPI.removeSession();
                loginAPI.removeAccessToken();

                $state.go('404');
            });
    };

    $scope.signin = function(user) {
        user.teamId = -1;

        var prefix = getPrefix();

        if (!_.isUndefined(prefix)) {
            if (prefix === 'local' || prefix === 'dev') {
                user.teamId = 1;
            } else {
                user.teamDomain = prefix;
            }
        }

        loginAPI.login(user)
            .success(function(data) {

                loginAPI.setWindowSessionStorage(data, prefix);

                if (user.rememberMe) {
                    loginAPI.setTokenData(data, prefix);
                }

                autoLogin();
                return;
            }).error(function(err) {
                $scope.error.status = true;
                $scope.error.message = err.message;

                $scope.user.password = "";

                loginAPI.removeSession();
                loginAPI.removeAccessToken();

                return false;
            });
    };

    // Generate 'id@teamId' format string for google analytics.
    function getUserIdentify() {
        return (loginAPI.getSessionUserId() || loginAPI.getUserId()) + '@' + (loginAPI.getSessionTeamId() || loginAPI.getTeamId());
    }

    onSignInEnter();

    // Entry point!
    // EVERYTHING STARTS FROM HERE.
    function onSignInEnter() {

        if (angular.isDefined($scope.user)) {
            if ($state.current.name === 'signin') {
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

        $scope.hasToken = false;

    }

    // Check if current tab has alive token.
    function hasSessionAlive() {
        //var a = loginAPI.getSessionPrefix()
        //var b = $scope.prefix;
        //
        //console.log('session prefix', a)
        //console.log('current prefix', b)
        //console.log('are they same?', a == b)
        //console.log('session token', loginAPI.getSessionToken());
        //console.log('token defined?', !_.isUndefined(loginAPI.getSessionToken()));
        //console.log('returning', (loginAPI.getSessionPrefix() == $scope.prefix) && !_.isUndefined(loginAPI.getSessionToken()));

        return (loginAPI.getSessionPrefix() == $scope.prefix) && !_.isUndefined(loginAPI.getSessionToken());
    }

    // Check if Browser stores any token info.
    function hasStorageToken() {
        return loginAPI.hasToken($scope.prefix);
    }

    // Import all necessary data from 'localstorage' to '$window.sessionStorage'.
    function setSessionStorage() {
        var tokenData = {
            'token'     : loginAPI.getToken($scope.prefix),
            'teamId'    : loginAPI.getTeamId(),
            'userId'    : loginAPI.getUserId()
        };

        loginAPI.setWindowSessionStorage(tokenData, $scope.prefix);
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
        loginAPI.removeSession(prefix);
        loginAPI.removeAccessToken(prefix);
        mixpanel.cookie.clear();
        $state.go('signin');
    };


    if ($location.search().email) {
        // if email is in query string, set the value initially
        $scope.user.email = $location.search().email;
    }

    $scope.openModal = function(selector) {
        // OPENING JOIN MODAL VIEW
        if (selector == 'agreement') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/terms/agreement.html',
                size        :   'lg'
            });
        }
        else if (selector == 'privacy') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/terms/privacy.html',
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
