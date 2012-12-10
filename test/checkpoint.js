describe('backbone-checkpoint', function() {
  var history;

  beforeEach(function() {
    history = new Backbone.History();
    history.start();
  });

  afterEach(function() {
    history.stop();
  });

  describe('backToCheckpoint', function() {
    describe('given a checkpoint', function() {
      beforeEach(function() {
        history.navigate('a');
        history.navigate('b');
        history.checkpoint();
      });

      it('retuns the browser to the checkpointed history state', function(done) {
        history.navigate('c');
        history.navigate('d');
        expect(history.getFragment()).to.equal('d');
        history.backToCheckpoint(function() {
          expect(history.getFragment()).to.equal('b');
          done();
        });
      });

      describe('and duplicate route navigations', function() {
        beforeEach(function() {
          history.navigate('c');
          history.navigate('c');
          history.navigate('d');
        });

        it('still returns to the checkpointed state', function(done) {
          history.backToCheckpoint(function() {
            expect(history.getFragment()).to.equal('b');
            done();
          });
        });
      });
    });
  });
});
