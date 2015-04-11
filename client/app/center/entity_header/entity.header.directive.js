(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('entityHeader', entityHeader);

  function entityHeader() {
    return {
      restrict: 'EA',
      controller: 'entityHeaderCtrl',
      templateUrl: 'app/center/entity_header/entity.header.html',
      link: link

    };

    function link(scope, ele, attr)  {

    }
  }
})();