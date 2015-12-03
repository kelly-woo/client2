/**
 * @fileoverview topic 관련 socket event를 처리한다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketTopic', TopicSocket);

  /* @ngInject */
  function TopicSocket($filter, jndPubSub, entityAPIservice, memberService, jndWebSocketCommon, Dialog,
                       EntityMapManager, currentSessionHelper) {
    var TOPIC_LEFT = 'topic_left';
    var TOPIC_JOINED = 'topic_joined';
    var TOPIC_DELETED = 'topic_deleted';
    var TOPIC_CREATED = 'topic_created';
    var TOPIC_UPDATED = 'topic_updated';
    var TOPIC_STARRED = 'topic_starred';
    var TOPIC_UNSTARRED = 'topic_unstarred';

    var ROOM_SUBSCRIBE = 'room_subscription_updated';

    var events = [
      {
        name: 'topic_kicked_out',
        version: 1,
        handler: _onTopicKickedOut
      },
      {
        name: 'topic_left',
        version: 1,
        handler: _onTopicLeft
      },
      {
        name: 'topic_joined',
        version: 1,
        handler: _onTopicJoined
      },
      {
        name: 'topic_deleted',
        version: 1,
        handler: _onTopicLDeleted
      },
      {
        name: 'topic_created',
        version: 1,
        handler: _onTopicLCreated
      },
      {
        name: 'topic_updated',
        version: 1,
        handler: _onTopicUpdated
      },
      {
        name: 'topic_starred',
        version: 1,
        handler: _onTopicStarChanged
      },
      {
        name: 'topic_unstarred',
        version: 1,
        handler: _onTopicStarChanged
      },
      {
        name: 'room_subscription_updated',
        version: 1,
        handler: _onTopicSubscriptionChanged
      }
    ];

    this.getEvents = getEvents;

    function getEvents() {
      return events;
    }

    /**
     * kickout 시 이벤트 핸들러
     * @param {object} socketEvent
     * @private
     */
    function _onTopicKickedOut(socketEvent) {
      var currentTeam = currentSessionHelper.getCurrentTeam();
      if (currentTeam.id ===  socketEvent.data.teamId) {
        jndPubSub.pub('kickedOut', socketEvent);
        if (jndWebSocketCommon.isCurrentEntity({id: socketEvent.data.roomId})) {
          jndPubSub.toDefaultTopic();
        }
        _updateLeftPanel({
          topic: {
            id: socketEvent.data.roomId
          }
        });
      }
    }

    /**
     * 'topic_left' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicLeft(data) {
      if (jndWebSocketCommon.isCurrentEntity(data.topic)) {
        jndPubSub.toDefaultTopic();
      }

      _updateLeftPanel(data);
    }

    /**
     * 'topic_joined' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicJoined(data) {
      _updateLeftPanel(data);
    }

    /**
     * 'topic_deleted' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicLDeleted(data) {
      _updateLeftPanel(data);

      jndPubSub.pub('topicDeleted', data);

      // topic 삭제시 file upload 중이라면 전부 취소하는 event를 broadcast함
      jndPubSub.pub('onFileUploadAllClear');
      if (jndWebSocketCommon.isCurrentEntity(data.topic)) {
        jndPubSub.toDefaultTopic();
      }
    }

    /**
     * 'topic_created' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicLCreated(data) {
      _updateLeftPanel(data);
    }

    /**
     * 'topic_updated' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicUpdated(data) {
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
      _updateLeftPanel();
    }

    function _updateLeftPanel(data) {
      jndPubSub.updateLeftPanel();
      jndPubSub.onChangeShared(data);
    }
  }
})();
