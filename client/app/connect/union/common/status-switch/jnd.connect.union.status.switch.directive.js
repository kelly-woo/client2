/**
 * @fileoverview switch button directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectStatusSwitch', jndConnectStatusSwitch);

  /* @ngInject */
  function jndConnectStatusSwitch(Dialog, JndConnectUnionApi) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        connectId: '=',
        active: '=',
        isNonApiCall: '=?',
        onToggleCallback: '&?'
      },
      templateUrl : 'app/connect/union/common/status-switch/jnd.connect.union.status.switch.html',
      link: link
    };

    function link(scope) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onToggle = onToggle;
      }

      /**
       * on toggle 이벤트 핸들러
       */
      function onToggle($event) {
        if (scope.isNonApiCall) {
          scope.active = !scope.active;
        } else {
          // toggle 시 api를 호출해야하는 상황
          // connection 된 후 해당 정보를 update하는 경우

          if (scope.active) {
            Dialog.confirm({
              body: '이 연동을 중지하시겠습니까?',
              confirmButtonText: '중지하기',
              stopPropagation: true,
              onClose: function(result) {
                if (result === 'okay') {
                  scope.active = false;

                  _callback(false);
                  _requestConnectStatus('disable')
                }
              }
            });
          } else {
            scope.active = true;

            _callback(true);
            _requestConnectStatus('enable')
          }
        }
      }

      function _callback(value) {
        scope.onToggleCallback({
          $value: value
        });
      }

      function _requestConnectStatus(status) {
        // status api call
        JndConnectUnionApi
      }
    }
  }
})();
