/**
 * @fileoverview 잔디 커넥트 union 공통 서비스 모듈
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnectUnion', JndConnectUnion);


  function JndConnectUnion(memberService, JndConnectUnionApi, JndConnect, JndUtil, Dialog) {
    this.getDefaultHeader = getDefaultHeader;
    this.getDefaultFooter = getDefaultFooter;
    this.save = save;
    this.read = read;
    this.setHeaderAccountData = setHeaderAccountData;

    /**
     * header default 데이터를 반환한다.
     * @param {object} current - current union 객체
     */
    function getDefaultHeader(current) {
      return {
        isAccountLoaded: false,
        accountId: null,
        accounts: [],
        current: current,
        memberId: memberService.getMemberId(),
        createdAt: null,
        isActive: false
      };
    }

    /**
     * footer default 데이터를 반환한다.
     * @param {object} current - current union 객체
     */
    function getDefaultFooter(current) {
      var botName = JndUtil.pick(current, 'union', 'title') + ' Bot';
      return {
        botThumbnailFile: JndUtil.pick(current, 'union', 'imageUrl'),
        botName: botName,
        defaultBotName: botName,
        lang: 'ko'
      };
    }

    /**
     * 저장된 커넥트 정보를 조회한다.
     * @param {object} options
     *    @param {string} options.current - current union 객체
     *    @param {object} [options.header]  - 공통 header 데이터 object
     *    @param {object} [options.footer]  - 공통 footer 데이터 object
     * @returns {*}
     */
    function read(options) {
      var name = JndUtil.pick(options, 'current', 'union', 'name');
      var connectId = JndUtil.pick(options, 'current', 'connectId');
      return JndConnectUnionApi.read(name, connectId)
        .success(_.bind(_onSuccessRead, this, options))
        .error(_.bind(_onErrorCommon, this, options));
    }

    /**
     * 커넥트를 저장한다.
     * @param {object} options
     *    @param {string} options.current - current union 객체
     *    @param {object} options.data - request 할 데이터
     * @returns {*}
     */
    function save(options) {
      var promise;
      var name = JndUtil.pick(options, 'current', 'union', 'name');
      var connectId = JndUtil.pick(options, 'current', 'connectId');
      var isUpdate = !!connectId;
      var data = _.extend(options.data, {
        connectId: connectId
      });

      if (isUpdate) {
        promise = JndConnectUnionApi.update(name, data)
          .success(_onSuccessUpdate)
          .error(_onErrorCommon);
      } else {
        promise = JndConnectUnionApi.create(name, data)
          .success(_onSuccessCreate)
          .error(_onErrorCommon);
      }
      return promise;
    }

    /**
     * read 성공 콜백
     * @param {object} options
     *    @param {object} [options.header]  - 공통 header 데이터 object
     *    @param {object} [options.footer]  - 공통 footer 데이터 object
     * @param {object} response
     * @private
     */
    function _onSuccessRead(options, response) {
      var header = options.header;
      var footer = options.footer;
      if (header) {
        setHeaderAccountData(header, response);
        _.extend(header, {
          createdAt: response.createdAt,
          isActive: response.status === 'enabled'
        });
      }
      if (footer) {
        _.extend(footer, {
          botName: response.botName,
          botThumbnailFile: response.botThumbnailUrl,
          lang: response.lang
        });
      }
    }

    /**
     * 공통 header 데이터에서 account 관련 데이터를 주입 한다.
     * @param {object} header - 공통 header
     * @param {object} response - 공통 포멧 응답 값
     */
    function setHeaderAccountData(header, response) {
      if (header) {
        _.extend(header, {
          isAccountLoaded: true,
          accountId: response.authenticationId,
          accounts: [{
            text: response.authenticationName,
            value: response.authenticationId
          }]
        });
      }
    }

    /**
     * 오류 콜백
     * @private
     */
    function _onErrorCommon(response) {
      JndUtil.alertUnknownError(response);
    }

    /**
     * 업데이트 성공 콜백
     * @private
     */
    function _onSuccessUpdate() {
      Dialog.success({
        body:  '업데이트 성공성공',
        allowHtml: true,
        extendedTimeOut: 0,
        timeOut: 0
      });
      JndConnect.backToMain();
    }

    /**
     * 생성 성공 콜백
     * @private
     */
    function _onSuccessCreate() {
      Dialog.success({
        body:  '생성 성공성공',
        allowHtml: true,
        extendedTimeOut: 0,
        timeOut: 0
      });
      JndConnect.backToMain();
    }
  }
})();
