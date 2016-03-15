/**
 * @fileoverview DM 채팅 방 List Singleton 모델
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('RoomChatDmList', RoomChatDmList);

  /* @ngInject */
  function RoomChatDmList(Base, Collection, UserList, BotList) {

    /**
     * RoomChatDmList 클래스
     * @constructor
     */
    var RoomChatDmListClass = Base.defineClass(Collection, /**@lends Collection.prototype */{
      /**
       * 생성자
       */
      init: function() {
        Collection.prototype.init.apply(this, arguments);
      },

      /**
       * 콜렉션에 chatRoom 을 추가한다.
       * @param {object} chatRoom
       * @override
       */
      add: function(chatRoom) {
        var member = UserList.get(chatRoom.companionId) || BotList.get(chatRoom.companionId);
        if (member) {
          this._extendMember(member, chatRoom);
          Collection.prototype.add.call(this, _.extend(chatRoom, {
            id: chatRoom.entityId,
            extMember: member
          }));
        }
      },

      /**
       * center 진입 시 unread-bookmark 를 위한 lastMessageId 를 위해 chatRoom 의 attributes 를 member 에 extend 한다.
       * @param {object} member
       * @param {object} chatRoom
       * @private
       */
      _extendMember: function (member, chatRoom) {
        _.each(chatRoom, function(value, name) {
          if (name !== 'id') {
            member = value;
          }
        })
      }
    });

    return new RoomChatDmListClass();
  }
})();
