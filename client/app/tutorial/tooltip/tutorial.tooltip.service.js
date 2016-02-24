/**
 * @fileoverview 튜토리얼 툴팁 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TutorialTooltip', TutorialTooltip);

  function TutorialTooltip(jndPubSub) {

    this.hide = hide;
    this.show = show;

    _init();

    function _init() {
    }

    /**
     * 모든 툴팁을 노출한다.
     */
    function show() {
      jndPubSub.pub('TutorialTooltip:show');
    }

    /**
     * tooltipName 에 해당하는 tooltip 을 감춘다.
     * @param {string} tooltipName
     */
    function hide(tooltipName) {
      jndPubSub.pub('TutorialTooltip:close', tooltipName);
    }
  }
})();
