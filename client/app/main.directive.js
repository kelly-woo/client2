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
                        console.log('setting focus')
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
                        if (!data.imageHead) {
//                            console.warn("imageHead", data);
                            return;
                        }
                        var orientation = data.exif.get('Orientation');
                        var r = transform_map[orientation-1];
                        element.css({
                            '-moz-transform': r,
                            '-webkit-transform': r,
                            '-o-transform': r,
                            '-ms-transform': r
                        }).attr('data-image-orientation', orientation);
                        element.css('display', displayProperty);
                    });
                }
            };
            xhr.send();
        }
    }
});
