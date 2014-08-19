'use strict';

var app = angular.module('jandiApp');

app.factory('entityAPIservice', function($http, $rootScope, $filter, localStorageService, $state) {
    var entityAPI = {};

    entityAPI.getEntityFromListById = function(list, value) {
        if (value == $rootScope.user.id) return $rootScope.user;

        var entity = $filter('filter')(list, { 'id' : value }, function(actual, expected) {
            return actual == expected;
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
//                console.log('returning')
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
//            console.log('incrementing')
            if (angular.isUndefined(this.getEntityFromListById(list, entity.id).alarmCnt)) {
//                console.log('setting to 1')
                this.getEntityFromListById(list, entity.id).alarmCnt = 1;
            }
            else {
                this.getEntityFromListById(list, entity.id).alarmCnt++;
//                console.log('incrementing')
            }


            return;
        }

//        console.log(entity.name + '  to ' + alarmCount)
        this.getEntityFromListById(list, entity.id).alarmCnt = alarmCount;
    };

    entityAPI.getNameByUserId = function(userId) {
        return this.getFullName(this.getEntityFromListById($rootScope.userList, userId));
    };

    entityAPI.getFullName = function(user) {
        return user.u_lastName + user.u_firstName;
    };

    entityAPI.setLastEntityState = function(entity) {

        console.log(localStorageService.get('last-state'))
        if (localStorageService.get('last-state').entity_id == null) {
            console.log('go to default');
            return;
        }
//        console.log($state)
//        console.log($state.current.name.indexOf('file'))
//        console.log($state.params.entityId)
//        console.log($state.params.entityType)
//        console.log($state.params.itemId)
//        console.log($rootScope.currentEntity)

        var last_state = {
            rpanel_visible  : $state.current.name.indexOf('file') > -1 ? true : false,
            entity_id       : $state.params.entityId,
            entity_type     : $state.params.entityType,
            file_item       : $state.params.itemId
        };

        localStorageService.set('last-state', last_state);
        console.log(localStorageService.get('last-state'));
    };

    return entityAPI;
});
