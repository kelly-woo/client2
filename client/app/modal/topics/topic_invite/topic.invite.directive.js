(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('invitationChannel', invitationModal);

  function invitationModal($timeout) {
    var KEY_ENTER = 13;

    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element, attrs) {
      // channel에 초대시 enter키 입력하여 초대하면 갱신된 dropdown list를 출력하도록 처리
      element
        .on('keyup', function(evt) {
          if (evt.which === KEY_ENTER) {
            element.blur();
            $timeout(function() {
              element.focus();
            });
          }
        });
    }
  }
})();