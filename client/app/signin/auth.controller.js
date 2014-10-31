'use strict';

var app = angular.module('jandiApp');

app.controller('authController', function($scope, $state, $window, $location, $modal, loginAPI, localStorageService, $rootScope) {

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
        if (prefix === 'local' || prefix === 'dev' || prefix === 'grunt') {
            prefix = 'abcd';
        }
        loginAPI.getTeamInfo(prefix)
            .success(function(data) {
                $scope.teamInfo.id = data.teamInfo.teamId;
                $scope.teamInfo.name = data.teamInfo.name;
            })
            .error(function(err) {
                console.error(err);
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

    // $scope.user may be there and current state could be 'signin' at the same time.
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
                $window.sessionStorage.token = data.token;

                if (user.rememberMe) {
                    setLocalStorageToken(data.token);
                }

                var user_identify = data.userId + '@' + data.teamId;
                mixpanel.identify(user_identify);
                ga('set', '&uid', user_identify);

                $state.go('messages.home');
            }).error(function(err) {
                $scope.error.status = true;
                $scope.error.message = err.message;

                $scope.user.password = "";

                delete $window.sessionStorage.token;
                loginAPI.removeAccessToken();

                return false;
            });
    };

    function setLocalStorageToken(token) {
        loginAPI.setToken(token);
    }

    // Just checking token.
    // If token exists, redirect user to 'message.home'.
    function checkToken() {

        if (loginAPI.getToken() || loginAPI.isLoggedIn()) {
            $window.sessionStorage.token = loginAPI.getToken() || loginAPI.isLoggedIn();

            $state.go('messages.home');
            return;
        }

        $scope.hasToken = false;
    }

    $scope.logout = function() {
        delete $window.sessionStorage.token;
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
