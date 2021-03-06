import React, { createContext, useMemo, useContext, useState, useEffect, memo, useRef, useLayoutEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { geoPath, geoEqualEarth, geoMercator, geoTransverseMercator, geoAlbers, geoAlbersUsa, geoAzimuthalEqualArea, geoAzimuthalEquidistant, geoOrthographic, geoConicConformal, geoConicEqualArea, geoConicEquidistant, geoGraticule } from 'd3-geo';
import { feature } from 'topojson-client';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var MapContext = createContext();

var projections = {
  geoEqualEarth: geoEqualEarth,
  geoMercator: geoMercator,
  geoTransverseMercator: geoTransverseMercator,
  geoAlbers: geoAlbers,
  geoAlbersUsa: geoAlbersUsa,
  geoAzimuthalEqualArea: geoAzimuthalEqualArea,
  geoAzimuthalEquidistant: geoAzimuthalEquidistant,
  geoOrthographic: geoOrthographic,
  geoConicConformal: geoConicConformal,
  geoConicEqualArea: geoConicEqualArea,
  geoConicEquidistant: geoConicEquidistant
};

var makeProjection = function makeProjection(_ref) {
  var _ref$projectionConfig = _ref.projectionConfig,
      projectionConfig = _ref$projectionConfig === undefined ? {} : _ref$projectionConfig,
      _ref$projection = _ref.projection,
      projection = _ref$projection === undefined ? "geoEqualEarth" : _ref$projection,
      _ref$width = _ref.width,
      width = _ref$width === undefined ? 800 : _ref$width,
      _ref$height = _ref.height,
      height = _ref$height === undefined ? 500 : _ref$height;

  var isFunc = typeof projection === "function";

  if (isFunc) return projection;

  var proj = projections[projection]().translate([width / 2, height / 2]);

  var supported = [proj.center ? "center" : null, proj.rotate ? "rotate" : null, proj.scale ? "scale" : null, proj.parallels ? "parallels" : null];

  supported.forEach(function (d) {
    if (!d) return;
    proj = proj[d](projectionConfig[d] || proj[d]());
  });

  return proj;
};

var MapProvider = function MapProvider(_ref2) {
  var width = _ref2.width,
      height = _ref2.height,
      projection = _ref2.projection,
      projectionConfig = _ref2.projectionConfig,
      restProps = objectWithoutProperties(_ref2, ["width", "height", "projection", "projectionConfig"]);

  var c = projectionConfig.center || [];
  var r = projectionConfig.rotate || [];
  var p = projectionConfig.parallels || [];
  var s = projectionConfig.scale || null;

  var value = useMemo(function () {
    var proj = makeProjection({
      projectionConfig: projectionConfig,
      projection: projection,
      width: width,
      height: height
    });
    return {
      width: width,
      height: height,
      projection: proj,
      path: geoPath().projection(proj)
    };
  }, [width, height, projection, c[0], c[1], r[0], r[1], r[2], p[0], p[1], s]);

  return React.createElement(MapContext.Provider, _extends({ value: value }, restProps));
};

MapProvider.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  projection: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  projectionConfig: PropTypes.object
};

var ComposableMap = function ComposableMap(_ref) {
  var _ref$left = _ref.left,
      left = _ref$left === undefined ? 0 : _ref$left,
      _ref$top = _ref.top,
      top = _ref$top === undefined ? 0 : _ref$top,
      _ref$width = _ref.width,
      width = _ref$width === undefined ? 800 : _ref$width,
      _ref$height = _ref.height,
      height = _ref$height === undefined ? 600 : _ref$height,
      _ref$projection = _ref.projection,
      projection = _ref$projection === undefined ? "geoEqualEarth" : _ref$projection,
      _ref$projectionConfig = _ref.projectionConfig,
      projectionConfig = _ref$projectionConfig === undefined ? {} : _ref$projectionConfig,
      _ref$className = _ref.className,
      className = _ref$className === undefined ? "" : _ref$className,
      restProps = objectWithoutProperties(_ref, ["left", "top", "width", "height", "projection", "projectionConfig", "className"]);

  return React.createElement(
    MapProvider,
    {
      left: left,
      top: top,
      width: width,
      height: height,
      projection: projection,
      projectionConfig: projectionConfig
    },
    React.createElement("svg", _extends({
      viewBox: left + " " + top + " " + width + " " + height,
      className: "rsm-svg " + className
    }, restProps))
  );
};

ComposableMap.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  left: PropTypes.number,
  top: PropTypes.number,
  projection: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  projectionConfig: PropTypes.object,
  className: PropTypes.string
};

function fetchGeographies(url) {
  return fetch(url).then(function (res) {
    if (!res.ok) {
      throw Error(res.statusText);
    }
    return res.json();
  }).catch(function (error) {
    console.log("There was a problem when fetching the data: ", error);
  });
}

function getFeatures(geographies, parseGeographies) {
  if (Array.isArray(geographies)) return parseGeographies ? parseGeographies(geographies) : geographies;
  var feats = feature(geographies, geographies.objects[Object.keys(geographies.objects)[0]]).features;
  return parseGeographies ? parseGeographies(feats) : feats;
}

function prepareFeatures(geographies, path) {
  return geographies ? geographies.map(function (d, i) {
    return _extends({}, d, {
      rsmKey: "geo-" + i,
      svgPath: path(d)
    });
  }) : [];
}

function createConnectorPath() {
  var dx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30;
  var dy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 30;
  var curve = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

  var curvature = Array.isArray(curve) ? curve : [curve, curve];
  var curveX = dx / 2 * curvature[0];
  var curveY = dy / 2 * curvature[1];
  return "M" + 0 + "," + 0 + " Q" + (-dx / 2 - curveX) + "," + (-dy / 2 + curveY) + " " + -dx + "," + -dy;
}

function isString(geo) {
  return typeof geo === "string";
}

function useGeographies(_ref) {
  var geography = _ref.geography,
      parseGeographies = _ref.parseGeographies;

  var _useContext = useContext(MapContext),
      path = _useContext.path;

  var _useState = useState(),
      _useState2 = slicedToArray(_useState, 2),
      geographies = _useState2[0],
      setGeographies = _useState2[1];

  useEffect(function () {
    if (typeof window === "undefined") return;

    if (isString(geography)) {
      fetchGeographies(geography).then(function (geos) {
        if (geos) setGeographies(getFeatures(geos, parseGeographies));
      });
    } else {
      setGeographies(getFeatures(geography, parseGeographies));
    }
  }, [geography]);

  var output = useMemo(function () {
    return prepareFeatures(geographies, path);
  }, [geographies, path]);

  return { geographies: output };
}

var Geographies = function Geographies(_ref) {
  var geography = _ref.geography,
      children = _ref.children,
      parseGeographies = _ref.parseGeographies,
      _ref$className = _ref.className,
      className = _ref$className === undefined ? "" : _ref$className,
      restProps = objectWithoutProperties(_ref, ["geography", "children", "parseGeographies", "className"]);

  var _useContext = useContext(MapContext),
      path = _useContext.path,
      projection = _useContext.projection;

  var _useGeographies = useGeographies({ geography: geography, parseGeographies: parseGeographies }),
      geographies = _useGeographies.geographies;

  return React.createElement(
    "g",
    _extends({ className: "rsm-geographies " + className }, restProps),
    geographies && geographies.length > 0 && children({ geographies: geographies, path: path, projection: projection })
  );
};

Geographies.propTypes = {
  geography: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  children: PropTypes.func,
  parseGeographies: PropTypes.func,
  className: PropTypes.string
};

var Geography = function Geography(_ref) {
  var geography = _ref.geography,
      onMouseEnter = _ref.onMouseEnter,
      onMouseLeave = _ref.onMouseLeave,
      onMouseDown = _ref.onMouseDown,
      onMouseUp = _ref.onMouseUp,
      onFocus = _ref.onFocus,
      onBlur = _ref.onBlur,
      _ref$style = _ref.style,
      style = _ref$style === undefined ? {} : _ref$style,
      _ref$className = _ref.className,
      className = _ref$className === undefined ? "" : _ref$className,
      restProps = objectWithoutProperties(_ref, ["geography", "onMouseEnter", "onMouseLeave", "onMouseDown", "onMouseUp", "onFocus", "onBlur", "style", "className"]);

  var _useState = useState(false),
      _useState2 = slicedToArray(_useState, 2),
      isPressed = _useState2[0],
      setPressed = _useState2[1];

  var _useState3 = useState(false),
      _useState4 = slicedToArray(_useState3, 2),
      isFocused = _useState4[0],
      setFocus = _useState4[1];

  function handleMouseEnter(evt) {
    setFocus(true);
    if (onMouseEnter) onMouseEnter(evt);
  }

  function handleMouseLeave(evt) {
    setFocus(false);
    if (isPressed) setPressed(false);
    if (onMouseLeave) onMouseLeave(evt);
  }

  function handleFocus(evt) {
    setFocus(true);
    if (onFocus) onFocus(evt);
  }

  function handleBlur(evt) {
    setFocus(false);
    if (isPressed) setPressed(false);
    if (onBlur) onBlur(evt);
  }

  function handleMouseDown(evt) {
    setPressed(true);
    if (onMouseDown) onMouseDown(evt);
  }

  function handleMouseUp(evt) {
    setPressed(false);
    if (onMouseUp) onMouseUp(evt);
  }

  return React.createElement("path", _extends({
    role: "geography",
    tabIndex: "0",
    className: "rsm-geography " + className,
    d: geography.svgPath,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    style: style[isPressed || isFocused ? isPressed ? "pressed" : "hover" : "default"]
  }, restProps));
};

Geography.propTypes = {
  geography: PropTypes.object,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string
};

var Geography$1 = memo(Geography);

var Graticule = function Graticule(_ref) {
  var _ref$fill = _ref.fill,
      fill = _ref$fill === undefined ? "transparent" : _ref$fill,
      _ref$stroke = _ref.stroke,
      stroke = _ref$stroke === undefined ? "currentcolor" : _ref$stroke,
      _ref$step = _ref.step,
      step = _ref$step === undefined ? [10, 10] : _ref$step,
      _ref$className = _ref.className,
      className = _ref$className === undefined ? "" : _ref$className,
      restProps = objectWithoutProperties(_ref, ["fill", "stroke", "step", "className"]);

  var _useContext = useContext(MapContext),
      path = _useContext.path;

  return React.createElement("path", _extends({
    d: path(geoGraticule().step(step)()),
    fill: fill,
    stroke: stroke,
    className: "rsm-graticule " + className
  }, restProps));
};

Graticule.propTypes = {
  fill: PropTypes.string,
  stroke: PropTypes.string,
  step: PropTypes.array,
  className: PropTypes.string
};

var Graticule$1 = memo(Graticule);

function useZoomPan(_ref) {
  var _ref$center = _ref.center,
      center = _ref$center === undefined ? [0, 0] : _ref$center,
      _ref$zoom = _ref.zoom,
      zoom = _ref$zoom === undefined ? 1 : _ref$zoom,
      _ref$minZoom = _ref.minZoom,
      minZoom = _ref$minZoom === undefined ? 1 : _ref$minZoom,
      _ref$maxZoom = _ref.maxZoom,
      maxZoom = _ref$maxZoom === undefined ? 5 : _ref$maxZoom,
      _ref$zoomSensitivity = _ref.zoomSensitivity,
      zoomSensitivity = _ref$zoomSensitivity === undefined ? 0.025 : _ref$zoomSensitivity,
      onZoomStart = _ref.onZoomStart,
      onZoomEnd = _ref.onZoomEnd,
      onMoveStart = _ref.onMoveStart,
      onMoveEnd = _ref.onMoveEnd,
      _ref$disablePanning = _ref.disablePanning,
      disablePanning = _ref$disablePanning === undefined ? false : _ref$disablePanning,
      _ref$disableZooming = _ref.disableZooming,
      disableZooming = _ref$disableZooming === undefined ? false : _ref$disableZooming;

  var _useContext = useContext(MapContext),
      width = _useContext.width,
      height = _useContext.height,
      projection = _useContext.projection;

  var wheelTimer = useRef(null);

  var _useState = useState(function () {
    var c = projection(center);
    return {
      x: width / 2 - c[0] * zoom,
      y: height / 2 - c[1] * zoom,
      last: [width / 2 - c[0] * zoom, height / 2 - c[1] * zoom],
      zoom: zoom,
      dragging: false,
      zooming: false
    };
  }),
      _useState2 = slicedToArray(_useState, 2),
      position = _useState2[0],
      setPosition = _useState2[1];

  var elRef = useRef();
  var point = useRef();
  var isPointerDown = useRef(false);
  var pointerOrigin = useRef();

  function getPointFromEvent(event) {
    var svg = elRef.current.closest("svg");
    if (event.targetTouches) {
      point.current.x = event.targetTouches[0].clientX;
      point.current.y = event.targetTouches[0].clientY;
    } else {
      point.current.x = event.clientX;
      point.current.y = event.clientY;
    }
    var invertedSVGMatrix = svg.getScreenCTM().inverse();
    return point.current.matrixTransform(invertedSVGMatrix);
  }

  function onPointerDown(event) {
    if (disablePanning) return;
    isPointerDown.current = true;
    pointerOrigin.current = getPointFromEvent(event);
    setPosition(function (position) {
      if (onMoveStart) onMoveStart(event, _extends({}, position, { dragging: true }));
      return _extends({}, position, { dragging: true });
    });
  }

  function onPointerMove(event) {
    if (!isPointerDown.current) return;
    event.preventDefault();
    var pointerPosition = getPointFromEvent(event);
    setPosition(function (position) {
      return _extends({}, position, {
        x: position.last[0] + (pointerPosition.x - pointerOrigin.current.x),
        y: position.last[1] + (pointerPosition.y - pointerOrigin.current.y)
      });
    });
  }

  function onPointerUp(event) {
    isPointerDown.current = false;
    setPosition(function (position) {
      if (onMoveEnd) {
        onMoveEnd(event, _extends({}, position, { last: [position.x, position.y], dragging: false }));
      }
      return _extends({}, position, {
        last: [position.x, position.y],
        dragging: false
      });
    });
  }

  function handleWheel(event) {
    if (!event.ctrlKey) return;
    if (disableZooming) return;
    event.preventDefault();

    var speed = event.deltaY * zoomSensitivity;

    setPosition(function (position) {
      var newZoom = position.zoom - speed;
      var zoom = newZoom < minZoom ? minZoom : newZoom > maxZoom ? maxZoom : newZoom;

      var pointerPosition = getPointFromEvent(event);

      var x = (position.x - pointerPosition.x) * zoom / position.zoom + pointerPosition.x;
      var y = (position.y - pointerPosition.y) * zoom / position.zoom + pointerPosition.y;

      window.clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(function () {
        setPosition(function (position) {
          if (onZoomEnd) onZoomEnd(event, position);
          return _extends({}, position, { zooming: false });
        });
      }, 66);

      if (onZoomStart) {
        onZoomStart(event, _extends({}, position, {
          x: x,
          y: y,
          last: [x, y],
          zoom: zoom,
          zooming: true
        }));
      }

      return _extends({}, position, {
        x: x,
        y: y,
        last: [x, y],
        zoom: zoom,
        zooming: true
      });
    });
  }

  useLayoutEffect(function () {
    var svg = elRef.current.closest("svg");
    point.current = svg.createSVGPoint();

    svg.addEventListener("wheel", handleWheel);

    if (window.PointerEvent) {
      svg.addEventListener("pointerdown", onPointerDown);
      svg.addEventListener("pointerup", onPointerUp);
      svg.addEventListener("pointerleave", onPointerUp);
      svg.addEventListener("pointermove", onPointerMove);
    } else {
      svg.addEventListener("mousedown", onPointerDown);
      svg.addEventListener("mouseup", onPointerUp);
      svg.addEventListener("mouseleave", onPointerUp);
      svg.addEventListener("mousemove", onPointerMove);
      svg.addEventListener("touchstart", onPointerDown);
      svg.addEventListener("touchend", onPointerUp);
      svg.addEventListener("touchmove", onPointerMove);
    }

    return function () {
      svg.removeEventListener("wheel", handleWheel);
      if (window.PointerEvent) {
        svg.removeEventListener("pointerdown", onPointerDown);
        svg.removeEventListener("pointerup", onPointerUp);
        svg.removeEventListener("pointerleave", onPointerUp);
        svg.removeEventListener("pointermove", onPointerMove);
      } else {
        svg.removeEventListener("mousedown", onPointerDown);
        svg.removeEventListener("mouseup", onPointerUp);
        svg.removeEventListener("mouseleave", onPointerUp);
        svg.removeEventListener("mousemove", onPointerMove);
        svg.removeEventListener("touchstart", onPointerDown);
        svg.removeEventListener("touchend", onPointerUp);
        svg.removeEventListener("touchmove", onPointerMove);
      }
    };
  }, []);

  useEffect(function () {
    setPosition(function (position) {
      var x = (position.x - width / 2) * zoom / position.zoom + width / 2;
      var y = (position.y - height / 2) * zoom / position.zoom + height / 2;
      return _extends({}, position, { x: x, y: y, last: [x, y], zoom: zoom });
    });
  }, [zoom]);

  useEffect(function () {
    var c = projection(center);
    setPosition(function (position) {
      return _extends({}, position, {
        x: width / 2 - c[0] * position.zoom,
        y: height / 2 - c[1] * position.zoom,
        last: [width / 2 - c[0] * position.zoom, height / 2 - c[1] * position.zoom]
      });
    });
  }, [center[0], center[1]]);

  return {
    elRef: elRef,
    position: position,
    transformString: "translate(" + position.x + " " + position.y + ") scale(" + position.zoom + ")"
  };
}

var ZoomableGroup = function ZoomableGroup(_ref) {
  var render = _ref.render,
      children = _ref.children,
      _ref$center = _ref.center,
      center = _ref$center === undefined ? [0, 0] : _ref$center,
      _ref$zoom = _ref.zoom,
      zoom = _ref$zoom === undefined ? 1 : _ref$zoom,
      _ref$minZoom = _ref.minZoom,
      minZoom = _ref$minZoom === undefined ? 1 : _ref$minZoom,
      _ref$maxZoom = _ref.maxZoom,
      maxZoom = _ref$maxZoom === undefined ? 5 : _ref$maxZoom,
      _ref$zoomSensitivity = _ref.zoomSensitivity,
      zoomSensitivity = _ref$zoomSensitivity === undefined ? 0.025 : _ref$zoomSensitivity,
      onZoomStart = _ref.onZoomStart,
      onZoomEnd = _ref.onZoomEnd,
      onMoveStart = _ref.onMoveStart,
      onMoveEnd = _ref.onMoveEnd,
      _ref$disablePanning = _ref.disablePanning,
      disablePanning = _ref$disablePanning === undefined ? false : _ref$disablePanning,
      _ref$disableZooming = _ref.disableZooming,
      disableZooming = _ref$disableZooming === undefined ? false : _ref$disableZooming,
      _ref$className = _ref.className,
      className = _ref$className === undefined ? "" : _ref$className,
      restProps = objectWithoutProperties(_ref, ["render", "children", "center", "zoom", "minZoom", "maxZoom", "zoomSensitivity", "onZoomStart", "onZoomEnd", "onMoveStart", "onMoveEnd", "disablePanning", "disableZooming", "className"]);

  var _useZoomPan = useZoomPan({
    center: center,
    zoom: zoom,
    minZoom: minZoom,
    maxZoom: maxZoom,
    zoomSensitivity: zoomSensitivity,
    onZoomStart: onZoomStart,
    onZoomEnd: onZoomEnd,
    onMoveStart: onMoveStart,
    onMoveEnd: onMoveEnd,
    disablePanning: disablePanning,
    disableZooming: disableZooming
  }),
      elRef = _useZoomPan.elRef,
      position = _useZoomPan.position,
      transformString = _useZoomPan.transformString;

  return React.createElement(
    "g",
    _extends({
      ref: elRef,
      className: "rsm-zoomable-group " + className
    }, restProps),
    render ? render(position) : React.createElement(
      "g",
      { transform: transformString },
      children
    )
  );
};

ZoomableGroup.propTypes = {
  render: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  center: PropTypes.array,
  zoom: PropTypes.number,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  zoomSensitivity: PropTypes.number,
  onZoomStart: PropTypes.func,
  onZoomEnd: PropTypes.func,
  onMoveStart: PropTypes.func,
  onMoveEnd: PropTypes.func,
  disablePanning: PropTypes.bool,
  disableZooming: PropTypes.bool,
  className: PropTypes.string
};

var Sphere = function Sphere(_ref) {
  var _ref$id = _ref.id,
      id = _ref$id === undefined ? "rsm-sphere" : _ref$id,
      _ref$fill = _ref.fill,
      fill = _ref$fill === undefined ? "transparent" : _ref$fill,
      _ref$stroke = _ref.stroke,
      stroke = _ref$stroke === undefined ? "currentcolor" : _ref$stroke,
      _ref$strokeWidth = _ref.strokeWidth,
      strokeWidth = _ref$strokeWidth === undefined ? 0.5 : _ref$strokeWidth,
      _ref$className = _ref.className,
      className = _ref$className === undefined ? "" : _ref$className,
      restProps = objectWithoutProperties(_ref, ["id", "fill", "stroke", "strokeWidth", "className"]);

  var _useContext = useContext(MapContext),
      path = _useContext.path;

  var spherePath = useMemo(function () {
    return path({ type: "Sphere" });
  }, [path]);
  return React.createElement(
    Fragment,
    null,
    React.createElement(
      "defs",
      null,
      React.createElement(
        "clipPath",
        { id: id },
        React.createElement("path", { d: spherePath })
      )
    ),
    React.createElement("path", _extends({
      d: spherePath,
      fill: fill,
      stroke: stroke,
      strokeWidth: strokeWidth,
      style: { pointerEvents: "none" },
      className: "rsm-sphere " + className
    }, restProps))
  );
};

Sphere.propTypes = {
  id: PropTypes.string,
  fill: PropTypes.string,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.number,
  className: PropTypes.string
};

var Sphere$1 = memo(Sphere);

var Marker = function Marker(_ref) {
  var coordinates = _ref.coordinates,
      children = _ref.children,
      onMouseEnter = _ref.onMouseEnter,
      onMouseLeave = _ref.onMouseLeave,
      onMouseDown = _ref.onMouseDown,
      onMouseUp = _ref.onMouseUp,
      onFocus = _ref.onFocus,
      onBlur = _ref.onBlur,
      _ref$style = _ref.style,
      style = _ref$style === undefined ? {} : _ref$style,
      _ref$className = _ref.className,
      className = _ref$className === undefined ? "" : _ref$className,
      restProps = objectWithoutProperties(_ref, ["coordinates", "children", "onMouseEnter", "onMouseLeave", "onMouseDown", "onMouseUp", "onFocus", "onBlur", "style", "className"]);

  var _useContext = useContext(MapContext),
      projection = _useContext.projection;

  var _useState = useState(false),
      _useState2 = slicedToArray(_useState, 2),
      isPressed = _useState2[0],
      setPressed = _useState2[1];

  var _useState3 = useState(false),
      _useState4 = slicedToArray(_useState3, 2),
      isFocused = _useState4[0],
      setFocus = _useState4[1];

  var _projection = projection(coordinates),
      _projection2 = slicedToArray(_projection, 2),
      x = _projection2[0],
      y = _projection2[1];

  function handleMouseEnter(evt) {
    setFocus(true);
    if (onMouseEnter) onMouseEnter(evt);
  }

  function handleMouseLeave(evt) {
    setFocus(false);
    if (isPressed) setPressed(false);
    if (onMouseLeave) onMouseLeave(evt);
  }

  function handleFocus(evt) {
    setFocus(true);
    if (onFocus) onFocus(evt);
  }

  function handleBlur(evt) {
    setFocus(false);
    if (isPressed) setPressed(false);
    if (onBlur) onBlur(evt);
  }

  function handleMouseDown(evt) {
    setPressed(true);
    if (onMouseDown) onMouseDown(evt);
  }

  function handleMouseUp(evt) {
    setPressed(false);
    if (onMouseUp) onMouseUp(evt);
  }

  return React.createElement(
    "g",
    _extends({
      transform: "translate(" + x + ", " + y + ")",
      className: "rsm-marker " + className,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      style: style[isPressed || isFocused ? isPressed ? "pressed" : "hover" : "default"]
    }, restProps),
    children
  );
};

Marker.propTypes = {
  coordinates: PropTypes.array,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string
};

var Line = function Line(_ref) {
  var _ref$from = _ref.from,
      from = _ref$from === undefined ? [0, 0] : _ref$from,
      _ref$to = _ref.to,
      to = _ref$to === undefined ? [0, 0] : _ref$to,
      coordinates = _ref.coordinates,
      _ref$stroke = _ref.stroke,
      stroke = _ref$stroke === undefined ? "currentcolor" : _ref$stroke,
      _ref$strokeWidth = _ref.strokeWidth,
      strokeWidth = _ref$strokeWidth === undefined ? 3 : _ref$strokeWidth,
      _ref$fill = _ref.fill,
      fill = _ref$fill === undefined ? "transparent" : _ref$fill,
      _ref$className = _ref.className,
      className = _ref$className === undefined ? "" : _ref$className,
      restProps = objectWithoutProperties(_ref, ["from", "to", "coordinates", "stroke", "strokeWidth", "fill", "className"]);

  var _useContext = useContext(MapContext),
      path = _useContext.path;

  var lineData = {
    type: "LineString",
    coordinates: coordinates || [from, to]
  };

  return React.createElement("path", _extends({
    d: path(lineData),
    className: "rsm-line " + className,
    stroke: stroke,
    strokeWidth: strokeWidth,
    fill: fill
  }, restProps));
};

Line.propTypes = {
  from: PropTypes.array,
  to: PropTypes.array,
  coordinates: PropTypes.array,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.number,
  fill: PropTypes.string,
  className: PropTypes.string
};

var Annotation = function Annotation(_ref) {
  var subject = _ref.subject,
      children = _ref.children,
      connectorProps = _ref.connectorProps,
      _ref$dx = _ref.dx,
      dx = _ref$dx === undefined ? 30 : _ref$dx,
      _ref$dy = _ref.dy,
      dy = _ref$dy === undefined ? 30 : _ref$dy,
      _ref$curve = _ref.curve,
      curve = _ref$curve === undefined ? 0 : _ref$curve,
      _ref$className = _ref.className,
      className = _ref$className === undefined ? "" : _ref$className,
      restProps = objectWithoutProperties(_ref, ["subject", "children", "connectorProps", "dx", "dy", "curve", "className"]);

  var _useContext = useContext(MapContext),
      projection = _useContext.projection;

  var _projection = projection(subject),
      _projection2 = slicedToArray(_projection, 2),
      x = _projection2[0],
      y = _projection2[1];

  var connectorPath = createConnectorPath(dx, dy, curve);

  return React.createElement(
    "g",
    _extends({
      transform: "translate(" + (x + dx) + ", " + (y + dy) + ")",
      className: "rsm-annotation " + className
    }, restProps),
    React.createElement("path", _extends({ d: connectorPath, fill: "transparent", stroke: "#000" }, connectorProps)),
    children
  );
};

Annotation.propTypes = {
  subject: PropTypes.array,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  dx: PropTypes.number,
  dy: PropTypes.number,
  curve: PropTypes.number,
  connectorProps: PropTypes.object,
  className: PropTypes.string
};

export { Annotation, ComposableMap, Geographies, Geography$1 as Geography, Graticule$1 as Graticule, Line, Marker, Sphere$1 as Sphere, ZoomableGroup, useGeographies, useZoomPan };
