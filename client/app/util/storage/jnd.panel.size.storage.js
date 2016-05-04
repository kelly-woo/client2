/**
 * @fileoverview local storage에 Panel Size를 관리하는 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndPanelSizeStorage', JndPanelSizeStorage);

  /* @ngInject */
  function JndPanelSizeStorage(JndLocalStorage) {
    var that = this;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _.extend(JndPanelSizeStorage.prototype, JndLocalStorage);

      that.getLeftPanelSize = getLeftPanelSize;
      that.setLeftPanelSize = setLeftPanelSize;

      that.setMiddleKey('panel.size');
    }

    /**
     * get left panel size
     * @returns {number}
     */
    function getLeftPanelSize() {
      return +that.get('left', 'width');
    }

    /**
     * set left panel size
     * @param {number} panelSize
     */
    function setLeftPanelSize(panelSize) {
      that.set('left', 'width', panelSize);
    }
  }
})();
