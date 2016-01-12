/**
 * @fileoverview bot의 프로필을 보는 모달창의 컨트롤러
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('BotProfileCtrl', BotProfileCtrl);

  /* @ngInject */
  function BotProfileCtrl($scope, $filter, curBot, $state, modalHelper, JndConnect, memberService, messageAPIservice) {
    _init();

    function _init() {
      $scope.curBot = curBot;
      curBot.extProfileImage = memberService.getProfileImage(curBot.id, 'small');

      $scope.name = $filter('getName')($scope.curBot);
      $scope.botDescription = '잔디봇은 잔디를 사용하며 꼭 알아야 할 점이나 연동 서비스의 메시지를 전달해드립니다.';
      $scope.connectSettingText = '연동 서비스 설정하기';
      $scope.statusMessage = '안녕하세요? 잔디봇입니다.';

      $scope.isStarred = $scope.curBot.isStarred;

      $scope.message = {content:''};

      $scope.close = close;
      $scope.onActionClick = onActionClick;
      $scope.onSubmitDoneClick = onSubmitDoneClick;
      $scope.postMessage = postMessage;

      _attachEvents();
    }

    /**
     * attach events
     * @private
     */
    function _attachEvents() {
      $scope.$watch('message.content', _onMessageContentChange);
    }

    /**
     * modal close
     */
    function close() {
      modalHelper.closeModal();
    }

    /**
     * 프로필 모달에서 버튼을 눌렀을 경우 해당하는 기능은 불러준다.
     * @param actionType {string} 실행되어야 할 기능의 이름
     */
    function onActionClick(type) {
      if (type === 'directMessage') {
        _goToDM(curBot.id);
      } else if (type === 'connectSetting') {
        _openConnectSetting();
      }

      modalHelper.closeModal();
    }

    /**
     * submit done click
     */
    function onSubmitDoneClick() {
      if (_isEnableDM()) {
        $scope.showSubmitDone = false;
      }
    }

    /**
     * dm 가능 여부를 전달한다.
     * @returns {boolean}
     * @private
     */
    function _isEnableDM() {
      return $scope.showSubmitDone && !$scope.isSending
    }

    /**
     * post message
     */
    function postMessage() {
      $scope.showSubmitDone = true;
      $scope.isSending = true;

      messageAPIservice.postMessage('users', curBot.id, $scope.message.content)
        .success(function() {
          $scope.message.content = '';
        })
        .finally(function() {
          $scope.isSending = false;
        });
    }

    /**
     * 1:1 대화로 옮긴다.
     * @param userId {number} 1:1 대화를 할 상대의 아이디
     * @private
     */
    function _goToDM(userId) {
      // TODO: REFACTOR ROUTE.SERVICE
      var routeParam = {
        entityType: 'users',
        entityId: userId
      };

      $state.go('archives', routeParam);
    }

    /**
     * open connect setting
     * @private
     */
    function _openConnectSetting() {
      JndConnect.open();
    }

    /**
     * message content change
     * @param {string} value
     * @private
     */
    function _onMessageContentChange(value) {
      if (_isEnableDM() && value !== '') {
        $scope.showSubmitDone = false;
      }
    }
  }
})();
