/**
 * @fileoverview dialog modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandi.dialog')
    .directive('dialogModal', dialogModal);

  /* @ngInject */
  function dialogModal($timeout, jndKeyCode) {

    return {
      restrict: 'A',
      link: function(scope) {
        var jqModal;

        $timeout(function() {
          jqModal = $('.center-dialog-modal').focus();

          // event 연결
          _on();
        });

        function _on() {
          jqModal.on('keyup', function(event) {
            var which = event.which;

            if (jndKeyCode.match('ENTER', which)) {
              scope.okay();
            }
          });
        }
      }
    };
  }
}());
