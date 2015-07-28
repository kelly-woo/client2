/**
 * @fileoverview mentions directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('mention', mention);

  function mention() {
    return {
      restrict: 'EA',
      replace: true,
      scope: true,
      link: link,
      templateUrl : 'app/right/mentions/mention/mention.html',
      controller: 'MentionCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();
