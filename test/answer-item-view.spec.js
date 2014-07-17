(function () {
    'use strict';

    describe('Answer Item View', function () {
        var ReactTestUtils = React.addons.TestUtils;

        beforeEach(function () {
            $('body').empty();
        });

        it('should render itself', function () {
            React.renderComponent(app.AnswerItemView({
                href:'somestring',
                text:'somename'
            }), $('body').get(0));

            expect($('a').attr('href')).toBe('somestring');
            expect($('a').text()).toBe('somename');
        });
    });
}());