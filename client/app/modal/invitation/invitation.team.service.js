(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('invitationService', invitationService);

  /* @ngInject */
  function invitationService(analyticsService) {
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
              _.forEach(response, function(value, index) {
                var email = value.email;
                var fn;
                var icon;
                var ele;
                var i, len;

                if (value.success) {
                  successCnt += emailMap[email].length;
                  fn = options.onSuccess;
                  icon = options.templateCheck;
                } else {
                  fn = options.onDuplicate;
                  icon = options.templateTime;
                }

                for (i = 0, len = emailMap[email].length; i < len; ++i) {
                  ele = $(emailMap[email][i]);
                  if (options.checkIcon) {
                    ele.parent().append($(icon)).children('i:not(:last-child)').remove();
                  }
                  fn(ele);
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
          .on('focus', 'input', function() {
            prevValue = this.value || EMPTY_VALUE;
          })
          .on('blur', 'input', function() {
            var value = this.value || EMPTY_VALUE;
            var ele;

            that._removeMapItem(prevValue, this);

            ele = $(this);
            if (!rEmail.test(value) && this.value !== '') {
              that.options.onInvalidFormat(ele);
            } else {
              that.options.onValidFormat(ele);
              that._addMapItem(value, $(this));
            }
          });
      },
      add: function() {
        var that = this;
        var ele;

        that.length++;

        ele = $(that.options.templateItem).appendTo(that.ele);
        that._addMapItem(ele.val() || EMPTY_VALUE, ele);
      },
      _addMapItem: function(value, ele) {
        var that = this;

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
      _isEmail: function(value) {
        return rEmail.test(value);
      },
      getEmptyInputBox: function() {
        var that = this;

        return that.emailMap[EMPTY_VALUE];
      }
    };

    return Invitation;
  }
}());
