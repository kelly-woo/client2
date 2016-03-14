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
  function EntityHandler(RoomTopicList, BotList, UserList, RoomChatDmList, JndUtil) {
    var _starredEntitiesMap = {};

    this.parseLeftSideMenuData = parseLeftSideMenuData;
    this.parseChatRoomLists = parseChatRoomLists;
    this.get = get;

    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
    }

    /**
     * 전체 entity 에서 id 에 해당하는 entity 를 반환한다.
     * @param {number|string} id
     * @returns {*}
     */
    function get(id) {
      return RoomTopicList.get(id) ||
        BotList.get(id) ||
        UserList.get(id) ||
        RoomChatDmList.get(id);
    }

    /**
     * member chat list 를 조회하는 API 응답 값을 parsing 하여 Model 에 저장한다.
     * /members/12086/chats?memberId=12086
     * @param {object} response - /members/{{memberId}}/chats API 응답값
     */
    function parseChatRoomLists(response) {
      RoomChatDmList.setList(response);
    }

    /**
     * leftSideMenu API 응답값을 parsing 하여 Model 에 저장한다.
     * @param {object} response - leftSideMenu API 응답값
     */
    function parseLeftSideMenuData(response) {
      _refreshStarredEntitiesMap(JndUtil.pick(response, 'user', 'u_starredEntities'));

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
        if (_isTopic(entity) && RoomTopicList.get(entity.id)) {
          RoomTopicList.add(entity, false);
        } else if (_isUser(entity)) {
          UserList.add(entity);
        } else if (_isBot(entity)) {
          BotList.add(entity);
        }
      });
    }

    /**
     * u_starredEntities 정보를 기반으로 즐겨찾기 flag 를 추가한다.
     * @param {object} entity
     * @private
     */
    function _setStarred(entity) {
      entity.isStarred = !!_starredEntitiesMap[entity.id];
    }

    /**
     * u_starredEntities 를 기반으로 빠른 조회를 위해 map 을 생성한다.
     * @param {object} starredEntities
     * @private
     */
    function _refreshStarredEntitiesMap(starredEntities) {
      _starredEntitiesMap = {};
      _.forEach(starredEntities, function(id) {
        _starredEntitiesMap[id] = true;
      });
    }

    /**
     * 해당 entity가 topic 인지 여부를 반환한다.
     * @param {object} entity
     * @returns {boolean}
     * @private
     */
    function _isTopic(entity) {
      return entity.type === 'channel' || entity.type === 'privateGroup';
    }

    /**
     * 해당 entity 가 bot 인지 여부를 반환한다.
     * @param {object} entity
     * @returns {boolean}
     * @private
     */
    function _isBot(entity) {
      return entity.type === 'bot';
    }

    /**
     * 해당 entity 가 user 인지 여부를 반환한다.
     * @param {object} entity
     * @returns {boolean}
     * @private
     */
    function _isUser(entity) {
      return entity.type === 'user';
    }
  }
})();
