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
        switch(selector) {
            case 'agreement':
                publicService.openAgreementModal();
                break;
            case 'privacy':
                publicService.openPrivacyModal();
                break;
            case 'channel':
                publicService.openTopicCreateModal($scope);
                break;
            case 'private':
                publicService.openPrivateCreateModal($scope);
                break;
            case 'invite':
                publicService.openInviteToTeamModal($scope);
                break;
            case 'teamChange':
                publicService.openTeamChangeModal($scope);
                break;
            case 'setting-team':
                publicService.openTeamSettingModal($scope);
                break;
            default:
                break;
        }


        if (selector == 'setting-profile') {
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
        publicService.signOut();
    };

    $scope.toggleLoading = function() {
        $scope.isLoading = !$scope.isLoading;
    };

});
