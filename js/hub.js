(function() {
  var Hub, previousFragment,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  previousFragment = null;

  Hub = (function(_super) {
    __extends(Hub, _super);

    function Hub() {
      return Hub.__super__.constructor.apply(this, arguments);
    }

    Hub.prototype.initialize = function(options) {
      var component, element, elements, routeSpec, _i, _len, _ref;
      routeSpec = '';
      this.components = options.components;
      this.routeParams = {};
      _ref = this.components;
      for (component in _ref) {
        elements = _ref[component];
        routeSpec += "(" + component + "/:" + (elements.join('/:')) + ")(/)";
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          element = elements[_i];
          this.routeParams[element] = component;
        }
      }
      this.route(routeSpec, 'component', this.broadcast);
    };

    Hub.prototype.broadcast = function() {
      var component, elements, index, param, paramName, params, routeParts, target, targetComponent, targetComponents;
      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      routeParts = (function() {
        var _results;
        _results = [];
        for (component in this.routeParams) {
          _results.push(component);
        }
        return _results;
      }).call(this);
      targetComponents = {};
      for (index in params) {
        param = params[index];
        paramName = routeParts[index];
        targetComponent = this.routeParams[paramName];
        target;
        if (param) {
          if (!targetComponents[targetComponent]) {
            target = targetComponents[targetComponent] = {};
          } else {
            target = targetComponents[targetComponent];
          }
          target[paramName] = param;
        }
      }
      for (component in targetComponents) {
        elements = targetComponents[component];
        this.trigger("" + component + "-route-fired", elements);
      }
    };

    return Hub;

  })(Backbone.Router);

  app.Hub = Hub;

}).call(this);

//# sourceMappingURL=hub.js.map
