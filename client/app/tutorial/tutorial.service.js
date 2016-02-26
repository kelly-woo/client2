/**
 * @fileoverview 튜토리얼 툴팁 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Tutorial', Tutorial);

  function Tutorial($rootScope, jndPubSub, accountService, AccountHasSeen) {
    var _isInit = false;
    var _scope = $rootScope.$new(true);

    this.showWelcome = showWelcome;
    this.hideWelcome = hideWelcome;

    this.hideTooltip = hideTooltip;
    this.showTooltip = showTooltip;

    this.showPopover = showPopover;
    this.hidePopover = hidePopover;

    this.complete = complete;

    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
      if (accountService.getAccount()) {
        _initWelcome();
      } else {
        _scope.$on('accountLoaded', _initWelcome);
      }
    }

    /**
     * welcome 을 보여줄지 상태를 결정한다.
     * @private
     */
    function _initWelcome() {
      if (!_isInit) {
        //기존 사용자면 welcome 은 생략한다
        //if (_isOldUser()) {
        //  AccountHasSeen.set('TUTORIAL_VER3_WELCOME', true);
        //} else if (!AccountHasSeen.get('TUTORIAL_VER3_WELCOME')) {
        //  showWelcome();
        //}
        showWelcome();
        _isInit = true;
      }
    }

    /**
     * tutorial 을 이미 시청한 기존 사용자인지 여부를 반환한다.
     * @private
     */
    function _isOldUser() {
      return AccountHasSeen.get('GUIDE_TOPIC_FOLDER') && AccountHasSeen.get('GUIDE_CONNECT') ;
    }

    /**
     * 튜토리얼 welcome 을 노출한다.
     */
    function showWelcome() {
      jndPubSub.pub('Tutorial:showWelcome');
    }

    /**
     * 튜토리얼 welcome 을 감춘다.
     */
    function hideWelcome() {
      jndPubSub.pub('Tutorial:hideWelcome');
    }

    /**
     * 모든 툴팁을 노출한다.
     */
    function showTooltip() {
      jndPubSub.pub('Tutorial:showTooltip');
    }

    /**
     * tooltipName 에 해당하는 tooltip 을 감춘다.
     * @param {string} tooltipName
     */
    function hideTooltip(tooltipName) {
      jndPubSub.pub('Tutorial:hideTooltip', tooltipName);
    }

    /**
     * popover 를 노출한다.
     */
    function showPopover() {
      jndPubSub.pub('Tutorial:showPopover');
    }

    /**
     * popover 를 감춘다.
     */
    function hidePopover() {
      jndPubSub.pub('Tutorial:hidePopover');
    }

    /**
     * 튜토리얼이 완료되었다.
     */
    function complete() {
      jndPubSub.pub('Tutorial:complete');
    }
  }
})();
