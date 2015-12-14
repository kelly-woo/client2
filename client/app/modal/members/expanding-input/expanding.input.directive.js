/**
 * @fileoverview expanding input dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('expandingInput', expandingInput);

  function expandingInput($timeout) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
      },
      link: link,
      templateUrl: 'app/modal/members/expanding-input/expanding.input.html'
    };

    function link(scope, el, attrs) {
      var inputClass = attrs.inputClass || '';
      var inputStatusClass = attrs.inputStatusClass || '';

      _init();

      function _init() {
        scope.status = 'edit';
        scope.hasGuideLine = false;

        scope.inputClass = inputClass;
        scope.inputStatusClass = inputStatusClass;

        scope.onMouseEnter = function() {
          scope.hasGuideLine = true;
        }

        scope.onMouseLeave = function() {
          if (scope.status === 'edit') {
            scope.hasGuideLine = false;
          }
        }

        scope.onClick = function() {
          if (scope.status === 'edit') {
            scope.status === 'cancel';
          } else if (scope.status === 'cancel') {
            scope.hasGuideLine = false;
          }
        }

        scope.onFocus = function() {
          scope.status = 'cancel';
        }

        scope.onBlur = function() {
          if (scope.status === 'cancel') {
            scope.hasGuideLine = false;
          }

          scope.status = 'edit';
        }
      }
    }
  }
})();
