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
    }
});

function fakeNgModel(initValue) {
    return {
        $setViewValue: function(value) {
            this.$viewValue = value;
        },
        $viewValue: initValue
    };
}

app.directive('scrollGlue', function(){
    return {
        priority: 1,
        require: ['?ngModel'],
        restrict: 'A',
        link: function(scope, $el, attrs, ctrls) {
            var el = $el[0],
                ngModel = ctrls[0] || fakeNgModel(true);

            function scrollToBottom() {
                el.scrollTop = el.scrollHeight;
            }

            function shouldActivateAutoScroll() {
                // + 1 catches off by one errors in chrome
                return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
            }

            scope.$watch(function() {
                if (ngModel.$viewValue) {
                    scrollToBottom();
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

app.directive('whenScrolled', ['$timeout', function($timeout) {
    return function(scope, elm, attr) {
        var raw = elm[0];

        elm.bind('scroll', function(event) {
            if (raw.scrollTop <= 100 && !scope.msgLoadStatus.isFirst) {
                scope.loadMore();
                return;
            }
        });
    };
}]);

app.directive('lastDetector', ['$timeout', function($timeout) {
    //  Length of list currently iterating. ('msgs' in template).
    var length = 0;

    //  Total number of rendered messages.
    //  Gets reset to zero after list is fully iterated.
    var numberOfRenderedMsg = 0;

    var messageScrollTo = null;

    //  Increment newMsgCounter if sets to 'true'.
    var flag = false;

    //  Counts number of new messages.
    var newMsgCounter = 0;

    return function (scope, element, attrs) {

        length = attrs.length;

        scope.$watch('$first', function(isFirst) {
            if (isFirst) flag = true;
        });

        scope.$watch('$index', function(index) {

            //  New messages are rendered once old messages in same list are rendered first.
            if (flag) { newMsgCounter++; }

            //  Always increment rendered counts.
            numberOfRenderedMsg++;

            //  Done iterating current list('msgs')
            if (numberOfRenderedMsg == length) {
                //  Just to make sure.  But doesn't really have much effect.
                flag = false;

                //  Remembering message element so that update can come back to proper message element.
                //  If it's initial loading(loadMoreCounter == 1), I don't care.
                if (messageScrollTo == null && scope.loadMoreCounter != 1) {
                    messageScrollTo = angular.element(element[0]);
                }

                //  Setting back to zero for next iteration.
                numberOfRenderedMsg = 0;
            }

            //  Rendered all new messages.
            //  Time to update scroll.
            if (newMsgCounter == scope.messageUpdateCount) {
                newMsgCounter = 0;

                //  If it's initial loading, don't update scroll.
                if (scope.loadMoreCounter == 1) { return; }

                //  If it's not initial loading, update scroll.
                scope.updateScroll(messageScrollTo);

                //  once scroll has been updated, reset 'messageScrollTo'.
                messageScrollTo = null;
            }
        });
    };
}]);

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


app.directive('infiniteScrollBottom', function() {
    return function(scope, element, attr) {

        var fileList    = $('.file-list');
        var rpanelBody = $('.rpanel-body');

        element.bind('mousewheel', function(event) {

            if (scope.isScrollLoading) return;

            if (fileList.height() <= rpanelBody.height()) {
                scope.loadMore();
            }
        });

        element.bind('scroll', function(event) {
            if (scope.isScrollLoading) return;

            var currentScrollPosition = element.scrollTop() + element.height();
            var elementHeight = $('.file-list').height();

            if (currentScrollPosition > elementHeight ) {
                scope.loadMore();
            }

        });
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

                var hasEnoughLength, hasLowerLetter, hasUpperLetter, hasNumber, hasSpecialCharacter, hasSpace;

                hasSpace = (viewValue && /\s/.test(viewValue)) ? true : false;

                hasEnoughLength = (viewValue && viewValue.length >= 8 && !/\s/.test(viewValue) ? true : false);
                hasLowerLetter = (viewValue && /[a-z]/.test(viewValue)) ? true : false;
                hasUpperLetter = (viewValue && /[A-Z]/.test(viewValue)) ? true : false;
                hasNumber = (viewValue && /\d/.test(viewValue)) ? true : false;
                hasSpecialCharacter = (viewValue && /[~!@#$%^&*()_+]/.test(viewValue)) ? true : false;

                var level = 0;

                if (hasEnoughLength) {
                    if (hasLowerLetter)         level++;
                    if (hasUpperLetter)         level++;
                    if (hasNumber)              level++;
                    if (hasSpecialCharacter)    level++;
                }

                ctrl.passwordHasSpace = hasSpace;
                ctrl.passwordStrengthLevel = level;
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
                var temp = this.value.toLowerCase();
                this.value = temp;
                var checkValue = temp.trim();
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