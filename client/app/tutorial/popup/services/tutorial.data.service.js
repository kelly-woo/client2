/**
 * @fileoverview Tutorial 에 필요한 데이터를 담는 저장소. account 정보도 저장한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TutorialData', TutorialData);

  /* @ngInject */
  function TutorialData(accountService, publicService, memberService) {
    var _data;
    var _account;
    var _currentAccount;
    this.get = get;
    this.set = set;
    this.getCurrentAccount = getCurrentAccount;
    this.getAccount = getAccount;

    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      _data = {};
      _initAccount();
    }

    function _initAccount() {
      var promise = accountService.getAccountInfo()
        .then(
          function(response) {
            var signInInfo = accountService.getCurrentMemberId(response.data.memberships);
            _account = response.data;
            publicService.setLanguageConfig(_account.lang);
            return memberService.getMemberInfo(signInInfo.memberId);
          })
        .then(
          function (response) {
            _currentAccount = response.data;
          }
        );
      set('accountPromise', promise);
    }
    /**
     * account 정보를 반환한다.
     * @returns {*}
     */
    function getAccount() {
      return _account;
    }

    /**
     * 현재 team 에 해당하는 account 정보를 반환한다.
     * @returns {*}
     */
    function getCurrentAccount() {
      return _currentAccount;
    }

    /**
     * 값을 조회한다.
     * @param {string} [key]
     * @returns {*}
     */
    function get(key) {
      if (_.isString(key)) {
        return _data[key];
      } else {
        return _data;
      }
    }

    /**
     * query 를 설정한다.
     * @param {string|object} key
     * @param {string|number} [value]
     */
    function set(key, value) {
      if (_.isObject(key)) {
        _.each(key, function(value, property) {
          set(property, value);
        });
      } else if (_.isString(key)) {
        _data[key] = value;
      }
    }
  }
})();
