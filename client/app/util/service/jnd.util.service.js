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
    this.pick = pick;

    /**
     * angular 의 $apply 를 안전하게 수행한다.
     * @param {object} scope
     * @param {function} fn
     */
    function safeApply(scope, fn) {
      var phase = scope.$root.$$phase;
      if (scope) {
        fn = _.isFunction(fn) ? fn : function () {
        };
        if (phase !== '$apply' && phase !== '$digest') {
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

    /**
     * Retrieve a nested item from the given object/array
     * @param {object|Array} obj - Object for retrieving
     * @param {...string|number} paths - Paths of property
     * @returns {*} Value
     * @example
     *  var obj = {
     *      'key1': 1,
     *      'nested' : {
     *          'key1': 11,
     *          'nested': {
     *              'key1': 21
     *          }
     *      }
     *  };
     *  tui.util.pick(obj, 'nested', 'nested', 'key1'); // 21
     *  tui.util.pick(obj, 'nested', 'nested', 'key2'); // undefined
     *
     *  var arr = ['a', 'b', 'c'];
     *  JndUtil.pick(arr, 1); // 'b'
     */
    function pick(obj, paths) {
      var args = arguments,
        target = args[0],
        length = args.length,
        i;
      try {
        for (i = 1; i < length; i++) {
          target = target[args[i]];
        }
        return target;
      } catch(e) {
        return;
      }
    }
  }
})();
