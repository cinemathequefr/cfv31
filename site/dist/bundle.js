(function () {
'use strict';

var __TAGS_CACHE = [];
var __TAG_IMPL = {};
var YIELD_TAG = 'yield';
var GLOBAL_MIXIN = '__global_mixin';
var ATTRS_PREFIX = 'riot-';
var REF_DIRECTIVES = ['ref', 'data-ref'];
var IS_DIRECTIVE = 'data-is';
var CONDITIONAL_DIRECTIVE = 'if';
var LOOP_DIRECTIVE = 'each';
var LOOP_NO_REORDER_DIRECTIVE = 'no-reorder';
var SHOW_DIRECTIVE = 'show';
var HIDE_DIRECTIVE = 'hide';
var KEY_DIRECTIVE = 'key';
var RIOT_EVENTS_KEY = '__riot-events__';
var T_STRING = 'string';
var T_OBJECT = 'object';
var T_UNDEF  = 'undefined';
var T_FUNCTION = 'function';
var XLINK_NS = 'http://www.w3.org/1999/xlink';
var SVG_NS = 'http://www.w3.org/2000/svg';
var XLINK_REGEX = /^xlink:(\w+)/;
var WIN = typeof window === T_UNDEF ? undefined : window;
var RE_SPECIAL_TAGS = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?|opt(?:ion|group))$/;
var RE_SPECIAL_TAGS_NO_OPTION = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?)$/;
var RE_EVENTS_PREFIX = /^on/;
var RE_HTML_ATTRS = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g;
var CASE_SENSITIVE_ATTRIBUTES = {
    'viewbox': 'viewBox',
    'preserveaspectratio': 'preserveAspectRatio'
  };
var RE_BOOL_ATTRS = /^(?:disabled|checked|readonly|required|allowfullscreen|auto(?:focus|play)|compact|controls|default|formnovalidate|hidden|ismap|itemscope|loop|multiple|muted|no(?:resize|shade|validate|wrap)?|open|reversed|seamless|selected|sortable|truespeed|typemustmatch)$/;
var IE_VERSION = (WIN && WIN.document || {}).documentMode | 0;

function $$(selector, ctx) {
  return [].slice.call((ctx || document).querySelectorAll(selector))
}

/**
 * Shorter and fast way to select a single node in the DOM
 * @param   { String } selector - unique dom selector
 * @param   { Object } ctx - DOM node where the target of our search will is located
 * @returns { Object } dom node found
 */
function $(selector, ctx) {
  return (ctx || document).querySelector(selector)
}

/**
 * Create a document fragment
 * @returns { Object } document fragment
 */
function createFrag() {
  return document.createDocumentFragment()
}

/**
 * Create a document text node
 * @returns { Object } create a text node to use as placeholder
 */
function createDOMPlaceholder() {
  return document.createTextNode('')
}

/**
 * Check if a DOM node is an svg tag or part of an svg
 * @param   { HTMLElement }  el - node we want to test
 * @returns {Boolean} true if it's an svg node
 */
function isSvg(el) {
  var owner = el.ownerSVGElement;
  return !!owner || owner === null
}

/**
 * Create a generic DOM node
 * @param   { String } name - name of the DOM node we want to create
 * @returns { Object } DOM node just created
 */
function mkEl(name) {
  return name === 'svg' ? document.createElementNS(SVG_NS, name) : document.createElement(name)
}

/**
 * Set the inner html of any DOM node SVGs included
 * @param { Object } container - DOM node where we'll inject new html
 * @param { String } html - html to inject
 * @param { Boolean } isSvg - svg tags should be treated a bit differently
 */
/* istanbul ignore next */
function setInnerHTML(container, html, isSvg) {
  // innerHTML is not supported on svg tags so we neet to treat them differently
  if (isSvg) {
    var node = container.ownerDocument.importNode(
      new DOMParser()
        .parseFromString(("<svg xmlns=\"" + SVG_NS + "\">" + html + "</svg>"), 'application/xml')
        .documentElement,
      true
    );

    container.appendChild(node);
  } else {
    container.innerHTML = html;
  }
}

/**
 * Toggle the visibility of any DOM node
 * @param   { Object }  dom - DOM node we want to hide
 * @param   { Boolean } show - do we want to show it?
 */

function toggleVisibility(dom, show) {
  dom.style.display = show ? '' : 'none';
  dom.hidden = show ? false : true;
}

/**
 * Remove any DOM attribute from a node
 * @param   { Object } dom - DOM node we want to update
 * @param   { String } name - name of the property we want to remove
 */
function remAttr(dom, name) {
  dom.removeAttribute(name);
}

/**
 * Convert a style object to a string
 * @param   { Object } style - style object we need to parse
 * @returns { String } resulting css string
 * @example
 * styleObjectToString({ color: 'red', height: '10px'}) // => 'color: red; height: 10px'
 */
function styleObjectToString(style) {
  return Object.keys(style).reduce(function (acc, prop) {
    return (acc + " " + prop + ": " + (style[prop]) + ";")
  }, '')
}

/**
 * Get the value of any DOM attribute on a node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { String } name - name of the attribute we want to get
 * @returns { String | undefined } name of the node attribute whether it exists
 */
function getAttr(dom, name) {
  return dom.getAttribute(name)
}

/**
 * Set any DOM attribute
 * @param { Object } dom - DOM node we want to update
 * @param { String } name - name of the property we want to set
 * @param { String } val - value of the property we want to set
 */
function setAttr(dom, name, val) {
  var xlink = XLINK_REGEX.exec(name);
  if (xlink && xlink[1])
    { dom.setAttributeNS(XLINK_NS, xlink[1], val); }
  else
    { dom.setAttribute(name, val); }
}

/**
 * Insert safely a tag to fix #1962 #1649
 * @param   { HTMLElement } root - children container
 * @param   { HTMLElement } curr - node to insert
 * @param   { HTMLElement } next - node that should preceed the current node inserted
 */
function safeInsert(root, curr, next) {
  root.insertBefore(curr, next.parentNode && next);
}

/**
 * Minimize risk: only zero or one _space_ between attr & value
 * @param   { String }   html - html string we want to parse
 * @param   { Function } fn - callback function to apply on any attribute found
 */
function walkAttrs(html, fn) {
  if (!html) { return }
  var m;
  while (m = RE_HTML_ATTRS.exec(html))
    { fn(m[1].toLowerCase(), m[2] || m[3] || m[4]); }
}

/**
 * Walk down recursively all the children tags starting dom node
 * @param   { Object }   dom - starting node where we will start the recursion
 * @param   { Function } fn - callback to transform the child node just found
 * @param   { Object }   context - fn can optionally return an object, which is passed to children
 */
function walkNodes(dom, fn, context) {
  if (dom) {
    var res = fn(dom, context);
    var next;
    // stop the recursion
    if (res === false) { return }

    dom = dom.firstChild;

    while (dom) {
      next = dom.nextSibling;
      walkNodes(dom, fn, res);
      dom = next;
    }
  }
}

var dom = Object.freeze({
	$$: $$,
	$: $,
	createFrag: createFrag,
	createDOMPlaceholder: createDOMPlaceholder,
	isSvg: isSvg,
	mkEl: mkEl,
	setInnerHTML: setInnerHTML,
	toggleVisibility: toggleVisibility,
	remAttr: remAttr,
	styleObjectToString: styleObjectToString,
	getAttr: getAttr,
	setAttr: setAttr,
	safeInsert: safeInsert,
	walkAttrs: walkAttrs,
	walkNodes: walkNodes
});

var styleNode;
// Create cache and shortcut to the correct property
var cssTextProp;
var byName = {};
var remainder = [];
var needsInject = false;

// skip the following code on the server
if (WIN) {
  styleNode = ((function () {
    // create a new style element with the correct type
    var newNode = mkEl('style');
    // replace any user node or insert the new one into the head
    var userNode = $('style[type=riot]');

    setAttr(newNode, 'type', 'text/css');
    /* istanbul ignore next */
    if (userNode) {
      if (userNode.id) { newNode.id = userNode.id; }
      userNode.parentNode.replaceChild(newNode, userNode);
    } else { document.head.appendChild(newNode); }

    return newNode
  }))();
  cssTextProp = styleNode.styleSheet;
}

/**
 * Object that will be used to inject and manage the css of every tag instance
 */
var styleManager = {
  styleNode: styleNode,
  /**
   * Save a tag style to be later injected into DOM
   * @param { String } css - css string
   * @param { String } name - if it's passed we will map the css to a tagname
   */
  add: function add(css, name) {
    if (name) { byName[name] = css; }
    else { remainder.push(css); }
    needsInject = true;
  },
  /**
   * Inject all previously saved tag styles into DOM
   * innerHTML seems slow: http://jsperf.com/riot-insert-style
   */
  inject: function inject() {
    if (!WIN || !needsInject) { return }
    needsInject = false;
    var style = Object.keys(byName)
      .map(function (k) { return byName[k]; })
      .concat(remainder).join('\n');
    /* istanbul ignore next */
    if (cssTextProp) { cssTextProp.cssText = style; }
    else { styleNode.innerHTML = style; }
  }
};

/**
 * The riot template engine
 * @version v3.0.8
 */

var skipRegex = (function () { //eslint-disable-line no-unused-vars

  var beforeReChars = '[{(,;:?=|&!^~>%*/';

  var beforeReWords = [
    'case',
    'default',
    'do',
    'else',
    'in',
    'instanceof',
    'prefix',
    'return',
    'typeof',
    'void',
    'yield'
  ];

  var wordsLastChar = beforeReWords.reduce(function (s, w) {
    return s + w.slice(-1)
  }, '');

  var RE_REGEX = /^\/(?=[^*>/])[^[/\\]*(?:(?:\\.|\[(?:\\.|[^\]\\]*)*\])[^[\\/]*)*?\/[gimuy]*/;
  var RE_VN_CHAR = /[$\w]/;

  function prev (code, pos) {
    while (--pos >= 0 && /\s/.test(code[pos])){  }
    return pos
  }

  function _skipRegex (code, start) {

    var re = /.*/g;
    var pos = re.lastIndex = start++;
    var match = re.exec(code)[0].match(RE_REGEX);

    if (match) {
      var next = pos + match[0].length;

      pos = prev(code, pos);
      var c = code[pos];

      if (pos < 0 || ~beforeReChars.indexOf(c)) {
        return next
      }

      if (c === '.') {

        if (code[pos - 1] === '.') {
          start = next;
        }

      } else if (c === '+' || c === '-') {

        if (code[--pos] !== c ||
            (pos = prev(code, pos)) < 0 ||
            !RE_VN_CHAR.test(code[pos])) {
          start = next;
        }

      } else if (~wordsLastChar.indexOf(c)) {

        var end = pos + 1;

        while (--pos >= 0 && RE_VN_CHAR.test(code[pos])){  }
        if (~beforeReWords.indexOf(code.slice(pos + 1, end))) {
          start = next;
        }
      }
    }

    return start
  }

  return _skipRegex

})();

/**
 * riot.util.brackets
 *
 * - `brackets    ` - Returns a string or regex based on its parameter
 * - `brackets.set` - Change the current riot brackets
 *
 * @module
 */

/* global riot */

var brackets = (function (UNDEF) {

  var
    REGLOB = 'g',

    R_MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,

    R_STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|`[^`\\]*(?:\\[\S\s][^`\\]*)*`/g,

    S_QBLOCKS = R_STRINGS.source + '|' +
      /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' +
      /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?([^<]\/)[gim]*/.source,

    UNSUPPORTED = RegExp('[\\' + 'x00-\\x1F<>a-zA-Z0-9\'",;\\\\]'),

    NEED_ESCAPE = /(?=[[\]()*+?.^$|])/g,

    S_QBLOCK2 = R_STRINGS.source + '|' + /(\/)(?![*\/])/.source,

    FINDBRACES = {
      '(': RegExp('([()])|'   + S_QBLOCK2, REGLOB),
      '[': RegExp('([[\\]])|' + S_QBLOCK2, REGLOB),
      '{': RegExp('([{}])|'   + S_QBLOCK2, REGLOB)
    },

    DEFAULT = '{ }';

  var _pairs = [
    '{', '}',
    '{', '}',
    /{[^}]*}/,
    /\\([{}])/g,
    /\\({)|{/g,
    RegExp('\\\\(})|([[({])|(})|' + S_QBLOCK2, REGLOB),
    DEFAULT,
    /^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/,
    /(^|[^\\]){=[\S\s]*?}/
  ];

  var
    cachedBrackets = UNDEF,
    _regex,
    _cache = [],
    _settings;

  function _loopback (re) { return re }

  function _rewrite (re, bp) {
    if (!bp) { bp = _cache; }
    return new RegExp(
      re.source.replace(/{/g, bp[2]).replace(/}/g, bp[3]), re.global ? REGLOB : ''
    )
  }

  function _create (pair) {
    if (pair === DEFAULT) { return _pairs }

    var arr = pair.split(' ');

    if (arr.length !== 2 || UNSUPPORTED.test(pair)) {
      throw new Error('Unsupported brackets "' + pair + '"')
    }
    arr = arr.concat(pair.replace(NEED_ESCAPE, '\\').split(' '));

    arr[4] = _rewrite(arr[1].length > 1 ? /{[\S\s]*?}/ : _pairs[4], arr);
    arr[5] = _rewrite(pair.length > 3 ? /\\({|})/g : _pairs[5], arr);
    arr[6] = _rewrite(_pairs[6], arr);
    arr[7] = RegExp('\\\\(' + arr[3] + ')|([[({])|(' + arr[3] + ')|' + S_QBLOCK2, REGLOB);
    arr[8] = pair;
    return arr
  }

  function _brackets (reOrIdx) {
    return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _cache[reOrIdx]
  }

  _brackets.split = function split (str, tmpl, _bp) {
    // istanbul ignore next: _bp is for the compiler
    if (!_bp) { _bp = _cache; }

    var
      parts = [],
      match,
      isexpr,
      start,
      pos,
      re = _bp[6];

    var qblocks = [];
    var prevStr = '';
    var mark, lastIndex;

    isexpr = start = re.lastIndex = 0;

    while ((match = re.exec(str))) {

      lastIndex = re.lastIndex;
      pos = match.index;

      if (isexpr) {

        if (match[2]) {

          var ch = match[2];
          var rech = FINDBRACES[ch];
          var ix = 1;

          rech.lastIndex = lastIndex;
          while ((match = rech.exec(str))) {
            if (match[1]) {
              if (match[1] === ch) { ++ix; }
              else if (!--ix) { break }
            } else {
              rech.lastIndex = pushQBlock(match.index, rech.lastIndex, match[2]);
            }
          }
          re.lastIndex = ix ? str.length : rech.lastIndex;
          continue
        }

        if (!match[3]) {
          re.lastIndex = pushQBlock(pos, lastIndex, match[4]);
          continue
        }
      }

      if (!match[1]) {
        unescapeStr(str.slice(start, pos));
        start = re.lastIndex;
        re = _bp[6 + (isexpr ^= 1)];
        re.lastIndex = start;
      }
    }

    if (str && start < str.length) {
      unescapeStr(str.slice(start));
    }

    parts.qblocks = qblocks;

    return parts

    function unescapeStr (s) {
      if (prevStr) {
        s = prevStr + s;
        prevStr = '';
      }
      if (tmpl || isexpr) {
        parts.push(s && s.replace(_bp[5], '$1'));
      } else {
        parts.push(s);
      }
    }

    function pushQBlock(_pos, _lastIndex, slash) { //eslint-disable-line
      if (slash) {
        _lastIndex = skipRegex(str, _pos);
      }

      if (tmpl && _lastIndex > _pos + 2) {
        mark = '\u2057' + qblocks.length + '~';
        qblocks.push(str.slice(_pos, _lastIndex));
        prevStr += str.slice(start, _pos) + mark;
        start = _lastIndex;
      }
      return _lastIndex
    }
  };

  _brackets.hasExpr = function hasExpr (str) {
    return _cache[4].test(str)
  };

  _brackets.loopKeys = function loopKeys (expr) {
    var m = expr.match(_cache[9]);

    return m
      ? { key: m[1], pos: m[2], val: _cache[0] + m[3].trim() + _cache[1] }
      : { val: expr.trim() }
  };

  _brackets.array = function array (pair) {
    return pair ? _create(pair) : _cache
  };

  function _reset (pair) {
    if ((pair || (pair = DEFAULT)) !== _cache[8]) {
      _cache = _create(pair);
      _regex = pair === DEFAULT ? _loopback : _rewrite;
      _cache[9] = _regex(_pairs[9]);
    }
    cachedBrackets = pair;
  }

  function _setSettings (o) {
    var b;

    o = o || {};
    b = o.brackets;
    Object.defineProperty(o, 'brackets', {
      set: _reset,
      get: function () { return cachedBrackets },
      enumerable: true
    });
    _settings = o;
    _reset(b);
  }

  Object.defineProperty(_brackets, 'settings', {
    set: _setSettings,
    get: function () { return _settings }
  });

  /* istanbul ignore next: in the browser riot is always in the scope */
  _brackets.settings = typeof riot !== 'undefined' && riot.settings || {};
  _brackets.set = _reset;
  _brackets.skipRegex = skipRegex;

  _brackets.R_STRINGS = R_STRINGS;
  _brackets.R_MLCOMMS = R_MLCOMMS;
  _brackets.S_QBLOCKS = S_QBLOCKS;
  _brackets.S_QBLOCK2 = S_QBLOCK2;

  return _brackets

})();

/**
 * @module tmpl
 *
 * tmpl          - Root function, returns the template value, render with data
 * tmpl.hasExpr  - Test the existence of a expression inside a string
 * tmpl.loopKeys - Get the keys for an 'each' loop (used by `_each`)
 */

var tmpl = (function () {

  var _cache = {};

  function _tmpl (str, data) {
    if (!str) { return str }

    return (_cache[str] || (_cache[str] = _create(str))).call(
      data, _logErr.bind({
        data: data,
        tmpl: str
      })
    )
  }

  _tmpl.hasExpr = brackets.hasExpr;

  _tmpl.loopKeys = brackets.loopKeys;

  // istanbul ignore next
  _tmpl.clearCache = function () { _cache = {}; };

  _tmpl.errorHandler = null;

  function _logErr (err, ctx) {

    err.riotData = {
      tagName: ctx && ctx.__ && ctx.__.tagName,
      _riot_id: ctx && ctx._riot_id  //eslint-disable-line camelcase
    };

    if (_tmpl.errorHandler) { _tmpl.errorHandler(err); }
    else if (
      typeof console !== 'undefined' &&
      typeof console.error === 'function'
    ) {
      console.error(err.message);
      console.log('<%s> %s', err.riotData.tagName || 'Unknown tag', this.tmpl); // eslint-disable-line
      console.log(this.data); // eslint-disable-line
    }
  }

  function _create (str) {
    var expr = _getTmpl(str);

    if (expr.slice(0, 11) !== 'try{return ') { expr = 'return ' + expr; }

    return new Function('E', expr + ';')    // eslint-disable-line no-new-func
  }

  var RE_DQUOTE = /\u2057/g;
  var RE_QBMARK = /\u2057(\d+)~/g;

  function _getTmpl (str) {
    var parts = brackets.split(str.replace(RE_DQUOTE, '"'), 1);
    var qstr = parts.qblocks;
    var expr;

    if (parts.length > 2 || parts[0]) {
      var i, j, list = [];

      for (i = j = 0; i < parts.length; ++i) {

        expr = parts[i];

        if (expr && (expr = i & 1

            ? _parseExpr(expr, 1, qstr)

            : '"' + expr
                .replace(/\\/g, '\\\\')
                .replace(/\r\n?|\n/g, '\\n')
                .replace(/"/g, '\\"') +
              '"'

          )) { list[j++] = expr; }

      }

      expr = j < 2 ? list[0]
           : '[' + list.join(',') + '].join("")';

    } else {

      expr = _parseExpr(parts[1], 0, qstr);
    }

    if (qstr.length) {
      expr = expr.replace(RE_QBMARK, function (_, pos) {
        return qstr[pos]
          .replace(/\r/g, '\\r')
          .replace(/\n/g, '\\n')
      });
    }
    return expr
  }

  var RE_CSNAME = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\u2057(\d+)~):/;
  var
    RE_BREND = {
      '(': /[()]/g,
      '[': /[[\]]/g,
      '{': /[{}]/g
    };

  function _parseExpr (expr, asText, qstr) {

    expr = expr
      .replace(/\s+/g, ' ').trim()
      .replace(/\ ?([[\({},?\.:])\ ?/g, '$1');

    if (expr) {
      var
        list = [],
        cnt = 0,
        match;

      while (expr &&
            (match = expr.match(RE_CSNAME)) &&
            !match.index
        ) {
        var
          key,
          jsb,
          re = /,|([[{(])|$/g;

        expr = RegExp.rightContext;
        key  = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1];

        while (jsb = (match = re.exec(expr))[1]) { skipBraces(jsb, re); }

        jsb  = expr.slice(0, match.index);
        expr = RegExp.rightContext;

        list[cnt++] = _wrapExpr(jsb, 1, key);
      }

      expr = !cnt ? _wrapExpr(expr, asText)
           : cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0];
    }
    return expr

    function skipBraces (ch, re) {
      var
        mm,
        lv = 1,
        ir = RE_BREND[ch];

      ir.lastIndex = re.lastIndex;
      while (mm = ir.exec(expr)) {
        if (mm[0] === ch) { ++lv; }
        else if (!--lv) { break }
      }
      re.lastIndex = lv ? expr.length : ir.lastIndex;
    }
  }

  // istanbul ignore next: not both
  var // eslint-disable-next-line max-len
    JS_CONTEXT = '"in this?this:' + (typeof window !== 'object' ? 'global' : 'window') + ').',
    JS_VARNAME = /[,{][\$\w]+(?=:)|(^ *|[^$\w\.{])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g,
    JS_NOPROPS = /^(?=(\.[$\w]+))\1(?:[^.[(]|$)/;

  function _wrapExpr (expr, asText, key) {
    var tb;

    expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
      if (mvar) {
        pos = tb ? 0 : pos + match.length;

        if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
          match = p + '("' + mvar + JS_CONTEXT + mvar;
          if (pos) { tb = (s = s[pos]) === '.' || s === '(' || s === '['; }
        } else if (pos) {
          tb = !JS_NOPROPS.test(s.slice(pos));
        }
      }
      return match
    });

    if (tb) {
      expr = 'try{return ' + expr + '}catch(e){E(e,this)}';
    }

    if (key) {

      expr = (tb
          ? 'function(){' + expr + '}.call(this)' : '(' + expr + ')'
        ) + '?"' + key + '":""';

    } else if (asText) {

      expr = 'function(v){' + (tb
          ? expr.replace('return ', 'v=') : 'v=(' + expr + ')'
        ) + ';return v||v===0?v:""}.call(this)';
    }

    return expr
  }

  _tmpl.version = brackets.version = 'v3.0.8';

  return _tmpl

})();

var observable$1 = function(el) {

  /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */

  el = el || {};

  /**
   * Private variables
   */
  var callbacks = {},
    slice = Array.prototype.slice;

  /**
   * Public Api
   */

  // extend the el object adding the observable methods
  Object.defineProperties(el, {
    /**
     * Listen to the given `event` ands
     * execute the `callback` each time an event is triggered.
     * @param  { String } event - event id
     * @param  { Function } fn - callback function
     * @returns { Object } el
     */
    on: {
      value: function(event, fn) {
        if (typeof fn == 'function')
          { (callbacks[event] = callbacks[event] || []).push(fn); }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Removes the given `event` listeners
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    off: {
      value: function(event, fn) {
        if (event == '*' && !fn) { callbacks = {}; }
        else {
          if (fn) {
            var arr = callbacks[event];
            for (var i = 0, cb; cb = arr && arr[i]; ++i) {
              if (cb == fn) { arr.splice(i--, 1); }
            }
          } else { delete callbacks[event]; }
        }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Listen to the given `event` and
     * execute the `callback` at most once
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    one: {
      value: function(event, fn) {
        function on() {
          el.off(event, on);
          fn.apply(el, arguments);
        }
        return el.on(event, on)
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Execute all callback functions that listen to
     * the given `event`
     * @param   { String } event - event id
     * @returns { Object } el
     */
    trigger: {
      value: function(event) {
        var arguments$1 = arguments;


        // getting the arguments
        var arglen = arguments.length - 1,
          args = new Array(arglen),
          fns,
          fn,
          i;

        for (i = 0; i < arglen; i++) {
          args[i] = arguments$1[i + 1]; // skip first argument
        }

        fns = slice.call(callbacks[event] || [], 0);

        for (i = 0; fn = fns[i]; ++i) {
          fn.apply(el, args);
        }

        if (callbacks['*'] && event != '*')
          { el.trigger.apply(el, ['*', event].concat(args)); }

        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    }
  });

  return el

};

function isBoolAttr(value) {
  return RE_BOOL_ATTRS.test(value)
}

/**
 * Check if passed argument is a function
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isFunction(value) {
  return typeof value === T_FUNCTION
}

/**
 * Check if passed argument is an object, exclude null
 * NOTE: use isObject(x) && !isArray(x) to excludes arrays.
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isObject(value) {
  return value && typeof value === T_OBJECT // typeof null is 'object'
}

/**
 * Check if passed argument is undefined
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isUndefined(value) {
  return typeof value === T_UNDEF
}

/**
 * Check if passed argument is a string
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isString(value) {
  return typeof value === T_STRING
}

/**
 * Check if passed argument is empty. Different from falsy, because we dont consider 0 or false to be blank
 * @param { * } value -
 * @returns { Boolean } -
 */
function isBlank(value) {
  return isNil(value) || value === ''
}

/**
 * Check against the null and undefined values
 * @param   { * }  value -
 * @returns {Boolean} -
 */
function isNil(value) {
  return isUndefined(value) || value === null
}

/**
 * Check if passed argument is a kind of array
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isArray(value) {
  return Array.isArray(value) || value instanceof Array
}

/**
 * Check whether object's property could be overridden
 * @param   { Object }  obj - source object
 * @param   { String }  key - object property
 * @returns { Boolean } true if writable
 */
function isWritable(obj, key) {
  var descriptor = getPropDescriptor(obj, key);
  return isUndefined(obj[key]) || descriptor && descriptor.writable
}


var check = Object.freeze({
	isBoolAttr: isBoolAttr,
	isFunction: isFunction,
	isObject: isObject,
	isUndefined: isUndefined,
	isString: isString,
	isBlank: isBlank,
	isNil: isNil,
	isArray: isArray,
	isWritable: isWritable
});

function each(list, fn) {
  var len = list ? list.length : 0;
  var i = 0;
  for (; i < len; i++) { fn(list[i], i); }
  return list
}

/**
 * Check whether an array contains an item
 * @param   { Array } array - target array
 * @param   { * } item - item to test
 * @returns { Boolean } -
 */
function contains(array, item) {
  return array.indexOf(item) !== -1
}

/**
 * Convert a string containing dashes to camel case
 * @param   { String } str - input string
 * @returns { String } my-string -> myString
 */
function toCamel(str) {
  return str.replace(/-(\w)/g, function (_, c) { return c.toUpperCase(); })
}

/**
 * Faster String startsWith alternative
 * @param   { String } str - source string
 * @param   { String } value - test string
 * @returns { Boolean } -
 */
function startsWith(str, value) {
  return str.slice(0, value.length) === value
}

/**
 * Helper function to set an immutable property
 * @param   { Object } el - object where the new property will be set
 * @param   { String } key - object key where the new property will be stored
 * @param   { * } value - value of the new property
 * @param   { Object } options - set the propery overriding the default options
 * @returns { Object } - the initial object
 */
function defineProperty(el, key, value, options) {
  Object.defineProperty(el, key, extend({
    value: value,
    enumerable: false,
    writable: false,
    configurable: true
  }, options));
  return el
}

/**
 * Function returning always a unique identifier
 * @returns { Number } - number from 0...n
 */
var uid = (function() {
  var i = -1;
  return function () { return ++i; }
})();

/**
 * Short alias for Object.getOwnPropertyDescriptor
 */
var getPropDescriptor = function (o, k) { return Object.getOwnPropertyDescriptor(o, k); };

/**
 * Extend any object with other properties
 * @param   { Object } src - source object
 * @returns { Object } the resulting extended object
 *
 * var obj = { foo: 'baz' }
 * extend(obj, {bar: 'bar', foo: 'bar'})
 * console.log(obj) => {bar: 'bar', foo: 'bar'}
 *
 */
function extend(src) {
  var obj;
  var i = 1;
  var args = arguments;
  var l = args.length;

  for (; i < l; i++) {
    if (obj = args[i]) {
      for (var key in obj) {
        // check if this property of the source object could be overridden
        if (isWritable(src, key))
          { src[key] = obj[key]; }
      }
    }
  }
  return src
}

var misc = Object.freeze({
	each: each,
	contains: contains,
	toCamel: toCamel,
	startsWith: startsWith,
	defineProperty: defineProperty,
	uid: uid,
	getPropDescriptor: getPropDescriptor,
	extend: extend
});

var settings$1 = extend(Object.create(brackets.settings), {
  skipAnonymousTags: true,
  // handle the auto updates on any DOM event
  autoUpdate: true
});

function handleEvent(dom, handler, e) {
  var ptag = this.__.parent;
  var item = this.__.item;

  if (!item)
    { while (ptag && !item) {
      item = ptag.__.item;
      ptag = ptag.__.parent;
    } }

  // override the event properties
  /* istanbul ignore next */
  if (isWritable(e, 'currentTarget')) { e.currentTarget = dom; }
  /* istanbul ignore next */
  if (isWritable(e, 'target')) { e.target = e.srcElement; }
  /* istanbul ignore next */
  if (isWritable(e, 'which')) { e.which = e.charCode || e.keyCode; }

  e.item = item;

  handler.call(this, e);

  // avoid auto updates
  if (!settings$1.autoUpdate) { return }

  if (!e.preventUpdate) {
    var p = getImmediateCustomParentTag(this);
    // fixes #2083
    if (p.isMounted) { p.update(); }
  }
}

/**
 * Attach an event to a DOM node
 * @param { String } name - event name
 * @param { Function } handler - event callback
 * @param { Object } dom - dom node
 * @param { Tag } tag - tag instance
 */
function setEventHandler(name, handler, dom, tag) {
  var eventName;
  var cb = handleEvent.bind(tag, dom, handler);

  // avoid to bind twice the same event
  // possible fix for #2332
  dom[name] = null;

  // normalize event name
  eventName = name.replace(RE_EVENTS_PREFIX, '');

  // cache the listener into the listeners array
  if (!contains(tag.__.listeners, dom)) { tag.__.listeners.push(dom); }
  if (!dom[RIOT_EVENTS_KEY]) { dom[RIOT_EVENTS_KEY] = {}; }
  if (dom[RIOT_EVENTS_KEY][name]) { dom.removeEventListener(eventName, dom[RIOT_EVENTS_KEY][name]); }

  dom[RIOT_EVENTS_KEY][name] = cb;
  dom.addEventListener(eventName, cb, false);
}

function updateDataIs(expr, parent, tagName) {
  var tag = expr.tag || expr.dom._tag;
  var ref;

  var ref$1 = tag ? tag.__ : {};
  var head = ref$1.head;
  var isVirtual = expr.dom.tagName === 'VIRTUAL';

  if (tag && expr.tagName === tagName) {
    tag.update();
    return
  }

  // sync _parent to accommodate changing tagnames
  if (tag) {
    // need placeholder before unmount
    if(isVirtual) {
      ref = createDOMPlaceholder();
      head.parentNode.insertBefore(ref, head);
    }

    tag.unmount(true);
  }

  // unable to get the tag name
  if (!isString(tagName)) { return }

  expr.impl = __TAG_IMPL[tagName];

  // unknown implementation
  if (!expr.impl) { return }

  expr.tag = tag = initChildTag(
    expr.impl, {
      root: expr.dom,
      parent: parent,
      tagName: tagName
    },
    expr.dom.innerHTML,
    parent
  );

  each(expr.attrs, function (a) { return setAttr(tag.root, a.name, a.value); });
  expr.tagName = tagName;
  tag.mount();

  // root exist first time, after use placeholder
  if (isVirtual) { makeReplaceVirtual(tag, ref || tag.root); }

  // parent is the placeholder tag, not the dynamic tag so clean up
  parent.__.onUnmount = function () {
    var delName = tag.opts.dataIs;
    arrayishRemove(tag.parent.tags, delName, tag);
    arrayishRemove(tag.__.parent.tags, delName, tag);
    tag.unmount();
  };
}

/**
 * Nomalize any attribute removing the "riot-" prefix
 * @param   { String } attrName - original attribute name
 * @returns { String } valid html attribute name
 */
function normalizeAttrName(attrName) {
  if (!attrName) { return null }
  attrName = attrName.replace(ATTRS_PREFIX, '');
  if (CASE_SENSITIVE_ATTRIBUTES[attrName]) { attrName = CASE_SENSITIVE_ATTRIBUTES[attrName]; }
  return attrName
}

/**
 * Update on single tag expression
 * @this Tag
 * @param { Object } expr - expression logic
 * @returns { undefined }
 */
function updateExpression(expr) {
  if (this.root && getAttr(this.root,'virtualized')) { return }

  var dom = expr.dom;
  // remove the riot- prefix
  var attrName = normalizeAttrName(expr.attr);
  var isToggle = contains([SHOW_DIRECTIVE, HIDE_DIRECTIVE], attrName);
  var isVirtual = expr.root && expr.root.tagName === 'VIRTUAL';
  var ref = this.__;
  var isAnonymous = ref.isAnonymous;
  var parent = dom && (expr.parent || dom.parentNode);
  // detect the style attributes
  var isStyleAttr = attrName === 'style';
  var isClassAttr = attrName === 'class';

  var value;

  // if it's a tag we could totally skip the rest
  if (expr._riot_id) {
    if (expr.__.wasCreated) {
      expr.update();
    // if it hasn't been mounted yet, do that now.
    } else {
      expr.mount();
      if (isVirtual) {
        makeReplaceVirtual(expr, expr.root);
      }
    }
    return
  }

  // if this expression has the update method it means it can handle the DOM changes by itself
  if (expr.update) { return expr.update() }

  var context = isToggle && !isAnonymous ? inheritParentProps.call(this) : this;

  // ...it seems to be a simple expression so we try to calculate its value
  value = tmpl(expr.expr, context);

  var hasValue = !isBlank(value);
  var isObj = isObject(value);

  // convert the style/class objects to strings
  if (isObj) {
    if (isClassAttr) {
      value = tmpl(JSON.stringify(value), this);
    } else if (isStyleAttr) {
      value = styleObjectToString(value);
    }
  }

  // remove original attribute
  if (expr.attr && (!expr.wasParsedOnce || !hasValue || value === false)) {
    // remove either riot-* attributes or just the attribute name
    remAttr(dom, getAttr(dom, expr.attr) ? expr.attr : attrName);
  }

  // for the boolean attributes we don't need the value
  // we can convert it to checked=true to checked=checked
  if (expr.bool) { value = value ? attrName : false; }
  if (expr.isRtag) { return updateDataIs(expr, this, value) }
  if (expr.wasParsedOnce && expr.value === value) { return }

  // update the expression value
  expr.value = value;
  expr.wasParsedOnce = true;

  // if the value is an object (and it's not a style or class attribute) we can not do much more with it
  if (isObj && !isClassAttr && !isStyleAttr && !isToggle) { return }
  // avoid to render undefined/null values
  if (!hasValue) { value = ''; }

  // textarea and text nodes have no attribute name
  if (!attrName) {
    // about #815 w/o replace: the browser converts the value to a string,
    // the comparison by "==" does too, but not in the server
    value += '';
    // test for parent avoids error with invalid assignment to nodeValue
    if (parent) {
      // cache the parent node because somehow it will become null on IE
      // on the next iteration
      expr.parent = parent;
      if (parent.tagName === 'TEXTAREA') {
        parent.value = value;                    // #1113
        if (!IE_VERSION) { dom.nodeValue = value; }  // #1625 IE throws here, nodeValue
      }                                         // will be available on 'updated'
      else { dom.nodeValue = value; }
    }
    return
  }


  // event handler
  if (isFunction(value)) {
    setEventHandler(attrName, value, dom, this);
  // show / hide
  } else if (isToggle) {
    toggleVisibility(dom, attrName === HIDE_DIRECTIVE ? !value : value);
  // handle attributes
  } else {
    if (expr.bool) {
      dom[attrName] = value;
    }

    if (attrName === 'value' && dom.value !== value) {
      dom.value = value;
    } else if (hasValue && value !== false) {
      setAttr(dom, attrName, value);
    }

    // make sure that in case of style changes
    // the element stays hidden
    if (isStyleAttr && dom.hidden) { toggleVisibility(dom, false); }
  }
}

/**
 * Update all the expressions in a Tag instance
 * @this Tag
 * @param { Array } expressions - expression that must be re evaluated
 */
function updateAllExpressions(expressions) {
  each(expressions, updateExpression.bind(this));
}

var IfExpr = {
  init: function init(dom, tag, expr) {
    remAttr(dom, CONDITIONAL_DIRECTIVE);
    this.tag = tag;
    this.expr = expr;
    this.stub = createDOMPlaceholder();
    this.pristine = dom;

    var p = dom.parentNode;
    p.insertBefore(this.stub, dom);
    p.removeChild(dom);

    return this
  },
  update: function update() {
    this.value = tmpl(this.expr, this.tag);

    if (this.value && !this.current) { // insert
      this.current = this.pristine.cloneNode(true);
      this.stub.parentNode.insertBefore(this.current, this.stub);
      this.expressions = parseExpressions.apply(this.tag, [this.current, true]);
    } else if (!this.value && this.current) { // remove
      unmountAll(this.expressions);
      if (this.current._tag) {
        this.current._tag.unmount();
      } else if (this.current.parentNode) {
        this.current.parentNode.removeChild(this.current);
      }
      this.current = null;
      this.expressions = [];
    }

    if (this.value) { updateAllExpressions.call(this.tag, this.expressions); }
  },
  unmount: function unmount() {
    unmountAll(this.expressions || []);
  }
};

var RefExpr = {
  init: function init(dom, parent, attrName, attrValue) {
    this.dom = dom;
    this.attr = attrName;
    this.rawValue = attrValue;
    this.parent = parent;
    this.hasExp = tmpl.hasExpr(attrValue);
    return this
  },
  update: function update() {
    var old = this.value;
    var customParent = this.parent && getImmediateCustomParentTag(this.parent);
    // if the referenced element is a custom tag, then we set the tag itself, rather than DOM
    var tagOrDom = this.dom.__ref || this.tag || this.dom;

    this.value = this.hasExp ? tmpl(this.rawValue, this.parent) : this.rawValue;

    // the name changed, so we need to remove it from the old key (if present)
    if (!isBlank(old) && customParent) { arrayishRemove(customParent.refs, old, tagOrDom); }
    if (!isBlank(this.value) && isString(this.value)) {
      // add it to the refs of parent tag (this behavior was changed >=3.0)
      if (customParent) { arrayishAdd(
        customParent.refs,
        this.value,
        tagOrDom,
        // use an array if it's a looped node and the ref is not an expression
        null,
        this.parent.__.index
      ); }

      if (this.value !== old) {
        setAttr(this.dom, this.attr, this.value);
      }
    } else {
      remAttr(this.dom, this.attr);
    }

    // cache the ref bound to this dom node
    // to reuse it in future (see also #2329)
    if (!this.dom.__ref) { this.dom.__ref = tagOrDom; }
  },
  unmount: function unmount() {
    var tagOrDom = this.tag || this.dom;
    var customParent = this.parent && getImmediateCustomParentTag(this.parent);
    if (!isBlank(this.value) && customParent)
      { arrayishRemove(customParent.refs, this.value, tagOrDom); }
  }
};

function mkitem(expr, key, val, base) {
  var item = base ? Object.create(base) : {};
  item[expr.key] = key;
  if (expr.pos) { item[expr.pos] = val; }
  return item
}

/**
 * Unmount the redundant tags
 * @param   { Array } items - array containing the current items to loop
 * @param   { Array } tags - array containing all the children tags
 */
function unmountRedundant(items, tags) {
  var i = tags.length;
  var j = items.length;

  while (i > j) {
    i--;
    remove.apply(tags[i], [tags, i]);
  }
}


/**
 * Remove a child tag
 * @this Tag
 * @param   { Array } tags - tags collection
 * @param   { Number } i - index of the tag to remove
 */
function remove(tags, i) {
  tags.splice(i, 1);
  this.unmount();
  arrayishRemove(this.parent, this, this.__.tagName, true);
}

/**
 * Move the nested custom tags in non custom loop tags
 * @this Tag
 * @param   { Number } i - current position of the loop tag
 */
function moveNestedTags(i) {
  var this$1 = this;

  each(Object.keys(this.tags), function (tagName) {
    moveChildTag.apply(this$1.tags[tagName], [tagName, i]);
  });
}

/**
 * Move a child tag
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Tag } nextTag - instance of the next tag preceding the one we want to move
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function move(root, nextTag, isVirtual) {
  if (isVirtual)
    { moveVirtual.apply(this, [root, nextTag]); }
  else
    { safeInsert(root, this.root, nextTag.root); }
}

/**
 * Insert and mount a child tag
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Tag } nextTag - instance of the next tag preceding the one we want to insert
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function insert(root, nextTag, isVirtual) {
  if (isVirtual)
    { makeVirtual.apply(this, [root, nextTag]); }
  else
    { safeInsert(root, this.root, nextTag.root); }
}

/**
 * Append a new tag into the DOM
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function append(root, isVirtual) {
  if (isVirtual)
    { makeVirtual.call(this, root); }
  else
    { root.appendChild(this.root); }
}

/**
 * Return the value we want to use to lookup the postion of our items in the collection
 * @param   { String }  keyAttr         - lookup string or expression
 * @param   { * }       originalItem    - original item from the collection
 * @param   { Object }  keyedItem       - object created by riot via { item, i in collection }
 * @param   { Boolean } hasKeyAttrExpr  - flag to check whether the key is an expression
 * @returns { * } value that we will use to figure out the item position via collection.indexOf
 */
function getItemId(keyAttr, originalItem, keyedItem, hasKeyAttrExpr) {
  if (keyAttr) {
    return hasKeyAttrExpr ?  tmpl(keyAttr, keyedItem) :  originalItem[keyAttr]
  }

  return originalItem
}

/**
 * Manage tags having the 'each'
 * @param   { HTMLElement } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 * @returns { Object } expression object for this each loop
 */
function _each(dom, parent, expr) {
  var mustReorder = typeof getAttr(dom, LOOP_NO_REORDER_DIRECTIVE) !== T_STRING || remAttr(dom, LOOP_NO_REORDER_DIRECTIVE);
  var keyAttr = getAttr(dom, KEY_DIRECTIVE);
  var hasKeyAttrExpr = keyAttr ? tmpl.hasExpr(keyAttr) : false;
  var tagName = getTagName(dom);
  var impl = __TAG_IMPL[tagName];
  var parentNode = dom.parentNode;
  var placeholder = createDOMPlaceholder();
  var child = getTag(dom);
  var ifExpr = getAttr(dom, CONDITIONAL_DIRECTIVE);
  var tags = [];
  var isLoop = true;
  var innerHTML = dom.innerHTML;
  var isAnonymous = !__TAG_IMPL[tagName];
  var isVirtual = dom.tagName === 'VIRTUAL';
  var oldItems = [];
  var hasKeys;

  // remove the each property from the original tag
  remAttr(dom, LOOP_DIRECTIVE);
  remAttr(dom, KEY_DIRECTIVE);

  // parse the each expression
  expr = tmpl.loopKeys(expr);
  expr.isLoop = true;

  if (ifExpr) { remAttr(dom, CONDITIONAL_DIRECTIVE); }

  // insert a marked where the loop tags will be injected
  parentNode.insertBefore(placeholder, dom);
  parentNode.removeChild(dom);

  expr.update = function updateEach() {
    // get the new items collection
    expr.value = tmpl(expr.val, parent);

    var items = expr.value;
    var frag = createFrag();
    var isObject$$1 = !isArray(items) && !isString(items);
    var root = placeholder.parentNode;
    var tmpItems = [];

    // if this DOM was removed the update here is useless
    // this condition fixes also a weird async issue on IE in our unit test
    if (!root) { return }

    // object loop. any changes cause full redraw
    if (isObject$$1) {
      hasKeys = items || false;
      items = hasKeys ?
        Object.keys(items).map(function (key) { return mkitem(expr, items[key], key); }) : [];
    } else {
      hasKeys = false;
    }

    if (ifExpr) {
      items = items.filter(function (item, i) {
        if (expr.key && !isObject$$1)
          { return !!tmpl(ifExpr, mkitem(expr, item, i, parent)) }

        return !!tmpl(ifExpr, extend(Object.create(parent), item))
      });
    }

    // loop all the new items
    each(items, function (_item, i) {
      var item = !hasKeys && expr.key ? mkitem(expr, _item, i) : _item;
      var itemId = getItemId(keyAttr, _item, item, hasKeyAttrExpr);
      // reorder only if the items are objects
      var doReorder = mustReorder && typeof _item === T_OBJECT && !hasKeys;
      var oldPos = oldItems.indexOf(itemId);
      var isNew = oldPos === -1;
      var pos = !isNew && doReorder ? oldPos : i;
      // does a tag exist in this position?
      var tag = tags[pos];
      var mustAppend = i >= oldItems.length;
      var mustCreate =  doReorder && isNew || !doReorder && !tag;

      // new tag
      if (mustCreate) {
        tag = createTag(impl, {
          parent: parent,
          isLoop: isLoop,
          isAnonymous: isAnonymous,
          tagName: tagName,
          root: dom.cloneNode(isAnonymous),
          item: item,
          index: i,
        }, innerHTML);

        // mount the tag
        tag.mount();

        if (mustAppend)
          { append.apply(tag, [frag || root, isVirtual]); }
        else
          { insert.apply(tag, [root, tags[i], isVirtual]); }

        if (!mustAppend) { oldItems.splice(i, 0, item); }
        tags.splice(i, 0, tag);
        if (child) { arrayishAdd(parent.tags, tagName, tag, true); }
      } else if (pos !== i && doReorder) {
        // move
        if (keyAttr || contains(items, oldItems[pos])) {
          move.apply(tag, [root, tags[i], isVirtual]);
          // move the old tag instance
          tags.splice(i, 0, tags.splice(pos, 1)[0]);
          // move the old item
          oldItems.splice(i, 0, oldItems.splice(pos, 1)[0]);
        }

        // update the position attribute if it exists
        if (expr.pos) { tag[expr.pos] = i; }

        // if the loop tags are not custom
        // we need to move all their custom tags into the right position
        if (!child && tag.tags) { moveNestedTags.call(tag, i); }
      }

      // cache the original item to use it in the events bound to this node
      // and its children
      tag.__.item = item;
      tag.__.index = i;
      tag.__.parent = parent;

      tmpItems[i] = itemId;

      if (!mustCreate) { tag.update(item); }
    });

    // remove the redundant tags
    unmountRedundant(items, tags);

    // clone the items array
    oldItems = tmpItems.slice();

    root.insertBefore(frag, placeholder);
  };

  expr.unmount = function () {
    each(tags, function (t) { t.unmount(); });
  };

  return expr
}

function parseExpressions(root, mustIncludeRoot) {
  var this$1 = this;

  var expressions = [];

  walkNodes(root, function (dom) {
    var type = dom.nodeType;
    var attr;
    var tagImpl;

    if (!mustIncludeRoot && dom === root) { return }

    // text node
    if (type === 3 && dom.parentNode.tagName !== 'STYLE' && tmpl.hasExpr(dom.nodeValue))
      { expressions.push({dom: dom, expr: dom.nodeValue}); }

    if (type !== 1) { return }

    var isVirtual = dom.tagName === 'VIRTUAL';

    // loop. each does it's own thing (for now)
    if (attr = getAttr(dom, LOOP_DIRECTIVE)) {
      if(isVirtual) { setAttr(dom, 'loopVirtual', true); } // ignore here, handled in _each
      expressions.push(_each(dom, this$1, attr));
      return false
    }

    // if-attrs become the new parent. Any following expressions (either on the current
    // element, or below it) become children of this expression.
    if (attr = getAttr(dom, CONDITIONAL_DIRECTIVE)) {
      expressions.push(Object.create(IfExpr).init(dom, this$1, attr));
      return false
    }

    if (attr = getAttr(dom, IS_DIRECTIVE)) {
      if (tmpl.hasExpr(attr)) {
        expressions.push({
          isRtag: true,
          expr: attr,
          dom: dom,
          attrs: [].slice.call(dom.attributes)
        });

        return false
      }
    }

    // if this is a tag, stop traversing here.
    // we ignore the root, since parseExpressions is called while we're mounting that root
    tagImpl = getTag(dom);

    if(isVirtual) {
      if(getAttr(dom, 'virtualized')) {dom.parentElement.removeChild(dom); } // tag created, remove from dom
      if(!tagImpl && !getAttr(dom, 'virtualized') && !getAttr(dom, 'loopVirtual'))  // ok to create virtual tag
        { tagImpl = { tmpl: dom.outerHTML }; }
    }

    if (tagImpl && (dom !== root || mustIncludeRoot)) {
      if(isVirtual && !getAttr(dom, IS_DIRECTIVE)) { // handled in update
        // can not remove attribute like directives
        // so flag for removal after creation to prevent maximum stack error
        setAttr(dom, 'virtualized', true);
        var tag = createTag(
          {tmpl: dom.outerHTML},
          {root: dom, parent: this$1},
          dom.innerHTML
        );

        expressions.push(tag); // no return, anonymous tag, keep parsing
      } else {
        expressions.push(
          initChildTag(
            tagImpl,
            {
              root: dom,
              parent: this$1
            },
            dom.innerHTML,
            this$1
          )
        );
        return false
      }
    }

    // attribute expressions
    parseAttributes.apply(this$1, [dom, dom.attributes, function (attr, expr) {
      if (!expr) { return }
      expressions.push(expr);
    }]);
  });

  return expressions
}

/**
 * Calls `fn` for every attribute on an element. If that attr has an expression,
 * it is also passed to fn.
 * @this Tag
 * @param   { HTMLElement } dom - dom node to parse
 * @param   { Array } attrs - array of attributes
 * @param   { Function } fn - callback to exec on any iteration
 */
function parseAttributes(dom, attrs, fn) {
  var this$1 = this;

  each(attrs, function (attr) {
    if (!attr) { return false }

    var name = attr.name;
    var bool = isBoolAttr(name);
    var expr;

    if (contains(REF_DIRECTIVES, name) && dom.tagName.toLowerCase() !== YIELD_TAG) {
      expr =  Object.create(RefExpr).init(dom, this$1, name, attr.value);
    } else if (tmpl.hasExpr(attr.value)) {
      expr = {dom: dom, expr: attr.value, attr: name, bool: bool};
    }

    fn(attr, expr);
  });
}

var reHasYield  = /<yield\b/i;
var reYieldAll  = /<yield\s*(?:\/>|>([\S\s]*?)<\/yield\s*>|>)/ig;
var reYieldSrc  = /<yield\s+to=['"]([^'">]*)['"]\s*>([\S\s]*?)<\/yield\s*>/ig;
var reYieldDest = /<yield\s+from=['"]?([-\w]+)['"]?\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig;
var rootEls = { tr: 'tbody', th: 'tr', td: 'tr', col: 'colgroup' };
var tblTags = IE_VERSION && IE_VERSION < 10 ? RE_SPECIAL_TAGS : RE_SPECIAL_TAGS_NO_OPTION;
var GENERIC = 'div';
var SVG = 'svg';


/*
  Creates the root element for table or select child elements:
  tr/th/td/thead/tfoot/tbody/caption/col/colgroup/option/optgroup
*/
function specialTags(el, tmpl, tagName) {

  var
    select = tagName[0] === 'o',
    parent = select ? 'select>' : 'table>';

  // trim() is important here, this ensures we don't have artifacts,
  // so we can check if we have only one element inside the parent
  el.innerHTML = '<' + parent + tmpl.trim() + '</' + parent;
  parent = el.firstChild;

  // returns the immediate parent if tr/th/td/col is the only element, if not
  // returns the whole tree, as this can include additional elements
  /* istanbul ignore next */
  if (select) {
    parent.selectedIndex = -1;  // for IE9, compatible w/current riot behavior
  } else {
    // avoids insertion of cointainer inside container (ex: tbody inside tbody)
    var tname = rootEls[tagName];
    if (tname && parent.childElementCount === 1) { parent = $(tname, parent); }
  }
  return parent
}

/*
  Replace the yield tag from any tag template with the innerHTML of the
  original tag in the page
*/
function replaceYield(tmpl, html) {
  // do nothing if no yield
  if (!reHasYield.test(tmpl)) { return tmpl }

  // be careful with #1343 - string on the source having `$1`
  var src = {};

  html = html && html.replace(reYieldSrc, function (_, ref, text) {
    src[ref] = src[ref] || text;   // preserve first definition
    return ''
  }).trim();

  return tmpl
    .replace(reYieldDest, function (_, ref, def) {  // yield with from - to attrs
      return src[ref] || def || ''
    })
    .replace(reYieldAll, function (_, def) {        // yield without any "from"
      return html || def || ''
    })
}

/**
 * Creates a DOM element to wrap the given content. Normally an `DIV`, but can be
 * also a `TABLE`, `SELECT`, `TBODY`, `TR`, or `COLGROUP` element.
 *
 * @param   { String } tmpl  - The template coming from the custom tag definition
 * @param   { String } html - HTML content that comes from the DOM element where you
 *           will mount the tag, mostly the original tag in the page
 * @param   { Boolean } isSvg - true if the root node is an svg
 * @returns { HTMLElement } DOM element with _tmpl_ merged through `YIELD` with the _html_.
 */
function mkdom(tmpl, html, isSvg$$1) {
  var match   = tmpl && tmpl.match(/^\s*<([-\w]+)/);
  var  tagName = match && match[1].toLowerCase();
  var el = mkEl(isSvg$$1 ? SVG : GENERIC);

  // replace all the yield tags with the tag inner html
  tmpl = replaceYield(tmpl, html);

  /* istanbul ignore next */
  if (tblTags.test(tagName))
    { el = specialTags(el, tmpl, tagName); }
  else
    { setInnerHTML(el, tmpl, isSvg$$1); }

  return el
}

function Tag$1(el, opts) {
  // get the tag properties from the class constructor
  var ref = this;
  var name = ref.name;
  var tmpl = ref.tmpl;
  var css = ref.css;
  var attrs = ref.attrs;
  var onCreate = ref.onCreate;
  // register a new tag and cache the class prototype
  if (!__TAG_IMPL[name]) {
    tag$1(name, tmpl, css, attrs, onCreate);
    // cache the class constructor
    __TAG_IMPL[name].class = this.constructor;
  }

  // mount the tag using the class instance
  mountTo(el, name, opts, this);
  // inject the component css
  if (css) { styleManager.inject(); }

  return this
}

/**
 * Create a new riot tag implementation
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   tmpl - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
function tag$1(name, tmpl, css, attrs, fn) {
  if (isFunction(attrs)) {
    fn = attrs;

    if (/^[\w-]+\s?=/.test(css)) {
      attrs = css;
      css = '';
    } else
      { attrs = ''; }
  }

  if (css) {
    if (isFunction(css))
      { fn = css; }
    else
      { styleManager.add(css); }
  }

  name = name.toLowerCase();
  __TAG_IMPL[name] = { name: name, tmpl: tmpl, attrs: attrs, fn: fn };

  return name
}

/**
 * Create a new riot tag implementation (for use by the compiler)
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   tmpl - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
function tag2$1(name, tmpl, css, attrs, fn) {
  if (css) { styleManager.add(css, name); }

  __TAG_IMPL[name] = { name: name, tmpl: tmpl, attrs: attrs, fn: fn };

  return name
}

/**
 * Mount a tag using a specific tag implementation
 * @param   { * } selector - tag DOM selector or DOM node/s
 * @param   { String } tagName - tag implementation name
 * @param   { Object } opts - tag logic
 * @returns { Array } new tags instances
 */
function mount$1(selector, tagName, opts) {
  var tags = [];
  var elem, allTags;

  function pushTagsTo(root) {
    if (root.tagName) {
      var riotTag = getAttr(root, IS_DIRECTIVE), tag;

      // have tagName? force riot-tag to be the same
      if (tagName && riotTag !== tagName) {
        riotTag = tagName;
        setAttr(root, IS_DIRECTIVE, tagName);
      }

      tag = mountTo(root, riotTag || root.tagName.toLowerCase(), opts);

      if (tag)
        { tags.push(tag); }
    } else if (root.length)
      { each(root, pushTagsTo); } // assume nodeList
  }

  // inject styles into DOM
  styleManager.inject();

  if (isObject(tagName)) {
    opts = tagName;
    tagName = 0;
  }

  // crawl the DOM to find the tag
  if (isString(selector)) {
    selector = selector === '*' ?
      // select all registered tags
      // & tags found with the riot-tag attribute set
      allTags = selectTags() :
      // or just the ones named like the selector
      selector + selectTags(selector.split(/, */));

    // make sure to pass always a selector
    // to the querySelectorAll function
    elem = selector ? $$(selector) : [];
  }
  else
    // probably you have passed already a tag or a NodeList
    { elem = selector; }

  // select all the registered and mount them inside their root elements
  if (tagName === '*') {
    // get all custom tags
    tagName = allTags || selectTags();
    // if the root els it's just a single tag
    if (elem.tagName)
      { elem = $$(tagName, elem); }
    else {
      // select all the children for all the different root elements
      var nodeList = [];

      each(elem, function (_el) { return nodeList.push($$(tagName, _el)); });

      elem = nodeList;
    }
    // get rid of the tagName
    tagName = 0;
  }

  pushTagsTo(elem);

  return tags
}

// Create a mixin that could be globally shared across all the tags
var mixins = {};
var globals = mixins[GLOBAL_MIXIN] = {};
var mixins_id = 0;

/**
 * Create/Return a mixin by its name
 * @param   { String }  name - mixin name (global mixin if object)
 * @param   { Object }  mix - mixin logic
 * @param   { Boolean } g - is global?
 * @returns { Object }  the mixin logic
 */
function mixin$1(name, mix, g) {
  // Unnamed global
  if (isObject(name)) {
    mixin$1(("__" + (mixins_id++) + "__"), name, true);
    return
  }

  var store = g ? globals : mixins;

  // Getter
  if (!mix) {
    if (isUndefined(store[name]))
      { throw new Error(("Unregistered mixin: " + name)) }

    return store[name]
  }

  // Setter
  store[name] = isFunction(mix) ?
    extend(mix.prototype, store[name] || {}) && mix :
    extend(store[name] || {}, mix);
}

/**
 * Update all the tags instances created
 * @returns { Array } all the tags instances
 */
function update$1() {
  return each(__TAGS_CACHE, function (tag) { return tag.update(); })
}

function unregister$1(name) {
  __TAG_IMPL[name] = null;
}

var version$1 = 'WIP';


var core = Object.freeze({
	Tag: Tag$1,
	tag: tag$1,
	tag2: tag2$1,
	mount: mount$1,
	mixin: mixin$1,
	update: update$1,
	unregister: unregister$1,
	version: version$1
});

function updateOpts(isLoop, parent, isAnonymous, opts, instAttrs) {
  // isAnonymous `each` tags treat `dom` and `root` differently. In this case
  // (and only this case) we don't need to do updateOpts, because the regular parse
  // will update those attrs. Plus, isAnonymous tags don't need opts anyway
  if (isLoop && isAnonymous) { return }
  var ctx = isLoop ? inheritParentProps.call(this) : parent || this;

  each(instAttrs, function (attr) {
    if (attr.expr) { updateExpression.call(ctx, attr.expr); }
    // normalize the attribute names
    opts[toCamel(attr.name).replace(ATTRS_PREFIX, '')] = attr.expr ? attr.expr.value : attr.value;
  });
}

/**
 * Manage the mount state of a tag triggering also the observable events
 * @this Tag
 * @param { Boolean } value - ..of the isMounted flag
 */
function setMountState(value) {
  var ref = this.__;
  var isAnonymous = ref.isAnonymous;

  defineProperty(this, 'isMounted', value);

  if (!isAnonymous) {
    if (value) { this.trigger('mount'); }
    else {
      this.trigger('unmount');
      this.off('*');
      this.__.wasCreated = false;
    }
  }
}


/**
 * Tag creation factory function
 * @constructor
 * @param { Object } impl - it contains the tag template, and logic
 * @param { Object } conf - tag options
 * @param { String } innerHTML - html that eventually we need to inject in the tag
 */
function createTag(impl, conf, innerHTML) {
  if ( impl === void 0 ) impl = {};
  if ( conf === void 0 ) conf = {};

  var tag$$1 = conf.context || {};
  var opts = extend({}, conf.opts);
  var parent = conf.parent;
  var isLoop = conf.isLoop;
  var isAnonymous = !!conf.isAnonymous;
  var skipAnonymous = settings$1.skipAnonymousTags && isAnonymous;
  var item = conf.item;
  // available only for the looped nodes
  var index = conf.index;
  // All attributes on the Tag when it's first parsed
  var instAttrs = [];
  // expressions on this type of Tag
  var implAttrs = [];
  var expressions = [];
  var root = conf.root;
  var tagName = conf.tagName || getTagName(root);
  var isVirtual = tagName === 'virtual';
  var isInline = !isVirtual && !impl.tmpl;
  var dom;

  // make this tag observable
  if (!skipAnonymous) { observable$1(tag$$1); }
  // only call unmount if we have a valid __TAG_IMPL (has name property)
  if (impl.name && root._tag) { root._tag.unmount(true); }

  // not yet mounted
  defineProperty(tag$$1, 'isMounted', false);

  defineProperty(tag$$1, '__', {
    isAnonymous: isAnonymous,
    instAttrs: instAttrs,
    innerHTML: innerHTML,
    tagName: tagName,
    index: index,
    isLoop: isLoop,
    isInline: isInline,
    // tags having event listeners
    // it would be better to use weak maps here but we can not introduce breaking changes now
    listeners: [],
    // these vars will be needed only for the virtual tags
    virts: [],
    wasCreated: false,
    tail: null,
    head: null,
    parent: null,
    item: null
  });

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  defineProperty(tag$$1, '_riot_id', uid()); // base 1 allows test !t._riot_id
  defineProperty(tag$$1, 'root', root);
  extend(tag$$1, { opts: opts }, item);
  // protect the "tags" and "refs" property from being overridden
  defineProperty(tag$$1, 'parent', parent || null);
  defineProperty(tag$$1, 'tags', {});
  defineProperty(tag$$1, 'refs', {});

  if (isInline || isLoop && isAnonymous) {
    dom = root;
  } else {
    if (!isVirtual) { root.innerHTML = ''; }
    dom = mkdom(impl.tmpl, innerHTML, isSvg(root));
  }

  /**
   * Update the tag expressions and options
   * @param   { * }  data - data we want to use to extend the tag properties
   * @returns { Tag } the current tag instance
   */
  defineProperty(tag$$1, 'update', function tagUpdate(data) {
    var nextOpts = {};
    var canTrigger = tag$$1.isMounted && !skipAnonymous;

    // inherit properties from the parent tag
    if (isAnonymous && parent) { extend(tag$$1, parent); }
    extend(tag$$1, data);

    updateOpts.apply(tag$$1, [isLoop, parent, isAnonymous, nextOpts, instAttrs]);

    if (
      canTrigger &&
      tag$$1.isMounted &&
      isFunction(tag$$1.shouldUpdate) && !tag$$1.shouldUpdate(data, nextOpts)
    ) {
      return tag$$1
    }

    extend(opts, nextOpts);

    if (canTrigger) { tag$$1.trigger('update', data); }
    updateAllExpressions.call(tag$$1, expressions);
    if (canTrigger) { tag$$1.trigger('updated'); }

    return tag$$1
  });

  /**
   * Add a mixin to this tag
   * @returns { Tag } the current tag instance
   */
  defineProperty(tag$$1, 'mixin', function tagMixin() {
    each(arguments, function (mix) {
      var instance;
      var obj;
      var props = [];

      // properties blacklisted and will not be bound to the tag instance
      var propsBlacklist = ['init', '__proto__'];

      mix = isString(mix) ? mixin$1(mix) : mix;

      // check if the mixin is a function
      if (isFunction(mix)) {
        // create the new mixin instance
        instance = new mix();
      } else { instance = mix; }

      var proto = Object.getPrototypeOf(instance);

      // build multilevel prototype inheritance chain property list
      do { props = props.concat(Object.getOwnPropertyNames(obj || instance)); }
      while (obj = Object.getPrototypeOf(obj || instance))

      // loop the keys in the function prototype or the all object keys
      each(props, function (key) {
        // bind methods to tag
        // allow mixins to override other properties/parent mixins
        if (!contains(propsBlacklist, key)) {
          // check for getters/setters
          var descriptor = getPropDescriptor(instance, key) || getPropDescriptor(proto, key);
          var hasGetterSetter = descriptor && (descriptor.get || descriptor.set);

          // apply method only if it does not already exist on the instance
          if (!tag$$1.hasOwnProperty(key) && hasGetterSetter) {
            Object.defineProperty(tag$$1, key, descriptor);
          } else {
            tag$$1[key] = isFunction(instance[key]) ?
              instance[key].bind(tag$$1) :
              instance[key];
          }
        }
      });

      // init method will be called automatically
      if (instance.init)
        { instance.init.bind(tag$$1)(opts); }
    });

    return tag$$1
  });

  /**
   * Mount the current tag instance
   * @returns { Tag } the current tag instance
   */
  defineProperty(tag$$1, 'mount', function tagMount() {
    root._tag = tag$$1; // keep a reference to the tag just created

    // Read all the attrs on this instance. This give us the info we need for updateOpts
    parseAttributes.apply(parent, [root, root.attributes, function (attr, expr) {
      if (!isAnonymous && RefExpr.isPrototypeOf(expr)) { expr.tag = tag$$1; }
      attr.expr = expr;
      instAttrs.push(attr);
    }]);

    // update the root adding custom attributes coming from the compiler
    walkAttrs(impl.attrs, function (k, v) { implAttrs.push({name: k, value: v}); });
    parseAttributes.apply(tag$$1, [root, implAttrs, function (attr, expr) {
      if (expr) { expressions.push(expr); }
      else { setAttr(root, attr.name, attr.value); }
    }]);

    // initialiation
    updateOpts.apply(tag$$1, [isLoop, parent, isAnonymous, opts, instAttrs]);

    // add global mixins
    var globalMixin = mixin$1(GLOBAL_MIXIN);

    if (globalMixin && !skipAnonymous) {
      for (var i in globalMixin) {
        if (globalMixin.hasOwnProperty(i)) {
          tag$$1.mixin(globalMixin[i]);
        }
      }
    }

    if (impl.fn) { impl.fn.call(tag$$1, opts); }

    if (!skipAnonymous) { tag$$1.trigger('before-mount'); }

    // parse layout after init. fn may calculate args for nested custom tags
    each(parseExpressions.apply(tag$$1, [dom, isAnonymous]), function (e) { return expressions.push(e); });

    tag$$1.update(item);

    if (!isAnonymous && !isInline) {
      while (dom.firstChild) { root.appendChild(dom.firstChild); }
    }

    defineProperty(tag$$1, 'root', root);

    // if we need to wait that the parent "mount" or "updated" event gets triggered
    if (!skipAnonymous && tag$$1.parent) {
      var p = getImmediateCustomParentTag(tag$$1.parent);
      p.one(!p.isMounted ? 'mount' : 'updated', function () {
        setMountState.call(tag$$1, true);
      });
    } else {
      // otherwise it's not a child tag we can trigger its mount event
      setMountState.call(tag$$1, true);
    }

    tag$$1.__.wasCreated = true;

    return tag$$1

  });

  /**
   * Unmount the tag instance
   * @param { Boolean } mustKeepRoot - if it's true the root node will not be removed
   * @returns { Tag } the current tag instance
   */
  defineProperty(tag$$1, 'unmount', function tagUnmount(mustKeepRoot) {
    var el = tag$$1.root;
    var p = el.parentNode;
    var tagIndex = __TAGS_CACHE.indexOf(tag$$1);

    if (!skipAnonymous) { tag$$1.trigger('before-unmount'); }

    // clear all attributes coming from the mounted tag
    walkAttrs(impl.attrs, function (name) {
      if (startsWith(name, ATTRS_PREFIX))
        { name = name.slice(ATTRS_PREFIX.length); }

      remAttr(root, name);
    });

    // remove all the event listeners
    tag$$1.__.listeners.forEach(function (dom) {
      Object.keys(dom[RIOT_EVENTS_KEY]).forEach(function (eventName) {
        dom.removeEventListener(eventName, dom[RIOT_EVENTS_KEY][eventName]);
      });
    });

    // remove tag instance from the global tags cache collection
    if (tagIndex !== -1) { __TAGS_CACHE.splice(tagIndex, 1); }

    // clean up the parent tags object
    if (parent && !isAnonymous) {
      var ptag = getImmediateCustomParentTag(parent);

      if (isVirtual) {
        Object
          .keys(tag$$1.tags)
          .forEach(function (tagName) { return arrayishRemove(ptag.tags, tagName, tag$$1.tags[tagName]); });
      } else {
        arrayishRemove(ptag.tags, tagName, tag$$1);
      }
    }

    // unmount all the virtual directives
    if (tag$$1.__.virts) {
      each(tag$$1.__.virts, function (v) {
        if (v.parentNode) { v.parentNode.removeChild(v); }
      });
    }

    // allow expressions to unmount themselves
    unmountAll(expressions);
    each(instAttrs, function (a) { return a.expr && a.expr.unmount && a.expr.unmount(); });

    // clear the tag html if it's necessary
    if (mustKeepRoot) { setInnerHTML(el, ''); }
    // otherwise detach the root tag from the DOM
    else if (p) { p.removeChild(el); }

    // custom internal unmount function to avoid relying on the observable
    if (tag$$1.__.onUnmount) { tag$$1.__.onUnmount(); }

    // weird fix for a weird edge case #2409 and #2436
    // some users might use your software not as you've expected
    // so I need to add these dirty hacks to mitigate unexpected issues
    if (!tag$$1.isMounted) { setMountState.call(tag$$1, true); }

    setMountState.call(tag$$1, false);

    delete tag$$1.root._tag;

    return tag$$1
  });

  return tag$$1
}

function getTag(dom) {
  return dom.tagName && __TAG_IMPL[getAttr(dom, IS_DIRECTIVE) ||
    getAttr(dom, IS_DIRECTIVE) || dom.tagName.toLowerCase()]
}

/**
 * Move the position of a custom tag in its parent tag
 * @this Tag
 * @param   { String } tagName - key where the tag was stored
 * @param   { Number } newPos - index where the new tag will be stored
 */
function moveChildTag(tagName, newPos) {
  var parent = this.parent;
  var tags;
  // no parent no move
  if (!parent) { return }

  tags = parent.tags[tagName];

  if (isArray(tags))
    { tags.splice(newPos, 0, tags.splice(tags.indexOf(this), 1)[0]); }
  else { arrayishAdd(parent.tags, tagName, this); }
}

/**
 * Create a new child tag including it correctly into its parent
 * @param   { Object } child - child tag implementation
 * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
 * @param   { String } innerHTML - inner html of the child node
 * @param   { Object } parent - instance of the parent tag including the child custom tag
 * @returns { Object } instance of the new child tag just created
 */
function initChildTag(child, opts, innerHTML, parent) {
  var tag = createTag(child, opts, innerHTML);
  var tagName = opts.tagName || getTagName(opts.root, true);
  var ptag = getImmediateCustomParentTag(parent);
  // fix for the parent attribute in the looped elements
  defineProperty(tag, 'parent', ptag);
  // store the real parent tag
  // in some cases this could be different from the custom parent tag
  // for example in nested loops
  tag.__.parent = parent;

  // add this tag to the custom parent tag
  arrayishAdd(ptag.tags, tagName, tag);

  // and also to the real parent tag
  if (ptag !== parent)
    { arrayishAdd(parent.tags, tagName, tag); }

  return tag
}

/**
 * Loop backward all the parents tree to detect the first custom parent tag
 * @param   { Object } tag - a Tag instance
 * @returns { Object } the instance of the first custom parent tag found
 */
function getImmediateCustomParentTag(tag) {
  var ptag = tag;
  while (ptag.__.isAnonymous) {
    if (!ptag.parent) { break }
    ptag = ptag.parent;
  }
  return ptag
}

/**
 * Trigger the unmount method on all the expressions
 * @param   { Array } expressions - DOM expressions
 */
function unmountAll(expressions) {
  each(expressions, function (expr) {
    if (expr.unmount) { expr.unmount(true); }
    else if (expr.tagName) { expr.tag.unmount(true); }
    else if (expr.unmount) { expr.unmount(); }
  });
}

/**
 * Get the tag name of any DOM node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { Boolean } skipDataIs - hack to ignore the data-is attribute when attaching to parent
 * @returns { String } name to identify this dom node in riot
 */
function getTagName(dom, skipDataIs) {
  var child = getTag(dom);
  var namedTag = !skipDataIs && getAttr(dom, IS_DIRECTIVE);
  return namedTag && !tmpl.hasExpr(namedTag) ?
    namedTag : child ? child.name : dom.tagName.toLowerCase()
}

/**
 * Set the property of an object for a given key. If something already
 * exists there, then it becomes an array containing both the old and new value.
 * @param { Object } obj - object on which to set the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be set
 * @param { Boolean } ensureArray - ensure that the property remains an array
 * @param { Number } index - add the new item in a certain array position
 */
function arrayishAdd(obj, key, value, ensureArray, index) {
  var dest = obj[key];
  var isArr = isArray(dest);
  var hasIndex = !isUndefined(index);

  if (dest && dest === value) { return }

  // if the key was never set, set it once
  if (!dest && ensureArray) { obj[key] = [value]; }
  else if (!dest) { obj[key] = value; }
  // if it was an array and not yet set
  else {
    if (isArr) {
      var oldIndex = dest.indexOf(value);
      // this item never changed its position
      if (oldIndex === index) { return }
      // remove the item from its old position
      if (oldIndex !== -1) { dest.splice(oldIndex, 1); }
      // move or add the item
      if (hasIndex) {
        dest.splice(index, 0, value);
      } else {
        dest.push(value);
      }
    } else { obj[key] = [dest, value]; }
  }
}

/**
 * Removes an item from an object at a given key. If the key points to an array,
 * then the item is just removed from the array.
 * @param { Object } obj - object on which to remove the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be removed
 * @param { Boolean } ensureArray - ensure that the property remains an array
*/
function arrayishRemove(obj, key, value, ensureArray) {
  if (isArray(obj[key])) {
    var index = obj[key].indexOf(value);
    if (index !== -1) { obj[key].splice(index, 1); }
    if (!obj[key].length) { delete obj[key]; }
    else if (obj[key].length === 1 && !ensureArray) { obj[key] = obj[key][0]; }
  } else if (obj[key] === value)
    { delete obj[key]; } // otherwise just delete the key
}

/**
 * Mount a tag creating new Tag instance
 * @param   { Object } root - dom node where the tag will be mounted
 * @param   { String } tagName - name of the riot tag we want to mount
 * @param   { Object } opts - options to pass to the Tag instance
 * @param   { Object } ctx - optional context that will be used to extend an existing class ( used in riot.Tag )
 * @returns { Tag } a new Tag instance
 */
function mountTo(root, tagName, opts, ctx) {
  var impl = __TAG_IMPL[tagName];
  var implClass = __TAG_IMPL[tagName].class;
  var context = ctx || (implClass ? Object.create(implClass.prototype) : {});
  // cache the inner HTML to fix #855
  var innerHTML = root._innerHTML = root._innerHTML || root.innerHTML;
  var conf = extend({ root: root, opts: opts, context: context }, { parent: opts ? opts.parent : null });
  var tag;

  if (impl && root) { tag = createTag(impl, conf, innerHTML); }

  if (tag && tag.mount) {
    tag.mount(true);
    // add this tag to the virtualDom variable
    if (!contains(__TAGS_CACHE, tag)) { __TAGS_CACHE.push(tag); }
  }

  return tag
}

/**
 * makes a tag virtual and replaces a reference in the dom
 * @this Tag
 * @param { tag } the tag to make virtual
 * @param { ref } the dom reference location
 */
function makeReplaceVirtual(tag, ref) {
  var frag = createFrag();
  makeVirtual.call(tag, frag);
  ref.parentNode.replaceChild(frag, ref);
}

/**
 * Adds the elements for a virtual tag
 * @this Tag
 * @param { Node } src - the node that will do the inserting or appending
 * @param { Tag } target - only if inserting, insert before this tag's first child
 */
function makeVirtual(src, target) {
  var this$1 = this;

  var head = createDOMPlaceholder();
  var tail = createDOMPlaceholder();
  var frag = createFrag();
  var sib;
  var el;

  this.root.insertBefore(head, this.root.firstChild);
  this.root.appendChild(tail);

  this.__.head = el = head;
  this.__.tail = tail;

  while (el) {
    sib = el.nextSibling;
    frag.appendChild(el);
    this$1.__.virts.push(el); // hold for unmounting
    el = sib;
  }

  if (target)
    { src.insertBefore(frag, target.__.head); }
  else
    { src.appendChild(frag); }
}

/**
 * Return a temporary context containing also the parent properties
 * @this Tag
 * @param { Tag } - temporary tag context containing all the parent properties
 */
function inheritParentProps() {
  if (this.parent) { return extend(Object.create(this), this.parent) }
  return this
}

/**
 * Move virtual tag and all child nodes
 * @this Tag
 * @param { Node } src  - the node that will do the inserting
 * @param { Tag } target - insert before this tag's first child
 */
function moveVirtual(src, target) {
  var this$1 = this;

  var el = this.__.head;
  var sib;
  var frag = createFrag();

  while (el) {
    sib = el.nextSibling;
    frag.appendChild(el);
    el = sib;
    if (el === this$1.__.tail) {
      frag.appendChild(el);
      src.insertBefore(frag, target.__.head);
      break
    }
  }
}

/**
 * Get selectors for tags
 * @param   { Array } tags - tag names to select
 * @returns { String } selector
 */
function selectTags(tags) {
  // select all tags
  if (!tags) {
    var keys = Object.keys(__TAG_IMPL);
    return keys + selectTags(keys)
  }

  return tags
    .filter(function (t) { return !/[^-\w]/.test(t); })
    .reduce(function (list, t) {
      var name = t.trim().toLowerCase();
      return list + ",[" + IS_DIRECTIVE + "=\"" + name + "\"]"
    }, '')
}


var tags = Object.freeze({
	getTag: getTag,
	moveChildTag: moveChildTag,
	initChildTag: initChildTag,
	getImmediateCustomParentTag: getImmediateCustomParentTag,
	unmountAll: unmountAll,
	getTagName: getTagName,
	arrayishAdd: arrayishAdd,
	arrayishRemove: arrayishRemove,
	mountTo: mountTo,
	makeReplaceVirtual: makeReplaceVirtual,
	makeVirtual: makeVirtual,
	inheritParentProps: inheritParentProps,
	moveVirtual: moveVirtual,
	selectTags: selectTags
});

var settings = settings$1;
var util = {
  tmpl: tmpl,
  brackets: brackets,
  styleManager: styleManager,
  vdom: __TAGS_CACHE,
  styleNode: styleManager.styleNode,
  // export the riot internal utils as well
  dom: dom,
  check: check,
  misc: misc,
  tags: tags
};

// export the core props/methods










var riot$1 = extend({}, core, {
  observable: observable$1,
  settings: settings,
  util: util,
});

riot$1.tag2('app', '<menubar></menubar>', '', '', function(opts) {
  console.log(riot$1.tags);
});

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var marked = createCommonjsModule(function (module, exports) {
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var this$1 = this;

  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this$1.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this$1.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this$1.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this$1.tokens.push({
        type: 'code',
        text: !this$1.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this$1.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this$1.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this$1.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this$1.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this$1.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this$1.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this$1.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this$1.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this$1.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this$1.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this$1.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this$1.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this$1.token(cap, top, true);

      this$1.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this$1.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this$1.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this$1.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this$1.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this$1.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) { loose = next; }
        }

        this$1.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this$1.token(item, false, bq);

        this$1.tokens.push({
          type: 'list_item_end'
        });
      }

      this$1.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this$1.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this$1.tokens.push({
        type: this$1.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this$1.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this$1.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this$1.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this$1.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this$1.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this$1.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this$1.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this$1.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this$1.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var this$1 = this;

  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this$1.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this$1.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this$1.mangle(cap[1].substring(7))
          : this$1.mangle(cap[1]);
        href = this$1.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this$1.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this$1.inLink && (cap = this$1.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this$1.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this$1.rules.tag.exec(src)) {
      if (!this$1.inLink && /^<a /i.test(cap[0])) {
        this$1.inLink = true;
      } else if (this$1.inLink && /^<\/a>/i.test(cap[0])) {
        this$1.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this$1.options.sanitize
        ? this$1.options.sanitizer
          ? this$1.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = this$1.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this$1.inLink = true;
      out += this$1.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this$1.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this$1.rules.reflink.exec(src))
        || (cap = this$1.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this$1.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this$1.inLink = true;
      out += this$1.outputLink(cap, link);
      this$1.inLink = false;
      continue;
    }

    // strong
    if (cap = this$1.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this$1.renderer.strong(this$1.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this$1.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this$1.renderer.em(this$1.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this$1.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this$1.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this$1.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this$1.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this$1.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this$1.renderer.del(this$1.output(cap[1]));
      continue;
    }

    // text
    if (cap = this$1.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this$1.renderer.text(escape(this$1.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) { return text; }
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) { return text; }
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  var this$1 = this;

  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this$1.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var this$1 = this;

  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this$1.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  var this$1 = this;

  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this$1.token.align[i] };
        cell += this$1.renderer.tablecell(
          this$1.inline.output(this$1.token.header[i]),
          { header: true, align: this$1.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this$1.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this$1.renderer.tablecell(
            this$1.inline.output(row[j]),
            { header: false, align: this$1.token.align[j] }
          );
        }

        body += this$1.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this$1.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this$1.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this$1.token.type === 'text'
          ? this$1.parseText()
          : this$1.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this$1.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities 
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') { return ':'; }
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) { return new RegExp(regex, opt); }
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var arguments$1 = arguments;

  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments$1[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt);
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) { return done(); }

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) { return done(err); }
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) { opt = merge({}, marked.defaults, opt); }
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

{
  module.exports = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : commonjsGlobal);
}());
});

riot$1.tag2('md', '', 'md,[data-is="md"]{ display: block; }', '', function(opts) {
    this.root.innerHTML = opts.content ? marked(opts.content) : "";
});

riot$1.tag2('menubar', '<div class="menu-wrapper"> <div class="menu-container"> <a class="logocf" href="javascript: void 0;">La Cinémathèque française</a> <form class="menu-search {focus: searchHasFocus}" onsubmit="{searchSubmit}"> <input class="search-input" type="text" onblur="{searchSetBlur}" onfocus="{searchSetFocus}"><input class="search-submit" type="submit"> </form> <div class="menu-top"> <a href="javascript: void 0;" each="{item in items.top}" onclick="{select}" class="{selected: isSelectedItem(item)}">{item.title}</a> </div> <div class="menu-bottom"> <a href="javascript: void 0;" each="{item in items.bottom}" onclick="{select}" class="{selected: isSelectedItem(item)}">{item.title}</a> <div class="search"></div> </div> </div> </div>', 'menubar a,[data-is="menubar"] a{ color: inherit; text-decoration: none; } menubar input,[data-is="menubar"] input{ vertical-align: middle; } menubar .menu-wrapper,[data-is="menubar"] .menu-wrapper{ width: 100%; background-color: #333; color: #ddd; } menubar .menu-container,[data-is="menubar"] .menu-container{ position: relative; width: 1140px; height: 200px; margin: 0 auto; font-family: Quicksand; font-weight: 700; font-size: 14px; text-transform: uppercase; } menubar .menu-search,[data-is="menubar"] .menu-search{ position: absolute; right: 4px; top: 4px; } menubar .menu-search .search-input,[data-is="menubar"] .menu-search .search-input{ display: inline-block; width: 300px; height: 20px; line-height: 20px; margin: 0; border: 0; padding: 8px; background-color: #555; color: #999; font-size: 16px; font-size: 1rem; font-weight: 600; transition: 0.15s; } menubar .menu-search.focus .search-input,[data-is="menubar"] .menu-search.focus .search-input{ background-color: #eee; color: #111; } menubar .menu-search .search-submit,[data-is="menubar"] .menu-search .search-submit{ display: inline-block; line-height: 20px; width: 36px; height: 36px; margin: 0; padding: 0; border: 0; background: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiB2aWV3Qm94PSIwIDAgNDggNDgiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yOS41NCAyMy44OWMwLTEuNTYtMC41Ni0yLjg5LTEuNjYtMy45OXMtMi40NC0xLjY2LTMuOTktMS42NiAtMi44OSAwLjU1LTMuOTkgMS42NiAtMS42NiAyLjQ0LTEuNjYgNCAwLjU1IDIuODkgMS42NiAzLjk5YzEuMTEgMS4xMSAyLjQ0IDEuNjYgNCAxLjY2czIuODktMC41NiAzLjk5LTEuNjZDMjguOTggMjYuNzcgMjkuNTQgMjUuNDQgMjkuNTQgMjMuODl6TTM2IDM0LjM5YzAgMC40NC0wLjE2IDAuODItMC40OCAxLjE0QzM1LjIgMzUuODQgMzQuODIgMzYgMzQuMzkgMzZjLTAuNDUgMC0wLjgzLTAuMTYtMS4xMy0wLjQ4bC00LjMzLTQuMzFjLTEuNTEgMS4wNC0zLjE4IDEuNTYtNS4wMyAxLjU2IC0xLjIgMC0yLjM1LTAuMjMtMy40NS0wLjcgLTEuMS0wLjQ3LTIuMDQtMS4xLTIuODQtMS44OSAtMC43OS0wLjc5LTEuNDMtMS43NC0xLjg5LTIuODRDMTUuMjMgMjYuMjQgMTUgMjUuMDkgMTUgMjMuODlzMC4yMy0yLjM1IDAuNy0zLjQ1YzAuNDctMS4xIDEuMS0yLjA0IDEuODktMi44NCAwLjgtMC43OSAxLjc0LTEuNDMgMi44NC0xLjg5QzIxLjUzIDE1LjIzIDIyLjY4IDE1IDIzLjg5IDE1czIuMzUgMC4yMyAzLjQ1IDAuN2MxLjEgMC40NyAyLjA1IDEuMSAyLjg0IDEuODkgMC44IDAuOCAxLjQzIDEuNzQgMS44OSAyLjg0IDAuNDcgMS4xIDAuNyAyLjI1IDAuNyAzLjQ1IDAgMS44NS0wLjUyIDMuNTMtMS41NiA1LjA0bDQuMzMgNC4zM0MzNS44NCAzMy41NiAzNiAzMy45NCAzNiAzNC4zOXoiLz48L3N2Zz4=") no-repeat; background-size: contain; background-color: #4d4d4d; background-position: 50% 50%; font-size: 0; cursor: pointer; transition: 0.15s; } menubar .menu-search.focus .search-submit,[data-is="menubar"] .menu-search.focus .search-submit{ background-color: #bf7f30; } menubar .menu-top,[data-is="menubar"] .menu-top{ position: absolute; overflow: hidden; right: 4px; bottom: 50px; font-size: 12px; font-weight: 400; } menubar .menu-top a,[data-is="menubar"] .menu-top a{ display: inline-block; padding: 12px 0px 4px 0px; margin: 0 4px; border-bottom: solid 1px transparent; transition: 0.1s; } menubar .menu-top a:hover,[data-is="menubar"] .menu-top a:hover{ border-color: #ddd; } menubar .menu-top a.selected,[data-is="menubar"] .menu-top a.selected{ color: #fff; border-color: #ddd; } menubar .menu-bottom,[data-is="menubar"] .menu-bottom{ position: absolute; overflow: hidden; right: 0; bottom: 0; font-size: 16px; } menubar .menu-bottom a,[data-is="menubar"] .menu-bottom a{ display: inline-block; padding: 15px 6px; transition: 0.1s; } menubar .menu-bottom a:hover,[data-is="menubar"] .menu-bottom a:hover{ background-color: #514f4c; } menubar .menu-bottom a.selected,[data-is="menubar"] .menu-bottom a.selected{ background-color: #514f4c; color: #e5a15c; } menubar .vr,[data-is="menubar"] .vr{ display: inline-block; border-left: solid 1px #999; margin: 4px 2px 0 2px; height: 12px; } menubar .menu-bottom a.icon-search,[data-is="menubar"] .menu-bottom a.icon-search{ display: inline-block; width: 48px; height: 48px; margin: 0 0 -18px 0; padding: 0; background: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiB2aWV3Qm94PSIwIDAgNDggNDgiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yOS41NCAyMy44OWMwLTEuNTYtMC41Ni0yLjg5LTEuNjYtMy45OXMtMi40NC0xLjY2LTMuOTktMS42NiAtMi44OSAwLjU1LTMuOTkgMS42NiAtMS42NiAyLjQ0LTEuNjYgNCAwLjU1IDIuODkgMS42NiAzLjk5YzEuMTEgMS4xMSAyLjQ0IDEuNjYgNCAxLjY2czIuODktMC41NiAzLjk5LTEuNjZDMjguOTggMjYuNzcgMjkuNTQgMjUuNDQgMjkuNTQgMjMuODl6TTM2IDM0LjM5YzAgMC40NC0wLjE2IDAuODItMC40OCAxLjE0QzM1LjIgMzUuODQgMzQuODIgMzYgMzQuMzkgMzZjLTAuNDUgMC0wLjgzLTAuMTYtMS4xMy0wLjQ4bC00LjMzLTQuMzFjLTEuNTEgMS4wNC0zLjE4IDEuNTYtNS4wMyAxLjU2IC0xLjIgMC0yLjM1LTAuMjMtMy40NS0wLjcgLTEuMS0wLjQ3LTIuMDQtMS4xLTIuODQtMS44OSAtMC43OS0wLjc5LTEuNDMtMS43NC0xLjg5LTIuODRDMTUuMjMgMjYuMjQgMTUgMjUuMDkgMTUgMjMuODlzMC4yMy0yLjM1IDAuNy0zLjQ1YzAuNDctMS4xIDEuMS0yLjA0IDEuODktMi44NCAwLjgtMC43OSAxLjc0LTEuNDMgMi44NC0xLjg5QzIxLjUzIDE1LjIzIDIyLjY4IDE1IDIzLjg5IDE1czIuMzUgMC4yMyAzLjQ1IDAuN2MxLjEgMC40NyAyLjA1IDEuMSAyLjg0IDEuODkgMC44IDAuOCAxLjQzIDEuNzQgMS44OSAyLjg0IDAuNDcgMS4xIDAuNyAyLjI1IDAuNyAzLjQ1IDAgMS44NS0wLjUyIDMuNTMtMS41NiA1LjA0bDQuMzMgNC4zM0MzNS44NCAzMy41NiAzNiAzMy45NCAzNiAzNC4zOXoiLz48L3N2Zz4=") no-repeat; background-size: contain; background-position: 50% 50%; font-size: 0; box-sizing: border-box; } menubar .menu-bottom a.icon-search:hover,[data-is="menubar"] .menu-bottom a.icon-search:hover{ background-color: #514f4c; } menubar .logocf,[data-is="menubar"] .logocf{ position: absolute; display: block; width: 301px; height: 64px; bottom: 0; left: 0; padding: 0 0 11px 0; background: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjMwMSIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDMwMSA2NCI+PHBvbHlnb24gZmlsbD0iI2ZmZiIgcG9pbnRzPSIxNy4xNiA0NC4xOSA1LjczIDQ0LjE5IDAgMzguNTMgMCA5LjkyIDUuNzMgNC4xOSAxNy4xNiA0LjE5IDIyLjg5IDkuOTIgMjIuODkgMTguNTEgMTQuMzEgMTguNTEgMTQuMzEgMTIuNzcgOC41OCAxMi43NyA4LjU4IDM1LjY3IDE0LjMxIDM1LjY3IDE0LjMxIDI5Ljk0IDIyLjg5IDI5Ljk0IDIyLjg5IDM4LjUyICIvPjxyZWN0IHg9IjI3LjA2IiB5PSIwLjE2IiBmaWxsPSIjZmZmIiB3aWR0aD0iOC41NiIgaGVpZ2h0PSI0MCIvPjxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iNTQuMzMgNDQuMTggNDguNiAyOC4yMyA0OC42IDQ0LjE4IDQwLjAzIDQ0LjE4IDQwLjAzIDQuMTggNDguNiA0LjE4IDU0LjMzIDIwLjIxIDU0LjMzIDQuMTggNjIuOTEgNC4xOCA2Mi45MSA0NC4xOCAiLz48cG9seWdvbiBmaWxsPSIjZmZmIiBwb2ludHM9IjY3LjA5IDQ0LjEyIDY3LjA5IDQuMTIgODcuMTMgNC4xMiA4Ny4xMyAxMi43IDc1LjY3IDEyLjcgNzUuNjcgMTkuODYgODcuMTMgMTkuODYgODcuMTMgMjguNDQgNzUuNjcgMjguNDQgNzUuNjcgMzUuNiA4Ny4xMyAzNS42IDg3LjEzIDQ0LjEyICIvPjxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iMTExLjM5IDQ0LjEyIDExMS4zOSAyOS44NyAxMDUuNjYgNDQuMTIgOTkuOTIgMjkuODcgOTkuOTIgNDQuMTIgOTEuMzQgNDQuMTIgOTEuMzQgNC4xMiA5OS45MiA0LjEyIDEwNS42NiAxOC40MyAxMTEuMzkgNC4xMiAxMTkuOTcgNC4xMiAxMTkuOTcgNDQuMTIgIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEzOS43OSA0MGwtMC45OC01LjcyaC03LjJMMTMwLjY1IDQwaC04LjUxbDcuMzktNDBoMTEuNDFsNy40MiA0MGgtOC41NmwwIDBIMTM5Ljc5ek0xMzUuMjIgMTMuMzFsLTIuMDkgMTIuNDFoNC4yMUwxMzUuMjIgMTMuMzEgMTM1LjIyIDEzLjMxeiIvPjxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iMTYzLjc5IDEyLjcgMTYzLjc5IDQ0LjEyIDE1NS4yMSA0NC4xMiAxNTUuMjEgMTIuNyAxNDYuNiAxMi43IDE0Ni42IDQuMTIgMTcyLjM3IDQuMTIgMTcyLjM3IDEyLjcgIi8+PHBvbHlnb24gZmlsbD0iI2ZmZiIgcG9pbnRzPSIxODkuMTMgNDQuMTIgMTg5LjEzIDI4LjQ0IDE4My40IDI4LjQ0IDE4My40IDQ0LjEyIDE3NC44MiA0NC4xMiAxNzQuODIgNC4xMiAxODMuNCA0LjEyIDE4My40IDE5Ljg2IDE4OS4xMyAxOS44NiAxODkuMTMgNC4xMiAxOTcuNzEgNC4xMiAxOTcuNzEgNDQuMTIgIi8+PHBvbHlnb24gZmlsbD0iI2ZmZiIgcG9pbnRzPSIyMDEuODggNDQuMTIgMjAxLjg4IDQuMTIgMjIxLjkyIDQuMTIgMjIxLjkyIDEyLjcgMjEwLjQ2IDEyLjcgMjEwLjQ2IDE5Ljg2IDIyMS45MiAxOS44NiAyMjEuOTIgMjguNDQgMjEwLjQ2IDI4LjQ0IDIxMC40NiAzNS42IDIyMS45MiAzNS42IDIyMS45MiA0NC4xMiAiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjMxLjg2IDQ0LjA3bC01LjczLTUuNjdWOS43OWw1LjczLTUuNzNoMTEuNDNsNS43MyA1LjczVjM1LjU0bC0yLjg1IDIuODVoNS4xNHY1LjY4SDIzMS44NmwwIDAgMCAwSDIzMS44NnpNMjQwLjQ0IDEyLjY1aC01LjczVjM1LjU0aDUuNzNWMTIuNjV6Ii8+PHBvbHlnb24gZmlsbD0iI2ZmZiIgcG9pbnRzPSIyNzAuMzMgNDAuMTYgMjU4LjkyIDQwLjE2IDI1My4yIDM0LjQ0IDI1My4yIDAuMTYgMjYxLjc2IDAuMTYgMjYxLjc2IDMxLjYgMjY3LjQ4IDMxLjYgMjY3LjQ4IDAuMTYgMjc2LjA0IDAuMTYgMjc2LjA0IDM0LjQ0ICIvPjxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iMjgwLjI2IDQ0LjEyIDI4MC4yNiA0LjEyIDMwMC4zIDQuMTIgMzAwLjMgMTIuNyAyODguODQgMTIuNyAyODguODQgMTkuODYgMzAwLjMgMTkuODYgMzAwLjMgMjguNDQgMjg4Ljg0IDI4LjQ0IDI4OC44NCAzNS42IDMwMC4zIDM1LjYgMzAwLjMgNDQuMTIgIi8+PGNpcmNsZSBmaWxsPSIjNjcyRjkwIiBjeD0iMjkyLjMiIGN5PSI1NC43NyIgcj0iOCIvPjxjaXJjbGUgZmlsbD0iIzc4QzY5NiIgY3g9IjI3NS4wNCIgY3k9IjU1LjE1IiByPSI4Ii8+PHBhdGggZD0iTTI3Ny4wOCA1Mi40Yy0wLjIyIDAtMC40NiAwLTAuNzYgMC4wNCAtMS42MyAwLjE5LTIuNDIgMS4yLTIuNjEgMi4yOGgwLjA0YzAuMzgtMC40NCAwLjk3LTAuNzYgMS43NS0wLjc2IDEuMzQgMCAyLjM5IDAuOTYgMi4zOSAyLjU0IDAgMS40OS0xLjA5IDIuNzgtMi43NSAyLjc4IC0xLjg5IDAtMi45NC0xLjQ0LTIuOTQtMy4zNiAwLTEuNSAwLjU0LTIuNzIgMS4zNi0zLjUgMC43Mi0wLjY3IDEuNjYtMS4wNSAyLjc3LTEuMTUgMC4zMi0wLjA0IDAuNTYtMC4wNCAwLjc0LTAuMDJMMjc3LjA4IDUyLjR6TTI3Ni4zOSA1Ni41OGMwLTAuOS0wLjQ5LTEuNTUtMS4zNS0xLjU1IC0wLjU1IDAtMS4wNCAwLjM0LTEuMjcgMC44IC0wLjA2IDAuMTItMC4xIDAuMjYtMC4xIDAuNDcgMC4wMiAxLjAzIDAuNTIgMS44NyAxLjQ2IDEuODdDMjc1LjkgNTguMTggMjc2LjM5IDU3LjUyIDI3Ni4zOSA1Ni41OHoiLz48cGF0aCBmaWxsPSIjRjZGNkY2IiBkPSJNMjg5LjEyIDUyLjNoLTAuMDJsLTEuNDMgMC43MiAtMC4yNS0xLjEyIDEuOS0wLjk0aDEuMjR2Ny44aC0xLjQzVjUyLjN6Ii8+PHBhdGggZmlsbD0iI0Y2RjZGNiIgZD0iTTI5NS45MSA1OC43N3YtMS45OGgtMy41M3YtMC45NmwzLjE4LTQuODZoMS43NHY0LjdoMS4wMXYxLjEyaC0xLjAxdjEuOThIMjk1Ljkxek0yOTUuOTEgNTUuNjd2LTIuMTJjMC0wLjQ0IDAuMDEtMC45IDAuMDUtMS4zNWgtMC4wNWMtMC4yNCAwLjQ5LTAuNDQgMC44OS0wLjY4IDEuMzJsLTEuNDMgMi4xMyAtMC4wMSAwLjAySDI5NS45MXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTE4LjA0IDU0LjY3YzAuMzYgMC4yIDAuNjQgMC40OCAwLjg0IDAuODQgMC4yIDAuMzUgMC4zMSAwLjc1IDAuMzEgMS4xOCAwIDAuNDUtMC4xMyAwLjg2LTAuMzggMS4yNCAtMC4yNSAwLjM4LTAuNTkgMC42OC0xLjAxIDAuOTEgLTAuNDIgMC4yMi0wLjg3IDAuMzQtMS4zNiAwLjM0IC0wLjI2IDAtMC41My0wLjA0LTAuOC0wLjEyIC0wLjI4LTAuMDgtMC41LTAuMTktMC42Ny0wLjMzIC0wLjA4LTAuMDctMC4xNS0wLjE2LTAuMi0wLjI4IC0wLjA1LTAuMTItMC4wOC0wLjIzLTAuMDgtMC4zNCAwLTAuMTIgMC4wNS0wLjIzIDAuMTYtMC4zMnMwLjI0LTAuMTQgMC40MS0wLjE0YzAuMTIgMCAwLjI3IDAuMDYgMC40NSAwLjE5IDAuMjggMC4xNyAwLjUzIDAuMjYgMC43NCAwLjI2IDAuMjcgMCAwLjUzLTAuMDYgMC43Ny0wLjE5IDAuMjQtMC4xMyAwLjQzLTAuMyAwLjU3LTAuNTEgMC4xNC0wLjIxIDAuMjItMC40NCAwLjIyLTAuNjkgMC0wLjM2LTAuMTItMC42NS0wLjM3LTAuODhzLTAuNTQtMC4zNC0wLjg4LTAuMzRjLTAuMTUgMC0wLjI5IDAuMDItMC40MSAwLjA2cy0wLjI2IDAuMS0wLjQzIDAuMThjLTAuMTIgMC4wNi0wLjIxIDAuMS0wLjI4IDAuMTMgLTAuMDcgMC4wMy0wLjE0IDAuMDQtMC4yMSAwLjA0IC0wLjI2IDAtMC40NC0wLjA3LTAuNTYtMC4yMSAtMC4xMS0wLjE0LTAuMTYtMC4zMS0wLjE2LTAuNSAwLTAuMDcgMC0wLjExIDAuMDEtMC4xNGwwLjMxLTIuNDhjMC4wMy0wLjE0IDAuMS0wLjI1IDAuMjEtMC4zNCAwLjExLTAuMDkgMC4yNC0wLjEzIDAuNC0wLjEzaDIuODljMC4xNiAwIDAuMjkgMC4wNSAwLjQgMC4xNiAwLjExIDAuMTEgMC4xNiAwLjI0IDAuMTYgMC40IDAgMC4xNS0wLjA1IDAuMjgtMC4xNiAwLjM5IC0wLjExIDAuMS0wLjI0IDAuMTYtMC40IDAuMTZoLTIuNDhsLTAuMTkgMS40NWMwLjEzLTAuMDcgMC4yOS0wLjEzIDAuNDgtMC4xOCAwLjE5LTAuMDUgMC4zOC0wLjA3IDAuNTUtMC4wN0MxMTcuMjkgNTQuMzYgMTE3LjY4IDU0LjQ2IDExOC4wNCA1NC42N3oiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTIyLjYxIDUyLjI0YzAuMTEgMC4xMiAwLjE3IDAuMjYgMC4xNyAwLjQ0djUuNzhjMCAwLjE3LTAuMDYgMC4zMi0wLjE5IDAuNDQgLTAuMTMgMC4xMi0wLjI4IDAuMTgtMC40NyAwLjE4cy0wLjM0LTAuMDYtMC40Ni0wLjE3IC0wLjE4LTAuMjYtMC4xOC0wLjQzdi00Ljc0bC0wLjYyIDAuMzhjLTAuMSAwLjA2LTAuMjEgMC4wOS0wLjMyIDAuMDkgLTAuMTcgMC0wLjMxLTAuMDYtMC40Mi0wLjE5IC0wLjEyLTAuMTMtMC4xNy0wLjI3LTAuMTctMC40MiAwLTAuMTEgMC4wMy0wLjIxIDAuMDktMC4zczAuMTMtMC4xNyAwLjIzLTAuMjJsMS41MS0wLjljMC4xMS0wLjA2IDAuMjYtMC4wOSAwLjQzLTAuMDlDMTIyLjM1IDUyLjA2IDEyMi40OSA1Mi4xMiAxMjIuNjEgNTIuMjR6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyNS41MyA1OS41NmMtMC4xMSAwLjIzLTAuMjYgMC40NC0wLjQ0IDAuNjFzLTAuMzcgMC4yNi0wLjU2IDAuMjZjLTAuMTUgMC0wLjI2LTAuMDMtMC4zNS0wLjA5cy0wLjEzLTAuMTYtMC4xMy0wLjNjMC0wLjExIDAuMDMtMC4xOCAwLjA4LTAuMjIgMC4wNS0wLjA0IDAuMTEtMC4wNyAwLjE4LTAuMDlzMC4xMS0wLjA0IDAuMTQtMC4wNWMwLjE5LTAuMSAwLjI4LTAuMjMgMC4yOC0wLjQgMC0wLjA3LTAuMDQtMC4xNC0wLjEtMC4xOXMtMC4xNi0wLjA4LTAuMjgtMC4wOCAtMC4yMSAwLjAyLTAuMjggMC4wN2MtMC4wOC0wLjAzLTAuMTQtMC4wOC0wLjE4LTAuMTMgLTAuMDQtMC4wNS0wLjA2LTAuMTMtMC4wNi0wLjI0IDAtMC4xMyAwLjA1LTAuMjYgMC4xNS0wLjM3IDAuMS0wLjEyIDAuMjItMC4yMSAwLjM3LTAuMjggMC4xNS0wLjA3IDAuMjktMC4xIDAuNDMtMC4xIDAuMjkgMCAwLjUyIDAuMDkgMC42OSAwLjI4IDAuMTcgMC4xOCAwLjI1IDAuNDUgMC4yNSAwLjc5QzEyNS43IDU5LjEzIDEyNS42NCA1OS4zMyAxMjUuNTMgNTkuNTZ6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEzNS41MiA1OC4yOWMwLjA1IDAuMDkgMC4wOCAwLjE4IDAuMDggMC4yNyAwIDAuMTItMC4wNCAwLjIzLTAuMTIgMC4zMyAtMC4xIDAuMTItMC4yNSAwLjE4LTAuNDYgMC4xOCAtMC4xNiAwLTAuMzEtMC4wNC0wLjQ0LTAuMTEgLTAuNDgtMC4yNy0wLjcyLTAuODMtMC43Mi0xLjY3IDAtMC4yNC0wLjA4LTAuNDMtMC4yMy0wLjU3IC0wLjE2LTAuMTQtMC4zOC0wLjIxLTAuNjctMC4yMWgtMS44N3YxLjk0YzAgMC4xOC0wLjA1IDAuMzMtMC4xNCAwLjQ0cy0wLjIyIDAuMTctMC4zOCAwLjE3Yy0wLjE5IDAtMC4zNi0wLjA2LTAuNS0wLjE3IC0wLjE0LTAuMTItMC4yMS0wLjI2LTAuMjEtMC40M3YtNS43OGMwLTAuMTcgMC4wNi0wLjMyIDAuMTgtMC40MyAwLjEyLTAuMTIgMC4yNi0wLjE3IDAuNDQtMC4xN2gyLjg4YzAuMzUgMCAwLjY3IDAuMDkgMC45OCAwLjI4IDAuMzEgMC4xOSAwLjU1IDAuNDQgMC43NCAwLjc3IDAuMTggMC4zMyAwLjI4IDAuNjkgMC4yOCAxLjEgMCAwLjMzLTAuMDkgMC42Ni0wLjI3IDAuOTggLTAuMTggMC4zMi0wLjQxIDAuNTctMC43IDAuNzYgMC40MiAwLjI5IDAuNjUgMC42OSAwLjY5IDEuMTggMC4wMiAwLjExIDAuMDMgMC4yMSAwLjAzIDAuMzEgMC4wMyAwLjIxIDAuMDUgMC4zNiAwLjA4IDAuNDUgMC4wMyAwLjA5IDAuMDkgMC4xNiAwLjE4IDAuMjFDMTM1LjQgNTguMTMgMTM1LjQ3IDU4LjIgMTM1LjUyIDU4LjI5ek0xMzMuNjIgNTUuMzFjMC4xMS0wLjExIDAuMjEtMC4yNiAwLjI4LTAuNDVzMC4xMS0wLjM5IDAuMTEtMC42MWMwLTAuMTktMC4wNC0wLjM2LTAuMTEtMC41MXMtMC4xNy0wLjI4LTAuMjgtMC4zNyAtMC4yMy0wLjE0LTAuMzUtMC4xNGgtMi4xOXYyLjI3aDIuMTlDMTMzLjM5IDU1LjQ4IDEzMy41IDU1LjQyIDEzMy42MiA1NS4zMXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTQyLjA0IDUyLjIyYzAuMTEgMC4xMSAwLjE2IDAuMjYgMC4xNiAwLjQ0djMuNjJjMCAwLjU1LTAuMTIgMS4wNC0wLjM1IDEuNDcgLTAuMjMgMC40My0wLjU2IDAuNzYtMC45OCAxIC0wLjQyIDAuMjQtMC45IDAuMzYtMS40NCAwLjM2IC0wLjU0IDAtMS4wMi0wLjEyLTEuNDQtMC4zNiAtMC40Mi0wLjI0LTAuNzUtMC41Ny0wLjk4LTEgLTAuMjMtMC40My0wLjM1LTAuOTItMC4zNS0xLjQ3di0zLjYyYzAtMC4xNyAwLjA2LTAuMzIgMC4xOC0wLjQzIDAuMTItMC4xMiAwLjI3LTAuMTcgMC40Ni0wLjE3IDAuMTYgMCAwLjMgMC4wNiAwLjQyIDAuMThzMC4xOCAwLjI2IDAuMTggMC40NHYzLjYyYzAgMC4zMiAwLjA3IDAuNjEgMC4yMSAwLjg2IDAuMTQgMC4yNSAwLjMzIDAuNDQgMC41NiAwLjU3IDAuMjQgMC4xMyAwLjQ5IDAuMiAwLjc3IDAuMiAwLjI5IDAgMC41Ni0wLjA3IDAuODEtMC4yczAuNDUtMC4zMiAwLjYtMC41NyAwLjIzLTAuNTMgMC4yMy0wLjg1di0zLjYyYzAtMC4xOCAwLjA1LTAuMzMgMC4xNS0wLjQ0czAuMjQtMC4xNyAwLjQxLTAuMTdDMTQxLjc5IDUyLjA1IDE0MS45MyA1Mi4xMSAxNDIuMDQgNTIuMjJ6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE0OC4wOSA1OC4wOWMwLjEyIDAuMTIgMC4xOCAwLjI1IDAuMTggMC40MSAwIDAuMTctMC4wNiAwLjMtMC4xNyAwLjQxIC0wLjEyIDAuMTEtMC4yNiAwLjE2LTAuNDMgMC4xNmgtMy4zNWMtMC4xNyAwLTAuMzItMC4wNi0wLjQzLTAuMTdzLTAuMTctMC4yNi0wLjE3LTAuNDN2LTUuNzhjMC0wLjE3IDAuMDYtMC4zMiAwLjE4LTAuNDMgMC4xMi0wLjEyIDAuMjYtMC4xNyAwLjQ0LTAuMTdoMy4zNWMwLjE3IDAgMC4zMiAwLjA2IDAuNDQgMC4xN3MwLjE4IDAuMjUgMC4xOCAwLjQzYzAgMC4xNy0wLjA2IDAuMy0wLjE3IDAuNDFzLTAuMjYgMC4xNi0wLjQ0IDAuMTZoLTIuNzF2MS43aDIuMjZjMC4xNyAwIDAuMzIgMC4wNiAwLjQ0IDAuMTcgMC4xMiAwLjExIDAuMTggMC4yNSAwLjE4IDAuNDMgMCAwLjE3LTAuMDYgMC4zLTAuMTcgMC40MSAtMC4xMSAwLjEtMC4yNiAwLjE2LTAuNDQgMC4xNmgtMi4yNnYxLjg1aDIuNzFDMTQ3LjgzIDU3LjkxIDE0Ny45NyA1Ny45NyAxNDguMDkgNTguMDl6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE1Ni44MyA1Mi41M2MwLjQ1IDAuMzEgMC43OSAwLjczIDEuMDMgMS4yNiAwLjI0IDAuNTMgMC4zNiAxLjEyIDAuMzYgMS43OHMtMC4xMiAxLjI1LTAuMzUgMS43OGMtMC4yNCAwLjUzLTAuNTggMC45NS0xLjAzIDEuMjYgLTAuNDUgMC4zMS0wLjk5IDAuNDctMS42MSAwLjQ3aC0yLjM5Yy0wLjE3IDAtMC4zMi0wLjA2LTAuNDMtMC4xN3MtMC4xNy0wLjI2LTAuMTctMC40M3YtNS43OGMwLTAuMTcgMC4wNi0wLjMyIDAuMTgtMC40MyAwLjEyLTAuMTIgMC4yNi0wLjE3IDAuNDQtMC4xN2gyLjM5QzE1NS44NCA1Mi4wNiAxNTYuMzggNTIuMjIgMTU2LjgzIDUyLjUzek0xNTYuNDcgNTcuMjVjMC4zLTAuNDQgMC40NS0xIDAuNDUtMS42OHMtMC4xNS0xLjI0LTAuNDUtMS42OGMtMC4zLTAuNDQtMC43NS0wLjY2LTEuMzQtMC42NmgtMS42NXY0LjdoMS42NUMxNTUuNzIgNTcuOTEgMTU2LjE3IDU3LjY5IDE1Ni40NyA1Ny4yNXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTYzLjc2IDU4LjA5YzAuMTIgMC4xMiAwLjE4IDAuMjUgMC4xOCAwLjQxIDAgMC4xNy0wLjA2IDAuMy0wLjE3IDAuNDEgLTAuMTIgMC4xMS0wLjI2IDAuMTYtMC40MyAwLjE2aC0zLjM1Yy0wLjE3IDAtMC4zMi0wLjA2LTAuNDMtMC4xN3MtMC4xNy0wLjI2LTAuMTctMC40M3YtNS43OGMwLTAuMTcgMC4wNi0wLjMyIDAuMTgtMC40MyAwLjEyLTAuMTIgMC4yNi0wLjE3IDAuNDQtMC4xN2gzLjM1YzAuMTcgMCAwLjMyIDAuMDYgMC40NCAwLjE3czAuMTggMC4yNSAwLjE4IDAuNDNjMCAwLjE3LTAuMDYgMC4zLTAuMTcgMC40MXMtMC4yNiAwLjE2LTAuNDQgMC4xNmgtMi43MXYxLjdoMi4yNmMwLjE3IDAgMC4zMiAwLjA2IDAuNDQgMC4xNyAwLjEyIDAuMTEgMC4xOCAwLjI1IDAuMTggMC40MyAwIDAuMTctMC4wNiAwLjMtMC4xNyAwLjQxIC0wLjExIDAuMS0wLjI2IDAuMTYtMC40NCAwLjE2aC0yLjI2djEuODVoMi43MUMxNjMuNSA1Ny45MSAxNjMuNjQgNTcuOTcgMTYzLjc2IDU4LjA5eiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xNzIuOTUgNTUuODJjMC4yMiAwLjI5IDAuMzQgMC42NiAwLjM0IDEuMTEgMCAwLjc5LTAuMjMgMS4zNS0wLjY4IDEuNjYgLTAuNDUgMC4zMS0wLjk5IDAuNDctMS42MiAwLjQ3aC0yLjQ5Yy0wLjE3IDAtMC4zMi0wLjA2LTAuNDMtMC4xN3MtMC4xNy0wLjI2LTAuMTctMC40M3YtNS43OGMwLTAuMTcgMC4wNi0wLjMyIDAuMTgtMC40MyAwLjEyLTAuMTIgMC4yNi0wLjE3IDAuNDQtMC4xN2gyLjUyYzEuMjcgMCAxLjkgMC41OSAxLjkgMS43OCAwIDAuMy0wLjA3IDAuNTYtMC4yMSAwLjhzLTAuMzUgMC40MS0wLjYxIDAuNTVDMTcyLjQ0IDU1LjMyIDE3Mi43MyA1NS41MyAxNzIuOTUgNTUuODJ6TTE3MS40MSA1My40NWMtMC4xNC0wLjE0LTAuMzMtMC4yLTAuNTctMC4yaC0xLjY1djEuNTZoMS42OGMwLjIgMCAwLjM4LTAuMDcgMC41My0wLjJzMC4yMy0wLjMxIDAuMjMtMC41NEMxNzEuNjIgNTMuNzkgMTcxLjU1IDUzLjU4IDE3MS40MSA1My40NXpNMTcxLjcyIDU3LjY2YzAuMTgtMC4xNyAwLjI3LTAuNDEgMC4yNy0wLjczIDAtMC4zOS0wLjEtMC42NS0wLjMxLTAuNzdzLTAuNDYtMC4xOC0wLjc2LTAuMThoLTEuNzN2MS45M2gxLjhDMTcxLjMgNTcuOTEgMTcxLjU0IDU3LjgzIDE3MS43MiA1Ny42NnoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTc4LjgzIDU4LjA5YzAuMTIgMC4xMiAwLjE4IDAuMjUgMC4xOCAwLjQxIDAgMC4xNy0wLjA2IDAuMy0wLjE3IDAuNDEgLTAuMTIgMC4xMS0wLjI2IDAuMTYtMC40MyAwLjE2aC0zLjM1Yy0wLjE3IDAtMC4zMi0wLjA2LTAuNDMtMC4xN3MtMC4xNy0wLjI2LTAuMTctMC40M3YtNS43OGMwLTAuMTcgMC4wNi0wLjMyIDAuMTgtMC40MyAwLjEyLTAuMTIgMC4yNi0wLjE3IDAuNDQtMC4xN2gzLjM1YzAuMTcgMCAwLjMyIDAuMDYgMC40NCAwLjE3czAuMTggMC4yNSAwLjE4IDAuNDNjMCAwLjE3LTAuMDYgMC4zLTAuMTcgMC40MXMtMC4yNiAwLjE2LTAuNDQgMC4xNmgtMi43MXYxLjdoMi4yNmMwLjE3IDAgMC4zMiAwLjA2IDAuNDQgMC4xNyAwLjEyIDAuMTEgMC4xOCAwLjI1IDAuMTggMC40MyAwIDAuMTctMC4wNiAwLjMtMC4xNyAwLjQxIC0wLjExIDAuMS0wLjI2IDAuMTYtMC40NCAwLjE2aC0yLjI2djEuODVoMi43MUMxNzguNTcgNTcuOTEgMTc4LjcxIDU3Ljk3IDE3OC44MyA1OC4wOXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTg1Ljg1IDU4LjI5YzAuMDUgMC4wOSAwLjA4IDAuMTggMC4wOCAwLjI3IDAgMC4xMi0wLjA0IDAuMjMtMC4xMiAwLjMzIC0wLjEgMC4xMi0wLjI1IDAuMTgtMC40NiAwLjE4IC0wLjE2IDAtMC4zMS0wLjA0LTAuNDQtMC4xMSAtMC40OC0wLjI3LTAuNzItMC44My0wLjcyLTEuNjcgMC0wLjI0LTAuMDgtMC40My0wLjIzLTAuNTcgLTAuMTYtMC4xNC0wLjM4LTAuMjEtMC42Ny0wLjIxaC0xLjg3djEuOTRjMCAwLjE4LTAuMDUgMC4zMy0wLjE0IDAuNDRzLTAuMjIgMC4xNy0wLjM4IDAuMTdjLTAuMTkgMC0wLjM2LTAuMDYtMC41LTAuMTcgLTAuMTQtMC4xMi0wLjIxLTAuMjYtMC4yMS0wLjQzdi01Ljc4YzAtMC4xNyAwLjA2LTAuMzIgMC4xOC0wLjQzIDAuMTItMC4xMiAwLjI2LTAuMTcgMC40NC0wLjE3aDIuODhjMC4zNSAwIDAuNjcgMC4wOSAwLjk4IDAuMjggMC4zMSAwLjE5IDAuNTUgMC40NCAwLjc0IDAuNzcgMC4xOCAwLjMzIDAuMjggMC42OSAwLjI4IDEuMSAwIDAuMzMtMC4wOSAwLjY2LTAuMjcgMC45OCAtMC4xOCAwLjMyLTAuNDEgMC41Ny0wLjcgMC43NiAwLjQyIDAuMjkgMC42NSAwLjY5IDAuNjkgMS4xOCAwLjAyIDAuMTEgMC4wMyAwLjIxIDAuMDMgMC4zMSAwLjAzIDAuMjEgMC4wNSAwLjM2IDAuMDggMC40NSAwLjAzIDAuMDkgMC4wOSAwLjE2IDAuMTggMC4yMUMxODUuNzMgNTguMTMgMTg1LjggNTguMiAxODUuODUgNTguMjl6TTE4My45NSA1NS4zMWMwLjExLTAuMTEgMC4yMS0wLjI2IDAuMjgtMC40NXMwLjExLTAuMzkgMC4xMS0wLjYxYzAtMC4xOS0wLjA0LTAuMzYtMC4xMS0wLjUxcy0wLjE3LTAuMjgtMC4yOC0wLjM3IC0wLjIzLTAuMTQtMC4zNS0wLjE0aC0yLjE5djIuMjdoMi4xOUMxODMuNzIgNTUuNDggMTgzLjgzIDU1LjQyIDE4My45NSA1NS4zMXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTkyLjE0IDUyLjkxYzAgMC4xNC0wLjA1IDAuMjgtMC4xNSAwLjQxIC0wLjExIDAuMTQtMC4yNCAwLjIxLTAuNDEgMC4yMSAtMC4xMSAwLTAuMjMtMC4wMy0wLjM0LTAuMDkgLTAuMzMtMC4xNS0wLjY4LTAuMjMtMS4wNi0wLjIzIC0wLjQ3IDAtMC44NyAwLjEtMS4yMiAwLjMgLTAuMzUgMC4yLTAuNjEgMC40Ny0wLjggMC44MyAtMC4xOSAwLjM2LTAuMjggMC43Ny0wLjI4IDEuMjMgMCAwLjc5IDAuMjEgMS4zOCAwLjY0IDEuNzlzMC45OCAwLjYxIDEuNjcgMC42MWMwLjQxIDAgMC43Ni0wLjA4IDEuMDYtMC4yMyAwLjEyLTAuMDUgMC4yMy0wLjA4IDAuMzItMC4wOCAwLjE3IDAgMC4zMiAwLjA3IDAuNDQgMC4yMiAwLjEgMC4xMyAwLjE1IDAuMjYgMC4xNSAwLjQxIDAgMC4xMS0wLjAzIDAuMi0wLjA4IDAuMjkgLTAuMDUgMC4wOS0wLjEzIDAuMTUtMC4yMyAwLjIgLTAuNTIgMC4yNi0xLjA3IDAuMzktMS42NiAwLjM5IC0wLjY1IDAtMS4yNS0wLjE0LTEuOC0wLjQxIC0wLjU1LTAuMjgtMC45OC0wLjY4LTEuMzEtMS4yM3MtMC40OS0xLjE5LTAuNDktMS45NmMwLTAuNjggMC4xNi0xLjI5IDAuNDctMS44MyAwLjMxLTAuNTQgMC43NC0wLjk2IDEuMjktMS4yNiAwLjU1LTAuMyAxLjE2LTAuNDUgMS44NS0wLjQ1IDAuNTkgMCAxLjE0IDAuMTMgMS42NSAwLjM5QzE5Mi4wMyA1Mi41MSAxOTIuMTQgNTIuNjggMTkyLjE0IDUyLjkxeiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xOTguMTUgNTMuMDJsLTIuMDkgMi45OXYyLjQ0YzAgMC4xNy0wLjA2IDAuMzItMC4xNyAwLjQ0cy0wLjI1IDAuMTgtMC40MSAwLjE4Yy0wLjE3IDAtMC4zMS0wLjA2LTAuNDItMC4xN3MtMC4xNy0wLjI2LTAuMTctMC40M3YtMi41OGwtMi4wOC0yLjc2Yy0wLjEyLTAuMTYtMC4xOC0wLjMyLTAuMTgtMC40NyAwLTAuMTcgMC4wNy0wLjMyIDAuMjEtMC40M3MwLjI4LTAuMTcgMC40NC0wLjE3YzAuMTkgMCAwLjM1IDAuMDkgMC40OSAwLjI4bDEuNzYgMi40MyAxLjY1LTIuNDFjMC4xNC0wLjIgMC4zMS0wLjMgMC41LTAuMyAwLjE2IDAgMC4zIDAuMDYgMC40MiAwLjE4czAuMTggMC4yNyAwLjE4IDAuNDRDMTk4LjI2IDUyLjc4IDE5OC4yMiA1Mi45MSAxOTguMTUgNTMuMDJ6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIwMS44IDU2LjEyYy0wLjEtMC4xLTAuMTUtMC4yNS0wLjE1LTAuNDRWNTUuNWMwLTAuMTkgMC4wNS0wLjM0IDAuMTYtMC40NCAwLjEtMC4xIDAuMjUtMC4xNSAwLjQ1LTAuMTVoMC4xM2MwLjE5IDAgMC4zNCAwLjA1IDAuNDUgMC4xNiAwLjEgMC4xIDAuMTYgMC4yNSAwLjE2IDAuNDV2MC4xN2MwIDAuMTktMC4wNSAwLjM0LTAuMTUgMC40NSAtMC4xIDAuMS0wLjI1IDAuMTYtMC40NCAwLjE2aC0wLjEzQzIwMi4wNSA1Ni4yNyAyMDEuOSA1Ni4yMiAyMDEuOCA1Ni4xMnoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjExLjMyIDUyLjIzYzAuMTMgMC4xMSAwLjIgMC4yNSAwLjIgMC40MyAwIDAuMDktMC4wMiAwLjE4LTAuMDYgMC4yN2wtMi42MyA1LjgxYy0wLjA1IDAuMTItMC4xMiAwLjIxLTAuMjIgMC4yOCAtMC4xIDAuMDctMC4yMSAwLjEtMC4zMyAwLjEgLTAuMTcgMC0wLjMxLTAuMDYtMC40My0wLjE3IC0wLjEyLTAuMTEtMC4xOC0wLjI1LTAuMTgtMC40MSAwLTAuMDkgMC4wMi0wLjE4IDAuMDYtMC4yN2wyLjMzLTUuMWgtMi42NmMtMC4xNiAwLTAuMjktMC4wNS0wLjQtMC4xNiAtMC4xMS0wLjExLTAuMTYtMC4yNC0wLjE2LTAuNCAwLTAuMTUgMC4wNS0wLjI4IDAuMTYtMC4zOCAwLjExLTAuMSAwLjI0LTAuMTUgMC40LTAuMTVoMy40OEMyMTEuMDQgNTIuMDYgMjExLjE5IDUyLjEyIDIxMS4zMiA1Mi4yM3oiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjE1Ljg2IDU0LjY3YzAuMzYgMC4yIDAuNjQgMC40OCAwLjg0IDAuODQgMC4yIDAuMzUgMC4zMSAwLjc1IDAuMzEgMS4xOCAwIDAuNDUtMC4xMyAwLjg2LTAuMzggMS4yNCAtMC4yNSAwLjM4LTAuNTkgMC42OC0xLjAxIDAuOTEgLTAuNDIgMC4yMi0wLjg3IDAuMzQtMS4zNiAwLjM0IC0wLjI2IDAtMC41My0wLjA0LTAuOC0wLjEyIC0wLjI4LTAuMDgtMC41LTAuMTktMC42Ny0wLjMzIC0wLjA4LTAuMDctMC4xNS0wLjE2LTAuMi0wLjI4IC0wLjA1LTAuMTItMC4wOC0wLjIzLTAuMDgtMC4zNCAwLTAuMTIgMC4wNS0wLjIzIDAuMTYtMC4zMnMwLjI0LTAuMTQgMC40MS0wLjE0YzAuMTIgMCAwLjI3IDAuMDYgMC40NSAwLjE5IDAuMjggMC4xNyAwLjUzIDAuMjYgMC43NCAwLjI2IDAuMjcgMCAwLjUzLTAuMDYgMC43Ny0wLjE5IDAuMjQtMC4xMyAwLjQzLTAuMyAwLjU3LTAuNTEgMC4xNC0wLjIxIDAuMjItMC40NCAwLjIyLTAuNjkgMC0wLjM2LTAuMTItMC42NS0wLjM3LTAuODhzLTAuNTQtMC4zNC0wLjg4LTAuMzRjLTAuMTUgMC0wLjI5IDAuMDItMC40MSAwLjA2cy0wLjI2IDAuMS0wLjQzIDAuMThjLTAuMTIgMC4wNi0wLjIxIDAuMS0wLjI4IDAuMTMgLTAuMDcgMC4wMy0wLjE0IDAuMDQtMC4yMSAwLjA0IC0wLjI2IDAtMC40NC0wLjA3LTAuNTYtMC4yMSAtMC4xMS0wLjE0LTAuMTYtMC4zMS0wLjE2LTAuNSAwLTAuMDcgMC0wLjExIDAuMDEtMC4xNGwwLjMxLTIuNDhjMC4wMy0wLjE0IDAuMS0wLjI1IDAuMjEtMC4zNCAwLjExLTAuMDkgMC4yNC0wLjEzIDAuNC0wLjEzaDIuODljMC4xNiAwIDAuMjkgMC4wNSAwLjQgMC4xNiAwLjExIDAuMTEgMC4xNiAwLjI0IDAuMTYgMC40IDAgMC4xNS0wLjA1IDAuMjgtMC4xNiAwLjM5IC0wLjExIDAuMS0wLjI0IDAuMTYtMC40IDAuMTZoLTIuNDhsLTAuMTkgMS40NWMwLjEzLTAuMDcgMC4yOS0wLjEzIDAuNDgtMC4xOCAwLjE5LTAuMDUgMC4zOC0wLjA3IDAuNTUtMC4wN0MyMTUuMSA1NC4zNiAyMTUuNSA1NC40NiAyMTUuODYgNTQuNjd6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIxOS4zMyA1OC43MWMtMC40LTAuMy0wLjcxLTAuNzItMC45MS0xLjI2IC0wLjIxLTAuNTQtMC4zMS0xLjE3LTAuMzEtMS44OHMwLjEtMS4zNCAwLjMxLTEuODhjMC4yMS0wLjU0IDAuNTEtMC45NiAwLjkyLTEuMjYgMC40LTAuMyAwLjg5LTAuNDUgMS40NS0wLjQ1czEuMDQgMC4xNSAxLjQ1IDAuNDVjMC40IDAuMyAwLjcxIDAuNzIgMC45MiAxLjI2IDAuMjEgMC41NCAwLjMxIDEuMTcgMC4zMSAxLjg5cy0wLjEgMS4zNC0wLjMxIDEuODljLTAuMjEgMC41NC0wLjUxIDAuOTctMC45MSAxLjI2IC0wLjQgMC4zLTAuODggMC40NS0xLjQ0IDAuNDVTMjE5LjczIDU5LjAxIDIxOS4zMyA1OC43MXpNMjIxLjc4IDU3LjM1YzAuMjQtMC40MSAwLjM3LTEgMC4zNy0xLjc5cy0wLjEyLTEuMzgtMC4zNi0xLjc5Yy0wLjI0LTAuNDEtMC41OC0wLjYxLTEtMC42MXMtMC43NiAwLjItMSAwLjYxIC0wLjM2IDEtMC4zNiAxLjc5IDAuMTIgMS4zOCAwLjM3IDEuNzkgMC41OCAwLjYxIDEgMC42MVMyMjEuNTQgNTcuNzYgMjIxLjc4IDU3LjM1eiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMjYuNTYgNTIuMjRjMC4xMSAwLjEyIDAuMTcgMC4yNiAwLjE3IDAuNDR2NS43OGMwIDAuMTctMC4wNiAwLjMyLTAuMTkgMC40NCAtMC4xMyAwLjEyLTAuMjggMC4xOC0wLjQ3IDAuMThzLTAuMzQtMC4wNi0wLjQ2LTAuMTcgLTAuMTgtMC4yNi0wLjE4LTAuNDN2LTQuNzRsLTAuNjIgMC4zOGMtMC4xIDAuMDYtMC4yMSAwLjA5LTAuMzIgMC4wOSAtMC4xNyAwLTAuMzEtMC4wNi0wLjQyLTAuMTkgLTAuMTItMC4xMy0wLjE3LTAuMjctMC4xNy0wLjQyIDAtMC4xMSAwLjAzLTAuMjEgMC4wOS0wLjNzMC4xMy0wLjE3IDAuMjMtMC4yMmwxLjUxLTAuOWMwLjExLTAuMDYgMC4yNi0wLjA5IDAuNDMtMC4wOUMyMjYuMzEgNTIuMDYgMjI2LjQ1IDUyLjEyIDIyNi41NiA1Mi4yNHoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjMyLjM4IDU4LjEyYzAuMTEgMC4xMSAwLjE2IDAuMjQgMC4xNiAwLjQgMCAwLjE1LTAuMDUgMC4yOC0wLjE2IDAuMzkgLTAuMTEgMC4xLTAuMjQgMC4xNi0wLjQgMC4xNmgtMy40Yy0wLjE3IDAtMC4zMS0wLjA1LTAuNDEtMC4xNiAtMC4xLTAuMTEtMC4xNS0wLjI0LTAuMTUtMC40MXMwLjA2LTAuMzEgMC4xOC0wLjQ0bDIuMTgtMi4zM2MwLjI1LTAuMjcgMC40NC0wLjUzIDAuNTktMC44IDAuMTQtMC4yNyAwLjIyLTAuNTIgMC4yMi0wLjc0IDAtMC4zLTAuMTEtMC41Ni0wLjMyLTAuNzggLTAuMjEtMC4yMi0wLjQ2LTAuMzMtMC43NC0wLjMzIC0wLjE5IDAtMC4zOSAwLjA3LTAuNTggMC4yIC0wLjIgMC4xMy0wLjM3IDAuMy0wLjUzIDAuNTIgLTAuMTIgMC4xNi0wLjI3IDAuMjQtMC40NiAwLjI0IC0wLjE1IDAtMC4yOC0wLjA2LTAuNC0wLjE3IC0wLjEyLTAuMTEtMC4xOC0wLjI0LTAuMTgtMC4zOCAwLTAuMSAwLjAzLTAuMiAwLjEtMC4zIDAuMDctMC4xIDAuMTctMC4yMiAwLjMtMC4zNSAwLjI1LTAuMjUgMC41NS0wLjQ2IDAuODgtMC42MXMwLjY1LTAuMjMgMC45Ni0wLjIzYzAuNDQgMCAwLjgzIDAuMDkgMS4xNiAwLjI4IDAuMzMgMC4xOSAwLjU5IDAuNDQgMC43NyAwLjc3IDAuMTggMC4zMyAwLjI3IDAuNyAwLjI3IDEuMTEgMCAwLjQxLTAuMTEgMC44My0wLjMyIDEuMjVzLTAuNTEgMC44NC0wLjg3IDEuMjRsLTEuMjcgMS4zNWgyLjA2QzIzMi4xNSA1Ny45NiAyMzIuMjggNTguMDEgMjMyLjM4IDU4LjEyeiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yNDAuMjUgNTIuMzdjMC4zMSAwLjIgMC41NSAwLjQ4IDAuNzQgMC44MiAwLjE5IDAuMzQgMC4yOCAwLjcyIDAuMjggMS4xMyAwIDAuNC0wLjA5IDAuNzctMC4yOCAxLjEyIC0wLjE5IDAuMzUtMC40MyAwLjYyLTAuNzQgMC44MyAtMC4zMSAwLjItMC42MyAwLjMxLTAuOTcgMC4zMWgtMS43NHYxLjg5YzAgMC4xOC0wLjA1IDAuMzMtMC4xNiAwLjQ0IC0wLjExIDAuMTEtMC4yNSAwLjE3LTAuNDIgMC4xNyAtMC4xNyAwLTAuMy0wLjA2LTAuNDEtMC4xNyAtMC4xMS0wLjEyLTAuMTYtMC4yNi0wLjE2LTAuNDN2LTUuNzhjMC0wLjE3IDAuMDYtMC4zMiAwLjE4LTAuNDMgMC4xMi0wLjEyIDAuMjYtMC4xNyAwLjQ0LTAuMTdoMi4yOEMyMzkuNjIgNTIuMDYgMjM5Ljk1IDUyLjE2IDI0MC4yNSA1Mi4zN3pNMjM5LjY2IDU1LjI2YzAuMTItMC4xMSAwLjIyLTAuMjQgMC4zLTAuNDFzMC4xMi0wLjM1IDAuMTItMC41MyAtMC4wNC0wLjM2LTAuMTEtMC41MyAtMC4xOC0wLjMxLTAuMy0wLjQxYy0wLjEyLTAuMS0wLjI1LTAuMTUtMC4zNy0wLjE1aC0xLjc0djIuMjFoMS43NEMyMzkuNDEgNTUuNDIgMjM5LjU0IDU1LjM3IDIzOS42NiA1NS4yNnoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjQ3LjU2IDU4LjUyYzAgMC4xNy0wLjA2IDAuMzItMC4xNyAwLjQzIC0wLjExIDAuMTEtMC4yNCAwLjE3LTAuMzkgMC4xNyAtMC4xMiAwLTAuMjMtMC4wNC0wLjMyLTAuMTFzLTAuMTctMC4xNy0wLjIyLTAuM2wtMC41Mi0xLjIxaC0yLjk4bC0wLjUyIDEuMjJjLTAuMDUgMC4xMy0wLjEyIDAuMjMtMC4yMSAwLjMgLTAuMSAwLjA3LTAuMiAwLjExLTAuMzEgMC4xMSAtMC4xNyAwLTAuMy0wLjA1LTAuMzktMC4xNCAtMC4wOS0wLjA5LTAuMTMtMC4yMi0wLjEzLTAuMzggMC0wLjA2IDAuMDEtMC4xMiAwLjAzLTAuMTlsMi40OS01Ljk4YzAuMDUtMC4xMyAwLjEzLTAuMjQgMC4yNC0wLjMxIDAuMTEtMC4wNyAwLjIzLTAuMSAwLjM2LTAuMDkgMC4xMiAwIDAuMjMgMC4wNCAwLjM0IDAuMTEgMC4xIDAuMDcgMC4xOCAwLjE3IDAuMjMgMC4zbDIuNDYgNS44NkMyNDcuNTUgNTguMzcgMjQ3LjU2IDU4LjQ1IDI0Ny41NiA1OC41MnpNMjQzLjQ0IDU2LjM0aDJsLTEuMDEtMi4zNEwyNDMuNDQgNTYuMzR6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTI1NC4xMSA1OC4yOWMwLjA1IDAuMDkgMC4wOCAwLjE4IDAuMDggMC4yNyAwIDAuMTItMC4wNCAwLjIzLTAuMTIgMC4zMyAtMC4xIDAuMTItMC4yNSAwLjE4LTAuNDYgMC4xOCAtMC4xNiAwLTAuMzEtMC4wNC0wLjQ0LTAuMTEgLTAuNDgtMC4yNy0wLjcyLTAuODMtMC43Mi0xLjY3IDAtMC4yNC0wLjA4LTAuNDMtMC4yMy0wLjU3IC0wLjE2LTAuMTQtMC4zOC0wLjIxLTAuNjctMC4yMWgtMS44N3YxLjk0YzAgMC4xOC0wLjA1IDAuMzMtMC4xNCAwLjQ0cy0wLjIyIDAuMTctMC4zOCAwLjE3Yy0wLjE5IDAtMC4zNi0wLjA2LTAuNS0wLjE3IC0wLjE0LTAuMTItMC4yMS0wLjI2LTAuMjEtMC40M3YtNS43OGMwLTAuMTcgMC4wNi0wLjMyIDAuMTgtMC40MyAwLjEyLTAuMTIgMC4yNi0wLjE3IDAuNDQtMC4xN2gyLjg4YzAuMzUgMCAwLjY3IDAuMDkgMC45OCAwLjI4IDAuMzEgMC4xOSAwLjU1IDAuNDQgMC43NCAwLjc3IDAuMTggMC4zMyAwLjI4IDAuNjkgMC4yOCAxLjEgMCAwLjMzLTAuMDkgMC42Ni0wLjI3IDAuOTggLTAuMTggMC4zMi0wLjQxIDAuNTctMC43IDAuNzYgMC40MiAwLjI5IDAuNjUgMC42OSAwLjY5IDEuMTggMC4wMiAwLjExIDAuMDMgMC4yMSAwLjAzIDAuMzEgMC4wMyAwLjIxIDAuMDUgMC4zNiAwLjA4IDAuNDUgMC4wMyAwLjA5IDAuMDkgMC4xNiAwLjE4IDAuMjFDMjUzLjk5IDU4LjEzIDI1NC4wNiA1OC4yIDI1NC4xMSA1OC4yOXpNMjUyLjIgNTUuMzFjMC4xMS0wLjExIDAuMjEtMC4yNiAwLjI4LTAuNDVzMC4xMS0wLjM5IDAuMTEtMC42MWMwLTAuMTktMC4wNC0wLjM2LTAuMTEtMC41MXMtMC4xNy0wLjI4LTAuMjgtMC4zNyAtMC4yMy0wLjE0LTAuMzUtMC4xNGgtMi4xOXYyLjI3aDIuMTlDMjUxLjk3IDU1LjQ4IDI1Mi4wOSA1NS40MiAyNTIuMiA1NS4zMXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjU2LjM0IDU4Ljg5Yy0wLjEzIDAuMTItMC4yNyAwLjE4LTAuNDQgMC4xOCAtMC4xOCAwLTAuMzMtMC4wNi0wLjQ0LTAuMTdzLTAuMTctMC4yNi0wLjE3LTAuNDN2LTUuNzhjMC0wLjE3IDAuMDYtMC4zMiAwLjE4LTAuNDMgMC4xMi0wLjEyIDAuMjctMC4xNyAwLjQ2LTAuMTcgMC4xNyAwIDAuMzEgMC4wNiAwLjQzIDAuMTggMC4xMiAwLjEyIDAuMTggMC4yNiAwLjE4IDAuNDR2NS43OEMyNTYuNTMgNTguNjIgMjU2LjQ3IDU4Ljc3IDI1Ni4zNCA1OC44OXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjU5IDU4Ljk4Yy0wLjM3LTAuMTItMC43Mi0wLjMyLTEuMDUtMC42MSAtMC4xOC0wLjE2LTAuMjctMC4zNC0wLjI3LTAuNTMgMC0wLjE1IDAuMDYtMC4yOSAwLjE3LTAuNHMwLjI1LTAuMTcgMC40MS0wLjE3YzAuMTMgMCAwLjI0IDAuMDQgMC4zNCAwLjEyIDAuMjcgMC4yMiAwLjUzIDAuMzggMC43OCAwLjQ4IDAuMjUgMC4xIDAuNTUgMC4xNSAwLjkgMC4xNSAwLjM3IDAgMC43LTAuMDggMC45Ny0wLjI1IDAuMjctMC4xNyAwLjQxLTAuMzcgMC40MS0wLjYyIDAtMC4zLTAuMTMtMC41My0wLjQtMC43IC0wLjI3LTAuMTctMC42OS0wLjMtMS4yNy0wLjM4IC0xLjQ2LTAuMjEtMi4xOS0wLjg5LTIuMTktMi4wNCAwLTAuNDIgMC4xMS0wLjc4IDAuMzMtMS4wOSAwLjIyLTAuMzEgMC41Mi0wLjU1IDAuOS0wLjcxIDAuMzgtMC4xNiAwLjgtMC4yNCAxLjI3LTAuMjQgMC40MiAwIDAuODIgMC4wNiAxLjE5IDAuMTkgMC4zNyAwLjEzIDAuNjggMC4yOSAwLjkzIDAuNSAwLjE5IDAuMTUgMC4yOSAwLjMzIDAuMjkgMC41MyAwIDAuMTUtMC4wNiAwLjI5LTAuMTcgMC40MSAtMC4xMSAwLjEyLTAuMjUgMC4xOC0wLjQgMC4xOCAtMC4xIDAtMC4xOS0wLjAzLTAuMjctMC4wOSAtMC4xNy0wLjE0LTAuNDEtMC4yNy0wLjcyLTAuMzggLTAuMzEtMC4xMi0wLjU5LTAuMTctMC44My0wLjE3IC0wLjQyIDAtMC43NCAwLjA4LTAuOTcgMC4yNHMtMC4zNCAwLjM2LTAuMzQgMC42MmMwIDAuMjkgMC4xMiAwLjUgMC4zNiAwLjY1IDAuMjQgMC4xNSAwLjYxIDAuMjcgMS4xMiAwLjM2IDAuNTcgMC4xIDEuMDMgMC4yMyAxLjM4IDAuMzkgMC4zNCAwLjE2IDAuNiAwLjM3IDAuNzggMC42NHMwLjI2IDAuNjMgMC4yNiAxLjA4YzAgMC40Mi0wLjEyIDAuNzktMC4zNSAxLjExIC0wLjI0IDAuMzItMC41NSAwLjU2LTAuOTQgMC43MyAtMC4zOSAwLjE3LTAuODIgMC4yNi0xLjI3IDAuMjZDMjU5LjggNTkuMTYgMjU5LjM4IDU5LjEgMjU5IDU4Ljk4eiIvPjwvc3ZnPg==") no-repeat; background-size: contain; background-position: 50% 50%; font-size: 0; opacity: 0.95; transition: 0.1s; } menubar .logocf:hover,[data-is="menubar"] .logocf:hover{ opacity: 1; } menubar .search,[data-is="menubar"] .search{ position: absolute; bottom: 0; left: 0; width: calc(100% - 48px); height: 48px; background-color: #eee; display: none; }', '', function(opts) {
  var tag$$1 = this;
  tag$$1.selectedItem = null;
  tag$$1.searchHasFocus = false;

  tag$$1.items = _({
    top: [
      { title: "Collections" },
      { title: "Professionnels" },
      { title: "Presse" },
      { title: "Groupes" }
    ],
    bottom: [
      { title: "Événements" },
      { title: "Exposition" },
      { title: "Musée" },
      { title: "Bibliothèque" },
      { title: "Découvrir" },
      { title: "Infos pratiques" },
      { title: "Calendrier" } ]
  })
  .mapValues(function (i) { return _(i).map(function (j) { return _({}).assign(j, {
        id: _.kebabCase(j.title)
      }).value(); }
    ).value(); }
  ).value();

  tag$$1.isSelectedItem = function (item) {
    return item.id === tag$$1.selectedItem;
  };

  tag$$1.select = function (e) {
    tag$$1.selectedItem = e.item.item.id;
    return true;
  };

  tag$$1.searchSubmit = function (e) {
    tag$$1.searchSetFocus();
    e.preventDefault();
  };

  tag$$1.searchSetFocus = function (e) {
    tag$$1.searchHasFocus = true;
  };

  tag$$1.searchSetBlur = function (e) {
    tag$$1.searchHasFocus = false;
  };

});

var state = {
  menuBar: {
    selected: "musee"
  }
};

riot$1.mount("app", state);

}());
