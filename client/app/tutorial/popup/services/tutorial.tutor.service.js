(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TutorialTutor', TutorialTutor);

  /* @ngInject */
  function TutorialTutor() {
    var _data = {};
    var _defaultData = {
      top: 200,
      left: 300,
      hasSkip: false,
      title: 'Welcome start',
      content: 'welcome to jandi'
    };

    this.reset = reset;
    this.get = get;
    this.set = set;

    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      reset();
    }


    /**
     * 값을 초기화 한다.
     */
    function reset() {
      //참조를 끊지 않기 위해 루프를 돌며 프로퍼티를 초기화 한다.
      _.each(_data, function(value, key) {
        _data.key = null;
        delete _data.key;
      });
      _.extend(_data, _defaultData);
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
     * @param {string|number} value
     */
    function set(key, value) {
      if (_.isObject(key)) {
        _.each(key, function(value, property) {
          set(property, value);
        });
      } else if (_.isString(key) && !_.isUndefined(_data[key])) {
        _data[key] = value;
      }
    }
  }
})();
