/**
 * @fileoverview quick launcher modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('notificationAudioMenu', notificationAudioMenu);

  function notificationAudioMenu() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        list: '=',
        value: '=',
        onSelectCallback: '&onSelect'
      },
      link: link,
      templateUrl: 'app/modal/settings/notification/setting.notification.audio.html'
    };

    function link(scope) {

      _init();

      function _init() {
        _setSelectItem(_.findIndex(scope.list, {'value': scope.value}));

        scope.onSelectItem = onSelectItem;
        scope.onSelectActive = onSelectActive;
        scope.isActive = isActive;
      }


      function onSelectItem(index) {
        _setSelectItem(index);
        scope.onSelectCallback({
          $index: index
        })
      }

      function onSelectActive(index) {
        scope.activeIndex = index;
      }

      function isActive(index) {
        return scope.activeIndex === index;
      }

      function _setSelectItem(index) {
        var item;
        if (item = scope.list[index]) {
          scope.selectedItemText = item.text;
        }
      }
    }
  }
})();
