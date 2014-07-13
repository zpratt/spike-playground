describe("Namespace Tests", function() {
    beforeEach(function() {
    });

    afterEach(function() {
    });

    it('should namespace modules using the namespace argument', function() {
        app.ns(app, 'nsthingy');

        expect(app.nsthingy).toBe({});
    });

    it('should appropriately namespace module extensions when an extension is passed', function() {
        app.bindNS(app, 'space.nsfunc', {
            test: function(str) {
                return str;
            }
        });

        expect(app.space.nsfunc.test).toBe(Function);
        expect('hello').toEqual(app.space.nsfunc.test('hello'));
    });
});