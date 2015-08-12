/**
 * @fileoverview member 관련 socket event를 처리한다.
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketMember', jndWebSocketMember);

  /* @ngInject */
  function jndWebSocketMember(jndWebSocketCommon, logger, memberService, jndPubSub,
                              entityAPIservice, EntityMapManager) {
    var MEMBER_STARRED = 'member_starred';
    var MEMBER_UNSTARRED = 'member_unstarred';
    var MEMBER_PROFILE_UPDATED = 'member_profile_updated';
    var MEMBER_PRESENCE_UPDATED = 'member_presence_updated';

    this.attachSocketEvent = attachSocketEvent;

    function attachSocketEvent(socket) {
      socket.on(MEMBER_STARRED, _onMemberStarred);
      socket.on(MEMBER_UNSTARRED, _onMemberUnStarred);
      socket.on(MEMBER_PROFILE_UPDATED, _onMemberProfileUpdated);
      socket.on(MEMBER_PRESENCE_UPDATED, _onMemberPresenceUpdated);
    }

    function _onMemberStarred(socketEvent) {
      logger.socketEventLogger(socketEvent.event, socketEvent);

      jndWebSocketCommon.updateLeft();
    }

    function _onMemberUnStarred(socketEvent) {
      logger.socketEventLogger(socketEvent.event, socketEvent);

      jndWebSocketCommon.updateLeft();
    }

    function _onMemberProfileUpdated(socketEvent) {
      logger.log('member profile updated');
      logger.log(socketEvent);
      logger.socketEventLogger(socketEvent.event, socketEvent);

      var member = socketEvent.member;

      _replaceMemberEntityInMemberList(member);

      if (jndWebSocketCommon.isActionFromMe(member.id)) {
        logger.log('my profile updated');
        memberService.onMemberProfileUpdated();
      }

      jndPubSub.pub('updateMemberProfile', socketEvent);
    }

    function _onMemberPresenceUpdated(socketEvent) {

    }



    /**
     * When member profile information has been updated, local memberList must be updated too.
     *   1. update left panel in order to get new member list
     * @param member {object} member entity object to replace with. Currently not used, but would need such information eventually.
     * @private
     */
    function _replaceMemberEntityInMemberList(member) {
      logger.log('replacing member');

      entityAPIservice.extend(EntityMapManager.get('member', member.id), member);

      if (EntityMapManager.contains('memberEntityId', member.entityId)) {
        entityAPIservice.extend(EntityMapManager.get('memberEntityId', member.id), member);
      }

      // TODO: I think it is too much to update whole left panel when only memberlist needs to be updates.
      jndWebSocketCommon.updateLeft();

    }
  }
})();
