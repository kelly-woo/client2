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

    _init();

    function _init() {
      _that.getFilterTypes = getFilterTypes;
    }

    /**
     * filter type들 전달
     * @returns {*[]}
     */
    function getFilterTypes() {
      return _filterTypes;
    }
  }
})();
