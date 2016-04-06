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

    _init();

    /**
     *
     * @private
     */
    function _init() {
      _attachDomEvent();
    }

    /**
     * dom 이벤트를 바인딩 한다.
     * @private
     */
    function _attachDomEvent() {
      $(window).on("offline", _.bind(setStatus, this, false));
      $(window).on("online", _.bind(setStatus, this, true));
    }

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
        $('.content-wrapper').removeClass('offline')
      } else {
        jndPubSub.pub('disconnected');
        $('.content-wrapper').addClass('offline');
      }
    }

    /**
     * API responseError 발생시 connection status 를 설정한다.
     * @param {object} rejection
     * @returns {Promise}
     */
    function responseError(rejection) {
      setStatus(window.navigator.onLine);
      return $q.reject(rejection);
    }
  }
})();
