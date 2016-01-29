/**
 * @fileoverview quick launcher modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('notificationAudioMenu', notificationAudioMenu);

  function notificationAudioMenu(DesktopNotificationUtil) {
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
      var notificationAudio = DesktopNotificationUtil.getNotificationAudio();

      _init();

      function _init() {
        _setSelectItem(_.findIndex(scope.list, {'value': scope.value}));

        scope.isActive = isActive;

        scope.onSelectItem = onSelectItem;
        scope.onSelectActive = onSelectActive;
        scope.onSoundClick = onSoundClick;
      }

      function isActive(index) {
        return scope.activeIndex === index;
      }

      function onSelectItem(index) {
        _setSelectItem(index);
        _playSound(index);

        scope.onSelectCallback({
          $index: index
        })
      }

      function onSelectActive(index) {
        scope.activeIndex = index;
      }

      function onSoundClick(event) {
        event.stopPropagation();
      }

      function _setSelectItem(index) {
        var item;
        if (item = scope.list[index]) {
          scope.selectedItemText = item.text;
        }
      }

      function _playSound(index) {
        var item;
        if (item = scope.list[index]) {
          notificationAudio.play(item.value);
        }
      }
    }
  }
})();
