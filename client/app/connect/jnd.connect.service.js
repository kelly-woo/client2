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
     * @param {object} [params=null] - 세팅 회면 진입 시 connectId 의 수정 페이지를 바로 노출할 경우 해당 변수를 전달해야 한다.
     *  @param  {string} params.unionName - union 이름
     *  @param  {number} params.connectId - connectId
     */
    function show(params) {
      jndPubSub.pub('JndConnect:show', params);
    }

    /**
     * 커넥트 화면을 hide 한다.
     */
    function hide() {
      jndPubSub.pub('JndConnect:hide');
    }
  }
})();
