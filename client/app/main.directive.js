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
        elm.bindWithDelay('scroll', function() {
            console.warn("scroll", raw.scrollTop);
            if (raw.scrollTop <= 100 && !scope.msgLoadStatus.isFirst) {
                var sh = raw.scrollHeight;
                scope.$apply(attr.whenScrolled).then(function() {
                    $timeout(function() {
                        $(raw).animate({scrollTop: raw.scrollHeight - sh + 60}, '200', 'swing', function() {
                        });
                    }, 300);
                    //raw.scrollTop = raw.scrollHeight - sh;
                });
            }
        }, 300);
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
            scope.$watch(attrs.focusMe, function(value) {
                if (value === true) {
                    $timeout(function() {
                        element[0].focus();
                        scope[attrs.focusMe] = false;
                    });
                }
            });
        }
    }
}]);

app.directive('ngEnterJiHoon', function() {
    return function(scope, elm, attr) {
        elm.bind('keydown keypress', function(event) {

            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attr.ngEnterJiHoon);
                });
                event.preventDefault();
            }
        })
    }
});

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
