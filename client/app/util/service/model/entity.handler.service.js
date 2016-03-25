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
  function EntityHandler($rootScope, RoomTopicList, BotList, UserList, RoomChatDmList, CoreUtil, entityheaderAPIservice,
                         AnalyticsHelper, jndPubSub, currentSessionHelper, memberService) {
    var _scope;
    var _starredEntitiesMap = {};

    this.parseLeftSideMenuData = parseLeftSideMenuData;
    this.parseChatRoomLists = parseChatRoomLists;
    this.get = get;
    this.extend = extend;
    this.toggleStarred = toggleStarred;
    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
      _scope = $rootScope.$new(true);
      _attachScopeEvents();
    }

    function _attachScopeEvents() {
      _scope.$on('TopicSocket:starChanged', _onTopicStarChanged);
      _scope.$on('jndWebSocketMember:starChanged', _onMemberStarChanged);
    }

    /**
     *
     */
    function toggleStarred(entityId) {
      var entity = get(entityId);
      if (entity.isStarred) {
        entityheaderAPIservice.removeStarEntity(entityId)
          .then(_.bind(_onSuccessStarred, null, entityId, false),
            _.bind(_onErrorStarred, null, entityId, false));
      } else {
        entityheaderAPIservice.setStarEntity(entityId)
          .then(_.bind(_onSuccessStarred, null, entityId, true),
            _.bind(_onErrorStarred, null, entityId, true));
      }
      entity.isStarred = !entity.isStarred;
    }

    function _onSuccessStarred(entityId, isStarred) {
      var trackCode = isStarred ? AnalyticsHelper.EVENT.TOPIC_STAR : AnalyticsHelper.EVENT.TOPIC_UNSTAR;
      AnalyticsHelper.track(trackCode, {
        'RESPONSE_SUCCESS': true,
        'TOPIC_ID': entityId
      });
    }

    function _onErrorStarred(entityId, isStarred, error) {
      var entity = get(entityId);
      var trackCode = isStarred ? AnalyticsHelper.EVENT.TOPIC_STAR : AnalyticsHelper.EVENT.TOPIC_UNSTAR;
      entity.isStarred = isStarred;

      AnalyticsHelper.track(trackCode, {
        'RESPONSE_SUCCESS': false,
        'ERROR_CODE': error.code
      });
    }

    function _onTopicStarChanged(angularEvent, data) {
      /*
      @fixme: 소켓 이벤트 버그로 인해 BOT 의 상태 변화도 topic_starred/unstarred 로 내려오고 있음.
       http://its.tosslab.com/browse/JWC-412
       소켓 이벤트 버그 수정 이후  BotList.get(data.id); 를 제거해야 함
       */
      var topic = RoomTopicList.get(data.id) || BotList.get(data.id);
      topic.isStarred = data.isStarred;
    }

    function _onMemberStarChanged(angularEvent, data) {
      var member = UserList.get(data.id) || BotList.get(data.id);
      member.isStarred = data.isStarred;
    }

    /**
     * 전체 entity 에서 id 에 해당하는 entity 를 반환한다.
     * @param {number|string} id
     * @returns {*}
     */
    function get(id) {
      return RoomTopicList.get(id) ||
        UserList.get(id) ||
        RoomChatDmList.get(id) ||
        BotList.get(id);
    }

    /**
     * item 을 확장한다.
     * @override
     * @param {number|string} id
     * @param {object} targetObj
     */
    function extend(id, targetObj) {
      return RoomTopicList.extend(id, targetObj) ||
        UserList.get(id, targetObj)||
        RoomChatDmList.get(id, targetObj) ||
        BotList.get(id, targetObj);
    }

    /**
     * member chat list 를 조회하는 API 응답 값을 parsing 하여 Model 에 저장한다.
     * /members/12086/chats?memberId=12086
     * @param {object} response - /members/{{memberId}}/chats API 응답값
     */
    function parseChatRoomLists(response) {
      RoomChatDmList.setList(response);
      jndPubSub.pub('EntityHandler:parseChatRoomListsDone');
    }

    /**
     * leftSideMenu API 응답값을 parsing 하여 Model 에 저장한다.
     * @param {object} response - leftSideMenu API 응답값
     */
    function parseLeftSideMenuData(response) {
      _setCurrentTeamAdmin(response.entities);
      currentSessionHelper.setCurrentTeam(response.team);
      memberService.setMember(response.user);
      _refreshStarredEntitiesMap(CoreUtil.pick(response, 'user', 'u_starredEntities'));

      RoomTopicList.reset();
      UserList.reset();
      BotList.reset();

      _.forEach(response.joinEntities, function(room) {
        RoomTopicList.add(room, true);
      });

      _.forEach(response.bots, function(bot) {
        _setStarred(bot);
        BotList.add(bot);
      });

      _.forEach(response.entities, function(entity) {
        _setStarred(entity);
        if (_isTopic(entity) && !RoomTopicList.get(entity.id)) {
          RoomTopicList.add(entity, false);
        } else if (_isUser(entity)) {
          UserList.add(entity);
        } else if (_isBot(entity)) {
          BotList.add(entity);
        }
      });

      jndPubSub.pub('EntityHandler:parseLeftSideMenuDataDone');
    }

    /**
     *
     * @param {array} entities
     * @private
     */
    function _setCurrentTeamAdmin(entities) {
      _.forEach(entities, function(entity) {
        if (entity.u_authority === 'owner') {
          currentSessionHelper.setCurrentTeamAdmin(entity);
          return false;
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
