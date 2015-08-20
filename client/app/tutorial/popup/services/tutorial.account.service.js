/**
 * @fileoverview Tutorial 의 account 정보 저장한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TutorialAccount', TutorialAccount);

  /* @ngInject */
  function TutorialAccount(accountService, publicService, memberService) {
    var _data;
    var _account;
    var _currentAccount;
    var that = this;

    this.getCurrent = getCurrent;
    this.get = get;
    this.isOwner = isOwner;
    this.getCurrentTeam = getCurrentTeam;

    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      _data = {};
      _initAccount();
    }

    /**
     * account 를 초기화한다.
     * @private
     */
    function _initAccount() {
      var promise = accountService.getAccountInfo()
        .then(
        function(response) {
          var signInInfo = accountService.getCurrentMemberId(response.data.memberships);
          _account = response.data;
          publicService.setLanguageConfig(_account.lang);
          return memberService.getMemberInfo(signInInfo.memberId, 'tutorial');
        })
        .then(
        function (response) {
          _currentAccount = response.data;
        }
      );

      that.promise = promise;
    }

    /**
     * team owner 인지 여부 반환
     * @returns {boolean}
     */
    function isOwner() {
      return getCurrent().u_autority === 'owner';
    }

    /**
     * account 정보를 반환한다.
     * @returns {*}
     */
    function get() {
      return _account;
    }

    /**
     * 현재 team 에 해당하는 account 정보를 반환한다.
     * @returns {*}
     */
    function getCurrent() {
      return _currentAccount;
    }

    /**
     * 현재 팀 정보를 반환한다.
     * @returns {*}
     */
    function getCurrentTeam() {
      var currentTeamId = _currentAccount.teamId;
      var team;
      _.forEach(_account.memberships, function(item) {
        if (item.teamId === currentTeamId) {
          team = item;
          return false;
        }
      });
      return team;
    }
  }
})();
