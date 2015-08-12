(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('invitationService', invitationService);

  /* @ngInject */
  function invitationService(analyticsService, jndKeyCode) {
    var rEmail = new RegExp(
      '[a-zA-Z0-9\\+\\.\\_\\%\\-\\+]{1,256}'+
      '\\@' +
      '[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}' +
      '(' +
      '\\.' +
      '[a-zA-Z0-9][a-zA-Z0-9\\-]{0,25}' +
      ')+'
    );
    var EMPTY_VALUE = 'undefined';

    var Invitation = {
      init: function(ele, options) {
        this.ele = ele;
        this.emailMap = {};
        this.length = 0;

        this.options = {
          inviteFn: undefined,                                               // required, invite method
          type: 'Email',
          templateItem: '<input type="text">',
          templateCheck: '<i class="fa fa-check-circle" style="position: absolute; top: 8px; right: 10px; font-size: 16px; color: #00b7ff;"></i>',
          templateTime: '<i class="fa fa-times-circle" style="position: absolute; top: 8px; right: 10px; font-size: 16px; color: #ff8110;"></i>',
          defaultLength: 3,
          checkIcon: true,
          onInvalidFormat: function() {},
          onValidFormat: function() {},
          onSuccess: function() {},
          onDuplicate: function() {},
          onBeforeSend: function() {},
          onAfterSend: function() {}
        };
        angular.extend(this.options, options);

        this._on();

        if (this.options.defaultLength > 0) {
          for (var i = 0, len = this.options.defaultLength; i < len; ++i) {
            this.add();
          }
        }

        return this;
      },
      send: function(obj) {
        var that = this;
        var options = that.options;
        var emailMap = that.emailMap;
        var list = [];
        var successCnt = 0;
        var totalCnt = 0;
        var invite;
        var e;

        if (invite = options.inviteFn) {
          if(options.onBeforeSend(obj) === false) {
            return;
          }

          for (e in emailMap) {
            if (e !== EMPTY_VALUE) {
              list.push(e);
              ++totalCnt;
            }
          }

          return invite(list)
            .success(function(response) {
              _.forEach(response, function(value) {
                var email = value.email;
                var fn;
                var icon;
                var ele;
                var i, len;

                if (value.success) {
                  ++successCnt;
                  fn = options.onSuccess;
                  icon = options.templateCheck;
                } else if (value.code != 40004) {
                  // client의 email 식별식이랑 server의 email 식별식이 상이하여 code로 구분

                  fn = options.onDuplicate;
                  icon = options.templateTime;
                } else {
                  icon = options.templateTime;
                }

                for (i = 0, len = emailMap[email].length; i < len; ++i) {
                  ele = $(emailMap[email][i]);
                  if (options.checkIcon) {
                    ele.parent().append($(icon)).children('i:not(:last-child)').remove();
                  }
                  fn && fn(ele);
                }
              });

              // analytics
              if (successCnt > 0) {
                analyticsService.mixpanelTrack( "User Invite", { "count": successCnt } );
                analyticsService.mixpanelPeople( "increment", { "key": "invite", "value": successCnt } );
              }
            })
            .error(function(error) {
              console.error(error.code, error.msg);
            })
            .finally(function() {
              that.ele.find('input').attr({readOnly: true, placeholder: ''});
              options.onAfterSend(that.ele, successCnt, totalCnt);
            });
        }
      },
      _on: function() {
        var that = this;
        var prevValue;

        that.ele
          .on('keydown', 'input', function(event) {
            var target = this;
            if (jndKeyCode.match('ENTER', event.which)) {
              event.preventDefault();

              that._checkValue(this, prevValue, function() {
                var $ele = $(target).parent().next();
                if (target.value !== '' && $ele.length) {
                  $ele.children().focus();
                }
              });

              prevValue = this.value || EMPTY_VALUE;
            }
          })
          .on('focus', 'input', function() {
            prevValue = this.value || EMPTY_VALUE;
          })
          .on('blur', 'input', function() {
            that._checkValue(this, prevValue);
          });
      },
      _checkValue: function(ele, prevValue, fn) {
        var that = this;
        var $ele = $(ele);
        var value = ele.value || EMPTY_VALUE;

        that._removeMapItem(prevValue, ele);
        if (!rEmail.test(value) && ele.value !== '') {
          that.options.onInvalidFormat($ele);
        } else {
          that._addMapItem(value, ele);
          that.options.onValidFormat($ele, ele.value);

          fn && fn();
        }
      },
      add: function() {
        var that = this;
        var ele;

        that.length++;

        ele = $(that.options.templateItem).appendTo(that.ele);
        that._addMapItem(ele.val() || EMPTY_VALUE, ele.children('input')[0]);
      },
      _addMapItem: function(value, ele) {
        var that = this;

        value = value.toLowerCase();

        that.emailMap[value] = that.emailMap[value] || [];
        that.emailMap[value].push(ele);
      },
      _removeMapItem: function(value, ele) {
        var that = this;
        var map;

        if (map = that.emailMap[value]) {
          map.splice(map.indexOf(ele), 1);
          map.length === 0 && delete that.emailMap[value];
        }
      },
      getEmptyInputBox: function() {
        var that = this;

        return that.emailMap[EMPTY_VALUE] || [];
      }
    };

    return Invitation;
  }
}());
