/**
 * @fileoverview DM Chat Room List Model
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('RoomChatDmList', RoomChatDmList);

  /* @ngInject */
  function RoomChatDmList(Collection, UserList, BotList) {
    var _collection;
    var that = this;

    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
      _collection =  new Collection({
        key: 'id'
      });


      that.remove = _collection.remove;
      that.reset = _collection.reset;
      that.get = _collection.get;
      that.remove = _collection.remove;
      that.toJSON= _collection.toJSON;

      that.setList = setList;
      that.add = add;
    }

    /**
     * 콜렉션에 chatRoom 을 추가한다.
     * @param {object} chatRoom
     */
    function add(chatRoom) {
      var member = UserList.get(chatRoom.companionId) || BotList.get(chatRoom.companionId);
      if (member) {
        _collection.add(_.extend(chatRoom, {
          id: chatRoom.entityId,
          extMember: member
        }));
      }
    }

    /**
     * collection 에 list 를 추가한다.
     * @param {Array} list
     */
    function setList(list) {
      _.forEach(list, function(chatRoom) {
        add(chatRoom);
      });
    }
  }
})();
