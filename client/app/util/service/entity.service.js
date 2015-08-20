(function(){
  'use strict';

  angular
    .module('jandiApp')
    .factory('entityAPIservice', entityAPIservice);

  /* @ngInject */
  function entityAPIservice($rootScope, EntityMapManager, $state, $window, storageAPIservice, jndPubSub,
                            currentSessionHelper, pcAppHelper, NotificationManager) {
    var service = {
      getEntityFromListByEntityId: getEntityFromListByEntityId,
      getEntityFromListById: getEntityFromListById,
      getEntityById: getEntityById,
      setCurrentEntityWithTypeAndId: setCurrentEntityWithTypeAndId,
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
      extend: extend,
      isJoinedTopic: isJoinedTopic,
      getMemberList: getMemberList,
      isLeavedTopic: isLeavedTopic
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

      return getEntityByEntityId(entityId);
    }


    /**
     * Takes an 'id' of entity as a 'value'
     * Used to compare with topics.
     *
     * @param list
     * @param value
     * @returns {*}
     */
    function getEntityFromListById(list, id) {
      id = parseInt(id);
      if ($rootScope.member && $rootScope.member.id === id) return $rootScope.member;
      return _getSelectEntity(list, id, 'id');
    }

    /**
     *
     * @param list
     * @param id
     * @param name
     * @returns {*}
     * @private
     */
    function _getSelectEntity(list, id, name) {
      return EntityMapManager.get('total', id);
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

      switch (entityType) {
        case 'privategroup':
        case 'privategroups':
          entity = EntityMapManager.get('private', entityId);
          break;
        case 'user':
        case 'users':
          entity = EntityMapManager.get('member', entityId);
          break;
        case 'channel':
        case 'channels':
          entity = EntityMapManager.get('joined', entityId);
          break;
        default:
          entity = EntityMapManager.get('total', entityId);
          break;
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

    function setCurrentEntityWithTypeAndId(entityType, entityId) {
      var currentEntity;
      if (!_.isUndefined(entityId)) {
        currentEntity = EntityMapManager.get('total', entityId);
      }
      if (!_.isUndefined(currentEntity)) {
        setCurrentEntity(currentEntity);
      }
    }
    //  return null if 'getEntityById' return nothing.
    function setCurrentEntity (currentEntity) {
      currentEntity.alarmCnt = '';
      pcAppHelper.onAlarmCntChanged(currentEntity.id, 0);
      NotificationManager.remove(currentEntity);

      currentSessionHelper.setCurrentEntity(currentEntity);
      jndPubSub.pub('onCurrentEntityChanged', currentEntity);
    }

    /**
     * 생성자의 아이디를 리턴한다.
     * @param {object} entity - 생성자를 알고 싶은 토픽(1:1DM이 될 수도 있음).
     * @returns {*}
     */
    function getCreatorId (entity) {
      if (entity.type === 'users') return null;

      if (entity.type === 'privateGroup' || entity.type === 'privategroup') {
        return entity.pg_creatorId;
      }
      return entity.ch_creatorId;
    }

    /**
     * 해당하는 아이디를 가진 토픽(혹은 dm)을 'starred' 처리한다.
     * @param {number} entityId - star처리 할 토픽(혹은 dm)의 아이디
     */
    function setStarred (entityId) {
      var entity = getEntityFromListById('total', entityId);
      if (!_.isUndefined(entity)) {
        entity.isStarred = true;
      }
    }

    //  Returns true is 'user' is a member of 'entity'
    function isMember (entity, user) {
      if (entity.type == 'channel')
        return _.indexOf(entity.ch_members, user.id) > -1;
      else
        return _.indexOf(entity.pg_members, user.id) > -1;
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

      NotificationManager.set(entity, alarmCount);
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

      var members = getMemberList(entity);

      return members.length;
    }

    /**
     * 토픽(혹은 dm)이 현재 팀의 default topic 인지 아닌지 확인한다.
     * @param {object} entity - 확인하고자하는 토픽
     * @returns {boolean}
     */
    function isDefaultTopic(entity) {
      return entity.id == currentSessionHelper.getDefaultTopicId();
    }

    /**
     * 토픽(혹은 dm)의 생성자인지 아닌지 확인한다.
     * @param {object} entity - 확인하고자하는 토픽
     * @param {number} memberId - 확인하고자하는 유저의 아이디
     * @returns {boolean}
     */
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
      return EntityMapManager.get('memberEntityId', entityId);
    }

    /**
     * _.extend 와 같은 일을 하지만 source 의 type을 소문자로 바꾼 후 복수형으로 바꾼 다음 extend를 한다.
     * @param target
     * @param source
     */
    function extend(target, source) {
      if (!!source.type) {
        source.type = source.type.toLowerCase() + 's';
      }
      _.extend(target, source);
    }

    /**
     * 조인되어있는 토픽(공개/비공개)인지 알아본다.
     * @param {object} entity - 알아보고 싶은 토픽
     * @returns {boolean}
     */
    function isJoinedTopic(entity) {
      return  EntityMapManager.contains('joined', entity.id) ||
              EntityMapManager.contains('private', entity.id);
    }

    /**
     * entity의 type에따라 맞는 member array를 넘겨준다.
     * @param entity
     * @returns {array} memberList
     */
    function getMemberList(entity) {
      if (entity.type === 'channels') {
        return entity.ch_members;
      } else {
        return entity.pg_members;
      }
    }

    /**
     * topic에 포함되지 않은 member인지 여부
     * @param {object} topic
     * @param {number} memberId
     * @returns {boolean}
     */
    function isLeavedTopic(entity, memberId) {
      var result = false;
      var members;
      
      if (entity) {
        members = getMemberList(entity);
        if (members && members.indexOf(memberId) < 0) {
          result = true;
        }
      } else {
        result = true;
      }

      return result;
    }
  }
})();
