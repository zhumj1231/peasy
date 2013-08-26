// Generated by CoffeeScript 1.6.2
(function() {
  var addRecursiveCircles, char, char_, computeLeftRecursives, digit, digit_, followIdentifierLetter_, hasOwnProperty, identifier, identifierLetter, identifierLetter_, identifier_, isMatcher, letter, letter_, literal, literal_, lower, lower_, memo, memorize, parse, rec, recursive, recursiveGrammar, setMemoTag, setMemorizeRules, spaces, spaces1, spaces1_, spaces_, upper, upper_, wrap,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  hasOwnProperty = Object.hasOwnProperty;

  isMatcher = function(item) {
    return typeof item === "function";
  };

  recursiveGrammar = function(info, rules) {
    addRecursiveCircles(rules);
    computeLeftRecursives(info, rules);
    return rules;
  };

  addRecursiveCircles = function(rules) {
    var circle, circles, i, j, length, list, map, name, parent, _i, _len, _ref, _ref1;

    map = (_ref = rules.__parentToChildren) != null ? _ref : rules.__parentToChildren = {};
    circles = rules.__RecursiveCircles;
    if (!circles) {
      return;
    }
    for (_i = 0, _len = circles.length; _i < _len; _i++) {
      circle = circles[_i];
      i = 0;
      length = circle.length;
      while (i < length) {
        if (i === length - 1) {
          j = 0;
        } else {
          j = i + 1;
        }
        name = circle[i];
        parent = circle[j];
        list = (_ref1 = map[parent]) != null ? _ref1 : map[parent] = [];
        if (__indexOf.call(list, name) < 0) {
          list.push(name);
        }
        i++;
      }
    }
  };

  computeLeftRecursives = function(info, rules) {
    var addDescendents, descendents, meetTable, parentToChildren, symbol, symbolDescedentsMap;

    parentToChildren = rules.__parentToChildren;
    addDescendents = function(symbol, meetTable, descedents) {
      var child, children, _i, _len, _results;

      children = parentToChildren[symbol];
      _results = [];
      for (_i = 0, _len = children.length; _i < _len; _i++) {
        child = children[_i];
        if (__indexOf.call(descedents, child) < 0) {
          descedents.push(child);
        }
        if (!meetTable[child]) {
          _results.push(addDescendents(child, meetTable, descedents));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    symbolDescedentsMap = rules.__symbolDescedentsMap = {};
    for (symbol in parentToChildren) {
      meetTable = {};
      meetTable[symbol] = true;
      descendents = symbolDescedentsMap[symbol] = [];
      addDescendents(symbol, meetTable, descendents);
      if (__indexOf.call(descendents, symbol) >= 0) {
        rules.__originalRules[symbol] = this[symbol];
        rules[symbol] = rules.__recursiveRules[symbol] = recursive(info, rules, symbol);
      }
    }
  };

  recursive = function(info, rules, symbol) {
    var originalRules, recursiveRules, rule, symbolDescedentsMap;

    recursiveRules = rules.__recursiveRules;
    symbolDescedentsMap = rules.__symbolDescedentsMap;
    originalRules = rules.__originalRules;
    rule = originalRules[symbol];
    return function(start) {
      var child, hash, m, result, _base, _i, _j, _len, _len1, _ref, _ref1, _ref2;

      _ref = symbolDescedentsMap[symbol];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        rules[child] = originalRules[child];
      }
      hash = symbol + start;
      m = (_ref1 = (_base = rules.parseCache)[hash]) != null ? _ref1 : _base[hash] = [void 0, -1];
      if (m[1] >= 0) {
        info.cursor = m[1];
        return m[0];
      }
      while (1) {
        result = rule(start);
        if (m[1] < 0) {
          m[0] = result;
          if (result) {
            m[1] = this.cursor;
          } else {
            m[1] = start;
          }
        } else {
          if (m[1] === info.cursor) {
            m[0] = result;
            return result;
          } else if (info.cursor < m[1]) {
            m[0] = result;
            info.cursor = m[1];
            return result;
          } else {
            m[0] = result;
            m[1] = parsercursor;
          }
        }
      }
      _ref2 = symbolDescedentsMap[symbol];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        child = _ref2[_j];
        rules[child] = recursiveRules[child];
      }
      return result;
    };
  };

  rec = function(info, rules, symbol) {
    var parseCache, rule, tag;

    tag = rules.symbolToTagMap[symbol];
    rule = rules.__originalRules[symbol];
    parseCache = rules.parseCache;
    return function(start) {
      var child, hash, m, result, _i, _len, _ref;

      hash = tag + start;
      m = parseCache[hash];
      if (m) {
        while (1) {
          result = rule(start);
          if (m[1] < 0) {
            m[0] = result;
            if (result) {
              m[1] = this.cursor;
            } else {
              m[1] = start;
            }
          } else {
            if (m[1] === info.cursor) {
              m[0] = result;
              return result;
            } else if (info.cursor < m[1]) {
              m[0] = result;
              info.cursor = m[1];
              return result;
            } else {
              m[0] = result;
              m[1] = parsercursor;
            }
          }
          info.cursor = m[1];
          m[0];
        }
      } else {
        parseCache[hash] = [void 0, -1];
        rule(start);
      }
      _ref = symbolDescedentsMap[symbol];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        rules[child] = recursiveRules[child];
      }
      return result;
    };
  };

  setMemorizeRules = function(info, rules) {
    var memorizedSymbols, symbol, _i, _len, _results;

    memorizedSymbols = rules.memorizedSymbols;
    if (!memorizedSymbols) {
      return;
    }
    _results = [];
    for (_i = 0, _len = memorizedSymbols.length; _i < _len; _i++) {
      symbol = memorizedSymbols[_i];
      rules.__originalRules[symbol] = rules[symbol];
      _results.push(rules[symbol] = memorize(info, rules, symbol));
    }
    return _results;
  };

  memorize = function(info, rules, symbol) {
    var parseCache, rule, tag;

    tag = rules.symbolToTagMap[symbol];
    rule = rules.__originalRules[symbol];
    parseCache = rules.parseCache;
    return function(start) {
      var hash, m, result;

      hash = tag + start;
      m = parseCache[hash];
      if (m) {
        info.cursor = m[1];
        return m[0];
      } else {
        result = rule(start);
        parseCache[hash] = [result, info.cursor];
        return result;
      }
    };
  };

  memo = function(info, rules, symbol) {
    var parseCache, tag;

    tag = rules.symbolToTagMap[symbol];
    parseCache = rules.parseCache;
    return function(start) {
      var hash, m;

      hash = tag + start;
      m = parseCache[hash];
      if (m) {
        info.cursor = m[1];
        return m[0];
      }
    };
  };

  setMemoTag = function(rules, symbol) {
    var i, tag;

    i = 1;
    while (1) {
      if (hasOwnProperty.call(rules.tags, symbol.slice(0, i))) {
        i++;
      } else {
        break;
      }
    }
    tag = symbol.slice(0, i);
    rules.symbolToTagMap[symbol] = tag;
    return rules.tags[tag] = true;
  };

  ({
    andp: function() {
      var info, item, items;

      info = arguments[0], items = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      items = (function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          if (!isMatcher(item)) {
            _results.push(literal(info, item));
          } else {
            _results.push(item);
          }
        }
        return _results;
      })();
      return function(start) {
        var result, _i, _len;

        info.cursor = start;
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          if (!(result = item(info.cursor))) {
            return;
          }
        }
        return result;
      };
    },
    orp: function() {
      var info, item, items;

      info = arguments[0], items = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      items = (function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          if (!isMatcher(item)) {
            _results.push(literal(infor, item));
          } else {
            _results.push(item);
          }
        }
        return _results;
      })();
      return function(start) {
        var result, _i, _len;

        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          info.cursor = start;
          if (result = item(start)) {
            return result;
          }
        }
        return result;
      };
    },
    notp: function(info, item) {
      if (!isMatcher(item)) {
        item = literal(info, item);
      }
      return function(start) {
        return !item(start);
      };
    },
    any: function(info, item) {
      if (!isMatcher(item)) {
        item = literal(info, item);
      }
      return function(start) {
        var result, x;

        result = [];
        info.cursor = start;
        while ((x = item(info.cursor))) {
          result.push(x);
        }
        return result;
      };
    },
    some: function(info, item) {
      if (!isMatcher(item)) {
        item = literal(info, item);
      }
      return function(start) {
        var result, x;

        result = [];
        info.cursor = start;
        if (!(x = item(info.cursor))) {
          return x;
        }
        while (1) {
          result.push(x);
          x = item(info.cursor);
          if (!x) {
            break;
          }
        }
        return result;
      };
    },
    may: function(info, item) {
      if (!isMatcher(item)) {
        item = literal(info, item);
      }
      return function(start) {
        var x;

        info.cursor = start;
        if (x = item(info.cursor)) {
          return x;
        } else {
          info.cursor = start;
          return true;
        }
      };
    },
    follow: function(info, item) {
      if (!isMatcher(item)) {
        item = literal(info, item);
      }
      return function(start) {
        var x;

        info.cursor = start;
        if (x = item(info.cursor)) {
          info.cursor = start;
          return x;
        }
      };
    },
    times: function(info, item, n) {
      if (!isMatcher(item)) {
        item = literal(info, item);
      }
      return function(start) {
        var i, x;

        info.cursor = start;
        i = 0;
        while (i++ < n) {
          if (x = item(info.cursor)) {
            result.push(x);
          } else {
            return;
          }
        }
        return result;
      };
    },
    seperatedList: function(info, item, separator) {
      if (separator == null) {
        separator = spaces;
      }
      if (!isMatcher(item)) {
        item = literal(info, item);
      }
      if (!isMatcher(separator)) {
        separator = literal(separator);
      }
      return function(start) {
        var result, x;

        info.cursor = start;
        result = [];
        x = item(info.cursor);
        if (!x) {
          return;
        }
        while (1) {
          result.push(x);
          if (!(x = item(info.cursor))) {
            break;
          }
        }
        return result;
      };
    },
    timesSeperatedList: function(info, item, n, separator) {
      if (separator == null) {
        separator = spaces;
      }
      if (!isMatcher(item)) {
        item = literal(info, item);
      }
      if (!isMatcher(separator)) {
        separator = literal(separator);
      }
      return function(start) {
        var i, result, x;

        info.cursor = start;
        result = [];
        x = item(info.cursor);
        if (!x) {
          return;
        }
        i = 1;
        while (i++ < n) {
          result.push(x);
          if (!(x = item(info.cursor))) {
            break;
          }
        }
        return result;
      };
    }
  });

  literal = function(info, string) {
    return function(start) {
      var len, stop;

      len = string.length;
      if (info.data.slice(start, stop = start + len) === string) {
        info.cursor = stop;
        return true;
      }
    };
  };

  literal_ = function(info, string) {
    return function(start) {
      var len, stop;

      len = string.length;
      if (info.data.slice(info.cursor, stop = info.cursor + len) === string) {
        info.cursor = stop;
        return true;
      }
    };
  };

  char = function(info, c) {
    return function(start) {
      if (info.data[start] === c) {
        info.cursor = start + 1;
        return c;
      }
    };
  };

  char_ = function(info, c) {
    return function() {
      if (info.data[info.cursor] === c) {
        info.cursor++;
        return c;
      }
    };
  };

  spaces = function(info) {
    return function(start) {
      var len;

      len = 0;
      info.cursor = start;
      while (1) {
        switch (info.data[info.cursor++]) {
          case ' ':
            len++;
            break;
          case '\t':
            len += tabWidth;
            break;
          default:
            break;
        }
      }
      return len;
    };
  };

  spaces_ = function(info) {
    return function() {
      var len;

      len = 0;
      while (1) {
        switch (info.data[info.cursor++]) {
          case ' ':
            len++;
            break;
          case '\t':
            len += tabWidth;
            break;
          default:
            break;
        }
      }
      return len;
    };
  };

  spaces1 = function(info) {
    return function(start) {
      var len;

      len = 0;
      info.cursor = start;
      while (1) {
        switch (info.data[info.cursor++]) {
          case ' ':
            len++;
            break;
          case '\t':
            len += tabWidth;
            break;
          default:
            break;
        }
      }
      if (len) {
        return info.cursor = info.cursor;
        return len;
      }
    };
  };

  spaces1_ = function(info) {
    return function() {
      var len;

      len = 0;
      info.cursor = start;
      while (1) {
        switch (info.data[info.cursor++]) {
          case ' ':
            len++;
            break;
          case '\t':
            len += tabWidth;
            break;
          default:
            break;
        }
      }
      if (len) {
        return info.cursor = info.cursor;
        return len;
      }
    };
  };

  wrap = function(info) {
    return function(item, left, right) {
      if (left == null) {
        left = spaces;
      }
      if (right == null) {
        right = spaces;
      }
      if (!isMatcher(item)) {
        item = literal(info, item);
      }
      return function(start) {
        var result;

        if (left(start) && (result = item(info.cursor) && right(info.cursor))) {
          return result;
        }
      };
    };
  };

  identifierLetter = function(info) {
    return function(start) {
      var c;

      start = info.cursor;
      c = info.data[info.cursor];
      if (c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) {
        info.cursor++;
        return true;
      }
    };
  };

  identifierLetter_ = function(info) {
    return function() {
      var c;

      c = info.data[info.cursor];
      if (c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) {
        info.cursor++;
        return true;
      }
    };
  };

  followIdentifierLetter_ = function(info) {
    return function() {
      var c;

      c = info.data[info.cursor];
      return c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9');
    };
  };

  digit = function(info) {
    return function(start) {
      var c;

      c = info.data[start];
      if (('0' <= c && c <= '9')) {
        return info.cursor = start + 1;
      }
    };
  };

  digit_ = function(info) {
    return function() {
      var c;

      c = info.data[info.cursor];
      if (('0' <= c && c <= '9')) {
        return info.cursor++;
      }
    };
  };

  letter = function(info) {
    return function(start) {
      var c;

      c = info.data[start];
      if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')) {
        return info.cursor = start + 1;
      }
    };
  };

  letter_ = function(info) {
    return function() {
      var c;

      c = info.data[info.cursor];
      if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')) {
        return info.cursor++;
      }
    };
  };

  lower = function(info) {
    return function(start) {
      var c;

      c = info.data[start];
      if (('a' <= c && c <= 'z')) {
        return info.cursor = start + 1;
      }
    };
  };

  lower_ = function(info) {
    return function() {
      var c;

      c = info.data[info.cursor];
      if (('a' <= c && c <= 'z')) {
        return info.cursor++;
      }
    };
  };

  upper = function(info) {
    return function(start) {
      var c;

      c = info.data[start];
      if (('A' <= c && c <= 'Z')) {
        return info.cursor = start + 1;
      }
    };
  };

  upper_ = function(info) {
    return function() {
      var c;

      c = info.data[info.cursor];
      if (('A' <= c && c <= 'Z')) {
        return info.cursor++;
      }
    };
  };

  identifier = function(info) {
    return function(start) {
      var c;

      info.cursor = start;
      c = info.data[info.cursor];
      if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || 'c' === '$' || 'c' === '_') {
        info.cursor++;
      } else {
        return;
      }
      while (1) {
        c = info.data[info.cursor];
        if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') || 'c' === '$' || 'c' === '_') {
          info.cursor++;
        } else {
          break;
        }
      }
      return true;
    };
  };

  identifier_ = function(info) {
    return function() {
      var c;

      c = info.data[info.cursor];
      if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || 'c' === '$' || 'c' === '_') {
        info.cursor++;
      } else {
        return;
      }
      while (1) {
        c = info.data[info.cursor];
        if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') || 'c' === '$' || 'c' === '_') {
          info.cursor++;
        } else {
          break;
        }
      }
      return true;
    };
  };

  exports.isdigit = function(c) {
    return ('0' <= c && c <= '9');
  };

  exports.isletter = function(c) {
    return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z');
  };

  exports.islower = function(c) {
    return ('a' <= c && c <= 'z');
  };

  exports.isupper = function(c) {
    return ('A' <= c && c <= 'Z');
  };

  exports.isIdentifierLetter = function(c) {
    return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') || 'c' === '$' || 'c' === '_';
  };

  parse = function(text) {
    var grammar, makeGrammar;

    makeGrammar = function(info) {
      var a, b, rules, x;

      a = char(info, 'a');
      b = char(info, 'b');
      x = char(info, 'x');
      rules = {
        A: function(start) {
          var m;

          return (m = rules.B(start)) && x(info.cursor) && m + 'x' || m || a(start);
        },
        B: function(start) {
          return rules.C(start);
        },
        C: function(start) {
          return rules.A(start) || b(start);
        }
      };
      return recursiveGrammar(info, rules);
    };
    grammar = makeGrammar({
      data: text,
      cursor: 0
    });
    return grammar.A(0);
  };

}).call(this);

/*
//@ sourceMappingURL=modularpeasy.map
*/