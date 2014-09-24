'use strict';

var app = angular.module('jandiApp');

app.factory('entityAPIservice', function($http, $rootScope, $filter, localStorageService, $state) {
    var entityAPI = {};

    var currentEntity;

    entityAPI.getEntityFromListById = function(list, value) {
        if (value == $rootScope.user.id) return $rootScope.user;

        var entity = $filter('filter')(list, { 'id' : value }, function(actual, expected) {
            return actual === expected;
        });

        if (angular.isUndefined(entity) || entity.length != 1) return;

        return entity[0];
    };

    //  Returns proper list from $rootScope.
    entityAPI.getEntityList = function(entity) {
        var type = entity.type;
        var list;
        switch(type) {
            case 'user' :
                return $rootScope.userList;
            case 'channel' :
                return $rootScope.joinedChannelList;
            case 'privateGroup' :
                return $rootScope.privateGroupList;
            default :
                return $rootScope.totalEntities;
        }
    }

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


    entityAPI.hasPrivilegeHelper = function(user, entityType, entityId, isLeftUpdated) {
        if (!isLeftUpdated) return;

        if (user.u_authority == 'owner' || user.u_authority == 'admin') return true;

        if (entityType === 'users') return false;

        entityId = parseInt(entityId);

        if (angular.isUndefined(currentEntity) || currentEntity.id != entityId) {
            this.setCurrentEntity(entityType, entityId)
        }

        if (entityType === 'channels')
            return currentEntity.ch_creatorId === user.id;

        return currentEntity.pg_creatorId === user.id;;
    };

    entityAPI.setCurrentEntity = function(entityType, entityId) {
        var list = $rootScope.joinedChannelList;

        // TODO: privategroups and privateGroups
        // TODO: fix this bug when re-routing.
        if (entityType === 'privategroups' || entityType === 'privateGroups') {
            list = $rootScope.privateGroupList;
        }
        else if (entityType === 'users') {
            list = $rootScope.userList;
        }

        currentEntity = this.getEntityFromListById(list, entityId);
    };

    entityAPI.getCurrentEntity = function() {
        return currentEntity;
    };

    return entityAPI;
});
