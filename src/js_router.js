JSRouter = function(routes) {
  var router = {
    defaults: {},

    debug: function() {
      for (var name in Router) {
        console.info(Router[name].toString());
      }
    },

    setDefaults: function(opts) {
      this.defaults = opts;
    }
  };

  var addResources = function(resources, router) {
    for (var i=0; i<resources.length; ++i) {
      var route = resources[i];

      if (route.name && route.path_template) {
        var fn = 'return "';

        var tpl = route.path_template;

        var arg_params = [];
        var params = route.params || [];
        var optional_params = route.optional_params || [];

        for (var j=0; j<params.length; ++j) {
          var param = params[j];
          var optional = optional_params.indexOf(param) !== -1;
          var arg, idx;
          var val = '(args.' + param + ' || defaults.' + param + ')';

          if (param == "format") {
            idx = tpl.indexOf("{-prefix|.|format}");
            plen = 18;

            arg = '(' + val + '?"."+' + val + ':"")';
          } else {
            idx = tpl.indexOf("{" + param + "}");
            plen = param.length + 2;

            arg = (optional ? '(' : '') + val + (optional ? '||"")' : '');
          }

          arg_params.push(param + ': arguments[' + j + ']');
          var part = tpl.substr(0, idx);


          fn += part + '"+' + arg + '+"';

          tpl = tpl.substr(idx + plen);
        }

        var hdr = 'var args;' +
                  'var defaults = this.defaults;' +
                  'var get = "";' +
                  'if (arguments.length > 1 && typeof arguments[arguments.length-1] == "object") {' +
                  '  var params = arguments[arguments.length-1];' +
                  '  var a = [];' +
                  '  for (var name in params) {' +
                  '    a.push(name + "=" + escape(params[name]));' +
                  '  }' +
                  '  get = "?" + a.join("&");' +
                  '  delete arguments[arguments.length-1];' +
                  '}' +
                  'if (typeof arguments[0] == "object") {' +
                  '  args = arguments[0];' +
                  '} else {' +
                  '  args = {' + arg_params.join(',') + '}' +
                  '}';

        fn += tpl + '"+get;';

        var name = route.name + "_path";
        router[name] = new Function(hdr + fn);
      }

      if (route.resources) {
        addResources(route.resources, router);
      }
    };
  };

  addResources(routes, router);


  return router;
};

