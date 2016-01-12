/**
 * @fileoverview switch button directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('switchButton', switchButton);

  /* @ngInject */
  function switchButton() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        isActive: '=',
        toggle: '&'
      },
      templateUrl : 'app/util/directive/switch-button/switch.button.html',
      link: link
    };

    function link(scope) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onClick = onClick;
      }

      /**
       * on click 이벤트 핸들러
       */
      function onClick() {
        if (_.isFunction(scope.toggle)) {
          scope.toggle(!scope.isActive);
        }
      }
    }
  }
})();
