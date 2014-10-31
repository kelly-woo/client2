'use strict';

var app = angular.module('jandiApp');

app.factory('entityAPIservice', function($http, $rootScope, $filter, localStorageService, $state) {
    var entityAPI = {};

    var currentEntity;

    entityAPI.getEntityFromListById = function(list, value) {
        value = parseInt(value);

        if (value === $rootScope.user.id) return $rootScope.user;

        var entity = $filter('filter')(list, { 'id' : value }, function(actual, expected) {
            return actual === expected;
        });

        if (angular.isUndefined(entity) || entity.length != 1) return;

        return entity[0];
    };

    entityAPI.getEntityById = function(entityType, entityId) {
        var list = $rootScope.joinedChannelList;

        if (entityType === 'privategroups' || entityType === 'privateGroups') {
            list = $rootScope.privateGroupList;
        }
        else if (entityType === 'users') {
            list = $rootScope.userList;
        }

        return this.getEntityFromListById(list, entityId);
    };

    //  updating alarmCnt field of 'entity' to 'alarmCount'.
    entityAPI.updateBadgeValue = function(entity, alarmCount) {
        var list = $rootScope.privateGroupList;

        if (entity.type == 'channel') {
            //  I'm not involved with entity.  I don't care about this entity.
            if (angular.isUndefined(this.getEntityFromListById($rootScope.joinedChannelList, entity.id))) {
                return;
            }

            list = $rootScope.joinedChannelList;
        }
        else if (entity.type == 'user') {
            list = $rootScope.userList;
        }

        this.setBadgeValue(list, entity, alarmCount);
    }

    //  TODO: EXPLAIN THE SITUATION WHEN 'alarmCount' is 0.
    entityAPI.setBadgeValue = function(list, entity, alarmCount) {
        if (alarmCount == -1) {
            if (angular.isUndefined(this.getEntityFromListById(list, entity.id).alarmCnt)) {
                this.getEntityFromListById(list, entity.id).alarmCnt = 1;
            }
            else {
                this.getEntityFromListById(list, entity.id).alarmCnt++;
            }
            return;
        }

        this.getEntityFromListById(list, entity.id).alarmCnt = alarmCount;
    };

    entityAPI.setLastEntityState = function() {
        var last_state = {
            rpanel_visible  : $state.current.name.indexOf('file') > -1 ? true : false,
            entityId       : $state.params.entityId,
            entityType     : $state.params.entityType,
            itemId         : $state.params.itemId
        };

        if (last_state.entityId == null) return;

        localStorageService.set('last-state', last_state);
    };

    entityAPI.getLastEntityState = function() {
        var last_state = localStorageService.get('last-state');

        if (!last_state || last_state.entityId == null) return null;

        return last_state;
    };

    //  return null if 'getEntityById' return nothing.
    entityAPI.setCurrentEntity = function(entityType, entityId) {
        currentEntity = this.getEntityById(entityType, entityId);
        if (angular.isUndefined(currentEntity)) {
            return null;
        }
        currentEntity.alarmCnt = '';
        return currentEntity;
    };

    entityAPI.getCurrentEntity = function() {
        return currentEntity;
    };

    entityAPI.getCreatorId = function(entity) {
        if (entity.type === 'users') return null;

        if (entity.type === 'privateGroup' || entity.type === 'privategroup') {
            return entity.pg_creatorId;
        }
        return entity.ch_creatorId;
    };

    entityAPI.hasSeenTutorial = function(user) {
        return false;
    }

    entityAPI.setStarredEntity = function(entityId) {
        var entity = this.getEntityFromListById($rootScope.joinedChannelList.concat($rootScope.privateGroupList, $rootScope.userList), entityId);
        entity.isStarred = true;
    };

    return entityAPI;
});
