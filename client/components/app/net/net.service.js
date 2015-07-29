/**
 * @fileoverview 네트워크 Interceptor
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.net')
    .service('NetInterceptor', NetInterceptor);

  /**
   * Network Interceptor
   * @param {Promise} $q $q 객체
   * @param {object} jndPubSub jndPubSub 서비스
   * @constructor
   */
  /* @ngInject */
  function NetInterceptor($q, configuration, jndPubSub) {
    var _isConnected = true;

    this.setStatus = setStatus;
    this.isConnected = isConnected;

    this.responseError = responseError;

    /**
     * 현재 네트워크 커넥션 상태를 반환한다.
     * @returns {boolean}
     */
    function isConnected() {
      return _isConnected;
    }

    /**
     * 커넥션 상태를 설정한다.
     * @param {boolean} isConnected 네트워크 연결상태
     */
    function setStatus(isConnected) {
      var currentStatus = _isConnected;
      _isConnected = isConnected;

      if (currentStatus !== isConnected) {
        _broadcast(isConnected);
      }
    }

    /**
     * 연결 상태를 broadcast 한다.
     * @param {boolean} isConnected
     * @private
     */
    function _broadcast(isConnected) {
      if (isConnected) {
        jndPubSub.pub('connected');
      } else {
        jndPubSub.pub('disconnected');
      }
    }

    /**
     * API responseError 발생시 connection status 를 설정한다.
     * @param {object} rejection
     * @returns {Promise}
     */
    function responseError(rejection) {
      if (_isApiUrl(rejection.config.url)) {
        if (!window.navigator.onLine && rejection.status === 0) {
          setStatus(false);
        } else {
          setStatus(true);
        }
      }
      return $q.reject(rejection);
    }

    /**
     * API url 인지 여부를 반환한다.
     * @param {string} url
     * @returns {boolean}
     * @private
     */
    function _isApiUrl(url) {
      url = url || '';
      return url.indexOf(configuration.api_address) !== -1;
    }
  }
})();
