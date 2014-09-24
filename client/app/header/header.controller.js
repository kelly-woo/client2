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
