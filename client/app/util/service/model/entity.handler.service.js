/**
 * @fileoverview
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('EntityHandler', EntityHandler);

  /* @ngInject */
  function EntityHandler(RoomTopicList, BotList, UserList, RoomChatDmList) {
    var _starredEntitiesMap = {};

    this.parseLeftSideMenuData = parseLeftSideMenuData;
    this.parseChatRoomLists = parseChatRoomLists;

    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
    }

    /**
     * member chat list 를 조회하는 API 응답 값을 parsing 하여 Model 에 저장한다.
     * /members/12086/chats?memberId=12086
     * @param {object} response - /members/{{memberId}}/chats API 응답값
     */
    function parseChatRoomLists(response) {
      RoomChatDmList.setList(response);
      window.RoomChatDmList = RoomChatDmList;
    }

    /**
     * leftSideMenu API 응답값을 parsing 하여 Model 에 저장한다.
     * @param {object} response - leftSideMenu API 응답값
     */
    function parseLeftSideMenuData(response) {
      _refreshStarredEntitiesMap();

      RoomTopicList.reset();
      UserList.reset();
      BotList.reset();

      _.forEach(response.joinEntities, function(room) {
        _setStarred(room);
        RoomTopicList.add(room, true);
      });

      _.forEach(response.bots, function(bot) {
        _setStarred(bot);
        BotList.add(bot);
      });

      _.forEach(response.entities, function(entity) {
        if (_isRoom(entity) && RoomTopicList.get(entity.id)) {
          RoomTopicList.add(entity, false);
        } else if (_isUser(entity)) {
          UserList.add(entity);
        } else if (_isBot(entity)) {
          BotList.add(entity);
        }
      });

      window.RoomTopicList = RoomTopicList;
      window.UserList = UserList;
      window.BotList = BotList;
    }

    function _setStarred(entity) {
      entity.isStarred = !!_starredEntitiesMap[entity.id];
    }

    function _refreshStarredEntitiesMap() {
      var list = memberService.getStarredEntities();
      _starredEntitiesMap = {};
      _.forEach(list, function(id) {
        _starredEntitiesMap[id] = true;
      });
    }

    function _isRoom(entity) {
      return entity.type === 'channel' || entity.type === 'privateGroup';
    }

    function _isBot(entity) {
      return entity.type === 'bot';
    }

    function _isUser(entity) {
      return entity.type === 'user';
    }
  }
})();
