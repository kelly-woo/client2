(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('entityHeader', entityHeader);

  function entityHeader() {
    return {
      restrict: 'EA',
      controller: 'entityHeaderCtrl',
      templateUrl: 'app/center/view_components/entity_header/entity.header.html',
      link: link,
      scope: {}

    };

    function link(scope, ele, attr)  {

    }
  }
})();