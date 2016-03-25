/**
 * @fileoverview custom selectbox member servive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndSelectBoxMember', JndSelectBoxMember);

  /* @ngInject */
  function JndSelectBoxMember(UserList, RoomTopicList, memberService, BotList) {
    var _that = this;

    _that.getActiveUserList = getActiveUserList;
    _that.getActiveUserListByRoomId = getActiveUserListByRoomId;
    _that.getActiveMemberList = getActiveMemberList;

    /**
     * 활성화된 user 목록을 전달함.
     * @param {boolean} [withoutMe=false] - 나를 제외한 사용자 목록을 전달할지 여부
     * @returns {*}
     */
    function getActiveUserList(withoutMe) {
      return _getActiveUserList({
        withoutMe: withoutMe
      });
    }

    /**
     * 특정 토픽의 활성화된 user 목록을 전달함.
     * @param roomId
     * @param withoutMe
     * @returns {*}
     */
    function getActiveUserListByRoomId(roomId, withoutMe) {
      var userIds = RoomTopicList.getUserIdList(roomId);
      var list = [];

      _.each(userIds, function(userId) {
        list.push(UserList.get(userId));
      });

      return _getActiveUserList({
        userList: list,
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
      var jandiBot = BotList.getJandiBot();

      if (jandiBot) {
        activeUserList.unshift(jandiBot);
      }

      return activeUserList;
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

      var userList = options.userList || UserList.toJSON();
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
