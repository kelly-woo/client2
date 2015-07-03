(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MessageQuery', MessageQuery);

  /* @ngInject */
  function MessageQuery() {
    var DEFAULT_MESSAGE_UPDATE_COUNT = 50;
    var DEFAULT_MESSAGE_SEARCH_COUNT = 100;

    var _query;
    var _searchLinkId = null;

    this.reset = reset;
    this.get = get;
    this.set = set;
    this.hasSearchLinkId = hasSearchLinkId;
    this.setSearchLinkId = setSearchLinkId;
    this.clearSearchLinkId = clearSearchLinkId;

    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      reset();
    }

    function reset() {
      _query = {};
    }

    /**
     * search query 를 반환한다.
     * @param {string} [key]
     * @returns {{count: number} | string | number}
     */
    function get(key) {
      var query = {
        count: _getCount()
      };

      if (!_.isNull(_searchLinkId)) {
        query.linkId = _searchLinkId;
      } else if (!_.isUndefined(_query.linkId)) {
        query.linkId = _query.linkId;
      }

      if (_query.type) {
        query.type = _query.type;
      }

      if (_.isString(key)) {
        return query[key];
      } else {
        return query;
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
      } else if (_.isString(key)) {
        _query[key] = value;
      }
    }

    function setSearchLinkId(linkId) {
      _searchLinkId = linkId;
    }

    function clearSearchLinkId() {
      _searchLinkId = null;
    }

    /**
     *
     * @returns {boolean}
     */
    function hasSearchLinkId() {
      return !!_searchLinkId;
    }

    function _getCount() {
      return hasSearchLinkId() ? DEFAULT_MESSAGE_SEARCH_COUNT : DEFAULT_MESSAGE_UPDATE_COUNT;
    }

  }
})();
