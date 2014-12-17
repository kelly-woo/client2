'use strict';

var app = angular.module('jandiApp');

app.factory('messageAPIservice', function($http, $rootScope) {
    var messageAPI = {};

    // get message lists
    messageAPI.getMessages = function(entityType, entityId, offset, limit) {
        entityType = entityType || 'channels';
        offset = offset || -1;
        limit = limit || 20;
        return $http({
            method  : 'GET',
            url     : $rootScope.server_address + entityType + '/' + entityId + '/messages/' + offset + '/' + limit
            //https://127.0.0.1:3000/inner-api/channels/7/messages/-1/10
        });
    };

    // get updated message lists
    messageAPI.getUpdatedMessages = function(entityType, entityId, lastUpdatedId) {
        entityType = entityType || 'channels';
        return $http({
            method  : 'GET',
            url     : $rootScope.server_address + entityType + '/' + entityId + '/messages/update/' + lastUpdatedId
            //https://127.0.0.1:3000/inner-api/channels/6/messages/update/1402728667888
        });
    };

    // post message
    messageAPI.postMessage = function(entityType, entityId, message) {
        entityType = entityType || 'channels';
        return $http({
            method  : 'POST',
            url     : $rootScope.server_address + entityType + '/' + entityId + '/message',
            //https://127.0.0.1:3000/inner-api/channels/6/message
            data    : message
        });
    };

    // edit message
    messageAPI.editMessage = function(entityType, entityId, messageId, message) {
        entityType = entityType || 'channels';
        return $http({
            method  : 'PUT',
            url     : $rootScope.server_address + entityType + '/' + entityId + '/messages/' + messageId,
            //channels/{channel id}/messages/{message id}
            data    : message
        });
    };

    // delete message
    messageAPI.deleteMessage = function(entityType, entityId, messageId) {
        entityType = entityType || 'channels';
        return $http({
            method  : 'DELETE',
            url     : $rootScope.server_address + entityType + '/' + entityId + '/messages/' + messageId
            //channels/{channel id}/messages/{message id}
        });
    };

    //  Updates message marker to 'lastLinkId' for 'entitiyId'
    messageAPI.updateMessageMarker = function(entityId, entityType, lastLinkId) {
        return $http({
            method  : 'POST',
            url     : $rootScope.server_address + 'entities/' + entityId + '/marker',
            data    : {
                "lastLinkId"    :   lastLinkId,
                "entityType"    :   entityType
            }
        });
    };

    return messageAPI;
});
