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
        active: '=',
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

      function onClick() {
        if (scope.toggle) {
          scope.toggle({
            $value: scope.active
          });
        }
      }
    }
  }
})();
