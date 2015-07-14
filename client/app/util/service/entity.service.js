(function(){
  'use strict';

  angular
    .module('jandiApp')
    .factory('entityAPIservice', entityAPIservice);

  /* @ngInject */
  function entityAPIservice($rootScope, $filter, $state, $window, storageAPIservice, jndPubSub,
                            currentSessionHelper, pcAppHelper) {
    var memberEntityIdMap = {};

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
      isOwner: isOwner,
      getEntityByEntityId: getEntityByEntityId,
      addToMemberEntityIdMap: addToMemberEntityIdMap,
      resetMemberEntityIdMap: resetMemberEntityIdMap
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
      entityId = parseInt(entityId, 10);
      if ($rootScope.member && $rootScope.member.id === entityId) return $rootScope.member;

      return _getSelectEntity(list, entityId, 'entityId');
    }


    /**
     * Takes an 'id' of entity as a 'value'
     * Used to compare with topics.
     *
     * @param list
     * @param value
     * @returns {*}
     */
    function getEntityFromListById (list, id) {
      id = parseInt(id);
      if ($rootScope.member && $rootScope.member.id === id) return $rootScope.member;

      // 만약 list 가
      //  memberList 면 memberMap
      //  joinedEntities 면 joinedEntitiesMap
      //  privateGroups 면 privateGroupsMap으로 보내기.
      // 그 외 경우에만 getSelectEntitiy 로 보내기.
      //  아마 totalEntities 밖에 없을 듯.
      //

      //var entityType;
      //if (list === $rootScope.memberList) {
      //  console.log('memberList');
      //  entityType = 'user';
      //} else if (list === $rootScope.joinedEntities) {
      //  entityType = 'joinedEntities';
      //} else if (list === $rootSCope.totalEntities) {
      //
      //}

      return _getSelectEntity(list, id, 'id');
    }

    function _getSelectEntity(list, id, name) {
      var item;
      var i;
      var len;

      if (list != null) {
        for (i = 0, len = list.length; i < len; ++i) {
          item = list[i];

          if (item[name] === id) {
            return item;
          }
        }
      }
    }

    /**
     * If entityType is 'channel', look for entityId only in 'joinedChannelList'.
     * So non-joined topic will be found.
     *
     * @param entityType
     * @param entityId
     * @returns {*}
     */
    function getEntityById(entityType, entityId) {
      var entity;
      entityType = entityType.toLowerCase();

      // TODO: ISN'T 'indexOf' fucntion slow?
      // TODO: FIND FASTER/BETTER WAY TO DO THIS.
      if (entityType.indexOf('privategroup') > -1 && $rootScope.privateGroupMap) {
        entity = $rootScope.privateGroupMap[entityId];
      } else if (entityType.indexOf('user') > -1 && $rootScope.memberMap) {
        if (_isMe(entityType, entityId)) {
          entity = $rootScope.member;
        } else {
          entity = $rootScope.memberMap[entityId];
        }
      } else if($rootScope.joinedChannelMap) {
        entity = $rootScope.joinedChannelMap[entityId];
      }
      return entity;
    }

    /**
     * 본인 entity 인지 여부를 반환한다.
     * @param {String} entityType
     * @param {number|string} entityId
     * @returns {boolean} 본인 entity 인지 여부
     * @private
     */
    function _isMe(entityType, entityId) {
      entityId = parseInt(entityId, 10);
      return !!(entityType.indexOf('user') > -1 && $rootScope.member && $rootScope.member.id === entityId);
    }

    //  return null if 'getEntityById' return nothing.
    function setCurrentEntity (currentEntity) {
      if (angular.isUndefined(currentEntity)) {
        return null;
      }

      currentEntity.alarmCnt = '';
      pcAppHelper.onAlarmCntChanged(currentEntity.id, 0);

      currentSessionHelper.setCurrentEntity(currentEntity);
      jndPubSub.pub('onCurrentEntityChanged', currentEntity);

      //updateBadgeValue(currentEntity, 0);

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
      if (!_.isUndefined(entity)) {
        entity.isStarred = true;
      }
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
      } else if (entity.type == 'users') {
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
        if (angular.isUndefined(curEntity.alarmCnt)) {
          curEntity.alarmCnt = 1;
        } else {
          curEntity.alarmCnt++;
        }
        pcAppHelper.onAlarmCntChanged(entity.id, curEntity.alarmCnt);
      } else {
        curEntity.alarmCnt = alarmCount;
        pcAppHelper.onAlarmCntChanged(entity.id, alarmCount);
      }
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

    /**
     * Returns number of member in entity including myself.
     *
     * @param entity {entity}
     * @returns {number} number of member in 'entity'
     */
    function getMemberLength(entity) {
      if (angular.isUndefined(entity) || entity.type == 'users') {
        return -1;
      }

      var members = entity.ch_members || entity.pg_members;

      return members.length;
    }

    function isDefaultTopic(entity) {
      return entity.id == currentSessionHelper.getDefaultTopicId();
    }

    function isOwner(entity, memberId) {
      return (entity.ch_creatorId || entity.pg_creatorId) == memberId;
    }

    /**
     * 'entityId'를 이용하여 member entity 를 찾아 리턴한다.
     * 그러므로
     *  1. 'entityId'를 사용할때만
     *  2. member entity 를 찾으려 할때만
     * 사용해야 한다.
     * @param {*} entityId - entityId to be searched
     * @returns {object} entity - member entity
     */
    function getEntityByEntityId(entityId) {
      entityId = _parseInt(entityId);
      return memberEntityIdMap[entityId];
    }

    /**
     * (entityId: entity) pair 를 memberEntityIdMap 에 추가한다.
     * @param {string|number} entityId - key 로 쓰일 entityId
     * @param {object} entity - value 로 쓰일 member entity
     */
    function addToMemberEntityIdMap(entityId, entity) {
      entityId = _parseInt(entityId);
      memberEntityIdMap[entityId] = entity;
    }

    /**
     * memberEntityIdMap 를 초기화한다.
     */
    function resetMemberEntityIdMap() {
      memberEntityIdMap = {};
    }

    /**
     * parseInt 를 해주는 wrapper function.
     * @param number
     * @returns {Number|*}
     * @private
     */
    function _parseInt(number) {
      return parseInt(number, 10);
    }
  }
})();
