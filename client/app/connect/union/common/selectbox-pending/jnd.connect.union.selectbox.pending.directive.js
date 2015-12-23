/**
 * @fileoverview union selectbox directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionSelectboxPending', jndConnectUnionSelectboxPending);

  function jndConnectUnionSelectboxPending() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        isLoaded: '=jndDataIsLoaded',
        selectedValue: '=jndDataModel',
        list: '=jndDataList',
        isDisabled: '=jndDataIsDisabled'
      },
      templateUrl: 'app/connect/union/common/selectbox-pending/jnd.connect.union.selectbox.pending.html',
      link: link
    };

    function link(scope, el, attrs) {
      _init();

      function _init() {
        _show();
        scope.$watch('isLoaded', function() {
          _show();
        });
      }

      function _show() {
        if (scope.isLoaded) {
          el.find('._loading').hide();
          el.find('._selectbox').show();
        } else {
          el.find('._loading').show();
          el.find('._selectbox').hide();
        }
      }
    }
  }
})();
