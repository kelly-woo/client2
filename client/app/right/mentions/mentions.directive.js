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
      restrict: 'E',
      replace: true,
      scope: {
        status: '='
      },
      templateUrl : 'app/right/mentions/mentions.html',
      controller: 'RightMentionsCtrl',
      link: angular.noop
    };
  }
})();
