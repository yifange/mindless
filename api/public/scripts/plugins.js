;
(function (window) {
  var undefined;
  var arrayPool = [], objectPool = [];
  var idCounter = 0;
  var indicatorObject = {};
  var keyPrefix = +new Date() + '';
  var largeArraySize = 75;
  var maxPoolSize = 40;
  var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g;
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
  var reFlags = /\w*$/;
  var reInterpolate = /<%=([\s\S]+?)%>/g;
  var reThis = (reThis = /\bthis\b/) && reThis.test(runInContext) && reThis;
  var whitespace = ' \t\x0B\f\xa0\ufeff' + '\n\r\u2028\u2029' + '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000';
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');
  var reNoMatch = /($^)/;
  var reUnescapedHtml = /[&<>"']/g;
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;
  var contextProps = [
      'Array',
      'Boolean',
      'Date',
      'Error',
      'Function',
      'Math',
      'Number',
      'Object',
      'RegExp',
      'String',
      '_',
      'attachEvent',
      'clearTimeout',
      'isFinite',
      'isNaN',
      'parseInt',
      'setImmediate',
      'setTimeout'
    ];
  var shadowedProps = [
      'constructor',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
      'toString',
      'valueOf'
    ];
  var templateCounter = 0;
  var argsClass = '[object Arguments]', arrayClass = '[object Array]', boolClass = '[object Boolean]', dateClass = '[object Date]', errorClass = '[object Error]', funcClass = '[object Function]', numberClass = '[object Number]', objectClass = '[object Object]', regexpClass = '[object RegExp]', stringClass = '[object String]';
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] = cloneableClasses[boolClass] = cloneableClasses[dateClass] = cloneableClasses[numberClass] = cloneableClasses[objectClass] = cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;
  var objectTypes = {
      'boolean': false,
      'function': true,
      'object': true,
      'number': false,
      'string': false,
      'undefined': false
    };
  var stringEscapes = {
      '\\': '\\',
      '\'': '\'',
      '\n': 'n',
      '\r': 'r',
      '\t': 't',
      '\u2028': 'u2028',
      '\u2029': 'u2029'
    };
  var freeExports = objectTypes[typeof exports] && exports;
  var freeModule = objectTypes[typeof module] && module && module.exports == freeExports && module;
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    window = freeGlobal;
  }
  function basicIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1, length = array.length;
    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;
    if (type == 'boolean' || value == null) {
      return cache[value];
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = cache[type] || (cache[type] = {});
    return type == 'object' ? cache[key] && basicIndexOf(cache[key], value) > -1 ? 0 : -1 : cache[key] ? 0 : -1;
  }
  function cachePush(value) {
    var cache = this.cache, type = typeof value;
    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value, typeCache = cache[type] || (cache[type] = {});
      if (type == 'object') {
        if ((typeCache[key] || (typeCache[key] = [])).push(value) == this.array.length) {
          cache[type] = false;
        }
      } else {
        typeCache[key] = true;
      }
    }
  }
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }
  function compareAscending(a, b) {
    var ai = a.index, bi = b.index;
    a = a.criteria;
    b = b.criteria;
    if (a !== b) {
      if (a > b || typeof a == 'undefined') {
        return 1;
      }
      if (a < b || typeof b == 'undefined') {
        return -1;
      }
    }
    return ai < bi ? -1 : 1;
  }
  function createCache(array) {
    var index = -1, length = array.length;
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;
    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;
    while (++index < length) {
      result.push(array[index]);
    }
    return cache.object === false ? (releaseObject(result), null) : result;
  }
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }
  function getArray() {
    return arrayPool.pop() || [];
  }
  function getObject() {
    return objectPool.pop() || {
      'args': '',
      'array': null,
      'bottom': '',
      'cache': null,
      'criteria': null,
      'false': false,
      'firstArg': '',
      'index': 0,
      'init': '',
      'leading': false,
      'loop': '',
      'maxWait': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'shadowedProps': null,
      'string': null,
      'support': null,
      'top': '',
      'trailing': false,
      'true': false,
      'undefined': false,
      'useHas': false,
      'useKeys': false,
      'value': null
    };
  }
  function isNode(value) {
    return typeof value.toString != 'function' && typeof (value + '') == 'string';
  }
  function noop() {
  }
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1, length = end - start || 0, result = Array(length < 0 ? 0 : length);
    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }
  function runInContext(context) {
    context = context ? _.defaults(window.Object(), context, _.pick(window, contextProps)) : window;
    var Array = context.Array, Boolean = context.Boolean, Date = context.Date, Error = context.Error, Function = context.Function, Math = context.Math, Number = context.Number, Object = context.Object, RegExp = context.RegExp, String = context.String, TypeError = context.TypeError;
    var arrayRef = [];
    var errorProto = Error.prototype, objectProto = Object.prototype, stringProto = String.prototype;
    var oldDash = context._;
    var reNative = RegExp('^' + String(objectProto.valueOf).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/valueOf|for [^\]]+/g, '.+?') + '$');
    var ceil = Math.ceil, clearTimeout = context.clearTimeout, concat = arrayRef.concat, floor = Math.floor, fnToString = Function.prototype.toString, getPrototypeOf = reNative.test(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf, hasOwnProperty = objectProto.hasOwnProperty, push = arrayRef.push, propertyIsEnumerable = objectProto.propertyIsEnumerable, setImmediate = context.setImmediate, setTimeout = context.setTimeout, toString = objectProto.toString;
    var nativeBind = reNative.test(nativeBind = toString.bind) && nativeBind, nativeCreate = reNative.test(nativeCreate = Object.create) && nativeCreate, nativeIsArray = reNative.test(nativeIsArray = Array.isArray) && nativeIsArray, nativeIsFinite = context.isFinite, nativeIsNaN = context.isNaN, nativeKeys = reNative.test(nativeKeys = Object.keys) && nativeKeys, nativeMax = Math.max, nativeMin = Math.min, nativeParseInt = context.parseInt, nativeRandom = Math.random, nativeSlice = arrayRef.slice;
    var isIeOpera = reNative.test(context.attachEvent), isV8 = nativeBind && !/\n|true/.test(nativeBind + isIeOpera);
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;
    var nonEnumProps = {};
    nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = {
      'constructor': true,
      'toLocaleString': true,
      'toString': true,
      'valueOf': true
    };
    nonEnumProps[boolClass] = nonEnumProps[stringClass] = {
      'constructor': true,
      'toString': true,
      'valueOf': true
    };
    nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = {
      'constructor': true,
      'toString': true
    };
    nonEnumProps[objectClass] = { 'constructor': true };
    (function () {
      var length = shadowedProps.length;
      while (length--) {
        var prop = shadowedProps[length];
        for (var className in nonEnumProps) {
          if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], prop)) {
            nonEnumProps[className][prop] = false;
          }
        }
      }
    }());
    function lodash(value) {
      return value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__') ? value : new lodashWrapper(value);
    }
    function lodashWrapper(value) {
      this.__wrapped__ = value;
    }
    lodashWrapper.prototype = lodash.prototype;
    var support = lodash.support = {};
    (function () {
      var ctor = function () {
          this.x = 1;
        }, object = {
          '0': 1,
          'length': 1
        }, props = [];
      ctor.prototype = {
        'valueOf': 1,
        'y': 1
      };
      for (var prop in new ctor()) {
        props.push(prop);
      }
      for (prop in arguments) {
      }
      support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);
      support.argsClass = isArguments(arguments);
      support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');
      support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');
      support.fastBind = nativeBind && !isV8;
      support.ownLast = props[0] != 'x';
      support.nonEnumArgs = prop != 0;
      support.nonEnumShadows = !/valueOf/.test(props);
      support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);
      support.unindexedChars = 'x'[0] + Object('x')[0] != 'xx';
      try {
        support.nodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));
      } catch (e) {
        support.nodeClass = true;
      }
    }(1));
    lodash.templateSettings = {
      'escape': /<%-([\s\S]+?)%>/g,
      'evaluate': /<%([\s\S]+?)%>/g,
      'interpolate': reInterpolate,
      'variable': '',
      'imports': { '_': lodash }
    };
    var iteratorTemplate = template('var index, iterable = <%= firstArg %>, ' + 'result = <%= init %>;\n' + 'if (!iterable) return result;\n' + '<%= top %>;' + '<% if (array) { %>\n' + 'var length = iterable.length; index = -1;\n' + 'if (<%= array %>) {' + '  <% if (support.unindexedChars) { %>\n' + '  if (isString(iterable)) {\n' + '    iterable = iterable.split(\'\')\n' + '  }' + '  <% } %>\n' + '  while (++index < length) {\n' + '    <%= loop %>;\n' + '  }\n' + '}\n' + 'else {' + '  <% } else if (support.nonEnumArgs) { %>\n' + '  var length = iterable.length; index = -1;\n' + '  if (length && isArguments(iterable)) {\n' + '    while (++index < length) {\n' + '      index += \'\';\n' + '      <%= loop %>;\n' + '    }\n' + '  } else {' + '  <% } %>' + '  <% if (support.enumPrototypes) { %>\n' + '  var skipProto = typeof iterable == \'function\';\n' + '  <% } %>' + '  <% if (support.enumErrorProps) { %>\n' + '  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n' + '  <% } %>' + '  <%' + '    var conditions = [];' + '    if (support.enumPrototypes) { conditions.push(\'!(skipProto && index == "prototype")\'); }' + '    if (support.enumErrorProps)  { conditions.push(\'!(skipErrorProps && (index == "message" || index == "name"))\'); }' + '  %>' + '  <% if (useHas && useKeys) { %>\n' + '  var ownIndex = -1,\n' + '      ownProps = objectTypes[typeof iterable] && keys(iterable),\n' + '      length = ownProps ? ownProps.length : 0;\n\n' + '  while (++ownIndex < length) {\n' + '    index = ownProps[ownIndex];\n<%' + '    if (conditions.length) { %>    if (<%= conditions.join(\' && \') %>) {\n  <% } %>' + '    <%= loop %>;' + '    <% if (conditions.length) { %>\n    }<% } %>\n' + '  }' + '  <% } else { %>\n' + '  for (index in iterable) {\n<%' + '    if (useHas) { conditions.push("hasOwnProperty.call(iterable, index)"); }' + '    if (conditions.length) { %>    if (<%= conditions.join(\' && \') %>) {\n  <% } %>' + '    <%= loop %>;' + '    <% if (conditions.length) { %>\n    }<% } %>\n' + '  }' + '    <% if (support.nonEnumShadows) { %>\n\n' + '  if (iterable !== objectProto) {\n' + '    var ctor = iterable.constructor,\n' + '        isProto = iterable === (ctor && ctor.prototype),\n' + '        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n' + '        nonEnum = nonEnumProps[className];\n' + '      <% for (k = 0; k < 7; k++) { %>\n' + '    index = \'<%= shadowedProps[k] %>\';\n' + '    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))<%' + '        if (!useHas) { %> || (!nonEnum[index] && iterable[index] !== objectProto[index])<% }' + '      %>) {\n' + '      <%= loop %>;\n' + '    }' + '      <% } %>\n' + '  }' + '    <% } %>' + '  <% } %>' + '  <% if (array || support.nonEnumArgs) { %>\n}<% } %>\n' + '<%= bottom %>;\n' + 'return result');
    var defaultsIteratorOptions = {
        'args': 'object, source, guard',
        'top': 'var args = arguments,\n' + '    argsIndex = 0,\n' + '    argsLength = typeof guard == \'number\' ? 2 : args.length;\n' + 'while (++argsIndex < argsLength) {\n' + '  iterable = args[argsIndex];\n' + '  if (iterable && objectTypes[typeof iterable]) {',
        'loop': 'if (typeof result[index] == \'undefined\') result[index] = iterable[index]',
        'bottom': '  }\n}'
      };
    var eachIteratorOptions = {
        'args': 'collection, callback, thisArg',
        'top': 'callback = callback && typeof thisArg == \'undefined\' ? callback : lodash.createCallback(callback, thisArg)',
        'array': 'typeof length == \'number\'',
        'loop': 'if (callback(iterable[index], index, collection) === false) return result'
      };
    var forOwnIteratorOptions = {
        'top': 'if (!objectTypes[typeof iterable]) return result;\n' + eachIteratorOptions.top,
        'array': false
      };
    function createBound(func, thisArg, partialArgs, indicator) {
      var isFunc = isFunction(func), isPartial = !partialArgs, key = thisArg;
      if (isPartial) {
        var rightIndicator = indicator;
        partialArgs = thisArg;
      } else if (!isFunc) {
        if (!indicator) {
          throw new TypeError();
        }
        thisArg = func;
      }
      function bound() {
        var args = arguments, thisBinding = isPartial ? this : thisArg;
        if (!isFunc) {
          func = thisArg[key];
        }
        if (partialArgs.length) {
          args = args.length ? (args = nativeSlice.call(args), rightIndicator ? args.concat(partialArgs) : partialArgs.concat(args)) : partialArgs;
        }
        if (this instanceof bound) {
          thisBinding = createObject(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      return bound;
    }
    function createIterator() {
      var data = getObject();
      data.shadowedProps = shadowedProps;
      data.support = support;
      data.array = data.bottom = data.loop = data.top = '';
      data.init = 'iterable';
      data.useHas = true;
      data.useKeys = !!keys;
      for (var object, index = 0; object = arguments[index]; index++) {
        for (var key in object) {
          data[key] = object[key];
        }
      }
      var args = data.args;
      data.firstArg = /^[^,]+/.exec(args)[0];
      var factory = Function('errorClass, errorProto, hasOwnProperty, isArguments, isArray, ' + 'isString, keys, lodash, objectProto, objectTypes, nonEnumProps, ' + 'stringClass, stringProto, toString', 'return function(' + args + ') {\n' + iteratorTemplate(data) + '\n}');
      releaseObject(data);
      return factory(errorClass, errorProto, hasOwnProperty, isArguments, isArray, isString, keys, lodash, objectProto, objectTypes, nonEnumProps, stringClass, stringProto, toString);
    }
    function createObject(prototype) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    if (!nativeCreate) {
      var createObject = function (prototype) {
        if (isObject(prototype)) {
          noop.prototype = prototype;
          var result = new noop();
          noop.prototype = null;
        }
        return result || {};
      };
    }
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }
    function getIndexOf(array, value, fromIndex) {
      var result = (result = lodash.indexOf) === indexOf ? basicIndexOf : result;
      return result;
    }
    function overloadWrapper(func) {
      return function (array, flag, callback, thisArg) {
        if (typeof flag != 'boolean' && flag != null) {
          thisArg = callback;
          callback = !(thisArg && thisArg[flag] === array) ? flag : undefined;
          flag = false;
        }
        if (callback != null) {
          callback = lodash.createCallback(callback, thisArg);
        }
        return func(array, flag, callback, thisArg);
      };
    }
    function shimIsPlainObject(value) {
      var ctor, result;
      if (!(value && toString.call(value) == objectClass) || (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor)) || !support.argsClass && isArguments(value) || !support.nodeClass && isNode(value)) {
        return false;
      }
      if (support.ownLast) {
        forIn(value, function (value, key, object) {
          result = hasOwnProperty.call(object, key);
          return false;
        });
        return result !== false;
      }
      forIn(value, function (value, key) {
        result = key;
      });
      return result === undefined || hasOwnProperty.call(value, result);
    }
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }
    function isArguments(value) {
      return toString.call(value) == argsClass;
    }
    if (!support.argsClass) {
      isArguments = function (value) {
        return value ? hasOwnProperty.call(value, 'callee') : false;
      };
    }
    var isArray = nativeIsArray || function (value) {
        return value ? typeof value == 'object' && toString.call(value) == arrayClass : false;
      };
    var shimKeys = createIterator({
        'args': 'object',
        'init': '[]',
        'top': 'if (!(objectTypes[typeof object])) return result',
        'loop': 'result.push(index)'
      });
    var keys = !nativeKeys ? shimKeys : function (object) {
        if (!isObject(object)) {
          return [];
        }
        if (support.enumPrototypes && typeof object == 'function' || support.nonEnumArgs && object.length && isArguments(object)) {
          return shimKeys(object);
        }
        return nativeKeys(object);
      };
    var basicEach = createIterator(eachIteratorOptions);
    var htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;'
      };
    var htmlUnescapes = invert(htmlEscapes);
    var assign = createIterator(defaultsIteratorOptions, {
        'top': defaultsIteratorOptions.top.replace(';', ';\n' + 'if (argsLength > 3 && typeof args[argsLength - 2] == \'function\') {\n' + '  var callback = lodash.createCallback(args[--argsLength - 1], args[argsLength--], 2);\n' + '} else if (argsLength > 2 && typeof args[argsLength - 1] == \'function\') {\n' + '  callback = args[--argsLength];\n' + '}'),
        'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'
      });
    function clone(value, deep, callback, thisArg, stackA, stackB) {
      var result = value;
      if (typeof deep != 'boolean' && deep != null) {
        thisArg = callback;
        callback = deep;
        deep = false;
      }
      if (typeof callback == 'function') {
        callback = typeof thisArg == 'undefined' ? callback : lodash.createCallback(callback, thisArg, 1);
        result = callback(result);
        if (typeof result != 'undefined') {
          return result;
        }
        result = value;
      }
      var isObj = isObject(result);
      if (isObj) {
        var className = toString.call(result);
        if (!cloneableClasses[className] || !support.nodeClass && isNode(result)) {
          return result;
        }
        var isArr = isArray(result);
      }
      if (!isObj || !deep) {
        return isObj ? isArr ? slice(result) : assign({}, result) : result;
      }
      var ctor = ctorByClass[className];
      switch (className) {
      case boolClass:
      case dateClass:
        return new ctor(+result);
      case numberClass:
      case stringClass:
        return new ctor(result);
      case regexpClass:
        return ctor(result.source, reFlags.exec(result));
      }
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());
      var length = stackA.length;
      while (length--) {
        if (stackA[length] == value) {
          return stackB[length];
        }
      }
      result = isArr ? ctor(result.length) : {};
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      stackA.push(value);
      stackB.push(result);
      (isArr ? basicEach : forOwn)(value, function (objValue, key) {
        result[key] = clone(objValue, deep, callback, undefined, stackA, stackB);
      });
      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }
    function cloneDeep(value, callback, thisArg) {
      return clone(value, true, callback, thisArg);
    }
    var defaults = createIterator(defaultsIteratorOptions);
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg);
      forOwn(object, function (value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }
    var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, { 'useHas': false });
    var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);
    function functions(object) {
      var result = [];
      forIn(object, function (value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }
    function has(object, property) {
      return object ? hasOwnProperty.call(object, property) : false;
    }
    function invert(object) {
      var index = -1, props = keys(object), length = props.length, result = {};
      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }
    function isBoolean(value) {
      return value === true || value === false || toString.call(value) == boolClass;
    }
    function isDate(value) {
      return value ? typeof value == 'object' && toString.call(value) == dateClass : false;
    }
    function isElement(value) {
      return value ? value.nodeType === 1 : false;
    }
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value), length = value.length;
      if (className == arrayClass || className == stringClass || (support.argsClass ? className == argsClass : isArguments(value)) || className == objectClass && typeof length == 'number' && isFunction(value.splice)) {
        return !length;
      }
      forOwn(value, function () {
        return result = false;
      });
      return result;
    }
    function isEqual(a, b, callback, thisArg, stackA, stackB) {
      var whereIndicator = callback === indicatorObject;
      if (typeof callback == 'function' && !whereIndicator) {
        callback = lodash.createCallback(callback, thisArg, 2);
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      if (a === b) {
        return a !== 0 || 1 / a == 1 / b;
      }
      var type = typeof a, otherType = typeof b;
      if (a === a && (!a || type != 'function' && type != 'object') && (!b || otherType != 'function' && otherType != 'object')) {
        return false;
      }
      if (a == null || b == null) {
        return a === b;
      }
      var className = toString.call(a), otherClass = toString.call(b);
      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
      case boolClass:
      case dateClass:
        return +a == +b;
      case numberClass:
        return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
      case regexpClass:
      case stringClass:
        return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        if (hasOwnProperty.call(a, '__wrapped__ ') || hasOwnProperty.call(b, '__wrapped__')) {
          return isEqual(a.__wrapped__ || a, b.__wrapped__ || b, callback, thisArg, stackA, stackB);
        }
        if (className != objectClass || !support.nodeClass && (isNode(a) || isNode(b))) {
          return false;
        }
        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor, ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;
        if (ctorA != ctorB && !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB)) {
          return false;
        }
      }
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());
      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;
      stackA.push(a);
      stackB.push(b);
      if (isArr) {
        length = a.length;
        size = b.length;
        result = size == a.length;
        if (!result && !whereIndicator) {
          return result;
        }
        while (size--) {
          var index = length, value = b[size];
          if (whereIndicator) {
            while (index--) {
              if (result = isEqual(a[index], value, callback, thisArg, stackA, stackB)) {
                break;
              }
            }
          } else if (!(result = isEqual(a[size], value, callback, thisArg, stackA, stackB))) {
            break;
          }
        }
        return result;
      }
      forIn(b, function (value, key, b) {
        if (hasOwnProperty.call(b, key)) {
          size++;
          return result = hasOwnProperty.call(a, key) && isEqual(a[key], value, callback, thisArg, stackA, stackB);
        }
      });
      if (result && !whereIndicator) {
        forIn(a, function (value, key, a) {
          if (hasOwnProperty.call(a, key)) {
            return result = --size > -1;
          }
        });
      }
      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }
    function isFunction(value) {
      return typeof value == 'function';
    }
    if (isFunction(/x/)) {
      isFunction = function (value) {
        return typeof value == 'function' && toString.call(value) == funcClass;
      };
    }
    function isObject(value) {
      return !!(value && objectTypes[typeof value]);
    }
    function isNaN(value) {
      return isNumber(value) && value != +value;
    }
    function isNull(value) {
      return value === null;
    }
    function isNumber(value) {
      return typeof value == 'number' || toString.call(value) == numberClass;
    }
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function (value) {
        if (!(value && toString.call(value) == objectClass) || !support.argsClass && isArguments(value)) {
          return false;
        }
        var valueOf = value.valueOf, objProto = typeof valueOf == 'function' && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);
        return objProto ? value == objProto || getPrototypeOf(value) == objProto : shimIsPlainObject(value);
      };
    function isRegExp(value) {
      return !!(value && objectTypes[typeof value]) && toString.call(value) == regexpClass;
    }
    function isString(value) {
      return typeof value == 'string' || toString.call(value) == stringClass;
    }
    function isUndefined(value) {
      return typeof value == 'undefined';
    }
    function merge(object, source, deepIndicator) {
      var args = arguments, index = 0, length = 2;
      if (!isObject(object)) {
        return object;
      }
      if (deepIndicator === indicatorObject) {
        var callback = args[3], stackA = args[4], stackB = args[5];
      } else {
        var initedStack = true;
        stackA = getArray();
        stackB = getArray();
        if (typeof deepIndicator != 'number') {
          length = args.length;
        }
        if (length > 3 && typeof args[length - 2] == 'function') {
          callback = lodash.createCallback(args[--length - 1], args[length--], 2);
        } else if (length > 2 && typeof args[length - 1] == 'function') {
          callback = args[--length];
        }
      }
      while (++index < length) {
        (isArray(args[index]) ? forEach : forOwn)(args[index], function (source, key) {
          var found, isArr, result = source, value = object[key];
          if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
            var stackLength = stackA.length;
            while (stackLength--) {
              if (found = stackA[stackLength] == source) {
                value = stackB[stackLength];
                break;
              }
            }
            if (!found) {
              var isShallow;
              if (callback) {
                result = callback(value, source);
                if (isShallow = typeof result != 'undefined') {
                  value = result;
                }
              }
              if (!isShallow) {
                value = isArr ? isArray(value) ? value : [] : isPlainObject(value) ? value : {};
              }
              stackA.push(source);
              stackB.push(value);
              if (!isShallow) {
                value = merge(value, source, indicatorObject, callback, stackA, stackB);
              }
            }
          } else {
            if (callback) {
              result = callback(value, source);
              if (typeof result == 'undefined') {
                result = source;
              }
            }
            if (typeof result != 'undefined') {
              value = result;
            }
          }
          object[key] = value;
        });
      }
      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return object;
    }
    function omit(object, callback, thisArg) {
      var indexOf = getIndexOf(), isFunc = typeof callback == 'function', result = {};
      if (isFunc) {
        callback = lodash.createCallback(callback, thisArg);
      } else {
        var props = concat.apply(arrayRef, nativeSlice.call(arguments, 1));
      }
      forIn(object, function (value, key, object) {
        if (isFunc ? !callback(value, key, object) : indexOf(props, key) < 0) {
          result[key] = value;
        }
      });
      return result;
    }
    function pairs(object) {
      var index = -1, props = keys(object), length = props.length, result = Array(length);
      while (++index < length) {
        var key = props[index];
        result[index] = [
          key,
          object[key]
        ];
      }
      return result;
    }
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1, props = concat.apply(arrayRef, nativeSlice.call(arguments, 1)), length = isObject(object) ? props.length : 0;
        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg);
        forIn(object, function (value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      callback = lodash.createCallback(callback, thisArg, 4);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor, proto = ctor && ctor.prototype;
          accumulator = createObject(proto);
        }
      }
      (isArr ? basicEach : forOwn)(object, function (value, index, object) {
        return callback(accumulator, value, index, object);
      });
      return accumulator;
    }
    function values(object) {
      var index = -1, props = keys(object), length = props.length, result = Array(length);
      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }
    function at(collection) {
      var index = -1, props = concat.apply(arrayRef, nativeSlice.call(arguments, 1)), length = props.length, result = Array(length);
      if (support.unindexedChars && isString(collection)) {
        collection = collection.split('');
      }
      while (++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }
    function contains(collection, target, fromIndex) {
      var index = -1, indexOf = getIndexOf(), length = collection ? collection.length : 0, result = false;
      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (length && typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        basicEach(collection, function (value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }
    function countBy(collection, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg);
      forEach(collection, function (value, key, collection) {
        key = String(callback(value, key, collection));
        hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1;
      });
      return result;
    }
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg);
      if (isArray(collection)) {
        var index = -1, length = collection.length;
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        basicEach(collection, function (value, index, collection) {
          return result = !!callback(value, index, collection);
        });
      }
      return result;
    }
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg);
      if (isArray(collection)) {
        var index = -1, length = collection.length;
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        basicEach(collection, function (value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg);
      if (isArray(collection)) {
        var index = -1, length = collection.length;
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        basicEach(collection, function (value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }
    function forEach(collection, callback, thisArg) {
      if (callback && typeof thisArg == 'undefined' && isArray(collection)) {
        var index = -1, length = collection.length;
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        basicEach(collection, callback, thisArg);
      }
      return collection;
    }
    function groupBy(collection, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg);
      forEach(collection, function (value, key, collection) {
        key = String(callback(value, key, collection));
        (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
      });
      return result;
    }
    function invoke(collection, methodName) {
      var args = nativeSlice.call(arguments, 2), index = -1, isFunc = typeof methodName == 'function', length = collection ? collection.length : 0, result = Array(typeof length == 'number' ? length : 0);
      forEach(collection, function (value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }
    function map(collection, callback, thisArg) {
      var index = -1, length = collection ? collection.length : 0, result = Array(typeof length == 'number' ? length : 0);
      callback = lodash.createCallback(callback, thisArg);
      if (isArray(collection)) {
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        basicEach(collection, function (value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }
    function max(collection, callback, thisArg) {
      var computed = -Infinity, result = computed;
      if (!callback && isArray(collection)) {
        var index = -1, length = collection.length;
        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = !callback && isString(collection) ? charAtCallback : lodash.createCallback(callback, thisArg);
        basicEach(collection, function (value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }
    function min(collection, callback, thisArg) {
      var computed = Infinity, result = computed;
      if (!callback && isArray(collection)) {
        var index = -1, length = collection.length;
        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = !callback && isString(collection) ? charAtCallback : lodash.createCallback(callback, thisArg);
        basicEach(collection, function (value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }
    var pluck = map;
    function reduce(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      if (isArray(collection)) {
        var index = -1, length = collection.length;
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        basicEach(collection, function (value, index, collection) {
          accumulator = noaccum ? (noaccum = false, value) : callback(accumulator, value, index, collection);
        });
      }
      return accumulator;
    }
    function reduceRight(collection, callback, accumulator, thisArg) {
      var iterable = collection, length = collection ? collection.length : 0, noaccum = arguments.length < 3;
      if (typeof length != 'number') {
        var props = keys(collection);
        length = props.length;
      } else if (support.unindexedChars && isString(collection)) {
        iterable = collection.split('');
      }
      callback = lodash.createCallback(callback, thisArg, 4);
      forEach(collection, function (value, index, collection) {
        index = props ? props[--length] : --length;
        accumulator = noaccum ? (noaccum = false, iterable[index]) : callback(accumulator, iterable[index], index, collection);
      });
      return accumulator;
    }
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg);
      return filter(collection, function (value, index, collection) {
        return !callback(value, index, collection);
      });
    }
    function shuffle(collection) {
      var index = -1, length = collection ? collection.length : 0, result = Array(typeof length == 'number' ? length : 0);
      forEach(collection, function (value) {
        var rand = floor(nativeRandom() * (++index + 1));
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg);
      if (isArray(collection)) {
        var index = -1, length = collection.length;
        while (++index < length) {
          if (result = callback(collection[index], index, collection)) {
            break;
          }
        }
      } else {
        basicEach(collection, function (value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }
    function sortBy(collection, callback, thisArg) {
      var index = -1, length = collection ? collection.length : 0, result = Array(typeof length == 'number' ? length : 0);
      callback = lodash.createCallback(callback, thisArg);
      forEach(collection, function (value, key, collection) {
        var object = result[++index] = getObject();
        object.criteria = callback(value, key, collection);
        object.index = index;
        object.value = value;
      });
      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        releaseObject(object);
      }
      return result;
    }
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return support.unindexedChars && isString(collection) ? collection.split('') : slice(collection);
      }
      return values(collection);
    }
    var where = filter;
    function compact(array) {
      var index = -1, length = array ? array.length : 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }
    function difference(array) {
      var index = -1, indexOf = getIndexOf(), length = array ? array.length : 0, seen = concat.apply(arrayRef, nativeSlice.call(arguments, 1)), result = [];
      var isLarge = length >= largeArraySize && indexOf === basicIndexOf;
      if (isLarge) {
        var cache = createCache(seen);
        if (cache) {
          indexOf = cacheIndexOf;
          seen = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(seen, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(seen);
      }
      return result;
    }
    function findIndex(array, callback, thisArg) {
      var index = -1, length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }
    function first(array, callback, thisArg) {
      if (array) {
        var n = 0, length = array.length;
        if (typeof callback != 'number' && callback != null) {
          var index = -1;
          callback = lodash.createCallback(callback, thisArg);
          while (++index < length && callback(array[index], index, array)) {
            n++;
          }
        } else {
          n = callback;
          if (n == null || thisArg) {
            return array[0];
          }
        }
        return slice(array, 0, nativeMin(nativeMax(0, n), length));
      }
    }
    var flatten = overloadWrapper(function flatten(array, isShallow, callback) {
        var index = -1, length = array ? array.length : 0, result = [];
        while (++index < length) {
          var value = array[index];
          if (callback) {
            value = callback(value, index, array);
          }
          if (isArray(value)) {
            push.apply(result, isShallow ? value : flatten(value));
          } else {
            result.push(value);
          }
        }
        return result;
      });
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0;
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return array ? basicIndexOf(array, value, fromIndex) : -1;
    }
    function initial(array, callback, thisArg) {
      if (!array) {
        return [];
      }
      var n = 0, length = array.length;
      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback == null || thisArg ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }
    function intersection(array) {
      var args = arguments, argsLength = args.length, argsIndex = -1, caches = getArray(), index = -1, indexOf = getIndexOf(), length = array ? array.length : 0, result = [], seen = getArray();
      while (++argsIndex < argsLength) {
        var value = args[argsIndex];
        caches[argsIndex] = indexOf === basicIndexOf && (value ? value.length : 0) >= largeArraySize && createCache(argsIndex ? args[argsIndex] : seen);
      }
      outer:
        while (++index < length) {
          var cache = caches[0];
          value = array[index];
          if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
            argsIndex = argsLength;
            (cache || seen).push(value);
            while (--argsIndex) {
              cache = caches[argsIndex];
              if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
                continue outer;
              }
            }
            result.push(value);
          }
        }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }
    function last(array, callback, thisArg) {
      if (array) {
        var n = 0, length = array.length;
        if (typeof callback != 'number' && callback != null) {
          var index = length;
          callback = lodash.createCallback(callback, thisArg);
          while (index-- && callback(array[index], index, array)) {
            n++;
          }
        } else {
          n = callback;
          if (n == null || thisArg) {
            return array[length - 1];
          }
        }
        return slice(array, nativeMax(0, length - n));
      }
    }
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }
    function range(start, end, step) {
      start = +start || 0;
      step = +step || 1;
      if (end == null) {
        end = start;
        start = 0;
      }
      var index = -1, length = nativeMax(0, ceil((end - start) / step)), result = Array(length);
      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0, index = -1, length = array ? array.length : 0;
        callback = lodash.createCallback(callback, thisArg);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback == null || thisArg ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0, high = array ? array.length : low;
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);
      while (low < high) {
        var mid = low + high >>> 1;
        callback(array[mid]) < value ? low = mid + 1 : high = mid;
      }
      return low;
    }
    function union(array) {
      if (!isArray(array)) {
        arguments[0] = array ? nativeSlice.call(array) : arrayRef;
      }
      return uniq(concat.apply(arrayRef, arguments));
    }
    var uniq = overloadWrapper(function (array, isSorted, callback) {
        var index = -1, indexOf = getIndexOf(), length = array ? array.length : 0, result = [];
        var isLarge = !isSorted && length >= largeArraySize && indexOf === basicIndexOf, seen = callback || isLarge ? getArray() : result;
        if (isLarge) {
          var cache = createCache(seen);
          if (cache) {
            indexOf = cacheIndexOf;
            seen = cache;
          } else {
            isLarge = false;
            seen = callback ? seen : (releaseArray(seen), result);
          }
        }
        while (++index < length) {
          var value = array[index], computed = callback ? callback(value, index, array) : value;
          if (isSorted ? !index || seen[seen.length - 1] !== computed : indexOf(seen, computed) < 0) {
            if (callback || isLarge) {
              seen.push(computed);
            }
            result.push(value);
          }
        }
        if (isLarge) {
          releaseArray(seen.array);
          releaseObject(seen);
        } else if (callback) {
          releaseArray(seen);
        }
        return result;
      });
    function unzip(array) {
      var index = -1, length = array ? max(pluck(array, 'length')) : 0, result = Array(length < 0 ? 0 : length);
      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }
    function without(array) {
      return difference(array, nativeSlice.call(arguments, 1));
    }
    function zip(array) {
      return array ? unzip(arguments) : [];
    }
    function zipObject(keys, values) {
      var index = -1, length = keys ? keys.length : 0, result = {};
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else {
          result[key[0]] = key[1];
        }
      }
      return result;
    }
    function after(n, func) {
      if (n < 1) {
        return func();
      }
      return function () {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }
    function bind(func, thisArg) {
      return support.fastBind || nativeBind && arguments.length > 2 ? nativeBind.call.apply(nativeBind, arguments) : createBound(func, thisArg, nativeSlice.call(arguments, 2));
    }
    function bindAll(object) {
      var funcs = arguments.length > 1 ? concat.apply(arrayRef, nativeSlice.call(arguments, 1)) : functions(object), index = -1, length = funcs.length;
      while (++index < length) {
        var key = funcs[index];
        object[key] = bind(object[key], object);
      }
      return object;
    }
    function bindKey(object, key) {
      return createBound(object, key, nativeSlice.call(arguments, 2), indicatorObject);
    }
    function compose() {
      var funcs = arguments;
      return function () {
        var args = arguments, length = funcs.length;
        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }
    function createCallback(func, thisArg, argCount) {
      if (func == null) {
        return identity;
      }
      var type = typeof func;
      if (type != 'function') {
        if (type != 'object') {
          return function (object) {
            return object[func];
          };
        }
        var props = keys(func);
        return function (object) {
          var length = props.length, result = false;
          while (length--) {
            if (!(result = isEqual(object[props[length]], func[props[length]], indicatorObject))) {
              break;
            }
          }
          return result;
        };
      }
      if (typeof thisArg == 'undefined' || reThis && !reThis.test(fnToString.call(func))) {
        return func;
      }
      if (argCount === 1) {
        return function (value) {
          return func.call(thisArg, value);
        };
      }
      if (argCount === 2) {
        return function (a, b) {
          return func.call(thisArg, a, b);
        };
      }
      if (argCount === 4) {
        return function (accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return function (value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
    }
    function debounce(func, wait, options) {
      var args, result, thisArg, callCount = 0, lastCalled = 0, maxWait = false, maxTimeoutId = null, timeoutId = null, trailing = true;
      function clear() {
        clearTimeout(maxTimeoutId);
        clearTimeout(timeoutId);
        callCount = 0;
        maxTimeoutId = timeoutId = null;
      }
      function delayed() {
        var isCalled = trailing && (!leading || callCount > 1);
        clear();
        if (isCalled) {
          if (maxWait !== false) {
            lastCalled = new Date();
          }
          result = func.apply(thisArg, args);
        }
      }
      function maxDelayed() {
        clear();
        if (trailing || maxWait !== wait) {
          lastCalled = new Date();
          result = func.apply(thisArg, args);
        }
      }
      wait = nativeMax(0, wait || 0);
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && nativeMax(wait, options.maxWait || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      return function () {
        args = arguments;
        thisArg = this;
        callCount++;
        clearTimeout(timeoutId);
        if (maxWait === false) {
          if (leading && callCount < 2) {
            result = func.apply(thisArg, args);
          }
        } else {
          var now = new Date();
          if (!maxTimeoutId && !leading) {
            lastCalled = now;
          }
          var remaining = maxWait - (now - lastCalled);
          if (remaining <= 0) {
            clearTimeout(maxTimeoutId);
            maxTimeoutId = null;
            lastCalled = now;
            result = func.apply(thisArg, args);
          } else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        return result;
      };
    }
    function defer(func) {
      var args = nativeSlice.call(arguments, 1);
      return setTimeout(function () {
        func.apply(undefined, args);
      }, 1);
    }
    if (isV8 && freeModule && typeof setImmediate == 'function') {
      defer = bind(setImmediate, context);
    }
    function delay(func, wait) {
      var args = nativeSlice.call(arguments, 2);
      return setTimeout(function () {
        func.apply(undefined, args);
      }, wait);
    }
    function memoize(func, resolver) {
      function memoized() {
        var cache = memoized.cache, key = keyPrefix + (resolver ? resolver.apply(this, arguments) : arguments[0]);
        return hasOwnProperty.call(cache, key) ? cache[key] : cache[key] = func.apply(this, arguments);
      }
      memoized.cache = {};
      return memoized;
    }
    function once(func) {
      var ran, result;
      return function () {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);
        func = null;
        return result;
      };
    }
    function partial(func) {
      return createBound(func, nativeSlice.call(arguments, 1));
    }
    function partialRight(func) {
      return createBound(func, nativeSlice.call(arguments, 1), null, indicatorObject);
    }
    function throttle(func, wait, options) {
      var leading = true, trailing = true;
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      options = getObject();
      options.leading = leading;
      options.maxWait = wait;
      options.trailing = trailing;
      var result = debounce(func, wait, options);
      releaseObject(options);
      return result;
    }
    function wrap(value, wrapper) {
      return function () {
        var args = [value];
        push.apply(args, arguments);
        return wrapper.apply(this, args);
      };
    }
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }
    function identity(value) {
      return value;
    }
    function mixin(object) {
      forEach(functions(object), function (methodName) {
        var func = lodash[methodName] = object[methodName];
        lodash.prototype[methodName] = function () {
          var value = this.__wrapped__, args = [value];
          push.apply(args, arguments);
          var result = func.apply(lodash, args);
          return value && typeof value == 'object' && value === result ? this : new lodashWrapper(result);
        };
      });
    }
    function noConflict() {
      context._ = oldDash;
      return this;
    }
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function (value, radix) {
        return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
      };
    function random(min, max) {
      if (min == null && max == null) {
        max = 1;
      }
      min = +min || 0;
      if (max == null) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      var rand = nativeRandom();
      return min % 1 || max % 1 ? min + nativeMin(rand * (max - min + parseFloat('1e-' + ((rand + '').length - 1))), max) : min + floor(rand * (max - min + 1));
    }
    function result(object, property) {
      var value = object ? object[property] : undefined;
      return isFunction(value) ? object[property]() : value;
    }
    function template(text, data, options) {
      var settings = lodash.templateSettings;
      text || (text = '');
      options = iteratorTemplate ? defaults({}, options, settings) : settings;
      var imports = iteratorTemplate && defaults({}, options.imports, settings.imports), importsKeys = iteratorTemplate ? keys(imports) : ['_'], importsValues = iteratorTemplate ? values(imports) : [lodash];
      var isEvaluating, index = 0, interpolate = options.interpolate || reNoMatch, source = '__p += \'';
      var reDelimiters = RegExp((options.escape || reNoMatch).source + '|' + interpolate.source + '|' + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' + (options.evaluate || reNoMatch).source + '|$', 'g');
      text.replace(reDelimiters, function (match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);
        if (escapeValue) {
          source += '\' +\n__e(' + escapeValue + ') +\n\'';
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += '\';\n' + evaluateValue + ';\n__p += \'';
        }
        if (interpolateValue) {
          source += '\' +\n((__t = (' + interpolateValue + ')) == null ? \'\' : __t) +\n\'';
        }
        index = offset + match.length;
        return match;
      });
      source += '\';\n';
      var variable = options.variable, hasVariable = variable;
      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source).replace(reEmptyStringMiddle, '$1').replace(reEmptyStringTrailing, '$1;');
      source = 'function(' + variable + ') {\n' + (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') + 'var __t, __p = \'\', __e = _.escape' + (isEvaluating ? ', __j = Array.prototype.join;\n' + 'function print() { __p += __j.call(arguments, \'\') }\n' : ';\n') + source + 'return __p\n}';
      var sourceURL = '\n/*\n//@ sourceURL=' + (options.sourceURL || '/lodash/template/source[' + templateCounter++ + ']') + '\n*/';
      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch (e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      result.source = source;
      return result;
    }
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1, result = Array(n);
      callback = lodash.createCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }
    function wrapperToString() {
      return String(this.__wrapped__);
    }
    function wrapperValueOf() {
      return this.__wrapped__;
    }
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.countBy = countBy;
    lodash.createCallback = createCallback;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forIn = forIn;
    lodash.forOwn = forOwn;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.range = range;
    lodash.reject = reject;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.unzip = unzip;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.zip = zip;
    lodash.zipObject = zipObject;
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    mixin(lodash);
    lodash.chain = lodash;
    lodash.prototype.chain = function () {
      return this;
    };
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;
    forOwn(lodash, function (func, methodName) {
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName] = function () {
          var args = [this.__wrapped__];
          push.apply(args, arguments);
          return func.apply(lodash, args);
        };
      }
    });
    lodash.first = first;
    lodash.last = last;
    lodash.take = first;
    lodash.head = first;
    forOwn(lodash, function (func, methodName) {
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName] = function (callback, thisArg) {
          var result = func(this.__wrapped__, callback, thisArg);
          return callback == null || thisArg && typeof callback != 'function' ? result : new lodashWrapper(result);
        };
      }
    });
    lodash.VERSION = '1.3.1';
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;
    basicEach([
      'join',
      'pop',
      'shift'
    ], function (methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function () {
        return func.apply(this.__wrapped__, arguments);
      };
    });
    basicEach([
      'push',
      'reverse',
      'sort',
      'unshift'
    ], function (methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function () {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });
    basicEach([
      'concat',
      'slice',
      'splice'
    ], function (methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function () {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments));
      };
    });
    if (!support.spliceObjects) {
      basicEach([
        'pop',
        'shift',
        'splice'
      ], function (methodName) {
        var func = arrayRef[methodName], isSplice = methodName == 'splice';
        lodash.prototype[methodName] = function () {
          var value = this.__wrapped__, result = func.apply(value, arguments);
          if (value.length === 0) {
            delete value[0];
          }
          return isSplice ? new lodashWrapper(result) : result;
        };
      });
    }
    lodash._basicEach = basicEach;
    lodash._iteratorTemplate = iteratorTemplate;
    lodash._shimKeys = shimKeys;
    return lodash;
  }
  var _ = runInContext();
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    window._ = _;
    define(function () {
      return _;
    });
  } else if (freeExports && !freeExports.nodeType) {
    if (freeModule) {
      (freeModule.exports = _)._ = _;
    } else {
      freeExports._ = _;
    }
  } else {
    window._ = _;
  }
}(this));
(function () {
  var module = angular.module('restangular', []);
  module.provider('Restangular', function () {
    var Configurer = {};
    Configurer.init = function (object, config) {
      var safeMethods = [
          'get',
          'head',
          'options',
          'trace'
        ];
      config.isSafe = function (operation) {
        return _.contains(safeMethods, operation.toLowerCase());
      };
      var absolutePattern = /^https?:\/\//i;
      config.isAbsoluteUrl = function (string) {
        return string && absolutePattern.test(string);
      };
      config.baseUrl = _.isUndefined(config.baseUrl) ? '' : config.baseUrl;
      object.setBaseUrl = function (newBaseUrl) {
        config.baseUrl = /\/$/.test(newBaseUrl) ? newBaseUrl.substring(0, newBaseUrl.length - 1) : newBaseUrl;
        return this;
      };
      config.extraFields = config.extraFields || [];
      object.setExtraFields = function (newExtraFields) {
        config.extraFields = newExtraFields;
        return this;
      };
      config.defaultHttpFields = config.defaultHttpFields || {};
      object.setDefaultHttpFields = function (values) {
        config.defaultHttpFields = values;
        return this;
      };
      config.withHttpDefaults = function (obj) {
        return _.defaults(obj, config.defaultHttpFields);
      };
      config.encodeIds = _.isUndefined(config.encodeIds) ? true : config.encodeIds;
      object.setEncodeIds = function (encode) {
        config.encodeIds = encode;
      };
      config.defaultRequestParams = config.defaultRequestParams || {
        get: {},
        post: {},
        put: {},
        remove: {},
        common: {}
      };
      object.setDefaultRequestParams = function (param1, param2) {
        var methods = [], params = param2 || param1;
        if (!_.isUndefined(param2)) {
          if (_.isArray(param1)) {
            methods = param1;
          } else {
            methods.push(param1);
          }
        } else {
          methods.push('common');
        }
        _.each(methods, function (method) {
          config.defaultRequestParams[method] = params;
        });
        return this;
      };
      object.requestParams = config.defaultRequestParams;
      config.defaultHeaders = config.defaultHeaders || {};
      object.setDefaultHeaders = function (headers) {
        config.defaultHeaders = headers;
        object.defaultHeaders = config.defaultHeaders;
        return this;
      };
      object.defaultHeaders = config.defaultHeaders;
      config.methodOverriders = config.methodOverriders || [];
      object.setMethodOverriders = function (values) {
        var overriders = _.extend([], values);
        if (config.isOverridenMethod('delete', overriders)) {
          overriders.push('remove');
        }
        config.methodOverriders = overriders;
        return this;
      };
      config.isOverridenMethod = function (method, values) {
        var search = values || config.methodOverriders;
        return !_.isUndefined(_.find(search, function (one) {
          return one.toLowerCase() === method.toLowerCase();
        }));
      };
      config.urlCreator = config.urlCreator || 'path';
      object.setUrlCreator = function (name) {
        if (!_.has(config.urlCreatorFactory, name)) {
          throw new Error('URL Path selected isn\'t valid');
        }
        config.urlCreator = name;
        return this;
      };
      config.restangularFields = config.restangularFields || {
        id: 'id',
        route: 'route',
        parentResource: 'parentResource',
        restangularCollection: 'restangularCollection',
        cannonicalId: '__cannonicalId',
        etag: 'restangularEtag',
        selfLink: 'href',
        get: 'get',
        getList: 'getList',
        put: 'put',
        post: 'post',
        remove: 'remove',
        head: 'head',
        trace: 'trace',
        options: 'options',
        patch: 'patch',
        getRestangularUrl: 'getRestangularUrl',
        putElement: 'putElement',
        addRestangularMethod: 'addRestangularMethod',
        getParentList: 'getParentList',
        clone: 'clone',
        ids: 'ids'
      };
      object.setRestangularFields = function (resFields) {
        config.restangularFields = _.extend(config.restangularFields, resFields);
        return this;
      };
      config.setFieldToElem = function (field, elem, value) {
        var properties = field.split('.');
        var idValue = elem;
        _.each(_.initial(properties), function (prop) {
          idValue[prop] = {};
          idValue = idValue[prop];
        });
        idValue[_.last(properties)] = value;
        return this;
      };
      config.getFieldFromElem = function (field, elem) {
        var properties = field.split('.');
        var idValue = angular.copy(elem);
        _.each(properties, function (prop) {
          if (idValue) {
            idValue = idValue[prop];
          }
        });
        return idValue;
      };
      config.setIdToElem = function (elem, id) {
        config.setFieldToElem(config.restangularFields.id, elem, id);
        return this;
      };
      config.getIdFromElem = function (elem) {
        return config.getFieldFromElem(config.restangularFields.id, elem);
      };
      config.isValidId = function (elemId) {
        return '' !== elemId && !_.isUndefined(elemId) && !_.isNull(elemId);
      };
      config.setUrlToElem = function (elem, url) {
        config.setFieldToElem(config.restangularFields.selfLink, elem, url);
        return this;
      };
      config.getUrlFromElem = function (elem) {
        return config.getFieldFromElem(config.restangularFields.selfLink, elem);
      };
      config.useCannonicalId = _.isUndefined(config.useCannonicalId) ? false : config.useCannonicalId;
      object.setUseCannonicalId = function (value) {
        config.useCannonicalId = value;
        return this;
      };
      config.getCannonicalIdFromElem = function (elem) {
        var cannonicalId = elem[config.restangularFields.cannonicalId];
        var actualId = config.isValidId(cannonicalId) ? cannonicalId : config.getIdFromElem(elem);
        return actualId;
      };
      config.responseExtractor = config.responseExtractor || function (data, operation, what, url, response, deferred) {
        return data;
      };
      object.setResponseExtractor = function (extractor) {
        config.responseExtractor = extractor;
        return this;
      };
      object.setResponseInterceptor = object.setResponseExtractor;
      config.fullRequestInterceptor = config.fullRequestInterceptor || function (element, operation, path, url, headers, params) {
        return {
          element: element,
          headers: headers,
          params: params
        };
      };
      object.setRequestInterceptor = function (interceptor) {
        config.fullRequestInterceptor = function (elem, operation, path, url, headers, params) {
          return {
            headers: headers,
            params: params,
            element: interceptor(elem, operation, path, url)
          };
        };
        return this;
      };
      object.setFullRequestInterceptor = function (interceptor) {
        config.fullRequestInterceptor = interceptor;
        return this;
      };
      config.errorInterceptor = config.errorInterceptor || function () {
      };
      object.setErrorInterceptor = function (interceptor) {
        config.errorInterceptor = interceptor;
        return this;
      };
      config.onBeforeElemRestangularized = config.onBeforeElemRestangularized || function (elem) {
        return elem;
      };
      object.setOnBeforeElemRestangularized = function (post) {
        config.onBeforeElemRestangularized = post;
        return this;
      };
      config.onElemRestangularized = config.onElemRestangularized || function (elem) {
        return elem;
      };
      object.setOnElemRestangularized = function (post) {
        config.onElemRestangularized = post;
        return this;
      };
      object.setListTypeIsArray = function (val) {
      };
      config.shouldSaveParent = config.shouldSaveParent || function () {
        return true;
      };
      object.setParentless = function (values) {
        if (_.isArray(values)) {
          config.shouldSaveParent = function (route) {
            return !_.contains(values, route);
          };
        } else if (_.isBoolean(values)) {
          config.shouldSaveParent = function () {
            return !values;
          };
        }
        return this;
      };
      config.suffix = _.isUndefined(config.suffix) ? null : config.suffix;
      object.setRequestSuffix = function (newSuffix) {
        config.suffix = newSuffix;
        return this;
      };
      config.transformers = config.transformers || {};
      object.addElementTransformer = function (type, secondArg, thirdArg) {
        var isCollection = null;
        var transformer = null;
        if (arguments.length === 2) {
          transformer = secondArg;
        } else {
          transformer = thirdArg;
          isCollection = secondArg;
        }
        var typeTransformers = config.transformers[type];
        if (!typeTransformers) {
          typeTransformers = config.transformers[type] = [];
        }
        typeTransformers.push(function (coll, elem) {
          if (_.isNull(isCollection) || coll == isCollection) {
            return transformer(elem);
          }
          return elem;
        });
      };
      object.extendCollection = function (route, fn) {
        return object.addElementTransformer(route, true, fn);
      };
      object.extendModel = function (route, fn) {
        return object.addElementTransformer(route, false, fn);
      };
      config.transformElem = function (elem, isCollection, route, Restangular) {
        var typeTransformers = config.transformers[route];
        var changedElem = elem;
        if (typeTransformers) {
          _.each(typeTransformers, function (transformer) {
            changedElem = transformer(isCollection, changedElem);
          });
        }
        return config.onElemRestangularized(changedElem, isCollection, route, Restangular);
      };
      config.fullResponse = _.isUndefined(config.fullResponse) ? false : config.fullResponse;
      object.setFullResponse = function (full) {
        config.fullResponse = full;
        return this;
      };
      config.urlCreatorFactory = {};
      var BaseCreator = function () {
      };
      BaseCreator.prototype.setConfig = function (config) {
        this.config = config;
        return this;
      };
      BaseCreator.prototype.parentsArray = function (current) {
        var parents = [];
        while (current) {
          parents.push(current);
          current = current[this.config.restangularFields.parentResource];
        }
        return parents.reverse();
      };
      function RestangularResource(config, $http, url, configurer) {
        var resource = {};
        _.each(_.keys(configurer), function (key) {
          var value = configurer[key];
          value.params = _.extend({}, value.params, config.defaultRequestParams[value.method.toLowerCase()]);
          if (_.isEmpty(value.params)) {
            delete value.params;
          }
          if (config.isSafe(value.method)) {
            resource[key] = function () {
              return $http(_.extend(value, { url: url }));
            };
          } else {
            resource[key] = function (data) {
              return $http(_.extend(value, {
                url: url,
                data: data
              }));
            };
          }
        });
        return resource;
      }
      BaseCreator.prototype.resource = function (current, $http, callHeaders, callParams, what, etag, operation) {
        var params = _.defaults(callParams || {}, this.config.defaultRequestParams.common);
        var headers = _.defaults(callHeaders || {}, this.config.defaultHeaders);
        if (etag) {
          if (!config.isSafe(operation)) {
            headers['If-Match'] = etag;
          } else {
            headers['If-None-Match'] = etag;
          }
        }
        var url = this.base(current);
        url += what ? '/' + what : '';
        url += this.config.suffix || '';
        return RestangularResource(this.config, $http, url, {
          getList: this.config.withHttpDefaults({
            method: 'GET',
            params: params,
            headers: headers
          }),
          get: this.config.withHttpDefaults({
            method: 'GET',
            params: params,
            headers: headers
          }),
          put: this.config.withHttpDefaults({
            method: 'PUT',
            params: params,
            headers: headers
          }),
          post: this.config.withHttpDefaults({
            method: 'POST',
            params: params,
            headers: headers
          }),
          remove: this.config.withHttpDefaults({
            method: 'DELETE',
            params: params,
            headers: headers
          }),
          head: this.config.withHttpDefaults({
            method: 'HEAD',
            params: params,
            headers: headers
          }),
          trace: this.config.withHttpDefaults({
            method: 'TRACE',
            params: params,
            headers: headers
          }),
          options: this.config.withHttpDefaults({
            method: 'OPTIONS',
            params: params,
            headers: headers
          }),
          patch: this.config.withHttpDefaults({
            method: 'PATCH',
            params: params,
            headers: headers
          })
        });
      };
      var Path = function () {
      };
      Path.prototype = new BaseCreator();
      Path.prototype.base = function (current) {
        var __this = this;
        return _.reduce(this.parentsArray(current), function (acum, elem) {
          var elemUrl;
          var elemSelfLink = __this.config.getUrlFromElem(elem);
          if (elemSelfLink) {
            if (__this.config.isAbsoluteUrl(elemSelfLink)) {
              return elemSelfLink;
            } else {
              elemUrl = elemSelfLink;
            }
          } else {
            elemUrl = elem[__this.config.restangularFields.route];
            if (elem[__this.config.restangularFields.restangularCollection]) {
              var ids = elem[__this.config.restangularFields.ids];
              if (ids) {
                elemUrl += '/' + ids.join(',');
              }
            } else {
              var elemId;
              if (__this.config.useCannonicalId) {
                elemId = __this.config.getCannonicalIdFromElem(elem);
              } else {
                elemId = __this.config.getIdFromElem(elem);
              }
              if (config.isValidId(elemId)) {
                elemUrl += '/' + (__this.config.encodeIds ? encodeURIComponent(elemId) : elemId);
              }
            }
          }
          return acum + '/' + elemUrl;
        }, this.config.baseUrl);
      };
      Path.prototype.fetchUrl = function (current, what) {
        var baseUrl = this.base(current);
        if (what) {
          baseUrl += '/' + what;
        }
        return baseUrl;
      };
      config.urlCreatorFactory.path = Path;
    };
    var globalConfiguration = {};
    Configurer.init(this, globalConfiguration);
    this.$get = [
      '$http',
      '$q',
      function ($http, $q) {
        function createServiceForConfiguration(config) {
          var service = {};
          var urlHandler = new config.urlCreatorFactory[config.urlCreator]();
          urlHandler.setConfig(config);
          function restangularizeBase(parent, elem, route) {
            elem[config.restangularFields.route] = route;
            elem[config.restangularFields.getRestangularUrl] = _.bind(urlHandler.fetchUrl, urlHandler, elem);
            elem[config.restangularFields.addRestangularMethod] = _.bind(addRestangularMethodFunction, elem);
            elem[config.restangularFields.clone] = _.bind(copyRestangularizedElement, elem, elem);
            elem.one = _.bind(one, elem, elem);
            elem.all = _.bind(all, elem, elem);
            elem.several = _.bind(several, elem, elem);
            elem.oneUrl = _.bind(oneUrl, elem, elem);
            elem.allUrl = _.bind(allUrl, elem, elem);
            if (parent && config.shouldSaveParent(route)) {
              var parentId = config.getIdFromElem(parent);
              var parentUrl = config.getUrlFromElem(parent);
              var restangularFieldsForParent = _.union(_.values(_.pick(config.restangularFields, [
                  'route',
                  'parentResource'
                ])), config.extraFields);
              var parentResource = _.pick(parent, restangularFieldsForParent);
              if (config.isValidId(parentId)) {
                config.setIdToElem(parentResource, parentId);
              }
              if (config.isValidId(parentUrl)) {
                config.setUrlToElem(parentResource, parentUrl);
              }
              elem[config.restangularFields.parentResource] = parentResource;
            } else {
              elem[config.restangularFields.parentResource] = null;
            }
            return elem;
          }
          function one(parent, route, id) {
            var elem = {};
            config.setIdToElem(elem, id);
            return restangularizeElem(parent, elem, route);
          }
          function all(parent, route) {
            return restangularizeCollection(parent, [], route, true);
          }
          function several(parent, route, ids) {
            var collection = [];
            collection[config.restangularFields.ids] = Array.prototype.splice.call(arguments, 2);
            return restangularizeCollection(parent, collection, route, true);
          }
          function oneUrl(parent, route, url) {
            var elem = {};
            config.setUrlToElem(elem, url);
            return restangularizeElem(parent, elem, route);
          }
          function allUrl(parent, route, url) {
            var elem = {};
            config.setUrlToElem(elem, url);
            return restangularizeCollection(parent, elem, route, true);
          }
          function restangularizePromise(promise, isCollection) {
            promise.call = _.bind(promiseCall, promise);
            promise.get = _.bind(promiseGet, promise);
            promise[config.restangularFields.restangularCollection] = isCollection;
            if (isCollection) {
              promise.push = _.bind(promiseCall, promise, 'push');
            }
            return promise;
          }
          function promiseCall(method) {
            var deferred = $q.defer();
            var callArgs = arguments;
            this.then(function (val) {
              var params = Array.prototype.slice.call(callArgs, 1);
              var func = val[method];
              func.apply(val, params);
              deferred.resolve(val);
            });
            return restangularizePromise(deferred.promise, this[config.restangularFields.restangularCollection]);
          }
          function promiseGet(what) {
            var deferred = $q.defer();
            this.then(function (val) {
              deferred.resolve(val[what]);
            });
            return restangularizePromise(deferred.promise, this[config.restangularFields.restangularCollection]);
          }
          function resolvePromise(deferred, response, data) {
            if (config.fullResponse) {
              return deferred.resolve(_.extend(response, { data: data }));
            } else {
              deferred.resolve(data);
            }
          }
          function stripRestangular(elem) {
            return _.omit(elem, _.values(_.omit(config.restangularFields, 'id')));
          }
          function addCustomOperation(elem) {
            elem.customOperation = _.bind(customFunction, elem);
            _.each([
              'put',
              'post',
              'get',
              'delete'
            ], function (oper) {
              _.each([
                'do',
                'custom'
              ], function (alias) {
                var callOperation = oper === 'delete' ? 'remove' : oper;
                var name = alias + oper.toUpperCase();
                var callFunction;
                if (callOperation !== 'put' && callOperation !== 'post') {
                  callFunction = customFunction;
                } else {
                  callFunction = function (operation, elem, path, params, headers) {
                    return _.bind(customFunction, this)(operation, path, params, headers, elem);
                  };
                }
                elem[name] = _.bind(callFunction, elem, callOperation);
              });
            });
            elem.customGETLIST = _.bind(fetchFunction, elem);
            elem.doGETLIST = elem.customGETLIST;
          }
          function copyRestangularizedElement(fromElement) {
            var copiedElement = angular.copy(fromElement);
            return restangularizeElem(copiedElement[config.restangularFields.parentResource], copiedElement, copiedElement[config.restangularFields.route]);
          }
          function restangularizeElem(parent, element, route, collection) {
            var elem = config.onBeforeElemRestangularized(element, false, route);
            var localElem = restangularizeBase(parent, elem, route);
            if (config.useCannonicalId) {
              localElem[config.restangularFields.cannonicalId] = config.getIdFromElem(localElem);
            }
            if (collection) {
              localElem[config.restangularFields.getParentList] = function () {
                return collection;
              };
            }
            localElem[config.restangularFields.restangularCollection] = false;
            localElem[config.restangularFields.get] = _.bind(getFunction, localElem);
            localElem[config.restangularFields.getList] = _.bind(fetchFunction, localElem);
            localElem[config.restangularFields.put] = _.bind(putFunction, localElem);
            localElem[config.restangularFields.post] = _.bind(postFunction, localElem);
            localElem[config.restangularFields.remove] = _.bind(deleteFunction, localElem);
            localElem[config.restangularFields.head] = _.bind(headFunction, localElem);
            localElem[config.restangularFields.trace] = _.bind(traceFunction, localElem);
            localElem[config.restangularFields.options] = _.bind(optionsFunction, localElem);
            localElem[config.restangularFields.patch] = _.bind(patchFunction, localElem);
            addCustomOperation(localElem);
            return config.transformElem(localElem, false, route, service);
          }
          function restangularizeCollection(parent, element, route) {
            var elem = config.onBeforeElemRestangularized(element, true, route);
            var localElem = restangularizeBase(parent, elem, route);
            localElem[config.restangularFields.restangularCollection] = true;
            localElem[config.restangularFields.post] = _.bind(postFunction, localElem, null);
            localElem[config.restangularFields.head] = _.bind(headFunction, localElem);
            localElem[config.restangularFields.trace] = _.bind(traceFunction, localElem);
            localElem[config.restangularFields.putElement] = _.bind(putElementFunction, localElem);
            localElem[config.restangularFields.options] = _.bind(optionsFunction, localElem);
            localElem[config.restangularFields.patch] = _.bind(patchFunction, localElem);
            localElem[config.restangularFields.get] = _.bind(getById, localElem);
            localElem[config.restangularFields.getList] = _.bind(fetchFunction, localElem, null);
            addCustomOperation(localElem);
            return config.transformElem(localElem, true, route, service);
          }
          function getById(id, reqParams, headers) {
            return this.customGET(id.toString(), reqParams, headers);
          }
          function putElementFunction(idx, params, headers) {
            var __this = this;
            var elemToPut = this[idx];
            var deferred = $q.defer();
            elemToPut.put(params, headers).then(function (serverElem) {
              var newArray = copyRestangularizedElement(__this);
              newArray[idx] = serverElem;
              deferred.resolve(newArray);
            }, function (response) {
              deferred.reject(response);
            });
            return restangularizePromise(deferred.promise, true);
          }
          function parseResponse(resData, operation, route, fetchUrl, response, deferred) {
            var data = config.responseExtractor(resData, operation, route, fetchUrl, response, deferred);
            var etag = response.headers('ETag');
            if (data && etag) {
              data[config.restangularFields.etag] = etag;
            }
            return data;
          }
          function fetchFunction(what, reqParams, headers) {
            var __this = this;
            var deferred = $q.defer();
            var operation = 'getList';
            var url = urlHandler.fetchUrl(this, what);
            var whatFetched = what || __this[config.restangularFields.route];
            var request = config.fullRequestInterceptor(null, operation, whatFetched, url, headers || {}, reqParams || {});
            urlHandler.resource(this, $http, request.headers, request.params, what, this[config.restangularFields.etag], operation).getList().then(function (response) {
              var resData = response.data;
              var data = parseResponse(resData, operation, whatFetched, url, response, deferred);
              var processedData = _.map(data, function (elem) {
                  if (!__this[config.restangularFields.restangularCollection]) {
                    return restangularizeElem(__this, elem, what, data);
                  } else {
                    return restangularizeElem(__this[config.restangularFields.parentResource], elem, __this[config.restangularFields.route], data);
                  }
                });
              processedData = _.extend(data, processedData);
              if (!__this[config.restangularFields.restangularCollection]) {
                resolvePromise(deferred, response, restangularizeCollection(__this, processedData, what));
              } else {
                resolvePromise(deferred, response, restangularizeCollection(null, processedData, __this[config.restangularFields.route]));
              }
            }, function error(response) {
              if (config.errorInterceptor(response) !== false) {
                deferred.reject(response);
              }
            });
            return restangularizePromise(deferred.promise, true);
          }
          function elemFunction(operation, what, params, obj, headers) {
            var __this = this;
            var deferred = $q.defer();
            var resParams = params || {};
            var route = what || this[config.restangularFields.route];
            var fetchUrl = urlHandler.fetchUrl(this, what);
            var callObj = obj || this;
            var etag = callObj[config.restangularFields.etag];
            if (_.isObject(callObj)) {
              callObj = stripRestangular(callObj);
            }
            var request = config.fullRequestInterceptor(callObj, operation, route, fetchUrl, headers || {}, resParams || {});
            var okCallback = function (response) {
              var resData = response.data;
              var elem = parseResponse(resData, operation, route, fetchUrl, response, deferred);
              if (elem) {
                if (operation === 'post' && !__this[config.restangularFields.restangularCollection]) {
                  resolvePromise(deferred, response, restangularizeElem(__this, elem, what));
                } else {
                  resolvePromise(deferred, response, restangularizeElem(__this[config.restangularFields.parentResource], elem, __this[config.restangularFields.route]));
                }
              } else {
                resolvePromise(deferred, response, undefined);
              }
            };
            var errorCallback = function (response) {
              if (config.errorInterceptor(response) !== false) {
                deferred.reject(response);
              }
            };
            var callOperation = operation;
            var callHeaders = _.extend({}, request.headers);
            var isOverrideOperation = config.isOverridenMethod(operation);
            if (isOverrideOperation) {
              callOperation = 'post';
              callHeaders = _.extend(callHeaders, { 'X-HTTP-Method-Override': operation === 'remove' ? 'DELETE' : operation });
            }
            if (config.isSafe(operation)) {
              if (isOverrideOperation) {
                urlHandler.resource(this, $http, callHeaders, request.params, what, etag, callOperation)[callOperation]({}).then(okCallback, errorCallback);
              } else {
                urlHandler.resource(this, $http, callHeaders, request.params, what, etag, callOperation)[callOperation]().then(okCallback, errorCallback);
              }
            } else {
              urlHandler.resource(this, $http, callHeaders, request.params, what, etag, callOperation)[callOperation](request.element).then(okCallback, errorCallback);
            }
            return restangularizePromise(deferred.promise);
          }
          function getFunction(params, headers) {
            return _.bind(elemFunction, this)('get', undefined, params, undefined, headers);
          }
          function deleteFunction(params, headers) {
            return _.bind(elemFunction, this)('remove', undefined, params, undefined, headers);
          }
          function putFunction(params, headers) {
            return _.bind(elemFunction, this)('put', undefined, params, undefined, headers);
          }
          function postFunction(what, elem, params, headers) {
            return _.bind(elemFunction, this)('post', what, params, elem, headers);
          }
          function headFunction(params, headers) {
            return _.bind(elemFunction, this)('head', undefined, params, undefined, headers);
          }
          function traceFunction(params, headers) {
            return _.bind(elemFunction, this)('trace', undefined, params, undefined, headers);
          }
          function optionsFunction(params, headers) {
            return _.bind(elemFunction, this)('options', undefined, params, undefined, headers);
          }
          function patchFunction(elem, params, headers) {
            return _.bind(elemFunction, this)('patch', undefined, params, elem, headers);
          }
          function customFunction(operation, path, params, headers, elem) {
            return _.bind(elemFunction, this)(operation, path, params, elem, headers);
          }
          function addRestangularMethodFunction(name, operation, path, defaultParams, defaultHeaders, defaultElem) {
            var bindedFunction;
            if (operation === 'getList') {
              bindedFunction = _.bind(fetchFunction, this, path);
            } else {
              bindedFunction = _.bind(customFunction, this, operation, path);
            }
            var createdFunction = function (params, headers, elem) {
              var callParams = _.defaults({
                  params: params,
                  headers: headers,
                  elem: elem
                }, {
                  params: defaultParams,
                  headers: defaultHeaders,
                  elem: defaultElem
                });
              return bindedFunction(callParams.params, callParams.headers, callParams.elem);
            };
            if (config.isSafe(operation)) {
              this[name] = createdFunction;
            } else {
              this[name] = function (elem, params, headers) {
                return createdFunction(params, headers, elem);
              };
            }
          }
          function withConfigurationFunction(configurer) {
            var newConfig = angular.copy(globalConfiguration);
            Configurer.init(newConfig, newConfig);
            configurer(newConfig);
            return createServiceForConfiguration(newConfig);
          }
          Configurer.init(service, config);
          service.copy = _.bind(copyRestangularizedElement, service);
          service.withConfig = _.bind(withConfigurationFunction, service);
          service.one = _.bind(one, service, null);
          service.all = _.bind(all, service, null);
          service.several = _.bind(several, service, null);
          service.oneUrl = _.bind(oneUrl, service, null);
          service.allUrl = _.bind(allUrl, service, null);
          service.restangularizeElement = _.bind(restangularizeElem, service);
          service.restangularizeCollection = _.bind(restangularizeCollection, service);
          return service;
        }
        return createServiceForConfiguration(globalConfiguration);
      }
    ];
  });
}());
angular.module('ui.bootstrap', [
  'ui.bootstrap.transition',
  'ui.bootstrap.collapse',
  'ui.bootstrap.accordion',
  'ui.bootstrap.alert',
  'ui.bootstrap.bindHtml',
  'ui.bootstrap.buttons',
  'ui.bootstrap.carousel',
  'ui.bootstrap.position',
  'ui.bootstrap.datepicker',
  'ui.bootstrap.dropdownToggle',
  'ui.bootstrap.modal',
  'ui.bootstrap.pagination',
  'ui.bootstrap.tooltip',
  'ui.bootstrap.popover',
  'ui.bootstrap.progressbar',
  'ui.bootstrap.rating',
  'ui.bootstrap.tabs',
  'ui.bootstrap.timepicker',
  'ui.bootstrap.typeahead'
]);
angular.module('ui.bootstrap.transition', []).factory('$transition', [
  '$q',
  '$timeout',
  '$rootScope',
  function ($q, $timeout, $rootScope) {
    var $transition = function (element, trigger, options) {
      options = options || {};
      var deferred = $q.defer();
      var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];
      var transitionEndHandler = function (event) {
        $rootScope.$apply(function () {
          element.unbind(endEventName, transitionEndHandler);
          deferred.resolve(element);
        });
      };
      if (endEventName) {
        element.bind(endEventName, transitionEndHandler);
      }
      $timeout(function () {
        if (angular.isString(trigger)) {
          element.addClass(trigger);
        } else if (angular.isFunction(trigger)) {
          trigger(element);
        } else if (angular.isObject(trigger)) {
          element.css(trigger);
        }
        if (!endEventName) {
          deferred.resolve(element);
        }
      });
      deferred.promise.cancel = function () {
        if (endEventName) {
          element.unbind(endEventName, transitionEndHandler);
        }
        deferred.reject('Transition cancelled');
      };
      return deferred.promise;
    };
    var transElement = document.createElement('trans');
    var transitionEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'transition': 'transitionend'
      };
    var animationEndEventNames = {
        'WebkitTransition': 'webkitAnimationEnd',
        'MozTransition': 'animationend',
        'OTransition': 'oAnimationEnd',
        'transition': 'animationend'
      };
    function findEndEventName(endEventNames) {
      for (var name in endEventNames) {
        if (transElement.style[name] !== undefined) {
          return endEventNames[name];
        }
      }
    }
    $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
    $transition.animationEndEventName = findEndEventName(animationEndEventNames);
    return $transition;
  }
]);
angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition']).directive('collapse', [
  '$transition',
  function ($transition) {
    var fixUpHeight = function (scope, element, height) {
      element.removeClass('collapse');
      element.css({ height: height });
      var x = element[0].offsetWidth;
      element.addClass('collapse');
    };
    return {
      link: function (scope, element, attrs) {
        var isCollapsed;
        var initialAnimSkip = true;
        scope.$watch(function () {
          return element[0].scrollHeight;
        }, function (value) {
          if (element[0].scrollHeight !== 0) {
            if (!isCollapsed) {
              if (initialAnimSkip) {
                fixUpHeight(scope, element, element[0].scrollHeight + 'px');
              } else {
                fixUpHeight(scope, element, 'auto');
              }
            }
          }
        });
        scope.$watch(attrs.collapse, function (value) {
          if (value) {
            collapse();
          } else {
            expand();
          }
        });
        var currentTransition;
        var doTransition = function (change) {
          if (currentTransition) {
            currentTransition.cancel();
          }
          currentTransition = $transition(element, change);
          currentTransition.then(function () {
            currentTransition = undefined;
          }, function () {
            currentTransition = undefined;
          });
          return currentTransition;
        };
        var expand = function () {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            if (!isCollapsed) {
              fixUpHeight(scope, element, 'auto');
            }
          } else {
            doTransition({ height: element[0].scrollHeight + 'px' }).then(function () {
              if (!isCollapsed) {
                fixUpHeight(scope, element, 'auto');
              }
            });
          }
          isCollapsed = false;
        };
        var collapse = function () {
          isCollapsed = true;
          if (initialAnimSkip) {
            initialAnimSkip = false;
            fixUpHeight(scope, element, 0);
          } else {
            fixUpHeight(scope, element, element[0].scrollHeight + 'px');
            doTransition({ 'height': '0' });
          }
        };
      }
    };
  }
]);
angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse']).constant('accordionConfig', { closeOthers: true }).controller('AccordionController', [
  '$scope',
  '$attrs',
  'accordionConfig',
  function ($scope, $attrs, accordionConfig) {
    this.groups = [];
    this.closeOthers = function (openGroup) {
      var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
      if (closeOthers) {
        angular.forEach(this.groups, function (group) {
          if (group !== openGroup) {
            group.isOpen = false;
          }
        });
      }
    };
    this.addGroup = function (groupScope) {
      var that = this;
      this.groups.push(groupScope);
      groupScope.$on('$destroy', function (event) {
        that.removeGroup(groupScope);
      });
    };
    this.removeGroup = function (group) {
      var index = this.groups.indexOf(group);
      if (index !== -1) {
        this.groups.splice(this.groups.indexOf(group), 1);
      }
    };
  }
]).directive('accordion', function () {
  return {
    restrict: 'EA',
    controller: 'AccordionController',
    transclude: true,
    replace: false,
    templateUrl: 'template/accordion/accordion.html'
  };
}).directive('accordionGroup', [
  '$parse',
  '$transition',
  '$timeout',
  function ($parse, $transition, $timeout) {
    return {
      require: '^accordion',
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'template/accordion/accordion-group.html',
      scope: { heading: '@' },
      controller: [
        '$scope',
        function ($scope) {
          this.setHeading = function (element) {
            this.heading = element;
          };
        }
      ],
      link: function (scope, element, attrs, accordionCtrl) {
        var getIsOpen, setIsOpen;
        accordionCtrl.addGroup(scope);
        scope.isOpen = false;
        if (attrs.isOpen) {
          getIsOpen = $parse(attrs.isOpen);
          setIsOpen = getIsOpen.assign;
          scope.$watch(function watchIsOpen() {
            return getIsOpen(scope.$parent);
          }, function updateOpen(value) {
            scope.isOpen = value;
          });
          scope.isOpen = getIsOpen ? getIsOpen(scope.$parent) : false;
        }
        scope.$watch('isOpen', function (value) {
          if (value) {
            accordionCtrl.closeOthers(scope);
          }
          if (setIsOpen) {
            setIsOpen(scope.$parent, value);
          }
        });
      }
    };
  }
]).directive('accordionHeading', function () {
  return {
    restrict: 'EA',
    transclude: true,
    template: '',
    replace: true,
    require: '^accordionGroup',
    compile: function (element, attr, transclude) {
      return function link(scope, element, attr, accordionGroupCtrl) {
        accordionGroupCtrl.setHeading(transclude(scope, function () {
        }));
      };
    }
  };
}).directive('accordionTransclude', function () {
  return {
    require: '^accordionGroup',
    link: function (scope, element, attr, controller) {
      scope.$watch(function () {
        return controller[attr.accordionTransclude];
      }, function (heading) {
        if (heading) {
          element.html('');
          element.append(heading);
        }
      });
    }
  };
});
angular.module('ui.bootstrap.alert', []).directive('alert', function () {
  return {
    restrict: 'EA',
    templateUrl: 'template/alert/alert.html',
    transclude: true,
    replace: true,
    scope: {
      type: '=',
      close: '&'
    },
    link: function (scope, iElement, iAttrs, controller) {
      scope.closeable = 'close' in iAttrs;
    }
  };
});
angular.module('ui.bootstrap.bindHtml', []).directive('bindHtmlUnsafe', function () {
  return function (scope, element, attr) {
    element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
    scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
      element.html(value || '');
    });
  };
});
angular.module('ui.bootstrap.buttons', []).constant('buttonConfig', {
  activeClass: 'active',
  toggleEvent: 'click'
}).directive('btnRadio', [
  'buttonConfig',
  function (buttonConfig) {
    var activeClass = buttonConfig.activeClass || 'active';
    var toggleEvent = buttonConfig.toggleEvent || 'click';
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
        ngModelCtrl.$render = function () {
          element.toggleClass(activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
        };
        element.bind(toggleEvent, function () {
          if (!element.hasClass(activeClass)) {
            scope.$apply(function () {
              ngModelCtrl.$setViewValue(scope.$eval(attrs.btnRadio));
              ngModelCtrl.$render();
            });
          }
        });
      }
    };
  }
]).directive('btnCheckbox', [
  'buttonConfig',
  function (buttonConfig) {
    var activeClass = buttonConfig.activeClass || 'active';
    var toggleEvent = buttonConfig.toggleEvent || 'click';
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
        function getTrueValue() {
          var trueValue = scope.$eval(attrs.btnCheckboxTrue);
          return angular.isDefined(trueValue) ? trueValue : true;
        }
        function getFalseValue() {
          var falseValue = scope.$eval(attrs.btnCheckboxFalse);
          return angular.isDefined(falseValue) ? falseValue : false;
        }
        ngModelCtrl.$render = function () {
          element.toggleClass(activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
        };
        element.bind(toggleEvent, function () {
          scope.$apply(function () {
            ngModelCtrl.$setViewValue(element.hasClass(activeClass) ? getFalseValue() : getTrueValue());
            ngModelCtrl.$render();
          });
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition']).controller('CarouselController', [
  '$scope',
  '$timeout',
  '$transition',
  '$q',
  function ($scope, $timeout, $transition, $q) {
    var self = this, slides = self.slides = [], currentIndex = -1, currentTimeout, isPlaying;
    self.currentSlide = null;
    self.select = function (nextSlide, direction) {
      var nextIndex = slides.indexOf(nextSlide);
      if (direction === undefined) {
        direction = nextIndex > currentIndex ? 'next' : 'prev';
      }
      if (nextSlide && nextSlide !== self.currentSlide) {
        if ($scope.$currentTransition) {
          $scope.$currentTransition.cancel();
          $timeout(goNext);
        } else {
          goNext();
        }
      }
      function goNext() {
        if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
          nextSlide.$element.addClass(direction);
          var reflow = nextSlide.$element[0].offsetWidth;
          angular.forEach(slides, function (slide) {
            angular.extend(slide, {
              direction: '',
              entering: false,
              leaving: false,
              active: false
            });
          });
          angular.extend(nextSlide, {
            direction: direction,
            active: true,
            entering: true
          });
          angular.extend(self.currentSlide || {}, {
            direction: direction,
            leaving: true
          });
          $scope.$currentTransition = $transition(nextSlide.$element, {});
          (function (next, current) {
            $scope.$currentTransition.then(function () {
              transitionDone(next, current);
            }, function () {
              transitionDone(next, current);
            });
          }(nextSlide, self.currentSlide));
        } else {
          transitionDone(nextSlide, self.currentSlide);
        }
        self.currentSlide = nextSlide;
        currentIndex = nextIndex;
        restartTimer();
      }
      function transitionDone(next, current) {
        angular.extend(next, {
          direction: '',
          active: true,
          leaving: false,
          entering: false
        });
        angular.extend(current || {}, {
          direction: '',
          active: false,
          leaving: false,
          entering: false
        });
        $scope.$currentTransition = null;
      }
    };
    self.indexOfSlide = function (slide) {
      return slides.indexOf(slide);
    };
    $scope.next = function () {
      var newIndex = (currentIndex + 1) % slides.length;
      if (!$scope.$currentTransition) {
        return self.select(slides[newIndex], 'next');
      }
    };
    $scope.prev = function () {
      var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;
      if (!$scope.$currentTransition) {
        return self.select(slides[newIndex], 'prev');
      }
    };
    $scope.select = function (slide) {
      self.select(slide);
    };
    $scope.isActive = function (slide) {
      return self.currentSlide === slide;
    };
    $scope.slides = function () {
      return slides;
    };
    $scope.$watch('interval', restartTimer);
    function restartTimer() {
      if (currentTimeout) {
        $timeout.cancel(currentTimeout);
      }
      function go() {
        if (isPlaying) {
          $scope.next();
          restartTimer();
        } else {
          $scope.pause();
        }
      }
      var interval = +$scope.interval;
      if (!isNaN(interval) && interval >= 0) {
        currentTimeout = $timeout(go, interval);
      }
    }
    $scope.play = function () {
      if (!isPlaying) {
        isPlaying = true;
        restartTimer();
      }
    };
    $scope.pause = function () {
      if (!$scope.noPause) {
        isPlaying = false;
        if (currentTimeout) {
          $timeout.cancel(currentTimeout);
        }
      }
    };
    self.addSlide = function (slide, element) {
      slide.$element = element;
      slides.push(slide);
      if (slides.length === 1 || slide.active) {
        self.select(slides[slides.length - 1]);
        if (slides.length == 1) {
          $scope.play();
        }
      } else {
        slide.active = false;
      }
    };
    self.removeSlide = function (slide) {
      var index = slides.indexOf(slide);
      slides.splice(index, 1);
      if (slides.length > 0 && slide.active) {
        if (index >= slides.length) {
          self.select(slides[index - 1]);
        } else {
          self.select(slides[index]);
        }
      } else if (currentIndex > index) {
        currentIndex--;
      }
    };
  }
]).directive('carousel', [function () {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      controller: 'CarouselController',
      require: 'carousel',
      templateUrl: 'template/carousel/carousel.html',
      scope: {
        interval: '=',
        noTransition: '=',
        noPause: '='
      }
    };
  }]).directive('slide', [
  '$parse',
  function ($parse) {
    return {
      require: '^carousel',
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'template/carousel/slide.html',
      scope: {},
      link: function (scope, element, attrs, carouselCtrl) {
        if (attrs.active) {
          var getActive = $parse(attrs.active);
          var setActive = getActive.assign;
          var lastValue = scope.active = getActive(scope.$parent);
          scope.$watch(function parentActiveWatch() {
            var parentActive = getActive(scope.$parent);
            if (parentActive !== scope.active) {
              if (parentActive !== lastValue) {
                lastValue = scope.active = parentActive;
              } else {
                setActive(scope.$parent, parentActive = lastValue = scope.active);
              }
            }
            return parentActive;
          });
        }
        carouselCtrl.addSlide(scope, element);
        scope.$on('$destroy', function () {
          carouselCtrl.removeSlide(scope);
        });
        scope.$watch('active', function (active) {
          if (active) {
            carouselCtrl.select(scope);
          }
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.position', []).factory('$position', [
  '$document',
  '$window',
  function ($document, $window) {
    function getStyle(el, cssprop) {
      if (el.currentStyle) {
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      return el.style[cssprop];
    }
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static') === 'static';
    }
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };
    return {
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = {
            top: 0,
            left: 0
          };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }
        return {
          width: element.prop('offsetWidth'),
          height: element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: element.prop('offsetWidth'),
          height: element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft)
        };
      }
    };
  }
]);
angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.position']).constant('datepickerConfig', {
  dayFormat: 'dd',
  monthFormat: 'MMMM',
  yearFormat: 'yyyy',
  dayHeaderFormat: 'EEE',
  dayTitleFormat: 'MMMM yyyy',
  monthTitleFormat: 'yyyy',
  showWeeks: true,
  startingDay: 0,
  yearRange: 20,
  minDate: null,
  maxDate: null
}).controller('DatepickerController', [
  '$scope',
  '$attrs',
  'dateFilter',
  'datepickerConfig',
  function ($scope, $attrs, dateFilter, dtConfig) {
    var format = {
        day: getValue($attrs.dayFormat, dtConfig.dayFormat),
        month: getValue($attrs.monthFormat, dtConfig.monthFormat),
        year: getValue($attrs.yearFormat, dtConfig.yearFormat),
        dayHeader: getValue($attrs.dayHeaderFormat, dtConfig.dayHeaderFormat),
        dayTitle: getValue($attrs.dayTitleFormat, dtConfig.dayTitleFormat),
        monthTitle: getValue($attrs.monthTitleFormat, dtConfig.monthTitleFormat)
      }, startingDay = getValue($attrs.startingDay, dtConfig.startingDay), yearRange = getValue($attrs.yearRange, dtConfig.yearRange);
    this.minDate = dtConfig.minDate ? new Date(dtConfig.minDate) : null;
    this.maxDate = dtConfig.maxDate ? new Date(dtConfig.maxDate) : null;
    function getValue(value, defaultValue) {
      return angular.isDefined(value) ? $scope.$parent.$eval(value) : defaultValue;
    }
    function getDaysInMonth(year, month) {
      return new Date(year, month, 0).getDate();
    }
    function getDates(startDate, n) {
      var dates = new Array(n);
      var current = startDate, i = 0;
      while (i < n) {
        dates[i++] = new Date(current);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    }
    function makeDate(date, format, isSelected, isSecondary) {
      return {
        date: date,
        label: dateFilter(date, format),
        selected: !!isSelected,
        secondary: !!isSecondary
      };
    }
    this.modes = [
      {
        name: 'day',
        getVisibleDates: function (date, selected) {
          var year = date.getFullYear(), month = date.getMonth(), firstDayOfMonth = new Date(year, month, 1);
          var difference = startingDay - firstDayOfMonth.getDay(), numDisplayedFromPreviousMonth = difference > 0 ? 7 - difference : -difference, firstDate = new Date(firstDayOfMonth), numDates = 0;
          if (numDisplayedFromPreviousMonth > 0) {
            firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
            numDates += numDisplayedFromPreviousMonth;
          }
          numDates += getDaysInMonth(year, month + 1);
          numDates += (7 - numDates % 7) % 7;
          var days = getDates(firstDate, numDates), labels = new Array(7);
          for (var i = 0; i < numDates; i++) {
            var dt = new Date(days[i]);
            days[i] = makeDate(dt, format.day, selected && selected.getDate() === dt.getDate() && selected.getMonth() === dt.getMonth() && selected.getFullYear() === dt.getFullYear(), dt.getMonth() !== month);
          }
          for (var j = 0; j < 7; j++) {
            labels[j] = dateFilter(days[j].date, format.dayHeader);
          }
          return {
            objects: days,
            title: dateFilter(date, format.dayTitle),
            labels: labels
          };
        },
        compare: function (date1, date2) {
          return new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
        },
        split: 7,
        step: { months: 1 }
      },
      {
        name: 'month',
        getVisibleDates: function (date, selected) {
          var months = new Array(12), year = date.getFullYear();
          for (var i = 0; i < 12; i++) {
            var dt = new Date(year, i, 1);
            months[i] = makeDate(dt, format.month, selected && selected.getMonth() === i && selected.getFullYear() === year);
          }
          return {
            objects: months,
            title: dateFilter(date, format.monthTitle)
          };
        },
        compare: function (date1, date2) {
          return new Date(date1.getFullYear(), date1.getMonth()) - new Date(date2.getFullYear(), date2.getMonth());
        },
        split: 3,
        step: { years: 1 }
      },
      {
        name: 'year',
        getVisibleDates: function (date, selected) {
          var years = new Array(yearRange), year = date.getFullYear(), startYear = parseInt((year - 1) / yearRange, 10) * yearRange + 1;
          for (var i = 0; i < yearRange; i++) {
            var dt = new Date(startYear + i, 0, 1);
            years[i] = makeDate(dt, format.year, selected && selected.getFullYear() === dt.getFullYear());
          }
          return {
            objects: years,
            title: [
              years[0].label,
              years[yearRange - 1].label
            ].join(' - ')
          };
        },
        compare: function (date1, date2) {
          return date1.getFullYear() - date2.getFullYear();
        },
        split: 5,
        step: { years: yearRange }
      }
    ];
    this.isDisabled = function (date, mode) {
      var currentMode = this.modes[mode || 0];
      return this.minDate && currentMode.compare(date, this.minDate) < 0 || this.maxDate && currentMode.compare(date, this.maxDate) > 0 || $scope.dateDisabled && $scope.dateDisabled({
        date: date,
        mode: currentMode.name
      });
    };
  }
]).directive('datepicker', [
  'dateFilter',
  '$parse',
  'datepickerConfig',
  '$log',
  function (dateFilter, $parse, datepickerConfig, $log) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/datepicker/datepicker.html',
      scope: { dateDisabled: '&' },
      require: [
        'datepicker',
        '?^ngModel'
      ],
      controller: 'DatepickerController',
      link: function (scope, element, attrs, ctrls) {
        var datepickerCtrl = ctrls[0], ngModel = ctrls[1];
        if (!ngModel) {
          return;
        }
        var mode = 0, selected = new Date(), showWeeks = datepickerConfig.showWeeks;
        if (attrs.showWeeks) {
          scope.$parent.$watch($parse(attrs.showWeeks), function (value) {
            showWeeks = !!value;
            updateShowWeekNumbers();
          });
        } else {
          updateShowWeekNumbers();
        }
        if (attrs.min) {
          scope.$parent.$watch($parse(attrs.min), function (value) {
            datepickerCtrl.minDate = value ? new Date(value) : null;
            refill();
          });
        }
        if (attrs.max) {
          scope.$parent.$watch($parse(attrs.max), function (value) {
            datepickerCtrl.maxDate = value ? new Date(value) : null;
            refill();
          });
        }
        function updateShowWeekNumbers() {
          scope.showWeekNumbers = mode === 0 && showWeeks;
        }
        function split(arr, size) {
          var arrays = [];
          while (arr.length > 0) {
            arrays.push(arr.splice(0, size));
          }
          return arrays;
        }
        function refill(updateSelected) {
          var date = null, valid = true;
          if (ngModel.$modelValue) {
            date = new Date(ngModel.$modelValue);
            if (isNaN(date)) {
              valid = false;
              $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
            } else if (updateSelected) {
              selected = date;
            }
          }
          ngModel.$setValidity('date', valid);
          var currentMode = datepickerCtrl.modes[mode], data = currentMode.getVisibleDates(selected, date);
          angular.forEach(data.objects, function (obj) {
            obj.disabled = datepickerCtrl.isDisabled(obj.date, mode);
          });
          ngModel.$setValidity('date-disabled', !date || !datepickerCtrl.isDisabled(date));
          scope.rows = split(data.objects, currentMode.split);
          scope.labels = data.labels || [];
          scope.title = data.title;
        }
        function setMode(value) {
          mode = value;
          updateShowWeekNumbers();
          refill();
        }
        ngModel.$render = function () {
          refill(true);
        };
        scope.select = function (date) {
          if (mode === 0) {
            var dt = new Date(ngModel.$modelValue);
            dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            ngModel.$setViewValue(dt);
            refill(true);
          } else {
            selected = date;
            setMode(mode - 1);
          }
        };
        scope.move = function (direction) {
          var step = datepickerCtrl.modes[mode].step;
          selected.setMonth(selected.getMonth() + direction * (step.months || 0));
          selected.setFullYear(selected.getFullYear() + direction * (step.years || 0));
          refill();
        };
        scope.toggleMode = function () {
          setMode((mode + 1) % datepickerCtrl.modes.length);
        };
        scope.getWeekNumber = function (row) {
          return mode === 0 && scope.showWeekNumbers && row.length === 7 ? getISO8601WeekNumber(row[0].date) : null;
        };
        function getISO8601WeekNumber(date) {
          var checkDate = new Date(date);
          checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
          var time = checkDate.getTime();
          checkDate.setMonth(0);
          checkDate.setDate(1);
          return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
        }
      }
    };
  }
]).constant('datepickerPopupConfig', {
  dateFormat: 'yyyy-MM-dd',
  closeOnDateSelection: true
}).directive('datepickerPopup', [
  '$compile',
  '$parse',
  '$document',
  '$position',
  'dateFilter',
  'datepickerPopupConfig',
  function ($compile, $parse, $document, $position, dateFilter, datepickerPopupConfig) {
    return {
      restrict: 'EA',
      require: 'ngModel',
      link: function (originalScope, element, attrs, ngModel) {
        var closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection;
        var dateFormat = attrs.datepickerPopup || datepickerPopupConfig.dateFormat;
        var scope = originalScope.$new();
        originalScope.$on('$destroy', function () {
          scope.$destroy();
        });
        var getIsOpen, setIsOpen;
        if (attrs.isOpen) {
          getIsOpen = $parse(attrs.isOpen);
          setIsOpen = getIsOpen.assign;
          originalScope.$watch(getIsOpen, function updateOpen(value) {
            scope.isOpen = !!value;
          });
        }
        scope.isOpen = getIsOpen ? getIsOpen(originalScope) : false;
        function setOpen(value) {
          if (setIsOpen) {
            setIsOpen(originalScope, !!value);
          } else {
            scope.isOpen = !!value;
          }
        }
        var documentClickBind = function (event) {
          if (scope.isOpen && event.target !== element[0]) {
            scope.$apply(function () {
              setOpen(false);
            });
          }
        };
        var elementFocusBind = function () {
          scope.$apply(function () {
            setOpen(true);
          });
        };
        var popupEl = angular.element('<datepicker-popup-wrap><datepicker></datepicker></datepicker-popup-wrap>');
        popupEl.attr({
          'ng-model': 'date',
          'ng-change': 'dateSelection()'
        });
        var datepickerEl = popupEl.find('datepicker');
        if (attrs.datepickerOptions) {
          datepickerEl.attr(angular.extend({}, originalScope.$eval(attrs.datepickerOptions)));
        }
        function parseDate(viewValue) {
          if (!viewValue) {
            ngModel.$setValidity('date', true);
            return null;
          } else if (angular.isDate(viewValue)) {
            ngModel.$setValidity('date', true);
            return viewValue;
          } else if (angular.isString(viewValue)) {
            var date = new Date(viewValue);
            if (isNaN(date)) {
              ngModel.$setValidity('date', false);
              return undefined;
            } else {
              ngModel.$setValidity('date', true);
              return date;
            }
          } else {
            ngModel.$setValidity('date', false);
            return undefined;
          }
        }
        ngModel.$parsers.unshift(parseDate);
        scope.dateSelection = function () {
          ngModel.$setViewValue(scope.date);
          ngModel.$render();
          if (closeOnDateSelection) {
            setOpen(false);
          }
        };
        element.bind('input change keyup', function () {
          scope.$apply(function () {
            updateCalendar();
          });
        });
        ngModel.$render = function () {
          var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : '';
          element.val(date);
          updateCalendar();
        };
        function updateCalendar() {
          scope.date = ngModel.$modelValue;
          updatePosition();
        }
        function addWatchableAttribute(attribute, scopeProperty, datepickerAttribute) {
          if (attribute) {
            originalScope.$watch($parse(attribute), function (value) {
              scope[scopeProperty] = value;
            });
            datepickerEl.attr(datepickerAttribute || scopeProperty, scopeProperty);
          }
        }
        addWatchableAttribute(attrs.min, 'min');
        addWatchableAttribute(attrs.max, 'max');
        if (attrs.showWeeks) {
          addWatchableAttribute(attrs.showWeeks, 'showWeeks', 'show-weeks');
        } else {
          scope.showWeeks = true;
          datepickerEl.attr('show-weeks', 'showWeeks');
        }
        if (attrs.dateDisabled) {
          datepickerEl.attr('date-disabled', attrs.dateDisabled);
        }
        function updatePosition() {
          scope.position = $position.position(element);
          scope.position.top = scope.position.top + element.prop('offsetHeight');
        }
        var documentBindingInitialized = false, elementFocusInitialized = false;
        scope.$watch('isOpen', function (value) {
          if (value) {
            updatePosition();
            $document.bind('click', documentClickBind);
            if (elementFocusInitialized) {
              element.unbind('focus', elementFocusBind);
            }
            element[0].focus();
            documentBindingInitialized = true;
          } else {
            if (documentBindingInitialized) {
              $document.unbind('click', documentClickBind);
            }
            element.bind('focus', elementFocusBind);
            elementFocusInitialized = true;
          }
          if (setIsOpen) {
            setIsOpen(originalScope, value);
          }
        });
        var $setModelValue = $parse(attrs.ngModel).assign;
        scope.today = function () {
          $setModelValue(originalScope, new Date());
        };
        scope.clear = function () {
          $setModelValue(originalScope, null);
        };
        element.after($compile(popupEl)(scope));
      }
    };
  }
]).directive('datepickerPopupWrap', [function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: 'template/datepicker/popup.html',
      link: function (scope, element, attrs) {
        element.bind('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
        });
      }
    };
  }]);
angular.module('ui.bootstrap.dropdownToggle', []).directive('dropdownToggle', [
  '$document',
  '$location',
  function ($document, $location) {
    var openElement = null, closeMenu = angular.noop;
    return {
      restrict: 'CA',
      link: function (scope, element, attrs) {
        scope.$watch('$location.path', function () {
          closeMenu();
        });
        element.parent().bind('click', function () {
          closeMenu();
        });
        element.bind('click', function (event) {
          var elementWasOpen = element === openElement;
          event.preventDefault();
          event.stopPropagation();
          if (!!openElement) {
            closeMenu();
          }
          if (!elementWasOpen) {
            element.parent().addClass('open');
            openElement = element;
            closeMenu = function (event) {
              if (event) {
                event.preventDefault();
                event.stopPropagation();
              }
              $document.unbind('click', closeMenu);
              element.parent().removeClass('open');
              closeMenu = angular.noop;
              openElement = null;
            };
            $document.bind('click', closeMenu);
          }
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.modal', []).factory('$$stackedMap', function () {
  return {
    createNew: function () {
      var stack = [];
      return {
        add: function (key, value) {
          stack.push({
            key: key,
            value: value
          });
        },
        get: function (key) {
          for (var i = 0; i < stack.length; i++) {
            if (key == stack[i].key) {
              return stack[i];
            }
          }
        },
        keys: function () {
          var keys = [];
          for (var i = 0; i < stack.length; i++) {
            keys.push(stack[i].key);
          }
          return keys;
        },
        top: function () {
          return stack[stack.length - 1];
        },
        remove: function (key) {
          var idx = -1;
          for (var i = 0; i < stack.length; i++) {
            if (key == stack[i].key) {
              idx = i;
              break;
            }
          }
          return stack.splice(idx, 1)[0];
        },
        removeTop: function () {
          return stack.splice(stack.length - 1, 1)[0];
        },
        length: function () {
          return stack.length;
        }
      };
    }
  };
}).directive('modalBackdrop', [
  '$modalStack',
  '$timeout',
  function ($modalStack, $timeout) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/modal/backdrop.html',
      link: function (scope, element, attrs) {
        $timeout(function () {
          scope.animate = true;
        });
        scope.close = function (evt) {
          var modal = $modalStack.getTop();
          if (modal && modal.value.backdrop && modal.value.backdrop != 'static') {
            evt.preventDefault();
            evt.stopPropagation();
            $modalStack.dismiss(modal.key, 'backdrop click');
          }
        };
      }
    };
  }
]).directive('modalWindow', [
  '$timeout',
  function ($timeout) {
    return {
      restrict: 'EA',
      scope: { index: '@' },
      replace: true,
      transclude: true,
      templateUrl: 'template/modal/window.html',
      link: function (scope, element, attrs) {
        scope.windowClass = attrs.windowClass || '';
        $timeout(function () {
          scope.animate = true;
        });
      }
    };
  }
]).factory('$modalStack', [
  '$document',
  '$compile',
  '$rootScope',
  '$$stackedMap',
  function ($document, $compile, $rootScope, $$stackedMap) {
    var backdropjqLiteEl, backdropDomEl;
    var backdropScope = $rootScope.$new(true);
    var body = $document.find('body').eq(0);
    var openedWindows = $$stackedMap.createNew();
    var $modalStack = {};
    function backdropIndex() {
      var topBackdropIndex = -1;
      var opened = openedWindows.keys();
      for (var i = 0; i < opened.length; i++) {
        if (openedWindows.get(opened[i]).value.backdrop) {
          topBackdropIndex = i;
        }
      }
      return topBackdropIndex;
    }
    $rootScope.$watch(backdropIndex, function (newBackdropIndex) {
      backdropScope.index = newBackdropIndex;
    });
    function removeModalWindow(modalInstance) {
      var modalWindow = openedWindows.get(modalInstance).value;
      openedWindows.remove(modalInstance);
      modalWindow.modalDomEl.remove();
      if (backdropIndex() == -1) {
        backdropDomEl.remove();
        backdropDomEl = undefined;
      }
      modalWindow.modalScope.$destroy();
    }
    $document.bind('keydown', function (evt) {
      var modal;
      if (evt.which === 27) {
        modal = openedWindows.top();
        if (modal && modal.value.keyboard) {
          $rootScope.$apply(function () {
            $modalStack.dismiss(modal.key);
          });
        }
      }
    });
    $modalStack.open = function (modalInstance, modal) {
      openedWindows.add(modalInstance, {
        deferred: modal.deferred,
        modalScope: modal.scope,
        backdrop: modal.backdrop,
        keyboard: modal.keyboard
      });
      var angularDomEl = angular.element('<div modal-window></div>');
      angularDomEl.attr('window-class', modal.windowClass);
      angularDomEl.attr('index', openedWindows.length() - 1);
      angularDomEl.html(modal.content);
      var modalDomEl = $compile(angularDomEl)(modal.scope);
      openedWindows.top().value.modalDomEl = modalDomEl;
      body.append(modalDomEl);
      if (backdropIndex() >= 0 && !backdropDomEl) {
        backdropjqLiteEl = angular.element('<div modal-backdrop></div>');
        backdropDomEl = $compile(backdropjqLiteEl)(backdropScope);
        body.append(backdropDomEl);
      }
    };
    $modalStack.close = function (modalInstance, result) {
      var modal = openedWindows.get(modalInstance);
      if (modal) {
        modal.value.deferred.resolve(result);
        removeModalWindow(modalInstance);
      }
    };
    $modalStack.dismiss = function (modalInstance, reason) {
      var modalWindow = openedWindows.get(modalInstance).value;
      if (modalWindow) {
        modalWindow.deferred.reject(reason);
        removeModalWindow(modalInstance);
      }
    };
    $modalStack.getTop = function () {
      return openedWindows.top();
    };
    return $modalStack;
  }
]).provider('$modal', function () {
  var $modalProvider = {
      options: {
        backdrop: true,
        keyboard: true
      },
      $get: [
        '$injector',
        '$rootScope',
        '$q',
        '$http',
        '$templateCache',
        '$controller',
        '$modalStack',
        function ($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {
          var $modal = {};
          function getTemplatePromise(options) {
            return options.template ? $q.when(options.template) : $http.get(options.templateUrl, { cache: $templateCache }).then(function (result) {
              return result.data;
            });
          }
          function getResolvePromises(resolves) {
            var promisesArr = [];
            angular.forEach(resolves, function (value, key) {
              if (angular.isFunction(value) || angular.isArray(value)) {
                promisesArr.push($q.when($injector.invoke(value)));
              }
            });
            return promisesArr;
          }
          $modal.open = function (modalOptions) {
            var modalResultDeferred = $q.defer();
            var modalOpenedDeferred = $q.defer();
            var modalInstance = {
                result: modalResultDeferred.promise,
                opened: modalOpenedDeferred.promise,
                close: function (result) {
                  $modalStack.close(modalInstance, result);
                },
                dismiss: function (reason) {
                  $modalStack.dismiss(modalInstance, reason);
                }
              };
            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
            modalOptions.resolve = modalOptions.resolve || {};
            if (!modalOptions.template && !modalOptions.templateUrl) {
              throw new Error('One of template or templateUrl options is required.');
            }
            var templateAndResolvePromise = $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));
            templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {
              var modalScope = (modalOptions.scope || $rootScope).$new();
              modalScope.$close = modalInstance.close;
              modalScope.$dismiss = modalInstance.dismiss;
              var ctrlInstance, ctrlLocals = {};
              var resolveIter = 1;
              if (modalOptions.controller) {
                ctrlLocals.$scope = modalScope;
                ctrlLocals.$modalInstance = modalInstance;
                angular.forEach(modalOptions.resolve, function (value, key) {
                  ctrlLocals[key] = tplAndVars[resolveIter++];
                });
                ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
              }
              $modalStack.open(modalInstance, {
                scope: modalScope,
                deferred: modalResultDeferred,
                content: tplAndVars[0],
                backdrop: modalOptions.backdrop,
                keyboard: modalOptions.keyboard,
                windowClass: modalOptions.windowClass
              });
            }, function resolveError(reason) {
              modalResultDeferred.reject(reason);
            });
            templateAndResolvePromise.then(function () {
              modalOpenedDeferred.resolve(true);
            }, function () {
              modalOpenedDeferred.reject(false);
            });
            return modalInstance;
          };
          return $modal;
        }
      ]
    };
  return $modalProvider;
});
angular.module('ui.bootstrap.pagination', []).controller('PaginationController', [
  '$scope',
  '$attrs',
  '$parse',
  '$interpolate',
  function ($scope, $attrs, $parse, $interpolate) {
    var self = this;
    this.init = function (defaultItemsPerPage) {
      if ($attrs.itemsPerPage) {
        $scope.$parent.$watch($parse($attrs.itemsPerPage), function (value) {
          self.itemsPerPage = parseInt(value, 10);
          $scope.totalPages = self.calculateTotalPages();
        });
      } else {
        this.itemsPerPage = defaultItemsPerPage;
      }
    };
    this.noPrevious = function () {
      return this.page === 1;
    };
    this.noNext = function () {
      return this.page === $scope.totalPages;
    };
    this.isActive = function (page) {
      return this.page === page;
    };
    this.calculateTotalPages = function () {
      return this.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / this.itemsPerPage);
    };
    this.getAttributeValue = function (attribute, defaultValue, interpolate) {
      return angular.isDefined(attribute) ? interpolate ? $interpolate(attribute)($scope.$parent) : $scope.$parent.$eval(attribute) : defaultValue;
    };
    this.render = function () {
      this.page = parseInt($scope.page, 10) || 1;
      $scope.pages = this.getPages(this.page, $scope.totalPages);
    };
    $scope.selectPage = function (page) {
      if (!self.isActive(page) && page > 0 && page <= $scope.totalPages) {
        $scope.page = page;
        $scope.onSelectPage({ page: page });
      }
    };
    $scope.$watch('totalItems', function () {
      $scope.totalPages = self.calculateTotalPages();
    });
    $scope.$watch('totalPages', function (value) {
      if ($attrs.numPages) {
        $scope.numPages = value;
      }
      if (self.page > value) {
        $scope.selectPage(value);
      } else {
        self.render();
      }
    });
    $scope.$watch('page', function () {
      self.render();
    });
  }
]).constant('paginationConfig', {
  itemsPerPage: 10,
  boundaryLinks: false,
  directionLinks: true,
  firstText: 'First',
  previousText: 'Previous',
  nextText: 'Next',
  lastText: 'Last',
  rotate: true
}).directive('pagination', [
  '$parse',
  'paginationConfig',
  function ($parse, config) {
    return {
      restrict: 'EA',
      scope: {
        page: '=',
        totalItems: '=',
        onSelectPage: ' &',
        numPages: '='
      },
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pagination.html',
      replace: true,
      link: function (scope, element, attrs, paginationCtrl) {
        var maxSize, boundaryLinks = paginationCtrl.getAttributeValue(attrs.boundaryLinks, config.boundaryLinks), directionLinks = paginationCtrl.getAttributeValue(attrs.directionLinks, config.directionLinks), firstText = paginationCtrl.getAttributeValue(attrs.firstText, config.firstText, true), previousText = paginationCtrl.getAttributeValue(attrs.previousText, config.previousText, true), nextText = paginationCtrl.getAttributeValue(attrs.nextText, config.nextText, true), lastText = paginationCtrl.getAttributeValue(attrs.lastText, config.lastText, true), rotate = paginationCtrl.getAttributeValue(attrs.rotate, config.rotate);
        paginationCtrl.init(config.itemsPerPage);
        if (attrs.maxSize) {
          scope.$parent.$watch($parse(attrs.maxSize), function (value) {
            maxSize = parseInt(value, 10);
            paginationCtrl.render();
          });
        }
        function makePage(number, text, isActive, isDisabled) {
          return {
            number: number,
            text: text,
            active: isActive,
            disabled: isDisabled
          };
        }
        paginationCtrl.getPages = function (currentPage, totalPages) {
          var pages = [];
          var startPage = 1, endPage = totalPages;
          var isMaxSized = angular.isDefined(maxSize) && maxSize < totalPages;
          if (isMaxSized) {
            if (rotate) {
              startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
              endPage = startPage + maxSize - 1;
              if (endPage > totalPages) {
                endPage = totalPages;
                startPage = endPage - maxSize + 1;
              }
            } else {
              startPage = (Math.ceil(currentPage / maxSize) - 1) * maxSize + 1;
              endPage = Math.min(startPage + maxSize - 1, totalPages);
            }
          }
          for (var number = startPage; number <= endPage; number++) {
            var page = makePage(number, number, paginationCtrl.isActive(number), false);
            pages.push(page);
          }
          if (isMaxSized && !rotate) {
            if (startPage > 1) {
              var previousPageSet = makePage(startPage - 1, '...', false, false);
              pages.unshift(previousPageSet);
            }
            if (endPage < totalPages) {
              var nextPageSet = makePage(endPage + 1, '...', false, false);
              pages.push(nextPageSet);
            }
          }
          if (directionLinks) {
            var previousPage = makePage(currentPage - 1, previousText, false, paginationCtrl.noPrevious());
            pages.unshift(previousPage);
            var nextPage = makePage(currentPage + 1, nextText, false, paginationCtrl.noNext());
            pages.push(nextPage);
          }
          if (boundaryLinks) {
            var firstPage = makePage(1, firstText, false, paginationCtrl.noPrevious());
            pages.unshift(firstPage);
            var lastPage = makePage(totalPages, lastText, false, paginationCtrl.noNext());
            pages.push(lastPage);
          }
          return pages;
        };
      }
    };
  }
]).constant('pagerConfig', {
  itemsPerPage: 10,
  previousText: '\xab Previous',
  nextText: 'Next \xbb',
  align: true
}).directive('pager', [
  'pagerConfig',
  function (config) {
    return {
      restrict: 'EA',
      scope: {
        page: '=',
        totalItems: '=',
        onSelectPage: ' &',
        numPages: '='
      },
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pager.html',
      replace: true,
      link: function (scope, element, attrs, paginationCtrl) {
        var previousText = paginationCtrl.getAttributeValue(attrs.previousText, config.previousText, true), nextText = paginationCtrl.getAttributeValue(attrs.nextText, config.nextText, true), align = paginationCtrl.getAttributeValue(attrs.align, config.align);
        paginationCtrl.init(config.itemsPerPage);
        function makePage(number, text, isDisabled, isPrevious, isNext) {
          return {
            number: number,
            text: text,
            disabled: isDisabled,
            previous: align && isPrevious,
            next: align && isNext
          };
        }
        paginationCtrl.getPages = function (currentPage) {
          return [
            makePage(currentPage - 1, previousText, paginationCtrl.noPrevious(), true, false),
            makePage(currentPage + 1, nextText, paginationCtrl.noNext(), false, true)
          ];
        };
      }
    };
  }
]);
angular.module('ui.bootstrap.tooltip', [
  'ui.bootstrap.position',
  'ui.bootstrap.bindHtml'
]).provider('$tooltip', function () {
  var defaultOptions = {
      placement: 'top',
      animation: true,
      popupDelay: 0
    };
  var triggerMap = {
      'mouseenter': 'mouseleave',
      'click': 'click',
      'focus': 'blur'
    };
  var globalOptions = {};
  this.options = function (value) {
    angular.extend(globalOptions, value);
  };
  this.setTriggers = function setTriggers(triggers) {
    angular.extend(triggerMap, triggers);
  };
  function snake_case(name) {
    var regexp = /[A-Z]/g;
    var separator = '-';
    return name.replace(regexp, function (letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }
  this.$get = [
    '$window',
    '$compile',
    '$timeout',
    '$parse',
    '$document',
    '$position',
    '$interpolate',
    function ($window, $compile, $timeout, $parse, $document, $position, $interpolate) {
      return function $tooltip(type, prefix, defaultTriggerShow) {
        var options = angular.extend({}, defaultOptions, globalOptions);
        function getTriggers(trigger) {
          var show = trigger || options.trigger || defaultTriggerShow;
          var hide = triggerMap[show] || show;
          return {
            show: show,
            hide: hide
          };
        }
        var directiveName = snake_case(type);
        var startSym = $interpolate.startSymbol();
        var endSym = $interpolate.endSymbol();
        var template = '<' + directiveName + '-popup ' + 'title="' + startSym + 'tt_title' + endSym + '" ' + 'content="' + startSym + 'tt_content' + endSym + '" ' + 'placement="' + startSym + 'tt_placement' + endSym + '" ' + 'animation="tt_animation()" ' + 'is-open="tt_isOpen"' + '>' + '</' + directiveName + '-popup>';
        return {
          restrict: 'EA',
          scope: true,
          link: function link(scope, element, attrs) {
            var tooltip = $compile(template)(scope);
            var transitionTimeout;
            var popupTimeout;
            var $body;
            var appendToBody = angular.isDefined(options.appendToBody) ? options.appendToBody : false;
            var triggers = getTriggers(undefined);
            var hasRegisteredTriggers = false;
            scope.tt_isOpen = false;
            function toggleTooltipBind() {
              if (!scope.tt_isOpen) {
                showTooltipBind();
              } else {
                hideTooltipBind();
              }
            }
            function showTooltipBind() {
              if (scope.tt_popupDelay) {
                popupTimeout = $timeout(show, scope.tt_popupDelay);
              } else {
                scope.$apply(show);
              }
            }
            function hideTooltipBind() {
              scope.$apply(function () {
                hide();
              });
            }
            function show() {
              var position, ttWidth, ttHeight, ttPosition;
              if (!scope.tt_content) {
                return;
              }
              if (transitionTimeout) {
                $timeout.cancel(transitionTimeout);
              }
              tooltip.css({
                top: 0,
                left: 0,
                display: 'block'
              });
              if (appendToBody) {
                $body = $body || $document.find('body');
                $body.append(tooltip);
              } else {
                element.after(tooltip);
              }
              position = appendToBody ? $position.offset(element) : $position.position(element);
              ttWidth = tooltip.prop('offsetWidth');
              ttHeight = tooltip.prop('offsetHeight');
              switch (scope.tt_placement) {
              case 'right':
                ttPosition = {
                  top: position.top + position.height / 2 - ttHeight / 2,
                  left: position.left + position.width
                };
                break;
              case 'bottom':
                ttPosition = {
                  top: position.top + position.height,
                  left: position.left + position.width / 2 - ttWidth / 2
                };
                break;
              case 'left':
                ttPosition = {
                  top: position.top + position.height / 2 - ttHeight / 2,
                  left: position.left - ttWidth
                };
                break;
              default:
                ttPosition = {
                  top: position.top - ttHeight,
                  left: position.left + position.width / 2 - ttWidth / 2
                };
                break;
              }
              ttPosition.top += 'px';
              ttPosition.left += 'px';
              tooltip.css(ttPosition);
              scope.tt_isOpen = true;
            }
            function hide() {
              scope.tt_isOpen = false;
              $timeout.cancel(popupTimeout);
              if (angular.isDefined(scope.tt_animation) && scope.tt_animation()) {
                transitionTimeout = $timeout(function () {
                  tooltip.remove();
                }, 500);
              } else {
                tooltip.remove();
              }
            }
            attrs.$observe(type, function (val) {
              scope.tt_content = val;
            });
            attrs.$observe(prefix + 'Title', function (val) {
              scope.tt_title = val;
            });
            attrs.$observe(prefix + 'Placement', function (val) {
              scope.tt_placement = angular.isDefined(val) ? val : options.placement;
            });
            attrs.$observe(prefix + 'Animation', function (val) {
              scope.tt_animation = angular.isDefined(val) ? $parse(val) : function () {
                return options.animation;
              };
            });
            attrs.$observe(prefix + 'PopupDelay', function (val) {
              var delay = parseInt(val, 10);
              scope.tt_popupDelay = !isNaN(delay) ? delay : options.popupDelay;
            });
            attrs.$observe(prefix + 'Trigger', function (val) {
              if (hasRegisteredTriggers) {
                element.unbind(triggers.show, showTooltipBind);
                element.unbind(triggers.hide, hideTooltipBind);
              }
              triggers = getTriggers(val);
              if (triggers.show === triggers.hide) {
                element.bind(triggers.show, toggleTooltipBind);
              } else {
                element.bind(triggers.show, showTooltipBind);
                element.bind(triggers.hide, hideTooltipBind);
              }
              hasRegisteredTriggers = true;
            });
            attrs.$observe(prefix + 'AppendToBody', function (val) {
              appendToBody = angular.isDefined(val) ? $parse(val)(scope) : appendToBody;
            });
            if (appendToBody) {
              scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess() {
                if (scope.tt_isOpen) {
                  hide();
                }
              });
            }
            scope.$on('$destroy', function onDestroyTooltip() {
              if (scope.tt_isOpen) {
                hide();
              } else {
                tooltip.remove();
              }
            });
          }
        };
      };
    }
  ];
}).directive('tooltipPopup', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/tooltip/tooltip-popup.html'
  };
}).directive('tooltip', [
  '$tooltip',
  function ($tooltip) {
    return $tooltip('tooltip', 'tooltip', 'mouseenter');
  }
]).directive('tooltipHtmlUnsafePopup', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
  };
}).directive('tooltipHtmlUnsafe', [
  '$tooltip',
  function ($tooltip) {
    return $tooltip('tooltipHtmlUnsafe', 'tooltip', 'mouseenter');
  }
]);
angular.module('ui.bootstrap.popover', ['ui.bootstrap.tooltip']).directive('popoverPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      title: '@',
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/popover/popover.html'
  };
}).directive('popover', [
  '$compile',
  '$timeout',
  '$parse',
  '$window',
  '$tooltip',
  function ($compile, $timeout, $parse, $window, $tooltip) {
    return $tooltip('popover', 'popover', 'click');
  }
]);
angular.module('ui.bootstrap.progressbar', ['ui.bootstrap.transition']).constant('progressConfig', {
  animate: true,
  autoType: false,
  stackedTypes: [
    'success',
    'info',
    'warning',
    'danger'
  ]
}).controller('ProgressBarController', [
  '$scope',
  '$attrs',
  'progressConfig',
  function ($scope, $attrs, progressConfig) {
    var animate = angular.isDefined($attrs.animate) ? $scope.$eval($attrs.animate) : progressConfig.animate;
    var autoType = angular.isDefined($attrs.autoType) ? $scope.$eval($attrs.autoType) : progressConfig.autoType;
    var stackedTypes = angular.isDefined($attrs.stackedTypes) ? $scope.$eval('[' + $attrs.stackedTypes + ']') : progressConfig.stackedTypes;
    this.makeBar = function (newBar, oldBar, index) {
      var newValue = angular.isObject(newBar) ? newBar.value : newBar || 0;
      var oldValue = angular.isObject(oldBar) ? oldBar.value : oldBar || 0;
      var type = angular.isObject(newBar) && angular.isDefined(newBar.type) ? newBar.type : autoType ? getStackedType(index || 0) : null;
      return {
        from: oldValue,
        to: newValue,
        type: type,
        animate: animate
      };
    };
    function getStackedType(index) {
      return stackedTypes[index];
    }
    this.addBar = function (bar) {
      $scope.bars.push(bar);
      $scope.totalPercent += bar.to;
    };
    this.clearBars = function () {
      $scope.bars = [];
      $scope.totalPercent = 0;
    };
    this.clearBars();
  }
]).directive('progress', function () {
  return {
    restrict: 'EA',
    replace: true,
    controller: 'ProgressBarController',
    scope: {
      value: '=percent',
      onFull: '&',
      onEmpty: '&'
    },
    templateUrl: 'template/progressbar/progress.html',
    link: function (scope, element, attrs, controller) {
      scope.$watch('value', function (newValue, oldValue) {
        controller.clearBars();
        if (angular.isArray(newValue)) {
          for (var i = 0, n = newValue.length; i < n; i++) {
            controller.addBar(controller.makeBar(newValue[i], oldValue[i], i));
          }
        } else {
          controller.addBar(controller.makeBar(newValue, oldValue));
        }
      }, true);
      scope.$watch('totalPercent', function (value) {
        if (value >= 100) {
          scope.onFull();
        } else if (value <= 0) {
          scope.onEmpty();
        }
      }, true);
    }
  };
}).directive('progressbar', [
  '$transition',
  function ($transition) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        width: '=',
        old: '=',
        type: '=',
        animate: '='
      },
      templateUrl: 'template/progressbar/bar.html',
      link: function (scope, element) {
        scope.$watch('width', function (value) {
          if (scope.animate) {
            element.css('width', scope.old + '%');
            $transition(element, { width: value + '%' });
          } else {
            element.css('width', value + '%');
          }
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.rating', []).constant('ratingConfig', {
  max: 5,
  stateOn: null,
  stateOff: null
}).controller('RatingController', [
  '$scope',
  '$attrs',
  '$parse',
  'ratingConfig',
  function ($scope, $attrs, $parse, ratingConfig) {
    this.maxRange = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max;
    this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
    this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;
    this.createDefaultRange = function (len) {
      var defaultStateObject = {
          stateOn: this.stateOn,
          stateOff: this.stateOff
        };
      var states = new Array(len);
      for (var i = 0; i < len; i++) {
        states[i] = defaultStateObject;
      }
      return states;
    };
    this.normalizeRange = function (states) {
      for (var i = 0, n = states.length; i < n; i++) {
        states[i].stateOn = states[i].stateOn || this.stateOn;
        states[i].stateOff = states[i].stateOff || this.stateOff;
      }
      return states;
    };
    $scope.range = angular.isDefined($attrs.ratingStates) ? this.normalizeRange(angular.copy($scope.$parent.$eval($attrs.ratingStates))) : this.createDefaultRange(this.maxRange);
    $scope.rate = function (value) {
      if ($scope.readonly || $scope.value === value) {
        return;
      }
      $scope.value = value;
    };
    $scope.enter = function (value) {
      if (!$scope.readonly) {
        $scope.val = value;
      }
      $scope.onHover({ value: value });
    };
    $scope.reset = function () {
      $scope.val = angular.copy($scope.value);
      $scope.onLeave();
    };
    $scope.$watch('value', function (value) {
      $scope.val = value;
    });
    $scope.readonly = false;
    if ($attrs.readonly) {
      $scope.$parent.$watch($parse($attrs.readonly), function (value) {
        $scope.readonly = !!value;
      });
    }
  }
]).directive('rating', function () {
  return {
    restrict: 'EA',
    scope: {
      value: '=',
      onHover: '&',
      onLeave: '&'
    },
    controller: 'RatingController',
    templateUrl: 'template/rating/rating.html',
    replace: true
  };
});
angular.module('ui.bootstrap.tabs', []).directive('tabs', function () {
  return function () {
    throw new Error('The `tabs` directive is deprecated, please migrate to `tabset`. Instructions can be found at http://github.com/angular-ui/bootstrap/tree/master/CHANGELOG.md');
  };
}).controller('TabsetController', [
  '$scope',
  '$element',
  function TabsetCtrl($scope, $element) {
    var ctrl = this, tabs = ctrl.tabs = $scope.tabs = [];
    ctrl.select = function (tab) {
      angular.forEach(tabs, function (tab) {
        tab.active = false;
      });
      tab.active = true;
    };
    ctrl.addTab = function addTab(tab) {
      tabs.push(tab);
      if (tabs.length === 1 || tab.active) {
        ctrl.select(tab);
      }
    };
    ctrl.removeTab = function removeTab(tab) {
      var index = tabs.indexOf(tab);
      if (tab.active && tabs.length > 1) {
        var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
        ctrl.select(tabs[newActiveIndex]);
      }
      tabs.splice(index, 1);
    };
  }
]).directive('tabset', function () {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    require: '^tabset',
    scope: {},
    controller: 'TabsetController',
    templateUrl: 'template/tabs/tabset.html',
    compile: function (elm, attrs, transclude) {
      return function (scope, element, attrs, tabsetCtrl) {
        scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
        scope.type = angular.isDefined(attrs.type) ? scope.$parent.$eval(attrs.type) : 'tabs';
        scope.direction = angular.isDefined(attrs.direction) ? scope.$parent.$eval(attrs.direction) : 'top';
        scope.tabsAbove = scope.direction != 'below';
        tabsetCtrl.$scope = scope;
        tabsetCtrl.$transcludeFn = transclude;
      };
    }
  };
}).directive('tab', [
  '$parse',
  '$http',
  '$templateCache',
  '$compile',
  function ($parse, $http, $templateCache, $compile) {
    return {
      require: '^tabset',
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/tabs/tab.html',
      transclude: true,
      scope: {
        heading: '@',
        onSelect: '&select',
        onDeselect: '&deselect'
      },
      controller: function () {
      },
      compile: function (elm, attrs, transclude) {
        return function postLink(scope, elm, attrs, tabsetCtrl) {
          var getActive, setActive;
          if (attrs.active) {
            getActive = $parse(attrs.active);
            setActive = getActive.assign;
            scope.$parent.$watch(getActive, function updateActive(value) {
              scope.active = !!value;
            });
            scope.active = getActive(scope.$parent);
          } else {
            setActive = getActive = angular.noop;
          }
          scope.$watch('active', function (active) {
            setActive(scope.$parent, active);
            if (active) {
              tabsetCtrl.select(scope);
              scope.onSelect();
            } else {
              scope.onDeselect();
            }
          });
          scope.disabled = false;
          if (attrs.disabled) {
            scope.$parent.$watch($parse(attrs.disabled), function (value) {
              scope.disabled = !!value;
            });
          }
          scope.select = function () {
            if (!scope.disabled) {
              scope.active = true;
            }
          };
          tabsetCtrl.addTab(scope);
          scope.$on('$destroy', function () {
            tabsetCtrl.removeTab(scope);
          });
          if (scope.active) {
            setActive(scope.$parent, true);
          }
          scope.$transcludeFn = transclude;
        };
      }
    };
  }
]).directive('tabHeadingTransclude', [function () {
    return {
      restrict: 'A',
      require: '^tab',
      link: function (scope, elm, attrs, tabCtrl) {
        scope.$watch('headingElement', function updateHeadingElement(heading) {
          if (heading) {
            elm.html('');
            elm.append(heading);
          }
        });
      }
    };
  }]).directive('tabContentTransclude', [
  '$compile',
  '$parse',
  function ($compile, $parse) {
    return {
      restrict: 'A',
      require: '^tabset',
      link: function (scope, elm, attrs) {
        var tab = scope.$eval(attrs.tabContentTransclude);
        tab.$transcludeFn(tab.$parent, function (contents) {
          angular.forEach(contents, function (node) {
            if (isTabHeading(node)) {
              tab.headingElement = node;
            } else {
              elm.append(node);
            }
          });
        });
      }
    };
    function isTabHeading(node) {
      return node.tagName && (node.hasAttribute('tab-heading') || node.hasAttribute('data-tab-heading') || node.tagName.toLowerCase() === 'tab-heading' || node.tagName.toLowerCase() === 'data-tab-heading');
    }
  }
]).directive('tabsetTitles', [
  '$http',
  function ($http) {
    return {
      restrict: 'A',
      require: '^tabset',
      templateUrl: 'template/tabs/tabset-titles.html',
      replace: true,
      link: function (scope, elm, attrs, tabsetCtrl) {
        if (!scope.$eval(attrs.tabsetTitles)) {
          elm.remove();
        } else {
          tabsetCtrl.$transcludeFn(tabsetCtrl.$scope.$parent, function (node) {
            elm.append(node);
          });
        }
      }
    };
  }
]);
;
angular.module('ui.bootstrap.timepicker', []).constant('timepickerConfig', {
  hourStep: 1,
  minuteStep: 1,
  showMeridian: true,
  meridians: [
    'AM',
    'PM'
  ],
  readonlyInput: false,
  mousewheel: true
}).directive('timepicker', [
  '$parse',
  '$log',
  'timepickerConfig',
  function ($parse, $log, timepickerConfig) {
    return {
      restrict: 'EA',
      require: '?^ngModel',
      replace: true,
      scope: {},
      templateUrl: 'template/timepicker/timepicker.html',
      link: function (scope, element, attrs, ngModel) {
        if (!ngModel) {
          return;
        }
        var selected = new Date(), meridians = timepickerConfig.meridians;
        var hourStep = timepickerConfig.hourStep;
        if (attrs.hourStep) {
          scope.$parent.$watch($parse(attrs.hourStep), function (value) {
            hourStep = parseInt(value, 10);
          });
        }
        var minuteStep = timepickerConfig.minuteStep;
        if (attrs.minuteStep) {
          scope.$parent.$watch($parse(attrs.minuteStep), function (value) {
            minuteStep = parseInt(value, 10);
          });
        }
        scope.showMeridian = timepickerConfig.showMeridian;
        if (attrs.showMeridian) {
          scope.$parent.$watch($parse(attrs.showMeridian), function (value) {
            scope.showMeridian = !!value;
            if (ngModel.$error.time) {
              var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
              if (angular.isDefined(hours) && angular.isDefined(minutes)) {
                selected.setHours(hours);
                refresh();
              }
            } else {
              updateTemplate();
            }
          });
        }
        function getHoursFromTemplate() {
          var hours = parseInt(scope.hours, 10);
          var valid = scope.showMeridian ? hours > 0 && hours < 13 : hours >= 0 && hours < 24;
          if (!valid) {
            return undefined;
          }
          if (scope.showMeridian) {
            if (hours === 12) {
              hours = 0;
            }
            if (scope.meridian === meridians[1]) {
              hours = hours + 12;
            }
          }
          return hours;
        }
        function getMinutesFromTemplate() {
          var minutes = parseInt(scope.minutes, 10);
          return minutes >= 0 && minutes < 60 ? minutes : undefined;
        }
        function pad(value) {
          return angular.isDefined(value) && value.toString().length < 2 ? '0' + value : value;
        }
        var inputs = element.find('input'), hoursInputEl = inputs.eq(0), minutesInputEl = inputs.eq(1);
        var mousewheel = angular.isDefined(attrs.mousewheel) ? scope.$eval(attrs.mousewheel) : timepickerConfig.mousewheel;
        if (mousewheel) {
          var isScrollingUp = function (e) {
            if (e.originalEvent) {
              e = e.originalEvent;
            }
            var delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
            return e.detail || delta > 0;
          };
          hoursInputEl.bind('mousewheel wheel', function (e) {
            scope.$apply(isScrollingUp(e) ? scope.incrementHours() : scope.decrementHours());
            e.preventDefault();
          });
          minutesInputEl.bind('mousewheel wheel', function (e) {
            scope.$apply(isScrollingUp(e) ? scope.incrementMinutes() : scope.decrementMinutes());
            e.preventDefault();
          });
        }
        scope.readonlyInput = angular.isDefined(attrs.readonlyInput) ? scope.$eval(attrs.readonlyInput) : timepickerConfig.readonlyInput;
        if (!scope.readonlyInput) {
          var invalidate = function (invalidHours, invalidMinutes) {
            ngModel.$setViewValue(null);
            ngModel.$setValidity('time', false);
            if (angular.isDefined(invalidHours)) {
              scope.invalidHours = invalidHours;
            }
            if (angular.isDefined(invalidMinutes)) {
              scope.invalidMinutes = invalidMinutes;
            }
          };
          scope.updateHours = function () {
            var hours = getHoursFromTemplate();
            if (angular.isDefined(hours)) {
              selected.setHours(hours);
              refresh('h');
            } else {
              invalidate(true);
            }
          };
          hoursInputEl.bind('blur', function (e) {
            if (!scope.validHours && scope.hours < 10) {
              scope.$apply(function () {
                scope.hours = pad(scope.hours);
              });
            }
          });
          scope.updateMinutes = function () {
            var minutes = getMinutesFromTemplate();
            if (angular.isDefined(minutes)) {
              selected.setMinutes(minutes);
              refresh('m');
            } else {
              invalidate(undefined, true);
            }
          };
          minutesInputEl.bind('blur', function (e) {
            if (!scope.invalidMinutes && scope.minutes < 10) {
              scope.$apply(function () {
                scope.minutes = pad(scope.minutes);
              });
            }
          });
        } else {
          scope.updateHours = angular.noop;
          scope.updateMinutes = angular.noop;
        }
        ngModel.$render = function () {
          var date = ngModel.$modelValue ? new Date(ngModel.$modelValue) : null;
          if (isNaN(date)) {
            ngModel.$setValidity('time', false);
            $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
          } else {
            if (date) {
              selected = date;
            }
            makeValid();
            updateTemplate();
          }
        };
        function refresh(keyboardChange) {
          makeValid();
          ngModel.$setViewValue(new Date(selected));
          updateTemplate(keyboardChange);
        }
        function makeValid() {
          ngModel.$setValidity('time', true);
          scope.invalidHours = false;
          scope.invalidMinutes = false;
        }
        function updateTemplate(keyboardChange) {
          var hours = selected.getHours(), minutes = selected.getMinutes();
          if (scope.showMeridian) {
            hours = hours === 0 || hours === 12 ? 12 : hours % 12;
          }
          scope.hours = keyboardChange === 'h' ? hours : pad(hours);
          scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
          scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
        }
        function addMinutes(minutes) {
          var dt = new Date(selected.getTime() + minutes * 60000);
          selected.setHours(dt.getHours(), dt.getMinutes());
          refresh();
        }
        scope.incrementHours = function () {
          addMinutes(hourStep * 60);
        };
        scope.decrementHours = function () {
          addMinutes(-hourStep * 60);
        };
        scope.incrementMinutes = function () {
          addMinutes(minuteStep);
        };
        scope.decrementMinutes = function () {
          addMinutes(-minuteStep);
        };
        scope.toggleMeridian = function () {
          addMinutes(12 * 60 * (selected.getHours() < 12 ? 1 : -1));
        };
      }
    };
  }
]);
angular.module('ui.bootstrap.typeahead', [
  'ui.bootstrap.position',
  'ui.bootstrap.bindHtml'
]).factory('typeaheadParser', [
  '$parse',
  function ($parse) {
    var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;
    return {
      parse: function (input) {
        var match = input.match(TYPEAHEAD_REGEXP), modelMapper, viewMapper, source;
        if (!match) {
          throw new Error('Expected typeahead specification in form of \'_modelValue_ (as _label_)? for _item_ in _collection_\'' + ' but got \'' + input + '\'.');
        }
        return {
          itemName: match[3],
          source: $parse(match[4]),
          viewMapper: $parse(match[2] || match[1]),
          modelMapper: $parse(match[1])
        };
      }
    };
  }
]).directive('typeahead', [
  '$compile',
  '$parse',
  '$q',
  '$timeout',
  '$document',
  '$position',
  'typeaheadParser',
  function ($compile, $parse, $q, $timeout, $document, $position, typeaheadParser) {
    var HOT_KEYS = [
        9,
        13,
        27,
        38,
        40
      ];
    return {
      require: 'ngModel',
      link: function (originalScope, element, attrs, modelCtrl) {
        var minSearch = originalScope.$eval(attrs.typeaheadMinLength) || 1;
        var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;
        var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;
        var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;
        var onSelectCallback = $parse(attrs.typeaheadOnSelect);
        var inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : undefined;
        var $setModelValue = $parse(attrs.ngModel).assign;
        var parserResult = typeaheadParser.parse(attrs.typeahead);
        var popUpEl = angular.element('<typeahead-popup></typeahead-popup>');
        popUpEl.attr({
          matches: 'matches',
          active: 'activeIdx',
          select: 'select(activeIdx)',
          query: 'query',
          position: 'position'
        });
        if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
          popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
        }
        var scope = originalScope.$new();
        originalScope.$on('$destroy', function () {
          scope.$destroy();
        });
        var resetMatches = function () {
          scope.matches = [];
          scope.activeIdx = -1;
        };
        var getMatchesAsync = function (inputValue) {
          var locals = { $viewValue: inputValue };
          isLoadingSetter(originalScope, true);
          $q.when(parserResult.source(scope, locals)).then(function (matches) {
            if (inputValue === modelCtrl.$viewValue) {
              if (matches.length > 0) {
                scope.activeIdx = 0;
                scope.matches.length = 0;
                for (var i = 0; i < matches.length; i++) {
                  locals[parserResult.itemName] = matches[i];
                  scope.matches.push({
                    label: parserResult.viewMapper(scope, locals),
                    model: matches[i]
                  });
                }
                scope.query = inputValue;
                scope.position = $position.position(element);
                scope.position.top = scope.position.top + element.prop('offsetHeight');
              } else {
                resetMatches();
              }
              isLoadingSetter(originalScope, false);
            }
          }, function () {
            resetMatches();
            isLoadingSetter(originalScope, false);
          });
        };
        resetMatches();
        scope.query = undefined;
        var timeoutPromise;
        modelCtrl.$parsers.unshift(function (inputValue) {
          resetMatches();
          if (inputValue && inputValue.length >= minSearch) {
            if (waitTime > 0) {
              if (timeoutPromise) {
                $timeout.cancel(timeoutPromise);
              }
              timeoutPromise = $timeout(function () {
                getMatchesAsync(inputValue);
              }, waitTime);
            } else {
              getMatchesAsync(inputValue);
            }
          }
          if (isEditable) {
            return inputValue;
          } else {
            modelCtrl.$setValidity('editable', false);
            return undefined;
          }
        });
        modelCtrl.$formatters.push(function (modelValue) {
          var candidateViewValue, emptyViewValue;
          var locals = {};
          if (inputFormatter) {
            locals['$model'] = modelValue;
            return inputFormatter(originalScope, locals);
          } else {
            locals[parserResult.itemName] = modelValue;
            candidateViewValue = parserResult.viewMapper(originalScope, locals);
            locals[parserResult.itemName] = undefined;
            emptyViewValue = parserResult.viewMapper(originalScope, locals);
            return candidateViewValue !== emptyViewValue ? candidateViewValue : modelValue;
          }
        });
        scope.select = function (activeIdx) {
          var locals = {};
          var model, item;
          locals[parserResult.itemName] = item = scope.matches[activeIdx].model;
          model = parserResult.modelMapper(originalScope, locals);
          $setModelValue(originalScope, model);
          modelCtrl.$setValidity('editable', true);
          onSelectCallback(originalScope, {
            $item: item,
            $model: model,
            $label: parserResult.viewMapper(originalScope, locals)
          });
          resetMatches();
          element[0].focus();
        };
        element.bind('keydown', function (evt) {
          if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
            return;
          }
          evt.preventDefault();
          if (evt.which === 40) {
            scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
            scope.$digest();
          } else if (evt.which === 38) {
            scope.activeIdx = (scope.activeIdx ? scope.activeIdx : scope.matches.length) - 1;
            scope.$digest();
          } else if (evt.which === 13 || evt.which === 9) {
            scope.$apply(function () {
              scope.select(scope.activeIdx);
            });
          } else if (evt.which === 27) {
            evt.stopPropagation();
            resetMatches();
            scope.$digest();
          }
        });
        var dismissClickHandler = function (evt) {
          if (element[0] !== evt.target) {
            resetMatches();
            scope.$digest();
          }
        };
        $document.bind('click', dismissClickHandler);
        originalScope.$on('$destroy', function () {
          $document.unbind('click', dismissClickHandler);
        });
        element.after($compile(popUpEl)(scope));
      }
    };
  }
]).directive('typeaheadPopup', function () {
  return {
    restrict: 'E',
    scope: {
      matches: '=',
      query: '=',
      active: '=',
      position: '=',
      select: '&'
    },
    replace: true,
    templateUrl: 'template/typeahead/typeahead-popup.html',
    link: function (scope, element, attrs) {
      scope.templateUrl = attrs.templateUrl;
      scope.isOpen = function () {
        return scope.matches.length > 0;
      };
      scope.isActive = function (matchIdx) {
        return scope.active == matchIdx;
      };
      scope.selectActive = function (matchIdx) {
        scope.active = matchIdx;
      };
      scope.selectMatch = function (activeIdx) {
        scope.select({ activeIdx: activeIdx });
      };
    }
  };
}).directive('typeaheadMatch', [
  '$http',
  '$templateCache',
  '$compile',
  '$parse',
  function ($http, $templateCache, $compile, $parse) {
    return {
      restrict: 'E',
      scope: {
        index: '=',
        match: '=',
        query: '='
      },
      link: function (scope, element, attrs) {
        var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || 'template/typeahead/typeahead-match.html';
        $http.get(tplUrl, { cache: $templateCache }).success(function (tplContent) {
          element.replaceWith($compile(tplContent.trim())(scope));
        });
      }
    };
  }
]).filter('typeaheadHighlight', function () {
  function escapeRegexp(queryToEscape) {
    return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
  }
  return function (matchItem, query) {
    return query ? matchItem.replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : matchItem;
  };
});
var Showdown = { extensions: {} }, forEach = Showdown.forEach = function (a, b) {
    if (typeof a.forEach == 'function')
      a.forEach(b);
    else {
      var c, d = a.length;
      for (c = 0; c < d; c++)
        b(a[c], c, a);
    }
  }, stdExtName = function (a) {
    return a.replace(/[_-]||\s/g, '').toLowerCase();
  };
Showdown.converter = function (a) {
  var b, c, d, e = 0, f = [], g = [];
  if (typeof module != 'undefind' && typeof exports != 'undefined' && typeof require != 'undefind') {
    var h = require('fs');
    if (h) {
      var i = h.readdirSync((__dirname || '.') + '/extensions').filter(function (a) {
          return ~a.indexOf('.js');
        }).map(function (a) {
          return a.replace(/\.js$/, '');
        });
      Showdown.forEach(i, function (a) {
        var b = stdExtName(a);
        Showdown.extensions[b] = require('./extensions/' + a);
      });
    }
  }
  a && a.extensions && Showdown.forEach(a.extensions, function (a) {
    typeof a == 'string' && (a = Showdown.extensions[stdExtName(a)]);
    if (typeof a != 'function')
      throw 'Extension \'' + a + '\' could not be loaded.  It was either not found or is not a valid extension.';
    Showdown.forEach(a(this), function (a) {
      a.type ? a.type === 'language' || a.type === 'lang' ? f.push(a) : (a.type === 'output' || a.type === 'html') && g.push(a) : g.push(a);
    });
  }), this.makeHtml = function (a) {
    return b = {}, c = {}, d = [], a = a.replace(/~/g, '~T'), a = a.replace(/\$/g, '~D'), a = a.replace(/\r\n/g, '\n'), a = a.replace(/\r/g, '\n'), a = '\n\n' + a + '\n\n', a = L(a), a = a.replace(/^[ \t]+$/gm, ''), Showdown.forEach(f, function (b) {
      a = j(b, a);
    }), a = y(a), a = l(a), a = k(a), a = n(a), a = J(a), a = a.replace(/~D/g, '$$'), a = a.replace(/~T/g, '~'), Showdown.forEach(g, function (b) {
      a = j(b, a);
    }), a;
  };
  var j = function (a, b) {
      if (a.regex) {
        var c = new RegExp(a.regex, 'g');
        return b.replace(c, a.replace);
      }
      if (a.filter)
        return a.filter(b);
    }, k = function (a) {
      return a += '~0', a = a.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|(?=~0))/gm, function (a, d, e, f, g) {
        return d = d.toLowerCase(), b[d] = F(e), f ? f + g : (g && (c[d] = g.replace(/"/g, '&quot;')), '');
      }), a = a.replace(/~0/, ''), a;
    }, l = function (a) {
      a = a.replace(/\n/g, '\n\n');
      var b = 'p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del|style|section|header|footer|nav|article|aside', c = 'p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside';
      return a = a.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, m), a = a.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside)\b[^\r]*?<\/\2>[ \t]*(?=\n+)\n)/gm, m), a = a.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, m), a = a.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g, m), a = a.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, m), a = a.replace(/\n\n/g, '\n'), a;
    }, m = function (a, b) {
      var c = b;
      return c = c.replace(/\n\n/g, '\n'), c = c.replace(/^\n/, ''), c = c.replace(/\n+$/g, ''), c = '\n\n~K' + (d.push(c) - 1) + 'K\n\n', c;
    }, n = function (a) {
      a = u(a);
      var b = z('<hr />');
      return a = a.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, b), a = a.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm, b), a = a.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm, b), a = w(a), a = x(a), a = D(a), a = l(a), a = E(a), a;
    }, o = function (a) {
      return a = A(a), a = p(a), a = G(a), a = s(a), a = q(a), a = H(a), a = F(a), a = C(a), a = a.replace(/  +\n/g, ' <br />\n'), a;
    }, p = function (a) {
      var b = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;
      return a = a.replace(b, function (a) {
        var b = a.replace(/(.)<\/?code>(?=.)/g, '$1`');
        return b = M(b, '\\`*_'), b;
      }), a;
    }, q = function (a) {
      return a = a.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, r), a = a.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?(?:\(.*?\).*?)?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, r), a = a.replace(/(\[([^\[\]]+)\])()()()()()/g, r), a;
    }, r = function (a, d, e, f, g, h, i, j) {
      j == undefined && (j = '');
      var k = d, l = e, m = f.toLowerCase(), n = g, o = j;
      if (n == '') {
        m == '' && (m = l.toLowerCase().replace(/ ?\n/g, ' ')), n = '#' + m;
        if (b[m] != undefined)
          n = b[m], c[m] != undefined && (o = c[m]);
        else {
          if (!(k.search(/\(\s*\)$/m) > -1))
            return k;
          n = '';
        }
      }
      n = M(n, '*_');
      var p = '<a href="' + n + '"';
      return o != '' && (o = o.replace(/"/g, '&quot;'), o = M(o, '*_'), p += ' title="' + o + '"'), p += '>' + l + '</a>', p;
    }, s = function (a) {
      return a = a.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, t), a = a.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, t), a;
    }, t = function (a, d, e, f, g, h, i, j) {
      var k = d, l = e, m = f.toLowerCase(), n = g, o = j;
      o || (o = '');
      if (n == '') {
        m == '' && (m = l.toLowerCase().replace(/ ?\n/g, ' ')), n = '#' + m;
        if (b[m] == undefined)
          return k;
        n = b[m], c[m] != undefined && (o = c[m]);
      }
      l = l.replace(/"/g, '&quot;'), n = M(n, '*_');
      var p = '<img src="' + n + '" alt="' + l + '"';
      return o = o.replace(/"/g, '&quot;'), o = M(o, '*_'), p += ' title="' + o + '"', p += ' />', p;
    }, u = function (a) {
      function b(a) {
        return a.replace(/[^\w]/g, '').toLowerCase();
      }
      return a = a.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm, function (a, c) {
        return z('<h1 id="' + b(c) + '">' + o(c) + '</h1>');
      }), a = a.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm, function (a, c) {
        return z('<h2 id="' + b(c) + '">' + o(c) + '</h2>');
      }), a = a.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm, function (a, c, d) {
        var e = c.length;
        return z('<h' + e + ' id="' + b(d) + '">' + o(d) + '</h' + e + '>');
      }), a;
    }, v, w = function (a) {
      a += '~0';
      var b = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;
      return e ? a = a.replace(b, function (a, b, c) {
        var d = b, e = c.search(/[*+-]/g) > -1 ? 'ul' : 'ol';
        d = d.replace(/\n{2,}/g, '\n\n\n');
        var f = v(d);
        return f = f.replace(/\s+$/, ''), f = '<' + e + '>' + f + '</' + e + '>\n', f;
      }) : (b = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g, a = a.replace(b, function (a, b, c, d) {
        var e = b, f = c, g = d.search(/[*+-]/g) > -1 ? 'ul' : 'ol', f = f.replace(/\n{2,}/g, '\n\n\n'), h = v(f);
        return h = e + '<' + g + '>\n' + h + '</' + g + '>\n', h;
      })), a = a.replace(/~0/, ''), a;
    };
  v = function (a) {
    return e++, a = a.replace(/\n{2,}$/, '\n'), a += '~0', a = a.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm, function (a, b, c, d, e) {
      var f = e, g = b, h = c;
      return g || f.search(/\n{2,}/) > -1 ? f = n(K(f)) : (f = w(K(f)), f = f.replace(/\n$/, ''), f = o(f)), '<li>' + f + '</li>\n';
    }), a = a.replace(/~0/g, ''), e--, a;
  };
  var x = function (a) {
      return a += '~0', a = a.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g, function (a, b, c) {
        var d = b, e = c;
        return d = B(K(d)), d = L(d), d = d.replace(/^\n+/g, ''), d = d.replace(/\n+$/g, ''), d = '<pre><code>' + d + '\n</code></pre>', z(d) + e;
      }), a = a.replace(/~0/, ''), a;
    }, y = function (a) {
      return a += '~0', a = a.replace(/(?:^|\n)```(.*)\n([\s\S]*?)\n```/g, function (a, b, c) {
        var d = b, e = c;
        return e = B(e), e = L(e), e = e.replace(/^\n+/g, ''), e = e.replace(/\n+$/g, ''), e = '<pre><code' + (d ? ' class="' + d + '"' : '') + '>' + e + '\n</code></pre>', z(e);
      }), a = a.replace(/~0/, ''), a;
    }, z = function (a) {
      return a = a.replace(/(^\n+|\n+$)/g, ''), '\n\n~K' + (d.push(a) - 1) + 'K\n\n';
    }, A = function (a) {
      return a = a.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm, function (a, b, c, d, e) {
        var f = d;
        return f = f.replace(/^([ \t]*)/g, ''), f = f.replace(/[ \t]*$/g, ''), f = B(f), b + '<code>' + f + '</code>';
      }), a;
    }, B = function (a) {
      return a = a.replace(/&/g, '&amp;'), a = a.replace(/</g, '&lt;'), a = a.replace(/>/g, '&gt;'), a = M(a, '*_{}[]\\', !1), a;
    }, C = function (a) {
      return a = a.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g, '<strong>$2</strong>'), a = a.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g, '<em>$2</em>'), a;
    }, D = function (a) {
      return a = a.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm, function (a, b) {
        var c = b;
        return c = c.replace(/^[ \t]*>[ \t]?/gm, '~0'), c = c.replace(/~0/g, ''), c = c.replace(/^[ \t]+$/gm, ''), c = n(c), c = c.replace(/(^|\n)/g, '$1  '), c = c.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function (a, b) {
          var c = b;
          return c = c.replace(/^  /gm, '~0'), c = c.replace(/~0/g, ''), c;
        }), z('<blockquote>\n' + c + '\n</blockquote>');
      }), a;
    }, E = function (a) {
      a = a.replace(/^\n+/g, ''), a = a.replace(/\n+$/g, '');
      var b = a.split(/\n{2,}/g), c = [], e = b.length;
      for (var f = 0; f < e; f++) {
        var g = b[f];
        g.search(/~K(\d+)K/g) >= 0 ? c.push(g) : g.search(/\S/) >= 0 && (g = o(g), g = g.replace(/^([ \t]*)/g, '<p>'), g += '</p>', c.push(g));
      }
      e = c.length;
      for (var f = 0; f < e; f++)
        while (c[f].search(/~K(\d+)K/) >= 0) {
          var h = d[RegExp.$1];
          h = h.replace(/\$/g, '$$$$'), c[f] = c[f].replace(/~K\d+K/, h);
        }
      return c.join('\n\n');
    }, F = function (a) {
      return a = a.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, '&amp;'), a = a.replace(/<(?![a-z\/?\$!])/gi, '&lt;'), a;
    }, G = function (a) {
      return a = a.replace(/\\(\\)/g, N), a = a.replace(/\\([`*_{}\[\]()>#+-.!])/g, N), a;
    }, H = function (a) {
      return a = a.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi, '<a href="$1">$1</a>'), a = a.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi, function (a, b) {
        return I(J(b));
      }), a;
    }, I = function (a) {
      var b = [
          function (a) {
            return '&#' + a.charCodeAt(0) + ';';
          },
          function (a) {
            return '&#x' + a.charCodeAt(0).toString(16) + ';';
          },
          function (a) {
            return a;
          }
        ];
      return a = 'mailto:' + a, a = a.replace(/./g, function (a) {
        if (a == '@')
          a = b[Math.floor(Math.random() * 2)](a);
        else if (a != ':') {
          var c = Math.random();
          a = c > 0.9 ? b[2](a) : c > 0.45 ? b[1](a) : b[0](a);
        }
        return a;
      }), a = '<a href="' + a + '">' + a + '</a>', a = a.replace(/">.+:/g, '">'), a;
    }, J = function (a) {
      return a = a.replace(/~E(\d+)E/g, function (a, b) {
        var c = parseInt(b);
        return String.fromCharCode(c);
      }), a;
    }, K = function (a) {
      return a = a.replace(/^(\t|[ ]{1,4})/gm, '~0'), a = a.replace(/~0/g, ''), a;
    }, L = function (a) {
      return a = a.replace(/\t(?=\t)/g, '    '), a = a.replace(/\t/g, '~A~B'), a = a.replace(/~B(.+?)~A/g, function (a, b, c) {
        var d = b, e = 4 - d.length % 4;
        for (var f = 0; f < e; f++)
          d += ' ';
        return d;
      }), a = a.replace(/~A/g, '    '), a = a.replace(/~B/g, ''), a;
    }, M = function (a, b, c) {
      var d = '([' + b.replace(/([\[\]\\])/g, '\\$1') + '])';
      c && (d = '\\\\' + d);
      var e = new RegExp(d, 'g');
      return a = a.replace(e, N), a;
    }, N = function (a, b) {
      var c = b.charCodeAt(0);
      return '~E' + c + 'E';
    };
}, typeof module != 'undefined' && (module.exports = Showdown), typeof define == 'function' && define.amd && define('showdown', function () {
  return Showdown;
});
'use strict';
angular.module('btford.markdown', []).directive('btfMarkdown', function () {
  var converter = new Showdown.converter();
  return {
    restrict: 'AE',
    link: function (scope, element, attrs) {
      if (attrs.btfMarkdown) {
        scope.$watch(attrs.btfMarkdown, function (newVal) {
          var html = converter.makeHtml(newVal);
          element.html(html);
        });
      } else {
        var html = converter.makeHtml(element.text());
        element.html(html);
      }
    }
  };
});
angular.module('monospaced.elastic', []).constant('msdElasticConfig', { append: '' }).directive('msdElastic', [
  '$timeout',
  '$window',
  'msdElasticConfig',
  function ($timeout, $window, config) {
    'use strict';
    return {
      require: 'ngModel',
      restrict: 'A, C',
      link: function (scope, element, attrs, ngModel) {
        var ta = element[0], $ta = element;
        if (ta.nodeName !== 'TEXTAREA' || !$window.getComputedStyle) {
          return;
        }
        $ta.css({
          'overflow': 'hidden',
          'overflow-y': 'hidden',
          'word-wrap': 'break-word'
        });
        var text = ta.value;
        ta.value = '';
        ta.value = text;
        var appendText = attrs.msdElastic || config.append, append = appendText === '\\n' ? '\n' : appendText, $win = angular.element($window), $mirror = angular.element('<textarea tabindex="-1" style="position: absolute; ' + 'top: -999px; right: auto; bottom: auto; left: 0 ;' + 'overflow: hidden; -webkit-box-sizing: content-box; ' + '-moz-box-sizing: content-box; box-sizing: content-box; ' + 'min-height: 0!important; height: 0!important; padding: 0;' + 'word-wrap: break-word; border: 0;"/>').data('elastic', true), mirror = $mirror[0], taStyle = getComputedStyle(ta), resize = taStyle.getPropertyValue('resize'), borderBox = taStyle.getPropertyValue('box-sizing') === 'border-box' || taStyle.getPropertyValue('-moz-box-sizing') === 'border-box' || taStyle.getPropertyValue('-webkit-box-sizing') === 'border-box', boxOuter = !borderBox ? {
            width: 0,
            height: 0
          } : {
            width: parseInt(taStyle.getPropertyValue('border-right-width'), 10) + parseInt(taStyle.getPropertyValue('padding-right'), 10) + parseInt(taStyle.getPropertyValue('padding-left'), 10) + parseInt(taStyle.getPropertyValue('border-left-width'), 10),
            height: parseInt(taStyle.getPropertyValue('border-top-width'), 10) + parseInt(taStyle.getPropertyValue('padding-top'), 10) + parseInt(taStyle.getPropertyValue('padding-bottom'), 10) + parseInt(taStyle.getPropertyValue('border-bottom-width'), 10)
          }, minHeightValue = parseInt(taStyle.getPropertyValue('min-height'), 10), heightValue = parseInt(taStyle.getPropertyValue('height'), 10), minHeight = Math.max(minHeightValue, heightValue) - boxOuter.height, maxHeight = parseInt(taStyle.getPropertyValue('max-height'), 10), mirrored, active, copyStyle = [
            'font-family',
            'font-size',
            'font-weight',
            'font-style',
            'letter-spacing',
            'line-height',
            'text-transform',
            'word-spacing',
            'text-indent'
          ];
        if ($ta.data('elastic')) {
          return;
        }
        maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 90000;
        if (mirror.parentNode !== document.body) {
          angular.element(document.body).append(mirror);
        }
        $ta.css({ 'resize': resize === 'none' || resize === 'vertical' ? 'none' : 'horizontal' }).data('elastic', true);
        function initMirror() {
          mirrored = ta;
          taStyle = getComputedStyle(ta);
          angular.forEach(copyStyle, function (val) {
            mirror.style[val] = taStyle.getPropertyValue(val);
          });
        }
        function adjust() {
          var taHeight, mirrorHeight, width, overflow;
          if (mirrored !== ta) {
            initMirror();
          }
          if (!active) {
            active = true;
            mirror.value = ta.value + append;
            mirror.style.overflowY = ta.style.overflowY;
            taHeight = ta.style.height === '' ? 'auto' : parseInt(ta.style.height, 10);
            width = parseInt(borderBox ? ta.offsetWidth : getComputedStyle(ta).getPropertyValue('width'), 10) - boxOuter.width;
            mirror.style.width = width + 'px';
            mirrorHeight = mirror.scrollHeight;
            if (mirrorHeight > maxHeight) {
              mirrorHeight = maxHeight;
              overflow = 'scroll';
            } else if (mirrorHeight < minHeight) {
              mirrorHeight = minHeight;
            }
            mirrorHeight += boxOuter.height;
            ta.style.overflowY = overflow || 'hidden';
            if (taHeight !== mirrorHeight) {
              ta.style.height = mirrorHeight + 'px';
            }
            $timeout(function () {
              active = false;
            }, 1);
          }
        }
        function forceAdjust() {
          active = false;
          adjust();
        }
        if ('onpropertychange' in ta && 'oninput' in ta) {
          ta['oninput'] = ta.onkeyup = adjust;
        } else {
          ta['oninput'] = adjust;
        }
        $win.bind('resize', forceAdjust);
        scope.$watch(function () {
          return ngModel.$modelValue;
        }, function (newValue) {
          forceAdjust();
        });
        scope.$on('$destroy', function () {
          $mirror.remove();
          $win.unbind('resize', forceAdjust);
        });
      }
    };
  }
]);
(function (undefined) {
  var moment, VERSION = '2.3.1', round = Math.round, i, YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6, languages = {}, hasModule = typeof module !== 'undefined' && module.exports, aspNetJsonRegex = /^\/?Date\((\-?\d+)/i, aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/, isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/, formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, parseTokenOneOrTwoDigits = /\d\d?/, parseTokenOneToThreeDigits = /\d{1,3}/, parseTokenThreeDigits = /\d{3}/, parseTokenFourDigits = /\d{1,4}/, parseTokenSixDigits = /[+\-]?\d{1,6}/, parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, parseTokenT = /T/i, parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, isoRegex = /^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?$/, isoFormat = 'YYYY-MM-DDTHH:mm:ssZ', isoDates = [
      'YYYY-MM-DD',
      'GGGG-[W]WW',
      'GGGG-[W]WW-E',
      'YYYY-DDD'
    ], isoTimes = [
      [
        'HH:mm:ss.S',
        /(T| )\d\d:\d\d:\d\d\.\d{1,3}/
      ],
      [
        'HH:mm:ss',
        /(T| )\d\d:\d\d:\d\d/
      ],
      [
        'HH:mm',
        /(T| )\d\d:\d\d/
      ],
      [
        'HH',
        /(T| )\d\d/
      ]
    ], parseTimezoneChunker = /([\+\-]|\d\d)/gi, proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'), unitMillisecondFactors = {
      'Milliseconds': 1,
      'Seconds': 1000,
      'Minutes': 60000,
      'Hours': 3600000,
      'Days': 86400000,
      'Months': 2592000000,
      'Years': 31536000000
    }, unitAliases = {
      ms: 'millisecond',
      s: 'second',
      m: 'minute',
      h: 'hour',
      d: 'day',
      D: 'date',
      w: 'week',
      W: 'isoWeek',
      M: 'month',
      y: 'year',
      DDD: 'dayOfYear',
      e: 'weekday',
      E: 'isoWeekday',
      gg: 'weekYear',
      GG: 'isoWeekYear'
    }, camelFunctions = {
      dayofyear: 'dayOfYear',
      isoweekday: 'isoWeekday',
      isoweek: 'isoWeek',
      weekyear: 'weekYear',
      isoweekyear: 'isoWeekYear'
    }, formatFunctions = {}, ordinalizeTokens = 'DDD w W M D d'.split(' '), paddedTokens = 'M D H h m s w W'.split(' '), formatTokenFunctions = {
      M: function () {
        return this.month() + 1;
      },
      MMM: function (format) {
        return this.lang().monthsShort(this, format);
      },
      MMMM: function (format) {
        return this.lang().months(this, format);
      },
      D: function () {
        return this.date();
      },
      DDD: function () {
        return this.dayOfYear();
      },
      d: function () {
        return this.day();
      },
      dd: function (format) {
        return this.lang().weekdaysMin(this, format);
      },
      ddd: function (format) {
        return this.lang().weekdaysShort(this, format);
      },
      dddd: function (format) {
        return this.lang().weekdays(this, format);
      },
      w: function () {
        return this.week();
      },
      W: function () {
        return this.isoWeek();
      },
      YY: function () {
        return leftZeroFill(this.year() % 100, 2);
      },
      YYYY: function () {
        return leftZeroFill(this.year(), 4);
      },
      YYYYY: function () {
        return leftZeroFill(this.year(), 5);
      },
      gg: function () {
        return leftZeroFill(this.weekYear() % 100, 2);
      },
      gggg: function () {
        return this.weekYear();
      },
      ggggg: function () {
        return leftZeroFill(this.weekYear(), 5);
      },
      GG: function () {
        return leftZeroFill(this.isoWeekYear() % 100, 2);
      },
      GGGG: function () {
        return this.isoWeekYear();
      },
      GGGGG: function () {
        return leftZeroFill(this.isoWeekYear(), 5);
      },
      e: function () {
        return this.weekday();
      },
      E: function () {
        return this.isoWeekday();
      },
      a: function () {
        return this.lang().meridiem(this.hours(), this.minutes(), true);
      },
      A: function () {
        return this.lang().meridiem(this.hours(), this.minutes(), false);
      },
      H: function () {
        return this.hours();
      },
      h: function () {
        return this.hours() % 12 || 12;
      },
      m: function () {
        return this.minutes();
      },
      s: function () {
        return this.seconds();
      },
      S: function () {
        return toInt(this.milliseconds() / 100);
      },
      SS: function () {
        return leftZeroFill(toInt(this.milliseconds() / 10), 2);
      },
      SSS: function () {
        return leftZeroFill(this.milliseconds(), 3);
      },
      Z: function () {
        var a = -this.zone(), b = '+';
        if (a < 0) {
          a = -a;
          b = '-';
        }
        return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
      },
      ZZ: function () {
        var a = -this.zone(), b = '+';
        if (a < 0) {
          a = -a;
          b = '-';
        }
        return b + leftZeroFill(toInt(10 * a / 6), 4);
      },
      z: function () {
        return this.zoneAbbr();
      },
      zz: function () {
        return this.zoneName();
      },
      X: function () {
        return this.unix();
      }
    }, lists = [
      'months',
      'monthsShort',
      'weekdays',
      'weekdaysShort',
      'weekdaysMin'
    ];
  function padToken(func, count) {
    return function (a) {
      return leftZeroFill(func.call(this, a), count);
    };
  }
  function ordinalizeToken(func, period) {
    return function (a) {
      return this.lang().ordinal(func.call(this, a), period);
    };
  }
  while (ordinalizeTokens.length) {
    i = ordinalizeTokens.pop();
    formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
  }
  while (paddedTokens.length) {
    i = paddedTokens.pop();
    formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
  }
  formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
  function Language() {
  }
  function Moment(config) {
    checkOverflow(config);
    extend(this, config);
  }
  function Duration(duration) {
    var normalizedInput = normalizeObjectUnits(duration), years = normalizedInput.year || 0, months = normalizedInput.month || 0, weeks = normalizedInput.week || 0, days = normalizedInput.day || 0, hours = normalizedInput.hour || 0, minutes = normalizedInput.minute || 0, seconds = normalizedInput.second || 0, milliseconds = normalizedInput.millisecond || 0;
    this._input = duration;
    this._milliseconds = +milliseconds + seconds * 1000 + minutes * 60000 + hours * 3600000;
    this._days = +days + weeks * 7;
    this._months = +months + years * 12;
    this._data = {};
    this._bubble();
  }
  function extend(a, b) {
    for (var i in b) {
      if (b.hasOwnProperty(i)) {
        a[i] = b[i];
      }
    }
    if (b.hasOwnProperty('toString')) {
      a.toString = b.toString;
    }
    if (b.hasOwnProperty('valueOf')) {
      a.valueOf = b.valueOf;
    }
    return a;
  }
  function absRound(number) {
    if (number < 0) {
      return Math.ceil(number);
    } else {
      return Math.floor(number);
    }
  }
  function leftZeroFill(number, targetLength) {
    var output = number + '';
    while (output.length < targetLength) {
      output = '0' + output;
    }
    return output;
  }
  function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
    var milliseconds = duration._milliseconds, days = duration._days, months = duration._months, minutes, hours;
    if (milliseconds) {
      mom._d.setTime(+mom._d + milliseconds * isAdding);
    }
    if (days || months) {
      minutes = mom.minute();
      hours = mom.hour();
    }
    if (days) {
      mom.date(mom.date() + days * isAdding);
    }
    if (months) {
      mom.month(mom.month() + months * isAdding);
    }
    if (milliseconds && !ignoreUpdateOffset) {
      moment.updateOffset(mom);
    }
    if (days || months) {
      mom.minute(minutes);
      mom.hour(hours);
    }
  }
  function isArray(input) {
    return Object.prototype.toString.call(input) === '[object Array]';
  }
  function isDate(input) {
    return Object.prototype.toString.call(input) === '[object Date]';
  }
  function compareArrays(array1, array2, dontConvert) {
    var len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0, i;
    for (i = 0; i < len; i++) {
      if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
        diffs++;
      }
    }
    return diffs + lengthDiff;
  }
  function normalizeUnits(units) {
    if (units) {
      var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
      units = unitAliases[units] || camelFunctions[lowered] || lowered;
    }
    return units;
  }
  function normalizeObjectUnits(inputObject) {
    var normalizedInput = {}, normalizedProp, prop, index;
    for (prop in inputObject) {
      if (inputObject.hasOwnProperty(prop)) {
        normalizedProp = normalizeUnits(prop);
        if (normalizedProp) {
          normalizedInput[normalizedProp] = inputObject[prop];
        }
      }
    }
    return normalizedInput;
  }
  function makeList(field) {
    var count, setter;
    if (field.indexOf('week') === 0) {
      count = 7;
      setter = 'day';
    } else if (field.indexOf('month') === 0) {
      count = 12;
      setter = 'month';
    } else {
      return;
    }
    moment[field] = function (format, index) {
      var i, getter, method = moment.fn._lang[field], results = [];
      if (typeof format === 'number') {
        index = format;
        format = undefined;
      }
      getter = function (i) {
        var m = moment().utc().set(setter, i);
        return method.call(moment.fn._lang, m, format || '');
      };
      if (index != null) {
        return getter(index);
      } else {
        for (i = 0; i < count; i++) {
          results.push(getter(i));
        }
        return results;
      }
    };
  }
  function toInt(argumentForCoercion) {
    var coercedNumber = +argumentForCoercion, value = 0;
    if (coercedNumber !== 0 && isFinite(coercedNumber)) {
      if (coercedNumber >= 0) {
        value = Math.floor(coercedNumber);
      } else {
        value = Math.ceil(coercedNumber);
      }
    }
    return value;
  }
  function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  }
  function daysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
  }
  function isLeapYear(year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  }
  function checkOverflow(m) {
    var overflow;
    if (m._a && m._pf.overflow === -2) {
      overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;
      if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
        overflow = DATE;
      }
      m._pf.overflow = overflow;
    }
  }
  function initializeParsingFlags(config) {
    config._pf = {
      empty: false,
      unusedTokens: [],
      unusedInput: [],
      overflow: -2,
      charsLeftOver: 0,
      nullInput: false,
      invalidMonth: null,
      invalidFormat: false,
      userInvalidated: false
    };
  }
  function isValid(m) {
    if (m._isValid == null) {
      m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;
      if (m._strict) {
        m._isValid = m._isValid && m._pf.charsLeftOver === 0 && m._pf.unusedTokens.length === 0;
      }
    }
    return m._isValid;
  }
  function normalizeLanguage(key) {
    return key ? key.toLowerCase().replace('_', '-') : key;
  }
  extend(Language.prototype, {
    set: function (config) {
      var prop, i;
      for (i in config) {
        prop = config[i];
        if (typeof prop === 'function') {
          this[i] = prop;
        } else {
          this['_' + i] = prop;
        }
      }
    },
    _months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
    months: function (m) {
      return this._months[m.month()];
    },
    _monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
    monthsShort: function (m) {
      return this._monthsShort[m.month()];
    },
    monthsParse: function (monthName) {
      var i, mom, regex;
      if (!this._monthsParse) {
        this._monthsParse = [];
      }
      for (i = 0; i < 12; i++) {
        if (!this._monthsParse[i]) {
          mom = moment.utc([
            2000,
            i
          ]);
          regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
          this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        if (this._monthsParse[i].test(monthName)) {
          return i;
        }
      }
    },
    _weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    weekdays: function (m) {
      return this._weekdays[m.day()];
    },
    _weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    weekdaysShort: function (m) {
      return this._weekdaysShort[m.day()];
    },
    _weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
    weekdaysMin: function (m) {
      return this._weekdaysMin[m.day()];
    },
    weekdaysParse: function (weekdayName) {
      var i, mom, regex;
      if (!this._weekdaysParse) {
        this._weekdaysParse = [];
      }
      for (i = 0; i < 7; i++) {
        if (!this._weekdaysParse[i]) {
          mom = moment([
            2000,
            1
          ]).day(i);
          regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
          this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        if (this._weekdaysParse[i].test(weekdayName)) {
          return i;
        }
      }
    },
    _longDateFormat: {
      LT: 'h:mm A',
      L: 'MM/DD/YYYY',
      LL: 'MMMM D YYYY',
      LLL: 'MMMM D YYYY LT',
      LLLL: 'dddd, MMMM D YYYY LT'
    },
    longDateFormat: function (key) {
      var output = this._longDateFormat[key];
      if (!output && this._longDateFormat[key.toUpperCase()]) {
        output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
          return val.slice(1);
        });
        this._longDateFormat[key] = output;
      }
      return output;
    },
    isPM: function (input) {
      return (input + '').toLowerCase().charAt(0) === 'p';
    },
    _meridiemParse: /[ap]\.?m?\.?/i,
    meridiem: function (hours, minutes, isLower) {
      if (hours > 11) {
        return isLower ? 'pm' : 'PM';
      } else {
        return isLower ? 'am' : 'AM';
      }
    },
    _calendar: {
      sameDay: '[Today at] LT',
      nextDay: '[Tomorrow at] LT',
      nextWeek: 'dddd [at] LT',
      lastDay: '[Yesterday at] LT',
      lastWeek: '[Last] dddd [at] LT',
      sameElse: 'L'
    },
    calendar: function (key, mom) {
      var output = this._calendar[key];
      return typeof output === 'function' ? output.apply(mom) : output;
    },
    _relativeTime: {
      future: 'in %s',
      past: '%s ago',
      s: 'a few seconds',
      m: 'a minute',
      mm: '%d minutes',
      h: 'an hour',
      hh: '%d hours',
      d: 'a day',
      dd: '%d days',
      M: 'a month',
      MM: '%d months',
      y: 'a year',
      yy: '%d years'
    },
    relativeTime: function (number, withoutSuffix, string, isFuture) {
      var output = this._relativeTime[string];
      return typeof output === 'function' ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
    },
    pastFuture: function (diff, output) {
      var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
      return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
    },
    ordinal: function (number) {
      return this._ordinal.replace('%d', number);
    },
    _ordinal: '%d',
    preparse: function (string) {
      return string;
    },
    postformat: function (string) {
      return string;
    },
    week: function (mom) {
      return weekOfYear(mom, this._week.dow, this._week.doy).week;
    },
    _week: {
      dow: 0,
      doy: 6
    },
    _invalidDate: 'Invalid date',
    invalidDate: function () {
      return this._invalidDate;
    }
  });
  function loadLang(key, values) {
    values.abbr = key;
    if (!languages[key]) {
      languages[key] = new Language();
    }
    languages[key].set(values);
    return languages[key];
  }
  function unloadLang(key) {
    delete languages[key];
  }
  function getLangDefinition(key) {
    var i = 0, j, lang, next, split, get = function (k) {
        if (!languages[k] && hasModule) {
          try {
            require('./lang/' + k);
          } catch (e) {
          }
        }
        return languages[k];
      };
    if (!key) {
      return moment.fn._lang;
    }
    if (!isArray(key)) {
      lang = get(key);
      if (lang) {
        return lang;
      }
      key = [key];
    }
    while (i < key.length) {
      split = normalizeLanguage(key[i]).split('-');
      j = split.length;
      next = normalizeLanguage(key[i + 1]);
      next = next ? next.split('-') : null;
      while (j > 0) {
        lang = get(split.slice(0, j).join('-'));
        if (lang) {
          return lang;
        }
        if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
          break;
        }
        j--;
      }
      i++;
    }
    return moment.fn._lang;
  }
  function removeFormattingTokens(input) {
    if (input.match(/\[[\s\S]/)) {
      return input.replace(/^\[|\]$/g, '');
    }
    return input.replace(/\\/g, '');
  }
  function makeFormatFunction(format) {
    var array = format.match(formattingTokens), i, length;
    for (i = 0, length = array.length; i < length; i++) {
      if (formatTokenFunctions[array[i]]) {
        array[i] = formatTokenFunctions[array[i]];
      } else {
        array[i] = removeFormattingTokens(array[i]);
      }
    }
    return function (mom) {
      var output = '';
      for (i = 0; i < length; i++) {
        output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
      }
      return output;
    };
  }
  function formatMoment(m, format) {
    if (!m.isValid()) {
      return m.lang().invalidDate();
    }
    format = expandFormat(format, m.lang());
    if (!formatFunctions[format]) {
      formatFunctions[format] = makeFormatFunction(format);
    }
    return formatFunctions[format](m);
  }
  function expandFormat(format, lang) {
    var i = 5;
    function replaceLongDateFormatTokens(input) {
      return lang.longDateFormat(input) || input;
    }
    localFormattingTokens.lastIndex = 0;
    while (i >= 0 && localFormattingTokens.test(format)) {
      format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
      localFormattingTokens.lastIndex = 0;
      i -= 1;
    }
    return format;
  }
  function getParseRegexForToken(token, config) {
    var a;
    switch (token) {
    case 'DDDD':
      return parseTokenThreeDigits;
    case 'YYYY':
    case 'GGGG':
    case 'gggg':
      return parseTokenFourDigits;
    case 'YYYYY':
    case 'GGGGG':
    case 'ggggg':
      return parseTokenSixDigits;
    case 'S':
    case 'SS':
    case 'SSS':
    case 'DDD':
      return parseTokenOneToThreeDigits;
    case 'MMM':
    case 'MMMM':
    case 'dd':
    case 'ddd':
    case 'dddd':
      return parseTokenWord;
    case 'a':
    case 'A':
      return getLangDefinition(config._l)._meridiemParse;
    case 'X':
      return parseTokenTimestampMs;
    case 'Z':
    case 'ZZ':
      return parseTokenTimezone;
    case 'T':
      return parseTokenT;
    case 'MM':
    case 'DD':
    case 'YY':
    case 'GG':
    case 'gg':
    case 'HH':
    case 'hh':
    case 'mm':
    case 'ss':
    case 'M':
    case 'D':
    case 'd':
    case 'H':
    case 'h':
    case 'm':
    case 's':
    case 'w':
    case 'ww':
    case 'W':
    case 'WW':
    case 'e':
    case 'E':
      return parseTokenOneOrTwoDigits;
    default:
      a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
      return a;
    }
  }
  function timezoneMinutesFromString(string) {
    var tzchunk = (parseTokenTimezone.exec(string) || [])[0], parts = (tzchunk + '').match(parseTimezoneChunker) || [
        '-',
        0,
        0
      ], minutes = +(parts[1] * 60) + toInt(parts[2]);
    return parts[0] === '+' ? -minutes : minutes;
  }
  function addTimeToArrayFromToken(token, input, config) {
    var a, datePartArray = config._a;
    switch (token) {
    case 'M':
    case 'MM':
      if (input != null) {
        datePartArray[MONTH] = toInt(input) - 1;
      }
      break;
    case 'MMM':
    case 'MMMM':
      a = getLangDefinition(config._l).monthsParse(input);
      if (a != null) {
        datePartArray[MONTH] = a;
      } else {
        config._pf.invalidMonth = input;
      }
      break;
    case 'D':
    case 'DD':
      if (input != null) {
        datePartArray[DATE] = toInt(input);
      }
      break;
    case 'DDD':
    case 'DDDD':
      if (input != null) {
        config._dayOfYear = toInt(input);
      }
      break;
    case 'YY':
      datePartArray[YEAR] = toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
      break;
    case 'YYYY':
    case 'YYYYY':
      datePartArray[YEAR] = toInt(input);
      break;
    case 'a':
    case 'A':
      config._isPm = getLangDefinition(config._l).isPM(input);
      break;
    case 'H':
    case 'HH':
    case 'h':
    case 'hh':
      datePartArray[HOUR] = toInt(input);
      break;
    case 'm':
    case 'mm':
      datePartArray[MINUTE] = toInt(input);
      break;
    case 's':
    case 'ss':
      datePartArray[SECOND] = toInt(input);
      break;
    case 'S':
    case 'SS':
    case 'SSS':
      datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
      break;
    case 'X':
      config._d = new Date(parseFloat(input) * 1000);
      break;
    case 'Z':
    case 'ZZ':
      config._useUTC = true;
      config._tzm = timezoneMinutesFromString(input);
      break;
    case 'w':
    case 'ww':
    case 'W':
    case 'WW':
    case 'd':
    case 'dd':
    case 'ddd':
    case 'dddd':
    case 'e':
    case 'E':
      token = token.substr(0, 1);
    case 'gg':
    case 'gggg':
    case 'GG':
    case 'GGGG':
    case 'GGGGG':
      token = token.substr(0, 2);
      if (input) {
        config._w = config._w || {};
        config._w[token] = input;
      }
      break;
    }
  }
  function dateFromConfig(config) {
    var i, date, input = [], currentDate, yearToUse, fixYear, w, temp, lang, weekday, week;
    if (config._d) {
      return;
    }
    currentDate = currentDateArray(config);
    if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
      fixYear = function (val) {
        return val ? val.length < 3 ? parseInt(val, 10) > 68 ? '19' + val : '20' + val : val : config._a[YEAR] == null ? moment().weekYear() : config._a[YEAR];
      };
      w = config._w;
      if (w.GG != null || w.W != null || w.E != null) {
        temp = dayOfYearFromWeeks(fixYear(w.GG), w.W || 1, w.E, 4, 1);
      } else {
        lang = getLangDefinition(config._l);
        weekday = w.d != null ? parseWeekday(w.d, lang) : w.e != null ? parseInt(w.e, 10) + lang._week.dow : 0;
        week = parseInt(w.w, 10) || 1;
        if (w.d != null && weekday < lang._week.dow) {
          week++;
        }
        temp = dayOfYearFromWeeks(fixYear(w.gg), week, weekday, lang._week.doy, lang._week.dow);
      }
      config._a[YEAR] = temp.year;
      config._dayOfYear = temp.dayOfYear;
    }
    if (config._dayOfYear) {
      yearToUse = config._a[YEAR] == null ? currentDate[YEAR] : config._a[YEAR];
      if (config._dayOfYear > daysInYear(yearToUse)) {
        config._pf._overflowDayOfYear = true;
      }
      date = makeUTCDate(yearToUse, 0, config._dayOfYear);
      config._a[MONTH] = date.getUTCMonth();
      config._a[DATE] = date.getUTCDate();
    }
    for (i = 0; i < 3 && config._a[i] == null; ++i) {
      config._a[i] = input[i] = currentDate[i];
    }
    for (; i < 7; i++) {
      config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
    }
    input[HOUR] += toInt((config._tzm || 0) / 60);
    input[MINUTE] += toInt((config._tzm || 0) % 60);
    config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
  }
  function dateFromObject(config) {
    var normalizedInput;
    if (config._d) {
      return;
    }
    normalizedInput = normalizeObjectUnits(config._i);
    config._a = [
      normalizedInput.year,
      normalizedInput.month,
      normalizedInput.day,
      normalizedInput.hour,
      normalizedInput.minute,
      normalizedInput.second,
      normalizedInput.millisecond
    ];
    dateFromConfig(config);
  }
  function currentDateArray(config) {
    var now = new Date();
    if (config._useUTC) {
      return [
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      ];
    } else {
      return [
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ];
    }
  }
  function makeDateFromStringAndFormat(config) {
    config._a = [];
    config._pf.empty = true;
    var lang = getLangDefinition(config._l), string = '' + config._i, i, parsedInput, tokens, token, skipped, stringLength = string.length, totalParsedInputLength = 0;
    tokens = expandFormat(config._f, lang).match(formattingTokens) || [];
    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];
      parsedInput = (getParseRegexForToken(token, config).exec(string) || [])[0];
      if (parsedInput) {
        skipped = string.substr(0, string.indexOf(parsedInput));
        if (skipped.length > 0) {
          config._pf.unusedInput.push(skipped);
        }
        string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
        totalParsedInputLength += parsedInput.length;
      }
      if (formatTokenFunctions[token]) {
        if (parsedInput) {
          config._pf.empty = false;
        } else {
          config._pf.unusedTokens.push(token);
        }
        addTimeToArrayFromToken(token, parsedInput, config);
      } else if (config._strict && !parsedInput) {
        config._pf.unusedTokens.push(token);
      }
    }
    config._pf.charsLeftOver = stringLength - totalParsedInputLength;
    if (string.length > 0) {
      config._pf.unusedInput.push(string);
    }
    if (config._isPm && config._a[HOUR] < 12) {
      config._a[HOUR] += 12;
    }
    if (config._isPm === false && config._a[HOUR] === 12) {
      config._a[HOUR] = 0;
    }
    dateFromConfig(config);
    checkOverflow(config);
  }
  function unescapeFormat(s) {
    return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
      return p1 || p2 || p3 || p4;
    });
  }
  function regexpEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  function makeDateFromStringAndArray(config) {
    var tempConfig, bestMoment, scoreToBeat, i, currentScore;
    if (config._f.length === 0) {
      config._pf.invalidFormat = true;
      config._d = new Date(NaN);
      return;
    }
    for (i = 0; i < config._f.length; i++) {
      currentScore = 0;
      tempConfig = extend({}, config);
      initializeParsingFlags(tempConfig);
      tempConfig._f = config._f[i];
      makeDateFromStringAndFormat(tempConfig);
      if (!isValid(tempConfig)) {
        continue;
      }
      currentScore += tempConfig._pf.charsLeftOver;
      currentScore += tempConfig._pf.unusedTokens.length * 10;
      tempConfig._pf.score = currentScore;
      if (scoreToBeat == null || currentScore < scoreToBeat) {
        scoreToBeat = currentScore;
        bestMoment = tempConfig;
      }
    }
    extend(config, bestMoment || tempConfig);
  }
  function makeDateFromString(config) {
    var i, string = config._i, match = isoRegex.exec(string);
    if (match) {
      for (i = 4; i > 0; i--) {
        if (match[i]) {
          config._f = isoDates[i - 1] + (match[6] || ' ');
          break;
        }
      }
      for (i = 0; i < 4; i++) {
        if (isoTimes[i][1].exec(string)) {
          config._f += isoTimes[i][0];
          break;
        }
      }
      if (parseTokenTimezone.exec(string)) {
        config._f += ' Z';
      }
      makeDateFromStringAndFormat(config);
    } else {
      config._d = new Date(string);
    }
  }
  function makeDateFromInput(config) {
    var input = config._i, matched = aspNetJsonRegex.exec(input);
    if (input === undefined) {
      config._d = new Date();
    } else if (matched) {
      config._d = new Date(+matched[1]);
    } else if (typeof input === 'string') {
      makeDateFromString(config);
    } else if (isArray(input)) {
      config._a = input.slice(0);
      dateFromConfig(config);
    } else if (isDate(input)) {
      config._d = new Date(+input);
    } else if (typeof input === 'object') {
      dateFromObject(config);
    } else {
      config._d = new Date(input);
    }
  }
  function makeDate(y, m, d, h, M, s, ms) {
    var date = new Date(y, m, d, h, M, s, ms);
    if (y < 1970) {
      date.setFullYear(y);
    }
    return date;
  }
  function makeUTCDate(y) {
    var date = new Date(Date.UTC.apply(null, arguments));
    if (y < 1970) {
      date.setUTCFullYear(y);
    }
    return date;
  }
  function parseWeekday(input, language) {
    if (typeof input === 'string') {
      if (!isNaN(input)) {
        input = parseInt(input, 10);
      } else {
        input = language.weekdaysParse(input);
        if (typeof input !== 'number') {
          return null;
        }
      }
    }
    return input;
  }
  function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
    return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
  }
  function relativeTime(milliseconds, withoutSuffix, lang) {
    var seconds = round(Math.abs(milliseconds) / 1000), minutes = round(seconds / 60), hours = round(minutes / 60), days = round(hours / 24), years = round(days / 365), args = seconds < 45 && [
        's',
        seconds
      ] || minutes === 1 && ['m'] || minutes < 45 && [
        'mm',
        minutes
      ] || hours === 1 && ['h'] || hours < 22 && [
        'hh',
        hours
      ] || days === 1 && ['d'] || days <= 25 && [
        'dd',
        days
      ] || days <= 45 && ['M'] || days < 345 && [
        'MM',
        round(days / 30)
      ] || years === 1 && ['y'] || [
        'yy',
        years
      ];
    args[2] = withoutSuffix;
    args[3] = milliseconds > 0;
    args[4] = lang;
    return substituteTimeAgo.apply({}, args);
  }
  function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
    var end = firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(), adjustedMoment;
    if (daysToDayOfWeek > end) {
      daysToDayOfWeek -= 7;
    }
    if (daysToDayOfWeek < end - 7) {
      daysToDayOfWeek += 7;
    }
    adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
    return {
      week: Math.ceil(adjustedMoment.dayOfYear() / 7),
      year: adjustedMoment.year()
    };
  }
  function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
    var d = new Date(Date.UTC(year, 0)).getUTCDay(), daysToAdd, dayOfYear;
    weekday = weekday != null ? weekday : firstDayOfWeek;
    daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0);
    dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
    return {
      year: dayOfYear > 0 ? year : year - 1,
      dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
    };
  }
  function makeMoment(config) {
    var input = config._i, format = config._f;
    if (typeof config._pf === 'undefined') {
      initializeParsingFlags(config);
    }
    if (input === null) {
      return moment.invalid({ nullInput: true });
    }
    if (typeof input === 'string') {
      config._i = input = getLangDefinition().preparse(input);
    }
    if (moment.isMoment(input)) {
      config = extend({}, input);
      config._d = new Date(+input._d);
    } else if (format) {
      if (isArray(format)) {
        makeDateFromStringAndArray(config);
      } else {
        makeDateFromStringAndFormat(config);
      }
    } else {
      makeDateFromInput(config);
    }
    return new Moment(config);
  }
  moment = function (input, format, lang, strict) {
    if (typeof lang === 'boolean') {
      strict = lang;
      lang = undefined;
    }
    return makeMoment({
      _i: input,
      _f: format,
      _l: lang,
      _strict: strict,
      _isUTC: false
    });
  };
  moment.utc = function (input, format, lang, strict) {
    var m;
    if (typeof lang === 'boolean') {
      strict = lang;
      lang = undefined;
    }
    m = makeMoment({
      _useUTC: true,
      _isUTC: true,
      _l: lang,
      _i: input,
      _f: format,
      _strict: strict
    }).utc();
    return m;
  };
  moment.unix = function (input) {
    return moment(input * 1000);
  };
  moment.duration = function (input, key) {
    var isDuration = moment.isDuration(input), isNumber = typeof input === 'number', duration = isDuration ? input._input : isNumber ? {} : input, match = null, sign, ret, parseIso, timeEmpty, dateTimeEmpty;
    if (isNumber) {
      if (key) {
        duration[key] = input;
      } else {
        duration.milliseconds = input;
      }
    } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
      sign = match[1] === '-' ? -1 : 1;
      duration = {
        y: 0,
        d: toInt(match[DATE]) * sign,
        h: toInt(match[HOUR]) * sign,
        m: toInt(match[MINUTE]) * sign,
        s: toInt(match[SECOND]) * sign,
        ms: toInt(match[MILLISECOND]) * sign
      };
    } else if (!!(match = isoDurationRegex.exec(input))) {
      sign = match[1] === '-' ? -1 : 1;
      parseIso = function (inp) {
        var res = inp && parseFloat(inp.replace(',', '.'));
        return (isNaN(res) ? 0 : res) * sign;
      };
      duration = {
        y: parseIso(match[2]),
        M: parseIso(match[3]),
        d: parseIso(match[4]),
        h: parseIso(match[5]),
        m: parseIso(match[6]),
        s: parseIso(match[7]),
        w: parseIso(match[8])
      };
    }
    ret = new Duration(duration);
    if (isDuration && input.hasOwnProperty('_lang')) {
      ret._lang = input._lang;
    }
    return ret;
  };
  moment.version = VERSION;
  moment.defaultFormat = isoFormat;
  moment.updateOffset = function () {
  };
  moment.lang = function (key, values) {
    var r;
    if (!key) {
      return moment.fn._lang._abbr;
    }
    if (values) {
      loadLang(normalizeLanguage(key), values);
    } else if (values === null) {
      unloadLang(key);
      key = 'en';
    } else if (!languages[key]) {
      getLangDefinition(key);
    }
    r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
    return r._abbr;
  };
  moment.langData = function (key) {
    if (key && key._lang && key._lang._abbr) {
      key = key._lang._abbr;
    }
    return getLangDefinition(key);
  };
  moment.isMoment = function (obj) {
    return obj instanceof Moment;
  };
  moment.isDuration = function (obj) {
    return obj instanceof Duration;
  };
  for (i = lists.length - 1; i >= 0; --i) {
    makeList(lists[i]);
  }
  moment.normalizeUnits = function (units) {
    return normalizeUnits(units);
  };
  moment.invalid = function (flags) {
    var m = moment.utc(NaN);
    if (flags != null) {
      extend(m._pf, flags);
    } else {
      m._pf.userInvalidated = true;
    }
    return m;
  };
  moment.parseZone = function (input) {
    return moment(input).parseZone();
  };
  extend(moment.fn = Moment.prototype, {
    clone: function () {
      return moment(this);
    },
    valueOf: function () {
      return +this._d + (this._offset || 0) * 60000;
    },
    unix: function () {
      return Math.floor(+this / 1000);
    },
    toString: function () {
      return this.clone().lang('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    },
    toDate: function () {
      return this._offset ? new Date(+this) : this._d;
    },
    toISOString: function () {
      return formatMoment(moment(this).utc(), 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
    },
    toArray: function () {
      var m = this;
      return [
        m.year(),
        m.month(),
        m.date(),
        m.hours(),
        m.minutes(),
        m.seconds(),
        m.milliseconds()
      ];
    },
    isValid: function () {
      return isValid(this);
    },
    isDSTShifted: function () {
      if (this._a) {
        return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
      }
      return false;
    },
    parsingFlags: function () {
      return extend({}, this._pf);
    },
    invalidAt: function () {
      return this._pf.overflow;
    },
    utc: function () {
      return this.zone(0);
    },
    local: function () {
      this.zone(0);
      this._isUTC = false;
      return this;
    },
    format: function (inputString) {
      var output = formatMoment(this, inputString || moment.defaultFormat);
      return this.lang().postformat(output);
    },
    add: function (input, val) {
      var dur;
      if (typeof input === 'string') {
        dur = moment.duration(+val, input);
      } else {
        dur = moment.duration(input, val);
      }
      addOrSubtractDurationFromMoment(this, dur, 1);
      return this;
    },
    subtract: function (input, val) {
      var dur;
      if (typeof input === 'string') {
        dur = moment.duration(+val, input);
      } else {
        dur = moment.duration(input, val);
      }
      addOrSubtractDurationFromMoment(this, dur, -1);
      return this;
    },
    diff: function (input, units, asFloat) {
      var that = this._isUTC ? moment(input).zone(this._offset || 0) : moment(input).local(), zoneDiff = (this.zone() - that.zone()) * 60000, diff, output;
      units = normalizeUnits(units);
      if (units === 'year' || units === 'month') {
        diff = (this.daysInMonth() + that.daysInMonth()) * 43200000;
        output = (this.year() - that.year()) * 12 + (this.month() - that.month());
        output += (this - moment(this).startOf('month') - (that - moment(that).startOf('month'))) / diff;
        output -= (this.zone() - moment(this).startOf('month').zone() - (that.zone() - moment(that).startOf('month').zone())) * 60000 / diff;
        if (units === 'year') {
          output = output / 12;
        }
      } else {
        diff = this - that;
        output = units === 'second' ? diff / 1000 : units === 'minute' ? diff / 60000 : units === 'hour' ? diff / 3600000 : units === 'day' ? (diff - zoneDiff) / 86400000 : units === 'week' ? (diff - zoneDiff) / 604800000 : diff;
      }
      return asFloat ? output : absRound(output);
    },
    from: function (time, withoutSuffix) {
      return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
    },
    fromNow: function (withoutSuffix) {
      return this.from(moment(), withoutSuffix);
    },
    calendar: function () {
      var diff = this.diff(moment().zone(this.zone()).startOf('day'), 'days', true), format = diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
      return this.format(this.lang().calendar(format, this));
    },
    isLeapYear: function () {
      return isLeapYear(this.year());
    },
    isDST: function () {
      return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
    },
    day: function (input) {
      var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
      if (input != null) {
        input = parseWeekday(input, this.lang());
        return this.add({ d: input - day });
      } else {
        return day;
      }
    },
    month: function (input) {
      var utc = this._isUTC ? 'UTC' : '', dayOfMonth;
      if (input != null) {
        if (typeof input === 'string') {
          input = this.lang().monthsParse(input);
          if (typeof input !== 'number') {
            return this;
          }
        }
        dayOfMonth = this.date();
        this.date(1);
        this._d['set' + utc + 'Month'](input);
        this.date(Math.min(dayOfMonth, this.daysInMonth()));
        moment.updateOffset(this);
        return this;
      } else {
        return this._d['get' + utc + 'Month']();
      }
    },
    startOf: function (units) {
      units = normalizeUnits(units);
      switch (units) {
      case 'year':
        this.month(0);
      case 'month':
        this.date(1);
      case 'week':
      case 'isoWeek':
      case 'day':
        this.hours(0);
      case 'hour':
        this.minutes(0);
      case 'minute':
        this.seconds(0);
      case 'second':
        this.milliseconds(0);
      }
      if (units === 'week') {
        this.weekday(0);
      } else if (units === 'isoWeek') {
        this.isoWeekday(1);
      }
      return this;
    },
    endOf: function (units) {
      units = normalizeUnits(units);
      return this.startOf(units).add(units === 'isoWeek' ? 'week' : units, 1).subtract('ms', 1);
    },
    isAfter: function (input, units) {
      units = typeof units !== 'undefined' ? units : 'millisecond';
      return +this.clone().startOf(units) > +moment(input).startOf(units);
    },
    isBefore: function (input, units) {
      units = typeof units !== 'undefined' ? units : 'millisecond';
      return +this.clone().startOf(units) < +moment(input).startOf(units);
    },
    isSame: function (input, units) {
      units = typeof units !== 'undefined' ? units : 'millisecond';
      return +this.clone().startOf(units) === +moment(input).startOf(units);
    },
    min: function (other) {
      other = moment.apply(null, arguments);
      return other < this ? this : other;
    },
    max: function (other) {
      other = moment.apply(null, arguments);
      return other > this ? this : other;
    },
    zone: function (input) {
      var offset = this._offset || 0;
      if (input != null) {
        if (typeof input === 'string') {
          input = timezoneMinutesFromString(input);
        }
        if (Math.abs(input) < 16) {
          input = input * 60;
        }
        this._offset = input;
        this._isUTC = true;
        if (offset !== input) {
          addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, true);
        }
      } else {
        return this._isUTC ? offset : this._d.getTimezoneOffset();
      }
      return this;
    },
    zoneAbbr: function () {
      return this._isUTC ? 'UTC' : '';
    },
    zoneName: function () {
      return this._isUTC ? 'Coordinated Universal Time' : '';
    },
    parseZone: function () {
      if (typeof this._i === 'string') {
        this.zone(this._i);
      }
      return this;
    },
    hasAlignedHourOffset: function (input) {
      if (!input) {
        input = 0;
      } else {
        input = moment(input).zone();
      }
      return (this.zone() - input) % 60 === 0;
    },
    daysInMonth: function () {
      return daysInMonth(this.year(), this.month());
    },
    dayOfYear: function (input) {
      var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 86400000) + 1;
      return input == null ? dayOfYear : this.add('d', input - dayOfYear);
    },
    weekYear: function (input) {
      var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
      return input == null ? year : this.add('y', input - year);
    },
    isoWeekYear: function (input) {
      var year = weekOfYear(this, 1, 4).year;
      return input == null ? year : this.add('y', input - year);
    },
    week: function (input) {
      var week = this.lang().week(this);
      return input == null ? week : this.add('d', (input - week) * 7);
    },
    isoWeek: function (input) {
      var week = weekOfYear(this, 1, 4).week;
      return input == null ? week : this.add('d', (input - week) * 7);
    },
    weekday: function (input) {
      var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
      return input == null ? weekday : this.add('d', input - weekday);
    },
    isoWeekday: function (input) {
      return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    },
    get: function (units) {
      units = normalizeUnits(units);
      return this[units]();
    },
    set: function (units, value) {
      units = normalizeUnits(units);
      if (typeof this[units] === 'function') {
        this[units](value);
      }
      return this;
    },
    lang: function (key) {
      if (key === undefined) {
        return this._lang;
      } else {
        this._lang = getLangDefinition(key);
        return this;
      }
    }
  });
  function makeGetterAndSetter(name, key) {
    moment.fn[name] = moment.fn[name + 's'] = function (input) {
      var utc = this._isUTC ? 'UTC' : '';
      if (input != null) {
        this._d['set' + utc + key](input);
        moment.updateOffset(this);
        return this;
      } else {
        return this._d['get' + utc + key]();
      }
    };
  }
  for (i = 0; i < proxyGettersAndSetters.length; i++) {
    makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
  }
  makeGetterAndSetter('year', 'FullYear');
  moment.fn.days = moment.fn.day;
  moment.fn.months = moment.fn.month;
  moment.fn.weeks = moment.fn.week;
  moment.fn.isoWeeks = moment.fn.isoWeek;
  moment.fn.toJSON = moment.fn.toISOString;
  extend(moment.duration.fn = Duration.prototype, {
    _bubble: function () {
      var milliseconds = this._milliseconds, days = this._days, months = this._months, data = this._data, seconds, minutes, hours, years;
      data.milliseconds = milliseconds % 1000;
      seconds = absRound(milliseconds / 1000);
      data.seconds = seconds % 60;
      minutes = absRound(seconds / 60);
      data.minutes = minutes % 60;
      hours = absRound(minutes / 60);
      data.hours = hours % 24;
      days += absRound(hours / 24);
      data.days = days % 30;
      months += absRound(days / 30);
      data.months = months % 12;
      years = absRound(months / 12);
      data.years = years;
    },
    weeks: function () {
      return absRound(this.days() / 7);
    },
    valueOf: function () {
      return this._milliseconds + this._days * 86400000 + this._months % 12 * 2592000000 + toInt(this._months / 12) * 31536000000;
    },
    humanize: function (withSuffix) {
      var difference = +this, output = relativeTime(difference, !withSuffix, this.lang());
      if (withSuffix) {
        output = this.lang().pastFuture(difference, output);
      }
      return this.lang().postformat(output);
    },
    add: function (input, val) {
      var dur = moment.duration(input, val);
      this._milliseconds += dur._milliseconds;
      this._days += dur._days;
      this._months += dur._months;
      this._bubble();
      return this;
    },
    subtract: function (input, val) {
      var dur = moment.duration(input, val);
      this._milliseconds -= dur._milliseconds;
      this._days -= dur._days;
      this._months -= dur._months;
      this._bubble();
      return this;
    },
    get: function (units) {
      units = normalizeUnits(units);
      return this[units.toLowerCase() + 's']();
    },
    as: function (units) {
      units = normalizeUnits(units);
      return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
    },
    lang: moment.fn.lang,
    toIsoString: function () {
      var years = Math.abs(this.years()), months = Math.abs(this.months()), days = Math.abs(this.days()), hours = Math.abs(this.hours()), minutes = Math.abs(this.minutes()), seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);
      if (!this.asSeconds()) {
        return 'P0D';
      }
      return (this.asSeconds() < 0 ? '-' : '') + 'P' + (years ? years + 'Y' : '') + (months ? months + 'M' : '') + (days ? days + 'D' : '') + (hours || minutes || seconds ? 'T' : '') + (hours ? hours + 'H' : '') + (minutes ? minutes + 'M' : '') + (seconds ? seconds + 'S' : '');
    }
  });
  function makeDurationGetter(name) {
    moment.duration.fn[name] = function () {
      return this._data[name];
    };
  }
  function makeDurationAsGetter(name, factor) {
    moment.duration.fn['as' + name] = function () {
      return +this / factor;
    };
  }
  for (i in unitMillisecondFactors) {
    if (unitMillisecondFactors.hasOwnProperty(i)) {
      makeDurationAsGetter(i, unitMillisecondFactors[i]);
      makeDurationGetter(i.toLowerCase());
    }
  }
  makeDurationAsGetter('Weeks', 604800000);
  moment.duration.fn.asMonths = function () {
    return (+this - this.years() * 31536000000) / 2592000000 + this.years() * 12;
  };
  moment.lang('en', {
    ordinal: function (number) {
      var b = number % 10, output = toInt(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
      return number + output;
    }
  });
  function makeGlobal() {
    if (typeof ender === 'undefined') {
      this['moment'] = moment;
    }
  }
  if (hasModule) {
    module.exports = moment;
    makeGlobal();
  } else if (typeof define === 'function' && define.amd) {
    define('moment', function (require, exports, module) {
      if (module.config().noGlobal !== true) {
        makeGlobal();
      }
      return moment;
    });
  } else {
    makeGlobal();
  }
}.call(this));
angular.module('angularMoment', []).directive('amTimeAgo', [
  '$window',
  '$timeout',
  function ($window, $timeout) {
    'use strict';
    return function (scope, element, attr) {
      var activeTimeout = null;
      var currentValue;
      var currentFormat;
      function cancelTimer() {
        if (activeTimeout) {
          $timeout.cancel(activeTimeout);
          activeTimeout = null;
        }
      }
      function updateTime(momentInstance) {
        element.text(momentInstance.fromNow());
        var howOld = $window.moment().diff(momentInstance, 'minute');
        var secondsUntilUpdate = 3600;
        if (howOld < 1) {
          secondsUntilUpdate = 1;
        } else if (howOld < 60) {
          secondsUntilUpdate = 30;
        } else if (howOld < 180) {
          secondsUntilUpdate = 300;
        }
        activeTimeout = $timeout(function () {
          updateTime(momentInstance);
        }, secondsUntilUpdate * 1000, false);
      }
      function updateMoment() {
        cancelTimer();
        updateTime($window.moment(currentValue, currentFormat));
      }
      scope.$watch(attr.amTimeAgo, function (value) {
        if (typeof value === 'undefined' || value === null || value === '') {
          cancelTimer();
          if (currentValue) {
            element.text('');
            currentValue = null;
          }
          return;
        }
        if (angular.isNumber(value)) {
          value = new Date(value);
        }
        currentValue = value;
        updateMoment();
      });
      attr.$observe('amFormat', function (format) {
        currentFormat = format;
        if (currentValue) {
          updateMoment();
        }
      });
      scope.$on('$destroy', function () {
        cancelTimer();
      });
    };
  }
]).filter('amDateFormat', [
  '$window',
  function ($window) {
    'use strict';
    return function (value, format) {
      if (typeof value === 'undefined' || value === null) {
        return '';
      }
      if (!isNaN(parseFloat(value)) && isFinite(value)) {
        value = new Date(parseInt(value, 10));
      }
      return $window.moment(value).format(format);
    };
  }
]);