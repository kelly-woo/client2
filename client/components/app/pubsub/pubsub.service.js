/**
 * @fileoverview $rootScope.$broadCast를 대신해주는 서비스.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.pubsub')
    .service('jndPubSub', jndPubSub);

  /* @ngInject */
  function jndPubSub($rootScope) {

    this.pub = publish;

    this.updateLeftPanel = updateLeftPanel;
    this.updateChatList = updateChatList;
    this.updateMessageList = updateMessageList;
    this.updateRightFileDetailPanel = updateRightFileDetailPanel;

    this.toDefaultTopic = toDefaultTopic;

    this.updateLeftChatList = updateLeftChatList;

    /**
     * $rootScope.$broadcast를 대신한다.
     * @param event {string} name of event to be broadcast
     * @param param {object} param of event to be passed along with broadcast event
     */
    function publish(event, param) {
      $rootScope.$broadcast(event, param);
    }

    /**
     * 레프트 패널을 업데이트 하라는 이벤트를 브로드캐스트한다.
     */
    function updateLeftPanel() {
      $rootScope.$broadcast('updateLeftPanelCaller');
    }

    /**
     * 센터 패널을 업데이트 하라는 이벤트를 브로드캐스트한다.
     */
    function updateChatList() {
      $rootScope.$broadcast('centerUpdateChatList');
    }

    /**
     * center panel에 있는 message들을 업데이트 하라는 이벤트를 브로드캐스트한다.
     */
    function updateMessageList() {
      $rootScope.$broadcast('updateMessageList');
    }

    /**
     * file detail 패널을 업데이트 하라는 이벤트를 브로드캐스트한다.
     */
    function updateRightFileDetailPanel() {
      $rootScope.$broadcast('updateRightFileDetailPanel');
    }

    /**
     * default topic 으로 가라는 이벤트를 브로드캐스트한다.
     */
    function toDefaultTopic() {
      $rootScope.$broadcast('toDefaultTopic');
    }

    /**
     * center panel에 있는 message들을 업데이트 하라는 이벤트를 브로드캐스트한다.
     */
    function updateLeftChatList() {
      $rootScope.$broadcast('updateMessageList');
    }


    // TODO: 브로드캐스트하는 이벤트 이름에도 컨벤션이 있으면 좋겠습니다! 이벤트 이름만 보고도 대충 어떤 일이 이뤄지는지 알 수 있는 식의 이름이면 좋겠습니다.

  }
})();