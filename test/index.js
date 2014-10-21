var should = require('should');
var isCode = require('..');

describe('isCode', function(){

  describe('#', function(){
    it('should match on `js`', function(){
      var res = {name: 'foo'};

      // properties
      isCode('test/fixtures/package.json').json.should.eql(true);
      // TODO
      // fix js loading
      // isCode('test/fixtures/index.js', 'js').names.should.eql(['js', 'javascript']);

      // explicit filetypes
      isCode('test/fixtures/package~json', 'json').parseFile().should.eql(res);
      isCode('test/fixtures/data~yml', 'yaml').parseFile().should.eql(res);
      isCode('test/fixtures/project.conf', 'ini').parseFile().should.eql(res);

      // direct calling
      isCode('test/fixtures/package.json').parseFile().should.eql(res);
      isCode('test/fixtures/data.yml').parseFile().should.eql(res);
      isCode('test/fixtures/project.conf').parseFile().should.eql(res);
    });
  });

  describe('#match', function(){
    it('should match on `js`', function(){
      var res = ['js', 'javascript'];
      isCode.match('foo/bar/foo.js').should.eql(res);
    });
    it('should match on `json`', function(){
      var res = ['json'];
      isCode.match('foo/bar/foo.json').should.eql(res);
    });
    it('should match on `Makefile`, `.mk`', function(){
      var res = ['make'];
      isCode.match('Makefile').should.eql(res);
      isCode.match('foo/bar/build.mk').should.eql(res);
    });
  });

  describe('#parse', function(){
    it('should parse based on strings alone', function(){
      var res = {name: 'foo'};

      // parse strings
      isCode.parse('name: foo').should.eql(res);
      isCode.parse('{name: "foo"}').should.eql(res);
      isCode.parse('name=foo').should.eql(res);

      // parse files
      isCode.parseFile('test/fixtures/package.json').should.eql(res);
      isCode.parseFile('test/fixtures/data.yml').should.eql(res);
      isCode.parseFile('test/fixtures/project.conf').should.eql(res);
    });
  });
});
