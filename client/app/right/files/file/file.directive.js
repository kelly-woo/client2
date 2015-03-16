(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('file', file);

  function file() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      templateUrl : 'app/right/files/file/file.html',
      controller: 'fileCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();