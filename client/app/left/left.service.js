'use strict';

var app = angular.module('jandiApp');

app.factory('leftpanelAPIservice', function($http, $rootScope, $filter) {
    var leftpanelAPI = {};
//    var response;
//    var joinedChannelList = [],
//        privateGroupList = [],
//        userList = [],
//        totalChannelList = [];

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
        return input.joinEntity[0];
    }

    leftpanelAPI.getGeneralList = function(array, currentUserId) {
        var userList = [],
            idToUserName = [],
            totalChannelList = [];

        angular.forEach(array, function(entity, index) {
            var entityId = entity.id;
            var entityType = entity.type;

            if (entityType == "user") {
                if (currentUserId != entityId) {
                    idToUserName[entityId] = entity.name;
                    entity.visibility = true;
                    entity.selected = false;
                    userList.push(entity);
                }
            }
            else if (entityType == "channel") {
                totalChannelList.push(entity);
            }
        });

        var returnValue = [];

        returnValue.push(userList);
        returnValue.push(totalChannelList);
        returnValue.push(idToUserName);

        return returnValue;
    };

    leftpanelAPI.getEntityFromListById = function(list, value) {
        var entity = $filter('filter')(list, { 'id' : value }, function(actual, expected) {
            return actual == expected;
        });
        if (entity.length != 1) return;

        return entity[0];
    }

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

    return leftpanelAPI;
});
