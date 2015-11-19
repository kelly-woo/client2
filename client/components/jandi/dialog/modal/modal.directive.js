/**
 * @fileoverview dialog modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandi.dialog')
    .directive('dialogModal', dialogModal);

  /* @ngInject */
  function dialogModal() {

    return {
      restrict: 'A',
      link: function(scope, el) {
        var absoluteFocus = scope.absoluteFocus;

        _init();

        /**
         * init
         * @private
         */
        function _init() {
          _setInitFocus();
        }

        /**
         * 초기 focus 설정한다.
         */
        function _setInitFocus() {
          if (absoluteFocus) {
            scope.modal.rendered.then(function() {
              _setAbsoluteFocus();
            });
          }
        }

        /**
         * 특정 element에 항상 focus가 되어 있도록 설정한다.
         * @private
         */
        function _setAbsoluteFocus() {
          var jqAbsoluteFocus = el.find(absoluteFocus);

          if (jqAbsoluteFocus.length > 0) {
            jqAbsoluteFocus
              .on('focus', function() {
                jqAbsoluteFocus.select();
              })
              .on('mouseup blur', function(nonSelectEvent) {
                nonSelectEvent.preventDefault();
                jqAbsoluteFocus.focus().select();
              });

            setTimeout(function() {
              jqAbsoluteFocus.focus();
            });
          }
        }
      }
    };
  }
}());
