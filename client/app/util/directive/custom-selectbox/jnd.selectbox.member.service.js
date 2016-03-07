/**
 * @fileoverview custom selectbox member servive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndSelectBoxMember', FileData);

  /* @ngInject */
  function FileData(EntityMapManager, entityAPIservice, memberService) {
    var _that = this;

    _that.getActiveUserList = getActiveUserList;
    _that.getActiveUserListByRoomId = getActiveUserListByRoomId;
    _that.getActiveMemberList = getActiveMemberList;

    /**
     * 활성화된 사용자 목록을 전달함.
     * @param {boolean} [withoutMe=false] - 나를 제외한 사용자 목록을 전달할지 여부
     * @returns {*}
     */
    function getActiveUserList(withoutMe) {
      return _getActiveUserList({
        withoutMe: withoutMe
      });
    }

    /**
     * jandibot을 포함한 활성화된 member 목록을 전달함.
     * @param {boolean} [withoutMe=false] - 나를 제외한 사용자 목록을 전달할지 여부
     * @returns {*}
     */
    function getActiveMemberList(withoutMe) {
      var activeUserList = _getActiveUserList({
        withoutMe: withoutMe
      });
      var jandiBot = entityAPIservice.getJandiBot();

      if (jandiBot) {
        activeUserList.unshift(entityAPIservice.getJandiBot());
      }

      return activeUserList;
    }

    function getActiveUserListByRoomId(roomId, withoutMe) {
      var entity = entityAPIservice.getEntityById('total', roomId);
      var userIds = entityAPIservice.getUserList(entity);
      var list = [];

      _.each(userIds, function(userId) {
        list.push(entityAPIservice.getEntityById('users', userId));
      });

      return _getActiveUserList({
        userList: list,
        withoutMe: withoutMe
      });
    }

    /**
     * 활성화된 user 목록을 전달함.
     * @param {object} options
     * @param {array} [options.userList] - active user 팔별할 목록 전달되지 않으면 entity map의 user 값 사용함.
     * @param {boolean} options.withoutMe - 나를 제외한 사용자 목록을 전달할지 여부
     * @returns {*}
     * @private
     */
    function _getActiveUserList(options) {
      var myMemberId = memberService.getMemberId();
      var activeUserList;

      var userList = options.userList || EntityMapManager.toArray('user');
      var withoutMe = options.withoutMe;

      activeUserList = _.chain(userList)
        .filter(function(user) {
          return memberService.isActiveMember(user) && (!withoutMe || myMemberId !== user.id);
        })
        .sortBy(function(user) {
          return user.name;
        }).value();

      return activeUserList;
    }
  }
})();
