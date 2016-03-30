/**
 * @fileoverview files directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightFiles', rightFiles);

  function rightFiles() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        status: '='
      },
      templateUrl : 'app/right/files/files.html',
      controller: 'RightFilesCtrl',
      link: angular.noop
    };
  }
})();
