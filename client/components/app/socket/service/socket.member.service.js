/**
 * @fileoverview member 관련 socket event를 처리한다.
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketMember', jndWebSocketMember);

  /* @ngInject */
  function jndWebSocketMember(jndWebSocketCommon, memberService, jndPubSub,
                              UserList) {
    var MEMBER_STARRED = 'member_starred';
    var MEMBER_UNSTARRED = 'member_unstarred';
    var MEMBER_PROFILE_UPDATED = 'member_profile_updated';
    var MEMBER_PRESENCE_UPDATED = 'member_presence_updated';
    var MEMBER_UPDATED = 'member_updated';


    var events = [
      {
        name: MEMBER_STARRED,
        version: 1,
        handler: _.bind(_onMemberStarChanged, null, true)
      },
      {
        name: MEMBER_UNSTARRED,
        version: 1,
        handler: _.bind(_onMemberStarChanged, null, false)
      },
      {
        name: MEMBER_PROFILE_UPDATED,
        version: 1,
        handler: _onMemberProfileUpdated
      },
      {
        name: MEMBER_PRESENCE_UPDATED,
        version: 1,
        handler: _onMemberPresenceUpdated
      },
      {
        name: MEMBER_UPDATED,
        version: 1,
        handler: _onMemberUpdated
      }
    ];

    this.getEvents = getEvents;

    function getEvents() {
      return events;
    }

    /**
     * 'member_starred', 'member_unstarred' EVENT HANDLER
     * @param {boolean} isStarred
     * @param {object} socketEvent - socket event parameter
     * @private
     */
    function _onMemberStarChanged(isStarred, socketEvent) {
      jndPubSub.pub('jndWebSocketMember:starChanged', _.extend(socketEvent.member, {
        isStarred: isStarred
      }));
    }

    function _onMemberProfileUpdated(socketEvent) {
      var member = socketEvent.member;

      UserList.extend(member.id, member);

      if (jndWebSocketCommon.isActionFromMe(member.id)) {
        memberService.onMemberProfileUpdated();
      }

      jndPubSub.pub('updateMemberProfile', socketEvent);
    }

    function _onMemberPresenceUpdated(socketEvent) {

    }

    /**
     * member update 이벤트 핸들러
     * @param {object} socketEvent
     * @private
     */
    function _onMemberUpdated(socketEvent) {
      var member = CoreUtil.pick(socketEvent, 'data', 'member');
      if (member) {
        UserList.extend(member.id, member);
        jndPubSub.pub('jndWebSocketMember:memberUpdated', socketEvent);
      }
    }


    /**
     * When member profile information has been updated, local memberList must be updated too.
     *   1. update left panel in order to get new member list
     * @param member {object} member entity object to replace with. Currently not used, but would need such information eventually.
     * @private
     */
    function _replaceMemberEntityInMemberList(member) {
      UserList.extend(member.id, member);

    }
  }
})();
