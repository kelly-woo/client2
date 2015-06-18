/**
 * @fileoverview 네트워크 오류로 인해 보내지 못한 text 메세지 directive
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('textUnsent', textUnsent);

  function textUnsent() {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      templateUrl: 'app/center/view_components/center_chat_templates/text-unsent/text.unsent.html'
    };

    function link(scope, element, attrs) {
    }
  }
})();
