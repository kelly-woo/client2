/**
 * @fileoverview switch button directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectTrashButton', jndConnectTrashButton);

  /* @ngInject */
  function jndConnectTrashButton(Dialog, JndConnectUnionApi) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        connectId: '=',
        disabled: '=?'
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
      function onClick() {
        if (!scope.disabled) {
          // disabled 상태가 아닐때 즉 setting 일때만 삭제하기가 가능함.

          Dialog.confirm({
            body: '이 연동 항목을 삭제하시겠습니까?',
            confirmButtonText: '삭제하기',
            onClose: function(result) {
              if (result === 'okay') {
                _requestConnectDelete()
              }
            }
          });
        }
      }

      function _requestConnectDelete() {
        // delete api call
        JndConnectUnionApi
      }
    }
  }
})();
