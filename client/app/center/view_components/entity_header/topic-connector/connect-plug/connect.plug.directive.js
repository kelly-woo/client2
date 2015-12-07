/**
 * @fileoverview topic connector directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('connectPlug', connectPlug);

  /* @ngInject */
  function connectPlug() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        serviceImage: '=',
        serviceName: '@',
        isServiceActive: '=',
        userName: '='
      },
      templateUrl : 'app/center/view_components/entity_header/topic-connector/connect-plug/connect.plug.html',
      link: link
    };

    function link(scope, el) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.isActive = !!scope.isServiceActive;

        scope.onServiceToggle = onServiceToggle;
        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
      }

      function onServiceToggle($value) {
        scope.isActive = !$value;
      }
    }
  }
})();
