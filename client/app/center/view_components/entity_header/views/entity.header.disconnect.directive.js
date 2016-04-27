/**
 * @fileoverview Connection 이 끊겼을 때 노출할 Entity header
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('entityHeaderDisconnect', entityHeaderDisconnect);

  function entityHeaderDisconnect() {
    return {
      restrict: 'EA',
      templateUrl: 'app/center/view_components/entity_header/views/entity.header.disconnect.html',
      link: link
    };

    function link(scope, ele, attr)  {

    }
  }
})();
