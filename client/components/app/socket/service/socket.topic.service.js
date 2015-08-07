/**
 * @fileoverview topic 관련 socket event를 처리한다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('jndWebSocketTopic', TopicSocket);

  /* @ngInject */
  function TopicSocket(jndPubSub, entityAPIservice, memberService, logger, jndWebSocketCommon) {
    var TOPIC_LEFT = 'topic_left';
    var TOPIC_JOINED = 'topic_joined';
    var TOPIC_DELETED = 'topic_deleted';
    var TOPIC_CREATED = 'topic_created';
    var TOPIC_UPDATED = 'topic_updated';
    var TOPIC_STARRED = 'topic_starred';
    var TOPIC_UNSTARRED = 'topic_unstarred';

    var ROOM_SUBSCRIBE = 'room_subscription_updated';

    this.attachSocketEvent = attachSocketEvent;

    function attachSocketEvent(socket) {
      socket.on(TOPIC_LEFT, _onTopicLeft);
      socket.on(TOPIC_JOINED, _onTopicJoined);
      socket.on(TOPIC_DELETED, _onTopicLDeleted);
      socket.on(TOPIC_CREATED, _onTopicLCreated);
      socket.on(TOPIC_UPDATED, _onTopicUpdated);
      socket.on(TOPIC_STARRED, _onTopicStarChanged);
      socket.on(TOPIC_UNSTARRED, _onTopicStarChanged);

      socket.on(ROOM_SUBSCRIBE, _onTopicSubscriptionChanged);
    }

    /**
     * 'topic_left' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicLeft(data) {
      logger.socketEventLogger(data.event, data);
      if (jndWebSocketCommon.isCurrentEntity(data.topic)) {
        jndPubSub.toDefaultTopic();
      } else {
        _updateLeftPanel();
      }
    }

    /**
     * 'topic_joined' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicJoined(data) {
      logger.socketEventLogger(data.event, data);
      _updateLeftPanel();
    }

    /**
     * 'topic_deleted' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicLDeleted(data) {
      logger.socketEventLogger(data.event, data);
      if (jndWebSocketCommon.isCurrentEntity(data.topic)) {
        jndPubSub.toDefaultTopic();
      } else {
        _updateLeftPanel(data);
      }
    }

    /**
     * 'topic_created' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicLCreated(data) {
      logger.socketEventLogger(data.event, data);
      _updateLeftPanel();
    }

    /**
     * 'topic_updated' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicUpdated(data) {
      logger.socketEventLogger(data.event, data);

      var _topic = data.topic;
      var _topicEntity = entityAPIservice.getEntityById(_topic.type, _topic.id);

      if (!!_topicEntity) {
        entityAPIservice.extend(_topicEntity, _topic);
      }
      jndPubSub.pub('topicUpdated', data.topic);
    }

    /**
     * 'room_subscribe' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicSubscriptionChanged(data) {
      logger.socketEventLogger(data.event, data);

      var _data = data.data;
      var _eventName = 'onTopicSubscriptionChanged';

      memberService.setTopicNotificationStatus(_data.roomId, _data.subscribe);
      jndPubSub.pub(_eventName, data);
    }

    /**
     * 'topic_starred', 'topic_unstarred' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicStarChanged(data) {
      logger.socketEventLogger(data.event, data);
      _updateLeftPanel();

    }

    function _updateLeftPanel(data) {
      jndPubSub.updateLeftPanel();
      jndPubSub.onChangeShared(data);
    }
  }
})();
