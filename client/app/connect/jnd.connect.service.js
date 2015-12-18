/**
 * @fileoverview 잔디 커넥트 페이지 서비스 모듈
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnect', JndConnect);


  function JndConnect(jndPubSub) {
    this.show = show;
    this.hide = hide;
    this.hideLoading = hideLoading;
    this.showLoading = showLoading;

    /**
     * connect main 의 loading 을 hide 한다.
     */
    function hideLoading() {
      jndPubSub.pub('JndConnect:hideLoading');
    }

    /**
     * connect main 의 loading 을 hide 한다.
     */
    function showLoading() {
      jndPubSub.pub('JndConnect:showLoading');
    }

    /**
     * 커넥트 화면을 show 한다.
     */
    function show() {
      jndPubSub.pub('JndConnect:show');
    }

    /**
     * 커넥트 화면을 hide 한다.
     */
    function hide() {
      jndPubSub.pub('JndConnect:hide');
    }
  }
})();
