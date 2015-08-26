/**
 * @fileoverview jndWebSocketOtherTeamManagerHelper를 도와주는 헬퍼.
 * 현재, 각 팀의 TIMEOUT_CALLER, IS_WAITING, MEMEBER_ID만 관리한다.
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketOtherTeamManagerHelper', jndWebSocketOtherTeamManagerHelper);

  /* @ngInject */
  function jndWebSocketOtherTeamManagerHelper() {
    var _teamStatusMap = {};

    this.get = get;
    this.set = set;

    this.hasTimeoutCaller = hasTimeoutCaller;
    this.isWaitingOnTeamId = isWaitingOnTeamId;
    this.hasLastLinkId = hasLastLinkId;
    this.hasMemberId = hasMemberId;


    /**
     * 해당 팀아이디에 $timeout promise 객체가 있는지 없는지 확인한다.
     * @param {number} teamId - 찾으려는 팀의 아이디
     * @param {string|number} fieldName - 찾으려는 field의 아이디
     * @returns {boolean}
     */
    function hasTimeoutCaller(teamId, fieldName) {
      return _hasTeamInfo(teamId) && _hasField(teamId, fieldName);
    }

    /**
     * 해당 팀 아이디에 is_waiting flag가 true인지 아닌지 확인한다.
     * @param {number} teamId - 찾으려는 팀의 아이디
     * @param {string|number} fieldName - 찾으려는 field의 아이디
     * @returns {boolean|*}
     */
    function isWaitingOnTeamId(teamId, fieldName) {
      return _hasTeamInfo(teamId) && _hasField(teamId, fieldName) && get(teamId, fieldName);
    }

    /**
     * teamId에 해당하는 팀에 last link id 정보가 있는지 없는지 확인한다.
     * @param {number} teamId - 팀의 아이디
     * @param {string|number} fieldName - 찾으려는 field의 아이디
     * @returns {boolean}
     */
    function hasLastLinkId(teamId, fieldName) {
      return _hasTeamInfo(teamId) && _hasField(teamId, fieldName);
    }

    /**
     * teamId에 해당하는 팀에 member id 정보가 있는지 없는지 확인한다.
     * @param {number} teamId - 찾으려는 팀의 아이디
     * @param {string|number} fieldName - 찾으려는 field의 아이디
     * @returns {boolean}
     */
    function hasMemberId(teamId, fieldName) {
      return _hasTeamInfo(teamId) && _hasField(teamId, fieldName);
    }
    /**
     * 해당 팀 아이디의 정보에 fieldName이라는 field가 있는지 없는지 리턴한다.
     * @param {number} teamId - 찾으려는 팀의 아이디
     * @param {string|number} fieldName - 찾으려는 field의 아이디
     * @returns {boolean}
     * @private
     */
    function _hasField(teamId, fieldName) {
      return !!get(teamId, fieldName);
    }

    /**
     * _teamStatusMap에서 teamId에 해당하는 모든 정보를 리턴한다.
     * @param {number} teamId - 알고싶은 팀의 아이디
     * @returns {*}
     * @private
     */
    function _getTeamInfo(teamId) {
      return _teamStatusMap[teamId];
    }

    /**
     * 기본적인 팀의 정보를 담은 오브젝트를 설정한다.
     * @param {number} teamId - 팀의 아이디, key로 사용
     * @param {object} value - 해당 팀의 정보, value로 사용
     * @private
     */
    function _setTeamInfo(teamId, value) {
      _teamStatusMap[teamId] = value;
    }

    /**
     * teamId를 key로 가진 field 가 있는지 없는지 확인한다.
     * @param {number} teamId - 확인하고 싶은 팀의 아이디
     * @returns {boolean}
     * @private
     */
    function _hasTeamInfo(teamId) {
      return !!_teamStatusMap[teamId];
    }

    /**
     * _teamStatusMap에 teamId에 해당하는 obect에 key-value pair를 추가한다.
     * @param {number} teamId - 추가하고 싶은 팀의 아이디
     * @param {string|number} key - 추가하고 싶은 pair의 key
     * @param {*} value - 추가하고 싶은 pair의 value
     * @private
     */
    function set(teamId, key, value) {
      var currentTeamInfo;

      if (_hasTeamInfo(teamId)) {
        currentTeamInfo = _getTeamInfo(teamId);
      } else {
        currentTeamInfo = {};
      }

      currentTeamInfo[key] = value;

      _setTeamInfo(teamId, currentTeamInfo);
    }

    /**
     * _teamStatusMap에서 teamId에 해당하는 오브젝트 중 key의 정보를 리턴한다.
     * @param {number} teamId - 찾으려는 팀의 아이디
     * @param {number|string} key - 찾으려는 key
     * @returns {*}
     * @private
     */
    function get(teamId, key) {
      return _teamStatusMap[teamId][key];
    }
  }
})();
