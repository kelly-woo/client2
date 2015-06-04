'use strict';

var app = angular.module('jandiApp');

app.directive('messageSubmit', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      elem.bind('keydown', function(event) {
        var code = event.keyCode || event.which;
        if (code === 13) {
          if (!event.shiftKey) {
            event.preventDefault();
            scope.$apply(attrs.messageSubmit);
          }
        }
      });
    }
  };
});

var rHTTP = /^[http|https]/i;
app.directive('originalFile', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      var fileUrl = attrs.fileUrl;
      var url = rHTTP.test(fileUrl) ? fileUrl : scope.server_uploaded + fileUrl;

      elem.attr({href: url, target: '_blank'});
    }
  };
});

app.directive('downloadFile', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      var fileUrl = attrs.fileUrl;
      var fileTitle = attrs.fileTitle;

      elem
        .attr(
          rHTTP.test(fileUrl) ?
            {href: fileUrl, target: '_blank'} :
            {href: scope.server_uploaded + 'download/' + fileUrl, download: fileTitle}
        );
    }
  };
});

app.directive('originFile', function() {
  return {
    restrict: 'A',
    link: function(scope, elem) {

    }
  };
});

function fakeNgModel(initValue) {
  return {
    $setViewValue: function(value) {
      this.$viewValue = value;
    },
    $viewValue: initValue
  };
}

app.directive('scrol2lGlue', function(){
  return {
    priority: 1,
    require: ['?ngModel'],
    restrict: 'A',
    link: function(scope, $el, attrs, ctrls) {
      var el = $el[0],
        ngModel = ctrls[0] || fakeNgModel(true);

      function scrollToBottom() {
        console.log(scope.loadMoreCounter)
        //el.scrollTop = el.scrollHeight;
      }

      function shouldActivateAutoScroll() {
        // + 1 catches off by one errors in chrome
        return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
      }

      scope.$watch(function() {
        if (ngModel.$viewValue) {
          if (!scope.isMessageSearchJumping) {
            console.log(scope.isMessageSearchJumping)
            scrollToBottom();

          }
        }
      });

      $el.bind('scroll', function() {
        var activate = shouldActivateAutoScroll();
        if (activate !== ngModel.$viewValue) {
          scope.$apply(ngModel.$setViewValue.bind(ngModel, activate));
        }
      });
    }
  };
});

app.directive('scrollBottomOn', ['$timeout', function($timeout) {
  return function(scope, elm, attr) {
    scope.$watch(attr.scrollBottomOn, function(value) {
      if (value) {
        $timeout(function() {
//                    elm[0].scrollTop = elm[0].scrollHeight;
        });
      }
    });
  }
}]);

app.directive('focusMe', ['$timeout', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.focusMe, function(value, oldValue) {

        if (value) {
          $timeout(function() {
            element[0].focus();
            scope[attrs.focusMe] = false;
          });
        }
      });

      element.bind('blur', function() {
        scope[attrs.focusMe] = false;

      });
    }
  }
}]);

app.directive('onFileInputChanged', function() {
  return {
    restrict: "A",
    link:function (scope, element, attrs) {
      var onChange = element.scope()[attrs.onFileInputChanged];
      element.bind('change', onChange);
    }
  }
});

app.directive('lazy', function($timeout) {
  return {
    restrict: 'C',
    link: function(scope, elem) {
      $timeout(function() {
        $(elem).lazyload({
          effect: 'fadeIn',
          effectspeed: 300,
          'skip_invisible': false
        });
      }, 500);
    }
  };
});




app.directive('rotate', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var displayProperty = element.css('display');

      // hide image while rotating.
      element.css('opacity', '0');
      element.css('display', 'hidden');


      var xhr = new XMLHttpRequest();
      xhr.open('GET', attrs.ngSrc, true);
      xhr.responseType = 'blob';

      xhr.onload = function(e) {
        if (this.status == 200) {

          var temp_blob = this.response;


          var transform_map = [
            "rotate(0deg)",                 // 1: UP
            "rotate(0deg) scaleX(-1)",      // 2: UP + FLIP
            "rotate(180deg)",               // 3: DOWN
            "rotate(180deg) scaleX(-1)",    // 4: DOWN + FLIP
            "rotate(90deg) scaleY(-1)",     // 5: LEFT + FLIP
            "rotate(90deg) ",               // 6: LEFT
            "rotate(-90deg) scaleY(-1)",    // 7: RIGHT + FLIP
            "rotate(-90deg)"                // 8: RIGHT
          ];

          loadImage.parseMetaData(temp_blob, function (data) {
            if (!data.imageHead || !data.exif) {
              element.css('opacity', '1');
              element.css(displayProperty);
              return;
            }


            var orientation = data.exif.get('Orientation');

            var r = transform_map[orientation-1];

            var originalWidth = element[0].width;
            var originalHeight= element[0].height;

            // 세로로 긴 이미지.
            if (originalWidth > originalHeight && orientation >= 4) {

              if (angular.isDefined(attrs.rotateWidth)) {
                originalWidth = attrs.rotateWidth;
                originalHeight = '100%';
              }
              var positionOffset = (originalWidth - originalHeight)/2;

              // img 를 감싸고 있는 div(.image_wrapper)의 값을 변경해준다.
              element.parent().css({
                'height'    : attrs.rotateWidth || originalWidth,
                'width'     : attrs.rotateHeight || originalHeight,
                'position'  : 'relative'
              });

              // img 자체의 css 값을 변경한다.
              element.css({
                'height'    : originalHeight,
                'width'     : originalWidth,
                'position'  : 'absolute',
                'left'      : attrs.rotateLeftAlign == 'true' ? 0-positionOffset : 0,
                'top'       : positionOffset,
                'max-width' : originalWidth
              })
            }

            element.css({
              '-moz-transform': r,
              '-webkit-transform': r,
              '-o-transform': r,
              '-ms-transform': r
            }).attr('data-image-orientation', orientation);


            // restore display attribute.
            element.css('opacity', '1');
            element.css(displayProperty);
          });
        }
      };

      xhr.send();
    }
  }
});


/**
 * checks viewvalue for password and returns strength.
 *
 * 1. MUST BE AT 8+ CHARACTERS.
 * 2. MUST CONTAIN AT LEAST TWO OF BELOW,
 *      a. upper case character
 *      b. lower case character
 *      c. number
 *      d. special character
 * 3. CANNOT CONTAIN 'space' character.
 *
 * If result lever is 2+, then it is a pass.
 */
app.directive('passwordStrength', function($parse) {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function(scope, elem, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {

        if (!viewValue) {
          ctrl.hasEnoughLength        = false;
          ctrl.passwordStrengthLevel  = 0;
          ctrl.isInvalid              = true;
          ctrl.passwordHasSpace       = false;

          return;
        }

        var hasEnoughLength, hasLowerLetter, hasUpperLetter, hasNumber, hasSpecialCharacter, hasSpace;

        hasSpace = /\s/.test(viewValue);
        if (hasSpace) {
          ctrl.isInvalid              = true;
          ctrl.passwordHasSpace       = hasSpace;
          ctrl.passwordStrengthLevel  = 0;
          return;
        }

        hasEnoughLength     = viewValue.length >= 8;
        hasLowerLetter      = /[a-z]/.test(viewValue);
        hasUpperLetter      = /[A-Z]/.test(viewValue);
        hasNumber           = /\d/.test(viewValue);
        hasSpecialCharacter = /[(`~!@#$%^&*()_\-+={}|:;"'<>,.?/)]/.test(viewValue);


        var level = 0;

        if (hasEnoughLength) {
          if (hasLowerLetter)         level++;
          if (hasUpperLetter)         level++;
          if (hasNumber)              level++;
          if (hasSpecialCharacter)    level++;
        }

        ctrl.passwordHasSpace       = hasSpace;
        ctrl.hasEnoughLength        = hasEnoughLength;
        ctrl.passwordStrengthLevel  = level;
        ctrl.isInvalid              = (!hasEnoughLength || level < 2);

        return viewValue;
      });
    }
  };
});

app.directive('onEnter', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('keypress', function(event) {
        if (event.which === 13 || event.which === 13) {
          scope.$apply(function() {
            scope.$eval(attrs.onEnter);
          });
          event.preventDefault();
        }
      })
    }
  }
});


app.directive('teamPrefixDomainChecker', function(teamAPIservice) {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function(scope, elem, attrs, ctrl) {
      elem.bind('keyup', function() {
        var checkValue = this.value.toLowerCase().trim();
        if (!checkValue || ctrl.$error.isValidDomain || checkValue.length < 3) return checkValue;

        teamAPIservice.prefixDomainValidator(checkValue)
          .success(function(response) {
            if (response.isValidate) {
              ctrl.$setValidity('isAvailableDomain', true);
            } else {
              ctrl.$setValidity('isAvailableDomain', false);
            }
          })
          .error(function(err) {
            ctrl.$setValidity('isAvailableDomain', false);
            console.error(err);
          });
        ctrl.$setValidity('isLoading', true);
        return checkValue;
      });

      ctrl.$parsers.unshift(function(viewValue) {
        if (!viewValue || viewValue.length < 3) {
          return viewValue;
        }

        ctrl.$setValidity('isLoading', false);

        if ( viewValue && !/^[1-z0-9-]{3,60}$/.test(viewValue) ) {
          ctrl.$setValidity('isValidDomain', false);
        } else {
          ctrl.$setValidity('isValidDomain', true);
        }

        return viewValue;
      });
    }
  };
});

