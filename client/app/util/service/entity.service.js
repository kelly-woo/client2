(function(){
  'use strict';

  angular
    .module('jandiApp')
    .factory('entityAPIservice', entityAPIservice);

  /* @ngInject */
  function entityAPIservice($rootScope, $filter, $state, $window, storageAPIservice, jndPubSub,
                            currentSessionHelper) {

    var service = {
      getEntityFromListByEntityId: getEntityFromListByEntityId,
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
      removeLastEntityState: removeLastEntityState,
      getMemberLength: getMemberLength,
      isDefaultTopic: isDefaultTopic,
      isOwner: isOwner

    };

    return service;


    /**
     * Takes 'entityId' from entity as an 'entityId'
     * Used to compare with chat room.
     *
     * @param list
     * @param entityId
     * @returns {*}
     */
    function getEntityFromListByEntityId(list, entityId) {
      entityId = parseInt(entityId);

      if (entityId === $rootScope.member.id) return $rootScope.member;

      var returnObj;

      _.forEach(list, function(entity, index) {
        if (entity.entityId == entityId) {
          returnObj = entity;
        }
      });

      return returnObj;
    }

    /**
     * Takes an 'id' of entity as a 'value'
     * Used to compare with topics.
     *
     * @param list
     * @param value
     * @returns {*}
     */
    function getEntityFromListById (list, value) {
      value = parseInt(value);

      if (value === $rootScope.member.id) return $rootScope.member;

      var returnEntity;

      _.forEach(list, function(entity, index) {
        if (entity.id == value) {
          returnEntity = entity;
        }
      });

      return returnEntity;
    }

    /**
     * If entityType is 'channel', look for entityId only in 'joinedChannelList'.
     * So none-joined topic will be found.
     *
     * @param entityType
     * @param entityId
     * @returns {*}
     */
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
    function setCurrentEntity (currentEntity) {
      if (angular.isUndefined(currentEntity)) {
        return null;
      }

      currentEntity.alarmCnt = '';

      jndPubSub.pub('onCurrentEntityChanged', currentEntity);
      currentSessionHelper.setCurrentEntity(currentEntity);

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
      //console.log('updating')
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

      //console.log(alarmCount)
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

    function getMemberLength(entity) {
      if (angular.isUndefined(entity) || entity.type == 'users') {
        return -1;
      }

      var members = entity.ch_members || entity.pg_members;

      return members.length;
    }

    function isDefaultTopic(entity) {
      return entity.id == $rootScope.team.t_defaultChannelId;
    }

    function isOwner(entity, memberId) {
      return (entity.ch_creatorId || entity.pg_creatorId) == memberId;
    }
  }
})();
