(function (window, angular, undefined) {
  'use strict';
  angular.module('ngAnimate', ['ng']).config([
    '$provide',
    '$animateProvider',
    function ($provide, $animateProvider) {
      var noop = angular.noop;
      var forEach = angular.forEach;
      var selectors = $animateProvider.$$selectors;
      var NG_ANIMATE_STATE = '$$ngAnimateState';
      var rootAnimateState = { running: true };
      $provide.decorator('$animate', [
        '$delegate',
        '$injector',
        '$sniffer',
        '$rootElement',
        '$timeout',
        function ($delegate, $injector, $sniffer, $rootElement, $timeout) {
          $rootElement.data(NG_ANIMATE_STATE, rootAnimateState);
          function lookup(name) {
            if (name) {
              var matches = [], flagMap = {}, classes = name.substr(1).split('.');
              classes.push('');
              for (var i = 0; i < classes.length; i++) {
                var klass = classes[i], selectorFactoryName = selectors[klass];
                if (selectorFactoryName && !flagMap[klass]) {
                  matches.push($injector.get(selectorFactoryName));
                  flagMap[klass] = true;
                }
              }
              return matches;
            }
          }
          return {
            enter: function (element, parent, after, done) {
              $delegate.enter(element, parent, after);
              performAnimation('enter', 'ng-enter', element, parent, after, done);
            },
            leave: function (element, done) {
              performAnimation('leave', 'ng-leave', element, null, null, function () {
                $delegate.leave(element, done);
              });
            },
            move: function (element, parent, after, done) {
              $delegate.move(element, parent, after);
              performAnimation('move', 'ng-move', element, null, null, done);
            },
            addClass: function (element, className, done) {
              performAnimation('addClass', className, element, null, null, function () {
                $delegate.addClass(element, className, done);
              });
            },
            removeClass: function (element, className, done) {
              performAnimation('removeClass', className, element, null, null, function () {
                $delegate.removeClass(element, className, done);
              });
            },
            enabled: function (value) {
              if (arguments.length) {
                rootAnimateState.running = !value;
              }
              return !rootAnimateState.running;
            }
          };
          function performAnimation(event, className, element, parent, after, onComplete) {
            var classes = (element.attr('class') || '') + ' ' + className;
            var animationLookup = (' ' + classes).replace(/\s+/g, '.'), animations = [];
            forEach(lookup(animationLookup), function (animation, index) {
              animations.push({ start: animation[event] });
            });
            if (!parent) {
              parent = after ? after.parent() : element.parent();
            }
            var disabledAnimation = { running: true };
            if ((parent.inheritedData(NG_ANIMATE_STATE) || disabledAnimation).running) {
              $timeout(onComplete || noop, 0, false);
              return;
            }
            var ngAnimateState = element.data(NG_ANIMATE_STATE) || {};
            if (ngAnimateState.running) {
              cancelAnimations(ngAnimateState.animations);
              ngAnimateState.done();
            }
            element.data(NG_ANIMATE_STATE, {
              running: true,
              animations: animations,
              done: done
            });
            var baseClassName = className;
            if (event == 'addClass') {
              className = suffixClasses(className, '-add');
            } else if (event == 'removeClass') {
              className = suffixClasses(className, '-remove');
            }
            element.addClass(className);
            forEach(animations, function (animation, index) {
              var fn = function () {
                progress(index);
              };
              if (animation.start) {
                if (event == 'addClass' || event == 'removeClass') {
                  animation.endFn = animation.start(element, baseClassName, fn);
                } else {
                  animation.endFn = animation.start(element, fn);
                }
              } else {
                fn();
              }
            });
            function cancelAnimations(animations) {
              var isCancelledFlag = true;
              forEach(animations, function (animation) {
                (animation.endFn || noop)(isCancelledFlag);
              });
            }
            function progress(index) {
              animations[index].done = true;
              (animations[index].endFn || noop)();
              for (var i = 0; i < animations.length; i++) {
                if (!animations[i].done)
                  return;
              }
              done();
            }
            function done() {
              if (!done.hasBeenRun) {
                done.hasBeenRun = true;
                element.removeClass(className);
                element.removeData(NG_ANIMATE_STATE);
                (onComplete || noop)();
              }
            }
          }
        }
      ]);
      $animateProvider.register('', [
        '$window',
        '$sniffer',
        '$timeout',
        function ($window, $sniffer, $timeout) {
          var noop = angular.noop;
          var forEach = angular.forEach;
          function animate(element, className, done) {
            if (!($sniffer.transitions || $sniffer.animations)) {
              done();
            } else {
              var activeClassName = '';
              $timeout(startAnimation, 1, false);
              return onEnd;
            }
            function parseMaxTime(str) {
              var total = 0, values = angular.isString(str) ? str.split(/\s*,\s*/) : [];
              forEach(values, function (value) {
                total = Math.max(parseFloat(value) || 0, total);
              });
              return total;
            }
            function startAnimation() {
              var duration = 0;
              forEach(className.split(' '), function (klass, i) {
                activeClassName += (i > 0 ? ' ' : '') + klass + '-active';
              });
              element.addClass(activeClassName);
              var w3cAnimationProp = 'animation';
              var w3cTransitionProp = 'transition';
              var vendorAnimationProp = $sniffer.vendorPrefix + 'Animation';
              var vendorTransitionProp = $sniffer.vendorPrefix + 'Transition';
              var durationKey = 'Duration', delayKey = 'Delay', animationIterationCountKey = 'IterationCount';
              var ELEMENT_NODE = 1;
              forEach(element, function (element) {
                if (element.nodeType == ELEMENT_NODE) {
                  var elementStyles = $window.getComputedStyle(element) || {};
                  var transitionDelay = Math.max(parseMaxTime(elementStyles[w3cTransitionProp + delayKey]), parseMaxTime(elementStyles[vendorTransitionProp + delayKey]));
                  var animationDelay = Math.max(parseMaxTime(elementStyles[w3cAnimationProp + delayKey]), parseMaxTime(elementStyles[vendorAnimationProp + delayKey]));
                  var transitionDuration = Math.max(parseMaxTime(elementStyles[w3cTransitionProp + durationKey]), parseMaxTime(elementStyles[vendorTransitionProp + durationKey]));
                  var animationDuration = Math.max(parseMaxTime(elementStyles[w3cAnimationProp + durationKey]), parseMaxTime(elementStyles[vendorAnimationProp + durationKey]));
                  if (animationDuration > 0) {
                    animationDuration *= Math.max(parseInt(elementStyles[w3cAnimationProp + animationIterationCountKey]) || 0, parseInt(elementStyles[vendorAnimationProp + animationIterationCountKey]) || 0, 1);
                  }
                  duration = Math.max(animationDelay + animationDuration, transitionDelay + transitionDuration, duration);
                }
              });
              $timeout(done, duration * 1000, false);
            }
            function onEnd(cancelled) {
              element.removeClass(activeClassName);
              if (cancelled) {
                done();
              }
            }
          }
          return {
            enter: function (element, done) {
              return animate(element, 'ng-enter', done);
            },
            leave: function (element, done) {
              return animate(element, 'ng-leave', done);
            },
            move: function (element, done) {
              return animate(element, 'ng-move', done);
            },
            addClass: function (element, className, done) {
              return animate(element, suffixClasses(className, '-add'), done);
            },
            removeClass: function (element, className, done) {
              return animate(element, suffixClasses(className, '-remove'), done);
            }
          };
        }
      ]);
      function suffixClasses(classes, suffix) {
        var className = '';
        classes = angular.isArray(classes) ? classes : classes.split(/\s+/);
        forEach(classes, function (klass, i) {
          if (klass && klass.length > 0) {
            className += (i > 0 ? ' ' : '') + klass + suffix;
          }
        });
        return className;
      }
    }
  ]);
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  var copy = angular.copy, equals = angular.equals, extend = angular.extend, forEach = angular.forEach, isDefined = angular.isDefined, isFunction = angular.isFunction, isString = angular.isString, jqLite = angular.element, noop = angular.noop, toJson = angular.toJson;
  function inherit(parent, extra) {
    return extend(new (extend(function () {
    }, { prototype: parent }))(), extra);
  }
  var ngRouteModule = angular.module('ngRoute', ['ng']).provider('$route', $RouteProvider);
  function $RouteProvider() {
    var routes = {};
    this.when = function (path, route) {
      routes[path] = extend({ reloadOnSearch: true }, route, path && pathRegExp(path, route));
      if (path) {
        var redirectPath = path[path.length - 1] == '/' ? path.substr(0, path.length - 1) : path + '/';
        routes[redirectPath] = extend({ redirectTo: path }, pathRegExp(redirectPath, route));
      }
      return this;
    };
    function pathRegExp(path, opts) {
      var insensitive = opts.caseInsensitiveMatch, ret = {
          originalPath: path,
          regexp: path
        }, keys = ret.keys = [];
      path = path.replace(/([().])/g, '\\$1').replace(/(\/)?:(\w+)([\?|\*])?/g, function (_, slash, key, option) {
        var optional = option === '?' ? option : null;
        var star = option === '*' ? option : null;
        keys.push({
          name: key,
          optional: !!optional
        });
        slash = slash || '';
        return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (star && '(.+)?' || '([^/]+)?') + ')' + (optional || '');
      }).replace(/([\/$\*])/g, '\\$1');
      ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
      return ret;
    }
    this.otherwise = function (params) {
      this.when(null, params);
      return this;
    };
    this.$get = [
      '$rootScope',
      '$location',
      '$routeParams',
      '$q',
      '$injector',
      '$http',
      '$templateCache',
      '$sce',
      function ($rootScope, $location, $routeParams, $q, $injector, $http, $templateCache, $sce) {
        var forceReload = false, $route = {
            routes: routes,
            reload: function () {
              forceReload = true;
              $rootScope.$evalAsync(updateRoute);
            }
          };
        $rootScope.$on('$locationChangeSuccess', updateRoute);
        return $route;
        function switchRouteMatcher(on, route) {
          var keys = route.keys, params = {};
          if (!route.regexp)
            return null;
          var m = route.regexp.exec(on);
          if (!m)
            return null;
          var N = 0;
          for (var i = 1, len = m.length; i < len; ++i) {
            var key = keys[i - 1];
            var val = 'string' == typeof m[i] ? decodeURIComponent(m[i]) : m[i];
            if (key && val) {
              params[key.name] = val;
            }
          }
          return params;
        }
        function updateRoute() {
          var next = parseRoute(), last = $route.current;
          if (next && last && next.$$route === last.$$route && equals(next.pathParams, last.pathParams) && !next.reloadOnSearch && !forceReload) {
            last.params = next.params;
            copy(last.params, $routeParams);
            $rootScope.$broadcast('$routeUpdate', last);
          } else if (next || last) {
            forceReload = false;
            $rootScope.$broadcast('$routeChangeStart', next, last);
            $route.current = next;
            if (next) {
              if (next.redirectTo) {
                if (isString(next.redirectTo)) {
                  $location.path(interpolate(next.redirectTo, next.params)).search(next.params).replace();
                } else {
                  $location.url(next.redirectTo(next.pathParams, $location.path(), $location.search())).replace();
                }
              }
            }
            $q.when(next).then(function () {
              if (next) {
                var locals = extend({}, next.resolve), template, templateUrl;
                forEach(locals, function (value, key) {
                  locals[key] = isString(value) ? $injector.get(value) : $injector.invoke(value);
                });
                if (isDefined(template = next.template)) {
                  if (isFunction(template)) {
                    template = template(next.params);
                  }
                } else if (isDefined(templateUrl = next.templateUrl)) {
                  if (isFunction(templateUrl)) {
                    templateUrl = templateUrl(next.params);
                  }
                  templateUrl = $sce.getTrustedResourceUrl(templateUrl);
                  if (isDefined(templateUrl)) {
                    next.loadedTemplateUrl = templateUrl;
                    template = $http.get(templateUrl, { cache: $templateCache }).then(function (response) {
                      return response.data;
                    });
                  }
                }
                if (isDefined(template)) {
                  locals['$template'] = template;
                }
                return $q.all(locals);
              }
            }).then(function (locals) {
              if (next == $route.current) {
                if (next) {
                  next.locals = locals;
                  copy(next.params, $routeParams);
                }
                $rootScope.$broadcast('$routeChangeSuccess', next, last);
              }
            }, function (error) {
              if (next == $route.current) {
                $rootScope.$broadcast('$routeChangeError', next, last, error);
              }
            });
          }
        }
        function parseRoute() {
          var params, match;
          forEach(routes, function (route, path) {
            if (!match && (params = switchRouteMatcher($location.path(), route))) {
              match = inherit(route, {
                params: extend({}, $location.search(), params),
                pathParams: params
              });
              match.$$route = route;
            }
          });
          return match || routes[null] && inherit(routes[null], {
            params: {},
            pathParams: {}
          });
        }
        function interpolate(string, params) {
          var result = [];
          forEach((string || '').split(':'), function (segment, i) {
            if (i == 0) {
              result.push(segment);
            } else {
              var segmentMatch = segment.match(/(\w+)(.*)/);
              var key = segmentMatch[1];
              result.push(params[key]);
              result.push(segmentMatch[2] || '');
              delete params[key];
            }
          });
          return result.join('');
        }
      }
    ];
  }
  ngRouteModule.provider('$routeParams', $RouteParamsProvider);
  function $RouteParamsProvider() {
    this.$get = function () {
      return {};
    };
  }
  var NG_VIEW_PRIORITY = 500;
  var ngViewDirective = [
      '$route',
      '$anchorScroll',
      '$compile',
      '$controller',
      '$animate',
      function ($route, $anchorScroll, $compile, $controller, $animate) {
        return {
          restrict: 'ECA',
          terminal: true,
          priority: NG_VIEW_PRIORITY,
          compile: function (element, attr) {
            var onloadExp = attr.onload || '';
            element.html('');
            var anchor = jqLite(document.createComment(' ngView '));
            element.replaceWith(anchor);
            return function (scope) {
              var currentScope, currentElement;
              scope.$on('$routeChangeSuccess', update);
              update();
              function cleanupLastView() {
                if (currentScope) {
                  currentScope.$destroy();
                  currentScope = null;
                }
                if (currentElement) {
                  $animate.leave(currentElement);
                  currentElement = null;
                }
              }
              function update() {
                var locals = $route.current && $route.current.locals, template = locals && locals.$template;
                if (template) {
                  cleanupLastView();
                  currentScope = scope.$new();
                  currentElement = element.clone();
                  currentElement.html(template);
                  $animate.enter(currentElement, null, anchor);
                  var link = $compile(currentElement, false, NG_VIEW_PRIORITY - 1), current = $route.current;
                  if (current.controller) {
                    locals.$scope = currentScope;
                    var controller = $controller(current.controller, locals);
                    if (current.controllerAs) {
                      currentScope[current.controllerAs] = controller;
                    }
                    currentElement.data('$ngControllerController', controller);
                    currentElement.children().data('$ngControllerController', controller);
                  }
                  current.scope = currentScope;
                  link(currentScope);
                  currentScope.$emit('$viewContentLoaded');
                  currentScope.$eval(onloadExp);
                  $anchorScroll();
                } else {
                  cleanupLastView();
                }
              }
            };
          }
        };
      }
    ];
  ngRouteModule.directive('ngView', ngViewDirective);
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  angular.module('ngCookies', ['ng']).factory('$cookies', [
    '$rootScope',
    '$browser',
    function ($rootScope, $browser) {
      var cookies = {}, lastCookies = {}, lastBrowserCookies, runEval = false, copy = angular.copy, isUndefined = angular.isUndefined;
      $browser.addPollFn(function () {
        var currentCookies = $browser.cookies();
        if (lastBrowserCookies != currentCookies) {
          lastBrowserCookies = currentCookies;
          copy(currentCookies, lastCookies);
          copy(currentCookies, cookies);
          if (runEval)
            $rootScope.$apply();
        }
      })();
      runEval = true;
      $rootScope.$watch(push);
      return cookies;
      function push() {
        var name, value, browserCookies, updated;
        for (name in lastCookies) {
          if (isUndefined(cookies[name])) {
            $browser.cookies(name, undefined);
          }
        }
        for (name in cookies) {
          value = cookies[name];
          if (!angular.isString(value)) {
            if (angular.isDefined(lastCookies[name])) {
              cookies[name] = lastCookies[name];
            } else {
              delete cookies[name];
            }
          } else if (value !== lastCookies[name]) {
            $browser.cookies(name, value);
            updated = true;
          }
        }
        if (updated) {
          updated = false;
          browserCookies = $browser.cookies();
          for (name in cookies) {
            if (cookies[name] !== browserCookies[name]) {
              if (isUndefined(browserCookies[name])) {
                delete cookies[name];
              } else {
                cookies[name] = browserCookies[name];
              }
              updated = true;
            }
          }
        }
      }
    }
  ]).factory('$cookieStore', [
    '$cookies',
    function ($cookies) {
      return {
        get: function (key) {
          var value = $cookies[key];
          return value ? angular.fromJson(value) : value;
        },
        put: function (key, value) {
          $cookies[key] = angular.toJson(value);
        },
        remove: function (key) {
          delete $cookies[key];
        }
      };
    }
  ]);
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  var $sanitizeMinErr = angular.$$minErr('$sanitize');
  var $sanitize = function (html) {
    var buf = [];
    htmlParser(html, htmlSanitizeWriter(buf));
    return buf.join('');
  };
  var START_TAG_REGEXP = /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/, END_TAG_REGEXP = /^<\s*\/\s*([\w:-]+)[^>]*>/, ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g, BEGIN_TAG_REGEXP = /^</, BEGING_END_TAGE_REGEXP = /^<\s*\//, COMMENT_REGEXP = /<!--(.*?)-->/g, CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g, URI_REGEXP = /^((ftp|https?):\/\/|mailto:|tel:|#)/i, NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g;
  var voidElements = makeMap('area,br,col,hr,img,wbr');
  var optionalEndTagBlockElements = makeMap('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr'), optionalEndTagInlineElements = makeMap('rp,rt'), optionalEndTagElements = angular.extend({}, optionalEndTagInlineElements, optionalEndTagBlockElements);
  var blockElements = angular.extend({}, optionalEndTagBlockElements, makeMap('address,article,aside,' + 'blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,' + 'header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul'));
  var inlineElements = angular.extend({}, optionalEndTagInlineElements, makeMap('a,abbr,acronym,b,bdi,bdo,' + 'big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,' + 'span,strike,strong,sub,sup,time,tt,u,var'));
  var specialElements = makeMap('script,style');
  var validElements = angular.extend({}, voidElements, blockElements, inlineElements, optionalEndTagElements);
  var uriAttrs = makeMap('background,cite,href,longdesc,src,usemap');
  var validAttrs = angular.extend({}, uriAttrs, makeMap('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' + 'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' + 'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' + 'scope,scrolling,shape,span,start,summary,target,title,type,' + 'valign,value,vspace,width'));
  function makeMap(str) {
    var obj = {}, items = str.split(','), i;
    for (i = 0; i < items.length; i++)
      obj[items[i]] = true;
    return obj;
  }
  function htmlParser(html, handler) {
    var index, chars, match, stack = [], last = html;
    stack.last = function () {
      return stack[stack.length - 1];
    };
    while (html) {
      chars = true;
      if (!stack.last() || !specialElements[stack.last()]) {
        if (html.indexOf('<!--') === 0) {
          index = html.indexOf('-->');
          if (index >= 0) {
            if (handler.comment)
              handler.comment(html.substring(4, index));
            html = html.substring(index + 3);
            chars = false;
          }
        } else if (BEGING_END_TAGE_REGEXP.test(html)) {
          match = html.match(END_TAG_REGEXP);
          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(END_TAG_REGEXP, parseEndTag);
            chars = false;
          }
        } else if (BEGIN_TAG_REGEXP.test(html)) {
          match = html.match(START_TAG_REGEXP);
          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(START_TAG_REGEXP, parseStartTag);
            chars = false;
          }
        }
        if (chars) {
          index = html.indexOf('<');
          var text = index < 0 ? html : html.substring(0, index);
          html = index < 0 ? '' : html.substring(index);
          if (handler.chars)
            handler.chars(decodeEntities(text));
        }
      } else {
        html = html.replace(new RegExp('(.*)<\\s*\\/\\s*' + stack.last() + '[^>]*>', 'i'), function (all, text) {
          text = text.replace(COMMENT_REGEXP, '$1').replace(CDATA_REGEXP, '$1');
          if (handler.chars)
            handler.chars(decodeEntities(text));
          return '';
        });
        parseEndTag('', stack.last());
      }
      if (html == last) {
        throw $sanitizeMinErr('badparse', 'The sanitizer was unable to parse the following block of html: {0}', html);
      }
      last = html;
    }
    parseEndTag();
    function parseStartTag(tag, tagName, rest, unary) {
      tagName = angular.lowercase(tagName);
      if (blockElements[tagName]) {
        while (stack.last() && inlineElements[stack.last()]) {
          parseEndTag('', stack.last());
        }
      }
      if (optionalEndTagElements[tagName] && stack.last() == tagName) {
        parseEndTag('', tagName);
      }
      unary = voidElements[tagName] || !!unary;
      if (!unary)
        stack.push(tagName);
      var attrs = {};
      rest.replace(ATTR_REGEXP, function (match, name, doubleQuotedValue, singleQuotedValue, unquotedValue) {
        var value = doubleQuotedValue || singleQuotedValue || unquotedValue || '';
        attrs[name] = decodeEntities(value);
      });
      if (handler.start)
        handler.start(tagName, attrs, unary);
    }
    function parseEndTag(tag, tagName) {
      var pos = 0, i;
      tagName = angular.lowercase(tagName);
      if (tagName)
        for (pos = stack.length - 1; pos >= 0; pos--)
          if (stack[pos] == tagName)
            break;
      if (pos >= 0) {
        for (i = stack.length - 1; i >= pos; i--)
          if (handler.end)
            handler.end(stack[i]);
        stack.length = pos;
      }
    }
  }
  var hiddenPre = document.createElement('pre');
  function decodeEntities(value) {
    hiddenPre.innerHTML = value.replace(/</g, '&lt;');
    return hiddenPre.innerText || hiddenPre.textContent || '';
  }
  function encodeEntities(value) {
    return value.replace(/&/g, '&amp;').replace(NON_ALPHANUMERIC_REGEXP, function (value) {
      return '&#' + value.charCodeAt(0) + ';';
    }).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function htmlSanitizeWriter(buf) {
    var ignore = false;
    var out = angular.bind(buf, buf.push);
    return {
      start: function (tag, attrs, unary) {
        tag = angular.lowercase(tag);
        if (!ignore && specialElements[tag]) {
          ignore = tag;
        }
        if (!ignore && validElements[tag] == true) {
          out('<');
          out(tag);
          angular.forEach(attrs, function (value, key) {
            var lkey = angular.lowercase(key);
            if (validAttrs[lkey] == true && (uriAttrs[lkey] !== true || value.match(URI_REGEXP))) {
              out(' ');
              out(key);
              out('="');
              out(encodeEntities(value));
              out('"');
            }
          });
          out(unary ? '/>' : '>');
        }
      },
      end: function (tag) {
        tag = angular.lowercase(tag);
        if (!ignore && validElements[tag] == true) {
          out('</');
          out(tag);
          out('>');
        }
        if (tag == ignore) {
          ignore = false;
        }
      },
      chars: function (chars) {
        if (!ignore) {
          out(encodeEntities(chars));
        }
      }
    };
  }
  angular.module('ngSanitize', []).value('$sanitize', $sanitize);
  angular.module('ngSanitize').filter('linky', function () {
    var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s\.\;\,\(\)\{\}\<\>]/, MAILTO_REGEXP = /^mailto:/;
    return function (text, target) {
      if (!text)
        return text;
      var match;
      var raw = text;
      var html = [];
      var writer = htmlSanitizeWriter(html);
      var url;
      var i;
      var properties = {};
      if (angular.isDefined(target)) {
        properties.target = target;
      }
      while (match = raw.match(LINKY_URL_REGEXP)) {
        url = match[0];
        if (match[2] == match[3])
          url = 'mailto:' + url;
        i = match.index;
        writer.chars(raw.substr(0, i));
        properties.href = url;
        writer.start('a', properties);
        writer.chars(match[0].replace(MAILTO_REGEXP, ''));
        writer.end('a');
        raw = raw.substring(i + match[0].length);
      }
      writer.chars(raw);
      return html.join('');
    };
  });
}(window, window.angular));