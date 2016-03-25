/**
 * @fileoverview E-mail notification API 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('SettingNotificationEmailApi', SettingNotificationEmailApi);

  function SettingNotificationEmailApi($q, $http, configuration, memberService) {
    var server_address = configuration.server_address;

    this.get = get;
    this.set = set;

    /**
     * e-mail notification 세팅을 조회한다.
     * @returns {HttpPromise}
     */
    function get() {
      //return _dummyGet();
      var memberId = memberService.getMemberId();
      return $http({
        method: 'GET',
        url: server_address + 'members/' + memberId + '/emailNotification'
      });
    }

    /**
     * e-mail notification 세팅을 설정한다.
     * @returns {HttpPromise}
     */
    function set(data) {
      var memberId = memberService.getMemberId();
      return $http({
        method: 'PUT',
        url: server_address + 'members/' + memberId + '/emailNotification',
        data: data
      });
    }
  }
})();
