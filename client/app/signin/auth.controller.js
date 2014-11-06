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

                $state.go('messages.home');

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
        return (loginAPI.getUserId() || loginAPI.getSessionUserId()) + '@' + (loginAPI.getTeamId() || loginAPI.getSessionTeamId());
    }

    onSignInEnter();

    // Entry point!
    // EVERYTHING STARTS FROM HERE.
    function onSignInEnter() {
        console.log('hello onsigning');

        if (angular.isDefined($scope.user)) {
            if ($state.current.name === 'signin') autoLogin();
            else return;
        }

        getTeamInfo();
        $scope.prefix = getPrefix();

        if (hasToken()) {
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


    function hasToken() {
        console.log(hasSessionAlive() || hasStorageToken())
        return hasSessionAlive() || hasStorageToken();
    }

    // Check if current tab has alive token.
    function hasSessionAlive() {
        console.log()
        console.log()
        var a = loginAPI.getSessionPrefix()
        var b = $scope.prefix;
        console.log(a)
        console.log(b)
        console.log(a == b)
        return loginAPI.getSessionPrefix() == $scope.prefix ;
    }

    // Check if Browser stores any token info.
    function hasStorageToken() {
        console.log(loginAPI.hasToken($scope.prefix))
        return loginAPI.hasToken($scope.prefix);
    }

    function autoLogin() {
        console.log('inside of auto')
        loginAPI.setWindowSessionStorage({
                'token'     : loginAPI.getToken(getPrefix()) || loginAPI.getSessionToken(),
                'teamId'    : loginAPI.getTeamId() || loginAPI.getSessionTeamId(),
                'userId'    : loginAPI.getUserId() || loginAPI.getSessionUserId()
            }, getPrefix()
        );

        setStatics();
        $state.go('messages.home');

        return;
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
                templateUrl :   'app/modal/password.reset.html',
                controller  :   'passwordRequestController',
                size        :   'lg'
            })
        }
    };

});
