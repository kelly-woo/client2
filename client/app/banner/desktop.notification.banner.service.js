(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('DeskTopNotificationBanner', DeskTopNotificationBanner);

  /* @ngInject */
  function DeskTopNotificationBanner(DesktopNotification, $document, $compile, jndPubSub, jndMap, $rootScope, publicService) {
    var that = this;

    var jndMap = jndMap;
    var jqBanner;
    var bannerScope;

    var isBannerUp = false;
    var bannerHeight = 40;

    that.isNotificationBannerUp = isNotificationBannerUp;

    that.checkNotificationBanner = checkNotificationBanner;
    that.shouldHideNotificationBanner = shouldHideNotificationBanner;

    that.showNotificationBanner = showNotificationBanner;
    that.hideNotificationBanner = hideNotificationBanner;

    that.shouldAskNotificationPermission = shouldAskNotificationPermission;
    that.shouldAskLocalNotification = shouldAskLocalNotification;

    function isNotificationBannerUp() {
      return isBannerUp;
    }

    /**
     * 노티피케이션 배너가 떠있는지 없는지 확인한 후, 패널의 위치를 이동시킨다.
     * @param {string} panel - 위치 이동 시킬 패널
     */
    function checkNotificationBanner(panel) {
      if (isBannerUp) {
        //_movePanelDown(panel);
      } else {
        //_movePanelUp(panel);
      }
    }

    /**
     * 노티피케이션 배너를 숨겨야하나? 그렇다면 숨긴다.
     */
    function shouldHideNotificationBanner() {
      if (isBannerUp && !_isPermissionDefault()) {
        hideNotificationBanner();
      }
    }

    /**
     * 배너를 보여줘야 할 상황이면 보여준다.
     */
    function showNotificationBanner(scope) {
      if (_shouldAskNotification()) {
        _prependBannerElement(scope);
      }
    }

    /**
     * 배너를 숨긴다.
     */
    function hideNotificationBanner() {
      _detachBanner();
    }

    /**
     * 배너 엘레멘트를 markup 에서 지운다.
     * @private
     */
    function _detachBanner() {
      isBannerUp = false;

      jqBanner.remove();

      _adjustBodyWrapperHeight();

      bannerScope.$destroy();
      jndPubSub.pub('onNotificationBannerDisappear');
    }

    /**
     * 패널들을 원위치 시킨다.
     * @param {string} panel - 원위치 시킬 패널 이름.
     * @private
     */
    function _movePanelUp(panel) {
      var originalTop = jndMap.get(panel);

      if (originalTop >= 0) {
        var panelClassName = _getPanelClassName(panel);
        var jqPanelElement = _getPanelElement(panelClassName);

        jndMap.remove(panel);

        jqPanelElement.css('top', originalTop);
      }
    }

    /**
     * 패널의 위치를 아래로 이동시킨다.
     * @param {string} panel - 아래로 이동시킬 패널.
     * @private
     */
    function _movePanelDown(panel) {
      var panelClassName = _getPanelClassName(panel);
      var jqPanelElement = _getPanelElement(panelClassName);
      var currentTop = parseInt(jqPanelElement.css('top'), 10);
      if (!jndMap.get(panel)) {
        // 한 번 내린 패널은 다시 내리지 않기위해
        jndMap.add(panel, currentTop);

        jqPanelElement.css('top', currentTop + bannerHeight);
      }
    }

    /**
     * 패널의 클래스 이름을 리턴한다.
     * @param {string} panel - 클래스 이름을 추출할 패널
     * @returns {*}
     * @private
     */
    function _getPanelClassName(panel) {
      var panelClassName;
      switch (panel) {
        case 'left':
          panelClassName = '.lpanel';
          break;
        case 'center':
          panelClassName = '.cpanel';
          break;
        case 'right':
          panelClassName = '.rpanel';
          break;
        default:
          panelClassName = '';
          break;
      }

      return panelClassName;
    }

    /**
     * 해달 클래스의 엘레멘트를 리턴한다.
     * @param {string} panelClassName - 찰을 엘레멘트의 클래스 이름
     * @returns {jQueryElement}
     * @private
     */
    function _getPanelElement(panelClassName) {
      return $document.find(panelClassName).eq(0);
    }

    /**
     * 배너 엘레멘트를 생성해서 바디(body) 제일 앞에 넣는다.
     * @private
     */
    function _prependBannerElement(scope) {
      var jqContentWrapper;
      if (!isBannerUp) {
        isBannerUp = true;
        jqBanner = angular.element('<div notification-banner></div>');
        jqContentWrapper = $document.find('body .content-wrapper').eq(0);
        bannerScope = $rootScope.$new(true);

        $compile(jqBanner)(bannerScope);

        jqContentWrapper.prepend(jqBanner);

        _adjustBodyWrapperHeight();
      }
    }

    function _adjustBodyWrapperHeight() {
      publicService.adjustBodyWrapperHeight(isBannerUp);
    }

    function _isPermissionDefault() {
      var permission = DesktopNotification.getNotificationPermission();
      return !(permission === 'denied' || permission === 'granted');
    }

    /**
     * 노티피케이션을 물어봐야 하는가??
     * @returns {boolean}
     * @private
     */
    function _shouldAskNotification() {
      return shouldAskNotificationPermission();
    }

    /**
     * Notification.permission 을 물어봐야 하는 단계인가?
     *   1. Notification.permission 의 값이 'default' 이고
     *   2. 유져가 배너에서 'ask me later'나 'x'를 눌러서 껐고
     *   3. 유져가 배너에서 'never ask me' 를 누르지 않았을 경우
     * @returns {|boolean}
     */
    function shouldAskNotificationPermission() {
      return _isPermissionDefault() &&
        !_hasDeniedPermission() && !_isNeverAskMeFlagUp();
    }

    /**
     * 로컬 노티피케이션이 꺼져있는 상태인가?
     *   1. Notification.permission 의 값은 'granted' 이지만
     *   2. 사용자가 notification setting modal 에서 설정을 껐을 때
     * @returns {boolean}
     */
    function shouldAskLocalNotification() {
      var isNotificationPermissionGranted = DesktopNotification.isNotificationPermissionGranted();
      var isNotificationLocalFlagUp = DesktopNotification.isNotificationLocalFlagUp();

      return isNotificationPermissionGranted && !isNotificationLocalFlagUp;
    }

    /**
     * 현재 세션에서 'x'를 누르거나 'ask me later' 를 눌렀는가?
     * @private
     */
    function _hasDeniedPermission() {
      return false;
    }

    /**
     * 'never ask me' 를 눌렀는가?
     * @returns {boolean}
     * @private
     */
    function _isNeverAskMeFlagUp() {
      return DesktopNotification.isNeverAskFlagUp();
    }
  }
})();