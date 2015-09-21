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

      function _init() {
        _attachEvents();
        jndPubSub.updateBadgePosition();
      }

      function _attachEvents() {
        scope.$on('topic-update-lock', _onLock);
        scope.$on('topic-folder:update', _onFolderUpdate);
      }

      function _onFolderUpdate(angularEvent, folderData) {
        if (!_isLocked) {
          _updateFolderData(folderData);
        } else {
          _hasToUpdate = true;
        }
      }
      function _onLock(angularEvent, isLocked) {
        _isLocked = isLocked;
        if (!_isLocked && _hasToUpdate) {
          _updateFolderData(TopicFolderModel.getFolderData());
        }
      }

      function _updateFolderData(folderData) {
        _hasToUpdate = false;
        JndUtil.safeApply(scope, function() {
          scope.folderData = folderData;
        });
      }
    }
  }
})();