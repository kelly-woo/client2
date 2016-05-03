/**
 * @fileoverview 특정 service 또는 검증에 의해 설정된 환경 변수를 제공하는 service
 */
(function() {
  'use strict';

  angular
    .module('jandi.environment')
    .service('Environment', Environment);

  function Environment(Browser) {
    var _that = this;

    _that.KEY_NAMES = {
      CTRL: Browser.platform.isMac ? 'Cmd' : 'Ctrl'
    };
  }
})();