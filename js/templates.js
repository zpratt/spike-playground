/* global Hogan */
var dist = (function() {
  
var t = {
  /* jshint ignore:start */
  'vanillaOverlay' : new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"map-flag\">");t.b("\n" + i);t.b("    <p>");t.b(t.v(t.f("name",c,p,0)));t.b("</p>");t.b("\n" + i);t.b("</div>");t.b("\n");return t.fl(); },partials: {}, subs: {  }})
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