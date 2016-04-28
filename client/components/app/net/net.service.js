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
  function NetInterceptor($rootScope, $q, configuration, jndPubSub) {
    var _isConnected = true;
    var _responseErrorStatus = {};

    var _$scope = $rootScope.$new();

    this.setStatus = setStatus;
    this.isConnected = isConnected;

    this.responseError = responseError;

    _init();

    /**
     *
     * @private
     */
    function _init() {
      _attachScopeEvent();
      _attachDomEvent();
    }

    /**
     * attach scope events
     * @private
     */
    function _attachScopeEvent() {
      _$scope.$on('WatchDog:onWakeUp', _onWakeUp);
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
     * wake up event handler
     * @private
     */
    function _onWakeUp() {
      var responseStatus = _getResponseErrorStatus();
      if (responseStatus['504'] || responseStatus['0']) {
        // wake up 후 바로 connected를 pub하면 xhr 오류가 발생하므로 setTimeout 사용한다.
        setTimeout(function() {
          jndPubSub.pub('NetInterceptor:onResponseErrorException');
        }, 1000);
      }
      _clearResponseErrorStatus();
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

      _setResponseErrorStatus(rejection.status);

      return $q.reject(rejection);
    }

    /**
     * response error status 전달
     * @returns {object}
     * @private
     */
    function _getResponseErrorStatus() {
      return _responseErrorStatus;
    }

    /**
     * response error status 설정
     * @param {number} responseStatus
     * @private
     */
    function _setResponseErrorStatus(responseStatus) {
      _responseErrorStatus[responseStatus] = (_responseErrorStatus[responseStatus] || 0) + 1;
    }

    /**
     * response error status 초기화
     * @private
     */
    function _clearResponseErrorStatus() {
      _responseErrorStatus = {};
    }
  }
})();
