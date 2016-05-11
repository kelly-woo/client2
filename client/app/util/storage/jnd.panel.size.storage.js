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

      that.getLeftPanelWidth = getLeftPanelWidth;
      that.setLeftPanelWidth = setLeftPanelWidth;

      that.setMiddleKey('panel.size');
    }

    /**
     * get left panel size
     * @returns {number}
     */
    function getLeftPanelWidth() {
      return +that.get('left', 'width');
    }

    /**
     * set left panel size
     * @param {number} panelSize
     */
    function setLeftPanelWidth(panelSize) {
      that.set('left', 'width', panelSize);
    }
  }
})();
