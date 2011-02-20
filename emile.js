// emile.js (c) 2009 Thomas Fuchs
// Licensed under the terms of the MIT license.

/*jslint white: true, onevar: true, undef: true, newcap: true, nomen: true, regexp: true, plusplus: true, browser: true, maxerr: 50, indent: 4 */
(function (emile, container) {
    var parseEl = document.createElement('div'),
        props = ('backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth ' +
                'borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize ' +
                'fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight ' +
                'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft ' +
                'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' ');
    
    function parse(prop) {
        var p = parseFloat(prop),
            q = prop.replace(/^[\-\d\.]+/, '');
        
        function interpolate(source, target, pos) {
            return (source + (target - source) * pos).toFixed(3);
        }
        
        function color(source, target, pos) {
            var i,
                j,
                c,
                tmp,
                v = [],
                r = [],
                s = function (str, p, c) {
                    return str.substr(p, c || 1);
                };
            
            for (i = 2; i > 0; i -= 1) {
                c = arguments[i - 1];
                
                if (s(c, 0) === 'r') {
                    // RVB style
                    c = c.match(/\d+/g);
                    for (j = 2; j >= 0; j -= 1) {
                        v.push(~~c[j]);
                    }
                } else {
                    // hexadecimal style
                    
                    // '#ABC' -> '#AABBCC'
                    if (c.length === 4) {
                        c = '#' + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
                    }
                    
                    for (j = 2; j >= 0; j -= 1) {
                        v.push(parseInt(s(c, 1 + j * 2, 2), 16));
                    }
                }
            }
            
            for (i = 2; i >= 0; i -= 1) {
                tmp = ~~(v[i + 3] + (v[i] - v[i + 3]) * pos);
                r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp);
            }
            
            return 'rgb(' + r.join(',') + ')';
        }
        
        return isNaN(p) ? {v: q, f: color, u: ''} : {v: p, f: interpolate, u: q};
    }
    
    function normalize(style) {
        var rules = {},
            i,
            v;
        
        parseEl.innerHTML = '<div style="' + style + '"></div>';
        
        for (i = props.length; i > 0; i -= 1) {
            v = parseEl.childNodes[0].style[props[i]];
            if (v) {
                rules[props[i]] = parse(v);
            }
        }
        
        return rules;
    }
    
    container[emile] = function (el, style, opts, after) {
        el = typeof el === 'string' ? document.getElementById(el) : el;
        opts = opts || {};
        
        var target = normalize(style),
            comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null),
            prop,
            current = {},
            start = +new Date(),
            dur = opts.duration || 200,
            finish = start + dur,
            interval,
            easing = opts.easing || function (pos) { return (-Math.cos(pos * Math.PI) / 2) + 0.5; };
        
        for (prop in target) {
            if (target.hasOwnProperty(prop)) {
                current[prop] = parse(comp[prop]);
            }
        }
        interval = setInterval(function () {
            var time = +new Date(),
                pos = time > finish ? 1 : (time - start) / dur,
                prop;
            
            for (prop in target) {
                if (target.hasOwnProperty(prop)) {
                    el.style[prop] = target[prop].f(current[prop].v, target[prop].v, easing(pos)) + target[prop].u;
                }
            }
            if (time > finish) {
                clearInterval(interval);
                if (opts.after) {
                    opts.after();
                }
                if (after) {
                    setTimeout(after, 1);
                }
            }
        }, 10);
    };
}('emile', this));