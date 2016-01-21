/**
 * @fileoverview switch button directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectStatusSwitch', jndConnectStatusSwitch);

  /* @ngInject */
  function jndConnectStatusSwitch($filter, Dialog, JndConnectUnionApi, JndUtil, JndConnectApi) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        connectId: '=',
        unionName: '=',
        isActive: '=',
        isNonApiCall: '=?',
        onConfirmCallback: '&?',
        onSuccessCallback: '&?',
        onErrorCallback: '&?'
      },
      templateUrl : 'app/connect/union/common/status-switch/jnd.connect.union.status.switch.html',
      link: link
    };

    function link(scope, el, attrs) {
      var isNonStatusText = attrs.isNonStatusText;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.isNonStatusText = scope.$eval(isNonStatusText);
        scope.onToggle = onToggle;

        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$watch('isActive', _onIsActiveChange);
      }

      /**
       * active flag change event handler
       * @param value
       * @private
       */
      function _onIsActiveChange(value) {
        _setStatusText(value);
      }

      /**
       * on toggle 이벤트 핸들러
       */
      function onToggle($event) {
        var value;

        if (scope.isNonApiCall) {
          value  = !scope.isActive;

          _setActive(value);
          _setStatusText(value);
        } else {
          // toggle 시 api를 호출해야하는 상황
          // connection 된 후 해당 정보를 update하는 경우
          if (scope.isActive) {
            Dialog.confirm({
              body: $filter('translate')('@jnd-connect-184'),
              confirmButtonText: $filter('translate')('@jnd-connect-210'),
              stopPropagation: true,
              onClose: function(result) {
                if (result === 'okay') {
                  value = false;

                  _setActive(value);
                  _setStatusText(value);
                  _confirmCallback(value);
                  _requestConnectStatus();
                }
              }
            });
          } else {
            value = true;

            _setActive(value);
            _setStatusText(value);
            _confirmCallback(value);
            _requestConnectStatus();
          }
        }
      }

      /**
       * set acitve
       * @param {boolean} value
       * @private
       */
      function _setActive(value) {
        scope.isActive = value;
      }

      /**
       * set status text
       * @param {boolean} value
       * @private
       */
      function _setStatusText(value) {
        var key;
        JndUtil.safeApply(scope, function() {
          key = value ? '@jnd-connect-10' : '@jnd-connect-9';
          scope.statusText = $filter('translate')(key);
        });
      }

      /**
       * confirm callback
       * @param {boolean} value
       * @private
       */
      function _confirmCallback(value) {
        scope.onConfirmCallback({
          $value: value
        });
      }

      /**
       * request set connect status
       * @private
       */
      function _requestConnectStatus() {
        // status api call
        JndConnectUnionApi.setStatus(scope.unionName, scope.connectId, scope.isActive)
          .success(_onSuccessSetStatus)
          .error(_onErrorSetStatus);
      }

      /**
       * request success 콜백
       * @private
       */
      function _onSuccessSetStatus() {
        scope.onSuccessCallback();
      }

      /**
       * request error 콜백
       * @param {object} err
       * @param {number} status
       * @private
       */
      function _onErrorSetStatus(err, status) {
        if (!JndConnectApi.handleError(err, status)) {
          JndUtil.alertUnknownError(err);
          scope.onErrorCallback({
            $value: err
          });
        }
      }
    }
  }
})();
