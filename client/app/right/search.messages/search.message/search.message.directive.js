/**
 * @fileoverview message directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('messageSearchCard', messageSearchCard);

  /* @ngInject  */
  function messageSearchCard() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      templateUrl : 'app/right/search.messages/search.message/search.message.html',
      controller: 'rPanelMessageSearchCardCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();
