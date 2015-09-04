(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topics', topics);

  function topics($timeout, jndPubSub, TopicFolderModel) {
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
      scope.createTopicFolder = createTopicFolder;
      scope.folderData = TopicFolderModel.getFolderData();
      scope.$on('topic-update-lock', _onLock);
      scope.$on('topic-folder:update', function(e, folderData) {
        if (!_isLocked) {
          _updateFolderData(folderData);
        }
      });

      function _onLock(angularEvent, isLocked) {
        _isLocked = isLocked;
        if (!_isLocked) {
          _updateFolderData(TopicFolderModel.getFolderData());
        }
      }

      function _updateFolderData(folderData) {
        _safeApply(function() {
          scope.folderData = folderData;
        });
      }
      function createTopicFolder(clickEvent) {
        clickEvent.stopPropagation();
        TopicFolderModel.create(true);
      }

      function _safeApply(fn) {
        if (scope.$$phase !== '$apply' && scope.$$phase !== '$digest') {
          scope.$apply(fn);
        } else {
          fn();
        }
      }
    }


  }
})();