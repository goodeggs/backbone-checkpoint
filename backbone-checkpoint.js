var rawNavigate = null;
var rawLoadUrl = null;
var scroll = null;
var maxNavigationDepth = null;

_(Backbone.History.prototype).extend({
  
  _wrapNavigate: function() {
    rawNavigate = this.navigate;
    this.navigate = function() {
      var args = _(arguments).toArray()
      var fragmentBefore = this.fragment;
      rawNavigate.apply(this, args);
      var fragmentAfter = this.fragment;
      if(fragmentAfter != fragmentBefore) {
        maxNavigationDepth++;
      }
    }
  },

  _unwrapNavigate: function() {
    this.navigate = rawNavigate;
    rawNavigate = null;
  },

  _wrapLoadUrlOnce: function(done) {
    rawLoadUrl = this.loadUrl;
    this.loadUrl = function() {
      this._unwrapLoadUrl();
      this._unwrapNavigate();
      // chrome seems to defer it's scroll reset
      setTimeout((function() {
        done();
        window.scrollTo(scroll[0], scroll[1]);
      }), 20);
      // tell BB when handled that route 
      return true;
    };
  },

  _unwrapLoadUrl: function() {
    this.loadUrl = rawLoadUrl;
    rawLoadUrl = null;
  },

  checkpoint: function() {
    if ((rawNavigate != null) || (rawLoadUrl != null)) {
      throw new Error('checkpoint already set');
    }
    maxNavigationDepth = 0;
    this._wrapNavigate();
  },
  
  backToCheckpoint: function(done) {
    if (maxNavigationDepth < 1) {
      this._unwrapNavigate();
      return done();
    } else {
      scroll = [window.scrollX, window.scrollY];
      this._wrapLoadUrlOnce(done);
      for(var i=0; i<maxNavigationDepth; i++) {
        window.history.forward();
      }
      window.history.go(-maxNavigationDepth);
    }
  }
});