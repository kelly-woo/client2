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
    this.open = open;
    this.close = close;
    this.modify = modify;
    this.reloadList = reloadList;
    this.backToMain = backToMain;
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
     * 커넥트 화면을 open 한다.
     * @param {object} [params=null] - 세팅 회면 진입 시 connectId 의 수정 페이지를 바로 노출할 경우 해당 변수를 전달해야 한다.
     *  @param  {string} params.unionName - union 이름
     *  @param  {number} params.connectId - connectId
     */
    function open(params) {
      jndPubSub.pub('JndConnect:open', params);
    }

    /**
     * 커넥트 화면을 close 한다.
     */
    function close() {
      jndPubSub.pub('JndConnect:close');
    }

    /**
     * connect list 를 리로드한다.
     */
    function reloadList() {
      jndPubSub.pub('JndConnect:reloadList');
    }

    /**
     * main 으로 되돌아온다.
     */
    function backToMain() {
      jndPubSub.pub('JndConnect:backToMain');
    }

    /**
     * connect 설정 수정
     * @param {string} unionName
     * @param {number} connectId
     */
    function modify(unionName, connectId) {
      jndPubSub.pub('JndConnect:modify', {
        unionName: unionName,
        connectId: connectId
      });
    }
  }
})();
