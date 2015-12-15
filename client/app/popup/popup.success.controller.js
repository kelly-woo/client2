/**
 * @fileoverview
 * Integration 수행 작업 등 팝업에서 부모창을 제어해야 할 경우,
 * Same origin policy 를 우회하기 위한 팝업 Controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('PopupSuccessCtrl', PopupSuccessCtrl);

  /* @ngInject */
  function PopupSuccessCtrl($scope, JndUtil) {
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      //참고: $state.params 의 모든 value 들은 router.service.js 에서 lowerCase 로 변환된다.
      var params = JndUtil.parseUrl();
      var callbackEvent = params.callbackEvent;
      var parentAngular = window.opener && window.opener.angular;
      var jqBody;
      var parenPubSub;
      var parentJndUtil;
      if (parentAngular && callbackEvent) {

        jqBody = parentAngular.element('body');
        parenPubSub = jqBody.injector().get('jndPubSub');
        parentJndUtil = jqBody.injector().get('JndUtil');
        parentJndUtil.safeApply(jqBody.scope(), function() {
          parenPubSub.pub(callbackEvent);
        });
      } else {
        //opener 없이 접근한 경우
      }
      window.close();
    }
  }
})();
