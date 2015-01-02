'use strict';

var app = angular.module('jandiApp');

app.controller('headerController', function($scope, $rootScope, $state, $filter, $modal, authAPIservice, memberService, publicService) {
    //console.info('[enter] headerController');

    $scope.status = {
        menu: {
            open: false
        },
        file: {
            open: false
        },
        settings: {
            open: false
        }
    };

    $scope.isUserAuthorized = function() {
        return memberService.isAuthorized($scope.user);
    };

    $scope.openModal = function(selector) {
        if (selector == 'agreement') {
            publicService.openAgreementModal();
        }
        else if (selector == 'privacy') {
            publicService.openPrivacyModal();
        }
        else if (selector == 'channel') {
            publicService.openTopicCreateModal($scope);
        }
        else if (selector == 'private') {
            publicService.openPrivateCreateModal($scope);
        }
        else if (selector == 'invite') {
            publicService.openInviteToTeamModal($scope);
        }
        else if (selector == 'setting-profile') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/settings.profile.html',
                controller  :   'profileCtrl',
                size        :   'lg'
            });
        }
        else if (selector == 'setting-account') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/settings.account.html',
                controller  :   'accountController',
                size        :   'lg'
            });
        }
        else if (selector === 'setting-service') {
            $modal.open({
                sopce       : $scope,
                templateUrl : 'app/modal/settings.service.html',
                controller  : 'preferencesController',
//                windowClass : 'modal-wide',
                size        : 'lg'
            });
        }
        else if (selector === 'setting-team') {
            $modal.open({
                sopce       : $scope,
                templateUrl : 'app/modal/settings.team.html',
                controller  : 'teamSettingController',
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
    };

    $scope.onShowToturialClick = function() {
        $rootScope.$broadcast('initTutorialStatus');
    };

    $scope.onTutorialPulseClick = function($event) {
        console.log($event)
        $rootScope.$broadcast('onTutorialPulseClick', $event);

    };

    $scope.onSignOutClick =function() {
        authAPIservice.signOut();
    };

    $scope.toggleLoading = function() {
        $scope.isLoading = !$scope.isLoading;
    };
});
