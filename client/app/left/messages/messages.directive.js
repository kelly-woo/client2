(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('messages', messages);

  function messages() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      transclude: true,
      replace: true,
      templateUrl: 'app/left/messages/messages.html',
      controller: 'messageListCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();