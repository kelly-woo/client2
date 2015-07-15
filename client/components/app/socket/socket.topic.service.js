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
  function TopicSocket(jndPubSub, entityAPIservice, logger) {
    var TOPIC_LEFT = 'topic_left';
    var TOPIC_JOINED = 'topic_joined';
    var TOPIC_DELETED = 'topic_deleted';
    var TOPIC_CREATED = 'topic_created';
    var TOPIC_UPDATED = 'topic_updated';

    this.attachSocketEvent = attachSocketEvent;

    function attachSocketEvent(socket) {
      socket.on(TOPIC_LEFT, _onTopicLeft);
      socket.on(TOPIC_JOINED, _onTopicJoined);
      socket.on(TOPIC_DELETED, _onTopicLDeleted);
      socket.on(TOPIC_CREATED, _onTopicLCreated);
      socket.on(TOPIC_UPDATED, _onTopicUpdated);
    }

    /**
     * 내가 토픽을 나갔을 때.
     * @param data
     * @private
     */
    function _onTopicLeft(data) {
      logger.socketEventLogger(TOPIC_LEFT, data);
      _updateTopics();
      jndPubSub.pub('onTopicLeft', data);

    }

    /**
     * 내가 토픽에 조인했을 때.
     * @param data
     * @private
     */
    function _onTopicJoined(data) {
      logger.socketEventLogger(TOPIC_JOINED, data);
      _updateTopics();
    }

    /**
     * 내가 토픽을 지웠을 때.
     * @param data
     * @private
     */
    function _onTopicLDeleted(data) {
      logger.socketEventLogger(TOPIC_DELETED, data);
      _updateTopics();
      jndPubSub.pub('onTopicDeleted', data);
    }

    /**
     * 누군가가 토픽을 생성했을 때.
     * @param data
     * @private
     */
    function _onTopicLCreated(data) {
      logger.socketEventLogger(TOPIC_CREATED, data);
      _updateTopics();
    }

    /**
     * 토픽이 업데이트되었을 때.
     * @param data
     * @private
     */
    function _onTopicUpdated(data) {
      logger.socketEventLogger(TOPIC_UPDATED, data);

      var _topic = data.topic;
      var _topicEntity = entityAPIservice.getEntityById(_topic.type, _topic.id);

      if (!!_topicEntity) {
        entityAPIservice.extend(_topicEntity, _topic);
      }

    }

    function _updateTopics() {
      jndPubSub.updateLeftPanel();
      jndPubSub.onChangeShared();
    }
  }
})();
