/**
 * @fileoverview Zoom 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndZoom', JndZoom);

  function JndZoom(jndPubSub, JndLocalStorage, HybridAppHelper) {
    var _currentZoomScale = 1;
    var MAX_ZOOM_SCALE = 1.30;
    var MIN_ZOOM_SCALE = 0.70;

    this.isZoomEnable = isZoomEnable;
    this.zoom = zoom;
    this.zoomIn = zoomIn;
    this.zoomOut = zoomOut;
    this.zoomReset = zoomReset;
    this.loadZoom = loadZoom;

    /**
     * zoom scale 변경
     * @param {number} scale
     */
    function zoom(scale) {
      _currentZoomScale = scale;
      _zoom();
    }

    /**
     * zoom 이 가능한지 여부를 반환한다.
     * @returns {*}
     */
    function isZoomEnable() {
      return HybridAppHelper.isHybridApp();
    }

    /**
     * _currentZoomScale 값으로 zoom 을 설정한다
     * @param {boolean} [isPreventEvent=false] 이벤트 트리거를 수행할 지 여부
     * @private
     */
    function _zoom(isPreventEvent) {
      if (isZoomEnable()) {
        _currentZoomScale = _.isNumber(_currentZoomScale) ? _currentZoomScale : 1;
        if (_currentZoomScale < MIN_ZOOM_SCALE) {
          _currentZoomScale = MIN_ZOOM_SCALE;
        } else if (_currentZoomScale > MAX_ZOOM_SCALE) {
          _currentZoomScale = MAX_ZOOM_SCALE;
        } else {
          JndLocalStorage.set(0, 'zoom', _currentZoomScale);
          $('body').css({
            'zoom': _currentZoomScale
          });
          if (!isPreventEvent) {
            jndPubSub.pub('JndZoom:zoom', _currentZoomScale);
          }
        }
      }
    }

    /**
     * local storage 에 저장되어 있는 값으로 zoom 을 설정한다.
     * @private
     */
    function loadZoom() {
      _currentZoomScale = JndLocalStorage.get(0, 'zoom') || 1;
      _currentZoomScale = parseFloat(_currentZoomScale) || 1;
      _zoom(true);
    }

    /**
     * zoom in
     */
    function zoomIn() {
      _currentZoomScale += 0.01;
      _currentZoomScale = Math.round(_currentZoomScale * 100) / 100;
      if (_currentZoomScale > MAX_ZOOM_SCALE) {
        _currentZoomScale = MAX_ZOOM_SCALE;
      } else {
        zoom(_currentZoomScale);
      }
    }

    /**
     * zoom out
     * @private
     */
    function zoomOut() {
      _currentZoomScale -= 0.01;
      _currentZoomScale = Math.round(_currentZoomScale * 100) / 100;
      if (_currentZoomScale < MIN_ZOOM_SCALE) {
        _currentZoomScale = MIN_ZOOM_SCALE;
      } else {
        _zoom();
      }
    }

    /**
     * zoom 을 초기화 한다
     * @private
     */
    function zoomReset() {
      _currentZoomScale = 1;
      _zoom();
    }
  }
})();
