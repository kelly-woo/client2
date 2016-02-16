(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionAuthCtrl', JndConnectUnionAuthCtrl);

  /* @ngInject */
  function JndConnectUnionAuthCtrl($scope, $filter, JndUtil, JndConnect) {
    $scope.openAuthPopup = openAuthPopup;
    $scope.text = {};
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.text.authBtn = $filter('translate')('@jnd-connect-144')
        .replace('{{serviceName}}', $scope.current.union.title);
      _attachEvents();
    }

    /**
     * event handler 를 attach 한다.
     * @private
     */
    function _attachEvents() {
      $scope.$on('popupDone', _onSuccessAuth);
      $scope.$on('webSocketConnect:authenticationCreated', _onAuthenticationCreated);
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
      if (connectType  === $scope.current.union.name) {
        _onSuccessAuth();
      }
    }

    /**
     * authentication 성공시 이벤트 핸들러
     * @private
     */
    function _onSuccessAuth() {
      $scope.current.union.hasAuth = true;
      $scope.current.isShowAuth = false;
    }

    /**
     * authentication 을 획득한다.
     */
    function openAuthPopup() {
      JndConnect.openAuthPopup($scope.current.union.name);
    }
  }
})();
