var Hello = require('./../app/components/Hello.js');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe("Hello", function() {

  it("should render text: Hello world!", function() {
    var hello = TestUtils.renderIntoDocument(React.createElement(Hello));
    expect(React.findDOMNode(hello).textContent).toEqual('Hello World!');
  });

});
