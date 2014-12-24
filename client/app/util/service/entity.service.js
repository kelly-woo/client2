'use strict';

var app = angular.module('jandiApp');

app.factory('entityAPIservice', function($rootScope, $filter, $state, $window, storageAPIservice) {
    var entityAPI = {};

    entityAPI.getEntityFromListById = function(list, value) {
        value = parseInt(value);

        if (value === $rootScope.member.id) return $rootScope.member;

        var entity = $filter('filter')(list, { 'id' : value }, function(actual, expected) {
            return actual === expected;
        });

        if (angular.isUndefined(entity) || entity.length != 1) return;

        return entity[0];
    };

    entityAPI.getEntityById = function(entityType, entityId) {
        entityType = entityType.toLowerCase();

        var list = $rootScope.joinedChannelList;

        // TODO: ISN'T 'indexOf' fucntion slow?
        // TODO: FIND FASTER/BETTER WAY TO DO THIS.
        if (entityType.indexOf('privategroup') > -1) {
            list = $rootScope.privateGroupList;
        }
        else if (entityType.indexOf('user')) {
            list = $rootScope.memberList;
        }

        return this.getEntityFromListById(list, entityId);
    };

    //  return null if 'getEntityById' return nothing.
    entityAPI.setCurrentEntity = function(entityType, entityId) {
        var currentEntity = this.getEntityById(entityType, entityId);
        if (angular.isUndefined(currentEntity)) {
            return null;
        }
        currentEntity.alarmCnt = '';
        return currentEntity;
    };

    entityAPI.getCreatorId = function(entity) {
        if (entity.type === 'users') return null;

        if (entity.type === 'privateGroup' || entity.type === 'privategroup') {
            return entity.pg_creatorId;
        }
        return entity.ch_creatorId;
    };

    entityAPI.setStarred = function(entityId) {
        var entity = this.getEntityFromListById($rootScope.joinedChannelList.concat($rootScope.privateGroupList, $rootScope.memberList), entityId);
        entity.isStarred = true;
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
    };
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


    entityAPI.getInviteOptions = function(joinedChannelList, privateGroupList) {
        // TODO: 이미 모든 팀원이 초대된 entity는 예외 처리
        var lists = joinedChannelList.concat(privateGroupList);
        return lists;
    };

    /**
     *
     *  Setting/Getting/Removing 'last-state' from/to localStorage.
     *
     */
    entityAPI.setLastEntityState = function() {
        var last_state = {
            rpanel_visible  : $state.current.name.indexOf('file') > -1 ? true : false,
            entityId        : $state.params.entityId,
            entityType      : $state.params.entityType,
            itemId          : $state.params.itemId,
            userId          : $window.sessionStorage.userId
        };

        if (last_state.entityId == null) return;

        storageAPIservice.setLastStateLocal(last_state);
    };

    entityAPI.getLastEntityState = function() {
        var last_state = storageAPIservice.getLastStateLocal();

        if (!last_state || last_state.entityId == null) return null;

        return last_state;
    };

    entityAPI.removeLastEntityState = function() {
        storageAPIservice.removeLastStateLocal();
    };
    return entityAPI;
});
