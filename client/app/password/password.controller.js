'use strict';

var app = angular.module('jandiApp');

app.controller('passwordResetController', function($scope, $state, $filter, $location, $modal, loginAPI, $rootScope, $timeout) {
    var teamId = $state.params.teamId;
    var token = $state.params.token;

    var userId = '';
    $scope.token = '';

    $scope.resetDone = false;
    $scope.resetFailed = false;

    loginAPI.validatePasswordToken(teamId, token)
        .success(function(response) {
            userId = response.id;
            token = response.token;
        })
        .error(function(response) {
            alert($filter('translate')('@invalid-request'));
            $state.go('signin');
        });

    $scope.resetPassword = function(user) {
        $scope.isLoading = true;
        loginAPI.resetPassword(teamId, token, user.password, $rootScope.preferences.lang)
            .success(function(response) {

                $scope.resetDone = true;
                $scope.isLoading = false;

                loginAPI.removeAccessToken();
                loginAPI.removeSession();

                $timeout(function() {
                    $state.go('signin');
                }, 3000)
            })
            .error(function(response) {
                $scope.isLoading = false;
                $scope.resetFailed = true;
            })
    };
});
