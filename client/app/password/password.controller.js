'use strict';

var app = angular.module('jandiApp');

app.controller('passwordResetController', function($scope, $state, $filter, $location, $modal, authAPIservice, $rootScope, $timeout, storageAPIservice) {
    var teamId = $state.params.teamId;
    var token = $state.params.token;

    var userId = '';
    $scope.token = '';

    $scope.title = $filter('translate')('@common-new-password');

    $scope.resetDone = false;
    $scope.resetFailed = false;

    authAPIservice.validatePasswordToken(teamId, token)
        .success(function(response) {
            userId = response.id;
            token = response.token;
        })
        .error(function(response) {
            //alert($filter('translate')('@common-invalid-request'));
            //$state.go('signin');
        });

    $scope.resetPassword = function(user) {
        $scope.isLoading = true;
        authAPIservice.resetPassword(teamId, token, user.password, $rootScope.preferences.serverLang)
            .success(function(response) {

                $scope.resetDone = true;
                $scope.isLoading = false;

                storageAPIservice.removeAccessToken();
                storageAPIservice.removeSession();

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
