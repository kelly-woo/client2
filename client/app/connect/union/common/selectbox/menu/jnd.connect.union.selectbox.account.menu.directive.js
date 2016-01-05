/**
 * @fileoverview simple menu directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectSelectboxAccountMenu', jndConnectSelectboxAccountMenu);

  /* @ngInject */
  function jndConnectSelectboxAccountMenu($filter, Dialog, jndPubSub, JndConnect, JndConnectUnionApi) {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      templateUrl : 'app/connect/union/common/selectbox/menu/jnd.connect.union.selectbox.account.menu.html',
      link: link
    };

    function link(scope) {
      var translate = $filter('translate');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        if (_.isObject(scope.headerDataModel)) {
          scope.unionName = scope.headerDataModel.current.union.name;

          scope.isValidMultiAccount = _getIsValidMultiAccount(scope.unionName);
        }

        scope.onAccountDeleteClick = onAccountDeleteClick;
        scope.onAccountAddClick = onAccountAddClick;

        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$on('popupDone', _onPopupDone);
      }

      /**
       * popupDone event handler
       * @private
       */
      function _onPopupDone() {
        jndPubSub.pub('unionHeader:accountInfoChange');
      }

      /**
       * account delete click handler
       */
      function onAccountDeleteClick(item) {
        Dialog.confirm({
          body: translate('@jnd-connect-187').replace('{{numberOfConnects}}', scope.numberOfConnects),
          confirmButtonText: translate('@jnd-connect-188'),
          onClose: function (result) {
            if (result === 'okay') {
              _requestAccountDelete(item);
            }
          }
        });
      }

      /**
       * account add click handler
       */
      function onAccountAddClick() {
        JndConnect.openAuthPopup(scope.unionName);
      }

      /**
       * muitl account를 지원하는 union인지 전달함
       * @param {string} unionName
       * @returns {boolean}
       * @private
       */
      function _getIsValidMultiAccount(unionName) {
        var result = false;
        switch (unionName) {
          case 'googleCalendar':
            result = true;
            break;
        }

        return result;
      }

      /**
       * request account delete
       * @param {object} item
       * @private
       */
      function _requestAccountDelete(item) {
        var hasSingleItem;

        if (scope.list.length === 1) {
          hasSingleItem = true;
        }

        JndConnectUnionApi.removeAccount(item.value)
          .success(function() {
            jndPubSub.pub('unionHeader:accountInfoChange');

            hasSingleItem && JndConnect.backToMain();
          });
      }
    }
  }
})();
