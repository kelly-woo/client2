(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('text', text);

  /* @ngInject */
  function text() {
    return {
      restrict: 'E',
      scope: {
        msg: '=',
        isChildText: '=',
        index: '='
      },
      link: link,
      templateUrl: 'app/center/view_components/center_chat_templates/text/text.html',
      controller: 'TextMessageCtrl'
    };

    function link(scope, el, attrs) {
      var jqTextContainer = el;

      scope.onMouseEnterOnIcon = _onMouseEnterOnIcon;
      scope.onMouseLeaveOnIcon = _onMouseLeaveOnIcon;

      function _onMouseEnterOnIcon() {
        jqTextContainer.addClass('text-highlight-background');
      }

      function _onMouseLeaveOnIcon() {
        jqTextContainer.removeClass('text-highlight-background');
      }

    }
  }
})();
