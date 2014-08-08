'use strict';

var app = angular.module('jandiApp');

app.controller('leftpanelController', function($scope, $rootScope, $state, $filter, $modal, $window, leftpanelAPIservice, leftPanel, user, defaultChannel) {

    console.info('[enter] leftpanelController');

    var response = null;

    if (leftPanel.status != 200) {
        var err = leftPanel.data;
        $state.go('error', {code: err.code, msg: err.msg, referrer: "leftpanelAPIservice.getLists"});
    } else {
        response = leftPanel.data;
    }

    initLeftList();

    function initLeftList () {

        // Just making sure to close modal view if any of them left opened.
        //$('.modal').modal('hide');

        $scope.totalEntityCount = response.entityCount;
        $scope.totalEntities = response.entities;

        $scope.joinEntityCount = response.joinEntityCount;
        $scope.joinEntities = response.joinEntity;

        _.each($scope.totalEntities, function(entity) {
            entity.prefix = "";
            if (entity.type === 'channel') {
                entity.prefix = "#";
            } else if (entity.type === 'user') {
                entity.prefix = "@";
            }
        });
        _.each($scope.joinEntities, function(entity) {
            entity.prefix = "";
            if (entity.type === 'channel') {
                entity.prefix = "#";
            } else if (entity.type === 'user') {
                entity.prefix = "@";
            } else {
                entity.prefix = "";
            }
        });

        $scope.user = response.user;

        // Separating 'channel' and 'privateGroup'
        var joinedList = leftpanelAPIservice.getJoinedChannelList($scope.joinEntities);
        $scope.joinedChannelList = joinedList[0];
        $scope.privateGroupList = joinedList[1];


        // userList         - list of all users
        // totalChannelList - all channels including both 'joined' and 'not joined'
        var generalList = leftpanelAPIservice.getGeneralList($scope.totalEntities, $scope.user.id);
        $scope.userList = generalList[0];
        $scope.totalChannelList = generalList[1];

        //  Adding privateGroups to 'totalEntities'
        $scope.totalEntities = $scope.totalEntities.concat($scope.privateGroupList);

        // Update difference between number of all channels and currently joined channels.
        hasMoreChannelsToJoin($scope.totalChannelList.length, $scope.joinedChannelList.length);

        $rootScope.totalChannelList     = $scope.totalChannelList;
        $rootScope.joinedChannelList    = $scope.joinedChannelList;
        $rootScope.privateGroupList     = $scope.privateGroupList;
        $rootScope.userList             = $scope.userList;
        $rootScope.totalEntities        = $scope.totalEntities;
        $rootScope.user                 = $scope.user;
    }

    function getLeftLists() {
        leftpanelAPIservice.getLists()
            .success(function(data) {
                response = data;
                initLeftList();
            })
            .error(function(err) {
                $state.go('error', {code: err.code, msg: err.msg, referrer: "leftpanelAPIservice.getLists"});
            });
    }


    $scope.getCurrentEntity = function() {
        return $scope.currentEntity;
    };

    // Checking whether user joined all possible channels or not.
    function hasMoreChannelsToJoin(a, b) {
        $scope.channelsLeft = a - b;
    }

    // User pressed an enter key from invite modal view in private group.
    $scope.onUserSelected = function() {
        $scope.selectedUser.selected = true;
        $scope.selectedUser = '';
    };

    // Whenever left panel needs to be updated, just invoke 'updateLeftPanel' event.
    $scope.updateLeftPanelCaller = function() {
        getLeftLists();
    };

    $rootScope.$on('updateLeftPanelCaller', function() {
        console.info("[enter] updateLeftPanelCaller");
        getLeftLists();
    });

    $scope.openModal = function(selector) {
        if (selector == 'join') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/join.html',
                controller  :   joinModalCtrl,
                size        :   'lg'
            });
        }
        else if (selector == 'channel') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/create.channel.html',
                controller  :   createEntityModalCtrl,
                size        :   'lg'
            });
        }
        else if (selector == 'private') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/create.private.html',
                controller  :   createEntityModalCtrl,
                size        :   'lg'
            });
        }
        else if (selector == 'user') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/list.user.html',
                controller  :   userModalCtrl,
                size        :   'lg',
                windowClass :   'allowOverflowY'
            });
        }
        else if (selector == 'invite') {
            $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/invite.team.html',
                controller  :   inviteUserToTeamCtrl,
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

});
