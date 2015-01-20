(function(){
    'use strict';

    angular
        .module('jandiApp')
        .factory('entityAPIservice', entityAPIservice);

    entityAPIservice.$inject = ['$rootScope', '$filter', '$state', '$window', 'storageAPIservice'];

    function entityAPIservice($rootScope, $filter, $state, $window, storageAPIservice) {

        var service = {
            getEntityFromListById: getEntityFromListById,
            getEntityById: getEntityById,
            setCurrentEntity: setCurrentEntity,
            getCreatorId: getCreatorId,
            setStarred: setStarred,
            isMember: isMember,
            updateBadgeValue: updateBadgeValue,
            setBadgeValue: setBadgeValue,
            setLastEntityState: setLastEntityState,
            getLastEntityState: getLastEntityState,
            removeLastEntityState: removeLastEntityState
        };

        return service;

        function getEntityFromListById (list, value) {
            value = parseInt(value);

            if (value === $rootScope.member.id) return $rootScope.member;

            var entity = $filter('filter')(list, { 'id' : value }, function(actual, expected) {
                return actual === expected;
            });

            if (angular.isUndefined(entity)) {
                //console.log(entity)
                //console.log(value)
                //console.log(list)co
            }
            if (angular.isUndefined(entity) || entity.length != 1) return;

            return entity[0];
        }

        function getEntityById (entityType, entityId) {
            entityType = entityType.toLowerCase();
            var list = $rootScope.joinedChannelList;

            // TODO: ISN'T 'indexOf' fucntion slow?
            // TODO: FIND FASTER/BETTER WAY TO DO THIS.
            if (entityType.indexOf('privategroup') > -1) {
                list = $rootScope.privateGroupList;
            }
            else if (entityType.indexOf('user') > -1) {
                list = $rootScope.memberList;
            }
            return this.getEntityFromListById(list, entityId);
        }


        //  return null if 'getEntityById' return nothing.
        function setCurrentEntity (entityType, entityId) {
            var currentEntity = this.getEntityById(entityType, entityId);
            if (angular.isUndefined(currentEntity)) {
                return null;
            }
            currentEntity.alarmCnt = '';
            return currentEntity;
        }

        function getCreatorId (entity) {
            if (entity.type === 'users') return null;

            if (entity.type === 'privateGroup' || entity.type === 'privategroup') {
                return entity.pg_creatorId;
            }
            return entity.ch_creatorId;
        }

        function setStarred (entityId) {
            var entity = this.getEntityFromListById($rootScope.joinedChannelList.concat($rootScope.privateGroupList, $rootScope.memberList), entityId);
            entity.isStarred = true;
        }

        //  Returns true is 'user' is a member of 'entity'
        function isMember (entity, user) {
            //console.log(entity.type)
            //console.log(entity.pg_members)
            //console.log(user.id)
            if (entity.type == 'channel')
                return jQuery.inArray(user.id, entity.ch_members) > -1;
            else
                return jQuery.inArray(user.id, entity.pg_members) > -1;
        }

        //  updating alarmCnt field of 'entity' to 'alarmCount'.
        // 'alarmCount' is -1, it means to increment.
        function updateBadgeValue (entity, alarmCount) {
            var list = $rootScope.privateGroupList;

            if (entity.type == 'channels') {
                //  I'm not involved with entity.  I don't care about this entity.
                if (angular.isUndefined(this.getEntityFromListById($rootScope.joinedChannelList, entity.id))) {
                    return;
                }

                list = $rootScope.joinedChannelList;
            }
            else if (entity.type == 'users') {
                list = $rootScope.memberList;
            }

            this.setBadgeValue(list, entity, alarmCount);
        }

        //  TODO: EXPLAIN THE SITUATION WHEN 'alarmCount' is 0.
        function setBadgeValue (list, entity, alarmCount) {
            var curEntity = this.getEntityFromListById(list, entity.id);
            if (angular.isUndefined(curEntity)) return;

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
        }



        /**
         *
         *  Setting/Getting/Removing 'last-state' from/to localStorage.
         *
         */
        function setLastEntityState () {
            var last_state = {
                rpanel_visible  : $state.current.name.indexOf('file') > -1 ? true : false,
                entityId        : $state.params.entityId,
                entityType      : $state.params.entityType,
                itemId          : $state.params.itemId,
                userId          : $window.sessionStorage.userId
            };

            if (last_state.entityId == null) return;

            storageAPIservice.setLastStateLocal(last_state);
        }
        function getLastEntityState () {
            var last_state = storageAPIservice.getLastStateLocal();

            if (!last_state || last_state.entityId == null) return null;

            return last_state;
        }
        function removeLastEntityState () {
            storageAPIservice.removeLastStateLocal();
        }
    }
})();
