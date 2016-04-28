/**
 * @fileoverview TOPIC 에서 노출할 Entity header
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('entityHeaderTopic', entityHeaderTopic);

  function entityHeaderTopic() {
    return {
      restrict: 'EA',
      templateUrl: 'app/center/view_components/entity_header/views/entity.header.topic.html',
      link: link
    };

    function link(scope, ele, attr)  {

    }
  }
})();
