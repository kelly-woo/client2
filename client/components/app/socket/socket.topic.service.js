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
  function TopicSocket(jndPubSub, entityAPIservice) {
    var TOPIC_JOINED = 'topic_joined';
    var TOPIC_LEFT = 'topic_left';
    var TOPIC_DELETED = 'topic_deleted';
    var TOPIC_CREATED = 'topic_created';
    var TOPIC_UPDATED = 'topic_updated';

    this.attachSocketEvent = attachSocketEvent;

    function attachSocketEvent(socket) {
      socket.on(TOPIC_UPDATED, _onTopicUpdated);
      socket.on(TOPIC_JOINED, _onTopicJoined);
      socket.on(TOPIC_LEFT, _onTopicLeft);
      socket.on(TOPIC_DELETED, _onTopicLDeleted);
      socket.on(TOPIC_CREATED, _onTopicLCreated);
    }

    function _onTopicUpdated(data) {
      console.log('_onTopicUpdated', data);
      var _topic = data.topic;
      var _topicType = _topic.type;
      var _topicId = _topic.id;
      var _topicEntity = entityAPIservice.getEntityById(_topicType, _topicId);

      _.extend(_topicEntity, _topic);


      jndPubSub.onChangeShared();
    }

    function _onTopicJoined(data) {
      _updateLeftPanel();

    }

    function _onTopicLeft(data) {
      _updateLeftPanel();
    }

    function _onTopicLDeleted(data) {
      _updateLeftPanel();
    }

    function _onTopicLCreated(data) {
      _updateLeftPanel();
    }

    function _updateLeftPanel() {
      jndPubSub.updateLeftPanel();
    }
  }
})();
