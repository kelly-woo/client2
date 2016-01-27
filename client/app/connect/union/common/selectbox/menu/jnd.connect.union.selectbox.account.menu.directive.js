/**
 * @fileoverview simple menu directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectSelectboxAccountMenu', jndConnectSelectboxAccountMenu);

  /* @ngInject */
  function jndConnectSelectboxAccountMenu($filter, Dialog, jndPubSub, JndConnect, JndConnectUnionApi, JndUtil,
                                          JndConnectUnion, JndConnectApi) {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      templateUrl : 'app/connect/union/common/selectbox/menu/jnd.connect.union.selectbox.account.menu.html',
      link: link
    };

    function link(scope) {
      var _isLoading = false;
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
        scope.$on('webSocketConnect:authenticationCreated', _onAuthenticationCreated);
      }

      /**
       * popupDone event handler
       * @private
       */
      function _onPopupDone() {
        jndPubSub.pub('unionHeader:accountInfoChange');
      }

      /**
       * authentication 이 생성되었을 때 소캣 이벤트 핸들러
       * 맥, window 앱에서 popup 간 통신이 불가능 하기 때문에 소켓 이벤트 핸들러를 통해 제어한다.
       *
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onAuthenticationCreated(angularEvent, data) {
        var connectType = JndUtil.pick(data, 'authentication', 'connectType');
        if (connectType === scope.unionName) {
          _onPopupDone();
        }
      }

      /**
       * account delete click handler
       */
      function onAccountDeleteClick(item) {
        var body;

        if (item.connectCount) {
          body = translate('@jnd-connect-141').replace('{{numberOfConnects}}', item.connectCount);
        } else {
          body = translate('@jnd-connect-187');
        }

        Dialog.confirm({
          body: body,
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

        if (!_isLoading) {
          _isLoading = true;
          if (scope.list.length === 1) {
            hasSingleItem = true;
          }
          jndPubSub.pub('accountMenuDirective:removeAccountBefore', {
            hasSingleItem: hasSingleItem
          });
          JndConnectUnion.showLoading();
          JndConnectUnionApi.removeAccount(item.value)
            .success(function () {
              jndPubSub.pub('unionHeader:accountInfoChange');
              jndPubSub.pub('accountMenuDirective:removeAccountDone', {
                hasSingleItem: hasSingleItem
              });

              if (hasSingleItem) {
                JndConnect.backToMain(true);
              }
            })
            .error(_onErrorAccountDelete)
            .finally(_onDoneAccountDelete);
        }
      }

      /**
       * account delete 오류 콜백
       * @param {object} err
       * @param {number} status
       * @private
       */
      function _onErrorAccountDelete(err, status) {
        if (!JndConnectApi.handleError(err, status)) {
          JndUtil.alertUnknownError(err, status);
        }
      }

      /**
       * account delete 가 완료된 이후 핸들러
       * @private
       */
      function _onDoneAccountDelete() {
        JndConnectUnion.hideLoading();
        _isLoading = false;
      }
    }
  }
})();
