/**
 * @fileoverview Zoom 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndZoom', JndZoom);

  function JndZoom(jndPubSub) {
    this.zoom = zoom;

    /**
     * zoom scale 변경
     * @param {number} scale
     */
    function zoom(scale) {
      jndPubSub.pub('JndZoom:change', scale);
    }
  }
})();
