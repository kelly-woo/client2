'use strict';

var app = angular.module('jandiApp');

app.factory('leftpanelAPIservice', function($http, $rootScope, $state, storageAPIservice, $location) {
    var leftpanelAPI = {};

    leftpanelAPI.getLists = function() {
        return $http({
            method: 'GET',
            url: $rootScope.server_address + 'leftSideMenu'
        });
    };

    leftpanelAPI.getJoinedChannelList = function(array) {
        var joinedChannelList = [],
            privateGroupList = [];

        angular.forEach(array, function(entity, index) {
            var type = entity.type;
            if (type == "channel")
                joinedChannelList.push(entity);
            else if (type == "privateGroup")
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

            if (entityType == "user") {
                if (currentUserId != entityId) {
                    entity.selected = false;
                    userList.push(entity);
                }
            }
            else if (entityType == "channel") {
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

    leftpanelAPI.createChannel = function(channelName) {
        return $http({
            method: 'POST',
            url: $rootScope.server_address + 'channel',
            data : {"name": channelName}
        });
    };

    leftpanelAPI.createPrivateGroup = function(name) {
        return $http({
            method: 'POST',
            url: $rootScope.server_address + 'privateGroup',
            data : {"name" : name}
        });
    };

    leftpanelAPI.joinChannel = function(channelId) {
        return $http({
            method: 'PUT',
            url: $rootScope.server_address + 'channels/' + channelId + '/join'
        });
    };

    leftpanelAPI.setTutorial = function() {
        return $http({
            method: 'PUT',
            url: $rootScope.server_address + 'settings/tutoredAt'

        });
    };


    leftpanelAPI.toSignin = function() {
        storageAPIservice.removeAccessToken($location.host().split('.')[0]);
        storageAPIservice.removeSession();
        $state.go('signin');
    };


    return leftpanelAPI;
});
