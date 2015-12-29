/**
 * @fileoverview switch button directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectTrashButton', jndConnectTrashButton);

  /* @ngInject */
  function jndConnectTrashButton($filter, Dialog, JndConnectUnionApi, JndUtil) {
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
            body: $filter('translate')('@이 연동 항목을 삭제하시겠습니까?'),
            confirmButtonText: $filter('translate')('@삭제하기'),
            stopPropagation: true,
            onClose: function(result) {
              if (result === 'okay') {
                _confirmCallback(true);
                _requestConnectDelete()
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
        JndConnectUnionApi.remove(scope.unionName, scope.connectId)
          .success(_onSuccessCallback)
          .error(_onErrorCallback);
      }

      /**
       * request success 콜백
       * @private
       */
      function _onSuccessCallback() {
        Dialog.success({
          title: $filter('translate')('@삭제 성공')
        });
        scope.onSuccessCallback();
      }

      /**
       * request error 콜백
       * @param {object} response
       * @private
       */
      function _onErrorCallback(response) {
        JndUtil.alertUnknownError(response);
        scope.onErrorCallback({
          $value: response
        });
      }
    }
  }
})();
