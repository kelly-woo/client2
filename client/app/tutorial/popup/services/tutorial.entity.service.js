/**
 * @fileoverview TutorialEntity 에 필요한 정보를 담는 저장소
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TutorialEntity', TutorialEntity);

  /* @ngInject */
  function TutorialEntity() {
    var that = this;
    var _data = {};
    var _defaultData = {
      type: 'channels',
      name: '*Notice Board*',
      isStarred: false,
      memberCount: 1
    };

    this.restore = restore;
    this.get = get;
    this.set = set;

    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      _data = _.clone(_defaultData);
    }


    /**
     * 값을 초기화 한다.
     * @param {...string} keys - reset 할 대상 키
     * @returns {TutorialEntity}
     */
    function restore(keys) {
      if (arguments.length) {
        _.forEach(arguments, function(key) {
          _data[key] = _defaultData[key];
        });
      } else {
        //참조를 끊지 않기 위해 루프를 돌며 프로퍼티를 초기화 한다.
        _.each(_data, function(value, key) {
          _data[key] = _defaultData[key];
        });
      }
      return that;
    }

    /**
     *
     * @param key
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
     * @returns {TutorialEntity}
     */
    function set(key, value) {
      if (_.isObject(key)) {
        _.each(key, function(value, property) {
          set(property, value);
        });
      } else if (_.isString(key) && !_.isUndefined(_data[key])) {
        _data[key] = value;
      }
      return that;
    }
  }
})();
