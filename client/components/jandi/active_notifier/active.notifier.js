/**
 * @fileoverview 현재 app이 active 상태인지 아닌지 판단하고 알려주는 module
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandi.active.notifier', [])
    .config(config)
    .run(run);

  function config() {

  }

  /* @ngInject */
  function run(ActiveNotifier) {
    ActiveNotifier.init();
  }
})();
