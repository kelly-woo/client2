/**
 * @fileoverview 패널을 키로 본래의 top attribute 를 value 로 가지고 있는 맵
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('jndMap', jndMap);

  /* @ngInject */
  function jndMap() {
    // 맵
    var panelToTopMap = {};

    return {
      add: addToMap,
      get: getFromMap,
      remove: removeFromMap,
      printMap: printMap
    };

    /**
     * map 에 add 한다.
     * @param panel
     * @param currentTop
     */
    function addToMap(panel, currentTop) {
      panelToTopMap[panel] = currentTop;
    }

    /**
     * 맵에서 get 한다.
     * @param panel
     * @returns {*}
     */
    function getFromMap(panel) {
      return panelToTopMap[panel];
    }

    /**
     * 맵에서 remove 한다.
     * @param panel
     */
    function removeFromMap(panel) {
      delete panelToTopMap[panel];
    }

    /**
     * 맵을 프린트한다.
     */
    function printMap() {
      console.log(panelToTopMap)
    }
  }
})();