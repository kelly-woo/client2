/**
 * @fileoverview Service that calls functions in pc application through 'jandipc'
 * @author JiHoon Kim <jihoonk@tosslab.com>
 *
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('hybridAppHelper', hybridAppHelper);
  
  /* @ngInject */
  function hybridAppHelper(macAppHelper, pcAppHelper) {
    var that = this;

    _init();

    function _init() {
      var appHelper = false ? pcAppHelper : macAppHelper;

      _.extend(that, appHelper);

      that.init && that.init();
    }
  }
})();
