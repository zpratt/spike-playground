(function(global) {
    'use strict';

    function ns (parentNamespace, nsString, extent) {
        var namespaceParts = nsString.split('.'),
            hlq = 'app',
            parent = parentNamespace,
            i;

        if (namespaceParts[0] === hlq) {
            namespaceParts = namespaceParts.slice(0);
        }

        for (i = 0; i < namespaceParts.length; i += 1) {
            if (parent[namespaceParts[i]] === undefined) {
                if (extent) {
                    parent[namespaceParts[i]] = extent;
                } else {
                    parent[namespaceParts[i]] = {};
                }
            }

            parent = parent[namespaceParts[i]];
        }

        return parent;
    }

    function bindNS (parentNamespace, namespaceString, extent) {
        ns.apply(this, [parentNamespace, namespaceString, extent]);
    }

    global.app = {
        ns: ns,
        bindNS: bindNS
    };

}(this));
