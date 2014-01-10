define(['../node_modules/should/should.js'], function (should) {
    describe('AnswerListClient', function () {
        it('should be a passing test', function () {
            var view = new AnswerListView();
            view.should.not.be.an.instanceOf(Object);
            fail();
        });
    });
});

