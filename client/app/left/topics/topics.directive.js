/**
 * @fileoverview 토픽 리스트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topics', topics);

  function topics(jndPubSub, JndUtil, TopicFolderModel) {
    return {
      restrict: 'EA',
      scope: false,
      controller: 'topicsCtrl',
      link: link,
      transclude: true,
      replace: true,
      templateUrl: 'app/left/topics/topics.html'
    };

    function link(scope, el, attrs) {
      var _isLocked = false;
      var _hasToUpdate = false;
      scope.folderData = TopicFolderModel.getFolderData();

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        _attachEvents();
        jndPubSub.updateBadgePosition();
        _setButtonDisplayStatus();
      }

      /**
       * 이벤트 핸들러 바인딩
       * @private
       */
      function _attachEvents() {
        scope.$on('topic-update-lock', _onLock);
        scope.$on('topic-folder:update', _onFolderUpdate);
        scope.$on('updateBadgePosition', _setButtonDisplayStatus);

        el.find('.lpanel-list__header').on('mouseover', _onMouseOverHeader)
          .on('mouseout', _onMouseOutHeader);
      }

      /**
       * header 에서 mouse over 시 뱃지를 감춘다
       * @private
       */
      function _onMouseOverHeader() {
        var jqBadge = el.find('.left-header-badge');
        jqBadge.addClass('hide');
        _setButtonDisplayStatus();
      }

      /**
       * header 에서 mouse out 시 뱃지를 노출한다
       * @private
       */
      function _onMouseOutHeader() {
        var jqBadge = el.find('.left-header-badge');
        jqBadge.removeClass('hide');
        _setButtonDisplayStatus();
      }

      /**
       * 뱃지에 따라 display status 를 변경한다
       * @private
       */
      function _setButtonDisplayStatus() {
        var jqBadge = el.find('.left-header-badge');
        var jqOptionBtn = el.find('.lpanel-list-option');
        if (jqBadge.css('display') === 'none' || !jqBadge.find('span').length) {
          jqOptionBtn.css('display', 'block');
        } else {
          jqOptionBtn.css('display', 'none');
        }
      }

      /**
       * 폴더 업데이트 이벤트 발생시 핸들러
       * @param {object} angularEvent
       * @param {object} folderData
       * @private
       */
      function _onFolderUpdate(angularEvent, folderData) {
        if (!_isLocked) {
          _updateFolderData(folderData);
        } else {
          _hasToUpdate = true;
        }
      }

      /**
       * lock 변경 이벤트 발생시 이벤트 핸들러
       * @param {object} angularEvent
       * @param {boolean} isLocked
       * @private
       */
      function _onLock(angularEvent, isLocked) {
        _isLocked = isLocked;
        if (!_isLocked && _hasToUpdate) {
          _updateFolderData(TopicFolderModel.getFolderData());
        }
      }

      /**
       * 폴더 데이터를 업데이트 한다.
       * @param {object} folderData
       * @private
       */
      function _updateFolderData(folderData) {
        _hasToUpdate = false;
        JndUtil.safeApply(scope, function() {
          scope.folderData = folderData;
        });
      }
    }
  }
})();