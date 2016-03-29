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
      templateUrl : 'app/right/files/files.html',
      controller: 'RightFilesCtrl',
      link: link
    };

    function link(scope, el) {


    }
  }
})();
