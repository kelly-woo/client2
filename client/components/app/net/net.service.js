(function() {
  'use strict';

  angular
    .module('app.net')
    .service('NetInterceptor', NetInterceptor);

  /* @ngInject */
  function NetInterceptor($q, $injector, jndPubSub) {
    var that = this;

    this._isConnected = false;

    this.response = response;
    this.responseError = responseError;
    this.setStatus = setStatus;

    function setStatus(isConnected) {
      var currentStatus = that._isConnected;
      that._isConnected = isConnected;

      if (currentStatus !== isConnected) {
        _broadcast(isConnected);
      }
    }

    function _broadcast(isConnected) {
      if (isConnected) {
        jndPubSub.pub('connected');
      } else {
        jndPubSub.pub('disconnected');
      }
    }

    function response(response) {
      if (response === '') {
        setStatus(false);
        return $q.reject();
      } else {
        setStatus(true);
        return response;
      }
    }

    function responseError(rejection) {
      if (rejection.status === 0) {
        // net::ERR_CONNECTION_REFUSED
        setStatus(false);
        return $q.reject(rejection);
      } else {
        setStatus(true);
        return rejection;
      }
    }
  }
})();