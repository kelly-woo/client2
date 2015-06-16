(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('text', text);

  function text(ContentAttacher) {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      templateUrl: 'app/center/view_components/center_chat_templates/text/text.html'
    };

    function link(scope, element, attrs) {
      var msg = scope.msg;
      if (msg && msg.status === 'created' && msg.message.linkPreview != null) {
        ContentAttacher.init(element).attach(scope);
      }
    }
  }
})();
