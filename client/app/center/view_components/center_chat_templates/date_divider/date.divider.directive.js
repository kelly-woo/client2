(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('dateDivider', dateDivider);

  /* @ngInject */
  function dateDivider(MessageCollection) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el, attrs) {
      var msg = scope.msg;
      if (MessageCollection.isNewDate(scope.$index)) {
        el.prepend('<div class="msgs-group__divider">' + msg.date.substr(8) + '</div>');
      }
    }
  }
})();
