/**
 * @fileoverview search type user service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('SearchTypeUser', SearchTypeUser);

  /* @ngInject */
  function SearchTypeUser($filter) {
    var _that = this;
    var _translate = $filter('translate');

    var _filterTypes = [
      {value: 'name', text: _translate('@common-name')},
      {value: 'department', text: _translate('@common-department')},
      {value: 'position', text: _translate('@common-position')},
      {value: 'phone', text: _translate('@common-phone')},
      {value: 'email', text: _translate('@common-email')},
      {value: 'status', text: _translate('@common-status-msg')}
    ];

    var searchPropertyPathMap = {
      name: 'name',
      department: ['u_extraData', 'department'],
      position: ['u_extraData', 'position'],
      phone: ['u_extraData', 'phoneNumber'],
      email: 'u_email',
      status: 'u_statusMessage'
    };

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _that.getFilterTypes = getFilterTypes;
      _that.isName = isName;
      _that.getSearchPropertyPath = getSearchPropertyPath;
    }

    /**
     * filter type들 전달
     * @returns {*[]}
     */
    function getFilterTypes() {
      return _filterTypes;
    }

    /**
     * type이 name인지 여부
     * @param {string} type
     * @returns {boolean}
     */
    function isName(type) {
      return 'name' === type;
    }

    /**
     * 검색에 사용할 property Path 전달
     * @param {string} type
     */
    function getSearchPropertyPath(type) {
      return searchPropertyPathMap[type];
    }
  }
})();
