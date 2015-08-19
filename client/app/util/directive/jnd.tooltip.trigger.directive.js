/**
 * @fileoverview scale up animation 을 수행하는 directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndTooltipTrigger', jndTooltipTrigger);

  /**
   * on-load-scale-up directive
   * on load 이벤트 발생시 scale up 에니메이션을 수행한다.
   *
   * @returns {{restrict: string, scope: {src: string}, link: link}}
   * @example

   <img src="xxx.com"
   on-load-scale-up
   duration="300"
   start-width="30"
   start-height="30"
   end-width="100"
   end-height="100" />

   */
  function jndTooltipTrigger(jndPubSub) {
    return {
      restrict: 'A',
      scope: {},
      link: link
    };

    function link(scope, el, attrs) {
      el.on('mouseover', function() {
        jndPubSub.pub('tooltip:show', {
          target: el,
          direction: attrs.dataDirection,
          content: attrs.jndTooltipTrigger
        });
      });
      el.on('mouseout', function() {
        jndPubSub.pub('tooltip:hide');
      });
    }
  }
})();
