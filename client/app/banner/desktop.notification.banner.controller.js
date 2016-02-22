(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('DesktopNotificationBannerCtrl', DesktopNotificationBannerCtrl);

  /* @ngInject */
  function DesktopNotificationBannerCtrl($scope, DeskTopNotificationBanner, DesktopNotificationUtil, modalHelper) {
    var isModalOpen = false;

    $scope.isInitialQuestion;

    $scope.onCancelIconClick = onCancelIconClick;

    $scope.turnOnDesktopNotification = turnOnDesktopNotification;
    $scope.askMeLater = askMeLater;
    $scope.neverAskMe = neverAskMe;

    _init();

    function _init() {
      $scope.isInitialQuestion = !DesktopNotificationUtil.isPermissionGranted();
      _attachEvents();
    }

    /**
     * attach events
     * @private
     */
    function _attachEvents() {
      $scope.$on('onPermissionChanged', _onDesktopNotificationPermissionChanged);
      $scope.$on('$destroy', _onDestroy);

      $(window).on('resize', _onResize);
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
      DesktopNotificationUtil.requestPermission();
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
      DesktopNotificationUtil.setData('naverAsk', DesktopNotificationUtil.NAVER_ASK.TRUE);
      DeskTopNotificationBanner.hideNotificationBanner();
    }

    /**
     * Notification.permission 이 바뀌면 호출된다.
     * 현재 배너를 숨겨야할지 말지 물어본다.
     * @private
     */
    function _onDesktopNotificationPermissionChanged() {
      DeskTopNotificationBanner.shouldHideNotificationBanner();

      if (!$scope.isInitialQuestion) {
        DeskTopNotificationBanner.hideNotificationBanner();

        if (_shouldOpenNotificationSettingModal()) {
          modalHelper.openNotificationSettingModal();
        }
      }
    }

    /**
     * notification setting modal 창을 열어야 하는가?
     * @returns {boolean}
     * @private
     */
    function _shouldOpenNotificationSettingModal() {
      return !DesktopNotificationUtil.isPermissionGranted() && !isModalOpen;
    }

    /**
     * 윈도우가 resize 되었을 경우 호출되는 펑션.
     * @private
     */
    function _onResize() {
      DeskTopNotificationBanner.adjustBodyWrapperHeight();
    }

    /**
     * 스코프가 소멸될 때 호출되는 펑션.
     * @private
     */
    function _onDestroy() {
      _detachEvents();
    }

    /**
     * detach events
     * @private
     */
    function _detachEvents() {
      $(window).off('resize', _onResize);
    }
  }
})();