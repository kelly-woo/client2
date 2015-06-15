(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('DesktopNotificationBannerCtrl', DesktopNotificationBannerCtrl);

  /* @ngInject */
  function DesktopNotificationBannerCtrl($scope, DeskTopNotificationBanner, DesktopNotification, modalHelper) {
    var isModalOpen = false;

    $scope.isInitialQuestion;

    $scope.onCancelIconClick = onCancelIconClick;

    $scope.turnOnDesktopNotification = turnOnDesktopNotification;
    $scope.askMeLater = askMeLater;
    $scope.neverAskMe = neverAskMe;

    $scope.$on('onDesktopNotificationPermissionChanged', _onDesktopNotificationPermissionChanged);
    _init();

    function _init() {
      $scope.isInitialQuestion = !DesktopNotification.isNotificationOn();
    }

    /**
     * x 아이콘이 클릭되었을 때.
     * 1. 두번째 질문을 한다. 혹은
     * 2. 배너를 닫는다.
     */
    function onCancelIconClick() {
      if($scope.isInitialQuestion) {
        $scope.isInitialQuestion = false;
      } else {
        DeskTopNotificationBanner.hideNotificationBanner();
      }
    }

    /**
     * Notification.permission 을 묻는다.
     */
    function turnOnDesktopNotification() {
      DesktopNotification.turnOnDesktopNotification();
    }

    /**
     * 그냥 배너를 닫는다. 어차피 배너를 보여줄지 안 보여줄지는 매 새션당 한번만 하기때문에 지금 그냥 닫아도 같은 기능을 수행할 수 있다.
     */
    function askMeLater() {
      DeskTopNotificationBanner.hideNotificationBanner();
    }

    /**
     * 사용자가 'Never Ask Me'를 눌렀을 경우.
     */
    function neverAskMe() {
      DesktopNotification.setNeverAskFlag();
      DeskTopNotificationBanner.hideNotificationBanner();
    }

    /**
     * Notification.permission 이 바뀌면 호출된다.
     * 현재 배너를 숨겨야할지 말지 물어본다.
     * @param {object} event - 이벤트 객체
     * @param {string} permission - 새로이 변한 permission 정보
     * @private
     */
    function _onDesktopNotificationPermissionChanged(event, permission) {
      DeskTopNotificationBanner.shouldHideNotificationBanner();

      if (!$scope.isInitialQuestion) {
        DeskTopNotificationBanner.hideNotificationBanner();

        if (_shouldOpenNotificationSettingModal()) {
          modalHelper.openNotificationSettingModal();
        }
      }
    }

    function _shouldOpenNotificationSettingModal() {
      return !DesktopNotification.isNotificationPermissionGranted() && !isModalOpen;
    }
  }
})();