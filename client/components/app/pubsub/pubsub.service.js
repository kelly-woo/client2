/**
 * @fileoverview $rootScope.$broadcast를 대신해주는 서비스.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.pubsub')
    .service('jndPubSub', jndPubSub);

  /* @ngInject */
  function jndPubSub($rootScope, $timeout) {
    var that = this;
    var badgeTimer;
    var leftPanelTimer;
    that.pub = publish;

    that.updateLeftPanel = updateLeftPanel;
    that.updateLeftBadgeCount = updateLeftBadgeCount;
    that.updateCenterPanel = updateCenterPanel;

    that.updateChatList = updateChatList;
    that.updateRightFileDetailPanel = updateRightFileDetailPanel;
    that.updateBadgePosition = updateBadgePosition;
    that.toDefaultTopic = toDefaultTopic;

    that.updateLeftChatList = updateLeftChatList;

    that.attachMessagePreview = attachMessagePreview;
    that.attachMessagePreviewThumbnail = attachMessagePreviewThumbnail;

    that.onChangeShared = onChangeShared;

    that.showLoading = showLoading;
    that.hideLoading = hideLoading;

    /**
     * $rootScope.$broadcast를 대신한다.
     * @param event {string} name of event to be broadcast
     * @param param {object} param of event to be passed along with broadcast event
     */
    function publish(event, param) {
      $rootScope.$broadcast(event, param);
    }

    /**
     * unread 뱃지 포지션을 update 한다.
     * badge position update 비용이 크기 때문에 timeout 을 사용한다.
     */
    function updateBadgePosition() {
      $timeout.cancel(badgeTimer);
      badgeTimer = $timeout(function() {
        $rootScope.$broadcast('updateBadgePosition');
      }, 100);
    }

    /**
     * 레프트 패널을 업데이트 하라는 이벤트를 브로드캐스트한다.
     */
    function updateLeftPanel() {
      $timeout.cancel(leftPanelTimer);
      leftPanelTimer = $timeout(function() {
        $rootScope.$broadcast('updateLeftPanelCaller');
        updateBadgePosition();
      }, 100);
    }

    /**
     * 뱃지 카운트를 업데이트 한다.
     */
    function updateLeftBadgeCount() {
      $rootScope.$broadcast('updateLeftBadgeCount');
      updateBadgePosition();
    }

    /**
     * updateChatList보다 좀 더 명시적인 이름을 주기위해서 만듬.
     */
    function updateCenterPanel() {
      updateChatList();
    }

    /**
     * 센터 패널을 업데이트 하라는 이벤트를 브로드캐스트한다.
     */
    function updateChatList() {
      $rootScope.$broadcast('centerUpdateChatList');
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
      console.log('toDefaultTopic')
      $rootScope.$broadcast('toDefaultTopic');
    }

    /**
     * left panel 아래에 있는 1:1 chat list를 업데이트 하라는 이벤트를 브로드캐스트한다.
     */
    function updateLeftChatList() {
      $rootScope.$broadcast('updateChatList');
    }

    /**
     * message의 preview(social_snippets)를 attach하는 event를 broadcast한다.
     * @param
     */
    function attachMessagePreview(param) {
      $rootScope.$broadcast('attachMessagePreview', param);
    }

    function attachMessagePreviewThumbnail(param) {
      $rootScope.$broadcast('attachMessagePreviewThumbnail', param);
    }

    /**
     * file 자체의 shareEntities가 바뀐게 아니라 topic들 정보가 바뀌었을 때
     * shared entities를 보여주는 부분들이 업데이트 되어야하기때문에 호출한다.
     */
    function onChangeShared(data) {
      //TODO:
      //FIXME: 현재 받고있는 data format 이 모두 상이하므로 adaptor 패턴 적용이 시급합! CC: Mark
      $rootScope.$broadcast('onChangeShared', data);
    }
    // TODO: 브로드캐스트하는 이벤트 이름에도 컨벤션이 있으면 좋겠습니다! 이벤트 이름만 보고도 대충 어떤 일이 이뤄지는지 알 수 있는 식의 이름이면 좋겠습니다.

    function showLoading(scope) {
      if (!!scope) {
        scope.$broadcast('showLoading');
      } else {
        $rootScope.$broadcast('showLoading');
      }
    }
    function hideLoading(scope) {
      if (!!scope) {
        scope.$broadcast('hideLoading');
      } else {
        $rootScope.$broadcast('hideLoading');
      }
    }
  }
})();
