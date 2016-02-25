/**
 * @fileoverview 튜토리얼 툴팁 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Tutorial', Tutorial);

  function Tutorial($rootScope, jndPubSub, accountService) {
    var _scope = $rootScope.$new(true);

    this.hideTooltip = hideTooltip;
    this.showTooltip = showTooltip;

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
      if (true) {
        jndPubSub.pub('Tutorial:showWelcome');
      }
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

    function start() {
    }

    function finish() {
    }
  }
})();
