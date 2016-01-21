/**
 * @fileoverview 잔디 커넥트 페이지 서비스 모듈
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnect', JndConnect);


  function JndConnect(jndPubSub, configuration, Popup, modalHelper, memberService) {
    var _isBannerShow = true;
    var _isOpen = false;

    this.isOpen = isOpen;
    this.isClose = isClose;
    this.open = open;
    this.close = close;
    this.doClose = doClose;
    this.modify = modify;
    this.reloadList = reloadList;
    this.backToMain = backToMain;
    this.historyBack = historyBack;
    this.hideLoading = hideLoading;
    this.showLoading = showLoading;
    this.openAuthPopup = openAuthPopup;
    this.openTopicCreateModal = openTopicCreateModal;
    this.isBannerShow = isBannerShow;
    this.setBannerStatus = setBannerStatus;
    this.getPlugSourceName = getPlugSourceName;

    /**
     * banner 의 노출 상태를 반환한다.
     * @returns {boolean}
     */
    function isBannerShow() {
      return _isBannerShow;
    }

    /**
     * banner 노출 정보를 저장한다
     * @param {boolean} isShow
     */
    function setBannerStatus(isShow) {
      _isBannerShow = isShow;
      jndPubSub.pub('JndConnect:setBannerStatus', isShow);
    }

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
     * 커넥트 화면이 open 되어있는지 여부를 반환한다.
     * @returns {boolean}
     */
    function isOpen() {
      return _isOpen;
    }

    /**
     * 커넥트 화면이 close 되어있는지 여부를 반환한다.
     * @returns {boolean}
     */
    function isClose() {
      return !_isOpen;
    }

    /**
     * 커넥트 화면을 open 한다.
     * @param {object} [params=null] - 세팅 회면 진입 시 connectId 의 수정 페이지를 바로 노출할 경우 해당 변수를 전달해야 한다.
     *  @param  {string} params.unionName - union 이름
     *  @param  {number} params.connectId - connectId
     */
    function open(params) {
      _isOpen = true;
      jndPubSub.pub('JndConnect:open', params);
    }

    /**
     * 커넥트 화면을 close 한다.
     * @param {boolean} [isShowConfirm=false] - 편집 상황에서 나갈 경우 confirm 을 보여줄지 여부
     */
    function close(isShowConfirm) {
      jndPubSub.pub('JndConnect:startClose', !!isShowConfirm);
    }

    /**
     * JndCtrl 에서 fade out 이 완료된 후 실제 close 를 수행한다.
     * @private
     */
    function doClose() {
      _isOpen = false;
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
     * @param {boolean} [isShowConfirm=false] - 편집 상황에서 나갈 경우 confirm 을 보여줄지 여부
     */
    function backToMain(isShowConfirm) {
      jndPubSub.pub('JndConnect:backToMain', !!isShowConfirm);
    }

    /**
     * 이전 화면으로 이동한다.
     */
    function historyBack() {
      jndPubSub.pub('JndConnect:historyBack');
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

    /**
     * 인증 popup 을 open 한다.
     * @param {string} unionName
     * @param {string} [callbackEventName='popupDone'] - 모든 인증이 정상 완료된 이후 trigger 할 이벤트 명
     */
    function openAuthPopup(unionName, callbackEventName) {
      callbackEventName = callbackEventName || 'popupDone';
      Popup.open(configuration.connect_auth_address + 'connect/auth/' + unionName, {
        name: 'connectAuth',
        optionStr: 'resizable=no, scrollbars=1, toolbar=no, menubar=no, status=no, directories=no, width=1024, height=768',
        data: {
          callbackEventName: callbackEventName
        }
      });
    }

    /**
     * topic create modal 을 생성한다.
     */
    function openTopicCreateModal() {
      modalHelper.openTopicCreateModal({
        isEnterTopic: false
      });
    }

    /**
     * plug 의 연동된 source 이름을 반환한다.
     * @param {object} plugData
     * @returns {*}
     */
    function getPlugSourceName(plugData) {
      var sourceName = '';

      if (plugData.memberId === memberService.getMemberId()) {
        switch (plugData.type) {
          case 'googleCalendar':
            sourceName = plugData['calendarSummary'];
            break;
          case 'github':
            sourceName = plugData['hookRepoName'];
            break;
          case 'trello':
            sourceName = plugData['webhookTrelloBoardName'];
        }
      }

      return sourceName || '';
    }
  }
})();
