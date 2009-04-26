JSRouter = function(routes) {
  var router = {};

  var addResources = function(resources, router) {
    for (var i=0; i<resources.length; ++i) {
      var route = resources[i];

      if (route.name && route.path_template) {
        var fn = 'return "';

        var tpl = route.path_template;

        var params = route.params || [];
        var optional_params = route.optional_params || [];

        for (var j=0; j<params.length; ++j) {
          var param = params[j];
          var optional = optional_params.indexOf(param) !== -1;
          var arg, idx;

          if (param == "format") {
            idx = tpl.indexOf("{-prefix|.|format");
            plen = 18;

            arg = '(arguments[' + j + ']||"").substr(1)';
          } else {
            idx = tpl.indexOf("{" + param + "}");
            plen = param.length + 2;

            arg = (optional ? '(' : '') +'arguments[' + j + ']' + (optional ? '||"")' : '');
          }


          var part = tpl.substr(0, idx);


          fn += part + '"+' + arg + '+"';

          tpl = tpl.substr(idx + plen);
        }

        fn += tpl + '";';

        var name = route.name + "_path";
        router[name] = new Function(name, fn);
      }

      if (route.resources) {
        addResources(route.resources, router);
      }
    };
  };

  addResources(routes, router);


  return router;
};

