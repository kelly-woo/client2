'use strict';

var app = angular.module('jandiApp');

app.factory('leftpanelAPIservice', function($http, $rootScope, $state, $filter, storageAPIservice, memberService) {
    var leftpanelAPI = {};

    leftpanelAPI.getLists = function() {
        return $http({
            method: 'GET',
            url: $rootScope.server_address + 'leftSideMenu',
            params: {
                teamId: memberService.getTeamId()
            }
        });
    };

    // TODO: SHOULD MOVE TO memberService
    leftpanelAPI.setTutorial = function() {
        return $http({
            method: 'PUT',
            url: $rootScope.server_address + 'settings/tutoredAt'
        });
    };


    leftpanelAPI.toSignin = function() {
        storageAPIservice.removeLocal();
        storageAPIservice.removeSession();

        if ($state.is('signin')) {
            $state.transitionTo('signin', '', {'reload':true});
        }
        else {
            $state.transitionTo('signin', '', {'reload':true});

        }
    };

    leftpanelAPI.getJoinedChannelList = function(array) {
        var joinedChannelList = [],
            privateGroupList = [];

        angular.forEach(array, function(entity, index) {
            var type = entity.type;
            if (type == "channels")
                joinedChannelList.push(entity);
            else if (type == "privategroups")
                privateGroupList.push(entity);
        });

        var returnValue = [];

        returnValue.push(joinedChannelList);
        returnValue.push(privateGroupList);

        return returnValue;
    };

    leftpanelAPI.getDefaultChannel = function(input) {
        return input.team.t_defaultChannelId;
    };

    leftpanelAPI.getGeneralList = function(totalEntities, joinedEntities, currentUserId) {
        var userList = [],
            totalChannelList = [],
            unJoinedChannelList = [];

        angular.forEach(totalEntities, function(entity, index) {
            var entityId = entity.id;
            var entityType = entity.type;

            if (entityType == "users") {
                if (currentUserId != entityId) {
                    entity.selected = false;
                    userList.push(entity);
                }
            }
            else if (entityType == "channels") {
                var found = false;
                _.each(joinedEntities, function(element, index, list) {
                    if (!found && element.id == entityId) found = true;
                });

                if (!found) {
                    unJoinedChannelList.push(entity);
                }

                totalChannelList.push(entity);

            }
        });

        var returnValue = [];

        returnValue.push(userList);
        returnValue.push(totalChannelList);
        returnValue.push(unJoinedChannelList);

        return returnValue;
    };

    // TODO: REFACTOR | TO entityAPIservice - LOGIC ONLY.
    //  Initialize correct prefix for 'channel' and 'user'.
    leftpanelAPI.setEntityPrefix = function($scope) {
        _.each($scope.totalEntities, function(entity) {
            entity.isStarred = false;
            if (entity.type === 'channel') {
                entity.type = 'channels';
                entity.typeCategory = $filter('translate')('@common-topics');
            } else if (entity.type === 'user') {
                entity.type = 'users';
                entity.typeCategory = $filter('translate')('@user');
            }
            else {
                entity.type = 'privategroups';
                entity.typeCategory = $filter('translate')('@common-topics');
            }
        });

        _.each($scope.joinEntities, function(entity) {
            entity.isStarred = false;
            if (entity.type === 'channel') {
                entity.type = 'channels';
                entity.typeCategory = $filter('translate')('@common-topics');
            } else if (entity.type === 'user') {
                entity.type = 'users';
                entity.typeCategory = $filter('translate')('@user');
            } else {
                entity.type = 'privategroups';
                entity.typeCategory = $filter('translate')('@common-topics');
            }
        });
    };

    return leftpanelAPI;
});
