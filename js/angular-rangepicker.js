(function() {
  var picker;

  picker = angular.module('rangepicker', []);

  picker.constant('rangepickerConfig', {
    clearLabel: 'Clear',
    locale: {
      separator: ' - '
    }
  });

  picker.directive('rangePicker', ['$compile', '$timeout', '$parse', 'rangepickerConfig', function($compile, $timeout, $parse, rangepickerConfig) {
    return {
      require: 'ngModel',
      restrict: 'A',
      scope: {
        min: '=',
        max: '=',
        model: '=ngModel',
        opts: '=options',
        clearable: '='
      },
      link: function($scope, element, attrs, modelCtrl) {
        var _clear, _init, _initBoundaryField, _mergeOpts, _picker, _setRangePoint, _setEndRange, _setStartRange, _validate, _validateMax, _validateMin, customOpts, el, opts;
        _mergeOpts = function() {
          var extend, localeExtend;
          localeExtend = angular.extend.apply(angular, Array.prototype.slice.call(arguments).map(function(opt) {
            return opt != null ? opt.locale : void 0;
          }).filter(function(opt) {
            return !!opt;
          }));
          extend = angular.extend.apply(angular, arguments);
          extend.locale = localeExtend;
          return extend;
        };
        el = $(element);
        customOpts = $scope.opts;
        opts = _mergeOpts({}, rangepickerConfig, customOpts);
        _picker = null;
        _clear = function() {
          ////console.log("clear");
          _picker.setStartRange();
          _picker.setEndRange();
          _picker.container.find('input[name=rangepicker_start]').val('');
          _picker.container.find('input[name=rangepicker_end]').val('');
        };

        _setRangePoint = function(setter) {
          return function(newValue) {
            if (_picker && newValue) {
              var aux = newValue.replace(/[,.]/g, function (m) {
                return m === ',' ? '.' : ',';
              });
              return setter(aux);
            }
          };
        };
        _setStartRange = _setRangePoint(function(m) {
          ////console.log("setstart %o", m);
          // if (_picker.endRange < m) {
          //   _picker.setEndRange(m);
          // }
          opts.startRange = m;
          return _picker.setStartRange(m);
        });
        _setEndRange = _setRangePoint(function(m) {
          //console.log("setend %o", m);
          // if (_picker.startRange > m) {
          //   _picker.setStartRange(m);
          // }
          opts.endRange = m;
          return _picker.setEndRange(m);
        });
        _validate = function(validator) {
          return function(boundary, actual) {
            if (boundary && actual) {
              return validator(boundary, actual);
            } else {
              return true;
            }
          };
        };
        _validateMin = _validate(function(min, start) {
          return min < start;
        });
        _validateMax = _validate(function(max, end) {
          return max > end;
        });
        modelCtrl.$formatters.push(function(objValue) {
          var f, faux;
          //console.log("formatterss %o", objValue);
          faux = function(value) {
            var aux = value.replace(/[,.]/g, function (m) {
                return m === ',' ? '.' : ',';
            });
            return aux;
          };

          f = function(value) {
            if (isNaN(parseFloat(faux(value)))) {
              return '';
            } else {
              if (value && value.length > 4 && value.indexOf('.') < 0) {
                value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
              } 
              return value;
            }
          };

          if (objValue.startRange && objValue.endRange) {
            return [f(objValue.startRange), f(objValue.endRange)].join(opts.locale.separator);
          } else {
            return '';
          }
        });
        modelCtrl.$render = function() {
          if (modelCtrl.$modelValue && modelCtrl.$modelValue.startRange) {
            _setStartRange(modelCtrl.$modelValue.startRange);
            _setEndRange(modelCtrl.$modelValue.endRange);
          } else {
            _clear();
          }
          return el.val(modelCtrl.$viewValue);
        };
        modelCtrl.$parsers.push(function(val) {
          var objValue, x, f;
          objValue = {
            startRange: null,
            endRange: null
          };
          f = function(value) {
            var aux = value.replace(/[,.]/g, function (m) {
                return m === ',' ? '.' : ',';
            });
            return aux;
          };
          //console.log("parser %o", val);
          if (angular.isString(val) && val.length > 0) {
              x = val.split(opts.locale.separator).map(f);
              objValue.startRange = x[0];
              objValue.endRange = x[1];
          }
          return objValue;
        });
        modelCtrl.$isEmpty = function(val) {
          return !(angular.isString(val) && val.length > 0);
        };
        _init = function() {
          var eventType, results;
          el.rangepicker(angular.extend(opts, {
            autoUpdateInput: false
          }), function(start, end) {
            return $scope.$apply(function() {
              return $scope.model =  {
                startRange: start,
                endRange: end
              };
            });
          });

          _picker = el.data('rangepicker');
          results = [];
          for (eventType in opts.eventHandlers) {
            results.push(el.on(eventType, function(e) {
              var eventName;
              eventName = e.type + '.' + e.namespace;
              return $scope.$evalAsync(opts.eventHandlers[eventName]);
            }));
          }
          return results;
        };
        _init();
        $scope.$watch('model.startRange', function(n) {
          return _setStartRange(n);
        });
        $scope.$watch('model.endRange', function(n) {
          return _setEndRange(n);
        });
        _initBoundaryField = function(field, validator, modelField, optName) {
          if (attrs[field]) {
            modelCtrl.$validators[field] = function(value) {
              return value && validator(opts[optName], value[modelField]);
            };
            return $scope.$watch(field, function(number) {
              //console.log("field %o", number);
              opts[optName] = number;//date ? moment(date) : false;
              return _init();
            });
          }
        };
        _initBoundaryField('min', _validateMin, 'startRange', 'minRange');
        _initBoundaryField('max', _validateMax, 'endRange', 'maxRange');
        if (attrs.options) {
          $scope.$watch('opts', function(newOpts) {
            opts = _mergeOpts(opts, newOpts);
            return _init();
          }, true);
        }
        if (attrs.clearable) {
          $scope.$watch('clearable', function(newClearable) {
            if (newClearable) {
              opts = _mergeOpts(opts, {
                locale: {
                  cancelLabel: opts.clearLabel
                }
              });
            }
            _init();
            if (newClearable) {
              return el.on('cancel.rangepicker', function() {
                return $scope.$apply(function() {
                  return $scope.model = {
                    startRange: null,
                    endRange: null
                  };
                });
              });
            }
          });
        }
        return $scope.$on('$destroy', function() {
          return _picker != null ? _picker.remove() : void 0;
        });
      }
    };
  }]);

}).call(this);
