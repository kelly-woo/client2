/**
 * @fileoverview 잔디 커넥트 union 공통 서비스 모듈
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnectUnion', JndConnectUnion);


  function JndConnectUnion() {
    this.save = save;
    this.loadHeader = loadHeader;
    this.loadFooter = loadFooter;

    function save(unionName, requestData, isUpdate) {
      var promise;
      if (isUpdate) {
        promise = JndConnectUnionApi.update(unionName, requestData)
          .success(_onSuccessUpdate)
          .error(_onErrorUpdate);
      } else {
        promise = JndConnectUnionApi.create(unionName, requestData)
          .success(_onSuccessCreate)
          .error(_onErrorCreate);
      }
      return promise;
    }

    function loadHeader(header, response) {
      //headers
      _.extend(header, {
        isAccountLoaded: true,
        accountId: response.authenticationId,
        createdAt: response.createdAt,
        isActive: response.status === 'enabled',
        accounts: [{
          text: response.authenticationName,
          value: response.authenticationId
        }]
      });
    }

    function loadFooter(footer, response) {
      //footers
      _.extend(footer, {
        botName: response.botName,
        botThumbnailFile: response.botThumbnailUrl,
        lang: response.lang
      });
    }

    function _onSuccessUpdate() {
      Dialog.success({
        body:  '업데이트 성공성공',
        allowHtml: true,
        extendedTimeOut: 0,
        timeOut: 0
      });
      JndConnect.backToMain();
    }

    function _onErrorUpdate() {
      JndUtil.alertUnknownError(response);
    }

    function _onSuccessCreate() {
      Dialog.success({
        body:  '생성 성공성공',
        allowHtml: true,
        extendedTimeOut: 0,
        timeOut: 0
      });
      JndConnect.backToMain();
    }

    function _onErrorCreate() {
      JndUtil.alertUnknownError(response);
    }


  }
})();
