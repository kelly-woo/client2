(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('DeskTopNotificationBanner', DeskTopNotificationBanner);

  /* @ngInject */
  function DeskTopNotificationBanner(DesktopNotificationUtil, $document, $compile, jndPubSub, $rootScope, publicService,
                                     Browser) {
    var that = this;

    var _jqBanner;
    var bannerScope;

    var _isBannerUp = false;

    that.isNotificationBannerUp = isNotificationBannerUp;

    that.shouldHideNotificationBanner = shouldHideNotificationBanner;

    that.showNotificationBanner = showNotificationBanner;
    that.hideNotificationBanner = hideNotificationBanner;

    that.shouldAskNotificationPermission = shouldAskNotificationPermission;
    that.shouldAskLocalNotification = shouldAskLocalNotification;

    that.adjustBodyWrapperHeight = adjustBodyWrapperHeight;

    function isNotificationBannerUp() {
      return _isBannerUp;
    }

    /**
     * 노티피케이션 배너를 숨겨야하나? 그렇다면 숨긴다.
     */
    function shouldHideNotificationBanner() {
      if (_isBannerUp && !_isPermissionDefault()) {
        hideNotificationBanner();
      }
    }

    /**
     * 배너를 보여줘야 할 상황이면 보여준다.
     */
    function showNotificationBanner(scope) {
      if (_shouldAskNotification() && !_isInternetExplorer() && !Browser.others) {
        _prependBannerElement(scope);
      }
    }

    /**
     * 인터넷 익스플로러인지(edge 포함) 아닌지 확인 후 리턴한다.
     * @returns {browser.msie|*|boolean|n.msie|browser.edge}
     * @private
     */
    function _isInternetExplorer() {
      return Browser.msie || Browser.edge;
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
      _isBannerUp = false;

      _jqBanner.remove();

      _adjustBodyWrapperHeight();
      _addFullScreenClass();

      bannerScope.$destroy();
      jndPubSub.pub('onNotificationBannerDisappear');
    }

    /**
     * 배너 엘레멘트를 생성해서 바디(body) 제일 앞에 넣는다.
     * @private
     */
    function _prependBannerElement(scope) {
      var jqContentWrapper;
      if (!_isBannerUp) {
        _isBannerUp = true;
        _jqBanner = angular.element('<div notification-banner></div>');
        jqContentWrapper = $document.find('body .content-wrapper').eq(0);
        bannerScope = $rootScope.$new(true);

        $compile(_jqBanner)(bannerScope);

        jqContentWrapper.prepend(_jqBanner);

        _removeFullScreenClass();

        _adjustBodyWrapperHeight();
      }
    }

    /**
     * Notification.permission 의 값이 default 인지 아닌지 알아본다.
     * @returns {boolean} isDefault - true, if value is 'default'
     * @private
     */
    function _isPermissionDefault() {
      var permission = DesktopNotificationUtil.getNotificationPermission();
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
     *   3. 유져가 배너에서 'never ask me' 를 누르지 않았을 경우
     * @returns {|boolean}
     */
    function shouldAskNotificationPermission() {
      return _isPermissionDefault() && !_isNeverAskMeFlagUp();
    }

    /**
     * 로컬 노티피케이션이 꺼져있는 상태인가?
     *   1. Notification.permission 의 값은 'granted' 이지만
     *   2. 사용자가 notification setting modal 에서 설정을 껐을 때
     * @returns {boolean}
     */
    function shouldAskLocalNotification() {
      var isNotificationPermissionGranted = DesktopNotificationUtil.isNotificationPermissionGranted();
      var isNotificationLocalFlagUp = DesktopNotificationUtil.isNotificationLocalFlagUp();

      return isNotificationPermissionGranted && !isNotificationLocalFlagUp;
    }

    /**
     * 'never ask me' 를 눌렀는가?
     * @returns {boolean}
     * @private
     */
    function _isNeverAskMeFlagUp() {
      return DesktopNotificationUtil.isNeverAskFlagUp();
    }

    /**
     * 노티피케이션 배너의 유무에 따라 바디의 높이를 조절한다.
     * @private
     */
    function _adjustBodyWrapperHeight() {
      publicService.adjustBodyWrapperHeight(_isBannerUp);
    }

    function adjustBodyWrapperHeight() {
      _adjustBodyWrapperHeight();
    }

    /**
     * notification banner 가 없을 경우 알맞는 css class를 '.body-wrapper'와 '.body'에 넣어준다.
     * @private
     */
    function _addFullScreenClass() {
      var jqBodyWrapper = $('.body-wrapper');
      var jqBody = $('.body');

      jqBodyWrapper.addClass('full-screen');
      jqBody.addClass('full-screen');
    }

    function _removeFullScreenClass() {
      var jqBodyWrapper = $('.body-wrapper');
      var jqBody = $('.body');

      jqBodyWrapper.removeClass('full-screen');
      jqBody.removeClass('full-screen');
    }
  }
})();