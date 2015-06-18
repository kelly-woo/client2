/**
 * @fileoverview 프리로더
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandi.browser')
    .service('Browser', Browser);

  /**
   * 다음 브라우저들에 한해 종류와 버전 정보를 제공
   *
   * - ie7 ~ ie11
   * - chrome
   * - firefox
   * - safari
   * @example
   * Browser.chrome === true;    // chrome
   * Browser.firefox === true;    // firefox
   * Browser.safari === true;    // safari
   * Browser.msie === true;    // IE
   * Browser.other === true;    // other browser
   * Browser.version;    // 브라우저 버전 type: Number
   */
  function Browser() {
    _.extend(this, _getBrowser());

    /**
     * 브라우저 정보를 담고 있는 객체를 반환한다.
     * @returns {{chrome: boolean, firefox: boolean, safari: boolean, msie: boolean, others: boolean, version: number}}
     * @private
     */
    function _getBrowser() {
      var nav = window.navigator;
      var appName = nav.appName.replace(/\s/g, '_');
      var userAgent = nav.userAgent;
      var browser = {
        chrome: false,
        firefox: false,
        safari: false,
        msie: false,
        others: false,
        version: 0
      };
      var regxIE = /MSIE\s([0-9]+[.0-9]*)/;
      var regxIE11 = /Trident.*rv:11\./;
      var regxVer = {
        'firefox': /Firefox\/(\d+)\./,
        'chrome': /Chrome\/(\d+)\./,
        'safari': /Version\/([\d\.]+)\sSafari\/(\d+)/
      };

      var key;
      var tmp;
      var isDetacted = false;

      if (appName === 'Microsoft_Internet_Explorer') {
        // ie8 ~ ie10
        browser.msie = true;
        browser.version = parseFloat(userAgent.match(regxIE)[1]);
        isDetacted = true;
      } else if (appName === 'Netscape') {
        if (regxIE11.exec(userAgent)) {
          // ie11
          browser.msie = true;
          browser.version = 11;
        } else {
          // chrome, firefox, safari, others
          for (key in regxVer) {
            if (regxVer.hasOwnProperty(key)) {
              tmp = userAgent.match(regxVer[key]);
              if (tmp && tmp.length > 1) {
                browser[key] = isDetacted = true;
                browser.version = parseFloat(tmp[1] || 0);
                break;
              }
            }
          }
        }
      }

      // 브라우저 검출 실패 시 others로 표기
      if (!isDetacted) {
        browser.others = true;
      }
      return browser;
    }
  }
})();