/* global Hogan */
var dist = (function() {
  
var t = {
  /* jshint ignore:start */
  'vanillaOverlay' : new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"map-flag\">");t.b("\n" + i);t.b("    <section>");t.b("\n" + i);t.b("        <h3>");t.b(t.v(t.f("name",c,p,0)));t.b("</h3>");t.b("\n" + i);t.b("        <ul class=\"flag-details\">");t.b("\n" + i);t.b("            <li>");t.b(t.v(t.f("start",c,p,0)));t.b("</li>");t.b("\n" + i);t.b("            <li>");t.b(t.v(t.f("percent_done",c,p,0)));t.b("</li>");t.b("\n" + i);t.b("        </ul>");t.b("\n" + i);t.b("    </section>");t.b("\n" + i);t.b("</div>");t.b("\n");return t.fl(); },partials: {}, subs: {  }})
  /* jshint ignore:end */
},
r = function(n) {
  var tn = t[n];
  return function(c, p, i) {
    return tn.render(c, p || t, i);
  };
};
return {
  'vanillaOverlay' : r('vanillaOverlay')
};
})();