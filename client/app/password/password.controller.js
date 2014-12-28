'use strict';

var app = angular.module('jandiApp');

app.controller('passwordResetController', function($scope, $state, $filter, $location, $modal, authAPIservice, $rootScope, $timeout, storageAPIservice) {
    var token = $state.params.token;

    $scope.token = '';

    $scope.title = $filter('translate')('@common-new-password');

    $scope.resetDone = false;
    $scope.resetFailed = false;

    //authAPIservice.validatePasswordToken(teamId, token)
    //    .success(function(response) {
    //        userId = response.id;
    //        token = response.token;
    //    })
    //    .error(function(response) {
    //        //alert($filter('translate')('@common-invalid-request'));
    //        //$state.go('signin');
    //    });


    $scope.resetPassword = function(user) {

        if ($scope.isLoading) return;

        $scope.isLoading = true;

        authAPIservice.resetPassword(token, user.password)
            .success(function(response) {

                $scope.resetDone = true;

                storageAPIservice.removeLocal();
                storageAPIservice.removeSession();

                $timeout(function() {
                    $state.go('signin');
                }, 3000)
            })
            .error(function(response) {
                $scope.resetFailed = true;
                if (response.data.code == 40000) {
                    // Invalid token
                    alert($filter('translate')('@common-invalid-request'));
                }

            })
            .finally(function() {
                $scope.isLoading = false;

            })
    };
});
