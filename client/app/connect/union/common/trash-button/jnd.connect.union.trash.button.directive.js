/**
 * @fileoverview switch button directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectTrashButton', jndConnectTrashButton);

  /* @ngInject */
  function jndConnectTrashButton($filter, Dialog, JndConnectUnionApi, JndUtil, JndConnectUnion, JndConnect, JndConnectApi) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        connectId: '=',
        unionName: '=',
        isDisabled: '=?',
        onConfirmCallback: '&?',
        onSuccessCallback: '&?',
        onErrorCallback: '&?'
      },
      templateUrl : 'app/connect/union/common/trash-button/jnd.connect.union.trash.button.html',
      link: link
    };

    function link(scope) {
      var _isLoading = false;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onClick = onClick;
      }

      /**
       * on toggle 이벤트 핸들러
       */
      function onClick($event) {
        if (!scope.isDisabled) {
          // isDisabled 상태가 아닐때 즉 setting 일때만 삭제하기가 가능함.

          Dialog.confirm({
            body: $filter('translate')('@jnd-connect-185'),
            confirmButtonText: $filter('translate')('@jnd-connect-211'),
            stopPropagation: true,
            onClose: function(result) {
              if (result === 'okay') {
                _confirmCallback(true);
                _requestConnectDelete();
              } else {
                _confirmCallback(false)
              }
            }
          });
        }
      }

      /**
       * call callback function
       * @param value
       * @private
       */
      function _confirmCallback(value) {
        scope.onConfirmCallback({
          $value: value
        });
      }

      /**
       * request connect delete
       * @private
       */
      function _requestConnectDelete() {
        // delete api call
        if (!_isLoading) {
          _isLoading = true;
          JndConnect.showLoading();
          JndConnectUnion.showLoading();
          JndConnectUnionApi.remove(scope.unionName, scope.connectId)
            .success(_onSuccessCallback)
            .error(_onErrorCallback)
            .finally(_onDoneCallback);
        }
      }

      /**
       * request done 콜백
       * @private
       */
      function _onDoneCallback() {
        //JndConnect 메인에서는 request 완료 후 hideLoading 을 호출하기 때문에
        //JndConnectUnion 의 hideLoading 만 호출한다.
        JndConnectUnion.hideLoading();
        _isLoading = false;
      }

      /**
       * request success 콜백
       * @private
       */
      function _onSuccessCallback() {
        Dialog.success({
          title: $filter('translate')('@jnd-connect-209')
        });
        scope.onSuccessCallback();
      }

      /**
       * request error 콜백
       * @param {object} err
       * @param {number} status
       * @private
       */
      function _onErrorCallback(err, status) {
        if (!JndConnectApi.handleError(err, status)) {
          JndConnect.hideLoading();
          JndUtil.alertUnknownError(err, status);
          scope.onErrorCallback({
            $value: err
          });
        }
      }
    }
  }
})();
