/**
 * @fileoverview topic을 생성하는 controller
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('ModalShortcutCtrl', ModalShortcutCtrl);

  /* @ngInject */
  function ModalShortcutCtrl($scope, $filter, HybridAppHelper, modalHelper) {
    var MAX_ROW = 12;
    var CTRL = $filter('ctrlKey')();
    var DATA = [
      {
        l10n: '@shortcut-open-shortcut',
        keys: [
          [CTRL, '/']
        ]
      },
      {
        l10n: '@shortcut-switch-teams',
        keys: [
          ['Alt', 'T']
        ]
      },
      {
        l10n: '@shortcut-rpanel-prev',
        keys: [
          ['Alt', ',']
        ]
      },
      {
        l10n: '@shortcut-rpanel-next',
        keys: [
          ['Alt', '.']
        ]
      },
      {
        l10n: '@shortcut-upload',
        keys: [
          [CTRL, 'U']
        ]
      },
      {
        l10n: '@shortcut-rpanel-file',
        keys: [
          ['Alt', '1'],
          ['Alt', 'F']
        ]
      },
      {
        l10n: '@shortcut-rpanel-message',
        keys: [
          ['Alt', '2'],
          ['Alt', 'G']
        ]
      },
      {
        l10n: '@shortcut-rpanel-stars',
        keys: [
          ['Alt', '3'],
          ['Alt', 'S']
        ]
      },
      {
        l10n: '@shortcut-rpanel-mentions',
        keys: [
          ['Alt', '4'],
          ['Alt', 'M']
        ]
      },
      {
        l10n: '@shortcut-invite-topic',
        keys: [
          [CTRL, 'I']
        ]
      },
      {
        l10n: '@shortcut-scroll-up',
        keys: [
          ['PgUp']
        ]
      },
      {
        l10n: '@shortcut-scroll-down',
        keys: [
          ['PgDn']
        ]
      },
      {
        l10n: '@shortcut-zoom-in',
        keys: [
          [CTRL, '+']
        ],
        condition: HybridAppHelper.isHybridApp
      },
      {
        l10n: '@shortcut-zoom-out',
        keys: [
          [CTRL, '-']
        ],
        condition: HybridAppHelper.isHybridApp
      },
      {
        l10n: '@shortcut-zoom-reset',
        keys: [
          [CTRL, '0']
        ],
        condition: HybridAppHelper.isHybridApp
      },
      {
        l10n: '@shortcut-toggle-rpanel',
        keys: [
          ['Alt', '[']
        ]
      },
      {
        l10n: '@shortcut-show-sticker',
        keys: [
          [CTRL, 'E']
        ]
      },
      {
        l10n: '@shortcut-confirm-modal',
        keys: [
          [CTRL, 'Enter']
        ]
      },
      {
        l10n: '@shortcut-jump',
        keys: [
          [CTRL, 'J']
        ]
      },
      {
        l10n: '@shortcut-focus-input',
        keys: [
          ['Enter']
        ]
      },
      {
        l10n: '@shortcut-lock-screen',
        keys: [
          [CTRL, 'Shift', 'L']
        ]
      }
    ];
    $scope.columnList = [];

    $scope.close = modalHelper.closeModal;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _initializeData();
    }

    /**
     * data 를 initialize 한다.
     * @private
     */
    function _initializeData() {
      var columnIdx = 0;

      _.forEach(DATA, function(row) {
        $scope.columnList[columnIdx] = $scope.columnList[columnIdx] || [];
        if ($scope.columnList[columnIdx].length === MAX_ROW) {
          columnIdx++;
          $scope.columnList[columnIdx] = $scope.columnList[columnIdx] || [];
        }

        if (!_.isFunction(row.condition) || row.condition()) {
          //float right 스타일로 인해 역순으로 정렬한다.
          _.forEach(row.keys, function(combination) {
            combination.reverse();
          });
          row.text = $filter('translate')(row.l10n);
          $scope.columnList[columnIdx].push(row);
        }
      });
    }
  }
})();
