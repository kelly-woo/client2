(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerChatInputBox', centerChatInputBox);

  function centerChatInputBox() {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      replace: true,
      templateUrl: 'app/center/center_chat_input_box/center.chat.input.box.html'
    };

    function link(scope, element, attrs) {

    }
  }
})();
