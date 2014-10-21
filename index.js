/**
 * Module dependencies
 */

var extname = require('path').extname;
var basename = require('path').basename;
var yaml = require('js-yaml');
var ini = require('ini');
var fs = require('fs');

/**
 * Take a `path` and return
 *
 *  .names {Array} - filetype names or aliases
 *  .data {String} - parsed data from `path`
 *  .parsed {Function}
 *  .parseFile {Function}
 *
 * @param {String} path path to raw file
 * @param {String} [type] filetype extension (e.g., 'ini', 'json')
 */

exports = module.exports = function(path, type){
  if (path) {
    var out = {};
    if ((out.names = exports.match(path))){
      for (var i = 0, l = out.names.length; i < l; i++) out[out.names[i]] = true;
      out.parse = exports.parsers[out.names[0]];
    }
    out.parseFile = exports.parseFile.bind(exports, path, type);
    out.data = out.parseFile();
    return out;
  }
};

/**
 * Define parsers in this way so they can be overridden.
 */

var parsers = exports.parsers = {};
parsers.ini = function(str){
  var lines = str.split('\n');
  var m;
  while (lines.length && !m) m = /^\[\]$|=/.exec(lines.shift())
  if (!m) return;
  try { var data = ini.decode(str) } catch(e){}
  return data;
};
parsers.make = function(str){
  var data = {};
  var lines = str.split('\n');
  for (var i = 0, len = lines.length; i < len; i++) {
    var l = lines[i];
    var m = /([a-zA-Z_-]*) *[?:]?= *(.+)$/.exec(l);
    if (!m) continue;
    data[m[1].toLowerCase()] = m[2];
  }
  return data;
};
parsers.mk = parsers.make;
parsers.Makefile = parsers.make;
parsers.makefile = parsers.make;
parsers.js = function(str){ try { var data = require(str) } catch(e){}; return data; };
parsers.json = function(str){ try { var data = JSON.parse(str) } catch(e){}; return data; };
parsers.yaml = function(str){ try { var data = yaml.load(str) } catch(e){}; return data; };
parsers.yml = parsers.yaml;

/**
 * Define types, including extensions and aliases in `names`,
 * and conditions to match in `matches`.
 */

exports.types = [
  {names: ['html'], matches: [/\.html$/]},
  {names: ['ini'], matches: [/\.ini$/]},
  {names: ['js', 'javascript'], matches: [/\.js$/]},
  {names: ['json'], matches: [/\.json$/]},
  {names: ['make'], matches: [/Makefile$/, /\.mk$/]},
  {names: ['yaml'], matches: [/\.yml$/, /\.yaml$/]}
].map(function(t){
  t.parser = function(str){return (parsers[t.names[0]] || noop)(str) };
  return t;
});

/**
 * Take a `path` and return the names that match.
 */

exports.match = function(path){
  var ext = extname(path);
  var base = basename(path);

  for (var i = 0, l = exports.types.length; i < l; i++) {
    var t = exports.types[i];
    var ms = t.matches;
    for (var ii = 0, ll = ms.length; ii < ll; ii++) {
      var m = ms[ii].exec(base);
      if (!m) continue;
      return t.names;
    }
  }
};

/**
 * Take a `str` and optional `type`, and return
 * the parsed data.
 * @param {String} str
 * @param {String} [type]
 * @return {Object}
 */

exports.parse = function(str, type){
  var out;
  if (type) {
    out = exports.parsers[type](str);
  } else {
    for (var i = 0, l = exports.types.length; i < l; i++) {
      if (out) break;
      var t = exports.types[i];
      out = (t.parser || noop)(str);
    }
  }
  return out;
};

/**
 * Just like `parse`, but syncronosouly read
 * raw data from `path.
 * @param {String} path
 * @param {String} [type]
 * @return {Object}
 */

exports.parseFile = function(path, type){
  var data = fs.readFileSync(path, 'utf8');
  if (!type) return exports.parse(data)
  return exports.parsers[type](data);
};

function noop(){}
