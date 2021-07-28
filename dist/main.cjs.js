'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var tinyDebounce = function debounce (fn, delay) {
  var timeoutID = null;
  return function () {
    clearTimeout(timeoutID);
    var args = arguments;
    var that = this;
    timeoutID = setTimeout(function () {
      fn.apply(that, args);
    }, delay);
  }
};

/**
 * Has own property.
 *
 * @type {Function}
 */

var has = Object.prototype.hasOwnProperty;

/**
 * To string.
 *
 * @type {Function}
 */

var toString = Object.prototype.toString;

/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty(val) {
  // Null and Undefined...
  if (val == null) return true

  // Booleans...
  if ('boolean' == typeof val) return false

  // Numbers...
  if ('number' == typeof val) return val === 0

  // Strings...
  if ('string' == typeof val) return val.length === 0

  // Functions...
  if ('function' == typeof val) return val.length === 0

  // Arrays...
  if (Array.isArray(val)) return val.length === 0

  // Errors...
  if (val instanceof Error) return val.message === ''

  // Objects...
  if (val.toString == toString) {
    switch (val.toString()) {

      // Maps, Sets, Files and Errors...
      case '[object File]':
      case '[object Map]':
      case '[object Set]': {
        return val.size === 0
      }

      // Plain objects...
      case '[object Object]': {
        for (var key in val) {
          if (has.call(val, key)) return false
        }

        return true
      }
    }
  }

  // Anything else...
  return false
}

/**
 * Export `isEmpty`.
 *
 * @type {Function}
 */

var lib = isEmpty;

//
// Main
//

function memoize (fn, options) {
  var cache = options && options.cache
    ? options.cache
    : cacheDefault;

  var serializer = options && options.serializer
    ? options.serializer
    : serializerDefault;

  var strategy = options && options.strategy
    ? options.strategy
    : strategyDefault;

  return strategy(fn, {
    cache: cache,
    serializer: serializer
  })
}

//
// Strategy
//

function isPrimitive (value) {
  return value == null || typeof value === 'number' || typeof value === 'boolean' // || typeof value === "string" 'unsafe' primitive for our needs
}

function monadic (fn, cache, serializer, arg) {
  var cacheKey = isPrimitive(arg) ? arg : serializer(arg);

  var computedValue = cache.get(cacheKey);
  if (typeof computedValue === 'undefined') {
    computedValue = fn.call(this, arg);
    cache.set(cacheKey, computedValue);
  }

  return computedValue
}

function variadic (fn, cache, serializer) {
  var args = Array.prototype.slice.call(arguments, 3);
  var cacheKey = serializer(args);

  var computedValue = cache.get(cacheKey);
  if (typeof computedValue === 'undefined') {
    computedValue = fn.apply(this, args);
    cache.set(cacheKey, computedValue);
  }

  return computedValue
}

function assemble (fn, context, strategy, cache, serialize) {
  return strategy.bind(
    context,
    fn,
    cache,
    serialize
  )
}

function strategyDefault (fn, options) {
  var strategy = fn.length === 1 ? monadic : variadic;

  return assemble(
    fn,
    this,
    strategy,
    options.cache.create(),
    options.serializer
  )
}

function strategyVariadic (fn, options) {
  var strategy = variadic;

  return assemble(
    fn,
    this,
    strategy,
    options.cache.create(),
    options.serializer
  )
}

function strategyMonadic (fn, options) {
  var strategy = monadic;

  return assemble(
    fn,
    this,
    strategy,
    options.cache.create(),
    options.serializer
  )
}

//
// Serializer
//

function serializerDefault () {
  return JSON.stringify(arguments)
}

//
// Cache
//

function ObjectWithoutPrototypeCache () {
  this.cache = Object.create(null);
}

ObjectWithoutPrototypeCache.prototype.has = function (key) {
  return (key in this.cache)
};

ObjectWithoutPrototypeCache.prototype.get = function (key) {
  return this.cache[key]
};

ObjectWithoutPrototypeCache.prototype.set = function (key, value) {
  this.cache[key] = value;
};

var cacheDefault = {
  create: function create () {
    return new ObjectWithoutPrototypeCache()
  }
};

//
// API
//

var src = memoize;
var strategies = {
  variadic: strategyVariadic,
  monadic: strategyMonadic
};
src.strategies = strategies;

var validateData = function validateData(data) {
  return !!data && !lib(data);
};

var getValidatedData = function getValidatedData(data) {
  return validateData(data) ? data : [];
};

var walk = function walk(_a) {
  var data = _a.data,
      props = __rest(_a, ["data"]);

  var validatedData = getValidatedData(data);

  var propsWithDefaultValues = __assign({
    parent: '',
    level: 0
  }, props);

  var handleArray = function handleArray(dataAsArray) {
    return dataAsArray.reduce(function (all, node, index) {
      var branchProps = __assign({
        node: node,
        index: index,
        nodeName: node.key
      }, propsWithDefaultValues);

      var branch = generateBranch(branchProps);
      return __spreadArrays(all, branch);
    }, []);
  };

  var handleObject = function handleObject(dataAsObject) {
    return Object.entries(dataAsObject).sort(function (a, b) {
      return a[1].index - b[1].index;
    }) // sorted by index
    .reduce(function (all, _a) {
      var nodeName = _a[0],
          node = _a[1];

      var branchProps = __assign({
        node: node,
        nodeName: nodeName
      }, propsWithDefaultValues);

      var branch = generateBranch(branchProps);
      return __spreadArrays(all, branch);
    }, []);
  };

  return Array.isArray(validatedData) ? handleArray(validatedData) : handleObject(validatedData);
};

var defaultMatchSearch = function defaultMatchSearch(_a) {
  var label = _a.label,
      searchTerm = _a.searchTerm;

  var processString = function processString(text) {
    return text.trim().toLowerCase();
  };

  return processString(label).includes(processString(searchTerm));
};

var defaultLocale = function defaultLocale(_a) {
  var label = _a.label;
  return label;
};

var generateBranch = function generateBranch(_a) {
  var node = _a.node,
      nodeName = _a.nodeName,
      _b = _a.matchSearch,
      matchSearch = _b === void 0 ? defaultMatchSearch : _b,
      _c = _a.locale,
      locale = _c === void 0 ? defaultLocale : _c,
      props = __rest(_a, ["node", "nodeName", "matchSearch", "locale"]);

  var parent = props.parent,
      level = props.level,
      openNodes = props.openNodes,
      searchTerm = props.searchTerm;

  var nodes = node.nodes,
      _d = node.label,
      rawLabel = _d === void 0 ? 'unknown' : _d,
      nodeHasNodes = node.hasNodes,
      nodeProps = __rest(node, ["nodes", "label", "hasNodes"]);

  var key = [parent, nodeName].filter(function (x) {
    return x;
  }).join('/');
  var hasNodes = nodeHasNodes || validateData(nodes);
  var isOpen = hasNodes && (openNodes.includes(key) || !!searchTerm);
  var label = locale(__assign({
    label: rawLabel
  }, nodeProps));
  var isVisible = !searchTerm || matchSearch(__assign({
    label: label,
    searchTerm: searchTerm
  }, nodeProps));

  var currentItem = __assign(__assign(__assign({}, props), nodeProps), {
    label: label,
    hasNodes: hasNodes,
    isOpen: isOpen,
    key: key
  });

  var data = getValidatedData(nodes);
  var nextLevelItems = isOpen ? walk(__assign(__assign({
    data: data,
    locale: locale,
    matchSearch: matchSearch
  }, props), {
    parent: key,
    level: level + 1
  })) : [];
  return isVisible ? __spreadArrays([currentItem], nextLevelItems) : nextLevelItems;
};

var fastWalk = src(walk);
var slowWalk = walk;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var classnames = createCommonjsModule(function (module) {
/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg) && arg.length) {
				var inner = classNames.apply(null, arg);
				if (inner) {
					classes.push(inner);
				}
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if ( module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else {
		window.classNames = classNames;
	}
}());
});

var DEFAULT_PADDING = 0.75;
var ICON_SIZE = 2;
var LEVEL_SPACE = 1.75;

var ToggleIcon = function ToggleIcon(_a) {
  var on = _a.on,
      openedIcon = _a.openedIcon,
      closedIcon = _a.closedIcon;
  return React.createElement("div", {
    role: "img",
    "aria-label": "Toggle",
    className: "rstm-toggle-icon-symbol"
  }, on ? openedIcon : closedIcon);
};

var ItemComponent = function ItemComponent(_a) {
  var _b = _a.hasNodes,
      hasNodes = _b === void 0 ? false : _b,
      _c = _a.isOpen,
      isOpen = _c === void 0 ? false : _c,
      _d = _a.level,
      level = _d === void 0 ? 0 : _d,
      onClick = _a.onClick,
      toggleNode = _a.toggleNode,
      active = _a.active,
      focused = _a.focused,
      _e = _a.openedIcon,
      openedIcon = _e === void 0 ? '-' : _e,
      _f = _a.closedIcon,
      closedIcon = _f === void 0 ? '+' : _f,
      _g = _a.label,
      label = _g === void 0 ? 'unknown' : _g,
      _h = _a.style,
      style = _h === void 0 ? {} : _h;
  return React.createElement("li", {
    className: classnames('rstm-tree-item', "rstm-tree-item-level" + level, {
      'rstm-tree-item--active': active
    }, {
      'rstm-tree-item--focused': focused
    }),
    style: __assign({
      paddingLeft: DEFAULT_PADDING + ICON_SIZE * (hasNodes ? 0 : 1) + level * LEVEL_SPACE + "rem"
    }, style),
    role: "button",
    "aria-pressed": active,
    onClick: onClick
  }, hasNodes && React.createElement("div", {
    className: "rstm-toggle-icon",
    onClick: function onClick(e) {
      hasNodes && toggleNode && toggleNode();
      e.stopPropagation();
    }
  }, React.createElement(ToggleIcon, {
    on: isOpen,
    openedIcon: openedIcon,
    closedIcon: closedIcon
  })), label);
};
var defaultChildren = function defaultChildren(_a) {
  var search = _a.search,
      items = _a.items;

  var onSearch = function onSearch(e) {
    var value = e.target.value;
    search && search(value);
  };

  return React.createElement(React.Fragment, null, search && React.createElement("input", {
    className: "rstm-search",
    "aria-label": "Type and search",
    type: "search",
    placeholder: "Type and search",
    onChange: onSearch
  }), React.createElement("ul", {
    className: "rstm-tree-item-group"
  }, items.map(function (_a) {
    var key = _a.key,
        props = __rest(_a, ["key"]);

    return React.createElement(ItemComponent, __assign({
      key: key
    }, props));
  })));
};

var KeyDown = function KeyDown(_a) {
  var children = _a.children,
      up = _a.up,
      down = _a.down,
      left = _a.left,
      right = _a.right,
      enter = _a.enter;
  return React.createElement("div", {
    tabIndex: 0,
    onKeyDown: function onKeyDown(e) {
      switch (e.key) {
        case 'ArrowUp':
          {
            up();
            break;
          }

        case 'ArrowDown':
          {
            down();
            break;
          }

        case 'ArrowLeft':
          {
            left();
            break;
          }

        case 'ArrowRight':
          {
            right();
            break;
          }

        case 'Enter':
          {
            enter();
            break;
          }
      }
    }
  }, children);
};

var defaultOnClick = function defaultOnClick(props) {
  return console.log(props);
}; // eslint-disable-line no-console


var TreeMenu =
/** @class */
function (_super) {
  __extends(TreeMenu, _super);

  function TreeMenu() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.state = {
      openNodes: _this.props.initialOpenNodes || [],
      searchTerm: '',
      activeKey: _this.props.initialActiveKey || '',
      focusKey: _this.props.initialFocusKey || ''
    };

    _this.resetOpenNodes = function (newOpenNodes, activeKey, focusKey) {
      var initialOpenNodes = _this.props.initialOpenNodes;
      var openNodes = Array.isArray(newOpenNodes) && newOpenNodes || initialOpenNodes || [];

      _this.setState({
        openNodes: openNodes,
        searchTerm: '',
        activeKey: activeKey || '',
        focusKey: focusKey || activeKey || ''
      });
    };

    _this.search = function (value) {
      var debounceTime = _this.props.debounceTime;
      var search = tinyDebounce(function (searchTerm) {
        return _this.setState({
          searchTerm: searchTerm
        });
      }, debounceTime);
      search(value);
    };

    _this.toggleNode = function (node) {
      var openNodes = _this.state.openNodes;
      var newOpenNodes = openNodes.includes(node) ? openNodes.filter(function (openNode) {
        return openNode !== node;
      }) : __spreadArrays(openNodes, [node]);

      _this.setState({
        openNodes: newOpenNodes
      });
    };

    _this.generateItems = function () {
      var _a = _this.props,
          data = _a.data,
          onClickItem = _a.onClickItem,
          locale = _a.locale,
          matchSearch = _a.matchSearch;
      var searchTerm = _this.state.searchTerm;
      var openNodes = _this.props.openNodes || _this.state.openNodes;
      var activeKey = _this.props.activeKey || _this.state.activeKey;
      var focusKey = _this.props.focusKey || _this.state.focusKey;
      var defaultSearch = _this.props.cacheSearch ? fastWalk : slowWalk;
      var items = data ? defaultSearch({
        data: data,
        openNodes: openNodes,
        searchTerm: searchTerm,
        locale: locale,
        matchSearch: matchSearch
      }) : [];
      return items.map(function (item) {
        var focused = item.key === focusKey;
        var active = item.key === activeKey;

        var onClick = function onClick() {
          var newActiveKey = _this.props.activeKey || item.key;

          _this.setState({
            activeKey: newActiveKey,
            focusKey: newActiveKey
          });

          onClickItem && onClickItem(item);
        };

        var toggleNode = item.hasNodes ? function () {
          return _this.toggleNode(item.key);
        } : undefined;
        return __assign(__assign({}, item), {
          focused: focused,
          active: active,
          onClick: onClick,
          toggleNode: toggleNode
        });
      });
    };

    _this.getKeyDownProps = function (items) {
      var onClickItem = _this.props.onClickItem;
      var _a = _this.state,
          focusKey = _a.focusKey,
          activeKey = _a.activeKey,
          searchTerm = _a.searchTerm;
      var focusIndex = items.findIndex(function (item) {
        return item.key === (focusKey || activeKey);
      });

      var getFocusKey = function getFocusKey(item) {
        var keyArray = item.key.split('/');
        return keyArray.length > 1 ? keyArray.slice(0, keyArray.length - 1).join('/') : item.key;
      };

      return {
        up: function up() {
          _this.setState(function (_a) {
            var focusKey = _a.focusKey;
            return {
              focusKey: focusIndex > 0 ? items[focusIndex - 1].key : focusKey
            };
          });
        },
        down: function down() {
          _this.setState(function (_a) {
            var focusKey = _a.focusKey;
            return {
              focusKey: focusIndex < items.length - 1 ? items[focusIndex + 1].key : focusKey
            };
          });
        },
        left: function left() {
          var item = items[focusIndex];

          if (item) {
            _this.setState(function (_a) {
              var openNodes = _a.openNodes,
                  rest = __rest(_a, ["openNodes"]);

              var newOpenNodes = openNodes.filter(function (node) {
                return node !== item.key;
              });
              return item.isOpen ? __assign(__assign({}, rest), {
                openNodes: newOpenNodes,
                focusKey: item.key
              }) : __assign(__assign({}, rest), {
                focusKey: getFocusKey(item)
              });
            });
          }
        },
        right: function right() {
          var _a = items[focusIndex],
              hasNodes = _a.hasNodes,
              key = _a.key;
          if (hasNodes) _this.setState(function (_a) {
            var openNodes = _a.openNodes;
            return {
              openNodes: __spreadArrays(openNodes, [key])
            };
          });
        },
        enter: function enter() {
          _this.setState(function (_a) {
            var focusKey = _a.focusKey;
            return {
              activeKey: focusKey
            };
          });

          onClickItem && onClickItem(items[focusIndex]);
        }
      };
    };

    return _this;
  }

  TreeMenu.prototype.componentDidUpdate = function (prevProps, prevState) {
    var _a = this.props,
        data = _a.data,
        initialOpenNodes = _a.initialOpenNodes,
        resetOpenNodesOnDataUpdate = _a.resetOpenNodesOnDataUpdate;

    if (prevProps.data !== data && resetOpenNodesOnDataUpdate && initialOpenNodes) {
      this.setState({
        openNodes: initialOpenNodes
      });
    }

    if (prevState.openNodes !== this.state.openNodes) {
      this.props.onOpenNodesChange(this.state.openNodes);
    }

    if (prevState.activeKey !== this.state.activeKey) {
      this.props.onActiveKeyChange(this.state.activeKey);
    }

    if (prevState.focusKey !== this.state.focusKey) {
      this.props.onFocusKeyChange(this.state.focusKey);
    }
  };

  TreeMenu.prototype.render = function () {
    var _a = this.props,
        children = _a.children,
        hasSearch = _a.hasSearch,
        disableKeyboard = _a.disableKeyboard;
    var searchTerm = this.state.searchTerm;
    var search = this.search;
    var items = this.generateItems();
    var resetOpenNodes = this.resetOpenNodes;
    var render = children || defaultChildren;
    var renderProps = hasSearch ? {
      search: search,
      resetOpenNodes: resetOpenNodes,
      items: items,
      searchTerm: searchTerm
    } : {
      items: items,
      resetOpenNodes: resetOpenNodes
    };
    return disableKeyboard ? render(renderProps) : React.createElement(KeyDown, __assign({}, this.getKeyDownProps(items)), render(renderProps));
  };

  TreeMenu.defaultProps = {
    data: {},
    onClickItem: defaultOnClick,
    debounceTime: 125,
    children: defaultChildren,
    hasSearch: true,
    cacheSearch: true,
    resetOpenNodesOnDataUpdate: false,
    disableKeyboard: false,
    onOpenNodesChange: function onOpenNodesChange() {},
    onActiveKeyChange: function onActiveKeyChange() {},
    onFocusKeyChange: function onFocusKeyChange() {}
  };
  return TreeMenu;
}(React.Component);

exports.ItemComponent = ItemComponent;
exports.KeyDown = KeyDown;
exports.default = TreeMenu;
exports.defaultChildren = defaultChildren;
