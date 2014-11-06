'use strict';

var app = angular.module('jandiApp');

app.controller('authController', function($scope, $state, $window, $location, $modal, loginAPI, localStorageService, analyticsService) {

    $scope.hasToken = true;

    $scope.error = {
        status      : false,
        messsage    : ''
    };

    // Initialize teamInfo only where it is not iniailized.
    if (angular.isUndefined($scope.teamInfo)) {
        $scope.teamInfo = {
            id          : -1,
            name        : '',
            prefix      : ''
        };

    }

    var prefix = $location.host().split('.')[0];
    $scope.teamInfo.prefix = $location.host().split('.')[0];

    // 최초 로드시 팀정보 받아오기
    var getTeamInfo = function() {
        console.log('this is getTeamInfo')
        if (prefix === 'local' || prefix === 'dev') {
            //prefix = 'tosslab';
            //prefix = 'abcd';
            prefix = 'jihoon8';
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


    getTeamInfo();

    // $scope.user is not defined -> first time -> not logged in yet.
    // check if there is access_token.
    // if not, follow normal routine.
    if (angular.isUndefined($scope.user)) {
        checkToken();


        $scope.user = {
            email       : '',
            password    : '',
            rememberMe  : true
        };
    }

    // $scope.user may exist and current state could be 'signin' at the same time.
    // I logged in, I navigate to 'google.com' and come back to ***.jandi.com
    // check token first.
    if (angular.isDefined($scope.user) && $state.current.name === 'signin') {
        checkToken();
    }

    $scope.signin = function(user) {
        user.teamId = -1;

        if (!_.isUndefined(prefix)) {
            if (prefix === 'local' || prefix === 'dev') {
                user.teamId = 1;
            } else {
                user.teamDomain = prefix;
            }
        }

        loginAPI.login(user)
            .success(function(data) {
                setWindowSessionStorage(data);

                if (user.rememberMe) {
                    setLocalStorageToken(data);
                }

                var user_identify = getUserIdentify();

                analyticsService.mixpanelIdentify(user_identify);
                analyticsService.mixpanelTrack("Sign In");

                ga('set', 'userId', user_identify);
                ga('global_tracker.set', 'userId', user_identify);

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

    function setLocalStorageToken(tokenData) {
        loginAPI.setTokenData(tokenData);
    }
    function setWindowSessionStorage(tokenData) {
        loginAPI.setWindowSessionStorage(tokenData);
    }

    function getUserIdentify() {
        return (loginAPI.getUserId() || loginAPI.getSessionUserId()) + '@' + (loginAPI.getTeamId() || loginAPI.getSessionTeamId());
    }
    // Just checking token.
    // If token exists, redirect user to 'message.home'.
    function checkToken() {

        if (loginAPI.getToken() || loginAPI.isLoggedIn()) {
            $window.sessionStorage.token = loginAPI.getToken() || loginAPI.isLoggedIn();

            var user_identify = getUserIdentify();

            ga('set', 'userId', user_identify);

            $state.go('messages.home');
            return;
        }

        $scope.hasToken = false;
    }

    $scope.logout = function() {
        loginAPI.removeSession();
        loginAPI.removeAccessToken();
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
    };

});
