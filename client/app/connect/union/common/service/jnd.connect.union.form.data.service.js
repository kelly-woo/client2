/**
 * @fileoverview 잔디 커넥트 union Form Data 변경 사항을 확인하기 위한 서비스
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnectUnionFormData', JndConnectUnionFormData);


  function JndConnectUnionFormData(CoreUtil, jndPubSub) {
    var _originalFormData = null;
    var _currentFormData = null;

    this.set = set;
    this.extend = extend;
    this.clear = clear;
    this.isChanged = isChanged;

    /**
     * 원본 form data 를 확장한다.
     * @param target
     */
    function extend(target) {
      _.extend(_originalFormData, target);
    }

    /**
     * 원본 form data 를 설정한다.
     * @param {*} value
     */
    function set(value) {
      _originalFormData = _.cloneDeep(value);
    }

    /**
     * 변경이 일어났는지 여부를 반환한다.
     * @returns {boolean}
     */
    function isChanged() {
      if (_originalFormData) {
        jndPubSub.pub('JndConnectUnionFormData:getCurrentFormData', _setCurrentFormData);
      }
      return _isChanged();
    }

    /**
     * 현재 form data 를 저장한다.
     * 각각의 controller 로 부터 데이터를 전달받아야 하므로 이벤트 trigger 시 콜백 인자로 전달한다.
     * @param {object} formData
     * @private
     */
    function _setCurrentFormData(formData) {
      _currentFormData = _.cloneDeep(formData);
    }

    /**
     * 값이 변경되었는지 여부를 반환한다.
     * @returns {boolean}
     * @private
     */
    function _isChanged() {
      if (_originalFormData && _currentFormData) {
        //header 값은 변경점에 포함되지 않으므로 제외하고 비교한다.
        delete _originalFormData.header;
        delete _currentFormData.header;
        return !CoreUtil.compareJSON(_originalFormData, _currentFormData);
      }  else {
        return false;
      }
    }

    /**
     * 현재 설정된 값을 초기화 한다.
     */
    function clear() {
      _originalFormData = null;
      _currentFormData = null;
    }
  }
})();
