'use strict';

var app = angular.module('jandiApp');

app.controller('headerController', function($scope, $rootScope, $state, $filter, $modal, localStorageService, entityheaderAPIservice, entityAPIservice, userAPIservice, analyticsService) {

    console.info('[enter] headerController');

    $scope.openModal = function(selector) {
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
        else if (selector == 'channel') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/create.channel.html',
                controller  :   'createEntityModalCtrl',
                size        :   'lg'
            });
        }
        else if (selector == 'private') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/create.private.html',
                controller  :   'createEntityModalCtrl',
                size        :   'lg'
            });
        }
        else if (selector == 'invite') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/invite.team.html',
                controller  :   'inviteUserToTeamCtrl',
                size        :   'lg'
            });
        }
        else if (selector == 'profile') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/settings.profile.html',
                controller  :   'profileCtrl',
                size        :   'lg'
            });
        }
        else if (selector == 'account') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/settings.account.html',
                controller  :   'accountController',
                size        :   'lg'
            });
        }
        else if (selector === 'preferences') {
            $modal.open({
                sopce       : $scope,
                templateUrl : 'app/modal/preferences.html',
                controller  : 'preferencesController',
//                windowClass : 'modal-wide',
                size        : 'lg'
            });
        }
    };

    //  Called when header dropdown is clicked.
    //  Setting fileTypeQuery to clicked value.
    //  If right panel is not opened yet, open it first.
    //  right.controller is listening to 'updateFileTypeQuery'.
    $scope.onFileTypeClick = function(type) {
        if ($state.current.name != 'messages.detail.files')
            $state.go('messages.detail.files');
        $scope.$emit('updateFileTypeQuery', type);
    };

    //  right controller is listening to 'updateFileWriterId'.
    $scope.onFileListClick = function(userId) {
        if ($state.current.name != 'messages.detail.files')
            $state.go('messages.detail.files');
        $scope.$emit('updateFileWriterId', userId);
    };

    $scope.onToggleClick = function() {
        if ($state.includes('**.files.**')) {
            $state.go('messages.detail');
            return;
        }
        $state.go('messages.detail.files');
    }
});
