'use strict';

var app = angular.module('jandiApp');

app.controller('authController', function($scope, $state, $window, $location, $modal, loginAPI, localStorageService) {

     var default_state = {
        cpanel_name: 'general',
        cpanel_type: 'channel',
        rpanel_visible: true,
        rpanel_name: 'files',
        rpanel_detail: ''
    };

    $scope.user = {
        email       : '',
        password    : ''
    };

    $scope.teamInfo = {
        id          : -1,
        name        : '',
        prefix      : ''
    };

    $scope.error = {
        status      : false,
        messsage    : ''
    };

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

    var prefix = $location.host().split('.')[0];
    $scope.teamInfo.prefix = $location.host().split('.')[0];

    // 최초 로드시 팀정보 받아오기
    var getTeamInfo = function() {
        if (prefix === 'local' || prefix === 'dev') {
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

    if ($location.search().email) {
        // if email is in query string, set the value initially
        $scope.user.email = $location.search().email;
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
                $state.go('messages.home');
                localStorageService.set('ui-state', default_state);

                var user_identify = data.userId + '@' + data.teamId;
                mixpanel.identify(user_identify);
                ga('set', '&uid', user_identify);
            }).error(function(err) {
                $scope.error.status = true;
                $scope.error.message = err.message;
                delete $window.sessionStorage.token;
                return false;
            });
    };

    $scope.logout = function() {
        delete $window.sessionStorage.token;
        $state.go('signin');
    };
});
