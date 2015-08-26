/**
 * @fileoverview 사용자가 입력한 text를 수정하여 center chat에 출력함.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('template', template);

  function template() {
    return function(template, mapper) {
      return _template(template, mapper);
    };

    /**
     * template 문자열을 치환
     * @param {String} template String
     * @param {Object} mapper
     * @return {String}
     * @example
     */
    function _template(template, mapper) {
      template = _.isString(template) ? template : '';
      var replaced = template.replace(/{{(.+?)}}/g, function(matchedString, name) {
        var keys = _.trim(name).split('.');
        var value = _getValue(mapper, keys);
        return _.isUndefined(value) ? '' : value.toString();
      });
      return replaced;
    }

    /**
     * mapper 로부터 target object 를 반환한다.
     * @param mapper
     * @param keys
     * @returns {*}
     * @private
     */
    function _getValue(mapper, keys) {
      var i = 0;
      var length = keys.length;
      var key;
      var target = mapper;
      if (target) {
        for (; i < length; i++) {
          key = keys[i];
          target = target[key];
          if (_.isUndefined(target)) {
            return;
          }
        }
      }
      return target;
    }
  }
})();
