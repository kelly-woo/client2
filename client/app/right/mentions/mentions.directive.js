/**
 * @fileoverview mentions directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightMentions', rightMentions);

  function rightMentions() {
    return {
      restrict: 'EA',
      replace: true,
      scope: true,
      link: link,
      templateUrl : 'app/right/mentions/mentions.html',
      controller: 'RightMentionsCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();
