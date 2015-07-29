(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('dateDivider', dateDivider);

  /* @ngInject */
  function dateDivider(MessageCollection) {
    return {
      restrict: 'E',
      link: link,
      templateUrl: 'app/center/view_components/center_chat_templates/date_divider/date.divider.html'
    };

    function link(scope, element, attrs) {
      _setDate();
      function _setDate() {
        if (!MessageCollection.isNewDate(attrs.index)) {
          element.remove();
        }
      }
      scope.$on('onRepeatDone', _setDate);
    }
  }
})();
