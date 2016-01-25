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
    this.parseUrl = parseUrl;
    this.dataURItoBlob = dataURItoBlob;
    this.compareJSON = compareJSON;

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
     * @param {number} status - http 상태 코드
     */
    function alertUnknownError(response, status) {
      var msg = $filter('translate')('@common-unknown-error');
      var body;
      response = _.extend({
        code: status || -1,
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
     * https://github.com/nhnent/tui.code-snippet
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
     *  JndUtil.pick(obj, 'nested', 'nested', 'key1'); // 21
     *  JndUtil.pick(obj, 'nested', 'nested', 'key2'); // undefined
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

    /**
     * url 을 파싱하여 get 파라미터로 전달된 데이터를 반환한다.
     * @returns {{}}
     */
    function parseUrl() {
      var data = {};
      var url = window.location.href;
      var urlSplit = url.split('?');
      var paramsString = urlSplit[1];
      var tokens;
      var temp;
      if (paramsString) {
        tokens = paramsString.split('&');
        _.forEach(tokens, function(token) {
          temp = token.split('=');
          if (temp.length === 2) {
            data[temp[0]] = temp[1];
          }
        });
      }
      return data;
    }

    /**
     * data uri 를 blob 데이터로 변경해주는 함수.
     * @param {string} dataURI
     * @returns {*}
     */
    function dataURItoBlob (dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
      else
        byteString = unescape(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      return new Blob([ab],{type: 'image/png'});
    }


    /**
     * Return the equality for multiple objects(jsonObjects).<br>
     *  See {@link http://stackoverflow.com/questions/1068834/object-comparison-in-javascript}
     *  https://github.com/nhnent/tui.code-snippet
     * @param {...object} object - Multiple objects for comparing.
     * @return {boolean} Equality
     * @example
     *
     *  var jsonObj1 = {name:'milk', price: 1000},
     *      jsonObj2 = {name:'milk', price: 1000},
     *      jsonObj3 = {name:'milk', price: 1000};
     *
     *  JndUtil.compareJSON(jsonObj1, jsonObj2, jsonObj3);   // true
     *
     *
     *  var jsonObj4 = {name:'milk', price: 1000},
     *      jsonObj5 = {name:'beer', price: 3000};
     *
     *      JndUtil.compareJSON(jsonObj4, jsonObj5); // false
     */
    function compareJSON(object) {
      var leftChain,
        rightChain,
        argsLen = arguments.length,
        i;

      function isSameObject(x, y) {
        var p;

        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) &&
          isNaN(y) &&
          _.isNumber(x) &&
          _.isNumber(y)) {
          return true;
        }

        // Compare primitives and functions.
        // Check if both arguments link to the same object.
        // Especially useful on step when comparing prototypes
        if (x === y) {
          return true;
        }

        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((_.isFunction(x) && _.isFunction(y)) ||
          (x instanceof Date && y instanceof Date) ||
          (x instanceof RegExp && y instanceof RegExp) ||
          (x instanceof String && y instanceof String) ||
          (x instanceof Number && y instanceof Number)) {
          return x.toString() === y.toString();
        }

        // At last checking prototypes as good a we can
        if (!(x instanceof Object && y instanceof Object)) {
          return false;
        }

        if (x.isPrototypeOf(y) ||
          y.isPrototypeOf(x) ||
          x.constructor !== y.constructor ||
          x.prototype !== y.prototype) {
          return false;
        }

        // check for infinitive linking loops
        if (_.indexOf(leftChain, x) > -1 ||
          _.indexOf(rightChain, y) > -1) {
          return false;
        }

        // Quick checking of one object beeing a subset of another.
        for (p in y) {
          if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
          }
          else if (typeof y[p] !== typeof x[p]) {
            return false;
          }
        }

        //This for loop executes comparing with hasOwnProperty() and typeof for each property in 'x' object,
        //and verifying equality for x[property] and y[property].
        for (p in x) {
          if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
          }
          else if (typeof y[p] !== typeof x[p]) {
            return false;
          }

          if (typeof(x[p]) === 'object' || typeof(x[p]) === 'function') {
            leftChain.push(x);
            rightChain.push(y);

            if (!isSameObject(x[p], y[p])) {
              return false;
            }

            leftChain.pop();
            rightChain.pop();
          } else if (x[p] !== y[p]) {
            return false;
          }
        }

        return true;
      }

      if (argsLen < 1) {
        return true;
      }

      for (i = 1; i < argsLen; i++) {
        leftChain = [];
        rightChain = [];

        if (!isSameObject(arguments[0], arguments[i])) {
          return false;
        }
      }

      return true;
    }
  }
})();
