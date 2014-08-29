'use strict';

var app = angular.module('jandiApp');

app.controller('authController', function($scope, $state, $window, $location, loginAPI, localStorageService) {
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

    $scope.error = {
        status      : false,
        messsage    : ''
    };

    var getTeamInfo = function(email) {

    };

    if ($location.search().email) {
        $scope.user.email = $location.search().email;
        getTeamInfo($scope.user.email);
    }

    $scope.signin = function(user) {
        user.teamId = -1;

        var prefix = $location.host().split('.')[0];

        if (!_.isUndefined(prefix)) {
            if (prefix === 'local' || prefix === 'dev') {
                user.teamId = 0;
            } else {
                user.teamDomain = prefix;
            }
        }

        loginAPI.login(user)
            .success(function(data) {
                $window.sessionStorage.token = data.token;
                $state.go('messages.home');
                localStorageService.set('ui-state', default_state)
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
