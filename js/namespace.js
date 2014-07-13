(function(global) {
    'use strict';

    function ns (parent_ns, ns_string, extent) {
        var ns_parts = ns_string.split('.'),
            hlq = 'app',
            parent = parent_ns,
            i;

        if (ns_parts[0] === hlq) {
            ns_parts = ns_parts.slice(0);
        }

        for (i = 0; i < ns_parts.length; i += 1) {
            if (parent[ns_parts[i]] === undefined) {
                if (extent) {
                    parent[ns_parts[i]] = extent;
                } else {
                    parent[ns_parts[i]] = {};
                }
            }

            parent = parent[ns_parts[i]];
        }

        return parent;
    }

    function bindNS (parent_ns, ns_string, extent) {
        ns.apply(this, [parent_ns, ns_string, extent]);
    }

    global.app = {
        ns: ns,
        bindNS: bindNS
    };

}(this));
