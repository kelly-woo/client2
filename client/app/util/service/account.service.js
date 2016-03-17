/**
 * @fileoverview account 서비스
 * @author young.park <young.park@tosslab.com>
 */
(function(){
  'use strict';

  angular
    .module('jandiApp')
    .factory('accountService', accountService);

  /* @ngInject */
  function accountService($location, configuration, $http, $rootScope, jndPubSub, CoreUtil) {
    var _membershipMap = {};
    var _account = null;

    var service = {
      getAccountInfo: getAccountInfo,
      setAccountInfo: setAccountInfo,
      getAccount: getAccount,
      setAccount: setAccount,
      removeAccount: removeAccount,
      hasAccount: hasAccount,
      getCurrentSignInInfo: getCurrentSignInInfo,
      getAccountLanguage: getAccountLanguage,
      validateCurrentPassword: validateCurrentPassword,
      setAccountLanguage: setAccountLanguage,
      hasChangeLog: hasChangeLog,
      hasSeenTutorial: hasSeenTutorial,
      updateAccountTutoredTime: updateAccountTutoredTime,
      updateCurrentAccount: updateCurrentAccount,
      getMemberId: getMemberId
    };

    return service;

    function getAccountInfo() {
      return $http({
        method: 'GET',
        url: $rootScope.server_address + 'account'
      });
    }
    function setAccountInfo(account) {
      return $http({
        method: 'PUT',
        url: $rootScope.server_address + 'account',
        data: account
      });
    }

    /**
     * account 정보를 조회한다.
     * @returns {*}
     */
    function getAccount() {
      return _account;
      //return $rootScope.account;
    }

    /**
     * account 정보를 저장한다.
     * @param {object} account
     */
    function setAccount(account) {
      _account = account;
      _setMembershipMap(account);
      jndPubSub.pub('accountService:setAccount');
    }

    /**
     * account 정보를 제거한다.
     */
    function removeAccount() {
      _account = null;
    }

    function hasAccount() {
      return !!_account;
    }

    // TODO: CURRENTLY THIS IS O(N) ALGORITHM.  WHEN FOUND MATCH, BREAK OUT OF FOR LOOP AND RETURN RIGHT AWAY!
    // Returns memberId of current team from Account.
    function getCurrentSignInInfo(memberships) {
      var signInInfo = {
        memberId    : -1,
        teamId      : -1,
        teamName    : '',
        status      : ''
      };

      var prefix = $location.host().split('.')[0];

      if (configuration.name == 'local') {
        prefix = configuration.team_name;
      }

      _.forEach(memberships, function(membership, index) {
        if (membership.t_domain == prefix) {
          signInInfo.memberId = membership.memberId;
          signInInfo.teamId = membership.teamId;
          signInInfo.teamName = membership.name;
          signInInfo.status = membership.status;
        }
      });

      return signInInfo;
    }

    /**
     * 언어 설정을 저장한다.
     * @param {string} lang
     */
    function setAccountLanguage(lang) {
      _account.lang = lang;
    }

    /**
     * 언어 설정을 조회한다.
     * @returns {string}
     */
    function getAccountLanguage() {
      return CoreUtil.pick(_account, 'lang') || $rootScope.preferences.serverLang;
    }

    function validateCurrentPassword(cur_password) {
      cur_password = cur_password || '';
      return $http({
        method  : 'POST',
        url     : $rootScope.server_address + 'validation/password',
        data    : {
          password: cur_password
        }
      });
    }

    function hasChangeLog() {
      var account = getAccount();

      // Account or tutoredAt info don't exist. return false.
      if (!account || !account.tutoredAt) return false;

      var tutoredAt = new Date(account.tutoredAt);
      var lastUpdateMessageAt = new Date(configuration.last_update_message);

      // Return true if and only if tutoredAt is in past.
      if (tutoredAt < lastUpdateMessageAt) {
        return true;
      }

      return false;
    }

    function hasSeenTutorial() {
      return !!getAccount().tutoredAt;
    }

    function updateAccountTutoredTime(updatedTime) {
      var account = getAccount();
      if (!account) return;

      account.tutoredAt = updatedTime;
    }

    function updateCurrentAccount() {
      getAccountInfo()
        .success(function(response) {
          setAccount(response);
        })
    }

    /**
     * 현재 account의 memberships를 활용하여 map을 만든다.
     * @param {object} account - account model
     * @private
     */
    function _setMembershipMap(account) {
      _.forEach(account.memberships, function(membership) {
        _membershipMap[membership['teamId']] = membership;
      });
    }

    /**
     * teamId에 해당하는 membership정보를 리턴한다.
     * @param {number} teamId - 알고싶은 membership의 아이디
     * @returns {boolean|*}
     */
    function getMembership(teamId) {
      return !!_membershipMap[teamId] && _membershipMap[teamId];
    }

    /**
     * teamId에 해당하는 membership 정보 중 memberId값을 리턴한다.
     * @param {number} teamId - 알고 싶은 membership 의 아이디
     * @returns {boolean|*|.params.memberId|param.memberId|d.memberId|a.y.memberId|*}
     */
    function getMemberId(teamId) {
      return !!getMembership(teamId) && getMembership(teamId).memberId;
    }
  }
})();
