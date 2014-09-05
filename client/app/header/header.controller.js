'use strict';

var app = angular.module('jandiApp');

app.controller('headerController', function($scope, $rootScope, $state, $filter, $modal, localStorageService, entityheaderAPIservice, entityAPIservice, userAPIservice) {

    console.info('[enter] headerController');

    var currentUser = $scope.user;

    // Watching entityId in $stateParam so that currentEntity can be automatically updated.
    $scope.$watch('$state.params.entityId', function(newValue, oldValue) {
        findCurrent();
    });
    // Watching joinEntities in parent scope so that currentEntity can be automatically updated.
    $scope.$watch('joinEntities', function(newValue, oldValue) {
        if (newValue != oldValue) findCurrent();
    });

    // Called when
    //  1. $state.params.entityId is changed, or
    //  2. joinEntities is changed
    // Finds currently selected entity from lists.
    // No return value.
    function findCurrent() {

        var current = {};

        if ($state.params.entityType === 'users') {
            current = _.find($scope.userList, function(user) {
                return user.id == $state.params.entityId;
            });
        } else {
            current = _.find($scope.joinEntities, function(entity) {
                return entity.id == $state.params.entityId;
            });
        }

        setCurrentEntity(current);
    }


    // Setting currently selected entity.
    function setCurrentEntity(current) {
        // null can't be true. 'current' must have value in all cases.
        // so when nothing came back from 'findCurrent()',
        // it means we need to wait for either 'joinEntities' or 'userList' to be updated.
        // TODO : COME UP WITH BETTER SOLUTION. BETTER MEANS MORE STABLE.
        if (current == null) return;

        // remove duplicate members
        if (current.type === 'channel') {
            current.ch_members = _.uniq(current.ch_members);
        } else if (current.type === 'privateGroup') {
            current.pg_members = _.uniq(current.pg_members);
        }

        $scope.currentEntity = current;

        //  Setting alarmCnt to zero once entity is selected
        $scope.currentEntity.alarmCnt = '';

        //  Setting currentEntitiy at $rootScope so that 'rightpanelController' can access to it.
        $rootScope.currentEntity = $scope.currentEntity;

        hasPrivilege();
    }
    // Call this scope fucntion from scope.
    $scope.findCurrentCaller = function() { findCurrent(); }

    // Returning true if current user is an owner of current channel/private group
    function hasPrivilege() {
        if ($scope.previliged == null)
            $scope.previliged = entityheaderAPIservice.hasPrivilegeHelper(currentUser, $scope.currentEntity);

        return $scope.previliged;
    };

    $scope.onDeleteClick = function() {
        entityheaderAPIservice.deleteEntity($scope.currentEntity.type, $scope.currentEntity.id)
            .success(function(response) {
                updateLeftPanel();
            })
            .error(function(response) {
                alert(response.msg);
            });
    };

    $scope.onLeaveClick = function() {

        //  prevent user from leaving default channel.
        if ($scope.currentEntity.id == $scope.team.t_defaultChannelId) {
            console.debug('cannot leave default channel');
            return;
        }

        entityheaderAPIservice.leaveEntity($scope.currentEntity.type, $scope.currentEntity.id)
            .success(function(response) {
                updateLeftPanel();
            })
            .error(function(response) {
                alert(response.msg);
            })
    };

    $scope.openModal = function(selector) {
        // OPENING JOIN MODAL VIEW
        if (selector == 'rename') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/rename.html',
                controller  :   'renameModalCtrl',
                size        :   'lg'
            });
        }
        else if (selector == 'invite') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/invite.channel.html',
                controller  :   'inviteModalCtrl',
                size        :   'lg',
                windowClass :   'allowOverflowY'
            });
        }
        else if (selector == 'inviteUserToChannel') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/invite.direct.html',
                controller  :   'inviteUsertoChannelCtrl',
                size        :   'lg'
            });
        }
        else if (selector == 'agreement') {
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

    function updateLeftPanel() {
        $scope.updateLeftPanelCaller();
        $rootScope.toDefault = true;
    }

    $scope.getName = function(userId) {
        return userAPIservice.getNameFromUserId(userId)
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
});
