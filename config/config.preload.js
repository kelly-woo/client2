/**
 * @fileoverview preload 할 image 를 모아놓은 PRELOAD_LIST 상수. build 시 생성 됨
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  /**
   * preload constant
   */
  angular
    .module('jandi.config')
    .constant('PRELOAD_LIST', '@@config.preload');

})();

