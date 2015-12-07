/**
 * @fileoverview topic connector directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicConnector', topicConnector);

  /* @ngInject */
  function topicConnector() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
      },
      templateUrl : 'app/center/view_components/entity_header/topic-connector/topic.connector.html',
      link: link
    };

    function link(scope, el) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {

        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
      }
    }
  }
})();
