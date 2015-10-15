/**
 * @fileoverview 유틸리티 서비스 모음
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndUtil', JndUtil);

  function JndUtil(Dialog, $filter) {
    this.safeApply = safeApply;
    this.alertUnknownError = alertUnknownError;

    /**
     * angular 의 $apply 를 안전하게 수행한다.
     * @param {object} scope
     * @param {function} fn
     */
    function safeApply(scope, fn) {
      if (scope) {
        fn = _.isFunction(fn) ? fn : function () {
        };
        if (scope.$$phase !== '$apply' && scope.$$phase !== '$digest') {
          scope.$apply(fn);
        } else {
          fn();
        }
      }
    }

    /**
     * 알수 없는 오류에 대한 alert 을 노출한다.
     * @param {object} response
     */
    function alertUnknownError(response) {
      var msg = $filter('translate')('@common-unknown-error');
      var body;

      response = _.extend({
        code: -1,
        msg: 'Unknown error'
      }, response);

      body = [
        msg + '<br />',
        'code: ' + response.code,
        response.msg
      ];

      Dialog.alert({
        allowHtml: true,
        body: body.join('<br />')
      });
    }
  }
})();
