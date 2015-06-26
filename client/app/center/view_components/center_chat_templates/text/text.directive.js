(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('text', text);

  function text() {
    return {
      restrict: 'E',
      scope: {
        msg: '=',
        isChildText: '=',
        hasLinkPreview: '='
      },
      link: link,
      templateUrl: 'app/center/view_components/center_chat_templates/text/text.html',
      controller: 'TextMessageCtrl'
    };

    function link(scope, el, attrs) {
      var $scope = scope;
      var messageId = $scope.msg.id;
      var jqTextContainer = $(document.getElementById(messageId));

      scope.onMouseEnterOnIcon = _onMouseEnterOnIcon;
      scope.onMouseLeaveOnIcon = _onMouseLeaveOnIcon;

      function _onMouseEnterOnIcon() {
        jqTextContainer.addClass('text-delete-background');
      }

      function _onMouseLeaveOnIcon() {
        jqTextContainer.removeClass('text-delete-background');
      }
    }
  }
})();
