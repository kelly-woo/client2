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
      restrict: 'EA',
      replace: true,
      scope: false,
      link: angular.noop,
      templateUrl : 'app/right/files/files.html',
      controller: 'RightFilesCtrl'
    };
  }
})();
