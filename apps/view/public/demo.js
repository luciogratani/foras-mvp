/*! For license information please see app-17efa13459c502f120c7.js.LICENSE.txt */
/*! jQuery v3.7.1 | (c) OpenJS Foundation and other contributors | jquery.org/license */
!function(e,t){"use strict";"object"==typeof module&&"object"==typeof module.exports?module.exports=e.document?t(e,!0):function(e){if(!e.document)throw new Error("jQuery requires a window with a document");return t(e)}:t(e)}("undefined"!=typeof window?window:this,function(ie,e){"use strict";var oe=[],r=Object.getPrototypeOf,ae=oe.slice,g=oe.flat?function(e){return oe.flat.call(e)}:function(e){return oe.concat.apply([],e)},s=oe.push,se=oe.indexOf,n={},i=n.toString,ue=n.hasOwnProperty,o=ue.toString,a=o.call(Object),le={},v=function(e){return"function"==typeof e&&"number"!=typeof e.nodeType&&"function"!=typeof e.item},y=function(e){return null!=e&&e===e.window},C=ie.document,u={type:!0,src:!0,nonce:!0,noModule:!0};function m(e,t,n){var r,i,o=(n=n||C).createElement("script");if(o.text=e,t)for(r in u)(i=t[r]||t.getAttribute&&t.getAttribute(r))&&o.setAttribute(r,i);n.head.appendChild(o).parentNode.removeChild(o)}function x(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?n[i.call(e)]||"object":typeof e}var t="3.7.1",l=/HTML$/i,ce=function(e,t){return new ce.fn.init(e,t)};function c(e){var t=!!e&&"length"in e&&e.length,n=x(e);return!v(e)&&!y(e)&&("array"===n||0===t||"number"==typeof t&&0<t&&t-1 in e)}function fe(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}ce.fn=ce.prototype={jquery:t,constructor:ce,length:0,toArray:function(){return ae.call(this)},get:function(e){return null==e?ae.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=ce.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return ce.each(this,e)},map:function(n){return this.pushStack(ce.map(this,function(e,t){return n.call(e,t,e)}))},slice:function(){return this.pushStack(ae.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},even:function(){return this.pushStack(ce.grep(this,function(e,t){return(t+1)%2}))},odd:function(){return this.pushStack(ce.grep(this,function(e,t){return t%2}))},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(0<=n&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:s,sort:oe.sort,splice:oe.splice},ce.extend=ce.fn.extend=function(){var e,t,n,r,i,o,a=arguments[0]||{},s=1,u=arguments.length,l=!1;for("boolean"==typeof a&&(l=a,a=arguments[s]||{},s++),"object"==typeof a||v(a)||(a={}),s===u&&(a=this,s--);s<u;s++)if(null!=(e=arguments[s]))for(t in e)r=e[t],"__proto__"!==t&&a!==r&&(l&&r&&(ce.isPlainObject(r)||(i=Array.isArray(r)))?(n=a[t],o=i&&!Array.isArray(n)?[]:i||ce.isPlainObject(n)?n:{},i=!1,a[t]=ce.extend(l,o,r)):void 0!==r&&(a[t]=r));return a},ce.extend({expando:"jQuery"+(t+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isPlainObject:function(e){var t,n;return!(!e||"[object Object]"!==i.call(e))&&(!(t=r(e))||"function"==typeof(n=ue.call(t,"constructor")&&t.constructor)&&o.call(n)===a)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},globalEval:function(e,t,n){m(e,{nonce:t&&t.nonce},n)},each:function(e,t){var n,r=0;if(c(e)){for(n=e.length;r<n;r++)if(!1===t.call(e[r],r,e[r]))break}else for(r in e)if(!1===t.call(e[r],r,e[r]))break;return e},text:function(e){var t,n="",r=0,i=e.nodeType;if(!i)while(t=e[r++])n+=ce.text(t);return 1===i||11===i?e.textContent:9===i?e.documentElement.textContent:3===i||4===i?e.nodeValue:n},makeArray:function(e,t){var n=t||[];return null!=e&&(c(Object(e))?ce.merge(n,"string"==typeof e?[e]:e):s.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:se.call(t,e,n)},isXMLDoc:function(e){var t=e&&e.namespaceURI,n=e&&(e.ownerDocument||e).documentElement;return!l.test(t||n&&n.nodeName||"HTML")},merge:function(e,t){for(var n=+t.length,r=0,i=e.length;r<n;r++)e[i++]=t[r];return e.length=i,e},grep:function(e,t,n){for(var r=[],i=0,o=e.length,a=!n;i<o;i++)!t(e[i],i)!==a&&r.push(e[i]);return r},map:function(e,t,n){var r,i,o=0,a=[];if(c(e))for(r=e.length;o<r;o++)null!=(i=t(e[o],o,n))&&a.push(i);else for(o in e)null!=(i=t(e[o],o,n))&&a.push(i);return g(a)},guid:1,support:le}),"function"==typeof Symbol&&(ce.fn[Symbol.iterator]=oe[Symbol.iterator]),ce.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(e,t){n["[object "+t+"]"]=t.toLowerCase()});var pe=oe.pop,de=oe.sort,he=oe.splice,ge="[\\x20\\t\\r\\n\\f]",ve=new RegExp("^"+ge+"+|((?:^|[^\\\\])(?:\\\\.)*)"+ge+"+$","g");ce.contains=function(e,t){var n=t&&t.parentNode;return e===n||!(!n||1!==n.nodeType||!(e.contains?e.contains(n):e.compareDocumentPosition&&16&e.compareDocumentPosition(n)))};var f=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;function p(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e}ce.escapeSelector=function(e){return(e+"").replace(f,p)};var ye=C,me=s;!function(){var e,b,w,o,a,T,r,C,d,i,k=me,S=ce.expando,E=0,n=0,s=W(),c=W(),u=W(),h=W(),l=function(e,t){return e===t&&(a=!0),0},f="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",t="(?:\\\\[\\da-fA-F]{1,6}"+ge+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",p="\\["+ge+"*("+t+")(?:"+ge+"*([*^$|!~]?=)"+ge+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+t+"))|)"+ge+"*\\]",g=":("+t+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+p+")*)|.*)\\)|)",v=new RegExp(ge+"+","g"),y=new RegExp("^"+ge+"*,"+ge+"*"),m=new RegExp("^"+ge+"*([>+~]|"+ge+")"+ge+"*"),x=new RegExp(ge+"|>"),j=new RegExp(g),A=new RegExp("^"+t+"$"),D={ID:new RegExp("^#("+t+")"),CLASS:new RegExp("^\\.("+t+")"),TAG:new RegExp("^("+t+"|[*])"),ATTR:new RegExp("^"+p),PSEUDO:new RegExp("^"+g),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+ge+"*(even|odd|(([+-]|)(\\d*)n|)"+ge+"*(?:([+-]|)"+ge+"*(\\d+)|))"+ge+"*\\)|)","i"),bool:new RegExp("^(?:"+f+")$","i"),needsContext:new RegExp("^"+ge+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+ge+"*((?:-\\d)?\\d*)"+ge+"*\\)|)(?=[^-]|$)","i")},N=/^(?:input|select|textarea|button)$/i,q=/^h\d$/i,L=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,H=/[+~]/,O=new RegExp("\\\\[\\da-fA-F]{1,6}"+ge+"?|\\\\([^\\r\\n\\f])","g"),P=function(e,t){var n="0x"+e.slice(1)-65536;return t||(n<0?String.fromCharCode(n+65536):String.fromCharCode(n>>10|55296,1023&n|56320))},M=function(){V()},R=J(function(e){return!0===e.disabled&&fe(e,"fieldset")},{dir:"parentNode",next:"legend"});try{k.apply(oe=ae.call(ye.childNodes),ye.childNodes),oe[ye.childNodes.length].nodeType}catch(e){k={apply:function(e,t){me.apply(e,ae.call(t))},call:function(e){me.apply(e,ae.call(arguments,1))}}}function I(t,e,n,r){var i,o,a,s,u,l,c,f=e&&e.ownerDocument,p=e?e.nodeType:9;if(n=n||[],"string"!=typeof t||!t||1!==p&&9!==p&&11!==p)return n;if(!r&&(V(e),e=e||T,C)){if(11!==p&&(u=L.exec(t)))if(i=u[1]){if(9===p){if(!(a=e.getElementById(i)))return n;if(a.id===i)return k.call(n,a),n}else if(f&&(a=f.getElementById(i))&&I.contains(e,a)&&a.id===i)return k.call(n,a),n}else{if(u[2])return k.apply(n,e.getElementsByTagName(t)),n;if((i=u[3])&&e.getElementsByClassName)return k.apply(n,e.getElementsByClassName(i)),n}if(!(h[t+" "]||d&&d.test(t))){if(c=t,f=e,1===p&&(x.test(t)||m.test(t))){(f=H.test(t)&&U(e.parentNode)||e)==e&&le.scope||((s=e.getAttribute("id"))?s=ce.escapeSelector(s):e.setAttribute("id",s=S)),o=(l=Y(t)).length;while(o--)l[o]=(s?"#"+s:":scope")+" "+Q(l[o]);c=l.join(",")}try{return k.apply(n,f.querySelectorAll(c)),n}catch(e){h(t,!0)}finally{s===S&&e.removeAttribute("id")}}}return re(t.replace(ve,"$1"),e,n,r)}function W(){var r=[];return function e(t,n){return r.push(t+" ")>b.cacheLength&&delete e[r.shift()],e[t+" "]=n}}function F(e){return e[S]=!0,e}function $(e){var t=T.createElement("fieldset");try{return!!e(t)}catch(e){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function B(t){return function(e){return fe(e,"input")&&e.type===t}}function _(t){return function(e){return(fe(e,"input")||fe(e,"button"))&&e.type===t}}function z(t){return function(e){return"form"in e?e.parentNode&&!1===e.disabled?"label"in e?"label"in e.parentNode?e.parentNode.disabled===t:e.disabled===t:e.isDisabled===t||e.isDisabled!==!t&&R(e)===t:e.disabled===t:"label"in e&&e.disabled===t}}function X(a){return F(function(o){return o=+o,F(function(e,t){var n,r=a([],e.length,o),i=r.length;while(i--)e[n=r[i]]&&(e[n]=!(t[n]=e[n]))})})}function U(e){return e&&"undefined"!=typeof e.getElementsByTagName&&e}function V(e){var t,n=e?e.ownerDocument||e:ye;return n!=T&&9===n.nodeType&&n.documentElement&&(r=(T=n).documentElement,C=!ce.isXMLDoc(T),i=r.matches||r.webkitMatchesSelector||r.msMatchesSelector,r.msMatchesSelector&&ye!=T&&(t=T.defaultView)&&t.top!==t&&t.addEventListener("unload",M),le.getById=$(function(e){return r.appendChild(e).id=ce.expando,!T.getElementsByName||!T.getElementsByName(ce.expando).length}),le.disconnectedMatch=$(function(e){return i.call(e,"*")}),le.scope=$(function(){return T.querySelectorAll(":scope")}),le.cssHas=$(function(){try{return T.querySelector(":has(*,:jqfake)"),!1}catch(e){return!0}}),le.getById?(b.filter.ID=function(e){var t=e.replace(O,P);return function(e){return e.getAttribute("id")===t}},b.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&C){var n=t.getElementById(e);return n?[n]:[]}}):(b.filter.ID=function(e){var n=e.replace(O,P);return function(e){var t="undefined"!=typeof e.getAttributeNode&&e.getAttributeNode("id");return t&&t.value===n}},b.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&C){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return[o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return[o]}return[]}}),b.find.TAG=function(e,t){return"undefined"!=typeof t.getElementsByTagName?t.getElementsByTagName(e):t.querySelectorAll(e)},b.find.CLASS=function(e,t){if("undefined"!=typeof t.getElementsByClassName&&C)return t.getElementsByClassName(e)},d=[],$(function(e){var t;r.appendChild(e).innerHTML="<a id='"+S+"' href='' disabled='disabled'></a><select id='"+S+"-\r\\' disabled='disabled'><option selected=''></option></select>",e.querySelectorAll("[selected]").length||d.push("\\["+ge+"*(?:value|"+f+")"),e.querySelectorAll("[id~="+S+"-]").length||d.push("~="),e.querySelectorAll("a#"+S+"+*").length||d.push(".#.+[+~]"),e.querySelectorAll(":checked").length||d.push(":checked"),(t=T.createElement("input")).setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),r.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&d.push(":enabled",":disabled"),(t=T.createElement("input")).setAttribute("name",""),e.appendChild(t),e.querySelectorAll("[name='']").length||d.push("\\["+ge+"*name"+ge+"*="+ge+"*(?:''|\"\")")}),le.cssHas||d.push(":has"),d=d.length&&new RegExp(d.join("|")),l=function(e,t){if(e===t)return a=!0,0;var n=!e.compareDocumentPosition-!t.compareDocumentPosition;return n||(1&(n=(e.ownerDocument||e)==(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!le.sortDetached&&t.compareDocumentPosition(e)===n?e===T||e.ownerDocument==ye&&I.contains(ye,e)?-1:t===T||t.ownerDocument==ye&&I.contains(ye,t)?1:o?se.call(o,e)-se.call(o,t):0:4&n?-1:1)}),T}for(e in I.matches=function(e,t){return I(e,null,null,t)},I.matchesSelector=function(e,t){if(V(e),C&&!h[t+" "]&&(!d||!d.test(t)))try{var n=i.call(e,t);if(n||le.disconnectedMatch||e.document&&11!==e.document.nodeType)return n}catch(e){h(t,!0)}return 0<I(t,T,null,[e]).length},I.contains=function(e,t){return(e.ownerDocument||e)!=T&&V(e),ce.contains(e,t)},I.attr=function(e,t){(e.ownerDocument||e)!=T&&V(e);var n=b.attrHandle[t.toLowerCase()],r=n&&ue.call(b.attrHandle,t.toLowerCase())?n(e,t,!C):void 0;return void 0!==r?r:e.getAttribute(t)},I.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},ce.uniqueSort=function(e){var t,n=[],r=0,i=0;if(a=!le.sortStable,o=!le.sortStable&&ae.call(e,0),de.call(e,l),a){while(t=e[i++])t===e[i]&&(r=n.push(i));while(r--)he.call(e,n[r],1)}return o=null,e},ce.fn.uniqueSort=function(){return this.pushStack(ce.uniqueSort(ae.apply(this)))},(b=ce.expr={cacheLength:50,createPseudo:F,match:D,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(O,P),e[3]=(e[3]||e[4]||e[5]||"").replace(O,P),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||I.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&I.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return D.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&j.test(n)&&(t=Y(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(O,P).toLowerCase();return"*"===e?function(){return!0}:function(e){return fe(e,t)}},CLASS:function(e){var t=s[e+" "];return t||(t=new RegExp("(^|"+ge+")"+e+"("+ge+"|$)"))&&s(e,function(e){return t.test("string"==typeof e.className&&e.className||"undefined"!=typeof e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(n,r,i){return function(e){var t=I.attr(e,n);return null==t?"!="===r:!r||(t+="","="===r?t===i:"!="===r?t!==i:"^="===r?i&&0===t.indexOf(i):"*="===r?i&&-1<t.indexOf(i):"$="===r?i&&t.slice(-i.length)===i:"~="===r?-1<(" "+t.replace(v," ")+" ").indexOf(i):"|="===r&&(t===i||t.slice(0,i.length+1)===i+"-"))}},CHILD:function(d,e,t,h,g){var v="nth"!==d.slice(0,3),y="last"!==d.slice(-4),m="of-type"===e;return 1===h&&0===g?function(e){return!!e.parentNode}:function(e,t,n){var r,i,o,a,s,u=v!==y?"nextSibling":"previousSibling",l=e.parentNode,c=m&&e.nodeName.toLowerCase(),f=!n&&!m,p=!1;if(l){if(v){while(u){o=e;while(o=o[u])if(m?fe(o,c):1===o.nodeType)return!1;s=u="only"===d&&!s&&"nextSibling"}return!0}if(s=[y?l.firstChild:l.lastChild],y&&f){p=(a=(r=(i=l[S]||(l[S]={}))[d]||[])[0]===E&&r[1])&&r[2],o=a&&l.childNodes[a];while(o=++a&&o&&o[u]||(p=a=0)||s.pop())if(1===o.nodeType&&++p&&o===e){i[d]=[E,a,p];break}}else if(f&&(p=a=(r=(i=e[S]||(e[S]={}))[d]||[])[0]===E&&r[1]),!1===p)while(o=++a&&o&&o[u]||(p=a=0)||s.pop())if((m?fe(o,c):1===o.nodeType)&&++p&&(f&&((i=o[S]||(o[S]={}))[d]=[E,p]),o===e))break;return(p-=g)===h||p%h==0&&0<=p/h}}},PSEUDO:function(e,o){var t,a=b.pseudos[e]||b.setFilters[e.toLowerCase()]||I.error("unsupported pseudo: "+e);return a[S]?a(o):1<a.length?(t=[e,e,"",o],b.setFilters.hasOwnProperty(e.toLowerCase())?F(function(e,t){var n,r=a(e,o),i=r.length;while(i--)e[n=se.call(e,r[i])]=!(t[n]=r[i])}):function(e){return a(e,0,t)}):a}},pseudos:{not:F(function(e){var r=[],i=[],s=ne(e.replace(ve,"$1"));return s[S]?F(function(e,t,n,r){var i,o=s(e,null,r,[]),a=e.length;while(a--)(i=o[a])&&(e[a]=!(t[a]=i))}):function(e,t,n){return r[0]=e,s(r,null,n,i),r[0]=null,!i.pop()}}),has:F(function(t){return function(e){return 0<I(t,e).length}}),contains:F(function(t){return t=t.replace(O,P),function(e){return-1<(e.textContent||ce.text(e)).indexOf(t)}}),lang:F(function(n){return A.test(n||"")||I.error("unsupported lang: "+n),n=n.replace(O,P).toLowerCase(),function(e){var t;do{if(t=C?e.lang:e.getAttribute("xml:lang")||e.getAttribute("lang"))return(t=t.toLowerCase())===n||0===t.indexOf(n+"-")}while((e=e.parentNode)&&1===e.nodeType);return!1}}),target:function(e){var t=ie.location&&ie.location.hash;return t&&t.slice(1)===e.id},root:function(e){return e===r},focus:function(e){return e===function(){try{return T.activeElement}catch(e){}}()&&T.hasFocus()&&!!(e.type||e.href||~e.tabIndex)},enabled:z(!1),disabled:z(!0),checked:function(e){return fe(e,"input")&&!!e.checked||fe(e,"option")&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!b.pseudos.empty(e)},header:function(e){return q.test(e.nodeName)},input:function(e){return N.test(e.nodeName)},button:function(e){return fe(e,"input")&&"button"===e.type||fe(e,"button")},text:function(e){var t;return fe(e,"input")&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:X(function(){return[0]}),last:X(function(e,t){return[t-1]}),eq:X(function(e,t,n){return[n<0?n+t:n]}),even:X(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:X(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:X(function(e,t,n){var r;for(r=n<0?n+t:t<n?t:n;0<=--r;)e.push(r);return e}),gt:X(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=b.pseudos.eq,{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})b.pseudos[e]=B(e);for(e in{submit:!0,reset:!0})b.pseudos[e]=_(e);function G(){}function Y(e,t){var n,r,i,o,a,s,u,l=c[e+" "];if(l)return t?0:l.slice(0);a=e,s=[],u=b.preFilter;while(a){for(o in n&&!(r=y.exec(a))||(r&&(a=a.slice(r[0].length)||a),s.push(i=[])),n=!1,(r=m.exec(a))&&(n=r.shift(),i.push({value:n,type:r[0].replace(ve," ")}),a=a.slice(n.length)),b.filter)!(r=D[o].exec(a))||u[o]&&!(r=u[o](r))||(n=r.shift(),i.push({value:n,type:o,matches:r}),a=a.slice(n.length));if(!n)break}return t?a.length:a?I.error(e):c(e,s).slice(0)}function Q(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function J(a,e,t){var s=e.dir,u=e.next,l=u||s,c=t&&"parentNode"===l,f=n++;return e.first?function(e,t,n){while(e=e[s])if(1===e.nodeType||c)return a(e,t,n);return!1}:function(e,t,n){var r,i,o=[E,f];if(n){while(e=e[s])if((1===e.nodeType||c)&&a(e,t,n))return!0}else while(e=e[s])if(1===e.nodeType||c)if(i=e[S]||(e[S]={}),u&&fe(e,u))e=e[s]||e;else{if((r=i[l])&&r[0]===E&&r[1]===f)return o[2]=r[2];if((i[l]=o)[2]=a(e,t,n))return!0}return!1}}function K(i){return 1<i.length?function(e,t,n){var r=i.length;while(r--)if(!i[r](e,t,n))return!1;return!0}:i[0]}function Z(e,t,n,r,i){for(var o,a=[],s=0,u=e.length,l=null!=t;s<u;s++)(o=e[s])&&(n&&!n(o,r,i)||(a.push(o),l&&t.push(s)));return a}function ee(d,h,g,v,y,e){return v&&!v[S]&&(v=ee(v)),y&&!y[S]&&(y=ee(y,e)),F(function(e,t,n,r){var i,o,a,s,u=[],l=[],c=t.length,f=e||function(e,t,n){for(var r=0,i=t.length;r<i;r++)I(e,t[r],n);return n}(h||"*",n.nodeType?[n]:n,[]),p=!d||!e&&h?f:Z(f,u,d,n,r);if(g?g(p,s=y||(e?d:c||v)?[]:t,n,r):s=p,v){i=Z(s,l),v(i,[],n,r),o=i.length;while(o--)(a=i[o])&&(s[l[o]]=!(p[l[o]]=a))}if(e){if(y||d){if(y){i=[],o=s.length;while(o--)(a=s[o])&&i.push(p[o]=a);y(null,s=[],i,r)}o=s.length;while(o--)(a=s[o])&&-1<(i=y?se.call(e,a):u[o])&&(e[i]=!(t[i]=a))}}else s=Z(s===t?s.splice(c,s.length):s),y?y(null,t,s,r):k.apply(t,s)})}function te(e){for(var i,t,n,r=e.length,o=b.relative[e[0].type],a=o||b.relative[" "],s=o?1:0,u=J(function(e){return e===i},a,!0),l=J(function(e){return-1<se.call(i,e)},a,!0),c=[function(e,t,n){var r=!o&&(n||t!=w)||((i=t).nodeType?u(e,t,n):l(e,t,n));return i=null,r}];s<r;s++)if(t=b.relative[e[s].type])c=[J(K(c),t)];else{if((t=b.filter[e[s].type].apply(null,e[s].matches))[S]){for(n=++s;n<r;n++)if(b.relative[e[n].type])break;return ee(1<s&&K(c),1<s&&Q(e.slice(0,s-1).concat({value:" "===e[s-2].type?"*":""})).replace(ve,"$1"),t,s<n&&te(e.slice(s,n)),n<r&&te(e=e.slice(n)),n<r&&Q(e))}c.push(t)}return K(c)}function ne(e,t){var n,v,y,m,x,r,i=[],o=[],a=u[e+" "];if(!a){t||(t=Y(e)),n=t.length;while(n--)(a=te(t[n]))[S]?i.push(a):o.push(a);(a=u(e,(v=o,m=0<(y=i).length,x=0<v.length,r=function(e,t,n,r,i){var o,a,s,u=0,l="0",c=e&&[],f=[],p=w,d=e||x&&b.find.TAG("*",i),h=E+=null==p?1:Math.random()||.1,g=d.length;for(i&&(w=t==T||t||i);l!==g&&null!=(o=d[l]);l++){if(x&&o){a=0,t||o.ownerDocument==T||(V(o),n=!C);while(s=v[a++])if(s(o,t||T,n)){k.call(r,o);break}i&&(E=h)}m&&((o=!s&&o)&&u--,e&&c.push(o))}if(u+=l,m&&l!==u){a=0;while(s=y[a++])s(c,f,t,n);if(e){if(0<u)while(l--)c[l]||f[l]||(f[l]=pe.call(r));f=Z(f)}k.apply(r,f),i&&!e&&0<f.length&&1<u+y.length&&ce.uniqueSort(r)}return i&&(E=h,w=p),c},m?F(r):r))).selector=e}return a}function re(e,t,n,r){var i,o,a,s,u,l="function"==typeof e&&e,c=!r&&Y(e=l.selector||e);if(n=n||[],1===c.length){if(2<(o=c[0]=c[0].slice(0)).length&&"ID"===(a=o[0]).type&&9===t.nodeType&&C&&b.relative[o[1].type]){if(!(t=(b.find.ID(a.matches[0].replace(O,P),t)||[])[0]))return n;l&&(t=t.parentNode),e=e.slice(o.shift().value.length)}i=D.needsContext.test(e)?0:o.length;while(i--){if(a=o[i],b.relative[s=a.type])break;if((u=b.find[s])&&(r=u(a.matches[0].replace(O,P),H.test(o[0].type)&&U(t.parentNode)||t))){if(o.splice(i,1),!(e=r.length&&Q(o)))return k.apply(n,r),n;break}}}return(l||ne(e,c))(r,t,!C,n,!t||H.test(e)&&U(t.parentNode)||t),n}G.prototype=b.filters=b.pseudos,b.setFilters=new G,le.sortStable=S.split("").sort(l).join("")===S,V(),le.sortDetached=$(function(e){return 1&e.compareDocumentPosition(T.createElement("fieldset"))}),ce.find=I,ce.expr[":"]=ce.expr.pseudos,ce.unique=ce.uniqueSort,I.compile=ne,I.select=re,I.setDocument=V,I.tokenize=Y,I.escape=ce.escapeSelector,I.getText=ce.text,I.isXML=ce.isXMLDoc,I.selectors=ce.expr,I.support=ce.support,I.uniqueSort=ce.uniqueSort}();var d=function(e,t,n){var r=[],i=void 0!==n;while((e=e[t])&&9!==e.nodeType)if(1===e.nodeType){if(i&&ce(e).is(n))break;r.push(e)}return r},h=function(e,t){for(var n=[];e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n},b=ce.expr.match.needsContext,w=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;function T(e,n,r){return v(n)?ce.grep(e,function(e,t){return!!n.call(e,t,e)!==r}):n.nodeType?ce.grep(e,function(e){return e===n!==r}):"string"!=typeof n?ce.grep(e,function(e){return-1<se.call(n,e)!==r}):ce.filter(n,e,r)}ce.filter=function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?ce.find.matchesSelector(r,e)?[r]:[]:ce.find.matches(e,ce.grep(t,function(e){return 1===e.nodeType}))},ce.fn.extend({find:function(e){var t,n,r=this.length,i=this;if("string"!=typeof e)return this.pushStack(ce(e).filter(function(){for(t=0;t<r;t++)if(ce.contains(i[t],this))return!0}));for(n=this.pushStack([]),t=0;t<r;t++)ce.find(e,i[t],n);return 1<r?ce.uniqueSort(n):n},filter:function(e){return this.pushStack(T(this,e||[],!1))},not:function(e){return this.pushStack(T(this,e||[],!0))},is:function(e){return!!T(this,"string"==typeof e&&b.test(e)?ce(e):e||[],!1).length}});var k,S=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;(ce.fn.init=function(e,t,n){var r,i;if(!e)return this;if(n=n||k,"string"==typeof e){if(!(r="<"===e[0]&&">"===e[e.length-1]&&3<=e.length?[null,e,null]:S.exec(e))||!r[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(r[1]){if(t=t instanceof ce?t[0]:t,ce.merge(this,ce.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:C,!0)),w.test(r[1])&&ce.isPlainObject(t))for(r in t)v(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return(i=C.getElementById(r[2]))&&(this[0]=i,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):v(e)?void 0!==n.ready?n.ready(e):e(ce):ce.makeArray(e,this)}).prototype=ce.fn,k=ce(C);var E=/^(?:parents|prev(?:Until|All))/,j={children:!0,contents:!0,next:!0,prev:!0};function A(e,t){while((e=e[t])&&1!==e.nodeType);return e}ce.fn.extend({has:function(e){var t=ce(e,this),n=t.length;return this.filter(function(){for(var e=0;e<n;e++)if(ce.contains(this,t[e]))return!0})},closest:function(e,t){var n,r=0,i=this.length,o=[],a="string"!=typeof e&&ce(e);if(!b.test(e))for(;r<i;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(a?-1<a.index(n):1===n.nodeType&&ce.find.matchesSelector(n,e))){o.push(n);break}return this.pushStack(1<o.length?ce.uniqueSort(o):o)},index:function(e){return e?"string"==typeof e?se.call(ce(e),this[0]):se.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(ce.uniqueSort(ce.merge(this.get(),ce(e,t))))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}}),ce.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return d(e,"parentNode")},parentsUntil:function(e,t,n){return d(e,"parentNode",n)},next:function(e){return A(e,"nextSibling")},prev:function(e){return A(e,"previousSibling")},nextAll:function(e){return d(e,"nextSibling")},prevAll:function(e){return d(e,"previousSibling")},nextUntil:function(e,t,n){return d(e,"nextSibling",n)},prevUntil:function(e,t,n){return d(e,"previousSibling",n)},siblings:function(e){return h((e.parentNode||{}).firstChild,e)},children:function(e){return h(e.firstChild)},contents:function(e){return null!=e.contentDocument&&r(e.contentDocument)?e.contentDocument:(fe(e,"template")&&(e=e.content||e),ce.merge([],e.childNodes))}},function(r,i){ce.fn[r]=function(e,t){var n=ce.map(this,i,e);return"Until"!==r.slice(-5)&&(t=e),t&&"string"==typeof t&&(n=ce.filter(t,n)),1<this.length&&(j[r]||ce.uniqueSort(n),E.test(r)&&n.reverse()),this.pushStack(n)}});var D=/[^\x20\t\r\n\f]+/g;function N(e){return e}function q(e){throw e}function L(e,t,n,r){var i;try{e&&v(i=e.promise)?i.call(e).done(t).fail(n):e&&v(i=e.then)?i.call(e,t,n):t.apply(void 0,[e].slice(r))}catch(e){n.apply(void 0,[e])}}ce.Callbacks=function(r){var e,n;r="string"==typeof r?(e=r,n={},ce.each(e.match(D)||[],function(e,t){n[t]=!0}),n):ce.extend({},r);var i,t,o,a,s=[],u=[],l=-1,c=function(){for(a=a||r.once,o=i=!0;u.length;l=-1){t=u.shift();while(++l<s.length)!1===s[l].apply(t[0],t[1])&&r.stopOnFalse&&(l=s.length,t=!1)}r.memory||(t=!1),i=!1,a&&(s=t?[]:"")},f={add:function(){return s&&(t&&!i&&(l=s.length-1,u.push(t)),function n(e){ce.each(e,function(e,t){v(t)?r.unique&&f.has(t)||s.push(t):t&&t.length&&"string"!==x(t)&&n(t)})}(arguments),t&&!i&&c()),this},remove:function(){return ce.each(arguments,function(e,t){var n;while(-1<(n=ce.inArray(t,s,n)))s.splice(n,1),n<=l&&l--}),this},has:function(e){return e?-1<ce.inArray(e,s):0<s.length},empty:function(){return s&&(s=[]),this},disable:function(){return a=u=[],s=t="",this},disabled:function(){return!s},lock:function(){return a=u=[],t||i||(s=t=""),this},locked:function(){return!!a},fireWith:function(e,t){return a||(t=[e,(t=t||[]).slice?t.slice():t],u.push(t),i||c()),this},fire:function(){return f.fireWith(this,arguments),this},fired:function(){return!!o}};return f},ce.extend({Deferred:function(e){var o=[["notify","progress",ce.Callbacks("memory"),ce.Callbacks("memory"),2],["resolve","done",ce.Callbacks("once memory"),ce.Callbacks("once memory"),0,"resolved"],["reject","fail",ce.Callbacks("once memory"),ce.Callbacks("once memory"),1,"rejected"]],i="pending",a={state:function(){return i},always:function(){return s.done(arguments).fail(arguments),this},"catch":function(e){return a.then(null,e)},pipe:function(){var i=arguments;return ce.Deferred(function(r){ce.each(o,function(e,t){var n=v(i[t[4]])&&i[t[4]];s[t[1]](function(){var e=n&&n.apply(this,arguments);e&&v(e.promise)?e.promise().progress(r.notify).done(r.resolve).fail(r.reject):r[t[0]+"With"](this,n?[e]:arguments)})}),i=null}).promise()},then:function(t,n,r){var u=0;function l(i,o,a,s){return function(){var n=this,r=arguments,e=function(){var e,t;if(!(i<u)){if((e=a.apply(n,r))===o.promise())throw new TypeError("Thenable self-resolution");t=e&&("object"==typeof e||"function"==typeof e)&&e.then,v(t)?s?t.call(e,l(u,o,N,s),l(u,o,q,s)):(u++,t.call(e,l(u,o,N,s),l(u,o,q,s),l(u,o,N,o.notifyWith))):(a!==N&&(n=void 0,r=[e]),(s||o.resolveWith)(n,r))}},t=s?e:function(){try{e()}catch(e){ce.Deferred.exceptionHook&&ce.Deferred.exceptionHook(e,t.error),u<=i+1&&(a!==q&&(n=void 0,r=[e]),o.rejectWith(n,r))}};i?t():(ce.Deferred.getErrorHook?t.error=ce.Deferred.getErrorHook():ce.Deferred.getStackHook&&(t.error=ce.Deferred.getStackHook()),ie.setTimeout(t))}}return ce.Deferred(function(e){o[0][3].add(l(0,e,v(r)?r:N,e.notifyWith)),o[1][3].add(l(0,e,v(t)?t:N)),o[2][3].add(l(0,e,v(n)?n:q))}).promise()},promise:function(e){return null!=e?ce.extend(e,a):a}},s={};return ce.each(o,function(e,t){var n=t[2],r=t[5];a[t[1]]=n.add,r&&n.add(function(){i=r},o[3-e][2].disable,o[3-e][3].disable,o[0][2].lock,o[0][3].lock),n.add(t[3].fire),s[t[0]]=function(){return s[t[0]+"With"](this===s?void 0:this,arguments),this},s[t[0]+"With"]=n.fireWith}),a.promise(s),e&&e.call(s,s),s},when:function(e){var n=arguments.length,t=n,r=Array(t),i=ae.call(arguments),o=ce.Deferred(),a=function(t){return function(e){r[t]=this,i[t]=1<arguments.length?ae.call(arguments):e,--n||o.resolveWith(r,i)}};if(n<=1&&(L(e,o.done(a(t)).resolve,o.reject,!n),"pending"===o.state()||v(i[t]&&i[t].then)))return o.then();while(t--)L(i[t],a(t),o.reject);return o.promise()}});var H=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;ce.Deferred.exceptionHook=function(e,t){ie.console&&ie.console.warn&&e&&H.test(e.name)&&ie.console.warn("jQuery.Deferred exception: "+e.message,e.stack,t)},ce.readyException=function(e){ie.setTimeout(function(){throw e})};var O=ce.Deferred();function P(){C.removeEventListener("DOMContentLoaded",P),ie.removeEventListener("load",P),ce.ready()}ce.fn.ready=function(e){return O.then(e)["catch"](function(e){ce.readyException(e)}),this},ce.extend({isReady:!1,readyWait:1,ready:function(e){(!0===e?--ce.readyWait:ce.isReady)||(ce.isReady=!0)!==e&&0<--ce.readyWait||O.resolveWith(C,[ce])}}),ce.ready.then=O.then,"complete"===C.readyState||"loading"!==C.readyState&&!C.documentElement.doScroll?ie.setTimeout(ce.ready):(C.addEventListener("DOMContentLoaded",P),ie.addEventListener("load",P));var M=function(e,t,n,r,i,o,a){var s=0,u=e.length,l=null==n;if("object"===x(n))for(s in i=!0,n)M(e,t,s,n[s],!0,o,a);else if(void 0!==r&&(i=!0,v(r)||(a=!0),l&&(a?(t.call(e,r),t=null):(l=t,t=function(e,t,n){return l.call(ce(e),n)})),t))for(;s<u;s++)t(e[s],n,a?r:r.call(e[s],s,t(e[s],n)));return i?e:l?t.call(e):u?t(e[0],n):o},R=/^-ms-/,I=/-([a-z])/g;function W(e,t){return t.toUpperCase()}function F(e){return e.replace(R,"ms-").replace(I,W)}var $=function(e){return 1===e.nodeType||9===e.nodeType||!+e.nodeType};function B(){this.expando=ce.expando+B.uid++}B.uid=1,B.prototype={cache:function(e){var t=e[this.expando];return t||(t={},$(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var r,i=this.cache(e);if("string"==typeof t)i[F(t)]=n;else for(r in t)i[F(r)]=t[r];return i},get:function(e,t){return void 0===t?this.cache(e):e[this.expando]&&e[this.expando][F(t)]},access:function(e,t,n){return void 0===t||t&&"string"==typeof t&&void 0===n?this.get(e,t):(this.set(e,t,n),void 0!==n?n:t)},remove:function(e,t){var n,r=e[this.expando];if(void 0!==r){if(void 0!==t){n=(t=Array.isArray(t)?t.map(F):(t=F(t))in r?[t]:t.match(D)||[]).length;while(n--)delete r[t[n]]}(void 0===t||ce.isEmptyObject(r))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return void 0!==t&&!ce.isEmptyObject(t)}};var _=new B,z=new B,X=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,U=/[A-Z]/g;function V(e,t,n){var r,i;if(void 0===n&&1===e.nodeType)if(r="data-"+t.replace(U,"-$&").toLowerCase(),"string"==typeof(n=e.getAttribute(r))){try{n="true"===(i=n)||"false"!==i&&("null"===i?null:i===+i+""?+i:X.test(i)?JSON.parse(i):i)}catch(e){}z.set(e,t,n)}else n=void 0;return n}ce.extend({hasData:function(e){return z.hasData(e)||_.hasData(e)},data:function(e,t,n){return z.access(e,t,n)},removeData:function(e,t){z.remove(e,t)},_data:function(e,t,n){return _.access(e,t,n)},_removeData:function(e,t){_.remove(e,t)}}),ce.fn.extend({data:function(n,e){var t,r,i,o=this[0],a=o&&o.attributes;if(void 0===n){if(this.length&&(i=z.get(o),1===o.nodeType&&!_.get(o,"hasDataAttrs"))){t=a.length;while(t--)a[t]&&0===(r=a[t].name).indexOf("data-")&&(r=F(r.slice(5)),V(o,r,i[r]));_.set(o,"hasDataAttrs",!0)}return i}return"object"==typeof n?this.each(function(){z.set(this,n)}):M(this,function(e){var t;if(o&&void 0===e)return void 0!==(t=z.get(o,n))?t:void 0!==(t=V(o,n))?t:void 0;this.each(function(){z.set(this,n,e)})},null,e,1<arguments.length,null,!0)},removeData:function(e){return this.each(function(){z.remove(this,e)})}}),ce.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=_.get(e,t),n&&(!r||Array.isArray(n)?r=_.access(e,t,ce.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=ce.queue(e,t),r=n.length,i=n.shift(),o=ce._queueHooks(e,t);"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,function(){ce.dequeue(e,t)},o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return _.get(e,n)||_.access(e,n,{empty:ce.Callbacks("once memory").add(function(){_.remove(e,[t+"queue",n])})})}}),ce.fn.extend({queue:function(t,n){var e=2;return"string"!=typeof t&&(n=t,t="fx",e--),arguments.length<e?ce.queue(this[0],t):void 0===n?this:this.each(function(){var e=ce.queue(this,t,n);ce._queueHooks(this,t),"fx"===t&&"inprogress"!==e[0]&&ce.dequeue(this,t)})},dequeue:function(e){return this.each(function(){ce.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=ce.Deferred(),o=this,a=this.length,s=function(){--r||i.resolveWith(o,[o])};"string"!=typeof e&&(t=e,e=void 0),e=e||"fx";while(a--)(n=_.get(o[a],e+"queueHooks"))&&n.empty&&(r++,n.empty.add(s));return s(),i.promise(t)}});var G=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,Y=new RegExp("^(?:([+-])=|)("+G+")([a-z%]*)$","i"),Q=["Top","Right","Bottom","Left"],J=C.documentElement,K=function(e){return ce.contains(e.ownerDocument,e)},Z={composed:!0};J.getRootNode&&(K=function(e){return ce.contains(e.ownerDocument,e)||e.getRootNode(Z)===e.ownerDocument});var ee=function(e,t){return"none"===(e=t||e).style.display||""===e.style.display&&K(e)&&"none"===ce.css(e,"display")};function te(e,t,n,r){var i,o,a=20,s=r?function(){return r.cur()}:function(){return ce.css(e,t,"")},u=s(),l=n&&n[3]||(ce.cssNumber[t]?"":"px"),c=e.nodeType&&(ce.cssNumber[t]||"px"!==l&&+u)&&Y.exec(ce.css(e,t));if(c&&c[3]!==l){u/=2,l=l||c[3],c=+u||1;while(a--)ce.style(e,t,c+l),(1-o)*(1-(o=s()/u||.5))<=0&&(a=0),c/=o;c*=2,ce.style(e,t,c+l),n=n||[]}return n&&(c=+c||+u||0,i=n[1]?c+(n[1]+1)*n[2]:+n[2],r&&(r.unit=l,r.start=c,r.end=i)),i}var ne={};function re(e,t){for(var n,r,i,o,a,s,u,l=[],c=0,f=e.length;c<f;c++)(r=e[c]).style&&(n=r.style.display,t?("none"===n&&(l[c]=_.get(r,"display")||null,l[c]||(r.style.display="")),""===r.style.display&&ee(r)&&(l[c]=(u=a=o=void 0,a=(i=r).ownerDocument,s=i.nodeName,(u=ne[s])||(o=a.body.appendChild(a.createElement(s)),u=ce.css(o,"display"),o.parentNode.removeChild(o),"none"===u&&(u="block"),ne[s]=u)))):"none"!==n&&(l[c]="none",_.set(r,"display",n)));for(c=0;c<f;c++)null!=l[c]&&(e[c].style.display=l[c]);return e}ce.fn.extend({show:function(){return re(this,!0)},hide:function(){return re(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each(function(){ee(this)?ce(this).show():ce(this).hide()})}});var xe,be,we=/^(?:checkbox|radio)$/i,Te=/<([a-z][^\/\0>\x20\t\r\n\f]*)/i,Ce=/^$|^module$|\/(?:java|ecma)script/i;xe=C.createDocumentFragment().appendChild(C.createElement("div")),(be=C.createElement("input")).setAttribute("type","radio"),be.setAttribute("checked","checked"),be.setAttribute("name","t"),xe.appendChild(be),le.checkClone=xe.cloneNode(!0).cloneNode(!0).lastChild.checked,xe.innerHTML="<textarea>x</textarea>",le.noCloneChecked=!!xe.cloneNode(!0).lastChild.defaultValue,xe.innerHTML="<option></option>",le.option=!!xe.lastChild;var ke={thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};function Se(e,t){var n;return n="undefined"!=typeof e.getElementsByTagName?e.getElementsByTagName(t||"*"):"undefined"!=typeof e.querySelectorAll?e.querySelectorAll(t||"*"):[],void 0===t||t&&fe(e,t)?ce.merge([e],n):n}function Ee(e,t){for(var n=0,r=e.length;n<r;n++)_.set(e[n],"globalEval",!t||_.get(t[n],"globalEval"))}ke.tbody=ke.tfoot=ke.colgroup=ke.caption=ke.thead,ke.th=ke.td,le.option||(ke.optgroup=ke.option=[1,"<select multiple='multiple'>","</select>"]);var je=/<|&#?\w+;/;function Ae(e,t,n,r,i){for(var o,a,s,u,l,c,f=t.createDocumentFragment(),p=[],d=0,h=e.length;d<h;d++)if((o=e[d])||0===o)if("object"===x(o))ce.merge(p,o.nodeType?[o]:o);else if(je.test(o)){a=a||f.appendChild(t.createElement("div")),s=(Te.exec(o)||["",""])[1].toLowerCase(),u=ke[s]||ke._default,a.innerHTML=u[1]+ce.htmlPrefilter(o)+u[2],c=u[0];while(c--)a=a.lastChild;ce.merge(p,a.childNodes),(a=f.firstChild).textContent=""}else p.push(t.createTextNode(o));f.textContent="",d=0;while(o=p[d++])if(r&&-1<ce.inArray(o,r))i&&i.push(o);else if(l=K(o),a=Se(f.appendChild(o),"script"),l&&Ee(a),n){c=0;while(o=a[c++])Ce.test(o.type||"")&&n.push(o)}return f}var De=/^([^.]*)(?:\.(.+)|)/;function Ne(){return!0}function qe(){return!1}function Le(e,t,n,r,i,o){var a,s;if("object"==typeof t){for(s in"string"!=typeof n&&(r=r||n,n=void 0),t)Le(e,s,n,r,t[s],o);return e}if(null==r&&null==i?(i=n,r=n=void 0):null==i&&("string"==typeof n?(i=r,r=void 0):(i=r,r=n,n=void 0)),!1===i)i=qe;else if(!i)return e;return 1===o&&(a=i,(i=function(e){return ce().off(e),a.apply(this,arguments)}).guid=a.guid||(a.guid=ce.guid++)),e.each(function(){ce.event.add(this,t,i,r,n)})}function He(e,r,t){t?(_.set(e,r,!1),ce.event.add(e,r,{namespace:!1,handler:function(e){var t,n=_.get(this,r);if(1&e.isTrigger&&this[r]){if(n)(ce.event.special[r]||{}).delegateType&&e.stopPropagation();else if(n=ae.call(arguments),_.set(this,r,n),this[r](),t=_.get(this,r),_.set(this,r,!1),n!==t)return e.stopImmediatePropagation(),e.preventDefault(),t}else n&&(_.set(this,r,ce.event.trigger(n[0],n.slice(1),this)),e.stopPropagation(),e.isImmediatePropagationStopped=Ne)}})):void 0===_.get(e,r)&&ce.event.add(e,r,Ne)}ce.event={global:{},add:function(t,e,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,v=_.get(t);if($(t)){n.handler&&(n=(o=n).handler,i=o.selector),i&&ce.find.matchesSelector(J,i),n.guid||(n.guid=ce.guid++),(u=v.events)||(u=v.events=Object.create(null)),(a=v.handle)||(a=v.handle=function(e){return"undefined"!=typeof ce&&ce.event.triggered!==e.type?ce.event.dispatch.apply(t,arguments):void 0}),l=(e=(e||"").match(D)||[""]).length;while(l--)d=g=(s=De.exec(e[l])||[])[1],h=(s[2]||"").split(".").sort(),d&&(f=ce.event.special[d]||{},d=(i?f.delegateType:f.bindType)||d,f=ce.event.special[d]||{},c=ce.extend({type:d,origType:g,data:r,handler:n,guid:n.guid,selector:i,needsContext:i&&ce.expr.match.needsContext.test(i),namespace:h.join(".")},o),(p=u[d])||((p=u[d]=[]).delegateCount=0,f.setup&&!1!==f.setup.call(t,r,h,a)||t.addEventListener&&t.addEventListener(d,a)),f.add&&(f.add.call(t,c),c.handler.guid||(c.handler.guid=n.guid)),i?p.splice(p.delegateCount++,0,c):p.push(c),ce.event.global[d]=!0)}},remove:function(e,t,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,v=_.hasData(e)&&_.get(e);if(v&&(u=v.events)){l=(t=(t||"").match(D)||[""]).length;while(l--)if(d=g=(s=De.exec(t[l])||[])[1],h=(s[2]||"").split(".").sort(),d){f=ce.event.special[d]||{},p=u[d=(r?f.delegateType:f.bindType)||d]||[],s=s[2]&&new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"),a=o=p.length;while(o--)c=p[o],!i&&g!==c.origType||n&&n.guid!==c.guid||s&&!s.test(c.namespace)||r&&r!==c.selector&&("**"!==r||!c.selector)||(p.splice(o,1),c.selector&&p.delegateCount--,f.remove&&f.remove.call(e,c));a&&!p.length&&(f.teardown&&!1!==f.teardown.call(e,h,v.handle)||ce.removeEvent(e,d,v.handle),delete u[d])}else for(d in u)ce.event.remove(e,d+t[l],n,r,!0);ce.isEmptyObject(u)&&_.remove(e,"handle events")}},dispatch:function(e){var t,n,r,i,o,a,s=new Array(arguments.length),u=ce.event.fix(e),l=(_.get(this,"events")||Object.create(null))[u.type]||[],c=ce.event.special[u.type]||{};for(s[0]=u,t=1;t<arguments.length;t++)s[t]=arguments[t];if(u.delegateTarget=this,!c.preDispatch||!1!==c.preDispatch.call(this,u)){a=ce.event.handlers.call(this,u,l),t=0;while((i=a[t++])&&!u.isPropagationStopped()){u.currentTarget=i.elem,n=0;while((o=i.handlers[n++])&&!u.isImmediatePropagationStopped())u.rnamespace&&!1!==o.namespace&&!u.rnamespace.test(o.namespace)||(u.handleObj=o,u.data=o.data,void 0!==(r=((ce.event.special[o.origType]||{}).handle||o.handler).apply(i.elem,s))&&!1===(u.result=r)&&(u.preventDefault(),u.stopPropagation()))}return c.postDispatch&&c.postDispatch.call(this,u),u.result}},handlers:function(e,t){var n,r,i,o,a,s=[],u=t.delegateCount,l=e.target;if(u&&l.nodeType&&!("click"===e.type&&1<=e.button))for(;l!==this;l=l.parentNode||this)if(1===l.nodeType&&("click"!==e.type||!0!==l.disabled)){for(o=[],a={},n=0;n<u;n++)void 0===a[i=(r=t[n]).selector+" "]&&(a[i]=r.needsContext?-1<ce(i,this).index(l):ce.find(i,this,null,[l]).length),a[i]&&o.push(r);o.length&&s.push({elem:l,handlers:o})}return l=this,u<t.length&&s.push({elem:l,handlers:t.slice(u)}),s},addProp:function(t,e){Object.defineProperty(ce.Event.prototype,t,{enumerable:!0,configurable:!0,get:v(e)?function(){if(this.originalEvent)return e(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[t]},set:function(e){Object.defineProperty(this,t,{enumerable:!0,configurable:!0,writable:!0,value:e})}})},fix:function(e){return e[ce.expando]?e:new ce.Event(e)},special:{load:{noBubble:!0},click:{setup:function(e){var t=this||e;return we.test(t.type)&&t.click&&fe(t,"input")&&He(t,"click",!0),!1},trigger:function(e){var t=this||e;return we.test(t.type)&&t.click&&fe(t,"input")&&He(t,"click"),!0},_default:function(e){var t=e.target;return we.test(t.type)&&t.click&&fe(t,"input")&&_.get(t,"click")||fe(t,"a")}},beforeunload:{postDispatch:function(e){void 0!==e.result&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},ce.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},ce.Event=function(e,t){if(!(this instanceof ce.Event))return new ce.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||void 0===e.defaultPrevented&&!1===e.returnValue?Ne:qe,this.target=e.target&&3===e.target.nodeType?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&ce.extend(this,t),this.timeStamp=e&&e.timeStamp||Date.now(),this[ce.expando]=!0},ce.Event.prototype={constructor:ce.Event,isDefaultPrevented:qe,isPropagationStopped:qe,isImmediatePropagationStopped:qe,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=Ne,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=Ne,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=Ne,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},ce.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,"char":!0,code:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:!0},ce.event.addProp),ce.each({focus:"focusin",blur:"focusout"},function(r,i){function o(e){if(C.documentMode){var t=_.get(this,"handle"),n=ce.event.fix(e);n.type="focusin"===e.type?"focus":"blur",n.isSimulated=!0,t(e),n.target===n.currentTarget&&t(n)}else ce.event.simulate(i,e.target,ce.event.fix(e))}ce.event.special[r]={setup:function(){var e;if(He(this,r,!0),!C.documentMode)return!1;(e=_.get(this,i))||this.addEventListener(i,o),_.set(this,i,(e||0)+1)},trigger:function(){return He(this,r),!0},teardown:function(){var e;if(!C.documentMode)return!1;(e=_.get(this,i)-1)?_.set(this,i,e):(this.removeEventListener(i,o),_.remove(this,i))},_default:function(e){return _.get(e.target,r)},delegateType:i},ce.event.special[i]={setup:function(){var e=this.ownerDocument||this.document||this,t=C.documentMode?this:e,n=_.get(t,i);n||(C.documentMode?this.addEventListener(i,o):e.addEventListener(r,o,!0)),_.set(t,i,(n||0)+1)},teardown:function(){var e=this.ownerDocument||this.document||this,t=C.documentMode?this:e,n=_.get(t,i)-1;n?_.set(t,i,n):(C.documentMode?this.removeEventListener(i,o):e.removeEventListener(r,o,!0),_.remove(t,i))}}}),ce.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(e,i){ce.event.special[e]={delegateType:i,bindType:i,handle:function(e){var t,n=e.relatedTarget,r=e.handleObj;return n&&(n===this||ce.contains(this,n))||(e.type=r.origType,t=r.handler.apply(this,arguments),e.type=i),t}}}),ce.fn.extend({on:function(e,t,n,r){return Le(this,e,t,n,r)},one:function(e,t,n,r){return Le(this,e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,ce(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return!1!==t&&"function"!=typeof t||(n=t,t=void 0),!1===n&&(n=qe),this.each(function(){ce.event.remove(this,e,n,t)})}});var Oe=/<script|<style|<link/i,Pe=/checked\s*(?:[^=]|=\s*.checked.)/i,Me=/^\s*<!\[CDATA\[|\]\]>\s*$/g;function Re(e,t){return fe(e,"table")&&fe(11!==t.nodeType?t:t.firstChild,"tr")&&ce(e).children("tbody")[0]||e}function Ie(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function We(e){return"true/"===(e.type||"").slice(0,5)?e.type=e.type.slice(5):e.removeAttribute("type"),e}function Fe(e,t){var n,r,i,o,a,s;if(1===t.nodeType){if(_.hasData(e)&&(s=_.get(e).events))for(i in _.remove(t,"handle events"),s)for(n=0,r=s[i].length;n<r;n++)ce.event.add(t,i,s[i][n]);z.hasData(e)&&(o=z.access(e),a=ce.extend({},o),z.set(t,a))}}function $e(n,r,i,o){r=g(r);var e,t,a,s,u,l,c=0,f=n.length,p=f-1,d=r[0],h=v(d);if(h||1<f&&"string"==typeof d&&!le.checkClone&&Pe.test(d))return n.each(function(e){var t=n.eq(e);h&&(r[0]=d.call(this,e,t.html())),$e(t,r,i,o)});if(f&&(t=(e=Ae(r,n[0].ownerDocument,!1,n,o)).firstChild,1===e.childNodes.length&&(e=t),t||o)){for(s=(a=ce.map(Se(e,"script"),Ie)).length;c<f;c++)u=e,c!==p&&(u=ce.clone(u,!0,!0),s&&ce.merge(a,Se(u,"script"))),i.call(n[c],u,c);if(s)for(l=a[a.length-1].ownerDocument,ce.map(a,We),c=0;c<s;c++)u=a[c],Ce.test(u.type||"")&&!_.access(u,"globalEval")&&ce.contains(l,u)&&(u.src&&"module"!==(u.type||"").toLowerCase()?ce._evalUrl&&!u.noModule&&ce._evalUrl(u.src,{nonce:u.nonce||u.getAttribute("nonce")},l):m(u.textContent.replace(Me,""),u,l))}return n}function Be(e,t,n){for(var r,i=t?ce.filter(t,e):e,o=0;null!=(r=i[o]);o++)n||1!==r.nodeType||ce.cleanData(Se(r)),r.parentNode&&(n&&K(r)&&Ee(Se(r,"script")),r.parentNode.removeChild(r));return e}ce.extend({htmlPrefilter:function(e){return e},clone:function(e,t,n){var r,i,o,a,s,u,l,c=e.cloneNode(!0),f=K(e);if(!(le.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||ce.isXMLDoc(e)))for(a=Se(c),r=0,i=(o=Se(e)).length;r<i;r++)s=o[r],u=a[r],void 0,"input"===(l=u.nodeName.toLowerCase())&&we.test(s.type)?u.checked=s.checked:"input"!==l&&"textarea"!==l||(u.defaultValue=s.defaultValue);if(t)if(n)for(o=o||Se(e),a=a||Se(c),r=0,i=o.length;r<i;r++)Fe(o[r],a[r]);else Fe(e,c);return 0<(a=Se(c,"script")).length&&Ee(a,!f&&Se(e,"script")),c},cleanData:function(e){for(var t,n,r,i=ce.event.special,o=0;void 0!==(n=e[o]);o++)if($(n)){if(t=n[_.expando]){if(t.events)for(r in t.events)i[r]?ce.event.remove(n,r):ce.removeEvent(n,r,t.handle);n[_.expando]=void 0}n[z.expando]&&(n[z.expando]=void 0)}}}),ce.fn.extend({detach:function(e){return Be(this,e,!0)},remove:function(e){return Be(this,e)},text:function(e){return M(this,function(e){return void 0===e?ce.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=e)})},null,e,arguments.length)},append:function(){return $e(this,arguments,function(e){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||Re(this,e).appendChild(e)})},prepend:function(){return $e(this,arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=Re(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return $e(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return $e(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},empty:function(){for(var e,t=0;null!=(e=this[t]);t++)1===e.nodeType&&(ce.cleanData(Se(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null!=e&&e,t=null==t?e:t,this.map(function(){return ce.clone(this,e,t)})},html:function(e){return M(this,function(e){var t=this[0]||{},n=0,r=this.length;if(void 0===e&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!Oe.test(e)&&!ke[(Te.exec(e)||["",""])[1].toLowerCase()]){e=ce.htmlPrefilter(e);try{for(;n<r;n++)1===(t=this[n]||{}).nodeType&&(ce.cleanData(Se(t,!1)),t.innerHTML=e);t=0}catch(e){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var n=[];return $e(this,arguments,function(e){var t=this.parentNode;ce.inArray(this,n)<0&&(ce.cleanData(Se(this)),t&&t.replaceChild(e,this))},n)}}),ce.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,a){ce.fn[e]=function(e){for(var t,n=[],r=ce(e),i=r.length-1,o=0;o<=i;o++)t=o===i?this:this.clone(!0),ce(r[o])[a](t),s.apply(n,t.get());return this.pushStack(n)}});var _e=new RegExp("^("+G+")(?!px)[a-z%]+$","i"),ze=/^--/,Xe=function(e){var t=e.ownerDocument.defaultView;return t&&t.opener||(t=ie),t.getComputedStyle(e)},Ue=function(e,t,n){var r,i,o={};for(i in t)o[i]=e.style[i],e.style[i]=t[i];for(i in r=n.call(e),t)e.style[i]=o[i];return r},Ve=new RegExp(Q.join("|"),"i");function Ge(e,t,n){var r,i,o,a,s=ze.test(t),u=e.style;return(n=n||Xe(e))&&(a=n.getPropertyValue(t)||n[t],s&&a&&(a=a.replace(ve,"$1")||void 0),""!==a||K(e)||(a=ce.style(e,t)),!le.pixelBoxStyles()&&_e.test(a)&&Ve.test(t)&&(r=u.width,i=u.minWidth,o=u.maxWidth,u.minWidth=u.maxWidth=u.width=a,a=n.width,u.width=r,u.minWidth=i,u.maxWidth=o)),void 0!==a?a+"":a}function Ye(e,t){return{get:function(){if(!e())return(this.get=t).apply(this,arguments);delete this.get}}}!function(){function e(){if(l){u.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",l.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",J.appendChild(u).appendChild(l);var e=ie.getComputedStyle(l);n="1%"!==e.top,s=12===t(e.marginLeft),l.style.right="60%",o=36===t(e.right),r=36===t(e.width),l.style.position="absolute",i=12===t(l.offsetWidth/3),J.removeChild(u),l=null}}function t(e){return Math.round(parseFloat(e))}var n,r,i,o,a,s,u=C.createElement("div"),l=C.createElement("div");l.style&&(l.style.backgroundClip="content-box",l.cloneNode(!0).style.backgroundClip="",le.clearCloneStyle="content-box"===l.style.backgroundClip,ce.extend(le,{boxSizingReliable:function(){return e(),r},pixelBoxStyles:function(){return e(),o},pixelPosition:function(){return e(),n},reliableMarginLeft:function(){return e(),s},scrollboxSize:function(){return e(),i},reliableTrDimensions:function(){var e,t,n,r;return null==a&&(e=C.createElement("table"),t=C.createElement("tr"),n=C.createElement("div"),e.style.cssText="position:absolute;left:-11111px;border-collapse:separate",t.style.cssText="box-sizing:content-box;border:1px solid",t.style.height="1px",n.style.height="9px",n.style.display="block",J.appendChild(e).appendChild(t).appendChild(n),r=ie.getComputedStyle(t),a=parseInt(r.height,10)+parseInt(r.borderTopWidth,10)+parseInt(r.borderBottomWidth,10)===t.offsetHeight,J.removeChild(e)),a}}))}();var Qe=["Webkit","Moz","ms"],Je=C.createElement("div").style,Ke={};function Ze(e){var t=ce.cssProps[e]||Ke[e];return t||(e in Je?e:Ke[e]=function(e){var t=e[0].toUpperCase()+e.slice(1),n=Qe.length;while(n--)if((e=Qe[n]+t)in Je)return e}(e)||e)}var et=/^(none|table(?!-c[ea]).+)/,tt={position:"absolute",visibility:"hidden",display:"block"},nt={letterSpacing:"0",fontWeight:"400"};function rt(e,t,n){var r=Y.exec(t);return r?Math.max(0,r[2]-(n||0))+(r[3]||"px"):t}function it(e,t,n,r,i,o){var a="width"===t?1:0,s=0,u=0,l=0;if(n===(r?"border":"content"))return 0;for(;a<4;a+=2)"margin"===n&&(l+=ce.css(e,n+Q[a],!0,i)),r?("content"===n&&(u-=ce.css(e,"padding"+Q[a],!0,i)),"margin"!==n&&(u-=ce.css(e,"border"+Q[a]+"Width",!0,i))):(u+=ce.css(e,"padding"+Q[a],!0,i),"padding"!==n?u+=ce.css(e,"border"+Q[a]+"Width",!0,i):s+=ce.css(e,"border"+Q[a]+"Width",!0,i));return!r&&0<=o&&(u+=Math.max(0,Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-o-u-s-.5))||0),u+l}function ot(e,t,n){var r=Xe(e),i=(!le.boxSizingReliable()||n)&&"border-box"===ce.css(e,"boxSizing",!1,r),o=i,a=Ge(e,t,r),s="offset"+t[0].toUpperCase()+t.slice(1);if(_e.test(a)){if(!n)return a;a="auto"}return(!le.boxSizingReliable()&&i||!le.reliableTrDimensions()&&fe(e,"tr")||"auto"===a||!parseFloat(a)&&"inline"===ce.css(e,"display",!1,r))&&e.getClientRects().length&&(i="border-box"===ce.css(e,"boxSizing",!1,r),(o=s in e)&&(a=e[s])),(a=parseFloat(a)||0)+it(e,t,n||(i?"border":"content"),o,r,a)+"px"}function at(e,t,n,r,i){return new at.prototype.init(e,t,n,r,i)}ce.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Ge(e,"opacity");return""===n?"1":n}}}},cssNumber:{animationIterationCount:!0,aspectRatio:!0,borderImageSlice:!0,columnCount:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,scale:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeMiterlimit:!0,strokeOpacity:!0},cssProps:{},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,a,s=F(t),u=ze.test(t),l=e.style;if(u||(t=Ze(s)),a=ce.cssHooks[t]||ce.cssHooks[s],void 0===n)return a&&"get"in a&&void 0!==(i=a.get(e,!1,r))?i:l[t];"string"===(o=typeof n)&&(i=Y.exec(n))&&i[1]&&(n=te(e,t,i),o="number"),null!=n&&n==n&&("number"!==o||u||(n+=i&&i[3]||(ce.cssNumber[s]?"":"px")),le.clearCloneStyle||""!==n||0!==t.indexOf("background")||(l[t]="inherit"),a&&"set"in a&&void 0===(n=a.set(e,n,r))||(u?l.setProperty(t,n):l[t]=n))}},css:function(e,t,n,r){var i,o,a,s=F(t);return ze.test(t)||(t=Ze(s)),(a=ce.cssHooks[t]||ce.cssHooks[s])&&"get"in a&&(i=a.get(e,!0,n)),void 0===i&&(i=Ge(e,t,r)),"normal"===i&&t in nt&&(i=nt[t]),""===n||n?(o=parseFloat(i),!0===n||isFinite(o)?o||0:i):i}}),ce.each(["height","width"],function(e,u){ce.cssHooks[u]={get:function(e,t,n){if(t)return!et.test(ce.css(e,"display"))||e.getClientRects().length&&e.getBoundingClientRect().width?ot(e,u,n):Ue(e,tt,function(){return ot(e,u,n)})},set:function(e,t,n){var r,i=Xe(e),o=!le.scrollboxSize()&&"absolute"===i.position,a=(o||n)&&"border-box"===ce.css(e,"boxSizing",!1,i),s=n?it(e,u,n,a,i):0;return a&&o&&(s-=Math.ceil(e["offset"+u[0].toUpperCase()+u.slice(1)]-parseFloat(i[u])-it(e,u,"border",!1,i)-.5)),s&&(r=Y.exec(t))&&"px"!==(r[3]||"px")&&(e.style[u]=t,t=ce.css(e,u)),rt(0,t,s)}}}),ce.cssHooks.marginLeft=Ye(le.reliableMarginLeft,function(e,t){if(t)return(parseFloat(Ge(e,"marginLeft"))||e.getBoundingClientRect().left-Ue(e,{marginLeft:0},function(){return e.getBoundingClientRect().left}))+"px"}),ce.each({margin:"",padding:"",border:"Width"},function(i,o){ce.cssHooks[i+o]={expand:function(e){for(var t=0,n={},r="string"==typeof e?e.split(" "):[e];t<4;t++)n[i+Q[t]+o]=r[t]||r[t-2]||r[0];return n}},"margin"!==i&&(ce.cssHooks[i+o].set=rt)}),ce.fn.extend({css:function(e,t){return M(this,function(e,t,n){var r,i,o={},a=0;if(Array.isArray(t)){for(r=Xe(e),i=t.length;a<i;a++)o[t[a]]=ce.css(e,t[a],!1,r);return o}return void 0!==n?ce.style(e,t,n):ce.css(e,t)},e,t,1<arguments.length)}}),((ce.Tween=at).prototype={constructor:at,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||ce.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(ce.cssNumber[n]?"":"px")},cur:function(){var e=at.propHooks[this.prop];return e&&e.get?e.get(this):at.propHooks._default.get(this)},run:function(e){var t,n=at.propHooks[this.prop];return this.options.duration?this.pos=t=ce.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):at.propHooks._default.set(this),this}}).init.prototype=at.prototype,(at.propHooks={_default:{get:function(e){var t;return 1!==e.elem.nodeType||null!=e.elem[e.prop]&&null==e.elem.style[e.prop]?e.elem[e.prop]:(t=ce.css(e.elem,e.prop,""))&&"auto"!==t?t:0},set:function(e){ce.fx.step[e.prop]?ce.fx.step[e.prop](e):1!==e.elem.nodeType||!ce.cssHooks[e.prop]&&null==e.elem.style[Ze(e.prop)]?e.elem[e.prop]=e.now:ce.style(e.elem,e.prop,e.now+e.unit)}}}).scrollTop=at.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},ce.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},_default:"swing"},ce.fx=at.prototype.init,ce.fx.step={};var st,ut,lt,ct,ft=/^(?:toggle|show|hide)$/,pt=/queueHooks$/;function dt(){ut&&(!1===C.hidden&&ie.requestAnimationFrame?ie.requestAnimationFrame(dt):ie.setTimeout(dt,ce.fx.interval),ce.fx.tick())}function ht(){return ie.setTimeout(function(){st=void 0}),st=Date.now()}function gt(e,t){var n,r=0,i={height:e};for(t=t?1:0;r<4;r+=2-t)i["margin"+(n=Q[r])]=i["padding"+n]=e;return t&&(i.opacity=i.width=e),i}function vt(e,t,n){for(var r,i=(yt.tweeners[t]||[]).concat(yt.tweeners["*"]),o=0,a=i.length;o<a;o++)if(r=i[o].call(n,t,e))return r}function yt(o,e,t){var n,a,r=0,i=yt.prefilters.length,s=ce.Deferred().always(function(){delete u.elem}),u=function(){if(a)return!1;for(var e=st||ht(),t=Math.max(0,l.startTime+l.duration-e),n=1-(t/l.duration||0),r=0,i=l.tweens.length;r<i;r++)l.tweens[r].run(n);return s.notifyWith(o,[l,n,t]),n<1&&i?t:(i||s.notifyWith(o,[l,1,0]),s.resolveWith(o,[l]),!1)},l=s.promise({elem:o,props:ce.extend({},e),opts:ce.extend(!0,{specialEasing:{},easing:ce.easing._default},t),originalProperties:e,originalOptions:t,startTime:st||ht(),duration:t.duration,tweens:[],createTween:function(e,t){var n=ce.Tween(o,l.opts,e,t,l.opts.specialEasing[e]||l.opts.easing);return l.tweens.push(n),n},stop:function(e){var t=0,n=e?l.tweens.length:0;if(a)return this;for(a=!0;t<n;t++)l.tweens[t].run(1);return e?(s.notifyWith(o,[l,1,0]),s.resolveWith(o,[l,e])):s.rejectWith(o,[l,e]),this}}),c=l.props;for(!function(e,t){var n,r,i,o,a;for(n in e)if(i=t[r=F(n)],o=e[n],Array.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),(a=ce.cssHooks[r])&&"expand"in a)for(n in o=a.expand(o),delete e[r],o)n in e||(e[n]=o[n],t[n]=i);else t[r]=i}(c,l.opts.specialEasing);r<i;r++)if(n=yt.prefilters[r].call(l,o,c,l.opts))return v(n.stop)&&(ce._queueHooks(l.elem,l.opts.queue).stop=n.stop.bind(n)),n;return ce.map(c,vt,l),v(l.opts.start)&&l.opts.start.call(o,l),l.progress(l.opts.progress).done(l.opts.done,l.opts.complete).fail(l.opts.fail).always(l.opts.always),ce.fx.timer(ce.extend(u,{elem:o,anim:l,queue:l.opts.queue})),l}ce.Animation=ce.extend(yt,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return te(n.elem,e,Y.exec(t),n),n}]},tweener:function(e,t){v(e)?(t=e,e=["*"]):e=e.match(D);for(var n,r=0,i=e.length;r<i;r++)n=e[r],yt.tweeners[n]=yt.tweeners[n]||[],yt.tweeners[n].unshift(t)},prefilters:[function(e,t,n){var r,i,o,a,s,u,l,c,f="width"in t||"height"in t,p=this,d={},h=e.style,g=e.nodeType&&ee(e),v=_.get(e,"fxshow");for(r in n.queue||(null==(a=ce._queueHooks(e,"fx")).unqueued&&(a.unqueued=0,s=a.empty.fire,a.empty.fire=function(){a.unqueued||s()}),a.unqueued++,p.always(function(){p.always(function(){a.unqueued--,ce.queue(e,"fx").length||a.empty.fire()})})),t)if(i=t[r],ft.test(i)){if(delete t[r],o=o||"toggle"===i,i===(g?"hide":"show")){if("show"!==i||!v||void 0===v[r])continue;g=!0}d[r]=v&&v[r]||ce.style(e,r)}if((u=!ce.isEmptyObject(t))||!ce.isEmptyObject(d))for(r in f&&1===e.nodeType&&(n.overflow=[h.overflow,h.overflowX,h.overflowY],null==(l=v&&v.display)&&(l=_.get(e,"display")),"none"===(c=ce.css(e,"display"))&&(l?c=l:(re([e],!0),l=e.style.display||l,c=ce.css(e,"display"),re([e]))),("inline"===c||"inline-block"===c&&null!=l)&&"none"===ce.css(e,"float")&&(u||(p.done(function(){h.display=l}),null==l&&(c=h.display,l="none"===c?"":c)),h.display="inline-block")),n.overflow&&(h.overflow="hidden",p.always(function(){h.overflow=n.overflow[0],h.overflowX=n.overflow[1],h.overflowY=n.overflow[2]})),u=!1,d)u||(v?"hidden"in v&&(g=v.hidden):v=_.access(e,"fxshow",{display:l}),o&&(v.hidden=!g),g&&re([e],!0),p.done(function(){for(r in g||re([e]),_.remove(e,"fxshow"),d)ce.style(e,r,d[r])})),u=vt(g?v[r]:0,r,p),r in v||(v[r]=u.start,g&&(u.end=u.start,u.start=0))}],prefilter:function(e,t){t?yt.prefilters.unshift(e):yt.prefilters.push(e)}}),ce.speed=function(e,t,n){var r=e&&"object"==typeof e?ce.extend({},e):{complete:n||!n&&t||v(e)&&e,duration:e,easing:n&&t||t&&!v(t)&&t};return ce.fx.off?r.duration=0:"number"!=typeof r.duration&&(r.duration in ce.fx.speeds?r.duration=ce.fx.speeds[r.duration]:r.duration=ce.fx.speeds._default),null!=r.queue&&!0!==r.queue||(r.queue="fx"),r.old=r.complete,r.complete=function(){v(r.old)&&r.old.call(this),r.queue&&ce.dequeue(this,r.queue)},r},ce.fn.extend({fadeTo:function(e,t,n,r){return this.filter(ee).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(t,e,n,r){var i=ce.isEmptyObject(t),o=ce.speed(e,n,r),a=function(){var e=yt(this,ce.extend({},t),o);(i||_.get(this,"finish"))&&e.stop(!0)};return a.finish=a,i||!1===o.queue?this.each(a):this.queue(o.queue,a)},stop:function(i,e,o){var a=function(e){var t=e.stop;delete e.stop,t(o)};return"string"!=typeof i&&(o=e,e=i,i=void 0),e&&this.queue(i||"fx",[]),this.each(function(){var e=!0,t=null!=i&&i+"queueHooks",n=ce.timers,r=_.get(this);if(t)r[t]&&r[t].stop&&a(r[t]);else for(t in r)r[t]&&r[t].stop&&pt.test(t)&&a(r[t]);for(t=n.length;t--;)n[t].elem!==this||null!=i&&n[t].queue!==i||(n[t].anim.stop(o),e=!1,n.splice(t,1));!e&&o||ce.dequeue(this,i)})},finish:function(a){return!1!==a&&(a=a||"fx"),this.each(function(){var e,t=_.get(this),n=t[a+"queue"],r=t[a+"queueHooks"],i=ce.timers,o=n?n.length:0;for(t.finish=!0,ce.queue(this,a,[]),r&&r.stop&&r.stop.call(this,!0),e=i.length;e--;)i[e].elem===this&&i[e].queue===a&&(i[e].anim.stop(!0),i.splice(e,1));for(e=0;e<o;e++)n[e]&&n[e].finish&&n[e].finish.call(this);delete t.finish})}}),ce.each(["toggle","show","hide"],function(e,r){var i=ce.fn[r];ce.fn[r]=function(e,t,n){return null==e||"boolean"==typeof e?i.apply(this,arguments):this.animate(gt(r,!0),e,t,n)}}),ce.each({slideDown:gt("show"),slideUp:gt("hide"),slideToggle:gt("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,r){ce.fn[e]=function(e,t,n){return this.animate(r,e,t,n)}}),ce.timers=[],ce.fx.tick=function(){var e,t=0,n=ce.timers;for(st=Date.now();t<n.length;t++)(e=n[t])()||n[t]!==e||n.splice(t--,1);n.length||ce.fx.stop(),st=void 0},ce.fx.timer=function(e){ce.timers.push(e),ce.fx.start()},ce.fx.interval=13,ce.fx.start=function(){ut||(ut=!0,dt())},ce.fx.stop=function(){ut=null},ce.fx.speeds={slow:600,fast:200,_default:400},ce.fn.delay=function(r,e){return r=ce.fx&&ce.fx.speeds[r]||r,e=e||"fx",this.queue(e,function(e,t){var n=ie.setTimeout(e,r);t.stop=function(){ie.clearTimeout(n)}})},lt=C.createElement("input"),ct=C.createElement("select").appendChild(C.createElement("option")),lt.type="checkbox",le.checkOn=""!==lt.value,le.optSelected=ct.selected,(lt=C.createElement("input")).value="t",lt.type="radio",le.radioValue="t"===lt.value;var mt,xt=ce.expr.attrHandle;ce.fn.extend({attr:function(e,t){return M(this,ce.attr,e,t,1<arguments.length)},removeAttr:function(e){return this.each(function(){ce.removeAttr(this,e)})}}),ce.extend({attr:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return"undefined"==typeof e.getAttribute?ce.prop(e,t,n):(1===o&&ce.isXMLDoc(e)||(i=ce.attrHooks[t.toLowerCase()]||(ce.expr.match.bool.test(t)?mt:void 0)),void 0!==n?null===n?void ce.removeAttr(e,t):i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:(e.setAttribute(t,n+""),n):i&&"get"in i&&null!==(r=i.get(e,t))?r:null==(r=ce.find.attr(e,t))?void 0:r)},attrHooks:{type:{set:function(e,t){if(!le.radioValue&&"radio"===t&&fe(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,r=0,i=t&&t.match(D);if(i&&1===e.nodeType)while(n=i[r++])e.removeAttribute(n)}}),mt={set:function(e,t,n){return!1===t?ce.removeAttr(e,n):e.setAttribute(n,n),n}},ce.each(ce.expr.match.bool.source.match(/\w+/g),function(e,t){var a=xt[t]||ce.find.attr;xt[t]=function(e,t,n){var r,i,o=t.toLowerCase();return n||(i=xt[o],xt[o]=r,r=null!=a(e,t,n)?o:null,xt[o]=i),r}});var bt=/^(?:input|select|textarea|button)$/i,wt=/^(?:a|area)$/i;function Tt(e){return(e.match(D)||[]).join(" ")}function Ct(e){return e.getAttribute&&e.getAttribute("class")||""}function kt(e){return Array.isArray(e)?e:"string"==typeof e&&e.match(D)||[]}ce.fn.extend({prop:function(e,t){return M(this,ce.prop,e,t,1<arguments.length)},removeProp:function(e){return this.each(function(){delete this[ce.propFix[e]||e]})}}),ce.extend({prop:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return 1===o&&ce.isXMLDoc(e)||(t=ce.propFix[t]||t,i=ce.propHooks[t]),void 0!==n?i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){var t=ce.find.attr(e,"tabindex");return t?parseInt(t,10):bt.test(e.nodeName)||wt.test(e.nodeName)&&e.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),le.optSelected||(ce.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),ce.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){ce.propFix[this.toLowerCase()]=this}),ce.fn.extend({addClass:function(t){var e,n,r,i,o,a;return v(t)?this.each(function(e){ce(this).addClass(t.call(this,e,Ct(this)))}):(e=kt(t)).length?this.each(function(){if(r=Ct(this),n=1===this.nodeType&&" "+Tt(r)+" "){for(o=0;o<e.length;o++)i=e[o],n.indexOf(" "+i+" ")<0&&(n+=i+" ");a=Tt(n),r!==a&&this.setAttribute("class",a)}}):this},removeClass:function(t){var e,n,r,i,o,a;return v(t)?this.each(function(e){ce(this).removeClass(t.call(this,e,Ct(this)))}):arguments.length?(e=kt(t)).length?this.each(function(){if(r=Ct(this),n=1===this.nodeType&&" "+Tt(r)+" "){for(o=0;o<e.length;o++){i=e[o];while(-1<n.indexOf(" "+i+" "))n=n.replace(" "+i+" "," ")}a=Tt(n),r!==a&&this.setAttribute("class",a)}}):this:this.attr("class","")},toggleClass:function(t,n){var e,r,i,o,a=typeof t,s="string"===a||Array.isArray(t);return v(t)?this.each(function(e){ce(this).toggleClass(t.call(this,e,Ct(this),n),n)}):"boolean"==typeof n&&s?n?this.addClass(t):this.removeClass(t):(e=kt(t),this.each(function(){if(s)for(o=ce(this),i=0;i<e.length;i++)r=e[i],o.hasClass(r)?o.removeClass(r):o.addClass(r);else void 0!==t&&"boolean"!==a||((r=Ct(this))&&_.set(this,"__className__",r),this.setAttribute&&this.setAttribute("class",r||!1===t?"":_.get(this,"__className__")||""))}))},hasClass:function(e){var t,n,r=0;t=" "+e+" ";while(n=this[r++])if(1===n.nodeType&&-1<(" "+Tt(Ct(n))+" ").indexOf(t))return!0;return!1}});var St=/\r/g;ce.fn.extend({val:function(n){var r,e,i,t=this[0];return arguments.length?(i=v(n),this.each(function(e){var t;1===this.nodeType&&(null==(t=i?n.call(this,e,ce(this).val()):n)?t="":"number"==typeof t?t+="":Array.isArray(t)&&(t=ce.map(t,function(e){return null==e?"":e+""})),(r=ce.valHooks[this.type]||ce.valHooks[this.nodeName.toLowerCase()])&&"set"in r&&void 0!==r.set(this,t,"value")||(this.value=t))})):t?(r=ce.valHooks[t.type]||ce.valHooks[t.nodeName.toLowerCase()])&&"get"in r&&void 0!==(e=r.get(t,"value"))?e:"string"==typeof(e=t.value)?e.replace(St,""):null==e?"":e:void 0}}),ce.extend({valHooks:{option:{get:function(e){var t=ce.find.attr(e,"value");return null!=t?t:Tt(ce.text(e))}},select:{get:function(e){var t,n,r,i=e.options,o=e.selectedIndex,a="select-one"===e.type,s=a?null:[],u=a?o+1:i.length;for(r=o<0?u:a?o:0;r<u;r++)if(((n=i[r]).selected||r===o)&&!n.disabled&&(!n.parentNode.disabled||!fe(n.parentNode,"optgroup"))){if(t=ce(n).val(),a)return t;s.push(t)}return s},set:function(e,t){var n,r,i=e.options,o=ce.makeArray(t),a=i.length;while(a--)((r=i[a]).selected=-1<ce.inArray(ce.valHooks.option.get(r),o))&&(n=!0);return n||(e.selectedIndex=-1),o}}}}),ce.each(["radio","checkbox"],function(){ce.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=-1<ce.inArray(ce(e).val(),t)}},le.checkOn||(ce.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})});var Et=ie.location,jt={guid:Date.now()},At=/\?/;ce.parseXML=function(e){var t,n;if(!e||"string"!=typeof e)return null;try{t=(new ie.DOMParser).parseFromString(e,"text/xml")}catch(e){}return n=t&&t.getElementsByTagName("parsererror")[0],t&&!n||ce.error("Invalid XML: "+(n?ce.map(n.childNodes,function(e){return e.textContent}).join("\n"):e)),t};var Dt=/^(?:focusinfocus|focusoutblur)$/,Nt=function(e){e.stopPropagation()};ce.extend(ce.event,{trigger:function(e,t,n,r){var i,o,a,s,u,l,c,f,p=[n||C],d=ue.call(e,"type")?e.type:e,h=ue.call(e,"namespace")?e.namespace.split("."):[];if(o=f=a=n=n||C,3!==n.nodeType&&8!==n.nodeType&&!Dt.test(d+ce.event.triggered)&&(-1<d.indexOf(".")&&(d=(h=d.split(".")).shift(),h.sort()),u=d.indexOf(":")<0&&"on"+d,(e=e[ce.expando]?e:new ce.Event(d,"object"==typeof e&&e)).isTrigger=r?2:3,e.namespace=h.join("."),e.rnamespace=e.namespace?new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,e.result=void 0,e.target||(e.target=n),t=null==t?[e]:ce.makeArray(t,[e]),c=ce.event.special[d]||{},r||!c.trigger||!1!==c.trigger.apply(n,t))){if(!r&&!c.noBubble&&!y(n)){for(s=c.delegateType||d,Dt.test(s+d)||(o=o.parentNode);o;o=o.parentNode)p.push(o),a=o;a===(n.ownerDocument||C)&&p.push(a.defaultView||a.parentWindow||ie)}i=0;while((o=p[i++])&&!e.isPropagationStopped())f=o,e.type=1<i?s:c.bindType||d,(l=(_.get(o,"events")||Object.create(null))[e.type]&&_.get(o,"handle"))&&l.apply(o,t),(l=u&&o[u])&&l.apply&&$(o)&&(e.result=l.apply(o,t),!1===e.result&&e.preventDefault());return e.type=d,r||e.isDefaultPrevented()||c._default&&!1!==c._default.apply(p.pop(),t)||!$(n)||u&&v(n[d])&&!y(n)&&((a=n[u])&&(n[u]=null),ce.event.triggered=d,e.isPropagationStopped()&&f.addEventListener(d,Nt),n[d](),e.isPropagationStopped()&&f.removeEventListener(d,Nt),ce.event.triggered=void 0,a&&(n[u]=a)),e.result}},simulate:function(e,t,n){var r=ce.extend(new ce.Event,n,{type:e,isSimulated:!0});ce.event.trigger(r,null,t)}}),ce.fn.extend({trigger:function(e,t){return this.each(function(){ce.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];if(n)return ce.event.trigger(e,t,n,!0)}});var qt=/\[\]$/,Lt=/\r?\n/g,Ht=/^(?:submit|button|image|reset|file)$/i,Ot=/^(?:input|select|textarea|keygen)/i;function Pt(n,e,r,i){var t;if(Array.isArray(e))ce.each(e,function(e,t){r||qt.test(n)?i(n,t):Pt(n+"["+("object"==typeof t&&null!=t?e:"")+"]",t,r,i)});else if(r||"object"!==x(e))i(n,e);else for(t in e)Pt(n+"["+t+"]",e[t],r,i)}ce.param=function(e,t){var n,r=[],i=function(e,t){var n=v(t)?t():t;r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(null==n?"":n)};if(null==e)return"";if(Array.isArray(e)||e.jquery&&!ce.isPlainObject(e))ce.each(e,function(){i(this.name,this.value)});else for(n in e)Pt(n,e[n],t,i);return r.join("&")},ce.fn.extend({serialize:function(){return ce.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=ce.prop(this,"elements");return e?ce.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!ce(this).is(":disabled")&&Ot.test(this.nodeName)&&!Ht.test(e)&&(this.checked||!we.test(e))}).map(function(e,t){var n=ce(this).val();return null==n?null:Array.isArray(n)?ce.map(n,function(e){return{name:t.name,value:e.replace(Lt,"\r\n")}}):{name:t.name,value:n.replace(Lt,"\r\n")}}).get()}});var Mt=/%20/g,Rt=/#.*$/,It=/([?&])_=[^&]*/,Wt=/^(.*?):[ \t]*([^\r\n]*)$/gm,Ft=/^(?:GET|HEAD)$/,$t=/^\/\//,Bt={},_t={},zt="*/".concat("*"),Xt=C.createElement("a");function Ut(o){return function(e,t){"string"!=typeof e&&(t=e,e="*");var n,r=0,i=e.toLowerCase().match(D)||[];if(v(t))while(n=i[r++])"+"===n[0]?(n=n.slice(1)||"*",(o[n]=o[n]||[]).unshift(t)):(o[n]=o[n]||[]).push(t)}}function Vt(t,i,o,a){var s={},u=t===_t;function l(e){var r;return s[e]=!0,ce.each(t[e]||[],function(e,t){var n=t(i,o,a);return"string"!=typeof n||u||s[n]?u?!(r=n):void 0:(i.dataTypes.unshift(n),l(n),!1)}),r}return l(i.dataTypes[0])||!s["*"]&&l("*")}function Gt(e,t){var n,r,i=ce.ajaxSettings.flatOptions||{};for(n in t)void 0!==t[n]&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&ce.extend(!0,e,r),e}Xt.href=Et.href,ce.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Et.href,type:"GET",isLocal:/^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(Et.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":zt,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":ce.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?Gt(Gt(e,ce.ajaxSettings),t):Gt(ce.ajaxSettings,e)},ajaxPrefilter:Ut(Bt),ajaxTransport:Ut(_t),ajax:function(e,t){"object"==typeof e&&(t=e,e=void 0),t=t||{};var c,f,p,n,d,r,h,g,i,o,v=ce.ajaxSetup({},t),y=v.context||v,m=v.context&&(y.nodeType||y.jquery)?ce(y):ce.event,x=ce.Deferred(),b=ce.Callbacks("once memory"),w=v.statusCode||{},a={},s={},u="canceled",T={readyState:0,getResponseHeader:function(e){var t;if(h){if(!n){n={};while(t=Wt.exec(p))n[t[1].toLowerCase()+" "]=(n[t[1].toLowerCase()+" "]||[]).concat(t[2])}t=n[e.toLowerCase()+" "]}return null==t?null:t.join(", ")},getAllResponseHeaders:function(){return h?p:null},setRequestHeader:function(e,t){return null==h&&(e=s[e.toLowerCase()]=s[e.toLowerCase()]||e,a[e]=t),this},overrideMimeType:function(e){return null==h&&(v.mimeType=e),this},statusCode:function(e){var t;if(e)if(h)T.always(e[T.status]);else for(t in e)w[t]=[w[t],e[t]];return this},abort:function(e){var t=e||u;return c&&c.abort(t),l(0,t),this}};if(x.promise(T),v.url=((e||v.url||Et.href)+"").replace($t,Et.protocol+"//"),v.type=t.method||t.type||v.method||v.type,v.dataTypes=(v.dataType||"*").toLowerCase().match(D)||[""],null==v.crossDomain){r=C.createElement("a");try{r.href=v.url,r.href=r.href,v.crossDomain=Xt.protocol+"//"+Xt.host!=r.protocol+"//"+r.host}catch(e){v.crossDomain=!0}}if(v.data&&v.processData&&"string"!=typeof v.data&&(v.data=ce.param(v.data,v.traditional)),Vt(Bt,v,t,T),h)return T;for(i in(g=ce.event&&v.global)&&0==ce.active++&&ce.event.trigger("ajaxStart"),v.type=v.type.toUpperCase(),v.hasContent=!Ft.test(v.type),f=v.url.replace(Rt,""),v.hasContent?v.data&&v.processData&&0===(v.contentType||"").indexOf("application/x-www-form-urlencoded")&&(v.data=v.data.replace(Mt,"+")):(o=v.url.slice(f.length),v.data&&(v.processData||"string"==typeof v.data)&&(f+=(At.test(f)?"&":"?")+v.data,delete v.data),!1===v.cache&&(f=f.replace(It,"$1"),o=(At.test(f)?"&":"?")+"_="+jt.guid+++o),v.url=f+o),v.ifModified&&(ce.lastModified[f]&&T.setRequestHeader("If-Modified-Since",ce.lastModified[f]),ce.etag[f]&&T.setRequestHeader("If-None-Match",ce.etag[f])),(v.data&&v.hasContent&&!1!==v.contentType||t.contentType)&&T.setRequestHeader("Content-Type",v.contentType),T.setRequestHeader("Accept",v.dataTypes[0]&&v.accepts[v.dataTypes[0]]?v.accepts[v.dataTypes[0]]+("*"!==v.dataTypes[0]?", "+zt+"; q=0.01":""):v.accepts["*"]),v.headers)T.setRequestHeader(i,v.headers[i]);if(v.beforeSend&&(!1===v.beforeSend.call(y,T,v)||h))return T.abort();if(u="abort",b.add(v.complete),T.done(v.success),T.fail(v.error),c=Vt(_t,v,t,T)){if(T.readyState=1,g&&m.trigger("ajaxSend",[T,v]),h)return T;v.async&&0<v.timeout&&(d=ie.setTimeout(function(){T.abort("timeout")},v.timeout));try{h=!1,c.send(a,l)}catch(e){if(h)throw e;l(-1,e)}}else l(-1,"No Transport");function l(e,t,n,r){var i,o,a,s,u,l=t;h||(h=!0,d&&ie.clearTimeout(d),c=void 0,p=r||"",T.readyState=0<e?4:0,i=200<=e&&e<300||304===e,n&&(s=function(e,t,n){var r,i,o,a,s=e.contents,u=e.dataTypes;while("*"===u[0])u.shift(),void 0===r&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in s)if(s[i]&&s[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}a||(a=i)}o=o||a}if(o)return o!==u[0]&&u.unshift(o),n[o]}(v,T,n)),!i&&-1<ce.inArray("script",v.dataTypes)&&ce.inArray("json",v.dataTypes)<0&&(v.converters["text script"]=function(){}),s=function(e,t,n,r){var i,o,a,s,u,l={},c=e.dataTypes.slice();if(c[1])for(a in e.converters)l[a.toLowerCase()]=e.converters[a];o=c.shift();while(o)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=c.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(!(a=l[u+" "+o]||l["* "+o]))for(i in l)if((s=i.split(" "))[1]===o&&(a=l[u+" "+s[0]]||l["* "+s[0]])){!0===a?a=l[i]:!0!==l[i]&&(o=s[0],c.unshift(s[1]));break}if(!0!==a)if(a&&e["throws"])t=a(t);else try{t=a(t)}catch(e){return{state:"parsererror",error:a?e:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}(v,s,T,i),i?(v.ifModified&&((u=T.getResponseHeader("Last-Modified"))&&(ce.lastModified[f]=u),(u=T.getResponseHeader("etag"))&&(ce.etag[f]=u)),204===e||"HEAD"===v.type?l="nocontent":304===e?l="notmodified":(l=s.state,o=s.data,i=!(a=s.error))):(a=l,!e&&l||(l="error",e<0&&(e=0))),T.status=e,T.statusText=(t||l)+"",i?x.resolveWith(y,[o,l,T]):x.rejectWith(y,[T,l,a]),T.statusCode(w),w=void 0,g&&m.trigger(i?"ajaxSuccess":"ajaxError",[T,v,i?o:a]),b.fireWith(y,[T,l]),g&&(m.trigger("ajaxComplete",[T,v]),--ce.active||ce.event.trigger("ajaxStop")))}return T},getJSON:function(e,t,n){return ce.get(e,t,n,"json")},getScript:function(e,t){return ce.get(e,void 0,t,"script")}}),ce.each(["get","post"],function(e,i){ce[i]=function(e,t,n,r){return v(t)&&(r=r||n,n=t,t=void 0),ce.ajax(ce.extend({url:e,type:i,dataType:r,data:t,success:n},ce.isPlainObject(e)&&e))}}),ce.ajaxPrefilter(function(e){var t;for(t in e.headers)"content-type"===t.toLowerCase()&&(e.contentType=e.headers[t]||"")}),ce._evalUrl=function(e,t,n){return ce.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,converters:{"text script":function(){}},dataFilter:function(e){ce.globalEval(e,t,n)}})},ce.fn.extend({wrapAll:function(e){var t;return this[0]&&(v(e)&&(e=e.call(this[0])),t=ce(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstElementChild)e=e.firstElementChild;return e}).append(this)),this},wrapInner:function(n){return v(n)?this.each(function(e){ce(this).wrapInner(n.call(this,e))}):this.each(function(){var e=ce(this),t=e.contents();t.length?t.wrapAll(n):e.append(n)})},wrap:function(t){var n=v(t);return this.each(function(e){ce(this).wrapAll(n?t.call(this,e):t)})},unwrap:function(e){return this.parent(e).not("body").each(function(){ce(this).replaceWith(this.childNodes)}),this}}),ce.expr.pseudos.hidden=function(e){return!ce.expr.pseudos.visible(e)},ce.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)},ce.ajaxSettings.xhr=function(){try{return new ie.XMLHttpRequest}catch(e){}};var Yt={0:200,1223:204},Qt=ce.ajaxSettings.xhr();le.cors=!!Qt&&"withCredentials"in Qt,le.ajax=Qt=!!Qt,ce.ajaxTransport(function(i){var o,a;if(le.cors||Qt&&!i.crossDomain)return{send:function(e,t){var n,r=i.xhr();if(r.open(i.type,i.url,i.async,i.username,i.password),i.xhrFields)for(n in i.xhrFields)r[n]=i.xhrFields[n];for(n in i.mimeType&&r.overrideMimeType&&r.overrideMimeType(i.mimeType),i.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest"),e)r.setRequestHeader(n,e[n]);o=function(e){return function(){o&&(o=a=r.onload=r.onerror=r.onabort=r.ontimeout=r.onreadystatechange=null,"abort"===e?r.abort():"error"===e?"number"!=typeof r.status?t(0,"error"):t(r.status,r.statusText):t(Yt[r.status]||r.status,r.statusText,"text"!==(r.responseType||"text")||"string"!=typeof r.responseText?{binary:r.response}:{text:r.responseText},r.getAllResponseHeaders()))}},r.onload=o(),a=r.onerror=r.ontimeout=o("error"),void 0!==r.onabort?r.onabort=a:r.onreadystatechange=function(){4===r.readyState&&ie.setTimeout(function(){o&&a()})},o=o("abort");try{r.send(i.hasContent&&i.data||null)}catch(e){if(o)throw e}},abort:function(){o&&o()}}}),ce.ajaxPrefilter(function(e){e.crossDomain&&(e.contents.script=!1)}),ce.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return ce.globalEval(e),e}}}),ce.ajaxPrefilter("script",function(e){void 0===e.cache&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),ce.ajaxTransport("script",function(n){var r,i;if(n.crossDomain||n.scriptAttrs)return{send:function(e,t){r=ce("<script>").attr(n.scriptAttrs||{}).prop({charset:n.scriptCharset,src:n.url}).on("load error",i=function(e){r.remove(),i=null,e&&t("error"===e.type?404:200,e.type)}),C.head.appendChild(r[0])},abort:function(){i&&i()}}});var Jt,Kt=[],Zt=/(=)\?(?=&|$)|\?\?/;ce.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Kt.pop()||ce.expando+"_"+jt.guid++;return this[e]=!0,e}}),ce.ajaxPrefilter("json jsonp",function(e,t,n){var r,i,o,a=!1!==e.jsonp&&(Zt.test(e.url)?"url":"string"==typeof e.data&&0===(e.contentType||"").indexOf("application/x-www-form-urlencoded")&&Zt.test(e.data)&&"data");if(a||"jsonp"===e.dataTypes[0])return r=e.jsonpCallback=v(e.jsonpCallback)?e.jsonpCallback():e.jsonpCallback,a?e[a]=e[a].replace(Zt,"$1"+r):!1!==e.jsonp&&(e.url+=(At.test(e.url)?"&":"?")+e.jsonp+"="+r),e.converters["script json"]=function(){return o||ce.error(r+" was not called"),o[0]},e.dataTypes[0]="json",i=ie[r],ie[r]=function(){o=arguments},n.always(function(){void 0===i?ce(ie).removeProp(r):ie[r]=i,e[r]&&(e.jsonpCallback=t.jsonpCallback,Kt.push(r)),o&&v(i)&&i(o[0]),o=i=void 0}),"script"}),le.createHTMLDocument=((Jt=C.implementation.createHTMLDocument("").body).innerHTML="<form></form><form></form>",2===Jt.childNodes.length),ce.parseHTML=function(e,t,n){return"string"!=typeof e?[]:("boolean"==typeof t&&(n=t,t=!1),t||(le.createHTMLDocument?((r=(t=C.implementation.createHTMLDocument("")).createElement("base")).href=C.location.href,t.head.appendChild(r)):t=C),o=!n&&[],(i=w.exec(e))?[t.createElement(i[1])]:(i=Ae([e],t,o),o&&o.length&&ce(o).remove(),ce.merge([],i.childNodes)));var r,i,o},ce.fn.load=function(e,t,n){var r,i,o,a=this,s=e.indexOf(" ");return-1<s&&(r=Tt(e.slice(s)),e=e.slice(0,s)),v(t)?(n=t,t=void 0):t&&"object"==typeof t&&(i="POST"),0<a.length&&ce.ajax({url:e,type:i||"GET",dataType:"html",data:t}).done(function(e){o=arguments,a.html(r?ce("<div>").append(ce.parseHTML(e)).find(r):e)}).always(n&&function(e,t){a.each(function(){n.apply(this,o||[e.responseText,t,e])})}),this},ce.expr.pseudos.animated=function(t){return ce.grep(ce.timers,function(e){return t===e.elem}).length},ce.offset={setOffset:function(e,t,n){var r,i,o,a,s,u,l=ce.css(e,"position"),c=ce(e),f={};"static"===l&&(e.style.position="relative"),s=c.offset(),o=ce.css(e,"top"),u=ce.css(e,"left"),("absolute"===l||"fixed"===l)&&-1<(o+u).indexOf("auto")?(a=(r=c.position()).top,i=r.left):(a=parseFloat(o)||0,i=parseFloat(u)||0),v(t)&&(t=t.call(e,n,ce.extend({},s))),null!=t.top&&(f.top=t.top-s.top+a),null!=t.left&&(f.left=t.left-s.left+i),"using"in t?t.using.call(e,f):c.css(f)}},ce.fn.extend({offset:function(t){if(arguments.length)return void 0===t?this:this.each(function(e){ce.offset.setOffset(this,t,e)});var e,n,r=this[0];return r?r.getClientRects().length?(e=r.getBoundingClientRect(),n=r.ownerDocument.defaultView,{top:e.top+n.pageYOffset,left:e.left+n.pageXOffset}):{top:0,left:0}:void 0},position:function(){if(this[0]){var e,t,n,r=this[0],i={top:0,left:0};if("fixed"===ce.css(r,"position"))t=r.getBoundingClientRect();else{t=this.offset(),n=r.ownerDocument,e=r.offsetParent||n.documentElement;while(e&&(e===n.body||e===n.documentElement)&&"static"===ce.css(e,"position"))e=e.parentNode;e&&e!==r&&1===e.nodeType&&((i=ce(e).offset()).top+=ce.css(e,"borderTopWidth",!0),i.left+=ce.css(e,"borderLeftWidth",!0))}return{top:t.top-i.top-ce.css(r,"marginTop",!0),left:t.left-i.left-ce.css(r,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent;while(e&&"static"===ce.css(e,"position"))e=e.offsetParent;return e||J})}}),ce.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(t,i){var o="pageYOffset"===i;ce.fn[t]=function(e){return M(this,function(e,t,n){var r;if(y(e)?r=e:9===e.nodeType&&(r=e.defaultView),void 0===n)return r?r[i]:e[t];r?r.scrollTo(o?r.pageXOffset:n,o?n:r.pageYOffset):e[t]=n},t,e,arguments.length)}}),ce.each(["top","left"],function(e,n){ce.cssHooks[n]=Ye(le.pixelPosition,function(e,t){if(t)return t=Ge(e,n),_e.test(t)?ce(e).position()[n]+"px":t})}),ce.each({Height:"height",Width:"width"},function(a,s){ce.each({padding:"inner"+a,content:s,"":"outer"+a},function(r,o){ce.fn[o]=function(e,t){var n=arguments.length&&(r||"boolean"!=typeof e),i=r||(!0===e||!0===t?"margin":"border");return M(this,function(e,t,n){var r;return y(e)?0===o.indexOf("outer")?e["inner"+a]:e.document.documentElement["client"+a]:9===e.nodeType?(r=e.documentElement,Math.max(e.body["scroll"+a],r["scroll"+a],e.body["offset"+a],r["offset"+a],r["client"+a])):void 0===n?ce.css(e,t,i):ce.style(e,t,n,i)},s,n?e:void 0,n)}})}),ce.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){ce.fn[t]=function(e){return this.on(t,e)}}),ce.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)},hover:function(e,t){return this.on("mouseenter",e).on("mouseleave",t||e)}}),ce.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(e,n){ce.fn[n]=function(e,t){return 0<arguments.length?this.on(n,null,e,t):this.trigger(n)}});var en=/^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;ce.proxy=function(e,t){var n,r,i;if("string"==typeof t&&(n=e[t],t=e,e=n),v(e))return r=ae.call(arguments,2),(i=function(){return e.apply(t||this,r.concat(ae.call(arguments)))}).guid=e.guid=e.guid||ce.guid++,i},ce.holdReady=function(e){e?ce.readyWait++:ce.ready(!0)},ce.isArray=Array.isArray,ce.parseJSON=JSON.parse,ce.nodeName=fe,ce.isFunction=v,ce.isWindow=y,ce.camelCase=F,ce.type=x,ce.now=Date.now,ce.isNumeric=function(e){var t=ce.type(e);return("number"===t||"string"===t)&&!isNaN(e-parseFloat(e))},ce.trim=function(e){return null==e?"":(e+"").replace(en,"$1")},"function"==typeof define&&define.amd&&define("jquery",[],function(){return ce});var tn=ie.jQuery,nn=ie.$;return ce.noConflict=function(e){return ie.$===ce&&(ie.$=nn),e&&ie.jQuery===ce&&(ie.jQuery=tn),ce},"undefined"==typeof e&&(ie.jQuery=ie.$=ce),ce});
(() => {
    var t = {
            924: (t, e, r) => {
                "use strict";
                function n() {}
                r.d(e, { H: () => Of }),
                    (n.prototype = {
                        on: function (t, e, r) {
                            var n = this.e || (this.e = {});
                            return (n[t] || (n[t] = [])).push({ fn: e, ctx: r }), this;
                        },
                        once: function (t, e, r) {
                            var n = this;
                            function i() {
                                n.off(t, i), e.apply(r, arguments);
                            }
                            return (i._ = e), this.on(t, i, r);
                        },
                        emit: function (t) {
                            for (var e = [].slice.call(arguments, 1), r = ((this.e || (this.e = {}))[t] || []).slice(), n = 0, i = r.length; n < i; n++) r[n].fn.apply(r[n].ctx, e);
                            return this;
                        },
                        off: function (t, e) {
                            var r = this.e || (this.e = {}),
                                n = r[t],
                                i = [];
                            if (n && e) for (var o = 0, s = n.length; o < s; o++) n[o].fn !== e && n[o].fn._ !== e && i.push(n[o]);
                            return i.length ? (r[t] = i) : delete r[t], this;
                        },
                    });
                var i = n;
                i.TinyEmitter = n;
                var o = function (t) {
                    (this.wrap = document.querySelector("[data-router-wrapper]")), (this.properties = t), (this.Transition = t.transition ? new t.transition.class(this.wrap, t.transition.name) : null);
                };
                (o.prototype.setup = function () {
                    this.onEnter && this.onEnter(), this.onEnterCompleted && this.onEnterCompleted();
                }),
                    (o.prototype.add = function () {
                        this.wrap.insertAdjacentHTML("beforeend", this.properties.view.outerHTML);
                    }),
                    (o.prototype.update = function () {
                        document.title = this.properties.page.title;
                    }),
                    (o.prototype.show = function (t) {
                        var e = this;
                        return new Promise(function (r) {
                            try {
                                function n(t) {
                                    e.onEnterCompleted && e.onEnterCompleted(), r();
                                }
                                return e.update(), e.onEnter && e.onEnter(), Promise.resolve(e.Transition ? Promise.resolve(e.Transition.show(t)).then(n) : n());
                            } catch (t) {
                                return Promise.reject(t);
                            }
                        });
                    }),
                    (o.prototype.hide = function (t) {
                        var e = this;
                        return new Promise(function (r) {
                            try {
                                function n(t) {
                                    e.onLeaveCompleted && e.onLeaveCompleted(), r();
                                }
                                return e.onLeave && e.onLeave(), Promise.resolve(e.Transition ? Promise.resolve(e.Transition.hide(t)).then(n) : n());
                            } catch (t) {
                                return Promise.reject(t);
                            }
                        });
                    });
                var s = new window.DOMParser(),
                    a = function (t, e) {
                        (this.renderers = t), (this.transitions = e);
                    };
                (a.prototype.getOrigin = function (t) {
                    var e = t.match(/(https?:\/\/[\w\-.]+)/);
                    return e ? e[1].replace(/https?:\/\//, "") : null;
                }),
                    (a.prototype.getPathname = function (t) {
                        var e = t.match(/https?:\/\/.*?(\/[\w_\-./]+)/);
                        return e ? e[1] : "/";
                    }),
                    (a.prototype.getAnchor = function (t) {
                        var e = t.match(/(#.*)$/);
                        return e ? e[1] : null;
                    }),
                    (a.prototype.getParams = function (t) {
                        var e = t.match(/\?([\w_\-.=&]+)/);
                        if (!e) return null;
                        for (var r = e[1].split("&"), n = {}, i = 0; i < r.length; i++) {
                            var o = r[i].split("=");
                            n[o[0]] = o[1];
                        }
                        return n;
                    }),
                    (a.prototype.getDOM = function (t) {
                        return "string" == typeof t ? s.parseFromString(t, "text/html") : t;
                    }),
                    (a.prototype.getView = function (t) {
                        return t.querySelector("[data-router-view]");
                    }),
                    (a.prototype.getSlug = function (t) {
                        return t.getAttribute("data-router-view");
                    }),
                    (a.prototype.getRenderer = function (t) {
                        if (!this.renderers) return Promise.resolve(o);
                        if (t in this.renderers) {
                            var e = this.renderers[t];
                            return "function" != typeof e || o.isPrototypeOf(e)
                                ? "function" == typeof e.then
                                    ? Promise.resolve(e).then(function (t) {
                                          return t.default;
                                      })
                                    : Promise.resolve(e)
                                : Promise.resolve(e()).then(function (t) {
                                      return t.default;
                                  });
                        }
                        return Promise.resolve(o);
                    }),
                    (a.prototype.getTransition = function (t) {
                        return this.transitions ? (t in this.transitions ? { class: this.transitions[t], name: t } : "default" in this.transitions ? { class: this.transitions.default, name: "default" } : null) : null;
                    }),
                    (a.prototype.getProperties = function (t) {
                        var e = this.getDOM(t),
                            r = this.getView(e),
                            n = this.getSlug(r);
                        return { page: e, view: r, slug: n, renderer: this.getRenderer(n, this.renderers), transition: this.getTransition(n, this.transitions) };
                    }),
                    (a.prototype.getLocation = function (t) {
                        return { href: t, anchor: this.getAnchor(t), origin: this.getOrigin(t), params: this.getParams(t), pathname: this.getPathname(t) };
                    });
                var u = (function (t) {
                        function e(e) {
                            var r = this;
                            void 0 === e && (e = {});
                            var n = e.renderers,
                                i = e.transitions;
                            t.call(this),
                                (this.Helpers = new a(n, i)),
                                (this.Transitions = i),
                                (this.Contextual = !1),
                                (this.location = this.Helpers.getLocation(window.location.href)),
                                (this.properties = this.Helpers.getProperties(document.cloneNode(!0))),
                                (this.popping = !1),
                                (this.running = !1),
                                (this.trigger = null),
                                (this.cache = new Map()),
                                this.cache.set(this.location.href, this.properties),
                                this.properties.renderer.then(function (t) {
                                    (r.From = new t(r.properties)), r.From.setup();
                                }),
                                (this._navigate = this.navigate.bind(this)),
                                window.addEventListener("popstate", this.popState.bind(this)),
                                (this.links = document.querySelectorAll("a:not([target]):not([data-router-disabled])")),
                                this.attach(this.links);
                        }
                        return (
                            t && (e.__proto__ = t),
                            ((e.prototype = Object.create(t && t.prototype)).constructor = e),
                            (e.prototype.attach = function (t) {
                                for (var e = 0, r = t; e < r.length; e += 1) r[e].addEventListener("click", this._navigate);
                            }),
                            (e.prototype.detach = function (t) {
                                for (var e = 0, r = t; e < r.length; e += 1) r[e].removeEventListener("click", this._navigate);
                            }),
                            (e.prototype.navigate = function (t) {
                                if (!t.metaKey && !t.ctrlKey) {
                                    t.preventDefault();
                                    var e = !!t.currentTarget.hasAttribute("data-transition") && t.currentTarget.dataset.transition;
                                    this.redirect(t.currentTarget.href, e, t.currentTarget);
                                }
                            }),
                            (e.prototype.redirect = function (t, e, r) {
                                if ((void 0 === e && (e = !1), void 0 === r && (r = "script"), (this.trigger = r), !this.running && t !== this.location.href)) {
                                    var n = this.Helpers.getLocation(t);
                                    (this.Contextual = !1),
                                        e && ((this.Contextual = this.Transitions.contextual[e].prototype), (this.Contextual.name = e)),
                                        n.origin !== this.location.origin || (n.anchor && n.pathname === this.location.pathname) ? (window.location.href = t) : ((this.location = n), this.beforeFetch());
                                }
                            }),
                            (e.prototype.popState = function () {
                                (this.trigger = "popstate"), (this.Contextual = !1);
                                var t = this.Helpers.getLocation(window.location.href);
                                this.location.pathname !== t.pathname || (!this.location.anchor && !t.anchor) ? ((this.popping = !0), (this.location = t), this.beforeFetch()) : (this.location = t);
                            }),
                            (e.prototype.pushState = function () {
                                this.popping || window.history.pushState(this.location, "", this.location.href);
                            }),
                            (e.prototype.fetch = function () {
                                try {
                                    var t = this;
                                    return Promise.resolve(fetch(t.location.href, { mode: "same-origin", method: "GET", headers: { "X-Requested-With": "Highway" }, credentials: "same-origin" })).then(function (e) {
                                        if (e.status >= 200 && e.status < 300) return e.text();
                                        window.location.href = t.location.href;
                                    });
                                } catch (t) {
                                    return Promise.reject(t);
                                }
                            }),
                            (e.prototype.beforeFetch = function () {
                                try {
                                    var t = this;
                                    function n() {
                                        t.afterFetch();
                                    }
                                    t.pushState(), (t.running = !0), t.emit("NAVIGATE_OUT", { from: { page: t.From.properties.page, view: t.From.properties.view }, trigger: t.trigger, location: t.location });
                                    var e = { trigger: t.trigger, contextual: t.Contextual },
                                        r = t.cache.has(t.location.href)
                                            ? Promise.resolve(t.From.hide(e)).then(function () {
                                                  t.properties = t.cache.get(t.location.href);
                                              })
                                            : Promise.resolve(Promise.all([t.fetch(), t.From.hide(e)])).then(function (e) {
                                                  (t.properties = t.Helpers.getProperties(e[0])), t.cache.set(t.location.href, t.properties);
                                              });
                                    return Promise.resolve(r && r.then ? r.then(n) : n());
                                } catch (t) {
                                    return Promise.reject(t);
                                }
                            }),
                            (e.prototype.afterFetch = function () {
                                try {
                                    var t = this;
                                    return Promise.resolve(t.properties.renderer).then(function (e) {
                                        return (
                                            (t.To = new e(t.properties)),
                                            t.To.add(),
                                            t.emit("NAVIGATE_IN", { to: { page: t.To.properties.page, view: t.To.wrap.lastElementChild }, trigger: t.trigger, location: t.location }),
                                            Promise.resolve(t.To.show({ trigger: t.trigger, contextual: t.Contextual })).then(function () {
                                                (t.popping = !1),
                                                    (t.running = !1),
                                                    t.detach(t.links),
                                                    (t.links = document.querySelectorAll("a:not([target]):not([data-router-disabled])")),
                                                    t.attach(t.links),
                                                    t.emit("NAVIGATE_END", {
                                                        to: { page: t.To.properties.page, view: t.To.wrap.lastElementChild },
                                                        from: { page: t.From.properties.page, view: t.From.properties.view },
                                                        trigger: t.trigger,
                                                        location: t.location,
                                                    }),
                                                    (t.From = t.To),
                                                    (t.trigger = null);
                                            })
                                        );
                                    });
                                } catch (t) {
                                    return Promise.reject(t);
                                }
                            }),
                            e
                        );
                    })(i),
                    l = function (t, e) {
                        (this.wrap = t), (this.name = e);
                    };
                (l.prototype.show = function (t) {
                    var e = this,
                        r = t.trigger,
                        n = t.contextual,
                        i = this.wrap.lastElementChild,
                        o = this.wrap.firstElementChild;
                    return new Promise(function (t) {
                        n
                            ? (i.setAttribute("data-transition-in", n.name), i.removeAttribute("data-transition-out", n.name), n.in && n.in({ to: i, from: o, trigger: r, done: t }))
                            : (i.setAttribute("data-transition-in", e.name), i.removeAttribute("data-transition-out", e.name), e.in && e.in({ to: i, from: o, trigger: r, done: t }));
                    });
                }),
                    (l.prototype.hide = function (t) {
                        var e = this,
                            r = t.trigger,
                            n = t.contextual,
                            i = this.wrap.firstElementChild;
                        return new Promise(function (t) {
                            n
                                ? (i.setAttribute("data-transition-out", n.name), i.removeAttribute("data-transition-in", n.name), n.out && n.out({ from: i, trigger: r, done: t }))
                                : (i.setAttribute("data-transition-out", e.name), i.removeAttribute("data-transition-in", e.name), e.out && e.out({ from: i, trigger: r, done: t }));
                        });
                    });
                const h = { Core: u, Helpers: a, Renderer: o, Transition: l };
                function c(t) {
                    if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                    return t;
                }
                function f(t, e) {
                    (t.prototype = Object.create(e.prototype)), (t.prototype.constructor = t), (t.__proto__ = e);
                }
                var p,
                    d,
                    g,
                    m,
                    y,
                    v,
                    D,
                    _,
                    b,
                    x = { autoSleep: 120, force3D: "auto", nullTargetWarn: 1, units: { lineHeight: "" } },
                    w = { duration: 0.5, overwrite: !1, delay: 0 },
                    E = 1e8,
                    C = 1e-8,
                    F = 2 * Math.PI,
                    T = F / 4,
                    A = 0,
                    M = Math.sqrt,
                    O = Math.cos,
                    S = Math.sin,
                    P = function (t) {
                        return "string" == typeof t;
                    },
                    k = function (t) {
                        return "function" == typeof t;
                    },
                    R = function (t) {
                        return "number" == typeof t;
                    },
                    B = function (t) {
                        return void 0 === t;
                    },
                    L = function (t) {
                        return "object" == typeof t;
                    },
                    j = function (t) {
                        return !1 !== t;
                    },
                    N = function () {
                        return "undefined" != typeof window;
                    },
                    z = function (t) {
                        return k(t) || P(t);
                    },
                    I = ("function" == typeof ArrayBuffer && ArrayBuffer.isView) || function () {},
                    U = Array.isArray,
                    Y = /(?:-?\.?\d|\.)+/gi,
                    X = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,
                    q = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
                    V = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,
                    G = /[+-]=-?[.\d]+/,
                    W = /[^,'"\[\]\s]+/gi,
                    H = /[\d.+\-=]+(?:e[-+]\d*)*/i,
                    $ = {},
                    Z = {},
                    K = function (t) {
                        return (Z = wt(t, $)) && hr;
                    },
                    Q = function (t, e) {
                        return console.warn("Invalid property", t, "set to", e, "Missing plugin? gsap.registerPlugin()");
                    },
                    J = function (t, e) {
                        return !e && console.warn(t);
                    },
                    tt = function (t, e) {
                        return (t && ($[t] = e) && Z && (Z[t] = e)) || $;
                    },
                    et = function () {
                        return 0;
                    },
                    rt = {},
                    nt = [],
                    it = {},
                    ot = {},
                    st = {},
                    at = 30,
                    ut = [],
                    lt = "",
                    ht = function (t) {
                        var e,
                            r,
                            n = t[0];
                        if ((L(n) || k(n) || (t = [t]))) {
                            for (r = ut.length; r-- && !ut[r].targetTest(n); );
                            e = ut[r];
                        }
                        for (r = t.length; r--; ) (t[r] && (t[r]._gsap || (t[r]._gsap = new Be(t[r], e)))) || t.splice(r, 1);
                        return t;
                    },
                    ct = function (t) {
                        return t._gsap || ht(te(t))[0]._gsap;
                    },
                    ft = function (t, e, r) {
                        return (r = t[e]) && k(r) ? t[e]() : (B(r) && t.getAttribute && t.getAttribute(e)) || r;
                    },
                    pt = function (t, e) {
                        return (t = t.split(",")).forEach(e) || t;
                    },
                    dt = function (t) {
                        return Math.round(1e5 * t) / 1e5 || 0;
                    },
                    gt = function (t) {
                        return Math.round(1e7 * t) / 1e7 || 0;
                    },
                    mt = function (t, e) {
                        for (var r = e.length, n = 0; t.indexOf(e[n]) < 0 && ++n < r; );
                        return n < r;
                    },
                    yt = function () {
                        var t,
                            e,
                            r = nt.length,
                            n = nt.slice(0);
                        for (it = {}, nt.length = 0, t = 0; t < r; t++) (e = n[t]) && e._lazy && (e.render(e._lazy[0], e._lazy[1], !0)._lazy = 0);
                    },
                    vt = function (t, e, r, n) {
                        nt.length && yt(), t.render(e, r, n), nt.length && yt();
                    },
                    Dt = function (t) {
                        var e = parseFloat(t);
                        return (e || 0 === e) && (t + "").match(W).length < 2 ? e : P(t) ? t.trim() : t;
                    },
                    _t = function (t) {
                        return t;
                    },
                    bt = function (t, e) {
                        for (var r in e) r in t || (t[r] = e[r]);
                        return t;
                    },
                    xt = function (t, e) {
                        for (var r in e) r in t || "duration" === r || "ease" === r || (t[r] = e[r]);
                    },
                    wt = function (t, e) {
                        for (var r in e) t[r] = e[r];
                        return t;
                    },
                    Et = function t(e, r) {
                        for (var n in r) "__proto__" !== n && "constructor" !== n && "prototype" !== n && (e[n] = L(r[n]) ? t(e[n] || (e[n] = {}), r[n]) : r[n]);
                        return e;
                    },
                    Ct = function (t, e) {
                        var r,
                            n = {};
                        for (r in t) r in e || (n[r] = t[r]);
                        return n;
                    },
                    Ft = function (t) {
                        var e = t.parent || d,
                            r = t.keyframes ? xt : bt;
                        if (j(t.inherit)) for (; e; ) r(t, e.vars.defaults), (e = e.parent || e._dp);
                        return t;
                    },
                    Tt = function (t, e, r, n) {
                        void 0 === r && (r = "_first"), void 0 === n && (n = "_last");
                        var i = e._prev,
                            o = e._next;
                        i ? (i._next = o) : t[r] === e && (t[r] = o), o ? (o._prev = i) : t[n] === e && (t[n] = i), (e._next = e._prev = e.parent = null);
                    },
                    At = function (t, e) {
                        t.parent && (!e || t.parent.autoRemoveChildren) && t.parent.remove(t), (t._act = 0);
                    },
                    Mt = function (t, e) {
                        if (t && (!e || e._end > t._dur || e._start < 0)) for (var r = t; r; ) (r._dirty = 1), (r = r.parent);
                        return t;
                    },
                    Ot = function (t) {
                        for (var e = t.parent; e && e.parent; ) (e._dirty = 1), e.totalDuration(), (e = e.parent);
                        return t;
                    },
                    St = function t(e) {
                        return !e || (e._ts && t(e.parent));
                    },
                    Pt = function (t) {
                        return t._repeat ? kt(t._tTime, (t = t.duration() + t._rDelay)) * t : 0;
                    },
                    kt = function (t, e) {
                        var r = Math.floor((t /= e));
                        return t && r === t ? r - 1 : r;
                    },
                    Rt = function (t, e) {
                        return (t - e._start) * e._ts + (e._ts >= 0 ? 0 : e._dirty ? e.totalDuration() : e._tDur);
                    },
                    Bt = function (t) {
                        return (t._end = gt(t._start + (t._tDur / Math.abs(t._ts || t._rts || C) || 0)));
                    },
                    Lt = function (t, e) {
                        var r = t._dp;
                        return r && r.smoothChildTiming && t._ts && ((t._start = gt(r._time - (t._ts > 0 ? e / t._ts : ((t._dirty ? t.totalDuration() : t._tDur) - e) / -t._ts))), Bt(t), r._dirty || Mt(r, t)), t;
                    },
                    jt = function (t, e) {
                        var r;
                        if (((e._time || (e._initted && !e._dur)) && ((r = Rt(t.rawTime(), e)), (!e._dur || $t(0, e.totalDuration(), r) - e._tTime > C) && e.render(r, !0)), Mt(t, e)._dp && t._initted && t._time >= t._dur && t._ts)) {
                            if (t._dur < t.duration()) for (r = t; r._dp; ) r.rawTime() >= 0 && r.totalTime(r._tTime), (r = r._dp);
                            t._zTime = -1e-8;
                        }
                    },
                    Nt = function (t, e, r, n) {
                        return (
                            e.parent && At(e),
                            (e._start = gt((R(r) ? r : r || t !== d ? Gt(t, r, e) : t._time) + e._delay)),
                            (e._end = gt(e._start + (e.totalDuration() / Math.abs(e.timeScale()) || 0))),
                            (function (t, e, r, n, i) {
                                void 0 === r && (r = "_first"), void 0 === n && (n = "_last");
                                var o,
                                    s = t[n];
                                if (i) for (o = e[i]; s && s[i] > o; ) s = s._prev;
                                s ? ((e._next = s._next), (s._next = e)) : ((e._next = t[r]), (t[r] = e)), e._next ? (e._next._prev = e) : (t[n] = e), (e._prev = s), (e.parent = e._dp = t);
                            })(t, e, "_first", "_last", t._sort ? "_start" : 0),
                            Yt(e) || (t._recent = e),
                            n || jt(t, e),
                            t
                        );
                    },
                    zt = function (t, e) {
                        return ($.ScrollTrigger || Q("scrollTrigger", e)) && $.ScrollTrigger.create(e, t);
                    },
                    It = function (t, e, r, n) {
                        return Ye(t, e), t._initted ? (!r && t._pt && ((t._dur && !1 !== t.vars.lazy) || (!t._dur && t.vars.lazy)) && D !== xe.frame ? (nt.push(t), (t._lazy = [e, n]), 1) : void 0) : 1;
                    },
                    Ut = function t(e) {
                        var r = e.parent;
                        return r && r._ts && r._initted && !r._lock && (r.rawTime() < 0 || t(r));
                    },
                    Yt = function (t) {
                        var e = t.data;
                        return "isFromStart" === e || "isStart" === e;
                    },
                    Xt = function (t, e, r, n) {
                        var i = t._repeat,
                            o = gt(e) || 0,
                            s = t._tTime / t._tDur;
                        return s && !n && (t._time *= o / t._dur), (t._dur = o), (t._tDur = i ? (i < 0 ? 1e10 : gt(o * (i + 1) + t._rDelay * i)) : o), s && !n ? Lt(t, (t._tTime = t._tDur * s)) : t.parent && Bt(t), r || Mt(t.parent, t), t;
                    },
                    qt = function (t) {
                        return t instanceof je ? Mt(t) : Xt(t, t._dur);
                    },
                    Vt = { _start: 0, endTime: et, totalDuration: et },
                    Gt = function t(e, r, n) {
                        var i,
                            o,
                            s,
                            a = e.labels,
                            u = e._recent || Vt,
                            l = e.duration() >= E ? u.endTime(!1) : e._dur;
                        return P(r) && (isNaN(r) || r in a)
                            ? ((o = r.charAt(0)),
                              (s = "%" === r.substr(-1)),
                              (i = r.indexOf("=")),
                              "<" === o || ">" === o
                                  ? (i >= 0 && (r = r.replace(/=/, "")), ("<" === o ? u._start : u.endTime(u._repeat >= 0)) + (parseFloat(r.substr(1)) || 0) * (s ? (i < 0 ? u : n).totalDuration() / 100 : 1))
                                  : i < 0
                                  ? (r in a || (a[r] = l), a[r])
                                  : ((o = parseFloat(r.charAt(i - 1) + r.substr(i + 1))), s && n && (o = (o / 100) * (U(n) ? n[0] : n).totalDuration()), i > 1 ? t(e, r.substr(0, i - 1), n) + o : l + o))
                            : null == r
                            ? l
                            : +r;
                    },
                    Wt = function (t, e, r) {
                        var n,
                            i,
                            o = R(e[1]),
                            s = (o ? 2 : 1) + (t < 2 ? 0 : 1),
                            a = e[s];
                        if ((o && (a.duration = e[1]), (a.parent = r), t)) {
                            for (n = a, i = r; i && !("immediateRender" in n); ) (n = i.vars.defaults || {}), (i = j(i.vars.inherit) && i.parent);
                            (a.immediateRender = j(n.immediateRender)), t < 2 ? (a.runBackwards = 1) : (a.startAt = e[s - 1]);
                        }
                        return new Ge(e[0], a, e[s + 1]);
                    },
                    Ht = function (t, e) {
                        return t || 0 === t ? e(t) : e;
                    },
                    $t = function (t, e, r) {
                        return r < t ? t : r > e ? e : r;
                    },
                    Zt = function (t) {
                        if ("string" != typeof t) return "";
                        var e = H.exec(t);
                        return e ? t.substr(e.index + e[0].length) : "";
                    },
                    Kt = [].slice,
                    Qt = function (t, e) {
                        return t && L(t) && "length" in t && ((!e && !t.length) || (t.length - 1 in t && L(t[0]))) && !t.nodeType && t !== g;
                    },
                    Jt = function (t, e, r) {
                        return (
                            void 0 === r && (r = []),
                            t.forEach(function (t) {
                                var n;
                                return (P(t) && !e) || Qt(t, 1) ? (n = r).push.apply(n, te(t)) : r.push(t);
                            }) || r
                        );
                    },
                    te = function (t, e, r) {
                        return !P(t) || r || (!m && we()) ? (U(t) ? Jt(t, r) : Qt(t) ? Kt.call(t, 0) : t ? [t] : []) : Kt.call((e || y).querySelectorAll(t), 0);
                    },
                    ee = function (t) {
                        return t.sort(function () {
                            return 0.5 - Math.random();
                        });
                    },
                    re = function (t) {
                        if (k(t)) return t;
                        var e = L(t) ? t : { each: t },
                            r = Oe(e.ease),
                            n = e.from || 0,
                            i = parseFloat(e.base) || 0,
                            o = {},
                            s = n > 0 && n < 1,
                            a = isNaN(n) || s,
                            u = e.axis,
                            l = n,
                            h = n;
                        return (
                            P(n) ? (l = h = { center: 0.5, edges: 0.5, end: 1 }[n] || 0) : !s && a && ((l = n[0]), (h = n[1])),
                            function (t, s, c) {
                                var f,
                                    p,
                                    d,
                                    g,
                                    m,
                                    y,
                                    v,
                                    D,
                                    _,
                                    b = (c || e).length,
                                    x = o[b];
                                if (!x) {
                                    if (!(_ = "auto" === e.grid ? 0 : (e.grid || [1, E])[1])) {
                                        for (v = -E; v < (v = c[_++].getBoundingClientRect().left) && _ < b; );
                                        _--;
                                    }
                                    for (x = o[b] = [], f = a ? Math.min(_, b) * l - 0.5 : n % _, p = a ? (b * h) / _ - 0.5 : (n / _) | 0, v = 0, D = E, y = 0; y < b; y++)
                                        (d = (y % _) - f), (g = p - ((y / _) | 0)), (x[y] = m = u ? Math.abs("y" === u ? g : d) : M(d * d + g * g)), m > v && (v = m), m < D && (D = m);
                                    "random" === n && ee(x),
                                        (x.max = v - D),
                                        (x.min = D),
                                        (x.v = b = (parseFloat(e.amount) || parseFloat(e.each) * (_ > b ? b - 1 : u ? ("y" === u ? b / _ : _) : Math.max(_, b / _)) || 0) * ("edges" === n ? -1 : 1)),
                                        (x.b = b < 0 ? i - b : i),
                                        (x.u = Zt(e.amount || e.each) || 0),
                                        (r = r && b < 0 ? Ae(r) : r);
                                }
                                return (b = (x[t] - x.min) / x.max || 0), gt(x.b + (r ? r(b) : b) * x.v) + x.u;
                            }
                        );
                    },
                    ne = function (t) {
                        var e = Math.pow(10, ((t + "").split(".")[1] || "").length);
                        return function (r) {
                            var n = Math.round(parseFloat(r) / t) * t * e;
                            return (n - (n % 1)) / e + (R(r) ? 0 : Zt(r));
                        };
                    },
                    ie = function (t, e) {
                        var r,
                            n,
                            i = U(t);
                        return (
                            !i && L(t) && ((r = i = t.radius || E), t.values ? ((t = te(t.values)), (n = !R(t[0])) && (r *= r)) : (t = ne(t.increment))),
                            Ht(
                                e,
                                i
                                    ? k(t)
                                        ? function (e) {
                                              return (n = t(e)), Math.abs(n - e) <= r ? n : e;
                                          }
                                        : function (e) {
                                              for (var i, o, s = parseFloat(n ? e.x : e), a = parseFloat(n ? e.y : 0), u = E, l = 0, h = t.length; h--; )
                                                  (i = n ? (i = t[h].x - s) * i + (o = t[h].y - a) * o : Math.abs(t[h] - s)) < u && ((u = i), (l = h));
                                              return (l = !r || u <= r ? t[l] : e), n || l === e || R(e) ? l : l + Zt(e);
                                          }
                                    : ne(t)
                            )
                        );
                    },
                    oe = function (t, e, r, n) {
                        return Ht(U(t) ? !e : !0 === r ? !!(r = 0) : !n, function () {
                            return U(t) ? t[~~(Math.random() * t.length)] : (r = r || 1e-5) && (n = r < 1 ? Math.pow(10, (r + "").length - 2) : 1) && Math.floor(Math.round((t - r / 2 + Math.random() * (e - t + 0.99 * r)) / r) * r * n) / n;
                        });
                    },
                    se = function (t, e, r) {
                        return Ht(r, function (r) {
                            return t[~~e(r)];
                        });
                    },
                    ae = function (t) {
                        for (var e, r, n, i, o = 0, s = ""; ~(e = t.indexOf("random(", o)); )
                            (n = t.indexOf(")", e)), (i = "[" === t.charAt(e + 7)), (r = t.substr(e + 7, n - e - 7).match(i ? W : Y)), (s += t.substr(o, e - o) + oe(i ? r : +r[0], i ? 0 : +r[1], +r[2] || 1e-5)), (o = n + 1);
                        return s + t.substr(o, t.length - o);
                    },
                    ue = function (t, e, r, n, i) {
                        var o = e - t,
                            s = n - r;
                        return Ht(i, function (e) {
                            return r + (((e - t) / o) * s || 0);
                        });
                    },
                    le = function (t, e, r) {
                        var n,
                            i,
                            o,
                            s = t.labels,
                            a = E;
                        for (n in s) (i = s[n] - e) < 0 == !!r && i && a > (i = Math.abs(i)) && ((o = n), (a = i));
                        return o;
                    },
                    he = function (t, e, r) {
                        var n,
                            i,
                            o = t.vars,
                            s = o[e];
                        if (s) return (n = o[e + "Params"]), (i = o.callbackScope || t), r && nt.length && yt(), n ? s.apply(i, n) : s.call(i);
                    },
                    ce = function (t) {
                        return At(t), t.scrollTrigger && t.scrollTrigger.kill(!1), t.progress() < 1 && he(t, "onInterrupt"), t;
                    },
                    fe = function (t) {
                        var e = (t = (!t.name && t.default) || t).name,
                            r = k(t),
                            n =
                                e && !r && t.init
                                    ? function () {
                                          this._props = [];
                                      }
                                    : t,
                            i = { init: et, render: er, add: Ie, kill: nr, modifier: rr, rawVars: 0 },
                            o = { targetTest: 0, get: 0, getSetter: Ke, aliases: {}, register: 0 };
                        if ((we(), t !== n)) {
                            if (ot[e]) return;
                            bt(n, bt(Ct(t, i), o)), wt(n.prototype, wt(i, Ct(t, o))), (ot[(n.prop = e)] = n), t.targetTest && (ut.push(n), (rt[e] = 1)), (e = ("css" === e ? "CSS" : e.charAt(0).toUpperCase() + e.substr(1)) + "Plugin");
                        }
                        tt(e, n), t.register && t.register(hr, n, sr);
                    },
                    pe = 255,
                    de = {
                        aqua: [0, pe, pe],
                        lime: [0, pe, 0],
                        silver: [192, 192, 192],
                        black: [0, 0, 0],
                        maroon: [128, 0, 0],
                        teal: [0, 128, 128],
                        blue: [0, 0, pe],
                        navy: [0, 0, 128],
                        white: [pe, pe, pe],
                        olive: [128, 128, 0],
                        yellow: [pe, pe, 0],
                        orange: [pe, 165, 0],
                        gray: [128, 128, 128],
                        purple: [128, 0, 128],
                        green: [0, 128, 0],
                        red: [pe, 0, 0],
                        pink: [pe, 192, 203],
                        cyan: [0, pe, pe],
                        transparent: [pe, pe, pe, 0],
                    },
                    ge = function (t, e, r) {
                        return ((6 * (t = t < 0 ? t + 1 : t > 1 ? t - 1 : t) < 1 ? e + (r - e) * t * 6 : t < 0.5 ? r : 3 * t < 2 ? e + (r - e) * (2 / 3 - t) * 6 : e) * pe + 0.5) | 0;
                    },
                    me = function (t, e, r) {
                        var n,
                            i,
                            o,
                            s,
                            a,
                            u,
                            l,
                            h,
                            c,
                            f,
                            p = t ? (R(t) ? [t >> 16, (t >> 8) & pe, t & pe] : 0) : de.black;
                        if (!p) {
                            if (("," === t.substr(-1) && (t = t.substr(0, t.length - 1)), de[t])) p = de[t];
                            else if ("#" === t.charAt(0)) {
                                if ((t.length < 6 && ((n = t.charAt(1)), (i = t.charAt(2)), (o = t.charAt(3)), (t = "#" + n + n + i + i + o + o + (5 === t.length ? t.charAt(4) + t.charAt(4) : ""))), 9 === t.length))
                                    return [(p = parseInt(t.substr(1, 6), 16)) >> 16, (p >> 8) & pe, p & pe, parseInt(t.substr(7), 16) / 255];
                                p = [(t = parseInt(t.substr(1), 16)) >> 16, (t >> 8) & pe, t & pe];
                            } else if ("hsl" === t.substr(0, 3))
                                if (((p = f = t.match(Y)), e)) {
                                    if (~t.indexOf("=")) return (p = t.match(X)), r && p.length < 4 && (p[3] = 1), p;
                                } else
                                    (s = (+p[0] % 360) / 360),
                                        (a = +p[1] / 100),
                                        (n = 2 * (u = +p[2] / 100) - (i = u <= 0.5 ? u * (a + 1) : u + a - u * a)),
                                        p.length > 3 && (p[3] *= 1),
                                        (p[0] = ge(s + 1 / 3, n, i)),
                                        (p[1] = ge(s, n, i)),
                                        (p[2] = ge(s - 1 / 3, n, i));
                            else p = t.match(Y) || de.transparent;
                            p = p.map(Number);
                        }
                        return (
                            e &&
                                !f &&
                                ((n = p[0] / pe),
                                (i = p[1] / pe),
                                (o = p[2] / pe),
                                (u = ((l = Math.max(n, i, o)) + (h = Math.min(n, i, o))) / 2),
                                l === h ? (s = a = 0) : ((c = l - h), (a = u > 0.5 ? c / (2 - l - h) : c / (l + h)), (s = l === n ? (i - o) / c + (i < o ? 6 : 0) : l === i ? (o - n) / c + 2 : (n - i) / c + 4), (s *= 60)),
                                (p[0] = ~~(s + 0.5)),
                                (p[1] = ~~(100 * a + 0.5)),
                                (p[2] = ~~(100 * u + 0.5))),
                            r && p.length < 4 && (p[3] = 1),
                            p
                        );
                    },
                    ye = function (t) {
                        var e = [],
                            r = [],
                            n = -1;
                        return (
                            t.split(De).forEach(function (t) {
                                var i = t.match(q) || [];
                                e.push.apply(e, i), r.push((n += i.length + 1));
                            }),
                            (e.c = r),
                            e
                        );
                    },
                    ve = function (t, e, r) {
                        var n,
                            i,
                            o,
                            s,
                            a = "",
                            u = (t + a).match(De),
                            l = e ? "hsla(" : "rgba(",
                            h = 0;
                        if (!u) return t;
                        if (
                            ((u = u.map(function (t) {
                                return (t = me(t, e, 1)) && l + (e ? t[0] + "," + t[1] + "%," + t[2] + "%," + t[3] : t.join(",")) + ")";
                            })),
                            r && ((o = ye(t)), (n = r.c).join(a) !== o.c.join(a)))
                        )
                            for (s = (i = t.replace(De, "1").split(q)).length - 1; h < s; h++) a += i[h] + (~n.indexOf(h) ? u.shift() || l + "0,0,0,0)" : (o.length ? o : u.length ? u : r).shift());
                        if (!i) for (s = (i = t.split(De)).length - 1; h < s; h++) a += i[h] + u[h];
                        return a + i[s];
                    },
                    De = (function () {
                        var t,
                            e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b";
                        for (t in de) e += "|" + t + "\\b";
                        return new RegExp(e + ")", "gi");
                    })(),
                    _e = /hsl[a]?\(/,
                    be = function (t) {
                        var e,
                            r = t.join(" ");
                        if (((De.lastIndex = 0), De.test(r))) return (e = _e.test(r)), (t[1] = ve(t[1], e)), (t[0] = ve(t[0], e, ye(t[1]))), !0;
                    },
                    xe = (function () {
                        var t,
                            e,
                            r,
                            n,
                            i,
                            o,
                            s = Date.now,
                            a = 500,
                            u = 33,
                            l = s(),
                            h = l,
                            c = 1e3 / 240,
                            f = c,
                            p = [],
                            d = function r(d) {
                                var g,
                                    m,
                                    y,
                                    v,
                                    D = s() - h,
                                    _ = !0 === d;
                                if ((D > a && (l += D - u), ((g = (y = (h += D) - l) - f) > 0 || _) && ((v = ++n.frame), (i = y - 1e3 * n.time), (n.time = y /= 1e3), (f += g + (g >= c ? 4 : c - g)), (m = 1)), _ || (t = e(r)), m))
                                    for (o = 0; o < p.length; o++) p[o](y, i, v, d);
                            };
                        return (
                            (n = {
                                time: 0,
                                frame: 0,
                                tick: function () {
                                    d(!0);
                                },
                                deltaRatio: function (t) {
                                    return i / (1e3 / (t || 60));
                                },
                                wake: function () {
                                    v &&
                                        (!m &&
                                            N() &&
                                            ((g = m = window),
                                            (y = g.document || {}),
                                            ($.gsap = hr),
                                            (g.gsapVersions || (g.gsapVersions = [])).push(hr.version),
                                            K(Z || g.GreenSockGlobals || (!g.gsap && g) || {}),
                                            (r = g.requestAnimationFrame)),
                                        t && n.sleep(),
                                        (e =
                                            r ||
                                            function (t) {
                                                return setTimeout(t, (f - 1e3 * n.time + 1) | 0);
                                            }),
                                        (b = 1),
                                        d(2));
                                },
                                sleep: function () {
                                    (r ? g.cancelAnimationFrame : clearTimeout)(t), (b = 0), (e = et);
                                },
                                lagSmoothing: function (t, e) {
                                    (a = t || 1e8), (u = Math.min(e, a, 0));
                                },
                                fps: function (t) {
                                    (c = 1e3 / (t || 240)), (f = 1e3 * n.time + c);
                                },
                                add: function (t) {
                                    p.indexOf(t) < 0 && p.push(t), we();
                                },
                                remove: function (t) {
                                    var e;
                                    ~(e = p.indexOf(t)) && p.splice(e, 1) && o >= e && o--;
                                },
                                _listeners: p,
                            }),
                            n
                        );
                    })(),
                    we = function () {
                        return !b && xe.wake();
                    },
                    Ee = {},
                    Ce = /^[\d.\-M][\d.\-,\s]/,
                    Fe = /["']/g,
                    Te = function (t) {
                        for (var e, r, n, i = {}, o = t.substr(1, t.length - 3).split(":"), s = o[0], a = 1, u = o.length; a < u; a++)
                            (r = o[a]), (e = a !== u - 1 ? r.lastIndexOf(",") : r.length), (n = r.substr(0, e)), (i[s] = isNaN(n) ? n.replace(Fe, "").trim() : +n), (s = r.substr(e + 1).trim());
                        return i;
                    },
                    Ae = function (t) {
                        return function (e) {
                            return 1 - t(1 - e);
                        };
                    },
                    Me = function t(e, r) {
                        for (var n, i = e._first; i; )
                            i instanceof je ? t(i, r) : !i.vars.yoyoEase || (i._yoyo && i._repeat) || i._yoyo === r || (i.timeline ? t(i.timeline, r) : ((n = i._ease), (i._ease = i._yEase), (i._yEase = n), (i._yoyo = r))), (i = i._next);
                    },
                    Oe = function (t, e) {
                        return (
                            (t &&
                                (k(t)
                                    ? t
                                    : Ee[t] ||
                                      (function (t) {
                                          var e,
                                              r,
                                              n,
                                              i,
                                              o = (t + "").split("("),
                                              s = Ee[o[0]];
                                          return s && o.length > 1 && s.config
                                              ? s.config.apply(
                                                    null,
                                                    ~t.indexOf("{")
                                                        ? [Te(o[1])]
                                                        : ((e = t), (r = e.indexOf("(") + 1), (n = e.indexOf(")")), (i = e.indexOf("(", r)), e.substring(r, ~i && i < n ? e.indexOf(")", n + 1) : n)).split(",").map(Dt)
                                                )
                                              : Ee._CE && Ce.test(t)
                                              ? Ee._CE("", t)
                                              : s;
                                      })(t))) ||
                            e
                        );
                    },
                    Se = function (t, e, r, n) {
                        void 0 === r &&
                            (r = function (t) {
                                return 1 - e(1 - t);
                            }),
                            void 0 === n &&
                                (n = function (t) {
                                    return t < 0.5 ? e(2 * t) / 2 : 1 - e(2 * (1 - t)) / 2;
                                });
                        var i,
                            o = { easeIn: e, easeOut: r, easeInOut: n };
                        return (
                            pt(t, function (t) {
                                for (var e in ((Ee[t] = $[t] = o), (Ee[(i = t.toLowerCase())] = r), o)) Ee[i + ("easeIn" === e ? ".in" : "easeOut" === e ? ".out" : ".inOut")] = Ee[t + "." + e] = o[e];
                            }),
                            o
                        );
                    },
                    Pe = function (t) {
                        return function (e) {
                            return e < 0.5 ? (1 - t(1 - 2 * e)) / 2 : 0.5 + t(2 * (e - 0.5)) / 2;
                        };
                    },
                    ke = function t(e, r, n) {
                        var i = r >= 1 ? r : 1,
                            o = (n || (e ? 0.3 : 0.45)) / (r < 1 ? r : 1),
                            s = (o / F) * (Math.asin(1 / i) || 0),
                            a = function (t) {
                                return 1 === t ? 1 : i * Math.pow(2, -10 * t) * S((t - s) * o) + 1;
                            },
                            u =
                                "out" === e
                                    ? a
                                    : "in" === e
                                    ? function (t) {
                                          return 1 - a(1 - t);
                                      }
                                    : Pe(a);
                        return (
                            (o = F / o),
                            (u.config = function (r, n) {
                                return t(e, r, n);
                            }),
                            u
                        );
                    },
                    Re = function t(e, r) {
                        void 0 === r && (r = 1.70158);
                        var n = function (t) {
                                return t ? --t * t * ((r + 1) * t + r) + 1 : 0;
                            },
                            i =
                                "out" === e
                                    ? n
                                    : "in" === e
                                    ? function (t) {
                                          return 1 - n(1 - t);
                                      }
                                    : Pe(n);
                        return (
                            (i.config = function (r) {
                                return t(e, r);
                            }),
                            i
                        );
                    };
                pt("Linear,Quad,Cubic,Quart,Quint,Strong", function (t, e) {
                    var r = e < 5 ? e + 1 : e;
                    Se(
                        t + ",Power" + (r - 1),
                        e
                            ? function (t) {
                                  return Math.pow(t, r);
                              }
                            : function (t) {
                                  return t;
                              },
                        function (t) {
                            return 1 - Math.pow(1 - t, r);
                        },
                        function (t) {
                            return t < 0.5 ? Math.pow(2 * t, r) / 2 : 1 - Math.pow(2 * (1 - t), r) / 2;
                        }
                    );
                }),
                    (Ee.Linear.easeNone = Ee.none = Ee.Linear.easeIn),
                    Se("Elastic", ke("in"), ke("out"), ke()),
                    (function (t, e) {
                        var r = 1 / e,
                            n = function (n) {
                                return n < r ? t * n * n : n < 0.7272727272727273 ? t * Math.pow(n - 1.5 / e, 2) + 0.75 : n < 0.9090909090909092 ? t * (n -= 2.25 / e) * n + 0.9375 : t * Math.pow(n - 2.625 / e, 2) + 0.984375;
                            };
                        Se(
                            "Bounce",
                            function (t) {
                                return 1 - n(1 - t);
                            },
                            n
                        );
                    })(7.5625, 2.75),
                    Se("Expo", function (t) {
                        return t ? Math.pow(2, 10 * (t - 1)) : 0;
                    }),
                    Se("Circ", function (t) {
                        return -(M(1 - t * t) - 1);
                    }),
                    Se("Sine", function (t) {
                        return 1 === t ? 1 : 1 - O(t * T);
                    }),
                    Se("Back", Re("in"), Re("out"), Re()),
                    (Ee.SteppedEase = Ee.steps = $.SteppedEase = {
                        config: function (t, e) {
                            void 0 === t && (t = 1);
                            var r = 1 / t,
                                n = t + (e ? 0 : 1),
                                i = e ? 1 : 0;
                            return function (t) {
                                return (((n * $t(0, 0.99999999, t)) | 0) + i) * r;
                            };
                        },
                    }),
                    (w.ease = Ee["quad.out"]),
                    pt("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function (t) {
                        return (lt += t + "," + t + "Params,");
                    });
                var Be = function (t, e) {
                        (this.id = A++), (t._gsap = this), (this.target = t), (this.harness = e), (this.get = e ? e.get : ft), (this.set = e ? e.getSetter : Ke);
                    },
                    Le = (function () {
                        function t(t) {
                            (this.vars = t),
                                (this._delay = +t.delay || 0),
                                (this._repeat = t.repeat === 1 / 0 ? -2 : t.repeat || 0) && ((this._rDelay = t.repeatDelay || 0), (this._yoyo = !!t.yoyo || !!t.yoyoEase)),
                                (this._ts = 1),
                                Xt(this, +t.duration, 1, 1),
                                (this.data = t.data),
                                b || xe.wake();
                        }
                        var e = t.prototype;
                        return (
                            (e.delay = function (t) {
                                return t || 0 === t ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + t - this._delay), (this._delay = t), this) : this._delay;
                            }),
                            (e.duration = function (t) {
                                return arguments.length ? this.totalDuration(this._repeat > 0 ? t + (t + this._rDelay) * this._repeat : t) : this.totalDuration() && this._dur;
                            }),
                            (e.totalDuration = function (t) {
                                return arguments.length ? ((this._dirty = 0), Xt(this, this._repeat < 0 ? t : (t - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
                            }),
                            (e.totalTime = function (t, e) {
                                if ((we(), !arguments.length)) return this._tTime;
                                var r = this._dp;
                                if (r && r.smoothChildTiming && this._ts) {
                                    for (Lt(this, t), !r._dp || r.parent || jt(r, this); r && r.parent; )
                                        r.parent._time !== r._start + (r._ts >= 0 ? r._tTime / r._ts : (r.totalDuration() - r._tTime) / -r._ts) && r.totalTime(r._tTime, !0), (r = r.parent);
                                    !this.parent && this._dp.autoRemoveChildren && ((this._ts > 0 && t < this._tDur) || (this._ts < 0 && t > 0) || (!this._tDur && !t)) && Nt(this._dp, this, this._start - this._delay);
                                }
                                return (
                                    (this._tTime !== t || (!this._dur && !e) || (this._initted && Math.abs(this._zTime) === C) || (!t && !this._initted && (this.add || this._ptLookup))) && (this._ts || (this._pTime = t), vt(this, t, e)),
                                    this
                                );
                            }),
                            (e.time = function (t, e) {
                                return arguments.length ? this.totalTime(Math.min(this.totalDuration(), t + Pt(this)) % (this._dur + this._rDelay) || (t ? this._dur : 0), e) : this._time;
                            }),
                            (e.totalProgress = function (t, e) {
                                return arguments.length ? this.totalTime(this.totalDuration() * t, e) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
                            }),
                            (e.progress = function (t, e) {
                                return arguments.length ? this.totalTime(this.duration() * (!this._yoyo || 1 & this.iteration() ? t : 1 - t) + Pt(this), e) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
                            }),
                            (e.iteration = function (t, e) {
                                var r = this.duration() + this._rDelay;
                                return arguments.length ? this.totalTime(this._time + (t - 1) * r, e) : this._repeat ? kt(this._tTime, r) + 1 : 1;
                            }),
                            (e.timeScale = function (t) {
                                if (!arguments.length) return -1e-8 === this._rts ? 0 : this._rts;
                                if (this._rts === t) return this;
                                var e = this.parent && this._ts ? Rt(this.parent._time, this) : this._tTime;
                                return (this._rts = +t || 0), (this._ts = this._ps || -1e-8 === t ? 0 : this._rts), Ot(this.totalTime($t(-this._delay, this._tDur, e), !0)), Bt(this), this;
                            }),
                            (e.paused = function (t) {
                                return arguments.length
                                    ? (this._ps !== t &&
                                          ((this._ps = t),
                                          t
                                              ? ((this._pTime = this._tTime || Math.max(-this._delay, this.rawTime())), (this._ts = this._act = 0))
                                              : (we(),
                                                (this._ts = this._rts),
                                                this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, 1 === this.progress() && Math.abs(this._zTime) !== C && (this._tTime -= C)))),
                                      this)
                                    : this._ps;
                            }),
                            (e.startTime = function (t) {
                                if (arguments.length) {
                                    this._start = t;
                                    var e = this.parent || this._dp;
                                    return e && (e._sort || !this.parent) && Nt(e, this, t - this._delay), this;
                                }
                                return this._start;
                            }),
                            (e.endTime = function (t) {
                                return this._start + (j(t) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
                            }),
                            (e.rawTime = function (t) {
                                var e = this.parent || this._dp;
                                return e ? (t && (!this._ts || (this._repeat && this._time && this.totalProgress() < 1)) ? this._tTime % (this._dur + this._rDelay) : this._ts ? Rt(e.rawTime(t), this) : this._tTime) : this._tTime;
                            }),
                            (e.globalTime = function (t) {
                                for (var e = this, r = arguments.length ? t : e.rawTime(); e; ) (r = e._start + r / (e._ts || 1)), (e = e._dp);
                                return r;
                            }),
                            (e.repeat = function (t) {
                                return arguments.length ? ((this._repeat = t === 1 / 0 ? -2 : t), qt(this)) : -2 === this._repeat ? 1 / 0 : this._repeat;
                            }),
                            (e.repeatDelay = function (t) {
                                if (arguments.length) {
                                    var e = this._time;
                                    return (this._rDelay = t), qt(this), e ? this.time(e) : this;
                                }
                                return this._rDelay;
                            }),
                            (e.yoyo = function (t) {
                                return arguments.length ? ((this._yoyo = t), this) : this._yoyo;
                            }),
                            (e.seek = function (t, e) {
                                return this.totalTime(Gt(this, t), j(e));
                            }),
                            (e.restart = function (t, e) {
                                return this.play().totalTime(t ? -this._delay : 0, j(e));
                            }),
                            (e.play = function (t, e) {
                                return null != t && this.seek(t, e), this.reversed(!1).paused(!1);
                            }),
                            (e.reverse = function (t, e) {
                                return null != t && this.seek(t || this.totalDuration(), e), this.reversed(!0).paused(!1);
                            }),
                            (e.pause = function (t, e) {
                                return null != t && this.seek(t, e), this.paused(!0);
                            }),
                            (e.resume = function () {
                                return this.paused(!1);
                            }),
                            (e.reversed = function (t) {
                                return arguments.length ? (!!t !== this.reversed() && this.timeScale(-this._rts || (t ? -1e-8 : 0)), this) : this._rts < 0;
                            }),
                            (e.invalidate = function () {
                                return (this._initted = this._act = 0), (this._zTime = -1e-8), this;
                            }),
                            (e.isActive = function () {
                                var t,
                                    e = this.parent || this._dp,
                                    r = this._start;
                                return !(e && !(this._ts && this._initted && e.isActive() && (t = e.rawTime(!0)) >= r && t < this.endTime(!0) - C));
                            }),
                            (e.eventCallback = function (t, e, r) {
                                var n = this.vars;
                                return arguments.length > 1 ? (e ? ((n[t] = e), r && (n[t + "Params"] = r), "onUpdate" === t && (this._onUpdate = e)) : delete n[t], this) : n[t];
                            }),
                            (e.then = function (t) {
                                var e = this;
                                return new Promise(function (r) {
                                    var n = k(t) ? t : _t,
                                        i = function () {
                                            var t = e.then;
                                            (e.then = null), k(n) && (n = n(e)) && (n.then || n === e) && (e.then = t), r(n), (e.then = t);
                                        };
                                    (e._initted && 1 === e.totalProgress() && e._ts >= 0) || (!e._tTime && e._ts < 0) ? i() : (e._prom = i);
                                });
                            }),
                            (e.kill = function () {
                                ce(this);
                            }),
                            t
                        );
                    })();
                bt(Le.prototype, { _time: 0, _start: 0, _end: 0, _tTime: 0, _tDur: 0, _dirty: 0, _repeat: 0, _yoyo: !1, parent: null, _initted: !1, _rDelay: 0, _ts: 1, _dp: 0, ratio: 0, _zTime: -1e-8, _prom: 0, _ps: !1, _rts: 1 });
                var je = (function (t) {
                    function e(e, r) {
                        var n;
                        return (
                            void 0 === e && (e = {}),
                            ((n = t.call(this, e) || this).labels = {}),
                            (n.smoothChildTiming = !!e.smoothChildTiming),
                            (n.autoRemoveChildren = !!e.autoRemoveChildren),
                            (n._sort = j(e.sortChildren)),
                            d && Nt(e.parent || d, c(n), r),
                            e.reversed && n.reverse(),
                            e.paused && n.paused(!0),
                            e.scrollTrigger && zt(c(n), e.scrollTrigger),
                            n
                        );
                    }
                    f(e, t);
                    var r = e.prototype;
                    return (
                        (r.to = function (t, e, r) {
                            return Wt(0, arguments, this), this;
                        }),
                        (r.from = function (t, e, r) {
                            return Wt(1, arguments, this), this;
                        }),
                        (r.fromTo = function (t, e, r, n) {
                            return Wt(2, arguments, this), this;
                        }),
                        (r.set = function (t, e, r) {
                            return (e.duration = 0), (e.parent = this), Ft(e).repeatDelay || (e.repeat = 0), (e.immediateRender = !!e.immediateRender), new Ge(t, e, Gt(this, r), 1), this;
                        }),
                        (r.call = function (t, e, r) {
                            return Nt(this, Ge.delayedCall(0, t, e), r);
                        }),
                        (r.staggerTo = function (t, e, r, n, i, o, s) {
                            return (r.duration = e), (r.stagger = r.stagger || n), (r.onComplete = o), (r.onCompleteParams = s), (r.parent = this), new Ge(t, r, Gt(this, i)), this;
                        }),
                        (r.staggerFrom = function (t, e, r, n, i, o, s) {
                            return (r.runBackwards = 1), (Ft(r).immediateRender = j(r.immediateRender)), this.staggerTo(t, e, r, n, i, o, s);
                        }),
                        (r.staggerFromTo = function (t, e, r, n, i, o, s, a) {
                            return (n.startAt = r), (Ft(n).immediateRender = j(n.immediateRender)), this.staggerTo(t, e, n, i, o, s, a);
                        }),
                        (r.render = function (t, e, r) {
                            var n,
                                i,
                                o,
                                s,
                                a,
                                u,
                                l,
                                h,
                                c,
                                f,
                                p,
                                g,
                                m = this._time,
                                y = this._dirty ? this.totalDuration() : this._tDur,
                                v = this._dur,
                                D = t <= 0 ? 0 : gt(t),
                                _ = this._zTime < 0 != t < 0 && (this._initted || !v);
                            if ((this !== d && D > y && t >= 0 && (D = y), D !== this._tTime || r || _)) {
                                if ((m !== this._time && v && ((D += this._time - m), (t += this._time - m)), (n = D), (c = this._start), (u = !(h = this._ts)), _ && (v || (m = this._zTime), (t || !e) && (this._zTime = t)), this._repeat)) {
                                    if (((p = this._yoyo), (a = v + this._rDelay), this._repeat < -1 && t < 0)) return this.totalTime(100 * a + t, e, r);
                                    if (
                                        ((n = gt(D % a)),
                                        D === y ? ((s = this._repeat), (n = v)) : ((s = ~~(D / a)) && s === D / a && ((n = v), s--), n > v && (n = v)),
                                        (f = kt(this._tTime, a)),
                                        !m && this._tTime && f !== s && (f = s),
                                        p && 1 & s && ((n = v - n), (g = 1)),
                                        s !== f && !this._lock)
                                    ) {
                                        var b = p && 1 & f,
                                            x = b === (p && 1 & s);
                                        if (
                                            (s < f && (b = !b),
                                            (m = b ? 0 : v),
                                            (this._lock = 1),
                                            (this.render(m || (g ? 0 : gt(s * a)), e, !v)._lock = 0),
                                            (this._tTime = D),
                                            !e && this.parent && he(this, "onRepeat"),
                                            this.vars.repeatRefresh && !g && (this.invalidate()._lock = 1),
                                            (m && m !== this._time) || u !== !this._ts || (this.vars.onRepeat && !this.parent && !this._act))
                                        )
                                            return this;
                                        if (((v = this._dur), (y = this._tDur), x && ((this._lock = 2), (m = b ? v : -1e-4), this.render(m, !0), this.vars.repeatRefresh && !g && this.invalidate()), (this._lock = 0), !this._ts && !u))
                                            return this;
                                        Me(this, g);
                                    }
                                }
                                if (
                                    (this._hasPause &&
                                        !this._forcing &&
                                        this._lock < 2 &&
                                        ((l = (function (t, e, r) {
                                            var n;
                                            if (r > e)
                                                for (n = t._first; n && n._start <= r; ) {
                                                    if (!n._dur && "isPause" === n.data && n._start > e) return n;
                                                    n = n._next;
                                                }
                                            else
                                                for (n = t._last; n && n._start >= r; ) {
                                                    if (!n._dur && "isPause" === n.data && n._start < e) return n;
                                                    n = n._prev;
                                                }
                                        })(this, gt(m), gt(n))),
                                        l && (D -= n - (n = l._start))),
                                    (this._tTime = D),
                                    (this._time = n),
                                    (this._act = !h),
                                    this._initted || ((this._onUpdate = this.vars.onUpdate), (this._initted = 1), (this._zTime = t), (m = 0)),
                                    !m && n && !e && (he(this, "onStart"), this._tTime !== D))
                                )
                                    return this;
                                if (n >= m && t >= 0)
                                    for (i = this._first; i; ) {
                                        if (((o = i._next), (i._act || n >= i._start) && i._ts && l !== i)) {
                                            if (i.parent !== this) return this.render(t, e, r);
                                            if ((i.render(i._ts > 0 ? (n - i._start) * i._ts : (i._dirty ? i.totalDuration() : i._tDur) + (n - i._start) * i._ts, e, r), n !== this._time || (!this._ts && !u))) {
                                                (l = 0), o && (D += this._zTime = -1e-8);
                                                break;
                                            }
                                        }
                                        i = o;
                                    }
                                else {
                                    i = this._last;
                                    for (var w = t < 0 ? t : n; i; ) {
                                        if (((o = i._prev), (i._act || w <= i._end) && i._ts && l !== i)) {
                                            if (i.parent !== this) return this.render(t, e, r);
                                            if ((i.render(i._ts > 0 ? (w - i._start) * i._ts : (i._dirty ? i.totalDuration() : i._tDur) + (w - i._start) * i._ts, e, r), n !== this._time || (!this._ts && !u))) {
                                                (l = 0), o && (D += this._zTime = w ? -1e-8 : C);
                                                break;
                                            }
                                        }
                                        i = o;
                                    }
                                }
                                if (l && !e && (this.pause(), (l.render(n >= m ? 0 : -1e-8)._zTime = n >= m ? 1 : -1), this._ts)) return (this._start = c), Bt(this), this.render(t, e, r);
                                this._onUpdate && !e && he(this, "onUpdate", !0),
                                    ((D === y && y >= this.totalDuration()) || (!D && m)) &&
                                        ((c !== this._start && Math.abs(h) === Math.abs(this._ts)) ||
                                            this._lock ||
                                            ((t || !v) && ((D === y && this._ts > 0) || (!D && this._ts < 0)) && At(this, 1),
                                            e || (t < 0 && !m) || (!D && !m && y) || (he(this, D === y && t >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(D < y && this.timeScale() > 0) && this._prom())));
                            }
                            return this;
                        }),
                        (r.add = function (t, e) {
                            var r = this;
                            if ((R(e) || (e = Gt(this, e, t)), !(t instanceof Le))) {
                                if (U(t))
                                    return (
                                        t.forEach(function (t) {
                                            return r.add(t, e);
                                        }),
                                        this
                                    );
                                if (P(t)) return this.addLabel(t, e);
                                if (!k(t)) return this;
                                t = Ge.delayedCall(0, t);
                            }
                            return this !== t ? Nt(this, t, e) : this;
                        }),
                        (r.getChildren = function (t, e, r, n) {
                            void 0 === t && (t = !0), void 0 === e && (e = !0), void 0 === r && (r = !0), void 0 === n && (n = -E);
                            for (var i = [], o = this._first; o; ) o._start >= n && (o instanceof Ge ? e && i.push(o) : (r && i.push(o), t && i.push.apply(i, o.getChildren(!0, e, r)))), (o = o._next);
                            return i;
                        }),
                        (r.getById = function (t) {
                            for (var e = this.getChildren(1, 1, 1), r = e.length; r--; ) if (e[r].vars.id === t) return e[r];
                        }),
                        (r.remove = function (t) {
                            return P(t) ? this.removeLabel(t) : k(t) ? this.killTweensOf(t) : (Tt(this, t), t === this._recent && (this._recent = this._last), Mt(this));
                        }),
                        (r.totalTime = function (e, r) {
                            return arguments.length
                                ? ((this._forcing = 1),
                                  !this._dp && this._ts && (this._start = gt(xe.time - (this._ts > 0 ? e / this._ts : (this.totalDuration() - e) / -this._ts))),
                                  t.prototype.totalTime.call(this, e, r),
                                  (this._forcing = 0),
                                  this)
                                : this._tTime;
                        }),
                        (r.addLabel = function (t, e) {
                            return (this.labels[t] = Gt(this, e)), this;
                        }),
                        (r.removeLabel = function (t) {
                            return delete this.labels[t], this;
                        }),
                        (r.addPause = function (t, e, r) {
                            var n = Ge.delayedCall(0, e || et, r);
                            return (n.data = "isPause"), (this._hasPause = 1), Nt(this, n, Gt(this, t));
                        }),
                        (r.removePause = function (t) {
                            var e = this._first;
                            for (t = Gt(this, t); e; ) e._start === t && "isPause" === e.data && At(e), (e = e._next);
                        }),
                        (r.killTweensOf = function (t, e, r) {
                            for (var n = this.getTweensOf(t, r), i = n.length; i--; ) Ne !== n[i] && n[i].kill(t, e);
                            return this;
                        }),
                        (r.getTweensOf = function (t, e) {
                            for (var r, n = [], i = te(t), o = this._first, s = R(e); o; )
                                o instanceof Ge
                                    ? mt(o._targets, i) && (s ? (!Ne || (o._initted && o._ts)) && o.globalTime(0) <= e && o.globalTime(o.totalDuration()) > e : !e || o.isActive()) && n.push(o)
                                    : (r = o.getTweensOf(i, e)).length && n.push.apply(n, r),
                                    (o = o._next);
                            return n;
                        }),
                        (r.tweenTo = function (t, e) {
                            e = e || {};
                            var r,
                                n = this,
                                i = Gt(n, t),
                                o = e,
                                s = o.startAt,
                                a = o.onStart,
                                u = o.onStartParams,
                                l = o.immediateRender,
                                h = Ge.to(
                                    n,
                                    bt(
                                        {
                                            ease: e.ease || "none",
                                            lazy: !1,
                                            immediateRender: !1,
                                            time: i,
                                            overwrite: "auto",
                                            duration: e.duration || Math.abs((i - (s && "time" in s ? s.time : n._time)) / n.timeScale()) || C,
                                            onStart: function () {
                                                if ((n.pause(), !r)) {
                                                    var t = e.duration || Math.abs((i - (s && "time" in s ? s.time : n._time)) / n.timeScale());
                                                    h._dur !== t && Xt(h, t, 0, 1).render(h._time, !0, !0), (r = 1);
                                                }
                                                a && a.apply(h, u || []);
                                            },
                                        },
                                        e
                                    )
                                );
                            return l ? h.render(0) : h;
                        }),
                        (r.tweenFromTo = function (t, e, r) {
                            return this.tweenTo(e, bt({ startAt: { time: Gt(this, t) } }, r));
                        }),
                        (r.recent = function () {
                            return this._recent;
                        }),
                        (r.nextLabel = function (t) {
                            return void 0 === t && (t = this._time), le(this, Gt(this, t));
                        }),
                        (r.previousLabel = function (t) {
                            return void 0 === t && (t = this._time), le(this, Gt(this, t), 1);
                        }),
                        (r.currentLabel = function (t) {
                            return arguments.length ? this.seek(t, !0) : this.previousLabel(this._time + C);
                        }),
                        (r.shiftChildren = function (t, e, r) {
                            void 0 === r && (r = 0);
                            for (var n, i = this._first, o = this.labels; i; ) i._start >= r && ((i._start += t), (i._end += t)), (i = i._next);
                            if (e) for (n in o) o[n] >= r && (o[n] += t);
                            return Mt(this);
                        }),
                        (r.invalidate = function () {
                            var e = this._first;
                            for (this._lock = 0; e; ) e.invalidate(), (e = e._next);
                            return t.prototype.invalidate.call(this);
                        }),
                        (r.clear = function (t) {
                            void 0 === t && (t = !0);
                            for (var e, r = this._first; r; ) (e = r._next), this.remove(r), (r = e);
                            return this._dp && (this._time = this._tTime = this._pTime = 0), t && (this.labels = {}), Mt(this);
                        }),
                        (r.totalDuration = function (t) {
                            var e,
                                r,
                                n,
                                i = 0,
                                o = this,
                                s = o._last,
                                a = E;
                            if (arguments.length) return o.timeScale((o._repeat < 0 ? o.duration() : o.totalDuration()) / (o.reversed() ? -t : t));
                            if (o._dirty) {
                                for (n = o.parent; s; )
                                    (e = s._prev),
                                        s._dirty && s.totalDuration(),
                                        (r = s._start) > a && o._sort && s._ts && !o._lock ? ((o._lock = 1), (Nt(o, s, r - s._delay, 1)._lock = 0)) : (a = r),
                                        r < 0 && s._ts && ((i -= r), ((!n && !o._dp) || (n && n.smoothChildTiming)) && ((o._start += r / o._ts), (o._time -= r), (o._tTime -= r)), o.shiftChildren(-r, !1, -Infinity), (a = 0)),
                                        s._end > i && s._ts && (i = s._end),
                                        (s = e);
                                Xt(o, o === d && o._time > i ? o._time : i, 1, 1), (o._dirty = 0);
                            }
                            return o._tDur;
                        }),
                        (e.updateRoot = function (t) {
                            if ((d._ts && (vt(d, Rt(t, d)), (D = xe.frame)), xe.frame >= at)) {
                                at += x.autoSleep || 120;
                                var e = d._first;
                                if ((!e || !e._ts) && x.autoSleep && xe._listeners.length < 2) {
                                    for (; e && !e._ts; ) e = e._next;
                                    e || xe.sleep();
                                }
                            }
                        }),
                        e
                    );
                })(Le);
                bt(je.prototype, { _lock: 0, _hasPause: 0, _forcing: 0 });
                var Ne,
                    ze = function (t, e, r, n, i, o, s) {
                        var a,
                            u,
                            l,
                            h,
                            c,
                            f,
                            p,
                            d,
                            g = new sr(this._pt, t, e, 0, 1, tr, null, i),
                            m = 0,
                            y = 0;
                        for (g.b = r, g.e = n, r += "", (p = ~(n += "").indexOf("random(")) && (n = ae(n)), o && (o((d = [r, n]), t, e), (r = d[0]), (n = d[1])), u = r.match(V) || []; (a = V.exec(n)); )
                            (h = a[0]),
                                (c = n.substring(m, a.index)),
                                l ? (l = (l + 1) % 5) : "rgba(" === c.substr(-5) && (l = 1),
                                h !== u[y++] &&
                                    ((f = parseFloat(u[y - 1]) || 0),
                                    (g._pt = { _next: g._pt, p: c || 1 === y ? c : ",", s: f, c: "=" === h.charAt(1) ? parseFloat(h.substr(2)) * ("-" === h.charAt(0) ? -1 : 1) : parseFloat(h) - f, m: l && l < 4 ? Math.round : 0 }),
                                    (m = V.lastIndex));
                        return (g.c = m < n.length ? n.substring(m, n.length) : ""), (g.fp = s), (G.test(n) || p) && (g.e = 0), (this._pt = g), g;
                    },
                    Ie = function (t, e, r, n, i, o, s, a, u) {
                        k(n) && (n = n(i || 0, t, o));
                        var l,
                            h = t[e],
                            c = "get" !== r ? r : k(h) ? (u ? t[e.indexOf("set") || !k(t["get" + e.substr(3)]) ? e : "get" + e.substr(3)](u) : t[e]()) : h,
                            f = k(h) ? (u ? $e : He) : We;
                        if ((P(n) && (~n.indexOf("random(") && (n = ae(n)), "=" === n.charAt(1) && ((l = parseFloat(c) + parseFloat(n.substr(2)) * ("-" === n.charAt(0) ? -1 : 1) + (Zt(c) || 0)) || 0 === l) && (n = l)), c !== n))
                            return isNaN(c * n) || "" === n
                                ? (!h && !(e in t) && Q(e, n), ze.call(this, t, e, c, n, f, a || x.stringFilter, u))
                                : ((l = new sr(this._pt, t, e, +c || 0, n - (c || 0), "boolean" == typeof h ? Je : Qe, 0, f)), u && (l.fp = u), s && l.modifier(s, this, t), (this._pt = l));
                    },
                    Ue = function (t, e, r, n, i, o) {
                        var s, a, u, l;
                        if (
                            ot[t] &&
                            !1 !==
                                (s = new ot[t]()).init(
                                    i,
                                    s.rawVars
                                        ? e[t]
                                        : (function (t, e, r, n, i) {
                                              if ((k(t) && (t = Xe(t, i, e, r, n)), !L(t) || (t.style && t.nodeType) || U(t) || I(t))) return P(t) ? Xe(t, i, e, r, n) : t;
                                              var o,
                                                  s = {};
                                              for (o in t) s[o] = Xe(t[o], i, e, r, n);
                                              return s;
                                          })(e[t], n, i, o, r),
                                    r,
                                    n,
                                    o
                                ) &&
                            ((r._pt = a = new sr(r._pt, i, t, 0, 1, s.render, s, 0, s.priority)), r !== _)
                        )
                            for (u = r._ptLookup[r._targets.indexOf(i)], l = s._props.length; l--; ) u[s._props[l]] = a;
                        return s;
                    },
                    Ye = function t(e, r) {
                        var n,
                            i,
                            o,
                            s,
                            a,
                            u,
                            l,
                            h,
                            c,
                            f,
                            g,
                            m,
                            y,
                            v = e.vars,
                            D = v.ease,
                            _ = v.startAt,
                            b = v.immediateRender,
                            x = v.lazy,
                            E = v.onUpdate,
                            F = v.onUpdateParams,
                            T = v.callbackScope,
                            A = v.runBackwards,
                            M = v.yoyoEase,
                            O = v.keyframes,
                            S = v.autoRevert,
                            P = e._dur,
                            k = e._startAt,
                            R = e._targets,
                            B = e.parent,
                            L = B && "nested" === B.data ? B.parent._targets : R,
                            N = "auto" === e._overwrite && !p,
                            z = e.timeline;
                        if (
                            (z && (!O || !D) && (D = "none"),
                            (e._ease = Oe(D, w.ease)),
                            (e._yEase = M ? Ae(Oe(!0 === M ? D : M, w.ease)) : 0),
                            M && e._yoyo && !e._repeat && ((M = e._yEase), (e._yEase = e._ease), (e._ease = M)),
                            (e._from = !z && !!v.runBackwards),
                            !z)
                        ) {
                            if (((m = (h = R[0] ? ct(R[0]).harness : 0) && v[h.prop]), (n = Ct(v, rt)), k && k.render(-1, !0).kill(), _))
                                if (
                                    (At((e._startAt = Ge.set(R, bt({ data: "isStart", overwrite: !1, parent: B, immediateRender: !0, lazy: j(x), startAt: null, delay: 0, onUpdate: E, onUpdateParams: F, callbackScope: T, stagger: 0 }, _)))),
                                    r < 0 && !b && !S && e._startAt.render(-1, !0),
                                    b)
                                ) {
                                    if ((r > 0 && !S && (e._startAt = 0), P && r <= 0)) return void (r && (e._zTime = r));
                                } else !1 === S && (e._startAt = 0);
                            else if (A && P)
                                if (k) !S && (e._startAt = 0);
                                else if (
                                    (r && (b = !1),
                                    (o = bt({ overwrite: !1, data: "isFromStart", lazy: b && j(x), immediateRender: b, stagger: 0, parent: B }, n)),
                                    m && (o[h.prop] = m),
                                    At((e._startAt = Ge.set(R, o))),
                                    r < 0 && e._startAt.render(-1, !0),
                                    b)
                                ) {
                                    if (!r) return;
                                } else t(e._startAt, C);
                            for (e._pt = 0, x = (P && j(x)) || (x && !P), i = 0; i < R.length; i++) {
                                if (
                                    ((l = (a = R[i])._gsap || ht(R)[i]._gsap),
                                    (e._ptLookup[i] = f = {}),
                                    it[l.id] && nt.length && yt(),
                                    (g = L === R ? i : L.indexOf(a)),
                                    h &&
                                        !1 !== (c = new h()).init(a, m || n, e, g, L) &&
                                        ((e._pt = s = new sr(e._pt, a, c.name, 0, 1, c.render, c, 0, c.priority)),
                                        c._props.forEach(function (t) {
                                            f[t] = s;
                                        }),
                                        c.priority && (u = 1)),
                                    !h || m)
                                )
                                    for (o in n) ot[o] && (c = Ue(o, n, e, g, a, L)) ? c.priority && (u = 1) : (f[o] = s = Ie.call(e, a, o, "get", n[o], g, L, 0, v.stringFilter));
                                e._op && e._op[i] && e.kill(a, e._op[i]), N && e._pt && ((Ne = e), d.killTweensOf(a, f, e.globalTime(r)), (y = !e.parent), (Ne = 0)), e._pt && x && (it[l.id] = 1);
                            }
                            u && or(e), e._onInit && e._onInit(e);
                        }
                        (e._onUpdate = E), (e._initted = (!e._op || e._pt) && !y);
                    },
                    Xe = function (t, e, r, n, i) {
                        return k(t) ? t.call(e, r, n, i) : P(t) && ~t.indexOf("random(") ? ae(t) : t;
                    },
                    qe = lt + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase",
                    Ve = (qe + ",id,stagger,delay,duration,paused,scrollTrigger").split(","),
                    Ge = (function (t) {
                        function e(e, r, n, i) {
                            var o;
                            "number" == typeof r && ((n.duration = r), (r = n), (n = null));
                            var s,
                                a,
                                u,
                                l,
                                h,
                                f,
                                g,
                                m,
                                y = (o = t.call(this, i ? r : Ft(r)) || this).vars,
                                v = y.duration,
                                D = y.delay,
                                _ = y.immediateRender,
                                b = y.stagger,
                                w = y.overwrite,
                                E = y.keyframes,
                                C = y.defaults,
                                F = y.scrollTrigger,
                                T = y.yoyoEase,
                                A = r.parent || d,
                                M = (U(e) || I(e) ? R(e[0]) : "length" in r) ? [e] : te(e);
                            if (((o._targets = M.length ? ht(M) : J("GSAP target " + e + " not found. https://greensock.com", !x.nullTargetWarn) || []), (o._ptLookup = []), (o._overwrite = w), E || b || z(v) || z(D))) {
                                if (((r = o.vars), (s = o.timeline = new je({ data: "nested", defaults: C || {} })).kill(), (s.parent = s._dp = c(o)), (s._start = 0), E))
                                    Ft(bt(s.vars.defaults, { ease: "none" })),
                                        b
                                            ? M.forEach(function (t, e) {
                                                  return E.forEach(function (r, n) {
                                                      return s.to(t, r, n ? ">" : e * b);
                                                  });
                                              })
                                            : E.forEach(function (t) {
                                                  return s.to(M, t, ">");
                                              });
                                else {
                                    if (((l = M.length), (g = b ? re(b) : et), L(b))) for (h in b) ~qe.indexOf(h) && (m || (m = {}), (m[h] = b[h]));
                                    for (a = 0; a < l; a++) {
                                        for (h in ((u = {}), r)) Ve.indexOf(h) < 0 && (u[h] = r[h]);
                                        (u.stagger = 0),
                                            T && (u.yoyoEase = T),
                                            m && wt(u, m),
                                            (f = M[a]),
                                            (u.duration = +Xe(v, c(o), a, f, M)),
                                            (u.delay = (+Xe(D, c(o), a, f, M) || 0) - o._delay),
                                            !b && 1 === l && u.delay && ((o._delay = D = u.delay), (o._start += D), (u.delay = 0)),
                                            s.to(f, u, g(a, f, M));
                                    }
                                    s.duration() ? (v = D = 0) : (o.timeline = 0);
                                }
                                v || o.duration((v = s.duration()));
                            } else o.timeline = 0;
                            return (
                                !0 !== w || p || ((Ne = c(o)), d.killTweensOf(M), (Ne = 0)),
                                Nt(A, c(o), n),
                                r.reversed && o.reverse(),
                                r.paused && o.paused(!0),
                                (_ || (!v && !E && o._start === gt(A._time) && j(_) && St(c(o)) && "nested" !== A.data)) && ((o._tTime = -1e-8), o.render(Math.max(0, -D))),
                                F && zt(c(o), F),
                                o
                            );
                        }
                        f(e, t);
                        var r = e.prototype;
                        return (
                            (r.render = function (t, e, r) {
                                var n,
                                    i,
                                    o,
                                    s,
                                    a,
                                    u,
                                    l,
                                    h,
                                    c,
                                    f = this._time,
                                    p = this._tDur,
                                    d = this._dur,
                                    g = t > p - C && t >= 0 ? p : t < C ? 0 : t;
                                if (d) {
                                    if (g !== this._tTime || !t || r || (!this._initted && this._tTime) || (this._startAt && this._zTime < 0 != t < 0)) {
                                        if (((n = g), (h = this.timeline), this._repeat)) {
                                            if (((s = d + this._rDelay), this._repeat < -1 && t < 0)) return this.totalTime(100 * s + t, e, r);
                                            if (
                                                ((n = gt(g % s)),
                                                g === p ? ((o = this._repeat), (n = d)) : ((o = ~~(g / s)) && o === g / s && ((n = d), o--), n > d && (n = d)),
                                                (u = this._yoyo && 1 & o) && ((c = this._yEase), (n = d - n)),
                                                (a = kt(this._tTime, s)),
                                                n === f && !r && this._initted)
                                            )
                                                return this;
                                            o !== a && (h && this._yEase && Me(h, u), !this.vars.repeatRefresh || u || this._lock || ((this._lock = r = 1), (this.render(gt(s * o), !0).invalidate()._lock = 0)));
                                        }
                                        if (!this._initted) {
                                            if (It(this, t < 0 ? t : n, r, e)) return (this._tTime = 0), this;
                                            if (d !== this._dur) return this.render(t, e, r);
                                        }
                                        if (
                                            ((this._tTime = g),
                                            (this._time = n),
                                            !this._act && this._ts && ((this._act = 1), (this._lazy = 0)),
                                            (this.ratio = l = (c || this._ease)(n / d)),
                                            this._from && (this.ratio = l = 1 - l),
                                            n && !f && !e && (he(this, "onStart"), this._tTime !== g))
                                        )
                                            return this;
                                        for (i = this._pt; i; ) i.r(l, i.d), (i = i._next);
                                        (h && h.render(t < 0 ? t : !n && u ? -1e-8 : h._dur * l, e, r)) || (this._startAt && (this._zTime = t)),
                                            this._onUpdate && !e && (t < 0 && this._startAt && this._startAt.render(t, !0, r), he(this, "onUpdate")),
                                            this._repeat && o !== a && this.vars.onRepeat && !e && this.parent && he(this, "onRepeat"),
                                            (g !== this._tDur && g) ||
                                                this._tTime !== g ||
                                                (t < 0 && this._startAt && !this._onUpdate && this._startAt.render(t, !0, !0),
                                                (t || !d) && ((g === this._tDur && this._ts > 0) || (!g && this._ts < 0)) && At(this, 1),
                                                e || (t < 0 && !f) || (!g && !f) || (he(this, g === p ? "onComplete" : "onReverseComplete", !0), this._prom && !(g < p && this.timeScale() > 0) && this._prom()));
                                    }
                                } else
                                    !(function (t, e, r, n) {
                                        var i,
                                            o,
                                            s,
                                            a = t.ratio,
                                            u = e < 0 || (!e && ((!t._start && Ut(t) && (t._initted || !Yt(t))) || ((t._ts < 0 || t._dp._ts < 0) && !Yt(t)))) ? 0 : 1,
                                            l = t._rDelay,
                                            h = 0;
                                        if (
                                            (l &&
                                                t._repeat &&
                                                ((h = $t(0, t._tDur, e)), (o = kt(h, l)), (s = kt(t._tTime, l)), t._yoyo && 1 & o && (u = 1 - u), o !== s && ((a = 1 - u), t.vars.repeatRefresh && t._initted && t.invalidate())),
                                            u !== a || n || t._zTime === C || (!e && t._zTime))
                                        ) {
                                            if (!t._initted && It(t, e, n, r)) return;
                                            for (s = t._zTime, t._zTime = e || (r ? C : 0), r || (r = e && !s), t.ratio = u, t._from && (u = 1 - u), t._time = 0, t._tTime = h, i = t._pt; i; ) i.r(u, i.d), (i = i._next);
                                            t._startAt && e < 0 && t._startAt.render(e, !0, !0),
                                                t._onUpdate && !r && he(t, "onUpdate"),
                                                h && t._repeat && !r && t.parent && he(t, "onRepeat"),
                                                (e >= t._tDur || e < 0) && t.ratio === u && (u && At(t, 1), r || (he(t, u ? "onComplete" : "onReverseComplete", !0), t._prom && t._prom()));
                                        } else t._zTime || (t._zTime = e);
                                    })(this, t, e, r);
                                return this;
                            }),
                            (r.targets = function () {
                                return this._targets;
                            }),
                            (r.invalidate = function () {
                                return (this._pt = this._op = this._startAt = this._onUpdate = this._lazy = this.ratio = 0), (this._ptLookup = []), this.timeline && this.timeline.invalidate(), t.prototype.invalidate.call(this);
                            }),
                            (r.kill = function (t, e) {
                                if ((void 0 === e && (e = "all"), !(t || (e && "all" !== e)))) return (this._lazy = this._pt = 0), this.parent ? ce(this) : this;
                                if (this.timeline) {
                                    var r = this.timeline.totalDuration();
                                    return (
                                        this.timeline.killTweensOf(t, e, Ne && !0 !== Ne.vars.overwrite)._first || ce(this), this.parent && r !== this.timeline.totalDuration() && Xt(this, (this._dur * this.timeline._tDur) / r, 0, 1), this
                                    );
                                }
                                var n,
                                    i,
                                    o,
                                    s,
                                    a,
                                    u,
                                    l,
                                    h = this._targets,
                                    c = t ? te(t) : h,
                                    f = this._ptLookup,
                                    p = this._pt;
                                if (
                                    (!e || "all" === e) &&
                                    (function (t, e) {
                                        for (var r = t.length, n = r === e.length; n && r-- && t[r] === e[r]; );
                                        return r < 0;
                                    })(h, c)
                                )
                                    return "all" === e && (this._pt = 0), ce(this);
                                for (
                                    n = this._op = this._op || [],
                                        "all" !== e &&
                                            (P(e) &&
                                                ((a = {}),
                                                pt(e, function (t) {
                                                    return (a[t] = 1);
                                                }),
                                                (e = a)),
                                            (e = (function (t, e) {
                                                var r,
                                                    n,
                                                    i,
                                                    o,
                                                    s = t[0] ? ct(t[0]).harness : 0,
                                                    a = s && s.aliases;
                                                if (!a) return e;
                                                for (n in ((r = wt({}, e)), a)) if ((n in r)) for (i = (o = a[n].split(",")).length; i--; ) r[o[i]] = r[n];
                                                return r;
                                            })(h, e))),
                                        l = h.length;
                                    l--;

                                )
                                    if (~c.indexOf(h[l]))
                                        for (a in ((i = f[l]), "all" === e ? ((n[l] = e), (s = i), (o = {})) : ((o = n[l] = n[l] || {}), (s = e)), s))
                                            (u = i && i[a]) && (("kill" in u.d && !0 !== u.d.kill(a)) || Tt(this, u, "_pt"), delete i[a]), "all" !== o && (o[a] = 1);
                                return this._initted && !this._pt && p && ce(this), this;
                            }),
                            (e.to = function (t, r) {
                                return new e(t, r, arguments[2]);
                            }),
                            (e.from = function (t, e) {
                                return Wt(1, arguments);
                            }),
                            (e.delayedCall = function (t, r, n, i) {
                                return new e(r, 0, { immediateRender: !1, lazy: !1, overwrite: !1, delay: t, onComplete: r, onReverseComplete: r, onCompleteParams: n, onReverseCompleteParams: n, callbackScope: i });
                            }),
                            (e.fromTo = function (t, e, r) {
                                return Wt(2, arguments);
                            }),
                            (e.set = function (t, r) {
                                return (r.duration = 0), r.repeatDelay || (r.repeat = 0), new e(t, r);
                            }),
                            (e.killTweensOf = function (t, e, r) {
                                return d.killTweensOf(t, e, r);
                            }),
                            e
                        );
                    })(Le);
                bt(Ge.prototype, { _targets: [], _lazy: 0, _startAt: 0, _op: 0, _onInit: 0 }),
                    pt("staggerTo,staggerFrom,staggerFromTo", function (t) {
                        Ge[t] = function () {
                            var e = new je(),
                                r = Kt.call(arguments, 0);
                            return r.splice("staggerFromTo" === t ? 5 : 4, 0, 0), e[t].apply(e, r);
                        };
                    });
                var We = function (t, e, r) {
                        return (t[e] = r);
                    },
                    He = function (t, e, r) {
                        return t[e](r);
                    },
                    $e = function (t, e, r, n) {
                        return t[e](n.fp, r);
                    },
                    Ze = function (t, e, r) {
                        return t.setAttribute(e, r);
                    },
                    Ke = function (t, e) {
                        return k(t[e]) ? He : B(t[e]) && t.setAttribute ? Ze : We;
                    },
                    Qe = function (t, e) {
                        return e.set(e.t, e.p, Math.round(1e6 * (e.s + e.c * t)) / 1e6, e);
                    },
                    Je = function (t, e) {
                        return e.set(e.t, e.p, !!(e.s + e.c * t), e);
                    },
                    tr = function (t, e) {
                        var r = e._pt,
                            n = "";
                        if (!t && e.b) n = e.b;
                        else if (1 === t && e.e) n = e.e;
                        else {
                            for (; r; ) (n = r.p + (r.m ? r.m(r.s + r.c * t) : Math.round(1e4 * (r.s + r.c * t)) / 1e4) + n), (r = r._next);
                            n += e.c;
                        }
                        e.set(e.t, e.p, n, e);
                    },
                    er = function (t, e) {
                        for (var r = e._pt; r; ) r.r(t, r.d), (r = r._next);
                    },
                    rr = function (t, e, r, n) {
                        for (var i, o = this._pt; o; ) (i = o._next), o.p === n && o.modifier(t, e, r), (o = i);
                    },
                    nr = function (t) {
                        for (var e, r, n = this._pt; n; ) (r = n._next), (n.p === t && !n.op) || n.op === t ? Tt(this, n, "_pt") : n.dep || (e = 1), (n = r);
                        return !e;
                    },
                    ir = function (t, e, r, n) {
                        n.mSet(t, e, n.m.call(n.tween, r, n.mt), n);
                    },
                    or = function (t) {
                        for (var e, r, n, i, o = t._pt; o; ) {
                            for (e = o._next, r = n; r && r.pr > o.pr; ) r = r._next;
                            (o._prev = r ? r._prev : i) ? (o._prev._next = o) : (n = o), (o._next = r) ? (r._prev = o) : (i = o), (o = e);
                        }
                        t._pt = n;
                    },
                    sr = (function () {
                        function t(t, e, r, n, i, o, s, a, u) {
                            (this.t = e), (this.s = n), (this.c = i), (this.p = r), (this.r = o || Qe), (this.d = s || this), (this.set = a || We), (this.pr = u || 0), (this._next = t), t && (t._prev = this);
                        }
                        return (
                            (t.prototype.modifier = function (t, e, r) {
                                (this.mSet = this.mSet || this.set), (this.set = ir), (this.m = t), (this.mt = r), (this.tween = e);
                            }),
                            t
                        );
                    })();
                pt(
                    lt +
                        "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger",
                    function (t) {
                        return (rt[t] = 1);
                    }
                ),
                    ($.TweenMax = $.TweenLite = Ge),
                    ($.TimelineLite = $.TimelineMax = je),
                    (d = new je({ sortChildren: !1, defaults: w, autoRemoveChildren: !0, id: "root", smoothChildTiming: !0 })),
                    (x.stringFilter = be);
                var ar = {
                    registerPlugin: function () {
                        for (var t = arguments.length, e = new Array(t), r = 0; r < t; r++) e[r] = arguments[r];
                        e.forEach(function (t) {
                            return fe(t);
                        });
                    },
                    timeline: function (t) {
                        return new je(t);
                    },
                    getTweensOf: function (t, e) {
                        return d.getTweensOf(t, e);
                    },
                    getProperty: function (t, e, r, n) {
                        P(t) && (t = te(t)[0]);
                        var i = ct(t || {}).get,
                            o = r ? _t : Dt;
                        return (
                            "native" === r && (r = ""),
                            t
                                ? e
                                    ? o(((ot[e] && ot[e].get) || i)(t, e, r, n))
                                    : function (e, r, n) {
                                          return o(((ot[e] && ot[e].get) || i)(t, e, r, n));
                                      }
                                : t
                        );
                    },
                    quickSetter: function (t, e, r) {
                        if ((t = te(t)).length > 1) {
                            var n = t.map(function (t) {
                                    return hr.quickSetter(t, e, r);
                                }),
                                i = n.length;
                            return function (t) {
                                for (var e = i; e--; ) n[e](t);
                            };
                        }
                        t = t[0] || {};
                        var o = ot[e],
                            s = ct(t),
                            a = (s.harness && (s.harness.aliases || {})[e]) || e,
                            u = o
                                ? function (e) {
                                      var n = new o();
                                      (_._pt = 0), n.init(t, r ? e + r : e, _, 0, [t]), n.render(1, n), _._pt && er(1, _);
                                  }
                                : s.set(t, a);
                        return o
                            ? u
                            : function (e) {
                                  return u(t, a, r ? e + r : e, s, 1);
                              };
                    },
                    isTweening: function (t) {
                        return d.getTweensOf(t, !0).length > 0;
                    },
                    defaults: function (t) {
                        return t && t.ease && (t.ease = Oe(t.ease, w.ease)), Et(w, t || {});
                    },
                    config: function (t) {
                        return Et(x, t || {});
                    },
                    registerEffect: function (t) {
                        var e = t.name,
                            r = t.effect,
                            n = t.plugins,
                            i = t.defaults,
                            o = t.extendTimeline;
                        (n || "").split(",").forEach(function (t) {
                            return t && !ot[t] && !$[t] && J(e + " effect requires " + t + " plugin.");
                        }),
                            (st[e] = function (t, e, n) {
                                return r(te(t), bt(e || {}, i), n);
                            }),
                            o &&
                                (je.prototype[e] = function (t, r, n) {
                                    return this.add(st[e](t, L(r) ? r : (n = r) && {}, this), n);
                                });
                    },
                    registerEase: function (t, e) {
                        Ee[t] = Oe(e);
                    },
                    parseEase: function (t, e) {
                        return arguments.length ? Oe(t, e) : Ee;
                    },
                    getById: function (t) {
                        return d.getById(t);
                    },
                    exportRoot: function (t, e) {
                        void 0 === t && (t = {});
                        var r,
                            n,
                            i = new je(t);
                        for (i.smoothChildTiming = j(t.smoothChildTiming), d.remove(i), i._dp = 0, i._time = i._tTime = d._time, r = d._first; r; )
                            (n = r._next), (!e && !r._dur && r instanceof Ge && r.vars.onComplete === r._targets[0]) || Nt(i, r, r._start - r._delay), (r = n);
                        return Nt(d, i, 0), i;
                    },
                    utils: {
                        wrap: function t(e, r, n) {
                            var i = r - e;
                            return U(e)
                                ? se(e, t(0, e.length), r)
                                : Ht(n, function (t) {
                                      return ((i + ((t - e) % i)) % i) + e;
                                  });
                        },
                        wrapYoyo: function t(e, r, n) {
                            var i = r - e,
                                o = 2 * i;
                            return U(e)
                                ? se(e, t(0, e.length - 1), r)
                                : Ht(n, function (t) {
                                      return e + ((t = (o + ((t - e) % o)) % o || 0) > i ? o - t : t);
                                  });
                        },
                        distribute: re,
                        random: oe,
                        snap: ie,
                        normalize: function (t, e, r) {
                            return ue(t, e, 0, 1, r);
                        },
                        getUnit: Zt,
                        clamp: function (t, e, r) {
                            return Ht(r, function (r) {
                                return $t(t, e, r);
                            });
                        },
                        splitColor: me,
                        toArray: te,
                        selector: function (t) {
                            return (
                                (t = te(t)[0] || J("Invalid scope") || {}),
                                function (e) {
                                    var r = t.current || t.nativeElement || t;
                                    return te(e, r.querySelectorAll ? r : r === t ? J("Invalid scope") || y.createElement("div") : t);
                                }
                            );
                        },
                        mapRange: ue,
                        pipe: function () {
                            for (var t = arguments.length, e = new Array(t), r = 0; r < t; r++) e[r] = arguments[r];
                            return function (t) {
                                return e.reduce(function (t, e) {
                                    return e(t);
                                }, t);
                            };
                        },
                        unitize: function (t, e) {
                            return function (r) {
                                return t(parseFloat(r)) + (e || Zt(r));
                            };
                        },
                        interpolate: function t(e, r, n, i) {
                            var o = isNaN(e + r)
                                ? 0
                                : function (t) {
                                      return (1 - t) * e + t * r;
                                  };
                            if (!o) {
                                var s,
                                    a,
                                    u,
                                    l,
                                    h,
                                    c = P(e),
                                    f = {};
                                if ((!0 === n && (i = 1) && (n = null), c)) (e = { p: e }), (r = { p: r });
                                else if (U(e) && !U(r)) {
                                    for (u = [], l = e.length, h = l - 2, a = 1; a < l; a++) u.push(t(e[a - 1], e[a]));
                                    l--,
                                        (o = function (t) {
                                            t *= l;
                                            var e = Math.min(h, ~~t);
                                            return u[e](t - e);
                                        }),
                                        (n = r);
                                } else i || (e = wt(U(e) ? [] : {}, e));
                                if (!u) {
                                    for (s in r) Ie.call(f, e, s, "get", r[s]);
                                    o = function (t) {
                                        return er(t, f) || (c ? e.p : e);
                                    };
                                }
                            }
                            return Ht(n, o);
                        },
                        shuffle: ee,
                    },
                    install: K,
                    effects: st,
                    ticker: xe,
                    updateRoot: je.updateRoot,
                    plugins: ot,
                    globalTimeline: d,
                    core: {
                        PropTween: sr,
                        globals: tt,
                        Tween: Ge,
                        Timeline: je,
                        Animation: Le,
                        getCache: ct,
                        _removeLinkedListItem: Tt,
                        suppressOverwrites: function (t) {
                            return (p = t);
                        },
                    },
                };
                pt("to,from,fromTo,delayedCall,set,killTweensOf", function (t) {
                    return (ar[t] = Ge[t]);
                }),
                    xe.add(je.updateRoot),
                    (_ = ar.to({}, { duration: 0 }));
                var ur = function (t, e) {
                        for (var r = t._pt; r && r.p !== e && r.op !== e && r.fp !== e; ) r = r._next;
                        return r;
                    },
                    lr = function (t, e) {
                        return {
                            name: t,
                            rawVars: 1,
                            init: function (t, r, n) {
                                n._onInit = function (t) {
                                    var n, i;
                                    if (
                                        (P(r) &&
                                            ((n = {}),
                                            pt(r, function (t) {
                                                return (n[t] = 1);
                                            }),
                                            (r = n)),
                                        e)
                                    ) {
                                        for (i in ((n = {}), r)) n[i] = e(r[i]);
                                        r = n;
                                    }
                                    !(function (t, e) {
                                        var r,
                                            n,
                                            i,
                                            o = t._targets;
                                        for (r in e) for (n = o.length; n--; ) (i = t._ptLookup[n][r]) && (i = i.d) && (i._pt && (i = ur(i, r)), i && i.modifier && i.modifier(e[r], t, o[n], r));
                                    })(t, r);
                                };
                            },
                        };
                    },
                    hr =
                        ar.registerPlugin(
                            {
                                name: "attr",
                                init: function (t, e, r, n, i) {
                                    var o, s;
                                    for (o in e) (s = this.add(t, "setAttribute", (t.getAttribute(o) || 0) + "", e[o], n, i, 0, 0, o)) && (s.op = o), this._props.push(o);
                                },
                            },
                            {
                                name: "endArray",
                                init: function (t, e) {
                                    for (var r = e.length; r--; ) this.add(t, r, t[r] || 0, e[r]);
                                },
                            },
                            lr("roundProps", ne),
                            lr("modifiers"),
                            lr("snap", ie)
                        ) || ar;
                (Ge.version = je.version = hr.version = "3.8.0"), (v = 1), N() && we();
                Ee.Power0, Ee.Power1, Ee.Power2, Ee.Power3, Ee.Power4, Ee.Linear, Ee.Quad, Ee.Cubic, Ee.Quart, Ee.Quint, Ee.Strong, Ee.Elastic, Ee.Back, Ee.SteppedEase, Ee.Bounce, Ee.Sine, Ee.Expo, Ee.Circ;
                var cr,
                    fr,
                    pr,
                    dr,
                    gr,
                    mr,
                    yr,
                    vr = {},
                    Dr = 180 / Math.PI,
                    _r = Math.PI / 180,
                    br = Math.atan2,
                    xr = /([A-Z])/g,
                    wr = /(?:left|right|width|margin|padding|x)/i,
                    Er = /[\s,\(]\S/,
                    Cr = { autoAlpha: "opacity,visibility", scale: "scaleX,scaleY", alpha: "opacity" },
                    Fr = function (t, e) {
                        return e.set(e.t, e.p, Math.round(1e4 * (e.s + e.c * t)) / 1e4 + e.u, e);
                    },
                    Tr = function (t, e) {
                        return e.set(e.t, e.p, 1 === t ? e.e : Math.round(1e4 * (e.s + e.c * t)) / 1e4 + e.u, e);
                    },
                    Ar = function (t, e) {
                        return e.set(e.t, e.p, t ? Math.round(1e4 * (e.s + e.c * t)) / 1e4 + e.u : e.b, e);
                    },
                    Mr = function (t, e) {
                        var r = e.s + e.c * t;
                        e.set(e.t, e.p, ~~(r + (r < 0 ? -0.5 : 0.5)) + e.u, e);
                    },
                    Or = function (t, e) {
                        return e.set(e.t, e.p, t ? e.e : e.b, e);
                    },
                    Sr = function (t, e) {
                        return e.set(e.t, e.p, 1 !== t ? e.b : e.e, e);
                    },
                    Pr = function (t, e, r) {
                        return (t.style[e] = r);
                    },
                    kr = function (t, e, r) {
                        return t.style.setProperty(e, r);
                    },
                    Rr = function (t, e, r) {
                        return (t._gsap[e] = r);
                    },
                    Br = function (t, e, r) {
                        return (t._gsap.scaleX = t._gsap.scaleY = r);
                    },
                    Lr = function (t, e, r, n, i) {
                        var o = t._gsap;
                        (o.scaleX = o.scaleY = r), o.renderTransform(i, o);
                    },
                    jr = function (t, e, r, n, i) {
                        var o = t._gsap;
                        (o[e] = r), o.renderTransform(i, o);
                    },
                    Nr = "transform",
                    zr = Nr + "Origin",
                    Ir = function (t, e) {
                        var r = fr.createElementNS ? fr.createElementNS((e || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), t) : fr.createElement(t);
                        return r.style ? r : fr.createElement(t);
                    },
                    Ur = function t(e, r, n) {
                        var i = getComputedStyle(e);
                        return i[r] || i.getPropertyValue(r.replace(xr, "-$1").toLowerCase()) || i.getPropertyValue(r) || (!n && t(e, Xr(r) || r, 1)) || "";
                    },
                    Yr = "O,Moz,ms,Ms,Webkit".split(","),
                    Xr = function (t, e, r) {
                        var n = (e || gr).style,
                            i = 5;
                        if (t in n && !r) return t;
                        for (t = t.charAt(0).toUpperCase() + t.substr(1); i-- && !(Yr[i] + t in n); );
                        return i < 0 ? null : (3 === i ? "ms" : i >= 0 ? Yr[i] : "") + t;
                    },
                    qr = function () {
                        "undefined" != typeof window &&
                            window.document &&
                            ((cr = window),
                            (fr = cr.document),
                            (pr = fr.documentElement),
                            (gr = Ir("div") || { style: {} }),
                            Ir("div"),
                            (Nr = Xr(Nr)),
                            (zr = Nr + "Origin"),
                            (gr.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0"),
                            (yr = !!Xr("perspective")),
                            (dr = 1));
                    },
                    Vr = function t(e) {
                        var r,
                            n = Ir("svg", (this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns")) || "http://www.w3.org/2000/svg"),
                            i = this.parentNode,
                            o = this.nextSibling,
                            s = this.style.cssText;
                        if ((pr.appendChild(n), n.appendChild(this), (this.style.display = "block"), e))
                            try {
                                (r = this.getBBox()), (this._gsapBBox = this.getBBox), (this.getBBox = t);
                            } catch (t) {}
                        else this._gsapBBox && (r = this._gsapBBox());
                        return i && (o ? i.insertBefore(this, o) : i.appendChild(this)), pr.removeChild(n), (this.style.cssText = s), r;
                    },
                    Gr = function (t, e) {
                        for (var r = e.length; r--; ) if (t.hasAttribute(e[r])) return t.getAttribute(e[r]);
                    },
                    Wr = function (t) {
                        var e;
                        try {
                            e = t.getBBox();
                        } catch (r) {
                            e = Vr.call(t, !0);
                        }
                        return (e && (e.width || e.height)) || t.getBBox === Vr || (e = Vr.call(t, !0)), !e || e.width || e.x || e.y ? e : { x: +Gr(t, ["x", "cx", "x1"]) || 0, y: +Gr(t, ["y", "cy", "y1"]) || 0, width: 0, height: 0 };
                    },
                    Hr = function (t) {
                        return !(!t.getCTM || (t.parentNode && !t.ownerSVGElement) || !Wr(t));
                    },
                    $r = function (t, e) {
                        if (e) {
                            var r = t.style;
                            e in vr && e !== zr && (e = Nr), r.removeProperty ? (("ms" !== e.substr(0, 2) && "webkit" !== e.substr(0, 6)) || (e = "-" + e), r.removeProperty(e.replace(xr, "-$1").toLowerCase())) : r.removeAttribute(e);
                        }
                    },
                    Zr = function (t, e, r, n, i, o) {
                        var s = new sr(t._pt, e, r, 0, 1, o ? Sr : Or);
                        return (t._pt = s), (s.b = n), (s.e = i), t._props.push(r), s;
                    },
                    Kr = { deg: 1, rad: 1, turn: 1 },
                    Qr = function t(e, r, n, i) {
                        var o,
                            s,
                            a,
                            u,
                            l = parseFloat(n) || 0,
                            h = (n + "").trim().substr((l + "").length) || "px",
                            c = gr.style,
                            f = wr.test(r),
                            p = "svg" === e.tagName.toLowerCase(),
                            d = (p ? "client" : "offset") + (f ? "Width" : "Height"),
                            g = 100,
                            m = "px" === i,
                            y = "%" === i;
                        return i === h || !l || Kr[i] || Kr[h]
                            ? l
                            : ("px" !== h && !m && (l = t(e, r, n, "px")),
                              (u = e.getCTM && Hr(e)),
                              (!y && "%" !== h) || (!vr[r] && !~r.indexOf("adius"))
                                  ? ((c[f ? "width" : "height"] = g + (m ? h : i)),
                                    (s = ~r.indexOf("adius") || ("em" === i && e.appendChild && !p) ? e : e.parentNode),
                                    u && (s = (e.ownerSVGElement || {}).parentNode),
                                    (s && s !== fr && s.appendChild) || (s = fr.body),
                                    (a = s._gsap) && y && a.width && f && a.time === xe.time
                                        ? dt((l / a.width) * g)
                                        : ((y || "%" === h) && (c.position = Ur(e, "position")),
                                          s === e && (c.position = "static"),
                                          s.appendChild(gr),
                                          (o = gr[d]),
                                          s.removeChild(gr),
                                          (c.position = "absolute"),
                                          f && y && (((a = ct(s)).time = xe.time), (a.width = s[d])),
                                          dt(m ? (o * l) / g : o && l ? (g / o) * l : 0)))
                                  : ((o = u ? e.getBBox()[f ? "width" : "height"] : e[d]), dt(y ? (l / o) * g : (l / 100) * o)));
                    },
                    Jr = function (t, e, r, n) {
                        var i;
                        return (
                            dr || qr(),
                            e in Cr && "transform" !== e && ~(e = Cr[e]).indexOf(",") && (e = e.split(",")[0]),
                            vr[e] && "transform" !== e
                                ? ((i = cn(t, n)), (i = "transformOrigin" !== e ? i[e] : i.svg ? i.origin : fn(Ur(t, zr)) + " " + i.zOrigin + "px"))
                                : (!(i = t.style[e]) || "auto" === i || n || ~(i + "").indexOf("calc(")) && (i = (nn[e] && nn[e](t, e, r)) || Ur(t, e) || ft(t, e) || ("opacity" === e ? 1 : 0)),
                            r && !~(i + "").trim().indexOf(" ") ? Qr(t, e, i, r) + r : i
                        );
                    },
                    tn = function (t, e, r, n) {
                        if (!r || "none" === r) {
                            var i = Xr(e, t, 1),
                                o = i && Ur(t, i, 1);
                            o && o !== r ? ((e = i), (r = o)) : "borderColor" === e && (r = Ur(t, "borderTopColor"));
                        }
                        var s,
                            a,
                            u,
                            l,
                            h,
                            c,
                            f,
                            p,
                            d,
                            g,
                            m,
                            y,
                            v = new sr(this._pt, t.style, e, 0, 1, tr),
                            D = 0,
                            _ = 0;
                        if (((v.b = r), (v.e = n), (r += ""), "auto" === (n += "") && ((t.style[e] = n), (n = Ur(t, e) || n), (t.style[e] = r)), be((s = [r, n])), (n = s[1]), (u = (r = s[0]).match(q) || []), (n.match(q) || []).length)) {
                            for (; (a = q.exec(n)); )
                                (f = a[0]),
                                    (d = n.substring(D, a.index)),
                                    h ? (h = (h + 1) % 5) : ("rgba(" !== d.substr(-5) && "hsla(" !== d.substr(-5)) || (h = 1),
                                    f !== (c = u[_++] || "") &&
                                        ((l = parseFloat(c) || 0),
                                        (m = c.substr((l + "").length)),
                                        (y = "=" === f.charAt(1) ? +(f.charAt(0) + "1") : 0) && (f = f.substr(2)),
                                        (p = parseFloat(f)),
                                        (g = f.substr((p + "").length)),
                                        (D = q.lastIndex - g.length),
                                        g || ((g = g || x.units[e] || m), D === n.length && ((n += g), (v.e += g))),
                                        m !== g && (l = Qr(t, e, c, g) || 0),
                                        (v._pt = { _next: v._pt, p: d || 1 === _ ? d : ",", s: l, c: y ? y * p : p - l, m: (h && h < 4) || "zIndex" === e ? Math.round : 0 }));
                            v.c = D < n.length ? n.substring(D, n.length) : "";
                        } else v.r = "display" === e && "none" === n ? Sr : Or;
                        return G.test(n) && (v.e = 0), (this._pt = v), v;
                    },
                    en = { top: "0%", bottom: "100%", left: "0%", right: "100%", center: "50%" },
                    rn = function (t, e) {
                        if (e.tween && e.tween._time === e.tween._dur) {
                            var r,
                                n,
                                i,
                                o = e.t,
                                s = o.style,
                                a = e.u,
                                u = o._gsap;
                            if ("all" === a || !0 === a) (s.cssText = ""), (n = 1);
                            else for (i = (a = a.split(",")).length; --i > -1; ) (r = a[i]), vr[r] && ((n = 1), (r = "transformOrigin" === r ? zr : Nr)), $r(o, r);
                            n && ($r(o, Nr), u && (u.svg && o.removeAttribute("transform"), cn(o, 1), (u.uncache = 1)));
                        }
                    },
                    nn = {
                        clearProps: function (t, e, r, n, i) {
                            if ("isFromStart" !== i.data) {
                                var o = (t._pt = new sr(t._pt, e, r, 0, 0, rn));
                                return (o.u = n), (o.pr = -10), (o.tween = i), t._props.push(r), 1;
                            }
                        },
                    },
                    on = [1, 0, 0, 1, 0, 0],
                    sn = {},
                    an = function (t) {
                        return "matrix(1, 0, 0, 1, 0, 0)" === t || "none" === t || !t;
                    },
                    un = function (t) {
                        var e = Ur(t, Nr);
                        return an(e) ? on : e.substr(7).match(X).map(dt);
                    },
                    ln = function (t, e) {
                        var r,
                            n,
                            i,
                            o,
                            s = t._gsap || ct(t),
                            a = t.style,
                            u = un(t);
                        return s.svg && t.getAttribute("transform")
                            ? "1,0,0,1,0,0" === (u = [(i = t.transform.baseVal.consolidate().matrix).a, i.b, i.c, i.d, i.e, i.f]).join(",")
                                ? on
                                : u
                            : (u !== on ||
                                  t.offsetParent ||
                                  t === pr ||
                                  s.svg ||
                                  ((i = a.display),
                                  (a.display = "block"),
                                  ((r = t.parentNode) && t.offsetParent) || ((o = 1), (n = t.nextSibling), pr.appendChild(t)),
                                  (u = un(t)),
                                  i ? (a.display = i) : $r(t, "display"),
                                  o && (n ? r.insertBefore(t, n) : r ? r.appendChild(t) : pr.removeChild(t))),
                              e && u.length > 6 ? [u[0], u[1], u[4], u[5], u[12], u[13]] : u);
                    },
                    hn = function (t, e, r, n, i, o) {
                        var s,
                            a,
                            u,
                            l = t._gsap,
                            h = i || ln(t, !0),
                            c = l.xOrigin || 0,
                            f = l.yOrigin || 0,
                            p = l.xOffset || 0,
                            d = l.yOffset || 0,
                            g = h[0],
                            m = h[1],
                            y = h[2],
                            v = h[3],
                            D = h[4],
                            _ = h[5],
                            b = e.split(" "),
                            x = parseFloat(b[0]) || 0,
                            w = parseFloat(b[1]) || 0;
                        r
                            ? h !== on && (a = g * v - m * y) && ((u = x * (-m / a) + w * (g / a) - (g * _ - m * D) / a), (x = x * (v / a) + w * (-y / a) + (y * _ - v * D) / a), (w = u))
                            : ((x = (s = Wr(t)).x + (~b[0].indexOf("%") ? (x / 100) * s.width : x)), (w = s.y + (~(b[1] || b[0]).indexOf("%") ? (w / 100) * s.height : w))),
                            n || (!1 !== n && l.smooth) ? ((D = x - c), (_ = w - f), (l.xOffset = p + (D * g + _ * y) - D), (l.yOffset = d + (D * m + _ * v) - _)) : (l.xOffset = l.yOffset = 0),
                            (l.xOrigin = x),
                            (l.yOrigin = w),
                            (l.smooth = !!n),
                            (l.origin = e),
                            (l.originIsAbsolute = !!r),
                            (t.style[zr] = "0px 0px"),
                            o && (Zr(o, l, "xOrigin", c, x), Zr(o, l, "yOrigin", f, w), Zr(o, l, "xOffset", p, l.xOffset), Zr(o, l, "yOffset", d, l.yOffset)),
                            t.setAttribute("data-svg-origin", x + " " + w);
                    },
                    cn = function (t, e) {
                        var r = t._gsap || new Be(t);
                        if ("x" in r && !e && !r.uncache) return r;
                        var n,
                            i,
                            o,
                            s,
                            a,
                            u,
                            l,
                            h,
                            c,
                            f,
                            p,
                            d,
                            g,
                            m,
                            y,
                            v,
                            D,
                            _,
                            b,
                            w,
                            E,
                            C,
                            F,
                            T,
                            A,
                            M,
                            O,
                            S,
                            P,
                            k,
                            R,
                            B,
                            L = t.style,
                            j = r.scaleX < 0,
                            N = "px",
                            z = "deg",
                            I = Ur(t, zr) || "0";
                        return (
                            (n = i = o = u = l = h = c = f = p = 0),
                            (s = a = 1),
                            (r.svg = !(!t.getCTM || !Hr(t))),
                            (m = ln(t, r.svg)),
                            r.svg && ((T = (!r.uncache || "0px 0px" === I) && !e && t.getAttribute("data-svg-origin")), hn(t, T || I, !!T || r.originIsAbsolute, !1 !== r.smooth, m)),
                            (d = r.xOrigin || 0),
                            (g = r.yOrigin || 0),
                            m !== on &&
                                ((_ = m[0]),
                                (b = m[1]),
                                (w = m[2]),
                                (E = m[3]),
                                (n = C = m[4]),
                                (i = F = m[5]),
                                6 === m.length
                                    ? ((s = Math.sqrt(_ * _ + b * b)),
                                      (a = Math.sqrt(E * E + w * w)),
                                      (u = _ || b ? br(b, _) * Dr : 0),
                                      (c = w || E ? br(w, E) * Dr + u : 0) && (a *= Math.abs(Math.cos(c * _r))),
                                      r.svg && ((n -= d - (d * _ + g * w)), (i -= g - (d * b + g * E))))
                                    : ((B = m[6]),
                                      (k = m[7]),
                                      (O = m[8]),
                                      (S = m[9]),
                                      (P = m[10]),
                                      (R = m[11]),
                                      (n = m[12]),
                                      (i = m[13]),
                                      (o = m[14]),
                                      (l = (y = br(B, P)) * Dr),
                                      y &&
                                          ((T = C * (v = Math.cos(-y)) + O * (D = Math.sin(-y))),
                                          (A = F * v + S * D),
                                          (M = B * v + P * D),
                                          (O = C * -D + O * v),
                                          (S = F * -D + S * v),
                                          (P = B * -D + P * v),
                                          (R = k * -D + R * v),
                                          (C = T),
                                          (F = A),
                                          (B = M)),
                                      (h = (y = br(-w, P)) * Dr),
                                      y && ((v = Math.cos(-y)), (R = E * (D = Math.sin(-y)) + R * v), (_ = T = _ * v - O * D), (b = A = b * v - S * D), (w = M = w * v - P * D)),
                                      (u = (y = br(b, _)) * Dr),
                                      y && ((T = _ * (v = Math.cos(y)) + b * (D = Math.sin(y))), (A = C * v + F * D), (b = b * v - _ * D), (F = F * v - C * D), (_ = T), (C = A)),
                                      l && Math.abs(l) + Math.abs(u) > 359.9 && ((l = u = 0), (h = 180 - h)),
                                      (s = dt(Math.sqrt(_ * _ + b * b + w * w))),
                                      (a = dt(Math.sqrt(F * F + B * B))),
                                      (y = br(C, F)),
                                      (c = Math.abs(y) > 2e-4 ? y * Dr : 0),
                                      (p = R ? 1 / (R < 0 ? -R : R) : 0)),
                                r.svg && ((T = t.getAttribute("transform")), (r.forceCSS = t.setAttribute("transform", "") || !an(Ur(t, Nr))), T && t.setAttribute("transform", T))),
                            Math.abs(c) > 90 && Math.abs(c) < 270 && (j ? ((s *= -1), (c += u <= 0 ? 180 : -180), (u += u <= 0 ? 180 : -180)) : ((a *= -1), (c += c <= 0 ? 180 : -180))),
                            (r.x = n - ((r.xPercent = n && (r.xPercent || (Math.round(t.offsetWidth / 2) === Math.round(-n) ? -50 : 0))) ? (t.offsetWidth * r.xPercent) / 100 : 0) + N),
                            (r.y = i - ((r.yPercent = i && (r.yPercent || (Math.round(t.offsetHeight / 2) === Math.round(-i) ? -50 : 0))) ? (t.offsetHeight * r.yPercent) / 100 : 0) + N),
                            (r.z = o + N),
                            (r.scaleX = dt(s)),
                            (r.scaleY = dt(a)),
                            (r.rotation = dt(u) + z),
                            (r.rotationX = dt(l) + z),
                            (r.rotationY = dt(h) + z),
                            (r.skewX = c + z),
                            (r.skewY = f + z),
                            (r.transformPerspective = p + N),
                            (r.zOrigin = parseFloat(I.split(" ")[2]) || 0) && (L[zr] = fn(I)),
                            (r.xOffset = r.yOffset = 0),
                            (r.force3D = x.force3D),
                            (r.renderTransform = r.svg ? Dn : yr ? vn : dn),
                            (r.uncache = 0),
                            r
                        );
                    },
                    fn = function (t) {
                        return (t = t.split(" "))[0] + " " + t[1];
                    },
                    pn = function (t, e, r) {
                        var n = Zt(e);
                        return dt(parseFloat(e) + parseFloat(Qr(t, "x", r + "px", n))) + n;
                    },
                    dn = function (t, e) {
                        (e.z = "0px"), (e.rotationY = e.rotationX = "0deg"), (e.force3D = 0), vn(t, e);
                    },
                    gn = "0deg",
                    mn = "0px",
                    yn = ") ",
                    vn = function (t, e) {
                        var r = e || this,
                            n = r.xPercent,
                            i = r.yPercent,
                            o = r.x,
                            s = r.y,
                            a = r.z,
                            u = r.rotation,
                            l = r.rotationY,
                            h = r.rotationX,
                            c = r.skewX,
                            f = r.skewY,
                            p = r.scaleX,
                            d = r.scaleY,
                            g = r.transformPerspective,
                            m = r.force3D,
                            y = r.target,
                            v = r.zOrigin,
                            D = "",
                            _ = ("auto" === m && t && 1 !== t) || !0 === m;
                        if (v && (h !== gn || l !== gn)) {
                            var b,
                                x = parseFloat(l) * _r,
                                w = Math.sin(x),
                                E = Math.cos(x);
                            (x = parseFloat(h) * _r), (b = Math.cos(x)), (o = pn(y, o, w * b * -v)), (s = pn(y, s, -Math.sin(x) * -v)), (a = pn(y, a, E * b * -v + v));
                        }
                        g !== mn && (D += "perspective(" + g + yn),
                            (n || i) && (D += "translate(" + n + "%, " + i + "%) "),
                            (_ || o !== mn || s !== mn || a !== mn) && (D += a !== mn || _ ? "translate3d(" + o + ", " + s + ", " + a + ") " : "translate(" + o + ", " + s + yn),
                            u !== gn && (D += "rotate(" + u + yn),
                            l !== gn && (D += "rotateY(" + l + yn),
                            h !== gn && (D += "rotateX(" + h + yn),
                            (c === gn && f === gn) || (D += "skew(" + c + ", " + f + yn),
                            (1 === p && 1 === d) || (D += "scale(" + p + ", " + d + yn),
                            (y.style[Nr] = D || "translate(0, 0)");
                    },
                    Dn = function (t, e) {
                        var r,
                            n,
                            i,
                            o,
                            s,
                            a = e || this,
                            u = a.xPercent,
                            l = a.yPercent,
                            h = a.x,
                            c = a.y,
                            f = a.rotation,
                            p = a.skewX,
                            d = a.skewY,
                            g = a.scaleX,
                            m = a.scaleY,
                            y = a.target,
                            v = a.xOrigin,
                            D = a.yOrigin,
                            _ = a.xOffset,
                            b = a.yOffset,
                            x = a.forceCSS,
                            w = parseFloat(h),
                            E = parseFloat(c);
                        (f = parseFloat(f)),
                            (p = parseFloat(p)),
                            (d = parseFloat(d)) && ((p += d = parseFloat(d)), (f += d)),
                            f || p
                                ? ((f *= _r),
                                  (p *= _r),
                                  (r = Math.cos(f) * g),
                                  (n = Math.sin(f) * g),
                                  (i = Math.sin(f - p) * -m),
                                  (o = Math.cos(f - p) * m),
                                  p && ((d *= _r), (s = Math.tan(p - d)), (i *= s = Math.sqrt(1 + s * s)), (o *= s), d && ((s = Math.tan(d)), (r *= s = Math.sqrt(1 + s * s)), (n *= s))),
                                  (r = dt(r)),
                                  (n = dt(n)),
                                  (i = dt(i)),
                                  (o = dt(o)))
                                : ((r = g), (o = m), (n = i = 0)),
                            ((w && !~(h + "").indexOf("px")) || (E && !~(c + "").indexOf("px"))) && ((w = Qr(y, "x", h, "px")), (E = Qr(y, "y", c, "px"))),
                            (v || D || _ || b) && ((w = dt(w + v - (v * r + D * i) + _)), (E = dt(E + D - (v * n + D * o) + b))),
                            (u || l) && ((s = y.getBBox()), (w = dt(w + (u / 100) * s.width)), (E = dt(E + (l / 100) * s.height))),
                            (s = "matrix(" + r + "," + n + "," + i + "," + o + "," + w + "," + E + ")"),
                            y.setAttribute("transform", s),
                            x && (y.style[Nr] = s);
                    },
                    _n = function (t, e, r, n, i, o) {
                        var s,
                            a,
                            u = 360,
                            l = P(i),
                            h = parseFloat(i) * (l && ~i.indexOf("rad") ? Dr : 1),
                            c = o ? h * o : h - n,
                            f = n + c + "deg";
                        return (
                            l &&
                                ("short" === (s = i.split("_")[1]) && (c %= u) !== c % 180 && (c += c < 0 ? u : -360),
                                "cw" === s && c < 0 ? (c = ((c + 36e9) % u) - ~~(c / u) * u) : "ccw" === s && c > 0 && (c = ((c - 36e9) % u) - ~~(c / u) * u)),
                            (t._pt = a = new sr(t._pt, e, r, n, c, Tr)),
                            (a.e = f),
                            (a.u = "deg"),
                            t._props.push(r),
                            a
                        );
                    },
                    bn = function (t, e) {
                        for (var r in e) t[r] = e[r];
                        return t;
                    },
                    xn = function (t, e, r) {
                        var n,
                            i,
                            o,
                            s,
                            a,
                            u,
                            l,
                            h = bn({}, r._gsap),
                            c = r.style;
                        for (i in (h.svg
                            ? ((o = r.getAttribute("transform")), r.setAttribute("transform", ""), (c[Nr] = e), (n = cn(r, 1)), $r(r, Nr), r.setAttribute("transform", o))
                            : ((o = getComputedStyle(r)[Nr]), (c[Nr] = e), (n = cn(r, 1)), (c[Nr] = o)),
                        vr))
                            (o = h[i]) !== (s = n[i]) &&
                                "perspective,force3D,transformOrigin,svgOrigin".indexOf(i) < 0 &&
                                ((a = Zt(o) !== (l = Zt(s)) ? Qr(r, i, o, l) : parseFloat(o)), (u = parseFloat(s)), (t._pt = new sr(t._pt, n, i, a, u - a, Fr)), (t._pt.u = l || 0), t._props.push(i));
                        bn(n, h);
                    };
                pt("padding,margin,Width,Radius", function (t, e) {
                    var r = "Top",
                        n = "Right",
                        i = "Bottom",
                        o = "Left",
                        s = (e < 3 ? [r, n, i, o] : [r + o, r + n, i + n, i + o]).map(function (r) {
                            return e < 2 ? t + r : "border" + r + t;
                        });
                    nn[e > 1 ? "border" + t : t] = function (t, e, r, n, i) {
                        var o, a;
                        if (arguments.length < 4)
                            return (
                                (o = s.map(function (e) {
                                    return Jr(t, e, r);
                                })),
                                5 === (a = o.join(" ")).split(o[0]).length ? o[0] : a
                            );
                        (o = (n + "").split(" ")),
                            (a = {}),
                            s.forEach(function (t, e) {
                                return (a[t] = o[e] = o[e] || o[((e - 1) / 2) | 0]);
                            }),
                            t.init(e, a, i);
                    };
                });
                var wn,
                    En,
                    Cn,
                    Fn = {
                        name: "css",
                        register: qr,
                        targetTest: function (t) {
                            return t.style && t.nodeType;
                        },
                        init: function (t, e, r, n, i) {
                            var o,
                                s,
                                a,
                                u,
                                l,
                                h,
                                c,
                                f,
                                p,
                                d,
                                g,
                                m,
                                y,
                                v,
                                D,
                                _,
                                b,
                                w,
                                E,
                                C = this._props,
                                F = t.style,
                                T = r.vars.startAt;
                            for (c in (dr || qr(), e))
                                if ("autoRound" !== c && ((s = e[c]), !ot[c] || !Ue(c, e, r, n, t, i)))
                                    if (((l = typeof s), (h = nn[c]), "function" === l && (l = typeof (s = s.call(r, n, t, i))), "string" === l && ~s.indexOf("random(") && (s = ae(s)), h)) h(this, t, c, s, r) && (D = 1);
                                    else if ("--" === c.substr(0, 2))
                                        (o = (getComputedStyle(t).getPropertyValue(c) + "").trim()),
                                            (s += ""),
                                            (De.lastIndex = 0),
                                            De.test(o) || ((f = Zt(o)), (p = Zt(s))),
                                            p ? f !== p && (o = Qr(t, c, o, p) + p) : f && (s += f),
                                            this.add(F, "setProperty", o, s, n, i, 0, 0, c),
                                            C.push(c);
                                    else if ("undefined" !== l) {
                                        if (
                                            (T && c in T
                                                ? ((o = "function" == typeof T[c] ? T[c].call(r, n, t, i) : T[c]),
                                                  c in x.units && !Zt(o) && (o += x.units[c]),
                                                  P(o) && ~o.indexOf("random(") && (o = ae(o)),
                                                  "=" === (o + "").charAt(1) && (o = Jr(t, c)))
                                                : (o = Jr(t, c)),
                                            (u = parseFloat(o)),
                                            (d = "string" === l && "=" === s.charAt(1) ? +(s.charAt(0) + "1") : 0) && (s = s.substr(2)),
                                            (a = parseFloat(s)),
                                            c in Cr &&
                                                ("autoAlpha" === c && (1 === u && "hidden" === Jr(t, "visibility") && a && (u = 0), Zr(this, F, "visibility", u ? "inherit" : "hidden", a ? "inherit" : "hidden", !a)),
                                                "scale" !== c && "transform" !== c && ~(c = Cr[c]).indexOf(",") && (c = c.split(",")[0])),
                                            (g = c in vr))
                                        )
                                            if (
                                                (m ||
                                                    (((y = t._gsap).renderTransform && !e.parseTransform) || cn(t, e.parseTransform),
                                                    (v = !1 !== e.smoothOrigin && y.smooth),
                                                    ((m = this._pt = new sr(this._pt, F, Nr, 0, 1, y.renderTransform, y, 0, -1)).dep = 1)),
                                                "scale" === c)
                                            )
                                                (this._pt = new sr(this._pt, y, "scaleY", y.scaleY, (d ? d * a : a - y.scaleY) || 0)), C.push("scaleY", c), (c += "X");
                                            else {
                                                if ("transformOrigin" === c) {
                                                    (b = void 0),
                                                        (w = void 0),
                                                        (E = void 0),
                                                        (b = (_ = s).split(" ")),
                                                        (w = b[0]),
                                                        (E = b[1] || "50%"),
                                                        ("top" !== w && "bottom" !== w && "left" !== E && "right" !== E) || ((_ = w), (w = E), (E = _)),
                                                        (b[0] = en[w] || w),
                                                        (b[1] = en[E] || E),
                                                        (s = b.join(" ")),
                                                        y.svg ? hn(t, s, 0, v, 0, this) : ((p = parseFloat(s.split(" ")[2]) || 0) !== y.zOrigin && Zr(this, y, "zOrigin", y.zOrigin, p), Zr(this, F, c, fn(o), fn(s)));
                                                    continue;
                                                }
                                                if ("svgOrigin" === c) {
                                                    hn(t, s, 1, v, 0, this);
                                                    continue;
                                                }
                                                if (c in sn) {
                                                    _n(this, y, c, u, s, d);
                                                    continue;
                                                }
                                                if ("smoothOrigin" === c) {
                                                    Zr(this, y, "smooth", y.smooth, s);
                                                    continue;
                                                }
                                                if ("force3D" === c) {
                                                    y[c] = s;
                                                    continue;
                                                }
                                                if ("transform" === c) {
                                                    xn(this, s, t);
                                                    continue;
                                                }
                                            }
                                        else c in F || (c = Xr(c) || c);
                                        if (g || ((a || 0 === a) && (u || 0 === u) && !Er.test(s) && c in F))
                                            a || (a = 0),
                                                (f = (o + "").substr((u + "").length)) !== (p = Zt(s) || (c in x.units ? x.units[c] : f)) && (u = Qr(t, c, o, p)),
                                                (this._pt = new sr(this._pt, g ? y : F, c, u, d ? d * a : a - u, g || ("px" !== p && "zIndex" !== c) || !1 === e.autoRound ? Fr : Mr)),
                                                (this._pt.u = p || 0),
                                                f !== p && "%" !== p && ((this._pt.b = o), (this._pt.r = Ar));
                                        else if (c in F) tn.call(this, t, c, o, s);
                                        else {
                                            if (!(c in t)) {
                                                Q(c, s);
                                                continue;
                                            }
                                            this.add(t, c, o || t[c], s, n, i);
                                        }
                                        C.push(c);
                                    }
                            D && or(this);
                        },
                        get: Jr,
                        aliases: Cr,
                        getSetter: function (t, e, r) {
                            var n = Cr[e];
                            return (
                                n && n.indexOf(",") < 0 && (e = n),
                                e in vr && e !== zr && (t._gsap.x || Jr(t, "x")) ? (r && mr === r ? ("scale" === e ? Br : Rr) : (mr = r || {}) && ("scale" === e ? Lr : jr)) : t.style && !B(t.style[e]) ? Pr : ~e.indexOf("-") ? kr : Ke(t, e)
                            );
                        },
                        core: { _removeProperty: $r, _getMatrix: ln },
                    };
                (hr.utils.checkPrefix = Xr),
                    (Cn = pt((wn = "x,y,z,scale,scaleX,scaleY,xPercent,yPercent") + "," + (En = "rotation,rotationX,rotationY,skewX,skewY") + ",transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", function (t) {
                        vr[t] = 1;
                    })),
                    pt(En, function (t) {
                        (x.units[t] = "deg"), (sn[t] = 1);
                    }),
                    (Cr[Cn[13]] = wn + "," + En),
                    pt("0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY", function (t) {
                        var e = t.split(":");
                        Cr[e[1]] = Cn[e[0]];
                    }),
                    pt("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function (t) {
                        x.units[t] = "px";
                    }),
                    hr.registerPlugin(Fn);
                var Tn,
                    An,
                    Mn,
                    On,
                    Sn,
                    Pn,
                    kn,
                    Rn,
                    Bn,
                    Ln,
                    jn,
                    Nn,
                    zn,
                    In,
                    Un,
                    Yn,
                    Xn,
                    qn,
                    Vn,
                    Gn,
                    Wn,
                    Hn,
                    $n,
                    Zn,
                    Kn,
                    Qn,
                    Jn,
                    ti,
                    ei = hr.registerPlugin(Fn) || hr,
                    ri = (ei.core.Tween, 1),
                    ni = [],
                    ii = [],
                    oi = Date.now,
                    si = oi(),
                    ai = 0,
                    ui = 1,
                    li = function (t) {
                        return t;
                    },
                    hi = function (t) {
                        return jn(t)[0] || (_i(t) ? console.warn("Element not found:", t) : null);
                    },
                    ci = function (t) {
                        return Math.round(1e5 * t) / 1e5 || 0;
                    },
                    fi = function () {
                        return "undefined" != typeof window;
                    },
                    pi = function () {
                        return Tn || (fi() && (Tn = window.gsap) && Tn.registerPlugin && Tn);
                    },
                    di = function (t) {
                        return !!~kn.indexOf(t);
                    },
                    gi = function (t, e) {
                        return ~ni.indexOf(t) && ni[ni.indexOf(t) + 1][e];
                    },
                    mi = function (t, e) {
                        var r = e.s,
                            n = e.sc,
                            i = ii.indexOf(t),
                            o = n === Wi.sc ? 1 : 2;
                        return (
                            !~i && (i = ii.push(t) - 1),
                            ii[i + o] ||
                                (ii[i + o] =
                                    gi(t, r) ||
                                    (di(t)
                                        ? n
                                        : function (e) {
                                              return arguments.length ? (t[r] = e) : t[r];
                                          }))
                        );
                    },
                    yi = function (t) {
                        return (
                            gi(t, "getBoundingClientRect") ||
                            (di(t)
                                ? function () {
                                      return (Bo.width = Mn.innerWidth), (Bo.height = Mn.innerHeight), Bo;
                                  }
                                : function () {
                                      return Zi(t);
                                  })
                        );
                    },
                    vi = function (t, e) {
                        var r = e.s,
                            n = e.d2,
                            i = e.d,
                            o = e.a;
                        return (r = "scroll" + n) && (o = gi(t, r)) ? o() - yi(t)()[i] : di(t) ? (Pn[r] || Sn[r]) - (Mn["inner" + n] || Sn["client" + n] || Pn["client" + n]) : t[r] - t["offset" + n];
                    },
                    Di = function (t, e) {
                        for (var r = 0; r < Wn.length; r += 3) (!e || ~e.indexOf(Wn[r + 1])) && t(Wn[r], Wn[r + 1], Wn[r + 2]);
                    },
                    _i = function (t) {
                        return "string" == typeof t;
                    },
                    bi = function (t) {
                        return "function" == typeof t;
                    },
                    xi = function (t) {
                        return "number" == typeof t;
                    },
                    wi = function (t) {
                        return "object" == typeof t;
                    },
                    Ei = function (t) {
                        return bi(t) && t();
                    },
                    Ci = function (t, e) {
                        return function () {
                            var r = Ei(t),
                                n = Ei(e);
                            return function () {
                                Ei(r), Ei(n);
                            };
                        };
                    },
                    Fi = function (t, e, r) {
                        return t && t.progress(e ? 0 : 1) && r && t.pause();
                    },
                    Ti = function (t, e) {
                        var r = e(t);
                        r && r.totalTime && (t.callbackAnimation = r);
                    },
                    Ai = Math.abs,
                    Mi = "scrollLeft",
                    Oi = "scrollTop",
                    Si = "left",
                    Pi = "top",
                    ki = "right",
                    Ri = "bottom",
                    Bi = "width",
                    Li = "height",
                    ji = "Right",
                    Ni = "Left",
                    zi = "Top",
                    Ii = "Bottom",
                    Ui = "padding",
                    Yi = "margin",
                    Xi = "Width",
                    qi = "Height",
                    Vi = "px",
                    Gi = {
                        s: Mi,
                        p: Si,
                        p2: Ni,
                        os: ki,
                        os2: ji,
                        d: Bi,
                        d2: Xi,
                        a: "x",
                        sc: function (t) {
                            return arguments.length ? Mn.scrollTo(t, Wi.sc()) : Mn.pageXOffset || On.scrollLeft || Sn.scrollLeft || Pn.scrollLeft || 0;
                        },
                    },
                    Wi = {
                        s: Oi,
                        p: Pi,
                        p2: zi,
                        os: Ri,
                        os2: Ii,
                        d: Li,
                        d2: qi,
                        a: "y",
                        op: Gi,
                        sc: function (t) {
                            return arguments.length ? Mn.scrollTo(Gi.sc(), t) : Mn.pageYOffset || On.scrollTop || Sn.scrollTop || Pn.scrollTop || 0;
                        },
                    },
                    Hi = function (t) {
                        return Mn.getComputedStyle(t);
                    },
                    $i = function (t, e) {
                        for (var r in e) r in t || (t[r] = e[r]);
                        return t;
                    },
                    Zi = function (t, e) {
                        var r = e && "matrix(1, 0, 0, 1, 0, 0)" !== Hi(t)[Xn] && Tn.to(t, { x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0, rotationX: 0, rotationY: 0, scale: 1, skewX: 0, skewY: 0 }).progress(1),
                            n = t.getBoundingClientRect();
                        return r && r.progress(0).kill(), n;
                    },
                    Ki = function (t, e) {
                        var r = e.d2;
                        return t["offset" + r] || t["client" + r] || 0;
                    },
                    Qi = function (t) {
                        var e,
                            r = [],
                            n = t.labels,
                            i = t.duration();
                        for (e in n) r.push(n[e] / i);
                        return r;
                    },
                    Ji = function (t) {
                        var e = Tn.utils.snap(t),
                            r =
                                Array.isArray(t) &&
                                t.slice(0).sort(function (t, e) {
                                    return t - e;
                                });
                        return r
                            ? function (t, n) {
                                  var i;
                                  if (!n) return e(t);
                                  if (n > 0) {
                                      for (t -= 1e-4, i = 0; i < r.length; i++) if (r[i] >= t) return r[i];
                                      return r[i - 1];
                                  }
                                  for (i = r.length, t += 1e-4; i--; ) if (r[i] <= t) return r[i];
                                  return r[0];
                              }
                            : function (r, n) {
                                  var i = e(r);
                                  return !n || Math.abs(i - r) < 0.001 || i - r < 0 == n < 0 ? i : e(n < 0 ? r - t : r + t);
                              };
                    },
                    to = function (t, e, r, n) {
                        return r.split(",").forEach(function (r) {
                            return t(e, r, n);
                        });
                    },
                    eo = function (t, e, r) {
                        return t.addEventListener(e, r, { passive: !0 });
                    },
                    ro = function (t, e, r) {
                        return t.removeEventListener(e, r);
                    },
                    no = { startColor: "green", endColor: "red", indent: 0, fontSize: "16px", fontWeight: "normal" },
                    io = { toggleActions: "play", anticipatePin: 0 },
                    oo = { top: 0, left: 0, center: 0.5, bottom: 1, right: 1 },
                    so = function (t, e) {
                        if (_i(t)) {
                            var r = t.indexOf("="),
                                n = ~r ? +(t.charAt(r - 1) + 1) * parseFloat(t.substr(r + 1)) : 0;
                            ~r && (t.indexOf("%") > r && (n *= e / 100), (t = t.substr(0, r - 1))), (t = n + (t in oo ? oo[t] * e : ~t.indexOf("%") ? (parseFloat(t) * e) / 100 : parseFloat(t) || 0));
                        }
                        return t;
                    },
                    ao = function (t, e, r, n, i, o, s, a) {
                        var u = i.startColor,
                            l = i.endColor,
                            h = i.fontSize,
                            c = i.indent,
                            f = i.fontWeight,
                            p = On.createElement("div"),
                            d = di(r) || "fixed" === gi(r, "pinType"),
                            g = -1 !== t.indexOf("scroller"),
                            m = d ? Pn : r,
                            y = -1 !== t.indexOf("start"),
                            v = y ? u : l,
                            D =
                                "border-color:" +
                                v +
                                ";font-size:" +
                                h +
                                ";color:" +
                                v +
                                ";font-weight:" +
                                f +
                                ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";
                        return (
                            (D += "position:" + ((g || a) && d ? "fixed;" : "absolute;")),
                            (g || a || !d) && (D += (n === Wi ? ki : Ri) + ":" + (o + parseFloat(c)) + "px;"),
                            s && (D += "box-sizing:border-box;text-align:left;width:" + s.offsetWidth + "px;"),
                            (p._isStart = y),
                            p.setAttribute("class", "gsap-marker-" + t + (e ? " marker-" + e : "")),
                            (p.style.cssText = D),
                            (p.innerText = e || 0 === e ? t + "-" + e : t),
                            m.children[0] ? m.insertBefore(p, m.children[0]) : m.appendChild(p),
                            (p._offset = p["offset" + n.op.d2]),
                            uo(p, 0, n, y),
                            p
                        );
                    },
                    uo = function (t, e, r, n) {
                        var i = { display: "block" },
                            o = r[n ? "os2" : "p2"],
                            s = r[n ? "p2" : "os2"];
                        (t._isFlipped = n), (i[r.a + "Percent"] = n ? -100 : 0), (i[r.a] = n ? "1px" : 0), (i["border" + o + Xi] = 1), (i["border" + s + Xi] = 0), (i[r.p] = e + "px"), Tn.set(t, i);
                    },
                    lo = [],
                    ho = {},
                    co = function () {
                        return oi() - ai > 20 && Ao();
                    },
                    fo = function () {
                        var t = oi();
                        ai !== t ? (Ao(), ai || _o("scrollStart"), (ai = t)) : Ln || (Ln = Bn(Ao));
                    },
                    po = function () {
                        return !Un && !Zn && !On.fullscreenElement && Rn.restart(!0);
                    },
                    go = {},
                    mo = [],
                    yo = [],
                    vo = function (t) {
                        var e,
                            r = Tn.ticker.frame,
                            n = [],
                            i = 0;
                        if (Jn !== r || ri) {
                            for (wo(); i < yo.length; i += 4) (e = Mn.matchMedia(yo[i]).matches) !== yo[i + 3] && ((yo[i + 3] = e), e ? n.push(i) : wo(1, yo[i]) || (bi(yo[i + 2]) && yo[i + 2]()));
                            for (xo(), i = 0; i < n.length; i++) (e = n[i]), (Qn = yo[e]), (yo[e + 2] = yo[e + 1](t));
                            (Qn = 0), An && Co(0, 1), (Jn = r), _o("matchMedia");
                        }
                    },
                    Do = function t() {
                        return ro(Io, "scrollEnd", t) || Co(!0);
                    },
                    _o = function (t) {
                        return (
                            (go[t] &&
                                go[t].map(function (t) {
                                    return t();
                                })) ||
                            mo
                        );
                    },
                    bo = [],
                    xo = function (t) {
                        for (var e = 0; e < bo.length; e += 5) (t && bo[e + 4] !== t) || ((bo[e].style.cssText = bo[e + 1]), bo[e].getBBox && bo[e].setAttribute("transform", bo[e + 2] || ""), (bo[e + 3].uncache = 1));
                    },
                    wo = function (t, e) {
                        var r;
                        for (qn = 0; qn < lo.length; qn++) (r = lo[qn]), (e && r.media !== e) || (t ? r.kill(1) : r.revert());
                        e && xo(e), e || _o("revert");
                    },
                    Eo = function () {
                        return ii.forEach(function (t) {
                            return "function" == typeof t && (t.rec = 0);
                        });
                    },
                    Co = function (t, e) {
                        if (!ai || t) {
                            ti = !0;
                            var r = _o("refreshInit");
                            Hn && Io.sort(),
                                e || wo(),
                                lo.forEach(function (t) {
                                    return t.refresh();
                                }),
                                r.forEach(function (t) {
                                    return t && t.render && t.render(-1);
                                }),
                                Eo(),
                                Rn.pause(),
                                (ti = !1),
                                _o("refresh");
                        } else eo(Io, "scrollEnd", Do);
                    },
                    Fo = 0,
                    To = 1,
                    Ao = function () {
                        if (!ti) {
                            var t = lo.length,
                                e = oi(),
                                r = e - si >= 50,
                                n = t && lo[0].scroll();
                            if (((To = Fo > n ? -1 : 1), (Fo = n), r && (ai && !Yn && e - ai > 200 && ((ai = 0), _o("scrollEnd")), (zn = si), (si = e)), To < 0)) {
                                for (qn = t; qn-- > 0; ) lo[qn] && lo[qn].update(0, r);
                                To = 1;
                            } else for (qn = 0; qn < t; qn++) lo[qn] && lo[qn].update(0, r);
                            Ln = 0;
                        }
                    },
                    Mo = [
                        Si,
                        Pi,
                        Ri,
                        ki,
                        "marginBottom",
                        "marginRight",
                        "marginTop",
                        "marginLeft",
                        "display",
                        "flexShrink",
                        "float",
                        "zIndex",
                        "grid-column-start",
                        "grid-column-end",
                        "grid-row-start",
                        "grid-row-end",
                        "grid-area",
                        "justify-self",
                        "align-self",
                        "place-self",
                    ],
                    Oo = Mo.concat([Bi, Li, "boxSizing", "maxWidth", "maxHeight", "position", Yi, Ui, "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]),
                    So = function (t, e, r, n) {
                        if (t.parentNode !== e) {
                            for (var i, o = Mo.length, s = e.style, a = t.style; o--; ) s[(i = Mo[o])] = r[i];
                            (s.position = "absolute" === r.position ? "absolute" : "relative"),
                                "inline" === r.display && (s.display = "inline-block"),
                                (a.bottom = a.right = "auto"),
                                (s.overflow = "visible"),
                                (s.boxSizing = "border-box"),
                                (s.width = Ki(t, Gi) + Vi),
                                (s.height = Ki(t, Wi) + Vi),
                                (s.padding = a.margin = a.top = a.left = "0"),
                                ko(n),
                                (a.width = a.maxWidth = r.width),
                                (a.height = a.maxHeight = r.height),
                                (a.padding = r.padding),
                                t.parentNode.insertBefore(e, t),
                                e.appendChild(t);
                        }
                    },
                    Po = /([A-Z])/g,
                    ko = function (t) {
                        if (t) {
                            var e,
                                r,
                                n = t.t.style,
                                i = t.length,
                                o = 0;
                            for ((t.t._gsap || Tn.core.getCache(t.t)).uncache = 1; o < i; o += 2) (r = t[o + 1]), (e = t[o]), r ? (n[e] = r) : n[e] && n.removeProperty(e.replace(Po, "-$1").toLowerCase());
                        }
                    },
                    Ro = function (t) {
                        for (var e = Oo.length, r = t.style, n = [], i = 0; i < e; i++) n.push(Oo[i], r[Oo[i]]);
                        return (n.t = t), n;
                    },
                    Bo = { left: 0, top: 0 },
                    Lo = function (t, e, r, n, i, o, s, a, u, l, h, c, f) {
                        bi(t) && (t = t(a)), _i(t) && "max" === t.substr(0, 3) && (t = c + ("=" === t.charAt(4) ? so("0" + t.substr(3), r) : 0));
                        var p,
                            d,
                            g,
                            m = f ? f.time() : 0;
                        if ((f && f.seek(0), xi(t))) s && uo(s, r, n, !0);
                        else {
                            bi(e) && (e = e(a));
                            var y,
                                v,
                                D,
                                _,
                                b = t.split(" ");
                            (g = hi(e) || Pn),
                                ((y = Zi(g) || {}) && (y.left || y.top)) || "none" !== Hi(g).display || ((_ = g.style.display), (g.style.display = "block"), (y = Zi(g)), _ ? (g.style.display = _) : g.style.removeProperty("display")),
                                (v = so(b[0], y[n.d])),
                                (D = so(b[1] || "0", r)),
                                (t = y[n.p] - u[n.p] - l + v + i - D),
                                s && uo(s, D, n, r - D < 20 || (s._isStart && D > 20)),
                                (r -= r - D);
                        }
                        if (o) {
                            var x = t + r,
                                w = o._isStart;
                            (p = "scroll" + n.d2), uo(o, x, n, (w && x > 20) || (!w && (h ? Math.max(Pn[p], Sn[p]) : o.parentNode[p]) <= x + 1)), h && ((u = Zi(s)), h && (o.style[n.op.p] = u[n.op.p] - n.op.m - o._offset + Vi));
                        }
                        return f && g && ((p = Zi(g)), f.seek(c), (d = Zi(g)), (f._caScrollDist = p[n.p] - d[n.p]), (t = (t / f._caScrollDist) * c)), f && f.seek(m), f ? t : Math.round(t);
                    },
                    jo = /(?:webkit|moz|length|cssText|inset)/i,
                    No = function (t, e, r, n) {
                        if (t.parentNode !== e) {
                            var i,
                                o,
                                s = t.style;
                            if (e === Pn) {
                                for (i in ((t._stOrig = s.cssText), (o = Hi(t)))) +i || jo.test(i) || !o[i] || "string" != typeof s[i] || "0" === i || (s[i] = o[i]);
                                (s.top = r), (s.left = n);
                            } else s.cssText = t._stOrig;
                            (Tn.core.getCache(t).uncache = 1), e.appendChild(t);
                        }
                    },
                    zo = function (t, e) {
                        var r,
                            n,
                            i = mi(t, e),
                            o = "_scroll" + e.p2,
                            s = function e(s, a, u, l, h) {
                                var c = e.tween,
                                    f = a.onComplete,
                                    p = {};
                                return (
                                    c && c.kill(),
                                    (r = Math.round(u)),
                                    (a[o] = s),
                                    (a.modifiers = p),
                                    (p[o] = function (t) {
                                        return (t = ci(i())) !== r && t !== n && Math.abs(t - r) > 2 ? (c.kill(), (e.tween = 0)) : (t = u + l * c.ratio + h * c.ratio * c.ratio), (n = r), (r = ci(t));
                                    }),
                                    (a.onComplete = function () {
                                        (e.tween = 0), f && f.call(c);
                                    }),
                                    (c = e.tween = Tn.to(t, a))
                                );
                            };
                        return (
                            (t[o] = i),
                            t.addEventListener(
                                "wheel",
                                function () {
                                    console.log("dkdk");
                                    return s.tween && s.tween.kill() && (s.tween = 0);
                                },
                                { passive: !0 }
                            ),
                            s
                        );
                    };
                Gi.op = Wi;
                var Io = (function () {
                    function t(e, r) {
                        An || t.register(Tn) || console.warn("Please gsap.registerPlugin(ScrollTrigger)"), this.init(e, r);
                    }
                    return (
                        (t.prototype.init = function (e, r) {
                            if (((this.progress = this.start = 0), this.vars && this.kill(1), ui)) {
                                var n,
                                    i,
                                    o,
                                    s,
                                    a,
                                    u,
                                    l,
                                    h,
                                    c,
                                    f,
                                    p,
                                    d,
                                    g,
                                    m,
                                    y,
                                    v,
                                    D,
                                    _,
                                    b,
                                    x,
                                    w,
                                    E,
                                    C,
                                    F,
                                    T,
                                    A,
                                    M,
                                    O,
                                    S,
                                    P,
                                    k,
                                    R,
                                    B,
                                    L,
                                    j,
                                    N,
                                    z,
                                    I,
                                    U,
                                    Y,
                                    X = (e = $i(_i(e) || xi(e) || e.nodeType ? { trigger: e } : e, io)),
                                    q = X.onUpdate,
                                    V = X.toggleClass,
                                    G = X.id,
                                    W = X.onToggle,
                                    H = X.onRefresh,
                                    $ = X.scrub,
                                    Z = X.trigger,
                                    K = X.pin,
                                    Q = X.pinSpacing,
                                    J = X.invalidateOnRefresh,
                                    tt = X.anticipatePin,
                                    et = X.onScrubComplete,
                                    rt = X.onSnapComplete,
                                    nt = X.once,
                                    it = X.snap,
                                    ot = X.pinReparent,
                                    st = X.pinSpacer,
                                    at = X.containerAnimation,
                                    ut = X.fastScrollEnd,
                                    lt = X.preventOverlaps,
                                    ht = e.horizontal || (e.containerAnimation && !1 !== e.horizontal) ? Gi : Wi,
                                    ct = !$ && 0 !== $,
                                    ft = hi(e.scroller || Mn),
                                    pt = Tn.core.getCache(ft),
                                    dt = di(ft),
                                    gt = "fixed" === ("pinType" in e ? e.pinType : gi(ft, "pinType") || (dt && "fixed")),
                                    mt = [e.onEnter, e.onLeave, e.onEnterBack, e.onLeaveBack],
                                    yt = ct && e.toggleActions.split(" "),
                                    vt = "markers" in e ? e.markers : io.markers,
                                    Dt = dt ? 0 : parseFloat(Hi(ft)["border" + ht.p2 + Xi]) || 0,
                                    _t = this,
                                    bt =
                                        e.onRefreshInit &&
                                        function () {
                                            return e.onRefreshInit(_t);
                                        },
                                    xt = (function (t, e, r) {
                                        var n = r.d,
                                            i = r.d2,
                                            o = r.a;
                                        return (o = gi(t, "getBoundingClientRect"))
                                            ? function () {
                                                  return o()[n];
                                              }
                                            : function () {
                                                  return (e ? Mn["inner" + i] : t["client" + i]) || 0;
                                              };
                                    })(ft, dt, ht),
                                    wt = (function (t, e) {
                                        return !e || ~ni.indexOf(t)
                                            ? yi(t)
                                            : function () {
                                                  return Bo;
                                              };
                                    })(ft, dt),
                                    Et = 0,
                                    Ct = mi(ft, ht);
                                if (
                                    ((_t.media = Qn),
                                    (tt *= 45),
                                    (_t.scroller = ft),
                                    (_t.scroll = at ? at.time.bind(at) : Ct),
                                    (s = Ct()),
                                    (_t.vars = e),
                                    (r = r || e.animation),
                                    "refreshPriority" in e && (Hn = 1),
                                    (pt.tweenScroll = pt.tweenScroll || { top: zo(ft, Wi), left: zo(ft, Gi) }),
                                    (_t.tweenTo = n = pt.tweenScroll[ht.p]),
                                    r &&
                                        ((r.vars.lazy = !1),
                                        r._initted || (!1 !== r.vars.immediateRender && !1 !== e.immediateRender && r.render(0, !0, !0)),
                                        (_t.animation = r.pause()),
                                        (r.scrollTrigger = _t),
                                        (k = xi($) && $) &&
                                            (P = Tn.to(r, {
                                                ease: "power3",
                                                duration: k,
                                                onComplete: function () {
                                                    return et && et(_t);
                                                },
                                            })),
                                        (O = 0),
                                        G || (G = r.vars.id)),
                                    lo.push(_t),
                                    it &&
                                        ((wi(it) && !it.push) || (it = { snapTo: it }),
                                        "scrollBehavior" in Pn.style && Tn.set(dt ? [Pn, Sn] : ft, { scrollBehavior: "auto" }),
                                        (o = bi(it.snapTo)
                                            ? it.snapTo
                                            : "labels" === it.snapTo
                                            ? (function (t) {
                                                  return function (e) {
                                                      return Tn.utils.snap(Qi(t), e);
                                                  };
                                              })(r)
                                            : "labelsDirectional" === it.snapTo
                                            ? ((I = r),
                                              function (t, e) {
                                                  return Ji(Qi(I))(t, e.direction);
                                              })
                                            : !1 !== it.directional
                                            ? function (t, e) {
                                                  return Ji(it.snapTo)(t, e.direction);
                                              }
                                            : Tn.utils.snap(it.snapTo)),
                                        (R = it.duration || { min: 0.1, max: 2 }),
                                        (R = wi(R) ? Nn(R.min, R.max) : Nn(R, R)),
                                        (B = Tn.delayedCall(it.delay || k / 2 || 0.1, function () {
                                            if (Math.abs(_t.getVelocity()) < 10 && !Yn && Et !== Ct()) {
                                                var t = r && !ct ? r.totalProgress() : _t.progress,
                                                    e = ((t - S) / (oi() - zn)) * 1e3 || 0,
                                                    i = Tn.utils.clamp(-_t.progress, 1 - _t.progress, (Ai(e / 2) * e) / 0.185),
                                                    s = _t.progress + (!1 === it.inertia ? 0 : i),
                                                    a = Nn(0, 1, o(s, _t)),
                                                    h = Ct(),
                                                    c = Math.round(u + a * g),
                                                    f = it,
                                                    p = f.onStart,
                                                    d = f.onInterrupt,
                                                    m = f.onComplete,
                                                    y = n.tween;
                                                if (h <= l && h >= u && c !== h) {
                                                    if (y && !y._initted && y.data <= Ai(c - h)) return;
                                                    !1 === it.inertia && (i = a - _t.progress),
                                                        n(
                                                            c,
                                                            {
                                                                duration: R(Ai((0.185 * Math.max(Ai(s - t), Ai(a - t))) / e / 0.05 || 0)),
                                                                ease: it.ease || "power3",
                                                                data: Ai(c - h),
                                                                onInterrupt: function () {
                                                                    return B.restart(!0) && d && d(_t);
                                                                },
                                                                onComplete: function () {
                                                                    (Et = Ct()), (O = S = r && !ct ? r.totalProgress() : _t.progress), rt && rt(_t), m && m(_t);
                                                                },
                                                            },
                                                            h,
                                                            i * g,
                                                            c - h - i * g
                                                        ),
                                                        p && p(_t, n.tween);
                                                }
                                            } else _t.isActive && B.restart(!0);
                                        }).pause())),
                                    G && (ho[G] = _t),
                                    (Z = _t.trigger = hi(Z || K)),
                                    (K = !0 === K ? Z : hi(K)),
                                    _i(V) && (V = { targets: Z, className: V }),
                                    K &&
                                        (!1 === Q || Q === Yi || (Q = !(!Q && "flex" === Hi(K.parentNode).display) && Ui),
                                        (_t.pin = K),
                                        !1 !== e.force3D && Tn.set(K, { force3D: !0 }),
                                        (i = Tn.core.getCache(K)).spacer
                                            ? (m = i.pinState)
                                            : (st && ((st = hi(st)) && !st.nodeType && (st = st.current || st.nativeElement), (i.spacerIsNative = !!st), st && (i.spacerState = Ro(st))),
                                              (i.spacer = D = st || On.createElement("div")),
                                              D.classList.add("pin-spacer"),
                                              G && D.classList.add("pin-spacer-" + G),
                                              (i.pinState = m = Ro(K))),
                                        (_t.spacer = D = i.spacer),
                                        (M = Hi(K)),
                                        (C = M[Q + ht.os2]),
                                        (b = Tn.getProperty(K)),
                                        (x = Tn.quickSetter(K, ht.a, Vi)),
                                        So(K, D, M),
                                        (v = Ro(K))),
                                    vt &&
                                        ((d = wi(vt) ? $i(vt, no) : no),
                                        (f = ao("scroller-start", G, ft, ht, d, 0)),
                                        (p = ao("scroller-end", G, ft, ht, d, 0, f)),
                                        (_ = f["offset" + ht.op.d2]),
                                        (h = ao("start", G, ft, ht, d, _, 0, at)),
                                        (c = ao("end", G, ft, ht, d, _, 0, at)),
                                        at && (z = Tn.quickSetter([h, c], ht.a, Vi)),
                                        gt ||
                                            (ni.length && !0 === gi(ft, "fixedMarkers")) ||
                                            ((Y = Hi((U = dt ? Pn : ft)).position),
                                            (U.style.position = "absolute" === Y || "fixed" === Y ? Y : "relative"),
                                            Tn.set([f, p], { force3D: !0 }),
                                            (T = Tn.quickSetter(f, ht.a, Vi)),
                                            (A = Tn.quickSetter(p, ht.a, Vi)))),
                                    at)
                                ) {
                                    var Ft = at.vars.onUpdate,
                                        Tt = at.vars.onUpdateParams;
                                    at.eventCallback("onUpdate", function () {
                                        _t.update(0, 0, 1), Ft && Ft.apply(Tt || []);
                                    });
                                }
                                (_t.previous = function () {
                                    return lo[lo.indexOf(_t) - 1];
                                }),
                                    (_t.next = function () {
                                        return lo[lo.indexOf(_t) + 1];
                                    }),
                                    (_t.revert = function (t) {
                                        var e = !1 !== t || !_t.enabled,
                                            n = Un;
                                        e !== _t.isReverted &&
                                            (e && (_t.scroll.rec || (_t.scroll.rec = Ct()), (j = Math.max(Ct(), _t.scroll.rec || 0)), (L = _t.progress), (N = r && r.progress())),
                                            h &&
                                                [h, c, f, p].forEach(function (t) {
                                                    return (t.style.display = e ? "none" : "block");
                                                }),
                                            e && (Un = 1),
                                            _t.update(e),
                                            (Un = n),
                                            K &&
                                                (e
                                                    ? (function (t, e, r) {
                                                          ko(r);
                                                          var n = t._gsap;
                                                          if (n.spacerIsNative) ko(n.spacerState);
                                                          else if (t.parentNode === e) {
                                                              var i = e.parentNode;
                                                              i && (i.insertBefore(t, e), i.removeChild(e));
                                                          }
                                                      })(K, D, m)
                                                    : (!ot || !_t.isActive) && So(K, D, Hi(K), F)),
                                            (_t.isReverted = e));
                                    }),
                                    (_t.refresh = function (n, i) {
                                        if ((!Un && _t.enabled) || i)
                                            if (K && n && ai) eo(t, "scrollEnd", Do);
                                            else {
                                                (Un = 1), P && P.pause(), J && r && r.progress(0).invalidate(), _t.isReverted || _t.revert();
                                                for (
                                                    var o,
                                                        d,
                                                        _,
                                                        x,
                                                        C,
                                                        T,
                                                        A,
                                                        M,
                                                        O,
                                                        S,
                                                        k = xt(),
                                                        R = wt(),
                                                        B = at ? at.duration() : vi(ft, ht),
                                                        z = 0,
                                                        I = 0,
                                                        U = e.end,
                                                        Y = e.endTrigger || Z,
                                                        X = e.start || (0 !== e.start && Z ? (K ? "0 0" : "0 100%") : 0),
                                                        q = e.pinnedContainer && hi(e.pinnedContainer),
                                                        V = (Z && Math.max(0, lo.indexOf(_t))) || 0,
                                                        G = V;
                                                    G--;

                                                )
                                                    (T = lo[G]).end || T.refresh(0, 1) || (Un = 1), !(A = T.pin) || (A !== Z && A !== K) || T.isReverted || (S || (S = []), S.unshift(T), T.revert());
                                                for (
                                                    bi(X) && (X = X(_t)),
                                                        u = Lo(X, Z, k, ht, Ct(), h, f, _t, R, Dt, gt, B, at) || (K ? -0.001 : 0),
                                                        bi(U) && (U = U(_t)),
                                                        _i(U) && !U.indexOf("+=") && (~U.indexOf(" ") ? (U = (_i(X) ? X.split(" ")[0] : "") + U) : ((z = so(U.substr(2), k)), (U = _i(X) ? X : u + z), (Y = Z))),
                                                        l = Math.max(u, Lo(U || (Y ? "100% 0" : B), Y, k, ht, Ct() + z, c, p, _t, R, Dt, gt, B, at)) || -0.001,
                                                        g = l - u || ((u -= 0.01) && 0.001),
                                                        z = 0,
                                                        G = V;
                                                    G--;

                                                )
                                                    (A = (T = lo[G]).pin) && T.start - T._pinPush < u && !at && ((o = T.end - T.start), (A === Z || A === q) && !xi(X) && (z += o), A === K && (I += o));
                                                if (((u += z), (l += z), (_t._pinPush = I), h && z && (((o = {})[ht.a] = "+=" + z), q && (o[ht.p] = "-=" + Ct()), Tn.set([h, c], o)), K))
                                                    (o = Hi(K)),
                                                        (x = ht === Wi),
                                                        (_ = Ct()),
                                                        (w = parseFloat(b(ht.a)) + I),
                                                        !B && l > 1 && ((dt ? Pn : ft).style["overflow-" + ht.a] = "scroll"),
                                                        So(K, D, o),
                                                        (v = Ro(K)),
                                                        (d = Zi(K, !0)),
                                                        (M = gt && mi(ft, x ? Gi : Wi)()),
                                                        Q && (((F = [Q + ht.os2, g + I + Vi]).t = D), (G = Q === Ui ? Ki(K, ht) + g + I : 0) && F.push(ht.d, G + Vi), ko(F), gt && Ct(j)),
                                                        gt &&
                                                            (((C = { top: d.top + (x ? _ - u : M) + Vi, left: d.left + (x ? M : _ - u) + Vi, boxSizing: "border-box", position: "fixed" }).width = C.maxWidth = Math.ceil(d.width) + Vi),
                                                            (C.height = C.maxHeight = Math.ceil(d.height) + Vi),
                                                            (C.margin = C.marginTop = C.marginRight = C.marginBottom = C.marginLeft = "0"),
                                                            (C.padding = o.padding),
                                                            (C.paddingTop = o.paddingTop),
                                                            (C.paddingRight = o.paddingRight),
                                                            (C.paddingBottom = o.paddingBottom),
                                                            (C.paddingLeft = o.paddingLeft),
                                                            (y = (function (t, e, r) {
                                                                for (var n, i = [], o = t.length, s = r ? 8 : 0; s < o; s += 2) (n = t[s]), i.push(n, n in e ? e[n] : t[s + 1]);
                                                                return (i.t = t.t), i;
                                                            })(m, C, ot))),
                                                        r
                                                            ? ((O = r._initted), $n(1), r.render(r.duration(), !0, !0), (E = b(ht.a) - w + g + I), g !== E && y.splice(y.length - 2, 2), r.render(0, !0, !0), O || r.invalidate(), $n(0))
                                                            : (E = g);
                                                else if (Z && Ct() && !at) for (d = Z.parentNode; d && d !== Pn; ) d._pinOffset && ((u -= d._pinOffset), (l -= d._pinOffset)), (d = d.parentNode);
                                                S &&
                                                    S.forEach(function (t) {
                                                        return t.revert(!1);
                                                    }),
                                                    (_t.start = u),
                                                    (_t.end = l),
                                                    (s = a = Ct()),
                                                    at || (s < j && Ct(j), (_t.scroll.rec = 0)),
                                                    _t.revert(!1),
                                                    (Un = 0),
                                                    r && ct && r._initted && r.progress() !== N && r.progress(N, !0).render(r.time(), !0, !0),
                                                    L !== _t.progress && (r && !ct && r.totalProgress(L, !0), (_t.progress = L), _t.update(0, 0, 1)),
                                                    K && Q && (D._pinOffset = Math.round(_t.progress * E)),
                                                    H && H(_t);
                                            }
                                    }),
                                    (_t.getVelocity = function () {
                                        return ((Ct() - a) / (oi() - zn)) * 1e3 || 0;
                                    }),
                                    (_t.endAnimation = function () {
                                        Fi(_t.callbackAnimation), r && (P ? P.progress(1) : r.paused() ? ct || Fi(r, _t.direction < 0, 1) : Fi(r, r.reversed()));
                                    }),
                                    (_t.getTrailing = function (t) {
                                        var e = lo.indexOf(_t),
                                            r = _t.direction > 0 ? lo.slice(0, e).reverse() : lo.slice(e + 1);
                                        return _i(t)
                                            ? r.filter(function (e) {
                                                  return e.vars.preventOverlaps === t;
                                              })
                                            : r;
                                    }),
                                    (_t.update = function (t, e, i) {
                                        if (!at || i || t) {
                                            var o,
                                                h,
                                                c,
                                                p,
                                                d,
                                                m,
                                                _,
                                                b = _t.scroll(),
                                                F = t ? 0 : (b - u) / g,
                                                M = F < 0 ? 0 : F > 1 ? 1 : F || 0,
                                                k = _t.progress;
                                            if (
                                                (e && ((a = s), (s = at ? Ct() : b), it && ((S = O), (O = r && !ct ? r.totalProgress() : M))),
                                                tt && !M && K && !Un && !ri && ai && u < b + ((b - a) / (oi() - zn)) * tt && (M = 1e-4),
                                                M !== k && _t.enabled)
                                            ) {
                                                if (
                                                    ((p = (d = (o = _t.isActive = !!M && M < 1) !== (!!k && k < 1)) || !!M != !!k),
                                                    (_t.direction = M > k ? 1 : -1),
                                                    (_t.progress = M),
                                                    p && !Un && ((h = M && !k ? 0 : 1 === M ? 1 : 1 === k ? 2 : 3), ct && ((c = (!d && "none" !== yt[h + 1] && yt[h + 1]) || yt[h]), (_ = r && ("complete" === c || "reset" === c || c in r)))),
                                                    lt &&
                                                        d &&
                                                        (_ || $ || !r) &&
                                                        (bi(lt)
                                                            ? lt(_t)
                                                            : _t.getTrailing(lt).forEach(function (t) {
                                                                  return t.endAnimation();
                                                              })),
                                                    ct || (!P || Un || ri ? r && r.totalProgress(M, !!Un) : ((P.vars.totalProgress = M), P.invalidate().restart())),
                                                    K)
                                                )
                                                    if ((t && Q && (D.style[Q + ht.os2] = C), gt)) {
                                                        if (p) {
                                                            if (((m = !t && M > k && l + 1 > b && b + 1 >= vi(ft, ht)), ot))
                                                                if (t || (!o && !m)) No(K, D);
                                                                else {
                                                                    var R = Zi(K, !0),
                                                                        L = b - u;
                                                                    No(K, Pn, R.top + (ht === Wi ? L : 0) + Vi, R.left + (ht === Wi ? 0 : L) + Vi);
                                                                }
                                                            ko(o || m ? y : v), (E !== g && M < 1 && o) || x(w + (1 !== M || m ? 0 : E));
                                                        }
                                                    } else x(w + E * M);
                                                it && !n.tween && !Un && !ri && B.restart(!0),
                                                    V &&
                                                        (d || (nt && M && (M < 1 || !Kn))) &&
                                                        jn(V.targets).forEach(function (t) {
                                                            return t.classList[o || nt ? "add" : "remove"](V.className);
                                                        }),
                                                    q && !ct && !t && q(_t),
                                                    p && !Un
                                                        ? (ct && (_ && ("complete" === c ? r.pause().totalProgress(1) : "reset" === c ? r.restart(!0).pause() : "restart" === c ? r.restart(!0) : r[c]()), q && q(_t)),
                                                          (!d && Kn) || (W && d && Ti(_t, W), mt[h] && Ti(_t, mt[h]), nt && (1 === M ? _t.kill(!1, 1) : (mt[h] = 0)), d || (mt[(h = 1 === M ? 1 : 3)] && Ti(_t, mt[h]))),
                                                          ut && !o && Math.abs(_t.getVelocity()) > (xi(ut) ? ut : 2500) && (Fi(_t.callbackAnimation), P ? P.progress(1) : Fi(r, !M, 1)))
                                                        : ct && q && !Un && q(_t);
                                            }
                                            if (A) {
                                                var j = at ? (b / at.duration()) * (at._caScrollDist || 0) : b;
                                                T(j + (f._isFlipped ? 1 : 0)), A(j);
                                            }
                                            z && z((-b / at.duration()) * (at._caScrollDist || 0));
                                        }
                                    }),
                                    (_t.enable = function (e, r) {
                                        _t.enabled || ((_t.enabled = !0), eo(ft, "resize", po), eo(ft, "scroll", fo), bt && eo(t, "refreshInit", bt), !1 !== e && ((_t.progress = L = 0), (s = a = Et = Ct())), !1 !== r && _t.refresh());
                                    }),
                                    (_t.getTween = function (t) {
                                        return t && n ? n.tween : P;
                                    }),
                                    (_t.disable = function (e, r) {
                                        if (
                                            _t.enabled &&
                                            (!1 !== e && _t.revert(),
                                            (_t.enabled = _t.isActive = !1),
                                            r || (P && P.pause()),
                                            (j = 0),
                                            i && (i.uncache = 1),
                                            bt && ro(t, "refreshInit", bt),
                                            B && (B.pause(), n.tween && n.tween.kill() && (n.tween = 0)),
                                            !dt)
                                        ) {
                                            for (var o = lo.length; o--; ) if (lo[o].scroller === ft && lo[o] !== _t) return;
                                            ro(ft, "resize", po), ro(ft, "scroll", fo);
                                        }
                                    }),
                                    (_t.kill = function (t, e) {
                                        _t.disable(t, e), P && P.kill(), G && delete ho[G];
                                        var n = lo.indexOf(_t);
                                        lo.splice(n, 1),
                                            n === qn && To > 0 && qn--,
                                            (n = 0),
                                            lo.forEach(function (t) {
                                                return t.scroller === _t.scroller && (n = 1);
                                            }),
                                            n || (_t.scroll.rec = 0),
                                            r && ((r.scrollTrigger = null), t && r.render(-1), e || r.kill()),
                                            h &&
                                                [h, c, f, p].forEach(function (t) {
                                                    return t.parentNode && t.parentNode.removeChild(t);
                                                }),
                                            K &&
                                                (i && (i.uncache = 1),
                                                (n = 0),
                                                lo.forEach(function (t) {
                                                    return t.pin === K && n++;
                                                }),
                                                n || (i.spacer = 0));
                                    }),
                                    _t.enable(!1, !1),
                                    r && r.add && !g
                                        ? Tn.delayedCall(0.01, function () {
                                              return u || l || _t.refresh();
                                          }) &&
                                          (g = 0.01) &&
                                          (u = l = 0)
                                        : _t.refresh();
                            } else this.update = this.refresh = this.kill = li;
                        }),
                        (t.register = function (e) {
                            if (
                                !An &&
                                ((Tn = e || pi()),
                                fi() && window.document && ((Mn = window), (On = document), (Sn = On.documentElement), (Pn = On.body)),
                                Tn && ((jn = Tn.utils.toArray), (Nn = Tn.utils.clamp), ($n = Tn.core.suppressOverwrites || li), Tn.core.globals("ScrollTrigger", t), Pn))
                            ) {
                                (Bn =
                                    Mn.requestAnimationFrame ||
                                    function (t) {
                                        return setTimeout(t, 16);
                                    }),
                                    eo(Mn, "wheel", fo),
                                    (kn = [Mn, On, Sn, Pn]),
                                    eo(On, "scroll", fo);
                                var r,
                                    n = Pn.style,
                                    i = n.borderTopStyle;
                                (n.borderTopStyle = "solid"),
                                    (r = Zi(Pn)),
                                    (Wi.m = Math.round(r.top + Wi.sc()) || 0),
                                    (Gi.m = Math.round(r.left + Gi.sc()) || 0),
                                    i ? (n.borderTopStyle = i) : n.removeProperty("border-top-style"),
                                    (In = setInterval(co, 200)),
                                    Tn.delayedCall(0.5, function () {
                                        return (ri = 0);
                                    }),
                                    eo(On, "touchcancel", li),
                                    eo(Pn, "touchstart", li),
                                    to(eo, On, "pointerdown,touchstart,mousedown", function () {
                                        return (Yn = 1);
                                    }),
                                    to(eo, On, "pointerup,touchend,mouseup", function () {
                                        return (Yn = 0);
                                    }),
                                    (Xn = Tn.utils.checkPrefix("transform")),
                                    Oo.push(Xn),
                                    (An = oi()),
                                    (Rn = Tn.delayedCall(0.2, Co).pause()),
                                    (Wn = [
                                        On,
                                        "visibilitychange",
                                        function () {
                                            var t = Mn.innerWidth,
                                                e = Mn.innerHeight;
                                            On.hidden ? ((Vn = t), (Gn = e)) : (Vn === t && Gn === e) || po();
                                        },
                                        On,
                                        "DOMContentLoaded",
                                        Co,
                                        Mn,
                                        "load",
                                        function () {
                                            return ai || Co();
                                        },
                                        Mn,
                                        "resize",
                                        po,
                                    ]),
                                    Di(eo);
                            }
                            return An;
                        }),
                        (t.defaults = function (t) {
                            for (var e in t) io[e] = t[e];
                        }),
                        (t.kill = function () {
                            (ui = 0),
                                lo.slice(0).forEach(function (t) {
                                    return t.kill(1);
                                });
                        }),
                        (t.config = function (t) {
                            "limitCallbacks" in t && (Kn = !!t.limitCallbacks);
                            var e = t.syncInterval;
                            (e && clearInterval(In)) || ((In = e) && setInterval(co, e)), "autoRefreshEvents" in t && (Di(ro) || Di(eo, t.autoRefreshEvents || "none"), (Zn = -1 === (t.autoRefreshEvents + "").indexOf("resize")));
                        }),
                        (t.scrollerProxy = function (t, e) {
                            var r = hi(t),
                                n = ii.indexOf(r),
                                i = di(r);
                            ~n && ii.splice(n, i ? 6 : 2), i ? ni.unshift(Mn, e, Pn, e, Sn, e) : ni.unshift(r, e);
                        }),
                        (t.matchMedia = function (t) {
                            var e, r, n, i, o;
                            for (r in t)
                                (n = yo.indexOf(r)),
                                    (i = t[r]),
                                    (Qn = r),
                                    "all" === r
                                        ? i()
                                        : (e = Mn.matchMedia(r)) &&
                                          (e.matches && (o = i()),
                                          ~n ? ((yo[n + 1] = Ci(yo[n + 1], i)), (yo[n + 2] = Ci(yo[n + 2], o))) : ((n = yo.length), yo.push(r, i, o), e.addListener ? e.addListener(vo) : e.addEventListener("change", vo)),
                                          (yo[n + 3] = e.matches)),
                                    (Qn = 0);
                            return yo;
                        }),
                        (t.clearMatchMedia = function (t) {
                            t || (yo.length = 0), (t = yo.indexOf(t)) >= 0 && yo.splice(t, 4);
                        }),
                        (t.isInViewport = function (t, e, r) {
                            var n = (_i(t) ? hi(t) : t).getBoundingClientRect(),
                                i = n[r ? Bi : Li] * e || 0;
                            return r ? n.right - i > 0 && n.left + i < Mn.innerWidth : n.bottom - i > 0 && n.top + i < Mn.innerHeight;
                        }),
                        (t.positionInViewport = function (t, e, r) {
                            _i(t) && (t = hi(t));
                            var n = t.getBoundingClientRect(),
                                i = n[r ? Bi : Li],
                                o = null == e ? i / 2 : e in oo ? oo[e] * i : ~e.indexOf("%") ? (parseFloat(e) * i) / 100 : parseFloat(e) || 0;
                            return r ? (n.left + o) / Mn.innerWidth : (n.top + o) / Mn.innerHeight;
                        }),
                        t
                    );
                })();
                (Io.version = "3.8.0"),
                    (Io.saveStyles = function (t) {
                        return t
                            ? jn(t).forEach(function (t) {
                                  if (t && t.style) {
                                      var e = bo.indexOf(t);
                                      e >= 0 && bo.splice(e, 5), bo.push(t, t.style.cssText, t.getBBox && t.getAttribute("transform"), Tn.core.getCache(t), Qn);
                                  }
                              })
                            : bo;
                    }),
                    (Io.revert = function (t, e) {
                        return wo(!t, e);
                    }),
                    (Io.create = function (t, e) {
                        return new Io(t, e);
                    }),
                    (Io.refresh = function (t) {
                        return t ? po() : (An || Io.register()) && Co(!0);
                    }),
                    (Io.update = Ao),
                    (Io.clearScrollMemory = Eo),
                    (Io.maxScroll = function (t, e) {
                        return vi(t, e ? Gi : Wi);
                    }),
                    (Io.getScrollFunc = function (t, e) {
                        return mi(hi(t), e ? Gi : Wi);
                    }),
                    (Io.getById = function (t) {
                        return ho[t];
                    }),
                    (Io.getAll = function () {
                        return lo.slice(0);
                    }),
                    (Io.isScrolling = function () {
                        return !!ai;
                    }),
                    (Io.snapDirectional = Ji),
                    (Io.addEventListener = function (t, e) {
                        var r = go[t] || (go[t] = []);
                        ~r.indexOf(e) || r.push(e);
                    }),
                    (Io.removeEventListener = function (t, e) {
                        var r = go[t],
                            n = r && r.indexOf(e);
                        n >= 0 && r.splice(n, 1);
                    }),
                    (Io.batch = function (t, e) {
                        var r,
                            n = [],
                            i = {},
                            o = e.interval || 0.016,
                            s = e.batchMax || 1e9,
                            a = function (t, e) {
                                var r = [],
                                    n = [],
                                    i = Tn.delayedCall(o, function () {
                                        e(r, n), (r = []), (n = []);
                                    }).pause();
                                return function (t) {
                                    r.length || i.restart(!0), r.push(t.trigger), n.push(t), s <= r.length && i.progress(1);
                                };
                            };
                        for (r in e) i[r] = "on" === r.substr(0, 2) && bi(e[r]) && "onRefreshInit" !== r ? a(0, e[r]) : e[r];
                        return (
                            bi(s) &&
                                ((s = s()),
                                eo(Io, "refresh", function () {
                                    return (s = e.batchMax());
                                })),
                            jn(t).forEach(function (t) {
                                var e = {};
                                for (r in i) e[r] = i[r];
                                (e.trigger = t), n.push(Io.create(e));
                            }),
                            n
                        );
                    }),
                    (Io.sort = function (t) {
                        return lo.sort(
                            t ||
                                function (t, e) {
                                    return -1e6 * (t.vars.refreshPriority || 0) + t.start - (e.start + -1e6 * (e.vars.refreshPriority || 0));
                                }
                        );
                    }),
                    pi() && Tn.registerPlugin(Io);
                var Uo,
                    Yo,
                    Xo,
                    qo,
                    Vo,
                    Go,
                    Wo,
                    Ho = function () {
                        return "undefined" != typeof window;
                    },
                    $o = function () {
                        return Uo || (Ho() && (Uo = window.gsap) && Uo.registerPlugin && Uo);
                    },
                    Zo = function (t) {
                        return "string" == typeof t;
                    },
                    Ko = function (t) {
                        return "function" == typeof t;
                    },
                    Qo = function (t, e) {
                        var r = "x" === e ? "Width" : "Height",
                            n = "scroll" + r,
                            i = "client" + r;
                        return t === Xo || t === qo || t === Vo ? Math.max(qo[n], Vo[n]) - (Xo["inner" + r] || qo[i] || Vo[i]) : t[n] - t["offset" + r];
                    },
                    Jo = function (t, e) {
                        var r = "scroll" + ("x" === e ? "Left" : "Top");
                        return (
                            t === Xo && (null != t.pageXOffset ? (r = "page" + e.toUpperCase() + "Offset") : (t = null != qo[r] ? qo : Vo)),
                            function () {
                                return t[r];
                            }
                        );
                    },
                    ts = function (t, e) {
                        if (!(t = Go(t)[0]) || !t.getBoundingClientRect) return console.warn("scrollTo target doesn't exist. Using 0") || { x: 0, y: 0 };
                        var r = t.getBoundingClientRect(),
                            n = !e || e === Xo || e === Vo,
                            i = n ? { top: qo.clientTop - (Xo.pageYOffset || qo.scrollTop || Vo.scrollTop || 0), left: qo.clientLeft - (Xo.pageXOffset || qo.scrollLeft || Vo.scrollLeft || 0) } : e.getBoundingClientRect(),
                            o = { x: r.left - i.left, y: r.top - i.top };
                        return !n && e && ((o.x += Jo(e, "x")()), (o.y += Jo(e, "y")())), o;
                    },
                    es = function (t, e, r, n, i) {
                        return isNaN(t) || "object" == typeof t
                            ? Zo(t) && "=" === t.charAt(1)
                                ? parseFloat(t.substr(2)) * ("-" === t.charAt(0) ? -1 : 1) + n - i
                                : "max" === t
                                ? Qo(e, r) - i
                                : Math.min(Qo(e, r), ts(t, e)[r] - i)
                            : parseFloat(t) - i;
                    },
                    rs = function () {
                        (Uo = $o()), Ho() && Uo && document.body && ((Xo = window), (Vo = document.body), (qo = document.documentElement), (Go = Uo.utils.toArray), Uo.config({ autoKillThreshold: 7 }), (Wo = Uo.config()), (Yo = 1));
                    },
                    ns = {
                        version: "3.8.0",
                        name: "scrollTo",
                        rawVars: 1,
                        register: function (t) {
                            (Uo = t), rs();
                        },
                        init: function (t, e, r, n, i) {
                            Yo || rs();
                            var o = this,
                                s = Uo.getProperty(t, "scrollSnapType");
                            (o.isWin = t === Xo),
                                (o.target = t),
                                (o.tween = r),
                                (e = (function (t, e, r, n) {
                                    if ((Ko(t) && (t = t(e, r, n)), "object" != typeof t)) return Zo(t) && "max" !== t && "=" !== t.charAt(1) ? { x: t, y: t } : { y: t };
                                    if (t.nodeType) return { y: t, x: t };
                                    var i,
                                        o = {};
                                    for (i in t) o[i] = "onAutoKill" !== i && Ko(t[i]) ? t[i](e, r, n) : t[i];
                                    return o;
                                })(e, n, t, i)),
                                (o.vars = e),
                                (o.autoKill = !!e.autoKill),
                                (o.getX = Jo(t, "x")),
                                (o.getY = Jo(t, "y")),
                                (o.x = o.xPrev = o.getX()),
                                (o.y = o.yPrev = o.getY()),
                                s && "none" !== s && ((o.snap = 1), (o.snapInline = t.style.scrollSnapType), (t.style.scrollSnapType = "none")),
                                null != e.x ? (o.add(o, "x", o.x, es(e.x, t, "x", o.x, e.offsetX || 0), n, i), o._props.push("scrollTo_x")) : (o.skipX = 1),
                                null != e.y ? (o.add(o, "y", o.y, es(e.y, t, "y", o.y, e.offsetY || 0), n, i), o._props.push("scrollTo_y")) : (o.skipY = 1);
                        },
                        render: function (t, e) {
                            for (var r, n, i, o, s, a = e._pt, u = e.target, l = e.tween, h = e.autoKill, c = e.xPrev, f = e.yPrev, p = e.isWin, d = e.snap, g = e.snapInline; a; ) a.r(t, a.d), (a = a._next);
                            (r = p || !e.skipX ? e.getX() : c),
                                (i = (n = p || !e.skipY ? e.getY() : f) - f),
                                (o = r - c),
                                (s = Wo.autoKillThreshold),
                                e.x < 0 && (e.x = 0),
                                e.y < 0 && (e.y = 0),
                                h &&
                                    (!e.skipX && (o > s || o < -s) && r < Qo(u, "x") && (e.skipX = 1),
                                    !e.skipY && (i > s || i < -s) && n < Qo(u, "y") && (e.skipY = 1),
                                    e.skipX && e.skipY && (l.kill(), e.vars.onAutoKill && e.vars.onAutoKill.apply(l, e.vars.onAutoKillParams || []))),
                                p ? Xo.scrollTo(e.skipX ? r : e.x, e.skipY ? n : e.y) : (e.skipY || (u.scrollTop = e.y), e.skipX || (u.scrollLeft = e.x)),
                                !d ||
                                    (1 !== t && 0 !== t) ||
                                    ((n = u.scrollTop),
                                    (r = u.scrollLeft),
                                    g ? (u.style.scrollSnapType = g) : u.style.removeProperty("scroll-snap-type"),
                                    (u.scrollTop = n + 1),
                                    (u.scrollLeft = r + 1),
                                    (u.scrollTop = n),
                                    (u.scrollLeft = r)),
                                (e.xPrev = e.x),
                                (e.yPrev = e.y);
                        },
                        kill: function (t) {
                            var e = "scrollTo" === t;
                            (e || "scrollTo_x" === t) && (this.skipX = 1), (e || "scrollTo_y" === t) && (this.skipY = 1);
                        },
                    };
                (ns.max = Qo), (ns.getOffset = ts), (ns.buildGetter = Jo), $o() && Uo.registerPlugin(ns);
                var is,
                    os,
                    ss,
                    as,
                    us,
                    ls = function () {
                        return "undefined" != typeof window;
                    },
                    hs = function () {
                        return is || (ls() && (is = window.gsap) && is.registerPlugin && is);
                    },
                    cs = /[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi,
                    fs = { rect: ["width", "height"], circle: ["r", "r"], ellipse: ["rx", "ry"], line: ["x2", "y2"] },
                    ps = function (t) {
                        return Math.round(1e4 * t) / 1e4;
                    },
                    ds = function (t) {
                        return parseFloat(t) || 0;
                    },
                    gs = function (t, e) {
                        var r = ds(t);
                        return ~t.indexOf("%") ? (r / 100) * e : r;
                    },
                    ms = function (t, e) {
                        return ds(t.getAttribute(e));
                    },
                    ys = Math.sqrt,
                    vs = function (t, e, r, n, i, o) {
                        return ys(Math.pow((ds(r) - ds(t)) * i, 2) + Math.pow((ds(n) - ds(e)) * o, 2));
                    },
                    Ds = function (t) {
                        return console.warn(t);
                    },
                    _s = function (t) {
                        return "non-scaling-stroke" === t.getAttribute("vector-effect");
                    },
                    bs = function (t) {
                        if (!(t = os(t)[0])) return 0;
                        var e,
                            r,
                            n,
                            i,
                            o,
                            s,
                            a,
                            u = t.tagName.toLowerCase(),
                            l = t.style,
                            h = 1,
                            c = 1;
                        _s(t) && ((c = t.getScreenCTM()), (h = ys(c.a * c.a + c.b * c.b)), (c = ys(c.d * c.d + c.c * c.c)));
                        try {
                            r = t.getBBox();
                        } catch (t) {
                            Ds("Some browsers won't measure invisible elements (like display:none or masks inside defs).");
                        }
                        var f = r || { x: 0, y: 0, width: 0, height: 0 },
                            p = f.x,
                            d = f.y,
                            g = f.width,
                            m = f.height;
                        if (
                            ((r && (g || m)) ||
                                !fs[u] ||
                                ((g = ms(t, fs[u][0])), (m = ms(t, fs[u][1])), "rect" !== u && "line" !== u && ((g *= 2), (m *= 2)), "line" === u && ((p = ms(t, "x1")), (d = ms(t, "y1")), (g = Math.abs(g - p)), (m = Math.abs(m - d)))),
                            "path" === u)
                        )
                            (i = l.strokeDasharray),
                                (l.strokeDasharray = "none"),
                                (e = t.getTotalLength() || 0),
                                h !== c && Ds("Warning: <path> length cannot be measured when vector-effect is non-scaling-stroke and the element isn't proportionally scaled."),
                                (e *= (h + c) / 2),
                                (l.strokeDasharray = i);
                        else if ("rect" === u) e = 2 * g * h + 2 * m * c;
                        else if ("line" === u) e = vs(p, d, p + g, d + m, h, c);
                        else if ("polyline" === u || "polygon" === u)
                            for (n = t.getAttribute("points").match(cs) || [], "polygon" === u && n.push(n[0], n[1]), e = 0, o = 2; o < n.length; o += 2) e += vs(n[o - 2], n[o - 1], n[o], n[o + 1], h, c) || 0;
                        else ("circle" !== u && "ellipse" !== u) || ((s = (g / 2) * h), (a = (m / 2) * c), (e = Math.PI * (3 * (s + a) - ys((3 * s + a) * (s + 3 * a)))));
                        return e || 0;
                    },
                    xs = function (t, e) {
                        if (!(t = os(t)[0])) return [0, 0];
                        e || (e = bs(t) + 1);
                        var r = ss.getComputedStyle(t),
                            n = r.strokeDasharray || "",
                            i = ds(r.strokeDashoffset),
                            o = n.indexOf(",");
                        return o < 0 && (o = n.indexOf(" ")), (n = o < 0 ? e : ds(n.substr(0, o))) > e && (n = e), [-i || 0, n - i || 0];
                    },
                    ws = function () {
                        ls() && (document, (ss = window), (us = is = hs()), (os = is.utils.toArray), (as = -1 !== ((ss.navigator || {}).userAgent || "").indexOf("Edge")));
                    },
                    Es = {
                        version: "3.9.1",
                        name: "drawSVG",
                        register: function (t) {
                            (is = t), ws();
                        },
                        init: function (t, e, r, n, i) {
                            if (!t.getBBox) return !1;
                            us || ws();
                            var o,
                                s,
                                a,
                                u = bs(t);
                            return (
                                (this._style = t.style),
                                (this._target = t),
                                e + "" == "true" ? (e = "0 100%") : e ? -1 === (e + "").indexOf(" ") && (e = "0 " + e) : (e = "0 0"),
                                (s = (function (t, e, r) {
                                    var n,
                                        i,
                                        o = t.indexOf(" ");
                                    return o < 0 ? ((n = void 0 !== r ? r + "" : t), (i = t)) : ((n = t.substr(0, o)), (i = t.substr(o + 1))), (n = gs(n, e)) > (i = gs(i, e)) ? [i, n] : [n, i];
                                })(e, u, (o = xs(t, u))[0])),
                                (this._length = ps(u)),
                                (this._dash = ps(o[1] - o[0])),
                                (this._offset = ps(-o[0])),
                                (this._dashPT = this.add(this, "_dash", this._dash, ps(s[1] - s[0]))),
                                (this._offsetPT = this.add(this, "_offset", this._offset, ps(-s[0]))),
                                as && (a = ss.getComputedStyle(t)).strokeLinecap !== a.strokeLinejoin && ((s = ds(a.strokeMiterlimit)), this.add(t.style, "strokeMiterlimit", s, s + 0.01)),
                                (this._live = _s(t) || ~(e + "").indexOf("live")),
                                (this._nowrap = ~(e + "").indexOf("nowrap")),
                                this._props.push("drawSVG"),
                                1
                            );
                        },
                        render: function (t, e) {
                            var r,
                                n,
                                i,
                                o,
                                s = e._pt,
                                a = e._style;
                            if (s) {
                                for (
                                    e._live &&
                                    (r = bs(e._target)) !== e._length &&
                                    ((n = r / e._length), (e._length = r), e._offsetPT && ((e._offsetPT.s *= n), (e._offsetPT.c *= n)), e._dashPT ? ((e._dashPT.s *= n), (e._dashPT.c *= n)) : (e._dash *= n));
                                    s;

                                )
                                    s.r(t, s.d), (s = s._next);
                                (i = e._dash || (t && 1 !== t && 1e-4) || 0),
                                    (r = e._length - i + 0.1),
                                    (o = e._offset),
                                    i && o && i + Math.abs(o % e._length) > e._length - 0.2 && (o += o < 0 ? 0.1 : -0.1) && (r += 0.1),
                                    (a.strokeDashoffset = i ? o : o + 0.001),
                                    (a.strokeDasharray = r < 0.2 ? "none" : i ? i + "px," + (e._nowrap ? 999999 : r) + "px" : "0px, 999999px");
                            }
                        },
                        getLength: bs,
                        getPosition: xs,
                    };
                function Cs() {
                    if (!(this instanceof Cs)) return new Cs();
                    (this.size = 0), (this.uid = 0), (this.selectors = []), (this.selectorObjects = {}), (this.indexes = Object.create(this.indexes)), (this.activeIndexes = []);
                }
                hs() && is.registerPlugin(Es), ei.registerPlugin(Io, ns, Es), ei.config({ defaults: { ease: "none" } });
                var Fs = window.document.documentElement,
                    Ts = Fs.matches || Fs.webkitMatchesSelector || Fs.mozMatchesSelector || Fs.oMatchesSelector || Fs.msMatchesSelector;
                (Cs.prototype.matchesSelector = function (t, e) {
                    return Ts.call(t, e);
                }),
                    (Cs.prototype.querySelectorAll = function (t, e) {
                        return e.querySelectorAll(t);
                    }),
                    (Cs.prototype.indexes = []);
                var As = /^#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
                Cs.prototype.indexes.push({
                    name: "ID",
                    selector: function (t) {
                        var e;
                        if ((e = t.match(As))) return e[0].slice(1);
                    },
                    element: function (t) {
                        if (t.id) return [t.id];
                    },
                });
                var Ms = /^\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
                Cs.prototype.indexes.push({
                    name: "CLASS",
                    selector: function (t) {
                        var e;
                        if ((e = t.match(Ms))) return e[0].slice(1);
                    },
                    element: function (t) {
                        var e = t.className;
                        if (e) {
                            if ("string" == typeof e) return e.split(/\s/);
                            if ("object" == typeof e && "baseVal" in e) return e.baseVal.split(/\s/);
                        }
                    },
                });
                var Os,
                    Ss = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
                Cs.prototype.indexes.push({
                    name: "TAG",
                    selector: function (t) {
                        var e;
                        if ((e = t.match(Ss))) return e[0].toUpperCase();
                    },
                    element: function (t) {
                        return [t.nodeName.toUpperCase()];
                    },
                }),
                    (Cs.prototype.indexes.default = {
                        name: "UNIVERSAL",
                        selector: function () {
                            return !0;
                        },
                        element: function () {
                            return [!0];
                        },
                    }),
                    (Os =
                        "function" == typeof window.Map
                            ? window.Map
                            : (function () {
                                  function t() {
                                      this.map = {};
                                  }
                                  return (
                                      (t.prototype.get = function (t) {
                                          return this.map[t + " "];
                                      }),
                                      (t.prototype.set = function (t, e) {
                                          this.map[t + " "] = e;
                                      }),
                                      t
                                  );
                              })());
                var Ps = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;
                function ks(t, e) {
                    var r,
                        n,
                        i,
                        o,
                        s,
                        a,
                        u = (t = t.slice(0).concat(t.default)).length,
                        l = e,
                        h = [];
                    do {
                        if ((Ps.exec(""), (i = Ps.exec(l)) && ((l = i[3]), i[2] || !l)))
                            for (r = 0; r < u; r++)
                                if ((s = (a = t[r]).selector(i[1]))) {
                                    for (n = h.length, o = !1; n--; )
                                        if (h[n].index === a && h[n].key === s) {
                                            o = !0;
                                            break;
                                        }
                                    o || h.push({ index: a, key: s });
                                    break;
                                }
                    } while (i);
                    return h;
                }
                function Rs(t, e) {
                    var r, n, i;
                    for (r = 0, n = t.length; r < n; r++) if (((i = t[r]), e.isPrototypeOf(i))) return i;
                }
                function Bs(t, e) {
                    return t.id - e.id;
                }
                (Cs.prototype.logDefaultIndexUsed = function () {}),
                    (Cs.prototype.add = function (t, e) {
                        var r,
                            n,
                            i,
                            o,
                            s,
                            a,
                            u,
                            l,
                            h = this.activeIndexes,
                            c = this.selectors,
                            f = this.selectorObjects;
                        if ("string" == typeof t) {
                            for (f[(r = { id: this.uid++, selector: t, data: e }).id] = r, u = ks(this.indexes, t), n = 0; n < u.length; n++)
                                (o = (l = u[n]).key),
                                    (s = Rs(h, (i = l.index))) || (((s = Object.create(i)).map = new Os()), h.push(s)),
                                    i === this.indexes.default && this.logDefaultIndexUsed(r),
                                    (a = s.map.get(o)) || ((a = []), s.map.set(o, a)),
                                    a.push(r);
                            this.size++, c.push(t);
                        }
                    }),
                    (Cs.prototype.remove = function (t, e) {
                        if ("string" == typeof t) {
                            var r,
                                n,
                                i,
                                o,
                                s,
                                a,
                                u,
                                l,
                                h = this.activeIndexes,
                                c = (this.selectors = []),
                                f = this.selectorObjects,
                                p = {},
                                d = 1 === arguments.length;
                            for (r = ks(this.indexes, t), i = 0; i < r.length; i++)
                                for (n = r[i], o = h.length; o--; )
                                    if (((a = h[o]), n.index.isPrototypeOf(a))) {
                                        if ((u = a.map.get(n.key))) for (s = u.length; s--; ) (l = u[s]).selector !== t || (!d && l.data !== e) || (u.splice(s, 1), (p[l.id] = !0));
                                        break;
                                    }
                            for (i in p) delete f[i], this.size--;
                            for (i in f) c.push(f[i].selector);
                        }
                    }),
                    (Cs.prototype.queryAll = function (t) {
                        if (!this.selectors.length) return [];
                        var e,
                            r,
                            n,
                            i,
                            o,
                            s,
                            a,
                            u,
                            l = {},
                            h = [],
                            c = this.querySelectorAll(this.selectors.join(", "), t);
                        for (e = 0, n = c.length; e < n; e++)
                            for (o = c[e], r = 0, i = (s = this.matches(o)).length; r < i; r++)
                                l[(u = s[r]).id] ? (a = l[u.id]) : ((a = { id: u.id, selector: u.selector, data: u.data, elements: [] }), (l[u.id] = a), h.push(a)), a.elements.push(o);
                        return h.sort(Bs);
                    }),
                    (Cs.prototype.matches = function (t) {
                        if (!t) return [];
                        var e,
                            r,
                            n,
                            i,
                            o,
                            s,
                            a,
                            u,
                            l,
                            h,
                            c,
                            f = this.activeIndexes,
                            p = {},
                            d = [];
                        for (e = 0, i = f.length; e < i; e++)
                            if ((u = (a = f[e]).element(t)))
                                for (r = 0, o = u.length; r < o; r++) if ((l = a.map.get(u[r]))) for (n = 0, s = l.length; n < s; n++) !p[(c = (h = l[n]).id)] && this.matchesSelector(t, h.selector) && ((p[c] = !0), d.push(h));
                        return d.sort(Bs);
                    });
                const Ls = {},
                    js = {},
                    Ns = ["mouseenter", "mouseleave", "pointerenter", "pointerleave"];
                function zs(t) {
                    void 0 === js[t] && (js[t] = []);
                }
                function Is(t) {
                    return "string" == typeof t ? document.querySelectorAll(t) : t;
                }
                function Us(t) {
                    let e = (function (t, e) {
                        const r = [];
                        let n = e;
                        do {
                            if (1 !== n.nodeType) break;
                            const e = t.matches(n);
                            e.length && r.push({ delegatedTarget: n, stack: e });
                        } while ((n = n.parentElement));
                        return r;
                    })(Ls[t.type], t.target);
                    if (e.length)
                        for (let r = 0; r < e.length; r++)
                            for (let n = 0; n < e[r].stack.length; n++)
                                -1 !== Ns.indexOf(t.type) ? (Ys(t, e[r].delegatedTarget), t.target === e[r].delegatedTarget && e[r].stack[n].data(t)) : (Ys(t, e[r].delegatedTarget), e[r].stack[n].data(t));
                }
                function Ys(t, e) {
                    Object.defineProperty(t, "currentTarget", { configurable: !0, enumerable: !0, get: () => e });
                }
                function Xs(t) {
                    return JSON.parse(JSON.stringify(t));
                }
                var Vs = new (class {
                    bindAll(t, e) {
                        void 0 === e && (e = Object.getOwnPropertyNames(Object.getPrototypeOf(t)));
                        for (let r = 0; r < e.length; r++) t[e[r]] = t[e[r]].bind(t);
                    }
                    on(t, e, r, n) {
                        const i = t.split(" ");
                        for (let t = 0; t < i.length; t++)
                            if ("function" != typeof e || void 0 !== r)
                                if ((e.nodeType && 1 === e.nodeType) || e === window || e === document) e.addEventListener(i[t], r, n);
                                else {
                                    e = Is(e);
                                    for (let o = 0; o < e.length; o++) e[o].addEventListener(i[t], r, n);
                                }
                            else zs(i[t]), js[i[t]].push(e);
                    }
                    delegate(t, e, r) {
                        const n = t.split(" ");
                        for (let t = 0; t < n.length; t++) {
                            let i = Ls[n[t]];
                            void 0 === i && ((i = new Cs()), (Ls[n[t]] = i), -1 !== Ns.indexOf(n[t]) ? document.addEventListener(n[t], Us, !0) : document.addEventListener(n[t], Us)), i.add(e, r);
                        }
                    }
                    off(t, e, r, n) {
                        const i = t.split(" ");
                        for (let t = 0; t < i.length; t++) {
                            if (void 0 === e) {
                                js[i[t]] = [];
                                continue;
                            }
                            if ("function" == typeof e) {
                                zs(i[t]);
                                for (let r = 0; r < js[i[t]].length; r++) js[i[t]][r] === e && js[i[t]].splice(r, 1);
                                continue;
                            }
                            const o = Ls[i[t]];
                            if (void 0 === o || (o.remove(e, r), 0 !== o.size))
                                if (void 0 === e.removeEventListener) {
                                    e = Is(e);
                                    for (let o = 0; o < e.length; o++) e[o].removeEventListener(i[t], r, n);
                                } else e.removeEventListener(i[t], r, n);
                            else delete Ls[i[t]], -1 !== Ns.indexOf(i[t]) ? document.removeEventListener(i[t], Us, !0) : document.removeEventListener(i[t], Us);
                        }
                    }
                    emit(t, ...e) {
                        !(function (t, e) {
                            if (js[t]) for (let r = 0; r < js[t].length; r++) js[t][r](...e);
                        })(t, e);
                    }
                    debugDelegated() {
                        return Xs(Ls);
                    }
                    debugBus() {
                        return Xs(js);
                    }
                })();
                const Gs = Vs;
                function Ws(t) {
                    return (
                        (function (t) {
                            if (Array.isArray(t)) return Hs(t);
                        })(t) ||
                        (function (t) {
                            if (("undefined" != typeof Symbol && null != t[Symbol.iterator]) || null != t["@@iterator"]) return Array.from(t);
                        })(t) ||
                        (function (t, e) {
                            if (!t) return;
                            if ("string" == typeof t) return Hs(t, e);
                            var r = Object.prototype.toString.call(t).slice(8, -1);
                            "Object" === r && t.constructor && (r = t.constructor.name);
                            if ("Map" === r || "Set" === r) return Array.from(t);
                            if ("Arguments" === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return Hs(t, e);
                        })(t) ||
                        (function () {
                            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                        })()
                    );
                }
                function Hs(t, e) {
                    (null == e || e > t.length) && (e = t.length);
                    for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
                    return n;
                }
                var $s = function (t) {
                        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : document;
                        return e.querySelector(t);
                    },
                    Zs = function (t) {
                        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : document;
                        return Ws(e.querySelectorAll(t));
                    },
                    Ks = function (t) {
                        return t.getBoundingClientRect();
                    },
                    Qs = { body: document.body, menu: $s(".js-clip-menu") },
                    Js = { ww: window.innerWidth, wh: window.innerHeight, maxScroll: 0 },
                    ta = {
                        isFirefox: navigator.userAgent.indexOf("Firefox") > -1,
                        isSafari: navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") <= -1,
                        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ("MacIntel" === navigator.platform && navigator.maxTouchPoints > 1),
                        isSmall: window.matchMedia("(max-width: 649px)").matches,
                        isPortrait: window.matchMedia("(orientation: portrait)").matches,
                    };
                const ea = {
                    dom: Qs,
                    bounds: Js,
                    flags: { locked: 0, infiniteScroll: 1 },
                    fromPage: { routes: [], total: 0 },
                    device: ta,
                    features: {
                        hasWheelEvent: "onwheel" in document,
                        hasMouseWheelEvent: "onmousewheel" in document,
                        hasTouch: "ontouchstart" in document,
                        hasTouchWin: navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1,
                        hasPointer: !!window.navigator.msPointerEnabled,
                        hasKeyDown: "onkeydown" in document,
                        hasSmoothScroll: !ta.isMobile,
                    },
                };
                var ra = ea.features,
                    na = ea.device,
                    ia = na.isWindows,
                    oa = na.isFirefox;
                var sa = ea.flags;
                var aa = ea.device.isMobile;
                var ua = r(198),
                    la = r.n(ua),
                    ha = ea.bounds,
                    ca = ea.device,
                    fa = ca.isMobile;
                var pa = ea.dom,
                    da = ea.bounds,
                    ga = ea.flags;
                ea.features;
                function ma(t) {
                    let e = t[0],
                        r = t[1],
                        n = t[2];
                    return Math.sqrt(e * e + r * r + n * n);
                }
                function ya(t, e) {
                    return (t[0] = e[0]), (t[1] = e[1]), (t[2] = e[2]), t;
                }
                function va(t, e, r) {
                    return (t[0] = e[0] + r[0]), (t[1] = e[1] + r[1]), (t[2] = e[2] + r[2]), t;
                }
                function Da(t, e, r) {
                    return (t[0] = e[0] - r[0]), (t[1] = e[1] - r[1]), (t[2] = e[2] - r[2]), t;
                }
                function _a(t, e, r) {
                    return (t[0] = e[0] * r), (t[1] = e[1] * r), (t[2] = e[2] * r), t;
                }
                function ba(t) {
                    let e = t[0],
                        r = t[1],
                        n = t[2];
                    return e * e + r * r + n * n;
                }
                function xa(t, e) {
                    let r = e[0],
                        n = e[1],
                        i = e[2],
                        o = r * r + n * n + i * i;
                    return o > 0 && (o = 1 / Math.sqrt(o)), (t[0] = e[0] * o), (t[1] = e[1] * o), (t[2] = e[2] * o), t;
                }
                function wa(t, e) {
                    return t[0] * e[0] + t[1] * e[1] + t[2] * e[2];
                }
                function Ea(t, e, r) {
                    let n = e[0],
                        i = e[1],
                        o = e[2],
                        s = r[0],
                        a = r[1],
                        u = r[2];
                    return (t[0] = i * u - o * a), (t[1] = o * s - n * u), (t[2] = n * a - i * s), t;
                }
                const Ca = (function () {
                    const t = [0, 0, 0],
                        e = [0, 0, 0];
                    return function (r, n) {
                        ya(t, r), ya(e, n), xa(t, t), xa(e, e);
                        let i = wa(t, e);
                        return i > 1 ? 0 : i < -1 ? Math.PI : Math.acos(i);
                    };
                })();
                class Fa extends Array {
                    constructor(t = 0, e = t, r = t) {
                        return super(t, e, r), this;
                    }
                    get x() {
                        return this[0];
                    }
                    get y() {
                        return this[1];
                    }
                    get z() {
                        return this[2];
                    }
                    set x(t) {
                        this[0] = t;
                    }
                    set y(t) {
                        this[1] = t;
                    }
                    set z(t) {
                        this[2] = t;
                    }
                    set(t, e = t, r = t) {
                        return t.length
                            ? this.copy(t)
                            : ((function (t, e, r, n) {
                                  (t[0] = e), (t[1] = r), (t[2] = n);
                              })(this, t, e, r),
                              this);
                    }
                    copy(t) {
                        return ya(this, t), this;
                    }
                    add(t, e) {
                        return e ? va(this, t, e) : va(this, this, t), this;
                    }
                    sub(t, e) {
                        return e ? Da(this, t, e) : Da(this, this, t), this;
                    }
                    multiply(t) {
                        var e, r, n;
                        return t.length ? ((r = this), (n = t), ((e = this)[0] = r[0] * n[0]), (e[1] = r[1] * n[1]), (e[2] = r[2] * n[2])) : _a(this, this, t), this;
                    }
                    divide(t) {
                        var e, r, n;
                        return t.length ? ((r = this), (n = t), ((e = this)[0] = r[0] / n[0]), (e[1] = r[1] / n[1]), (e[2] = r[2] / n[2])) : _a(this, this, 1 / t), this;
                    }
                    inverse(t = this) {
                        var e, r;
                        return (r = t), ((e = this)[0] = 1 / r[0]), (e[1] = 1 / r[1]), (e[2] = 1 / r[2]), this;
                    }
                    len() {
                        return ma(this);
                    }
                    distance(t) {
                        return t
                            ? (function (t, e) {
                                  let r = e[0] - t[0],
                                      n = e[1] - t[1],
                                      i = e[2] - t[2];
                                  return Math.sqrt(r * r + n * n + i * i);
                              })(this, t)
                            : ma(this);
                    }
                    squaredLen() {
                        return ba(this);
                    }
                    squaredDistance(t) {
                        return t
                            ? (function (t, e) {
                                  let r = e[0] - t[0],
                                      n = e[1] - t[1],
                                      i = e[2] - t[2];
                                  return r * r + n * n + i * i;
                              })(this, t)
                            : ba(this);
                    }
                    negate(t = this) {
                        var e, r;
                        return (r = t), ((e = this)[0] = -r[0]), (e[1] = -r[1]), (e[2] = -r[2]), this;
                    }
                    cross(t, e) {
                        return e ? Ea(this, t, e) : Ea(this, this, t), this;
                    }
                    scale(t) {
                        return _a(this, this, t), this;
                    }
                    normalize() {
                        return xa(this, this), this;
                    }
                    dot(t) {
                        return wa(this, t);
                    }
                    equals(t) {
                        return (r = t), (e = this)[0] === r[0] && e[1] === r[1] && e[2] === r[2];
                        var e, r;
                    }
                    applyMatrix4(t) {
                        return (
                            (function (t, e, r) {
                                let n = e[0],
                                    i = e[1],
                                    o = e[2],
                                    s = r[3] * n + r[7] * i + r[11] * o + r[15];
                                (s = s || 1), (t[0] = (r[0] * n + r[4] * i + r[8] * o + r[12]) / s), (t[1] = (r[1] * n + r[5] * i + r[9] * o + r[13]) / s), (t[2] = (r[2] * n + r[6] * i + r[10] * o + r[14]) / s);
                            })(this, this, t),
                            this
                        );
                    }
                    scaleRotateMatrix4(t) {
                        return (
                            (function (t, e, r) {
                                let n = e[0],
                                    i = e[1],
                                    o = e[2],
                                    s = r[3] * n + r[7] * i + r[11] * o + r[15];
                                (s = s || 1), (t[0] = (r[0] * n + r[4] * i + r[8] * o) / s), (t[1] = (r[1] * n + r[5] * i + r[9] * o) / s), (t[2] = (r[2] * n + r[6] * i + r[10] * o) / s);
                            })(this, this, t),
                            this
                        );
                    }
                    applyQuaternion(t) {
                        return (
                            (function (t, e, r) {
                                let n = e[0],
                                    i = e[1],
                                    o = e[2],
                                    s = r[0],
                                    a = r[1],
                                    u = r[2],
                                    l = a * o - u * i,
                                    h = u * n - s * o,
                                    c = s * i - a * n,
                                    f = a * c - u * h,
                                    p = u * l - s * c,
                                    d = s * h - a * l,
                                    g = 2 * r[3];
                                (l *= g), (h *= g), (c *= g), (f *= 2), (p *= 2), (d *= 2), (t[0] = n + l + f), (t[1] = i + h + p), (t[2] = o + c + d);
                            })(this, this, t),
                            this
                        );
                    }
                    angle(t) {
                        return Ca(this, t);
                    }
                    lerp(t, e) {
                        return (
                            (function (t, e, r, n) {
                                let i = e[0],
                                    o = e[1],
                                    s = e[2];
                                (t[0] = i + n * (r[0] - i)), (t[1] = o + n * (r[1] - o)), (t[2] = s + n * (r[2] - s));
                            })(this, this, t, e),
                            this
                        );
                    }
                    clone() {
                        return new Fa(this[0], this[1], this[2]);
                    }
                    fromArray(t, e = 0) {
                        return (this[0] = t[e]), (this[1] = t[e + 1]), (this[2] = t[e + 2]), this;
                    }
                    toArray(t = [], e = 0) {
                        return (t[e] = this[0]), (t[e + 1] = this[1]), (t[e + 2] = this[2]), t;
                    }
                    transformDirection(t) {
                        const e = this[0],
                            r = this[1],
                            n = this[2];
                        return (this[0] = t[0] * e + t[4] * r + t[8] * n), (this[1] = t[1] * e + t[5] * r + t[9] * n), (this[2] = t[2] * e + t[6] * r + t[10] * n), this.normalize();
                    }
                }
                const Ta = new Fa();
                let Aa = 1;
                class Ma {
                    constructor({
                        canvas: t = document.createElement("canvas"),
                        width: e = 300,
                        height: r = 150,
                        dpr: n = 1,
                        alpha: i = !1,
                        depth: o = !0,
                        stencil: s = !1,
                        antialias: a = !1,
                        premultipliedAlpha: u = !1,
                        preserveDrawingBuffer: l = !1,
                        powerPreference: h = "default",
                        autoClear: c = !0,
                        webgl: f = 2,
                    } = {}) {
                        const p = { alpha: i, depth: o, stencil: s, antialias: a, premultipliedAlpha: u, preserveDrawingBuffer: l, powerPreference: h };
                        (this.dpr = n),
                            (this.alpha = i),
                            (this.color = !0),
                            (this.depth = o),
                            (this.stencil = s),
                            (this.premultipliedAlpha = u),
                            (this.autoClear = c),
                            (this.id = Aa++),
                            2 === f && (this.gl = t.getContext("webgl2", p)),
                            (this.isWebgl2 = !!this.gl),
                            this.gl || (this.gl = t.getContext("webgl", p)),
                            this.gl || console.error("unable to create webgl context"),
                            (this.gl.renderer = this),
                            this.setSize(e, r),
                            (this.state = {}),
                            (this.state.blendFunc = { src: this.gl.ONE, dst: this.gl.ZERO }),
                            (this.state.blendEquation = { modeRGB: this.gl.FUNC_ADD }),
                            (this.state.cullFace = null),
                            (this.state.frontFace = this.gl.CCW),
                            (this.state.depthMask = !0),
                            (this.state.depthFunc = this.gl.LESS),
                            (this.state.premultiplyAlpha = !1),
                            (this.state.flipY = !1),
                            (this.state.unpackAlignment = 4),
                            (this.state.framebuffer = null),
                            (this.state.viewport = { width: null, height: null }),
                            (this.state.textureUnits = []),
                            (this.state.activeTextureUnit = 0),
                            (this.state.boundBuffer = null),
                            (this.state.uniformLocations = new Map()),
                            (this.extensions = {}),
                            this.isWebgl2
                                ? (this.getExtension("EXT_color_buffer_float"), this.getExtension("OES_texture_float_linear"))
                                : (this.getExtension("OES_texture_float"),
                                  this.getExtension("OES_texture_float_linear"),
                                  this.getExtension("OES_texture_half_float"),
                                  this.getExtension("OES_texture_half_float_linear"),
                                  this.getExtension("OES_element_index_uint"),
                                  this.getExtension("OES_standard_derivatives"),
                                  this.getExtension("EXT_sRGB"),
                                  this.getExtension("WEBGL_depth_texture"),
                                  this.getExtension("WEBGL_draw_buffers")),
                            (this.vertexAttribDivisor = this.getExtension("ANGLE_instanced_arrays", "vertexAttribDivisor", "vertexAttribDivisorANGLE")),
                            (this.drawArraysInstanced = this.getExtension("ANGLE_instanced_arrays", "drawArraysInstanced", "drawArraysInstancedANGLE")),
                            (this.drawElementsInstanced = this.getExtension("ANGLE_instanced_arrays", "drawElementsInstanced", "drawElementsInstancedANGLE")),
                            (this.createVertexArray = this.getExtension("OES_vertex_array_object", "createVertexArray", "createVertexArrayOES")),
                            (this.bindVertexArray = this.getExtension("OES_vertex_array_object", "bindVertexArray", "bindVertexArrayOES")),
                            (this.deleteVertexArray = this.getExtension("OES_vertex_array_object", "deleteVertexArray", "deleteVertexArrayOES")),
                            (this.drawBuffers = this.getExtension("WEBGL_draw_buffers", "drawBuffers", "drawBuffersWEBGL")),
                            (this.parameters = {}),
                            (this.parameters.maxTextureUnits = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)),
                            (this.parameters.maxAnisotropy = this.getExtension("EXT_texture_filter_anisotropic") ? this.gl.getParameter(this.getExtension("EXT_texture_filter_anisotropic").MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0);
                    }
                    setSize(t, e) {
                        (this.width = t), (this.height = e), (this.gl.canvas.width = t * this.dpr), (this.gl.canvas.height = e * this.dpr), Object.assign(this.gl.canvas.style, { width: t + "px", height: e + "px" });
                    }
                    setViewport(t, e) {
                        (this.state.viewport.width === t && this.state.viewport.height === e) || ((this.state.viewport.width = t), (this.state.viewport.height = e), this.gl.viewport(0, 0, t, e));
                    }
                    enable(t) {
                        !0 !== this.state[t] && (this.gl.enable(t), (this.state[t] = !0));
                    }
                    disable(t) {
                        !1 !== this.state[t] && (this.gl.disable(t), (this.state[t] = !1));
                    }
                    setBlendFunc(t, e, r, n) {
                        (this.state.blendFunc.src === t && this.state.blendFunc.dst === e && this.state.blendFunc.srcAlpha === r && this.state.blendFunc.dstAlpha === n) ||
                            ((this.state.blendFunc.src = t),
                            (this.state.blendFunc.dst = e),
                            (this.state.blendFunc.srcAlpha = r),
                            (this.state.blendFunc.dstAlpha = n),
                            void 0 !== r ? this.gl.blendFuncSeparate(t, e, r, n) : this.gl.blendFunc(t, e));
                    }
                    setBlendEquation(t, e) {
                        (t = t || this.gl.FUNC_ADD),
                            (this.state.blendEquation.modeRGB === t && this.state.blendEquation.modeAlpha === e) ||
                                ((this.state.blendEquation.modeRGB = t), (this.state.blendEquation.modeAlpha = e), void 0 !== e ? this.gl.blendEquationSeparate(t, e) : this.gl.blendEquation(t));
                    }
                    setCullFace(t) {
                        this.state.cullFace !== t && ((this.state.cullFace = t), this.gl.cullFace(t));
                    }
                    setFrontFace(t) {
                        this.state.frontFace !== t && ((this.state.frontFace = t), this.gl.frontFace(t));
                    }
                    setDepthMask(t) {
                        this.state.depthMask !== t && ((this.state.depthMask = t), this.gl.depthMask(t));
                    }
                    setDepthFunc(t) {
                        this.state.depthFunc !== t && ((this.state.depthFunc = t), this.gl.depthFunc(t));
                    }
                    activeTexture(t) {
                        this.state.activeTextureUnit !== t && ((this.state.activeTextureUnit = t), this.gl.activeTexture(this.gl.TEXTURE0 + t));
                    }
                    bindFramebuffer({ target: t = this.gl.FRAMEBUFFER, buffer: e = null } = {}) {
                        this.state.framebuffer !== e && ((this.state.framebuffer = e), this.gl.bindFramebuffer(t, e));
                    }
                    getExtension(t, e, r) {
                        return e && this.gl[e]
                            ? this.gl[e].bind(this.gl)
                            : (this.extensions[t] || (this.extensions[t] = this.gl.getExtension(t)), e ? (this.extensions[t] ? this.extensions[t][r].bind(this.extensions[t]) : null) : this.extensions[t]);
                    }
                    sortOpaque(t, e) {
                        return t.renderOrder !== e.renderOrder ? t.renderOrder - e.renderOrder : t.program.id !== e.program.id ? t.program.id - e.program.id : t.zDepth !== e.zDepth ? t.zDepth - e.zDepth : e.id - t.id;
                    }
                    sortTransparent(t, e) {
                        return t.renderOrder !== e.renderOrder ? t.renderOrder - e.renderOrder : t.zDepth !== e.zDepth ? e.zDepth - t.zDepth : e.id - t.id;
                    }
                    sortUI(t, e) {
                        return t.renderOrder !== e.renderOrder ? t.renderOrder - e.renderOrder : t.program.id !== e.program.id ? t.program.id - e.program.id : e.id - t.id;
                    }
                    getRenderList({ scene: t, camera: e, frustumCull: r, sort: n }) {
                        let i = [];
                        if (
                            (e && r && e.updateFrustum(),
                            t.traverse((t) => {
                                if (!t.visible) return !0;
                                t.draw && ((r && t.frustumCulled && e && !e.frustumIntersectsMesh(t)) || i.push(t));
                            }),
                            n)
                        ) {
                            const t = [],
                                r = [],
                                n = [];
                            i.forEach((i) => {
                                i.program.transparent ? (i.program.depthTest ? r.push(i) : n.push(i)) : t.push(i),
                                    (i.zDepth = 0),
                                    0 === i.renderOrder && i.program.depthTest && e && (i.worldMatrix.getTranslation(Ta), Ta.applyMatrix4(e.projectionViewMatrix), (i.zDepth = Ta.z));
                            }),
                                t.sort(this.sortOpaque),
                                r.sort(this.sortTransparent),
                                n.sort(this.sortUI),
                                (i = t.concat(r, n));
                        }
                        return i;
                    }
                    render({ scene: t, camera: e, target: r = null, update: n = !0, sort: i = !0, frustumCull: o = !0, clear: s }) {
                        null === r ? (this.bindFramebuffer(), this.setViewport(this.width * this.dpr, this.height * this.dpr)) : (this.bindFramebuffer(r), this.setViewport(r.width, r.height)),
                            (s || (this.autoClear && !1 !== s)) &&
                                (!this.depth || (r && !r.depth) || (this.enable(this.gl.DEPTH_TEST), this.setDepthMask(!0)),
                                this.gl.clear((this.color ? this.gl.COLOR_BUFFER_BIT : 0) | (this.depth ? this.gl.DEPTH_BUFFER_BIT : 0) | (this.stencil ? this.gl.STENCIL_BUFFER_BIT : 0))),
                            n && t.updateMatrixWorld(),
                            e && e.updateMatrixWorld();
                        this.getRenderList({ scene: t, camera: e, frustumCull: o, sort: i }).forEach((t) => {
                            t.draw({ camera: e });
                        });
                    }
                }
                const Oa = new Fa();
                let Sa = 1,
                    Pa = 1,
                    ka = !1;
                class Ra {
                    constructor(t, e = {}) {
                        t.canvas || console.error("gl not passed as first argument to Geometry"),
                            (this.gl = t),
                            (this.attributes = e),
                            (this.id = Sa++),
                            (this.VAOs = {}),
                            (this.drawRange = { start: 0, count: 0 }),
                            (this.instancedCount = 0),
                            this.gl.renderer.bindVertexArray(null),
                            (this.gl.renderer.currentGeometry = null),
                            (this.glState = this.gl.renderer.state);
                        for (let t in e) this.addAttribute(t, e[t]);
                    }
                    addAttribute(t, e) {
                        if (
                            ((this.attributes[t] = e),
                            (e.id = Pa++),
                            (e.size = e.size || 1),
                            (e.type = e.type || (e.data.constructor === Float32Array ? this.gl.FLOAT : e.data.constructor === Uint16Array ? this.gl.UNSIGNED_SHORT : this.gl.UNSIGNED_INT)),
                            (e.target = "index" === t ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER),
                            (e.normalized = e.normalized || !1),
                            (e.stride = e.stride || 0),
                            (e.offset = e.offset || 0),
                            (e.count = e.count || (e.stride ? e.data.byteLength / e.stride : e.data.length / e.size)),
                            (e.divisor = e.instanced || 0),
                            (e.needsUpdate = !1),
                            e.buffer || ((e.buffer = this.gl.createBuffer()), this.updateAttribute(e)),
                            e.divisor)
                        ) {
                            if (((this.isInstanced = !0), this.instancedCount && this.instancedCount !== e.count * e.divisor))
                                return console.warn("geometry has multiple instanced buffers of different length"), (this.instancedCount = Math.min(this.instancedCount, e.count * e.divisor));
                            this.instancedCount = e.count * e.divisor;
                        } else "index" === t ? (this.drawRange.count = e.count) : this.attributes.index || (this.drawRange.count = Math.max(this.drawRange.count, e.count));
                    }
                    updateAttribute(t) {
                        this.glState.boundBuffer !== t.buffer && (this.gl.bindBuffer(t.target, t.buffer), (this.glState.boundBuffer = t.buffer)), this.gl.bufferData(t.target, t.data, this.gl.STATIC_DRAW), (t.needsUpdate = !1);
                    }
                    setIndex(t) {
                        this.addAttribute("index", t);
                    }
                    setDrawRange(t, e) {
                        (this.drawRange.start = t), (this.drawRange.count = e);
                    }
                    setInstancedCount(t) {
                        this.instancedCount = t;
                    }
                    createVAO(t) {
                        (this.VAOs[t.attributeOrder] = this.gl.renderer.createVertexArray()), this.gl.renderer.bindVertexArray(this.VAOs[t.attributeOrder]), this.bindAttributes(t);
                    }
                    bindAttributes(t) {
                        t.attributeLocations.forEach((t, { name: e, type: r }) => {
                            if (!this.attributes[e]) return void console.warn(`active attribute ${e} not being supplied`);
                            const n = this.attributes[e];
                            this.gl.bindBuffer(n.target, n.buffer), (this.glState.boundBuffer = n.buffer);
                            let i = 1;
                            35674 === r && (i = 2), 35675 === r && (i = 3), 35676 === r && (i = 4);
                            const o = n.size / i,
                                s = 1 === i ? 0 : i * i * i,
                                a = 1 === i ? 0 : i * i;
                            for (let e = 0; e < i; e++)
                                this.gl.vertexAttribPointer(t + e, o, n.type, n.normalized, n.stride + s, n.offset + e * a), this.gl.enableVertexAttribArray(t + e), this.gl.renderer.vertexAttribDivisor(t + e, n.divisor);
                        }),
                            this.attributes.index && this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.attributes.index.buffer);
                    }
                    draw({ program: t, mode: e = this.gl.TRIANGLES }) {
                        this.gl.renderer.currentGeometry !== `${this.id}_${t.attributeOrder}` &&
                            (this.VAOs[t.attributeOrder] || this.createVAO(t), this.gl.renderer.bindVertexArray(this.VAOs[t.attributeOrder]), (this.gl.renderer.currentGeometry = `${this.id}_${t.attributeOrder}`)),
                            t.attributeLocations.forEach((t, { name: e }) => {
                                const r = this.attributes[e];
                                r.needsUpdate && this.updateAttribute(r);
                            }),
                            this.isInstanced
                                ? this.attributes.index
                                    ? this.gl.renderer.drawElementsInstanced(e, this.drawRange.count, this.attributes.index.type, this.attributes.index.offset + 2 * this.drawRange.start, this.instancedCount)
                                    : this.gl.renderer.drawArraysInstanced(e, this.drawRange.start, this.drawRange.count, this.instancedCount)
                                : this.attributes.index
                                ? this.gl.drawElements(e, this.drawRange.count, this.attributes.index.type, this.attributes.index.offset + 2 * this.drawRange.start)
                                : this.gl.drawArrays(e, this.drawRange.start, this.drawRange.count);
                    }
                    getPosition() {
                        const t = this.attributes.position;
                        return t.data ? t : ka ? void 0 : (console.warn("No position buffer data found to compute bounds"), (ka = !0));
                    }
                    computeBoundingBox(t) {
                        t || (t = this.getPosition());
                        const e = t.data,
                            r = t.offset || 0,
                            n = t.stride || t.size;
                        this.bounds || (this.bounds = { min: new Fa(), max: new Fa(), center: new Fa(), scale: new Fa(), radius: 1 / 0 });
                        const i = this.bounds.min,
                            o = this.bounds.max,
                            s = this.bounds.center,
                            a = this.bounds.scale;
                        i.set(1 / 0), o.set(-1 / 0);
                        for (let t = r, s = e.length; t < s; t += n) {
                            const r = e[t],
                                n = e[t + 1],
                                s = e[t + 2];
                            (i.x = Math.min(r, i.x)), (i.y = Math.min(n, i.y)), (i.z = Math.min(s, i.z)), (o.x = Math.max(r, o.x)), (o.y = Math.max(n, o.y)), (o.z = Math.max(s, o.z));
                        }
                        a.sub(o, i), s.add(i, o).divide(2);
                    }
                    computeBoundingSphere(t) {
                        t || (t = this.getPosition());
                        const e = t.data,
                            r = t.offset || 0,
                            n = t.stride || t.size;
                        this.bounds || this.computeBoundingBox(t);
                        let i = 0;
                        for (let t = r, o = e.length; t < o; t += n) Oa.fromArray(e, t), (i = Math.max(i, this.bounds.center.squaredDistance(Oa)));
                        this.bounds.radius = Math.sqrt(i);
                    }
                    remove() {
                        for (let t in this.VAOs) this.gl.renderer.deleteVertexArray(this.VAOs[t]), delete this.VAOs[t];
                        for (let t in this.attributes) this.gl.deleteBuffer(this.attributes[t].buffer), delete this.attributes[t];
                    }
                }
                class Ba extends Ra {
                    constructor(t, { attributes: e = {} } = {}) {
                        Object.assign(e, { position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) }, uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) } }), super(t, e);
                    }
                }
                let La = 1;
                const ja = {};
                class Na {
                    constructor(t, { vertex: e, fragment: r, uniforms: n = {}, transparent: i = !1, cullFace: o = t.BACK, frontFace: s = t.CCW, depthTest: a = !0, depthWrite: u = !0, depthFunc: l = t.LESS } = {}) {
                        t.canvas || console.error("gl not passed as fist argument to Program"),
                            (this.gl = t),
                            (this.uniforms = n),
                            (this.id = La++),
                            e || console.warn("vertex shader not supplied"),
                            r || console.warn("fragment shader not supplied"),
                            (this.transparent = i),
                            (this.cullFace = o),
                            (this.frontFace = s),
                            (this.depthTest = a),
                            (this.depthWrite = u),
                            (this.depthFunc = l),
                            (this.blendFunc = {}),
                            (this.blendEquation = {}),
                            this.transparent && !this.blendFunc.src && (this.gl.renderer.premultipliedAlpha ? this.setBlendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA) : this.setBlendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA));
                        const h = t.createShader(t.VERTEX_SHADER);
                        t.shaderSource(h, e), t.compileShader(h), "" !== t.getShaderInfoLog(h) && console.warn(`${t.getShaderInfoLog(h)}\nVertex Shader\n${Ia(e)}`);
                        const c = t.createShader(t.FRAGMENT_SHADER);
                        if (
                            (t.shaderSource(c, r),
                            t.compileShader(c),
                            "" !== t.getShaderInfoLog(c) && console.warn(`${t.getShaderInfoLog(c)}\nFragment Shader\n${Ia(r)}`),
                            (this.program = t.createProgram()),
                            t.attachShader(this.program, h),
                            t.attachShader(this.program, c),
                            t.linkProgram(this.program),
                            !t.getProgramParameter(this.program, t.LINK_STATUS))
                        )
                            return console.warn(t.getProgramInfoLog(this.program));
                        t.deleteShader(h), t.deleteShader(c), (this.uniformLocations = new Map());
                        let f = t.getProgramParameter(this.program, t.ACTIVE_UNIFORMS);
                        for (let e = 0; e < f; e++) {
                            let r = t.getActiveUniform(this.program, e);
                            this.uniformLocations.set(r, t.getUniformLocation(this.program, r.name));
                            const n = r.name.match(/(\w+)/g);
                            (r.uniformName = n[0]),
                                3 === n.length ? ((r.isStructArray = !0), (r.structIndex = Number(n[1])), (r.structProperty = n[2])) : 2 === n.length && isNaN(Number(n[1])) && ((r.isStruct = !0), (r.structProperty = n[1]));
                        }
                        this.attributeLocations = new Map();
                        const p = [],
                            d = t.getProgramParameter(this.program, t.ACTIVE_ATTRIBUTES);
                        for (let e = 0; e < d; e++) {
                            const r = t.getActiveAttrib(this.program, e),
                                n = t.getAttribLocation(this.program, r.name);
                            (p[n] = r.name), this.attributeLocations.set(r, n);
                        }
                        this.attributeOrder = p.join("");
                    }
                    setBlendFunc(t, e, r, n) {
                        (this.blendFunc.src = t), (this.blendFunc.dst = e), (this.blendFunc.srcAlpha = r), (this.blendFunc.dstAlpha = n), t && (this.transparent = !0);
                    }
                    setBlendEquation(t, e) {
                        (this.blendEquation.modeRGB = t), (this.blendEquation.modeAlpha = e);
                    }
                    applyState() {
                        this.depthTest ? this.gl.renderer.enable(this.gl.DEPTH_TEST) : this.gl.renderer.disable(this.gl.DEPTH_TEST),
                            this.cullFace ? this.gl.renderer.enable(this.gl.CULL_FACE) : this.gl.renderer.disable(this.gl.CULL_FACE),
                            this.blendFunc.src ? this.gl.renderer.enable(this.gl.BLEND) : this.gl.renderer.disable(this.gl.BLEND),
                            this.cullFace && this.gl.renderer.setCullFace(this.cullFace),
                            this.gl.renderer.setFrontFace(this.frontFace),
                            this.gl.renderer.setDepthMask(this.depthWrite),
                            this.gl.renderer.setDepthFunc(this.depthFunc),
                            this.blendFunc.src && this.gl.renderer.setBlendFunc(this.blendFunc.src, this.blendFunc.dst, this.blendFunc.srcAlpha, this.blendFunc.dstAlpha),
                            this.gl.renderer.setBlendEquation(this.blendEquation.modeRGB, this.blendEquation.modeAlpha);
                    }
                    use({ flipFaces: t = !1 } = {}) {
                        let e = -1;
                        this.gl.renderer.currentProgram === this.id || (this.gl.useProgram(this.program), (this.gl.renderer.currentProgram = this.id)),
                            this.uniformLocations.forEach((t, r) => {
                                let n = r.uniformName,
                                    i = this.uniforms[n];
                                if ((r.isStruct && ((i = i[r.structProperty]), (n += `.${r.structProperty}`)), r.isStructArray && ((i = i[r.structIndex][r.structProperty]), (n += `[${r.structIndex}].${r.structProperty}`)), !i))
                                    return Ya(`Active uniform ${n} has not been supplied`);
                                if (i && void 0 === i.value) return Ya(`${n} uniform is missing a value parameter`);
                                if (i.value.texture) return (e += 1), i.value.update(e), za(this.gl, r.type, t, e);
                                if (i.value.length && i.value[0].texture) {
                                    const n = [];
                                    return (
                                        i.value.forEach((t) => {
                                            (e += 1), t.update(e), n.push(e);
                                        }),
                                        za(this.gl, r.type, t, n)
                                    );
                                }
                                za(this.gl, r.type, t, i.value);
                            }),
                            this.applyState(),
                            t && this.gl.renderer.setFrontFace(this.frontFace === this.gl.CCW ? this.gl.CW : this.gl.CCW);
                    }
                    remove() {
                        this.gl.deleteProgram(this.program);
                    }
                }
                function za(t, e, r, n) {
                    n = n.length
                        ? (function (t) {
                              const e = t.length,
                                  r = t[0].length;
                              if (void 0 === r) return t;
                              const n = e * r;
                              let i = ja[n];
                              i || (ja[n] = i = new Float32Array(n));
                              for (let n = 0; n < e; n++) i.set(t[n], n * r);
                              return i;
                          })(n)
                        : n;
                    const i = t.renderer.state.uniformLocations.get(r);
                    if (n.length)
                        if (void 0 === i || i.length !== n.length) t.renderer.state.uniformLocations.set(r, n.slice(0));
                        else {
                            if (
                                (function (t, e) {
                                    if (t.length !== e.length) return !1;
                                    for (let r = 0, n = t.length; r < n; r++) if (t[r] !== e[r]) return !1;
                                    return !0;
                                })(i, n)
                            )
                                return;
                            i.set
                                ? i.set(n)
                                : (function (t, e) {
                                      for (let r = 0, n = t.length; r < n; r++) t[r] = e[r];
                                  })(i, n),
                                t.renderer.state.uniformLocations.set(r, i);
                        }
                    else {
                        if (i === n) return;
                        t.renderer.state.uniformLocations.set(r, n);
                    }
                    switch (e) {
                        case 5126:
                            return n.length ? t.uniform1fv(r, n) : t.uniform1f(r, n);
                        case 35664:
                            return t.uniform2fv(r, n);
                        case 35665:
                            return t.uniform3fv(r, n);
                        case 35666:
                            return t.uniform4fv(r, n);
                        case 35670:
                        case 5124:
                        case 35678:
                        case 35680:
                            return n.length ? t.uniform1iv(r, n) : t.uniform1i(r, n);
                        case 35671:
                        case 35667:
                            return t.uniform2iv(r, n);
                        case 35672:
                        case 35668:
                            return t.uniform3iv(r, n);
                        case 35673:
                        case 35669:
                            return t.uniform4iv(r, n);
                        case 35674:
                            return t.uniformMatrix2fv(r, !1, n);
                        case 35675:
                            return t.uniformMatrix3fv(r, !1, n);
                        case 35676:
                            return t.uniformMatrix4fv(r, !1, n);
                    }
                }
                function Ia(t) {
                    let e = t.split("\n");
                    for (let t = 0; t < e.length; t++) e[t] = t + 1 + ": " + e[t];
                    return e.join("\n");
                }
                let Ua = 0;
                function Ya(t) {
                    Ua > 100 || (console.warn(t), Ua++, Ua > 100 && console.warn("More than 100 program warnings - stopping logs."));
                }
                const Xa = { black: "#000000", white: "#ffffff", red: "#ff0000", green: "#00ff00", blue: "#0000ff", fuchsia: "#ff00ff", cyan: "#00ffff", yellow: "#ffff00", orange: "#ff8000" };
                function qa(t) {
                    4 === t.length && (t = t[0] + t[1] + t[1] + t[2] + t[2] + t[3] + t[3]);
                    const e = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);
                    return e || console.warn(`Unable to convert hex string ${t} to rgb values`), [parseInt(e[1], 16) / 255, parseInt(e[2], 16) / 255, parseInt(e[3], 16) / 255];
                }
                function Va(t) {
                    return [(((t = parseInt(t)) >> 16) & 255) / 255, ((t >> 8) & 255) / 255, (255 & t) / 255];
                }
                function Ga(t) {
                    return void 0 === t ? [0, 0, 0] : 3 === arguments.length ? arguments : isNaN(t) ? ("#" === t[0] ? qa(t) : Xa[t.toLowerCase()] ? qa(Xa[t.toLowerCase()]) : (console.warn("Color format not recognised"), [0, 0, 0])) : Va(t);
                }
                class Wa extends Array {
                    constructor(t) {
                        return Array.isArray(t) ? super(...t) : super(...Ga(...arguments));
                    }
                    get r() {
                        return this[0];
                    }
                    get g() {
                        return this[1];
                    }
                    get b() {
                        return this[2];
                    }
                    set r(t) {
                        this[0] = t;
                    }
                    set g(t) {
                        this[1] = t;
                    }
                    set b(t) {
                        this[2] = t;
                    }
                    set(t) {
                        return Array.isArray(t) ? this.copy(t) : this.copy(Ga(...arguments));
                    }
                    copy(t) {
                        return (this[0] = t[0]), (this[1] = t[1]), (this[2] = t[2]), this;
                    }
                }
                function Ha(t, e, r) {
                    let n = e[0],
                        i = e[1],
                        o = e[2],
                        s = e[3],
                        a = r[0],
                        u = r[1],
                        l = r[2],
                        h = r[3];
                    return (t[0] = n * h + s * a + i * l - o * u), (t[1] = i * h + s * u + o * a - n * l), (t[2] = o * h + s * l + n * u - i * a), (t[3] = s * h - n * a - i * u - o * l), t;
                }
                const $a = function (t, e) {
                        return (t[0] = e[0]), (t[1] = e[1]), (t[2] = e[2]), (t[3] = e[3]), t;
                    },
                    Za = function (t, e, r, n, i) {
                        return (t[0] = e), (t[1] = r), (t[2] = n), (t[3] = i), t;
                    },
                    Ka = function (t, e) {
                        return t[0] * e[0] + t[1] * e[1] + t[2] * e[2] + t[3] * e[3];
                    },
                    Qa = function (t, e) {
                        let r = e[0],
                            n = e[1],
                            i = e[2],
                            o = e[3],
                            s = r * r + n * n + i * i + o * o;
                        return s > 0 && (s = 1 / Math.sqrt(s)), (t[0] = r * s), (t[1] = n * s), (t[2] = i * s), (t[3] = o * s), t;
                    };
                class Ja extends Array {
                    constructor(t = 0, e = 0, r = 0, n = 1) {
                        return super(t, e, r, n), (this.onChange = () => {}), this;
                    }
                    get x() {
                        return this[0];
                    }
                    get y() {
                        return this[1];
                    }
                    get z() {
                        return this[2];
                    }
                    get w() {
                        return this[3];
                    }
                    set x(t) {
                        (this[0] = t), this.onChange();
                    }
                    set y(t) {
                        (this[1] = t), this.onChange();
                    }
                    set z(t) {
                        (this[2] = t), this.onChange();
                    }
                    set w(t) {
                        (this[3] = t), this.onChange();
                    }
                    identity() {
                        var t;
                        return ((t = this)[0] = 0), (t[1] = 0), (t[2] = 0), (t[3] = 1), this.onChange(), this;
                    }
                    set(t, e, r, n) {
                        return t.length ? this.copy(t) : (Za(this, t, e, r, n), this.onChange(), this);
                    }
                    rotateX(t) {
                        return (
                            (function (t, e, r) {
                                r *= 0.5;
                                let n = e[0],
                                    i = e[1],
                                    o = e[2],
                                    s = e[3],
                                    a = Math.sin(r),
                                    u = Math.cos(r);
                                (t[0] = n * u + s * a), (t[1] = i * u + o * a), (t[2] = o * u - i * a), (t[3] = s * u - n * a);
                            })(this, this, t),
                            this.onChange(),
                            this
                        );
                    }
                    rotateY(t) {
                        return (
                            (function (t, e, r) {
                                r *= 0.5;
                                let n = e[0],
                                    i = e[1],
                                    o = e[2],
                                    s = e[3],
                                    a = Math.sin(r),
                                    u = Math.cos(r);
                                (t[0] = n * u - o * a), (t[1] = i * u + s * a), (t[2] = o * u + n * a), (t[3] = s * u - i * a);
                            })(this, this, t),
                            this.onChange(),
                            this
                        );
                    }
                    rotateZ(t) {
                        return (
                            (function (t, e, r) {
                                r *= 0.5;
                                let n = e[0],
                                    i = e[1],
                                    o = e[2],
                                    s = e[3],
                                    a = Math.sin(r),
                                    u = Math.cos(r);
                                (t[0] = n * u + i * a), (t[1] = i * u - n * a), (t[2] = o * u + s * a), (t[3] = s * u - o * a);
                            })(this, this, t),
                            this.onChange(),
                            this
                        );
                    }
                    inverse(t = this) {
                        return (
                            (function (t, e) {
                                let r = e[0],
                                    n = e[1],
                                    i = e[2],
                                    o = e[3],
                                    s = r * r + n * n + i * i + o * o,
                                    a = s ? 1 / s : 0;
                                (t[0] = -r * a), (t[1] = -n * a), (t[2] = -i * a), (t[3] = o * a);
                            })(this, t),
                            this.onChange(),
                            this
                        );
                    }
                    conjugate(t = this) {
                        var e, r;
                        return (r = t), ((e = this)[0] = -r[0]), (e[1] = -r[1]), (e[2] = -r[2]), (e[3] = r[3]), this.onChange(), this;
                    }
                    copy(t) {
                        return $a(this, t), this.onChange(), this;
                    }
                    normalize(t = this) {
                        return Qa(this, t), this.onChange(), this;
                    }
                    multiply(t, e) {
                        return e ? Ha(this, t, e) : Ha(this, this, t), this.onChange(), this;
                    }
                    dot(t) {
                        return Ka(this, t);
                    }
                    fromMatrix3(t) {
                        return (
                            (function (t, e) {
                                let r,
                                    n = e[0] + e[4] + e[8];
                                if (n > 0) (r = Math.sqrt(n + 1)), (t[3] = 0.5 * r), (r = 0.5 / r), (t[0] = (e[5] - e[7]) * r), (t[1] = (e[6] - e[2]) * r), (t[2] = (e[1] - e[3]) * r);
                                else {
                                    let n = 0;
                                    e[4] > e[0] && (n = 1), e[8] > e[3 * n + n] && (n = 2);
                                    let i = (n + 1) % 3,
                                        o = (n + 2) % 3;
                                    (r = Math.sqrt(e[3 * n + n] - e[3 * i + i] - e[3 * o + o] + 1)),
                                        (t[n] = 0.5 * r),
                                        (r = 0.5 / r),
                                        (t[3] = (e[3 * i + o] - e[3 * o + i]) * r),
                                        (t[i] = (e[3 * i + n] + e[3 * n + i]) * r),
                                        (t[o] = (e[3 * o + n] + e[3 * n + o]) * r);
                                }
                            })(this, t),
                            this.onChange(),
                            this
                        );
                    }
                    fromEuler(t) {
                        return (
                            (function (t, e, r = "YXZ") {
                                let n = Math.sin(0.5 * e[0]),
                                    i = Math.cos(0.5 * e[0]),
                                    o = Math.sin(0.5 * e[1]),
                                    s = Math.cos(0.5 * e[1]),
                                    a = Math.sin(0.5 * e[2]),
                                    u = Math.cos(0.5 * e[2]);
                                "XYZ" === r
                                    ? ((t[0] = n * s * u + i * o * a), (t[1] = i * o * u - n * s * a), (t[2] = i * s * a + n * o * u), (t[3] = i * s * u - n * o * a))
                                    : "YXZ" === r
                                    ? ((t[0] = n * s * u + i * o * a), (t[1] = i * o * u - n * s * a), (t[2] = i * s * a - n * o * u), (t[3] = i * s * u + n * o * a))
                                    : "ZXY" === r
                                    ? ((t[0] = n * s * u - i * o * a), (t[1] = i * o * u + n * s * a), (t[2] = i * s * a + n * o * u), (t[3] = i * s * u - n * o * a))
                                    : "ZYX" === r
                                    ? ((t[0] = n * s * u - i * o * a), (t[1] = i * o * u + n * s * a), (t[2] = i * s * a - n * o * u), (t[3] = i * s * u + n * o * a))
                                    : "YZX" === r
                                    ? ((t[0] = n * s * u + i * o * a), (t[1] = i * o * u + n * s * a), (t[2] = i * s * a - n * o * u), (t[3] = i * s * u - n * o * a))
                                    : "XZY" === r && ((t[0] = n * s * u - i * o * a), (t[1] = i * o * u - n * s * a), (t[2] = i * s * a + n * o * u), (t[3] = i * s * u + n * o * a));
                            })(this, t, t.order),
                            this
                        );
                    }
                    fromAxisAngle(t, e) {
                        return (
                            (function (t, e, r) {
                                r *= 0.5;
                                let n = Math.sin(r);
                                (t[0] = n * e[0]), (t[1] = n * e[1]), (t[2] = n * e[2]), (t[3] = Math.cos(r));
                            })(this, t, e),
                            this
                        );
                    }
                    slerp(t, e) {
                        return (
                            (function (t, e, r, n) {
                                let i,
                                    o,
                                    s,
                                    a,
                                    u,
                                    l = e[0],
                                    h = e[1],
                                    c = e[2],
                                    f = e[3],
                                    p = r[0],
                                    d = r[1],
                                    g = r[2],
                                    m = r[3];
                                (o = l * p + h * d + c * g + f * m),
                                    o < 0 && ((o = -o), (p = -p), (d = -d), (g = -g), (m = -m)),
                                    1 - o > 1e-6 ? ((i = Math.acos(o)), (s = Math.sin(i)), (a = Math.sin((1 - n) * i) / s), (u = Math.sin(n * i) / s)) : ((a = 1 - n), (u = n)),
                                    (t[0] = a * l + u * p),
                                    (t[1] = a * h + u * d),
                                    (t[2] = a * c + u * g),
                                    (t[3] = a * f + u * m);
                            })(this, this, t, e),
                            this
                        );
                    }
                    fromArray(t, e = 0) {
                        return (this[0] = t[e]), (this[1] = t[e + 1]), (this[2] = t[e + 2]), (this[3] = t[e + 3]), this;
                    }
                    toArray(t = [], e = 0) {
                        return (t[e] = this[0]), (t[e + 1] = this[1]), (t[e + 2] = this[2]), (t[e + 3] = this[3]), t;
                    }
                }
                function tu(t, e, r) {
                    let n = e[0],
                        i = e[1],
                        o = e[2],
                        s = e[3],
                        a = e[4],
                        u = e[5],
                        l = e[6],
                        h = e[7],
                        c = e[8],
                        f = e[9],
                        p = e[10],
                        d = e[11],
                        g = e[12],
                        m = e[13],
                        y = e[14],
                        v = e[15],
                        D = r[0],
                        _ = r[1],
                        b = r[2],
                        x = r[3];
                    return (
                        (t[0] = D * n + _ * a + b * c + x * g),
                        (t[1] = D * i + _ * u + b * f + x * m),
                        (t[2] = D * o + _ * l + b * p + x * y),
                        (t[3] = D * s + _ * h + b * d + x * v),
                        (D = r[4]),
                        (_ = r[5]),
                        (b = r[6]),
                        (x = r[7]),
                        (t[4] = D * n + _ * a + b * c + x * g),
                        (t[5] = D * i + _ * u + b * f + x * m),
                        (t[6] = D * o + _ * l + b * p + x * y),
                        (t[7] = D * s + _ * h + b * d + x * v),
                        (D = r[8]),
                        (_ = r[9]),
                        (b = r[10]),
                        (x = r[11]),
                        (t[8] = D * n + _ * a + b * c + x * g),
                        (t[9] = D * i + _ * u + b * f + x * m),
                        (t[10] = D * o + _ * l + b * p + x * y),
                        (t[11] = D * s + _ * h + b * d + x * v),
                        (D = r[12]),
                        (_ = r[13]),
                        (b = r[14]),
                        (x = r[15]),
                        (t[12] = D * n + _ * a + b * c + x * g),
                        (t[13] = D * i + _ * u + b * f + x * m),
                        (t[14] = D * o + _ * l + b * p + x * y),
                        (t[15] = D * s + _ * h + b * d + x * v),
                        t
                    );
                }
                function eu(t, e) {
                    let r = e[0],
                        n = e[1],
                        i = e[2],
                        o = e[4],
                        s = e[5],
                        a = e[6],
                        u = e[8],
                        l = e[9],
                        h = e[10];
                    return (t[0] = Math.hypot(r, n, i)), (t[1] = Math.hypot(o, s, a)), (t[2] = Math.hypot(u, l, h)), t;
                }
                const ru = (function () {
                    const t = [0, 0, 0];
                    return function (e, r) {
                        let n = t;
                        eu(n, r);
                        let i = 1 / n[0],
                            o = 1 / n[1],
                            s = 1 / n[2],
                            a = r[0] * i,
                            u = r[1] * o,
                            l = r[2] * s,
                            h = r[4] * i,
                            c = r[5] * o,
                            f = r[6] * s,
                            p = r[8] * i,
                            d = r[9] * o,
                            g = r[10] * s,
                            m = a + c + g,
                            y = 0;
                        return (
                            m > 0
                                ? ((y = 2 * Math.sqrt(m + 1)), (e[3] = 0.25 * y), (e[0] = (f - d) / y), (e[1] = (p - l) / y), (e[2] = (u - h) / y))
                                : a > c && a > g
                                ? ((y = 2 * Math.sqrt(1 + a - c - g)), (e[3] = (f - d) / y), (e[0] = 0.25 * y), (e[1] = (u + h) / y), (e[2] = (p + l) / y))
                                : c > g
                                ? ((y = 2 * Math.sqrt(1 + c - a - g)), (e[3] = (p - l) / y), (e[0] = (u + h) / y), (e[1] = 0.25 * y), (e[2] = (f + d) / y))
                                : ((y = 2 * Math.sqrt(1 + g - a - c)), (e[3] = (u - h) / y), (e[0] = (p + l) / y), (e[1] = (f + d) / y), (e[2] = 0.25 * y)),
                            e
                        );
                    };
                })();
                class nu extends Array {
                    constructor(t = 1, e = 0, r = 0, n = 0, i = 0, o = 1, s = 0, a = 0, u = 0, l = 0, h = 1, c = 0, f = 0, p = 0, d = 0, g = 1) {
                        return super(t, e, r, n, i, o, s, a, u, l, h, c, f, p, d, g), this;
                    }
                    get x() {
                        return this[12];
                    }
                    get y() {
                        return this[13];
                    }
                    get z() {
                        return this[14];
                    }
                    get w() {
                        return this[15];
                    }
                    set x(t) {
                        this[12] = t;
                    }
                    set y(t) {
                        this[13] = t;
                    }
                    set z(t) {
                        this[14] = t;
                    }
                    set w(t) {
                        this[15] = t;
                    }
                    set(t, e, r, n, i, o, s, a, u, l, h, c, f, p, d, g) {
                        return t.length
                            ? this.copy(t)
                            : ((function (t, e, r, n, i, o, s, a, u, l, h, c, f, p, d, g, m) {
                                  (t[0] = e), (t[1] = r), (t[2] = n), (t[3] = i), (t[4] = o), (t[5] = s), (t[6] = a), (t[7] = u), (t[8] = l), (t[9] = h), (t[10] = c), (t[11] = f), (t[12] = p), (t[13] = d), (t[14] = g), (t[15] = m);
                              })(this, t, e, r, n, i, o, s, a, u, l, h, c, f, p, d, g),
                              this);
                    }
                    translate(t, e = this) {
                        return (
                            (function (t, e, r) {
                                let n,
                                    i,
                                    o,
                                    s,
                                    a,
                                    u,
                                    l,
                                    h,
                                    c,
                                    f,
                                    p,
                                    d,
                                    g = r[0],
                                    m = r[1],
                                    y = r[2];
                                e === t
                                    ? ((t[12] = e[0] * g + e[4] * m + e[8] * y + e[12]), (t[13] = e[1] * g + e[5] * m + e[9] * y + e[13]), (t[14] = e[2] * g + e[6] * m + e[10] * y + e[14]), (t[15] = e[3] * g + e[7] * m + e[11] * y + e[15]))
                                    : ((n = e[0]),
                                      (i = e[1]),
                                      (o = e[2]),
                                      (s = e[3]),
                                      (a = e[4]),
                                      (u = e[5]),
                                      (l = e[6]),
                                      (h = e[7]),
                                      (c = e[8]),
                                      (f = e[9]),
                                      (p = e[10]),
                                      (d = e[11]),
                                      (t[0] = n),
                                      (t[1] = i),
                                      (t[2] = o),
                                      (t[3] = s),
                                      (t[4] = a),
                                      (t[5] = u),
                                      (t[6] = l),
                                      (t[7] = h),
                                      (t[8] = c),
                                      (t[9] = f),
                                      (t[10] = p),
                                      (t[11] = d),
                                      (t[12] = n * g + a * m + c * y + e[12]),
                                      (t[13] = i * g + u * m + f * y + e[13]),
                                      (t[14] = o * g + l * m + p * y + e[14]),
                                      (t[15] = s * g + h * m + d * y + e[15]));
                            })(this, e, t),
                            this
                        );
                    }
                    rotate(t, e, r = this) {
                        return (
                            (function (t, e, r, n) {
                                let i,
                                    o,
                                    s,
                                    a,
                                    u,
                                    l,
                                    h,
                                    c,
                                    f,
                                    p,
                                    d,
                                    g,
                                    m,
                                    y,
                                    v,
                                    D,
                                    _,
                                    b,
                                    x,
                                    w,
                                    E,
                                    C,
                                    F,
                                    T,
                                    A = n[0],
                                    M = n[1],
                                    O = n[2],
                                    S = Math.hypot(A, M, O);
                                Math.abs(S) < 1e-6 ||
                                    ((S = 1 / S),
                                    (A *= S),
                                    (M *= S),
                                    (O *= S),
                                    (i = Math.sin(r)),
                                    (o = Math.cos(r)),
                                    (s = 1 - o),
                                    (a = e[0]),
                                    (u = e[1]),
                                    (l = e[2]),
                                    (h = e[3]),
                                    (c = e[4]),
                                    (f = e[5]),
                                    (p = e[6]),
                                    (d = e[7]),
                                    (g = e[8]),
                                    (m = e[9]),
                                    (y = e[10]),
                                    (v = e[11]),
                                    (D = A * A * s + o),
                                    (_ = M * A * s + O * i),
                                    (b = O * A * s - M * i),
                                    (x = A * M * s - O * i),
                                    (w = M * M * s + o),
                                    (E = O * M * s + A * i),
                                    (C = A * O * s + M * i),
                                    (F = M * O * s - A * i),
                                    (T = O * O * s + o),
                                    (t[0] = a * D + c * _ + g * b),
                                    (t[1] = u * D + f * _ + m * b),
                                    (t[2] = l * D + p * _ + y * b),
                                    (t[3] = h * D + d * _ + v * b),
                                    (t[4] = a * x + c * w + g * E),
                                    (t[5] = u * x + f * w + m * E),
                                    (t[6] = l * x + p * w + y * E),
                                    (t[7] = h * x + d * w + v * E),
                                    (t[8] = a * C + c * F + g * T),
                                    (t[9] = u * C + f * F + m * T),
                                    (t[10] = l * C + p * F + y * T),
                                    (t[11] = h * C + d * F + v * T),
                                    e !== t && ((t[12] = e[12]), (t[13] = e[13]), (t[14] = e[14]), (t[15] = e[15])));
                            })(this, r, t, e),
                            this
                        );
                    }
                    scale(t, e = this) {
                        return (
                            (function (t, e, r) {
                                let n = r[0],
                                    i = r[1],
                                    o = r[2];
                                (t[0] = e[0] * n),
                                    (t[1] = e[1] * n),
                                    (t[2] = e[2] * n),
                                    (t[3] = e[3] * n),
                                    (t[4] = e[4] * i),
                                    (t[5] = e[5] * i),
                                    (t[6] = e[6] * i),
                                    (t[7] = e[7] * i),
                                    (t[8] = e[8] * o),
                                    (t[9] = e[9] * o),
                                    (t[10] = e[10] * o),
                                    (t[11] = e[11] * o),
                                    (t[12] = e[12]),
                                    (t[13] = e[13]),
                                    (t[14] = e[14]),
                                    (t[15] = e[15]);
                            })(this, e, "number" == typeof t ? [t, t, t] : t),
                            this
                        );
                    }
                    multiply(t, e) {
                        return e ? tu(this, t, e) : tu(this, this, t), this;
                    }
                    identity() {
                        var t;
                        return (
                            ((t = this)[0] = 1), (t[1] = 0), (t[2] = 0), (t[3] = 0), (t[4] = 0), (t[5] = 1), (t[6] = 0), (t[7] = 0), (t[8] = 0), (t[9] = 0), (t[10] = 1), (t[11] = 0), (t[12] = 0), (t[13] = 0), (t[14] = 0), (t[15] = 1), this
                        );
                    }
                    copy(t) {
                        var e, r;
                        return (
                            (r = t),
                            ((e = this)[0] = r[0]),
                            (e[1] = r[1]),
                            (e[2] = r[2]),
                            (e[3] = r[3]),
                            (e[4] = r[4]),
                            (e[5] = r[5]),
                            (e[6] = r[6]),
                            (e[7] = r[7]),
                            (e[8] = r[8]),
                            (e[9] = r[9]),
                            (e[10] = r[10]),
                            (e[11] = r[11]),
                            (e[12] = r[12]),
                            (e[13] = r[13]),
                            (e[14] = r[14]),
                            (e[15] = r[15]),
                            this
                        );
                    }
                    fromPerspective({ fov: t, aspect: e, near: r, far: n } = {}) {
                        return (
                            (function (t, e, r, n, i) {
                                let o = 1 / Math.tan(e / 2),
                                    s = 1 / (n - i);
                                (t[0] = o / r),
                                    (t[1] = 0),
                                    (t[2] = 0),
                                    (t[3] = 0),
                                    (t[4] = 0),
                                    (t[5] = o),
                                    (t[6] = 0),
                                    (t[7] = 0),
                                    (t[8] = 0),
                                    (t[9] = 0),
                                    (t[10] = (i + n) * s),
                                    (t[11] = -1),
                                    (t[12] = 0),
                                    (t[13] = 0),
                                    (t[14] = 2 * i * n * s),
                                    (t[15] = 0);
                            })(this, t, e, r, n),
                            this
                        );
                    }
                    fromOrthogonal({ left: t, right: e, bottom: r, top: n, near: i, far: o }) {
                        return (
                            (function (t, e, r, n, i, o, s) {
                                let a = 1 / (e - r),
                                    u = 1 / (n - i),
                                    l = 1 / (o - s);
                                (t[0] = -2 * a),
                                    (t[1] = 0),
                                    (t[2] = 0),
                                    (t[3] = 0),
                                    (t[4] = 0),
                                    (t[5] = -2 * u),
                                    (t[6] = 0),
                                    (t[7] = 0),
                                    (t[8] = 0),
                                    (t[9] = 0),
                                    (t[10] = 2 * l),
                                    (t[11] = 0),
                                    (t[12] = (e + r) * a),
                                    (t[13] = (i + n) * u),
                                    (t[14] = (s + o) * l),
                                    (t[15] = 1);
                            })(this, t, e, r, n, i, o),
                            this
                        );
                    }
                    fromQuaternion(t) {
                        return (
                            (function (t, e) {
                                let r = e[0],
                                    n = e[1],
                                    i = e[2],
                                    o = e[3],
                                    s = r + r,
                                    a = n + n,
                                    u = i + i,
                                    l = r * s,
                                    h = n * s,
                                    c = n * a,
                                    f = i * s,
                                    p = i * a,
                                    d = i * u,
                                    g = o * s,
                                    m = o * a,
                                    y = o * u;
                                (t[0] = 1 - c - d),
                                    (t[1] = h + y),
                                    (t[2] = f - m),
                                    (t[3] = 0),
                                    (t[4] = h - y),
                                    (t[5] = 1 - l - d),
                                    (t[6] = p + g),
                                    (t[7] = 0),
                                    (t[8] = f + m),
                                    (t[9] = p - g),
                                    (t[10] = 1 - l - c),
                                    (t[11] = 0),
                                    (t[12] = 0),
                                    (t[13] = 0),
                                    (t[14] = 0),
                                    (t[15] = 1);
                            })(this, t),
                            this
                        );
                    }
                    setPosition(t) {
                        return (this.x = t[0]), (this.y = t[1]), (this.z = t[2]), this;
                    }
                    inverse(t = this) {
                        return (
                            (function (t, e) {
                                let r = e[0],
                                    n = e[1],
                                    i = e[2],
                                    o = e[3],
                                    s = e[4],
                                    a = e[5],
                                    u = e[6],
                                    l = e[7],
                                    h = e[8],
                                    c = e[9],
                                    f = e[10],
                                    p = e[11],
                                    d = e[12],
                                    g = e[13],
                                    m = e[14],
                                    y = e[15],
                                    v = r * a - n * s,
                                    D = r * u - i * s,
                                    _ = r * l - o * s,
                                    b = n * u - i * a,
                                    x = n * l - o * a,
                                    w = i * l - o * u,
                                    E = h * g - c * d,
                                    C = h * m - f * d,
                                    F = h * y - p * d,
                                    T = c * m - f * g,
                                    A = c * y - p * g,
                                    M = f * y - p * m,
                                    O = v * M - D * A + _ * T + b * F - x * C + w * E;
                                O &&
                                    ((O = 1 / O),
                                    (t[0] = (a * M - u * A + l * T) * O),
                                    (t[1] = (i * A - n * M - o * T) * O),
                                    (t[2] = (g * w - m * x + y * b) * O),
                                    (t[3] = (f * x - c * w - p * b) * O),
                                    (t[4] = (u * F - s * M - l * C) * O),
                                    (t[5] = (r * M - i * F + o * C) * O),
                                    (t[6] = (m * _ - d * w - y * D) * O),
                                    (t[7] = (h * w - f * _ + p * D) * O),
                                    (t[8] = (s * A - a * F + l * E) * O),
                                    (t[9] = (n * F - r * A - o * E) * O),
                                    (t[10] = (d * x - g * _ + y * v) * O),
                                    (t[11] = (c * _ - h * x - p * v) * O),
                                    (t[12] = (a * C - s * T - u * E) * O),
                                    (t[13] = (r * T - n * C + i * E) * O),
                                    (t[14] = (g * D - d * b - m * v) * O),
                                    (t[15] = (h * b - c * D + f * v) * O));
                            })(this, t),
                            this
                        );
                    }
                    compose(t, e, r) {
                        return (
                            (function (t, e, r, n) {
                                let i = e[0],
                                    o = e[1],
                                    s = e[2],
                                    a = e[3],
                                    u = i + i,
                                    l = o + o,
                                    h = s + s,
                                    c = i * u,
                                    f = i * l,
                                    p = i * h,
                                    d = o * l,
                                    g = o * h,
                                    m = s * h,
                                    y = a * u,
                                    v = a * l,
                                    D = a * h,
                                    _ = n[0],
                                    b = n[1],
                                    x = n[2];
                                (t[0] = (1 - (d + m)) * _),
                                    (t[1] = (f + D) * _),
                                    (t[2] = (p - v) * _),
                                    (t[3] = 0),
                                    (t[4] = (f - D) * b),
                                    (t[5] = (1 - (c + m)) * b),
                                    (t[6] = (g + y) * b),
                                    (t[7] = 0),
                                    (t[8] = (p + v) * x),
                                    (t[9] = (g - y) * x),
                                    (t[10] = (1 - (c + d)) * x),
                                    (t[11] = 0),
                                    (t[12] = r[0]),
                                    (t[13] = r[1]),
                                    (t[14] = r[2]),
                                    (t[15] = 1);
                            })(this, t, e, r),
                            this
                        );
                    }
                    getRotation(t) {
                        return ru(t, this), this;
                    }
                    getTranslation(t) {
                        var e, r;
                        return (r = this), ((e = t)[0] = r[12]), (e[1] = r[13]), (e[2] = r[14]), this;
                    }
                    getScaling(t) {
                        return eu(t, this), this;
                    }
                    getMaxScaleOnAxis() {
                        return (function (t) {
                            let e = t[0],
                                r = t[1],
                                n = t[2],
                                i = t[4],
                                o = t[5],
                                s = t[6],
                                a = t[8],
                                u = t[9],
                                l = t[10];
                            const h = e * e + r * r + n * n,
                                c = i * i + o * o + s * s,
                                f = a * a + u * u + l * l;
                            return Math.sqrt(Math.max(h, c, f));
                        })(this);
                    }
                    lookAt(t, e, r) {
                        return (
                            (function (t, e, r, n) {
                                let i = e[0],
                                    o = e[1],
                                    s = e[2],
                                    a = n[0],
                                    u = n[1],
                                    l = n[2],
                                    h = i - r[0],
                                    c = o - r[1],
                                    f = s - r[2],
                                    p = h * h + c * c + f * f;
                                0 === p ? (f = 1) : ((p = 1 / Math.sqrt(p)), (h *= p), (c *= p), (f *= p));
                                let d = u * f - l * c,
                                    g = l * h - a * f,
                                    m = a * c - u * h;
                                (p = d * d + g * g + m * m),
                                    0 === p && (l ? (a += 1e-6) : u ? (l += 1e-6) : (u += 1e-6), (d = u * f - l * c), (g = l * h - a * f), (m = a * c - u * h), (p = d * d + g * g + m * m)),
                                    (p = 1 / Math.sqrt(p)),
                                    (d *= p),
                                    (g *= p),
                                    (m *= p),
                                    (t[0] = d),
                                    (t[1] = g),
                                    (t[2] = m),
                                    (t[3] = 0),
                                    (t[4] = c * m - f * g),
                                    (t[5] = f * d - h * m),
                                    (t[6] = h * g - c * d),
                                    (t[7] = 0),
                                    (t[8] = h),
                                    (t[9] = c),
                                    (t[10] = f),
                                    (t[11] = 0),
                                    (t[12] = i),
                                    (t[13] = o),
                                    (t[14] = s),
                                    (t[15] = 1);
                            })(this, t, e, r),
                            this
                        );
                    }
                    determinant() {
                        return (function (t) {
                            let e = t[0],
                                r = t[1],
                                n = t[2],
                                i = t[3],
                                o = t[4],
                                s = t[5],
                                a = t[6],
                                u = t[7],
                                l = t[8],
                                h = t[9],
                                c = t[10],
                                f = t[11],
                                p = t[12],
                                d = t[13],
                                g = t[14],
                                m = t[15];
                            return (
                                (e * s - r * o) * (c * m - f * g) -
                                (e * a - n * o) * (h * m - f * d) +
                                (e * u - i * o) * (h * g - c * d) +
                                (r * a - n * s) * (l * m - f * p) -
                                (r * u - i * s) * (l * g - c * p) +
                                (n * u - i * a) * (l * d - h * p)
                            );
                        })(this);
                    }
                    fromArray(t, e = 0) {
                        return (
                            (this[0] = t[e]),
                            (this[1] = t[e + 1]),
                            (this[2] = t[e + 2]),
                            (this[3] = t[e + 3]),
                            (this[4] = t[e + 4]),
                            (this[5] = t[e + 5]),
                            (this[6] = t[e + 6]),
                            (this[7] = t[e + 7]),
                            (this[8] = t[e + 8]),
                            (this[9] = t[e + 9]),
                            (this[10] = t[e + 10]),
                            (this[11] = t[e + 11]),
                            (this[12] = t[e + 12]),
                            (this[13] = t[e + 13]),
                            (this[14] = t[e + 14]),
                            (this[15] = t[e + 15]),
                            this
                        );
                    }
                    toArray(t = [], e = 0) {
                        return (
                            (t[e] = this[0]),
                            (t[e + 1] = this[1]),
                            (t[e + 2] = this[2]),
                            (t[e + 3] = this[3]),
                            (t[e + 4] = this[4]),
                            (t[e + 5] = this[5]),
                            (t[e + 6] = this[6]),
                            (t[e + 7] = this[7]),
                            (t[e + 8] = this[8]),
                            (t[e + 9] = this[9]),
                            (t[e + 10] = this[10]),
                            (t[e + 11] = this[11]),
                            (t[e + 12] = this[12]),
                            (t[e + 13] = this[13]),
                            (t[e + 14] = this[14]),
                            (t[e + 15] = this[15]),
                            t
                        );
                    }
                }
                const iu = new nu();
                class ou extends Array {
                    constructor(t = 0, e = t, r = t, n = "YXZ") {
                        return super(t, e, r), (this.order = n), (this.onChange = () => {}), this;
                    }
                    get x() {
                        return this[0];
                    }
                    get y() {
                        return this[1];
                    }
                    get z() {
                        return this[2];
                    }
                    set x(t) {
                        (this[0] = t), this.onChange();
                    }
                    set y(t) {
                        (this[1] = t), this.onChange();
                    }
                    set z(t) {
                        (this[2] = t), this.onChange();
                    }
                    set(t, e = t, r = t) {
                        return t.length ? this.copy(t) : ((this[0] = t), (this[1] = e), (this[2] = r), this.onChange(), this);
                    }
                    copy(t) {
                        return (this[0] = t[0]), (this[1] = t[1]), (this[2] = t[2]), this.onChange(), this;
                    }
                    reorder(t) {
                        return (this.order = t), this.onChange(), this;
                    }
                    fromRotationMatrix(t, e = this.order) {
                        return (
                            (function (t, e, r = "YXZ") {
                                "XYZ" === r
                                    ? ((t[1] = Math.asin(Math.min(Math.max(e[8], -1), 1))), Math.abs(e[8]) < 0.99999 ? ((t[0] = Math.atan2(-e[9], e[10])), (t[2] = Math.atan2(-e[4], e[0]))) : ((t[0] = Math.atan2(e[6], e[5])), (t[2] = 0)))
                                    : "YXZ" === r
                                    ? ((t[0] = Math.asin(-Math.min(Math.max(e[9], -1), 1))), Math.abs(e[9]) < 0.99999 ? ((t[1] = Math.atan2(e[8], e[10])), (t[2] = Math.atan2(e[1], e[5]))) : ((t[1] = Math.atan2(-e[2], e[0])), (t[2] = 0)))
                                    : "ZXY" === r
                                    ? ((t[0] = Math.asin(Math.min(Math.max(e[6], -1), 1))), Math.abs(e[6]) < 0.99999 ? ((t[1] = Math.atan2(-e[2], e[10])), (t[2] = Math.atan2(-e[4], e[5]))) : ((t[1] = 0), (t[2] = Math.atan2(e[1], e[0]))))
                                    : "ZYX" === r
                                    ? ((t[1] = Math.asin(-Math.min(Math.max(e[2], -1), 1))), Math.abs(e[2]) < 0.99999 ? ((t[0] = Math.atan2(e[6], e[10])), (t[2] = Math.atan2(e[1], e[0]))) : ((t[0] = 0), (t[2] = Math.atan2(-e[4], e[5]))))
                                    : "YZX" === r
                                    ? ((t[2] = Math.asin(Math.min(Math.max(e[1], -1), 1))), Math.abs(e[1]) < 0.99999 ? ((t[0] = Math.atan2(-e[9], e[5])), (t[1] = Math.atan2(-e[2], e[0]))) : ((t[0] = 0), (t[1] = Math.atan2(e[8], e[10]))))
                                    : "XZY" === r &&
                                      ((t[2] = Math.asin(-Math.min(Math.max(e[4], -1), 1))), Math.abs(e[4]) < 0.99999 ? ((t[0] = Math.atan2(e[6], e[5])), (t[1] = Math.atan2(e[8], e[0]))) : ((t[0] = Math.atan2(-e[9], e[10])), (t[1] = 0)));
                            })(this, t, e),
                            this
                        );
                    }
                    fromQuaternion(t, e = this.order) {
                        return iu.fromQuaternion(t), this.fromRotationMatrix(iu, e);
                    }
                    toArray(t = [], e = 0) {
                        return (t[e] = this[0]), (t[e + 1] = this[1]), (t[e + 2] = this[2]), t;
                    }
                }
                class su {
                    constructor() {
                        (this.parent = null),
                            (this.children = []),
                            (this.visible = !0),
                            (this.matrix = new nu()),
                            (this.worldMatrix = new nu()),
                            (this.matrixAutoUpdate = !0),
                            (this.position = new Fa()),
                            (this.quaternion = new Ja()),
                            (this.scale = new Fa(1)),
                            (this.rotation = new ou()),
                            (this.up = new Fa(0, 1, 0)),
                            (this.rotation.onChange = () => this.quaternion.fromEuler(this.rotation)),
                            (this.quaternion.onChange = () => this.rotation.fromQuaternion(this.quaternion));
                    }
                    setParent(t, e = !0) {
                        this.parent && t !== this.parent && this.parent.removeChild(this, !1), (this.parent = t), e && t && t.addChild(this, !1);
                    }
                    addChild(t, e = !0) {
                        ~this.children.indexOf(t) || this.children.push(t), e && t.setParent(this, !1);
                    }
                    removeChild(t, e = !0) {
                        ~this.children.indexOf(t) && this.children.splice(this.children.indexOf(t), 1), e && t.setParent(null, !1);
                    }
                    updateMatrixWorld(t) {
                        this.matrixAutoUpdate && this.updateMatrix(),
                            (this.worldMatrixNeedsUpdate || t) && (null === this.parent ? this.worldMatrix.copy(this.matrix) : this.worldMatrix.multiply(this.parent.worldMatrix, this.matrix), (this.worldMatrixNeedsUpdate = !1), (t = !0));
                        for (let e = 0, r = this.children.length; e < r; e++) this.children[e].updateMatrixWorld(t);
                    }
                    updateMatrix() {
                        this.matrix.compose(this.quaternion, this.position, this.scale), (this.worldMatrixNeedsUpdate = !0);
                    }
                    traverse(t) {
                        if (!t(this)) for (let e = 0, r = this.children.length; e < r; e++) this.children[e].traverse(t);
                    }
                    decompose() {
                        this.matrix.getTranslation(this.position), this.matrix.getRotation(this.quaternion), this.matrix.getScaling(this.scale), this.rotation.fromQuaternion(this.quaternion);
                    }
                    lookAt(t, e = !1) {
                        e ? this.matrix.lookAt(this.position, t, this.up) : this.matrix.lookAt(t, this.position, this.up), this.matrix.getRotation(this.quaternion), this.rotation.fromQuaternion(this.quaternion);
                    }
                }
                function au(t, e, r) {
                    let n = e[0],
                        i = e[1],
                        o = e[2],
                        s = e[3],
                        a = e[4],
                        u = e[5],
                        l = e[6],
                        h = e[7],
                        c = e[8],
                        f = r[0],
                        p = r[1],
                        d = r[2],
                        g = r[3],
                        m = r[4],
                        y = r[5],
                        v = r[6],
                        D = r[7],
                        _ = r[8];
                    return (
                        (t[0] = f * n + p * s + d * l),
                        (t[1] = f * i + p * a + d * h),
                        (t[2] = f * o + p * u + d * c),
                        (t[3] = g * n + m * s + y * l),
                        (t[4] = g * i + m * a + y * h),
                        (t[5] = g * o + m * u + y * c),
                        (t[6] = v * n + D * s + _ * l),
                        (t[7] = v * i + D * a + _ * h),
                        (t[8] = v * o + D * u + _ * c),
                        t
                    );
                }
                class uu extends Array {
                    constructor(t = 1, e = 0, r = 0, n = 0, i = 1, o = 0, s = 0, a = 0, u = 1) {
                        return super(t, e, r, n, i, o, s, a, u), this;
                    }
                    set(t, e, r, n, i, o, s, a, u) {
                        return t.length
                            ? this.copy(t)
                            : ((function (t, e, r, n, i, o, s, a, u, l) {
                                  (t[0] = e), (t[1] = r), (t[2] = n), (t[3] = i), (t[4] = o), (t[5] = s), (t[6] = a), (t[7] = u), (t[8] = l);
                              })(this, t, e, r, n, i, o, s, a, u),
                              this);
                    }
                    translate(t, e = this) {
                        return (
                            (function (t, e, r) {
                                let n = e[0],
                                    i = e[1],
                                    o = e[2],
                                    s = e[3],
                                    a = e[4],
                                    u = e[5],
                                    l = e[6],
                                    h = e[7],
                                    c = e[8],
                                    f = r[0],
                                    p = r[1];
                                (t[0] = n), (t[1] = i), (t[2] = o), (t[3] = s), (t[4] = a), (t[5] = u), (t[6] = f * n + p * s + l), (t[7] = f * i + p * a + h), (t[8] = f * o + p * u + c);
                            })(this, e, t),
                            this
                        );
                    }
                    rotate(t, e = this) {
                        return (
                            (function (t, e, r) {
                                let n = e[0],
                                    i = e[1],
                                    o = e[2],
                                    s = e[3],
                                    a = e[4],
                                    u = e[5],
                                    l = e[6],
                                    h = e[7],
                                    c = e[8],
                                    f = Math.sin(r),
                                    p = Math.cos(r);
                                (t[0] = p * n + f * s), (t[1] = p * i + f * a), (t[2] = p * o + f * u), (t[3] = p * s - f * n), (t[4] = p * a - f * i), (t[5] = p * u - f * o), (t[6] = l), (t[7] = h), (t[8] = c);
                            })(this, e, t),
                            this
                        );
                    }
                    scale(t, e = this) {
                        return (
                            (function (t, e, r) {
                                let n = r[0],
                                    i = r[1];
                                (t[0] = n * e[0]), (t[1] = n * e[1]), (t[2] = n * e[2]), (t[3] = i * e[3]), (t[4] = i * e[4]), (t[5] = i * e[5]), (t[6] = e[6]), (t[7] = e[7]), (t[8] = e[8]);
                            })(this, e, t),
                            this
                        );
                    }
                    multiply(t, e) {
                        return e ? au(this, t, e) : au(this, this, t), this;
                    }
                    identity() {
                        var t;
                        return ((t = this)[0] = 1), (t[1] = 0), (t[2] = 0), (t[3] = 0), (t[4] = 1), (t[5] = 0), (t[6] = 0), (t[7] = 0), (t[8] = 1), this;
                    }
                    copy(t) {
                        var e, r;
                        return (r = t), ((e = this)[0] = r[0]), (e[1] = r[1]), (e[2] = r[2]), (e[3] = r[3]), (e[4] = r[4]), (e[5] = r[5]), (e[6] = r[6]), (e[7] = r[7]), (e[8] = r[8]), this;
                    }
                    fromMatrix4(t) {
                        var e, r;
                        return (r = t), ((e = this)[0] = r[0]), (e[1] = r[1]), (e[2] = r[2]), (e[3] = r[4]), (e[4] = r[5]), (e[5] = r[6]), (e[6] = r[8]), (e[7] = r[9]), (e[8] = r[10]), this;
                    }
                    fromQuaternion(t) {
                        return (
                            (function (t, e) {
                                let r = e[0],
                                    n = e[1],
                                    i = e[2],
                                    o = e[3],
                                    s = r + r,
                                    a = n + n,
                                    u = i + i,
                                    l = r * s,
                                    h = n * s,
                                    c = n * a,
                                    f = i * s,
                                    p = i * a,
                                    d = i * u,
                                    g = o * s,
                                    m = o * a,
                                    y = o * u;
                                (t[0] = 1 - c - d), (t[3] = h - y), (t[6] = f + m), (t[1] = h + y), (t[4] = 1 - l - d), (t[7] = p - g), (t[2] = f - m), (t[5] = p + g), (t[8] = 1 - l - c);
                            })(this, t),
                            this
                        );
                    }
                    fromBasis(t, e, r) {
                        return this.set(t[0], t[1], t[2], e[0], e[1], e[2], r[0], r[1], r[2]), this;
                    }
                    inverse(t = this) {
                        return (
                            (function (t, e) {
                                let r = e[0],
                                    n = e[1],
                                    i = e[2],
                                    o = e[3],
                                    s = e[4],
                                    a = e[5],
                                    u = e[6],
                                    l = e[7],
                                    h = e[8],
                                    c = h * s - a * l,
                                    f = -h * o + a * u,
                                    p = l * o - s * u,
                                    d = r * c + n * f + i * p;
                                d &&
                                    ((d = 1 / d),
                                    (t[0] = c * d),
                                    (t[1] = (-h * n + i * l) * d),
                                    (t[2] = (a * n - i * s) * d),
                                    (t[3] = f * d),
                                    (t[4] = (h * r - i * u) * d),
                                    (t[5] = (-a * r + i * o) * d),
                                    (t[6] = p * d),
                                    (t[7] = (-l * r + n * u) * d),
                                    (t[8] = (s * r - n * o) * d));
                            })(this, t),
                            this
                        );
                    }
                    getNormalMatrix(t) {
                        return (
                            (function (t, e) {
                                let r = e[0],
                                    n = e[1],
                                    i = e[2],
                                    o = e[3],
                                    s = e[4],
                                    a = e[5],
                                    u = e[6],
                                    l = e[7],
                                    h = e[8],
                                    c = e[9],
                                    f = e[10],
                                    p = e[11],
                                    d = e[12],
                                    g = e[13],
                                    m = e[14],
                                    y = e[15],
                                    v = r * a - n * s,
                                    D = r * u - i * s,
                                    _ = r * l - o * s,
                                    b = n * u - i * a,
                                    x = n * l - o * a,
                                    w = i * l - o * u,
                                    E = h * g - c * d,
                                    C = h * m - f * d,
                                    F = h * y - p * d,
                                    T = c * m - f * g,
                                    A = c * y - p * g,
                                    M = f * y - p * m,
                                    O = v * M - D * A + _ * T + b * F - x * C + w * E;
                                O &&
                                    ((O = 1 / O),
                                    (t[0] = (a * M - u * A + l * T) * O),
                                    (t[1] = (u * F - s * M - l * C) * O),
                                    (t[2] = (s * A - a * F + l * E) * O),
                                    (t[3] = (i * A - n * M - o * T) * O),
                                    (t[4] = (r * M - i * F + o * C) * O),
                                    (t[5] = (n * F - r * A - o * E) * O),
                                    (t[6] = (g * w - m * x + y * b) * O),
                                    (t[7] = (m * _ - d * w - y * D) * O),
                                    (t[8] = (d * x - g * _ + y * v) * O));
                            })(this, t),
                            this
                        );
                    }
                }
                let lu = 0;
                class hu extends su {
                    constructor(t, { geometry: e, program: r, mode: n = t.TRIANGLES, frustumCulled: i = !0, renderOrder: o = 0 } = {}) {
                        super(),
                            t.canvas || console.error("gl not passed as first argument to Mesh"),
                            (this.gl = t),
                            (this.id = lu++),
                            (this.geometry = e),
                            (this.program = r),
                            (this.mode = n),
                            (this.frustumCulled = i),
                            (this.renderOrder = o),
                            (this.modelViewMatrix = new nu()),
                            (this.normalMatrix = new uu()),
                            (this.beforeRenderCallbacks = []),
                            (this.afterRenderCallbacks = []);
                    }
                    onBeforeRender(t) {
                        return this.beforeRenderCallbacks.push(t), this;
                    }
                    onAfterRender(t) {
                        return this.afterRenderCallbacks.push(t), this;
                    }
                    draw({ camera: t } = {}) {
                        this.beforeRenderCallbacks.forEach((e) => e && e({ mesh: this, camera: t })),
                            t &&
                                (this.program.uniforms.modelMatrix ||
                                    Object.assign(this.program.uniforms, {
                                        modelMatrix: { value: null },
                                        viewMatrix: { value: null },
                                        modelViewMatrix: { value: null },
                                        normalMatrix: { value: null },
                                        projectionMatrix: { value: null },
                                        cameraPosition: { value: null },
                                    }),
                                (this.program.uniforms.projectionMatrix.value = t.projectionMatrix),
                                (this.program.uniforms.cameraPosition.value = t.worldPosition),
                                (this.program.uniforms.viewMatrix.value = t.viewMatrix),
                                this.modelViewMatrix.multiply(t.viewMatrix, this.worldMatrix),
                                this.normalMatrix.getNormalMatrix(this.modelViewMatrix),
                                (this.program.uniforms.modelMatrix.value = this.worldMatrix),
                                (this.program.uniforms.modelViewMatrix.value = this.modelViewMatrix),
                                (this.program.uniforms.normalMatrix.value = this.normalMatrix));
                        let e = this.program.cullFace && this.worldMatrix.determinant() < 0;
                        this.program.use({ flipFaces: e }), this.geometry.draw({ mode: this.mode, program: this.program }), this.afterRenderCallbacks.forEach((e) => e && e({ mesh: this, camera: t }));
                    }
                }
                var cu = ea.bounds,
                    fu = $s,
                    pu = [
                        ["#8e6796", "#aa7194", "#c9837c", "#c9837c"],
                        ["#d69f99", "#c5a0a3", "#969dac", "#899daf"],
                        ["#d9bd9a", "#c0c9c0", "#6eb2b2", "#42a4ab"],
                        ["#81381b", "#140f06", "#0f0b05", "#110f0b"],
                        ["#5b2c15", "#452411", "#140f06", "#110f0b"],
                        ["#c9837c", "#1c0b01", "#0f0b05", "#0f0b05"],
                        ["#d69f99", "#c5a0a3", "#969dac", "#899daf"],
                    ];
                var du = $s,
                    gu = Zs,
                    mu = Ks;
                var yu = Zs,
                    vu = $s,
                    Du = Ks,
                    _u = ea.bounds,
                    bu = ea.flags;
                var xu = r(862),
                    wu = r.n(xu),
                    Eu = $s,
                    Cu = Zs,
                    Fu = ea.dom,
                    Tu = ea.device;
                var Au = $s,
                    Mu = Zs,
                    Ou = Ks,
                    Su = ea.bounds;
                function Pu(t) {
                    var e,
                        r,
                        n,
                        i = Au(".js-story-slides", t),
                        o = Mu(".js-story-slide", t),
                        s = Au(".js-story-next", t),
                        a = Au(".js-story-previous", t),
                        u = "is-deactivated",
                        l = o.length - 1,
                        h = 0,
                        c = 0,
                        f = 0,
                        p = 0,
                        d = 0,
                        g = 0,
                        m = 0,
                        y = !1,
                        v = !1;
                    function D() {
                        (r = Ou(i).left),
                            (n = []),
                            (e = o.map(function (e, i) {
                                ei.set(e, { x: 0 });
                                var o = Ou(e),
                                    s = o.left,
                                    a = o.right,
                                    u = o.width,
                                    h = ei.quickSetter(e, "x", "px");
                                return i === l && (f = s - r), n.push(s - r), { el: t, left: s, width: u, xSet: h, start: s - Su.ww, end: a, out: !0 };
                            }));
                    }
                    function _(t) {
                        var e = t.x,
                            r = t.y;
                        t.target.closest("button") || ((y = !0), (p = e), (d = r), (g = h + 2 * e));
                    }
                    function b(t) {
                        var e = t.x,
                            r = t.y,
                            n = t.e;
                        y && (Math.abs(e - p) > Math.abs(r - d) && n.cancelable && (n.preventDefault(), n.stopPropagation()), (h = g - 2 * e), (h = ei.utils.clamp(0, f, h)));
                    }
                    function x() {
                        y && ((y = !1), (h = ei.utils.snap(n, h)), m, (m = n.indexOf(h)), C());
                    }
                    function w() {
                        m, (m = Math.min(l, m + 1)), (h = n[m]), C();
                    }
                    function E() {
                        m, (m = Math.max(0, m - 1)), (h = n[m]), C();
                    }
                    function C() {
                        0 === m ? a.classList.add(u) : a.classList.remove(u), m === l ? s.classList.add(u) : s.classList.remove(u);
                    }
                    function F() {
                        (c += 0.125 * (h - c)), (c = Math.round(100 * c) / 100), !v && T();
                    }
                    function T() {
                        e.length &&
                            e.forEach(function (t) {
                                var e = t.start,
                                    r = t.end,
                                    n = t.width,
                                    i = t.left,
                                    o = t.xSet,
                                    s = (function (t, e, r, n) {
                                        var i = c > t && c < e,
                                            o = 0;
                                        return i && (o = ei.utils.clamp(0, 1, 1 + (c - n - r) / (Su.ww + r))), { isVisible: i, progress: o };
                                    })(e, r, n, i),
                                    a = s.isVisible;
                                s.progress;
                                a || v ? (t.out && (t.out = !1), o(-c)) : t.out || ((t.out = !0), o(-c));
                            });
                    }
                    function A() {
                        (v = !0), D(), T(), (v = !1);
                    }
                    function M() {
                        Gs.on("mouseup", x), Gs.on("mousedown", _), Gs.on("mousemove", b), Gs.on("resize", A), Gs.on("tick", F), Gs.on("click", s, w), Gs.on("click", a, E);
                    }
                    return (
                        D(),
                        M(),
                        {
                            mount: M,
                            unmount: function () {
                                Gs.off("mouseup", x), Gs.off("mousedown", _), Gs.off("mousemove", b), Gs.off("resize", A), Gs.off("tick", F), Gs.off("click", s, w), Gs.off("click", a, E);
                            },
                        }
                    );
                }
                var ku = Zs;
                var Ru = $s,
                    Bu = Zs;
                ea.bounds;
                const Lu = new nu(),
                    ju = new Fa(),
                    Nu = new Fa();
                class zu extends su {
                    constructor(t, { near: e = 0.1, far: r = 100, fov: n = 45, aspect: i = 1, left: o, right: s, bottom: a, top: u, zoom: l = 1 } = {}) {
                        super(),
                            Object.assign(this, { near: e, far: r, fov: n, aspect: i, left: o, right: s, bottom: a, top: u, zoom: l }),
                            (this.projectionMatrix = new nu()),
                            (this.viewMatrix = new nu()),
                            (this.projectionViewMatrix = new nu()),
                            (this.worldPosition = new Fa()),
                            (this.type = o || s ? "orthographic" : "perspective"),
                            "orthographic" === this.type ? this.orthographic() : this.perspective();
                    }
                    perspective({ near: t = this.near, far: e = this.far, fov: r = this.fov, aspect: n = this.aspect } = {}) {
                        return Object.assign(this, { near: t, far: e, fov: r, aspect: n }), this.projectionMatrix.fromPerspective({ fov: r * (Math.PI / 180), aspect: n, near: t, far: e }), (this.type = "perspective"), this;
                    }
                    orthographic({ near: t = this.near, far: e = this.far, left: r = this.left, right: n = this.right, bottom: i = this.bottom, top: o = this.top, zoom: s = this.zoom } = {}) {
                        return (
                            Object.assign(this, { near: t, far: e, left: r, right: n, bottom: i, top: o, zoom: s }),
                            (r /= s),
                            (n /= s),
                            (i /= s),
                            (o /= s),
                            this.projectionMatrix.fromOrthogonal({ left: r, right: n, bottom: i, top: o, near: t, far: e }),
                            (this.type = "orthographic"),
                            this
                        );
                    }
                    updateMatrixWorld() {
                        return super.updateMatrixWorld(), this.viewMatrix.inverse(this.worldMatrix), this.worldMatrix.getTranslation(this.worldPosition), this.projectionViewMatrix.multiply(this.projectionMatrix, this.viewMatrix), this;
                    }
                    lookAt(t) {
                        return super.lookAt(t, !0), this;
                    }
                    project(t) {
                        return t.applyMatrix4(this.viewMatrix), t.applyMatrix4(this.projectionMatrix), this;
                    }
                    unproject(t) {
                        return t.applyMatrix4(Lu.inverse(this.projectionMatrix)), t.applyMatrix4(this.worldMatrix), this;
                    }
                    updateFrustum() {
                        this.frustum || (this.frustum = [new Fa(), new Fa(), new Fa(), new Fa(), new Fa(), new Fa()]);
                        const t = this.projectionViewMatrix;
                        (this.frustum[0].set(t[3] - t[0], t[7] - t[4], t[11] - t[8]).constant = t[15] - t[12]),
                            (this.frustum[1].set(t[3] + t[0], t[7] + t[4], t[11] + t[8]).constant = t[15] + t[12]),
                            (this.frustum[2].set(t[3] + t[1], t[7] + t[5], t[11] + t[9]).constant = t[15] + t[13]),
                            (this.frustum[3].set(t[3] - t[1], t[7] - t[5], t[11] - t[9]).constant = t[15] - t[13]),
                            (this.frustum[4].set(t[3] - t[2], t[7] - t[6], t[11] - t[10]).constant = t[15] - t[14]),
                            (this.frustum[5].set(t[3] + t[2], t[7] + t[6], t[11] + t[10]).constant = t[15] + t[14]);
                        for (let t = 0; t < 6; t++) {
                            const e = 1 / this.frustum[t].distance();
                            this.frustum[t].multiply(e), (this.frustum[t].constant *= e);
                        }
                    }
                    frustumIntersectsMesh(t) {
                        if (!t.geometry.attributes.position) return !0;
                        if (((t.geometry.bounds && t.geometry.bounds.radius !== 1 / 0) || t.geometry.computeBoundingSphere(), !t.geometry.bounds)) return !0;
                        const e = ju;
                        e.copy(t.geometry.bounds.center), e.applyMatrix4(t.worldMatrix);
                        const r = t.geometry.bounds.radius * t.worldMatrix.getMaxScaleOnAxis();
                        return this.frustumIntersectsSphere(e, r);
                    }
                    frustumIntersectsSphere(t, e) {
                        const r = Nu;
                        for (let n = 0; n < 6; n++) {
                            const i = this.frustum[n];
                            if (r.copy(i).dot(t) + i.constant < -e) return !1;
                        }
                        return !0;
                    }
                }
                const Iu = new Uint8Array(4);
                function Uu(t) {
                    return 0 == (t & (t - 1));
                }
                let Yu = 1;
                class Xu {
                    constructor(
                        t,
                        {
                            image: e,
                            target: r = t.TEXTURE_2D,
                            type: n = t.UNSIGNED_BYTE,
                            format: i = t.RGBA,
                            internalFormat: o = i,
                            wrapS: s = t.CLAMP_TO_EDGE,
                            wrapT: a = t.CLAMP_TO_EDGE,
                            generateMipmaps: u = !0,
                            minFilter: l = u ? t.NEAREST_MIPMAP_LINEAR : t.LINEAR,
                            magFilter: h = t.LINEAR,
                            premultiplyAlpha: c = !1,
                            unpackAlignment: f = 4,
                            flipY: p = r == t.TEXTURE_2D,
                            anisotropy: d = 0,
                            level: g = 0,
                            width: m,
                            height: y = m,
                        } = {}
                    ) {
                        (this.gl = t),
                            (this.id = Yu++),
                            (this.image = e),
                            (this.target = r),
                            (this.type = n),
                            (this.format = i),
                            (this.internalFormat = o),
                            (this.minFilter = l),
                            (this.magFilter = h),
                            (this.wrapS = s),
                            (this.wrapT = a),
                            (this.generateMipmaps = u),
                            (this.premultiplyAlpha = c),
                            (this.unpackAlignment = f),
                            (this.flipY = p),
                            (this.anisotropy = Math.min(d, this.gl.renderer.parameters.maxAnisotropy)),
                            (this.level = g),
                            (this.width = m),
                            (this.height = y),
                            (this.texture = this.gl.createTexture()),
                            (this.store = { image: null }),
                            (this.glState = this.gl.renderer.state),
                            (this.state = {}),
                            (this.state.minFilter = this.gl.NEAREST_MIPMAP_LINEAR),
                            (this.state.magFilter = this.gl.LINEAR),
                            (this.state.wrapS = this.gl.REPEAT),
                            (this.state.wrapT = this.gl.REPEAT),
                            (this.state.anisotropy = 0);
                    }
                    bind() {
                        this.glState.textureUnits[this.glState.activeTextureUnit] !== this.id && (this.gl.bindTexture(this.target, this.texture), (this.glState.textureUnits[this.glState.activeTextureUnit] = this.id));
                    }
                    update(t = 0) {
                        const e = !(this.image === this.store.image && !this.needsUpdate);
                        if (((e || this.glState.textureUnits[t] !== this.id) && (this.gl.renderer.activeTexture(t), this.bind()), e)) {
                            if (
                                ((this.needsUpdate = !1),
                                this.flipY !== this.glState.flipY && (this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, this.flipY), (this.glState.flipY = this.flipY)),
                                this.premultiplyAlpha !== this.glState.premultiplyAlpha && (this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha), (this.glState.premultiplyAlpha = this.premultiplyAlpha)),
                                this.unpackAlignment !== this.glState.unpackAlignment && (this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, this.unpackAlignment), (this.glState.unpackAlignment = this.unpackAlignment)),
                                this.minFilter !== this.state.minFilter && (this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.minFilter), (this.state.minFilter = this.minFilter)),
                                this.magFilter !== this.state.magFilter && (this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.magFilter), (this.state.magFilter = this.magFilter)),
                                this.wrapS !== this.state.wrapS && (this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.wrapS), (this.state.wrapS = this.wrapS)),
                                this.wrapT !== this.state.wrapT && (this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.wrapT), (this.state.wrapT = this.wrapT)),
                                this.anisotropy &&
                                    this.anisotropy !== this.state.anisotropy &&
                                    (this.gl.texParameterf(this.target, this.gl.renderer.getExtension("EXT_texture_filter_anisotropic").TEXTURE_MAX_ANISOTROPY_EXT, this.anisotropy), (this.state.anisotropy = this.anisotropy)),
                                this.image)
                            ) {
                                if ((this.image.width && ((this.width = this.image.width), (this.height = this.image.height)), this.target === this.gl.TEXTURE_CUBE_MAP))
                                    for (let t = 0; t < 6; t++) this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + t, this.level, this.internalFormat, this.format, this.type, this.image[t]);
                                else if (ArrayBuffer.isView(this.image)) this.gl.texImage2D(this.target, this.level, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.image);
                                else if (this.image.isCompressedTexture)
                                    for (let t = 0; t < this.image.length; t++) this.gl.compressedTexImage2D(this.target, t, this.internalFormat, this.image[t].width, this.image[t].height, 0, this.image[t].data);
                                else this.gl.texImage2D(this.target, this.level, this.internalFormat, this.format, this.type, this.image);
                                this.generateMipmaps &&
                                    (this.gl.renderer.isWebgl2 || (Uu(this.image.width) && Uu(this.image.height))
                                        ? this.gl.generateMipmap(this.target)
                                        : ((this.generateMipmaps = !1), (this.wrapS = this.wrapT = this.gl.CLAMP_TO_EDGE), (this.minFilter = this.gl.LINEAR))),
                                    this.onUpdate && this.onUpdate();
                            } else if (this.target === this.gl.TEXTURE_CUBE_MAP) for (let t = 0; t < 6; t++) this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + t, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, Iu);
                            else
                                this.width
                                    ? this.gl.texImage2D(this.target, this.level, this.internalFormat, this.width, this.height, 0, this.format, this.type, null)
                                    : this.gl.texImage2D(this.target, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, Iu);
                            this.store.image = this.image;
                        }
                    }
                }
                class qu {
                    constructor(
                        t,
                        {
                            width: e = t.canvas.width,
                            height: r = t.canvas.height,
                            target: n = t.FRAMEBUFFER,
                            color: i = 1,
                            depth: o = !0,
                            stencil: s = !1,
                            depthTexture: a = !1,
                            wrapS: u = t.CLAMP_TO_EDGE,
                            wrapT: l = t.CLAMP_TO_EDGE,
                            minFilter: h = t.LINEAR,
                            magFilter: c = h,
                            type: f = t.UNSIGNED_BYTE,
                            format: p = t.RGBA,
                            internalFormat: d = p,
                            unpackAlignment: g,
                            premultiplyAlpha: m,
                        } = {}
                    ) {
                        (this.gl = t), (this.width = e), (this.height = r), (this.depth = o), (this.buffer = this.gl.createFramebuffer()), (this.target = n), this.gl.bindFramebuffer(this.target, this.buffer), (this.textures = []);
                        const y = [];
                        for (let n = 0; n < i; n++)
                            this.textures.push(
                                new Xu(t, { width: e, height: r, wrapS: u, wrapT: l, minFilter: h, magFilter: c, type: f, format: p, internalFormat: d, unpackAlignment: g, premultiplyAlpha: m, flipY: !1, generateMipmaps: !1 })
                            ),
                                this.textures[n].update(),
                                this.gl.framebufferTexture2D(this.target, this.gl.COLOR_ATTACHMENT0 + n, this.gl.TEXTURE_2D, this.textures[n].texture, 0),
                                y.push(this.gl.COLOR_ATTACHMENT0 + n);
                        y.length > 1 && this.gl.renderer.drawBuffers(y),
                            (this.texture = this.textures[0]),
                            a && (this.gl.renderer.isWebgl2 || this.gl.renderer.getExtension("WEBGL_depth_texture"))
                                ? ((this.depthTexture = new Xu(t, {
                                      width: e,
                                      height: r,
                                      minFilter: this.gl.NEAREST,
                                      magFilter: this.gl.NEAREST,
                                      format: this.gl.DEPTH_COMPONENT,
                                      internalFormat: t.renderer.isWebgl2 ? this.gl.DEPTH_COMPONENT16 : this.gl.DEPTH_COMPONENT,
                                      type: this.gl.UNSIGNED_INT,
                                  })),
                                  this.depthTexture.update(),
                                  this.gl.framebufferTexture2D(this.target, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture.texture, 0))
                                : (o &&
                                      !s &&
                                      ((this.depthBuffer = this.gl.createRenderbuffer()),
                                      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer),
                                      this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, e, r),
                                      this.gl.framebufferRenderbuffer(this.target, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthBuffer)),
                                  s &&
                                      !o &&
                                      ((this.stencilBuffer = this.gl.createRenderbuffer()),
                                      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.stencilBuffer),
                                      this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.STENCIL_INDEX8, e, r),
                                      this.gl.framebufferRenderbuffer(this.target, this.gl.STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, this.stencilBuffer)),
                                  o &&
                                      s &&
                                      ((this.depthStencilBuffer = this.gl.createRenderbuffer()),
                                      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthStencilBuffer),
                                      this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_STENCIL, e, r),
                                      this.gl.framebufferRenderbuffer(this.target, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, this.depthStencilBuffer))),
                            this.gl.bindFramebuffer(this.target, null);
                    }
                    setSize(t, e) {
                        if (this.width !== t || this.height !== e) {
                            (this.width = t), (this.height = e), this.gl.bindFramebuffer(this.target, this.buffer);
                            for (let r = 0; r < this.textures.length; r++)
                                (this.textures[r].width = t),
                                    (this.textures[r].height = e),
                                    (this.textures[r].needsUpdate = !0),
                                    this.textures[r].update(),
                                    this.gl.framebufferTexture2D(this.target, this.gl.COLOR_ATTACHMENT0 + r, this.gl.TEXTURE_2D, this.textures[r].texture, 0);
                            this.depthTexture
                                ? ((this.depthTexture.width = t),
                                  (this.depthTexture.height = e),
                                  (this.depthTexture.needsUpdate = !0),
                                  this.depthTexture.update(),
                                  this.gl.framebufferTexture2D(this.target, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture.texture, 0))
                                : (this.depthBuffer && (this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer), this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, t, e)),
                                  this.stencilBuffer && (this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.stencilBuffer), this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.STENCIL_INDEX8, t, e)),
                                  this.depthStencilBuffer && (this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthStencilBuffer), this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_STENCIL, t, e))),
                                this.gl.bindFramebuffer(this.target, null);
                        }
                    }
                }
                class Vu {
                    constructor(t, { width: e, height: r, dpr: n, wrapS: i = t.CLAMP_TO_EDGE, wrapT: o = t.CLAMP_TO_EDGE, minFilter: s = t.LINEAR, magFilter: a = t.LINEAR, geometry: u = new Ba(t), targetOnly: l = null } = {}) {
                        (this.gl = t), (this.options = { wrapS: i, wrapT: o, minFilter: s, magFilter: a }), (this.passes = []), (this.geometry = u), (this.uniform = { value: null }), (this.targetOnly = l);
                        const h = (this.fbo = {
                            read: null,
                            write: null,
                            swap: () => {
                                let t = h.read;
                                (h.read = h.write), (h.write = t);
                            },
                        });
                        this.resize({ width: e, height: r, dpr: n });
                    }
                    addPass({ vertex: t = Gu, fragment: e = Wu, uniforms: r = {}, textureUniform: n = "tMap", enabled: i = !0 } = {}) {
                        r[n] = { value: this.fbo.read.texture };
                        const o = new Na(this.gl, { vertex: t, fragment: e, uniforms: r }),
                            s = { mesh: new hu(this.gl, { geometry: this.geometry, program: o }), program: o, uniforms: r, enabled: i, textureUniform: n };
                        return this.passes.push(s), s;
                    }
                    resize({ width: t, height: e, dpr: r } = {}) {
                        r && (this.dpr = r),
                            t && ((this.width = t), (this.height = e || t)),
                            (r = this.dpr || this.gl.renderer.dpr),
                            (t = Math.floor((this.width || this.gl.renderer.width) * r)),
                            (e = Math.floor((this.height || this.gl.renderer.height) * r)),
                            (this.options.width = t),
                            (this.options.height = e),
                            (this.fbo.read = new qu(this.gl, this.options)),
                            (this.fbo.write = new qu(this.gl, this.options));
                    }
                    render({ scene: t, camera: e, texture: r, target: n = null, update: i = !0, sort: o = !0, frustumCull: s = !0 }) {
                        const a = this.passes.filter((t) => t.enabled);
                        r || (this.gl.renderer.render({ scene: t, camera: e, target: a.length || (!n && this.targetOnly) ? this.fbo.write : n, update: i, sort: o, frustumCull: s }), this.fbo.swap()),
                            a.forEach((t, e) => {
                                (t.mesh.program.uniforms[t.textureUniform].value = !e && r ? r : this.fbo.read.texture),
                                    this.gl.renderer.render({ scene: t.mesh, target: e !== a.length - 1 || (!n && this.targetOnly) ? this.fbo.write : n, clear: !0 }),
                                    this.fbo.swap();
                            }),
                            (this.uniform.value = this.fbo.read.texture);
                    }
                }
                const Gu = "\n    attribute vec2 uv;\n    attribute vec2 position;\n\n    varying vec2 vUv;\n\n    void main() {\n        vUv = uv;\n        gl_Position = vec4(position, 0, 1);\n    }\n",
                    Wu = "\n    precision highp float;\n\n    uniform sampler2D tMap;\n    varying vec2 vUv;\n\n    void main() {\n        gl_FragColor = texture2D(tMap, vUv);\n    }\n";
                function Hu(t, e, r) {
                    return (t[0] = e[0] + r[0]), (t[1] = e[1] + r[1]), t;
                }
                function $u(t, e, r) {
                    return (t[0] = e[0] - r[0]), (t[1] = e[1] - r[1]), t;
                }
                function Zu(t, e, r) {
                    return (t[0] = e[0] * r), (t[1] = e[1] * r), t;
                }
                function Ku(t) {
                    var e = t[0],
                        r = t[1];
                    return Math.sqrt(e * e + r * r);
                }
                function Qu(t, e) {
                    return t[0] * e[1] - t[1] * e[0];
                }
                class Ju extends Array {
                    constructor(t = 0, e = t) {
                        return super(t, e), this;
                    }
                    get x() {
                        return this[0];
                    }
                    get y() {
                        return this[1];
                    }
                    set x(t) {
                        this[0] = t;
                    }
                    set y(t) {
                        this[1] = t;
                    }
                    set(t, e = t) {
                        return t.length
                            ? this.copy(t)
                            : ((function (t, e, r) {
                                  (t[0] = e), (t[1] = r);
                              })(this, t, e),
                              this);
                    }
                    copy(t) {
                        var e, r;
                        return (r = t), ((e = this)[0] = r[0]), (e[1] = r[1]), this;
                    }
                    add(t, e) {
                        return e ? Hu(this, t, e) : Hu(this, this, t), this;
                    }
                    sub(t, e) {
                        return e ? $u(this, t, e) : $u(this, this, t), this;
                    }
                    multiply(t) {
                        var e, r, n;
                        return t.length ? ((r = this), (n = t), ((e = this)[0] = r[0] * n[0]), (e[1] = r[1] * n[1])) : Zu(this, this, t), this;
                    }
                    divide(t) {
                        var e, r, n;
                        return t.length ? ((r = this), (n = t), ((e = this)[0] = r[0] / n[0]), (e[1] = r[1] / n[1])) : Zu(this, this, 1 / t), this;
                    }
                    inverse(t = this) {
                        var e, r;
                        return (r = t), ((e = this)[0] = 1 / r[0]), (e[1] = 1 / r[1]), this;
                    }
                    len() {
                        return Ku(this);
                    }
                    distance(t) {
                        return t ? ((e = this), (n = (r = t)[0] - e[0]), (i = r[1] - e[1]), Math.sqrt(n * n + i * i)) : Ku(this);
                        var e, r, n, i;
                    }
                    squaredLen() {
                        return this.squaredDistance();
                    }
                    squaredDistance(t) {
                        return t
                            ? ((e = this), (n = (r = t)[0] - e[0]), (i = r[1] - e[1]), n * n + i * i)
                            : (function (t) {
                                  var e = t[0],
                                      r = t[1];
                                  return e * e + r * r;
                              })(this);
                        var e, r, n, i;
                    }
                    negate(t = this) {
                        var e, r;
                        return (r = t), ((e = this)[0] = -r[0]), (e[1] = -r[1]), this;
                    }
                    cross(t, e) {
                        return e ? Qu(t, e) : Qu(this, t);
                    }
                    scale(t) {
                        return Zu(this, this, t), this;
                    }
                    normalize() {
                        var t, e, r, n, i;
                        return (t = this), (r = (e = this)[0]), (n = e[1]), (i = r * r + n * n) > 0 && (i = 1 / Math.sqrt(i)), (t[0] = e[0] * i), (t[1] = e[1] * i), this;
                    }
                    dot(t) {
                        return (r = t), (e = this)[0] * r[0] + e[1] * r[1];
                        var e, r;
                    }
                    equals(t) {
                        return (r = t), (e = this)[0] === r[0] && e[1] === r[1];
                        var e, r;
                    }
                    applyMatrix3(t) {
                        var e, r, n, i, o;
                        return (e = this), (n = t), (i = (r = this)[0]), (o = r[1]), (e[0] = n[0] * i + n[3] * o + n[6]), (e[1] = n[1] * i + n[4] * o + n[7]), this;
                    }
                    applyMatrix4(t) {
                        return (
                            (function (t, e, r) {
                                let n = e[0],
                                    i = e[1];
                                (t[0] = r[0] * n + r[4] * i + r[12]), (t[1] = r[1] * n + r[5] * i + r[13]);
                            })(this, this, t),
                            this
                        );
                    }
                    lerp(t, e) {
                        return (
                            (function (t, e, r, n) {
                                var i = e[0],
                                    o = e[1];
                                (t[0] = i + n * (r[0] - i)), (t[1] = o + n * (r[1] - o));
                            })(this, this, t, e),
                            this
                        );
                    }
                    clone() {
                        return new Ju(this[0], this[1]);
                    }
                    fromArray(t, e = 0) {
                        return (this[0] = t[e]), (this[1] = t[e + 1]), this;
                    }
                    toArray(t = [], e = 0) {
                        return (t[e] = this[0]), (t[e + 1] = this[1]), t;
                    }
                }
                const tl = new Ju(),
                    el = new Ju(),
                    rl = new Ju(),
                    nl = new Fa(),
                    il = new Fa(),
                    ol = new Fa(),
                    sl = new Fa(),
                    al = new Fa(),
                    ul = new Fa(),
                    ll = new Fa(),
                    hl = new Fa(),
                    cl = new Fa(),
                    fl = new Fa(),
                    pl = new Fa(),
                    dl = new nu();
                class gl {
                    constructor() {
                        (this.origin = new Fa()), (this.direction = new Fa());
                    }
                    castMouse(t, e = [0, 0]) {
                        if ("orthographic" === t.type) {
                            const { left: r, right: n, bottom: i, top: o, zoom: s } = t,
                                a = r / s + ((n - r) / s) * (0.5 * e[0] + 0.5),
                                u = i / s + ((o - i) / s) * (0.5 * e[1] + 0.5);
                            this.origin.set(a, u, 0), this.origin.applyMatrix4(t.worldMatrix), (this.direction.x = -t.worldMatrix[8]), (this.direction.y = -t.worldMatrix[9]), (this.direction.z = -t.worldMatrix[10]);
                        } else t.worldMatrix.getTranslation(this.origin), this.direction.set(e[0], e[1], 0.5), t.unproject(this.direction), this.direction.sub(this.origin).normalize();
                    }
                    intersectBounds(t, { maxDistance: e, output: r = [] } = {}) {
                        Array.isArray(t) || (t = [t]);
                        const n = dl,
                            i = nl,
                            o = il,
                            s = r;
                        return (
                            (s.length = 0),
                            t.forEach((t) => {
                                (t.geometry.bounds && t.geometry.bounds.radius !== 1 / 0) || t.geometry.computeBoundingSphere();
                                const r = t.geometry.bounds;
                                let a;
                                if (
                                    (n.inverse(t.worldMatrix),
                                    e && (o.copy(this.direction).scaleRotateMatrix4(n), (a = e * o.len())),
                                    i.copy(this.origin).applyMatrix4(n),
                                    o.copy(this.direction).transformDirection(n),
                                    e && i.distance(r.center) - r.radius > a)
                                )
                                    return;
                                let u = 0;
                                if ("sphere" === t.geometry.raycast) {
                                    if (i.distance(r.center) > r.radius && ((u = this.intersectSphere(r, i, o)), !u)) return;
                                } else if ((i.x < r.min.x || i.x > r.max.x || i.y < r.min.y || i.y > r.max.y || i.z < r.min.z || i.z > r.max.z) && ((u = this.intersectBox(r, i, o)), !u)) return;
                                (e && u > a) ||
                                    (t.hit || (t.hit = { localPoint: new Fa(), point: new Fa() }),
                                    t.hit.localPoint.copy(o).multiply(u).add(i),
                                    t.hit.point.copy(t.hit.localPoint).applyMatrix4(t.worldMatrix),
                                    (t.hit.distance = t.hit.point.distance(this.origin)),
                                    s.push(t));
                            }),
                            s.sort((t, e) => t.hit.distance - e.hit.distance),
                            s
                        );
                    }
                    intersectMeshes(t, { cullFace: e = !0, maxDistance: r, includeUV: n = !0, includeNormal: i = !0, output: o = [] } = {}) {
                        const s = this.intersectBounds(t, { maxDistance: r, output: o });
                        if (!s.length) return s;
                        const a = dl,
                            u = nl,
                            l = il,
                            h = ol,
                            c = sl,
                            f = al,
                            p = ul,
                            d = ll,
                            g = hl,
                            m = tl,
                            y = el,
                            v = rl;
                        for (let t = s.length - 1; t >= 0; t--) {
                            const o = s[t];
                            let D;
                            a.inverse(o.worldMatrix), r && (l.copy(this.direction).scaleRotateMatrix4(a), (D = r * l.len())), u.copy(this.origin).applyMatrix4(a), l.copy(this.direction).transformDirection(a);
                            let _,
                                b,
                                x,
                                w = 0;
                            const E = o.geometry,
                                C = E.attributes,
                                F = C.index,
                                T = Math.max(0, E.drawRange.start),
                                A = Math.min(F ? F.count : C.position.count, E.drawRange.start + E.drawRange.count);
                            for (let t = T; t < A; t += 3) {
                                const n = F ? F.data[t] : t,
                                    i = F ? F.data[t + 1] : t + 1,
                                    o = F ? F.data[t + 2] : t + 2;
                                h.fromArray(C.position.data, 3 * n), c.fromArray(C.position.data, 3 * i), f.fromArray(C.position.data, 3 * o);
                                const s = this.intersectTriangle(h, c, f, e, u, l, d);
                                s && ((r && s > D) || ((!w || s < w) && ((w = s), (_ = n), (b = i), (x = o), p.copy(d))));
                            }
                            w || s.splice(t, 1),
                                o.hit.localPoint.copy(l).multiply(w).add(u),
                                o.hit.point.copy(o.hit.localPoint).applyMatrix4(o.worldMatrix),
                                (o.hit.distance = o.hit.point.distance(this.origin)),
                                o.hit.faceNormal || ((o.hit.localFaceNormal = new Fa()), (o.hit.faceNormal = new Fa()), (o.hit.uv = new Ju()), (o.hit.localNormal = new Fa()), (o.hit.normal = new Fa())),
                                o.hit.localFaceNormal.copy(p),
                                o.hit.faceNormal.copy(o.hit.localFaceNormal).transformDirection(o.worldMatrix),
                                (n || i) && (h.fromArray(C.position.data, 3 * _), c.fromArray(C.position.data, 3 * b), f.fromArray(C.position.data, 3 * x), this.getBarycoord(o.hit.localPoint, h, c, f, g)),
                                n && C.uv && (m.fromArray(C.uv.data, 2 * _), y.fromArray(C.uv.data, 2 * b), v.fromArray(C.uv.data, 2 * x), o.hit.uv.set(m.x * g.x + y.x * g.y + v.x * g.z, m.y * g.x + y.y * g.y + v.y * g.z)),
                                i &&
                                    C.normal &&
                                    (h.fromArray(C.normal.data, 3 * _),
                                    c.fromArray(C.normal.data, 3 * b),
                                    f.fromArray(C.normal.data, 3 * x),
                                    o.hit.localNormal.set(h.x * g.x + c.x * g.y + f.x * g.z, h.y * g.x + c.y * g.y + f.y * g.z, h.z * g.x + c.z * g.y + f.z * g.z),
                                    o.hit.normal.copy(o.hit.localNormal).transformDirection(o.worldMatrix));
                        }
                        return s.sort((t, e) => t.hit.distance - e.hit.distance), s;
                    }
                    intersectSphere(t, e = this.origin, r = this.direction) {
                        const n = ol;
                        n.sub(t.center, e);
                        const i = n.dot(r),
                            o = n.dot(n) - i * i,
                            s = t.radius * t.radius;
                        if (o > s) return 0;
                        const a = Math.sqrt(s - o),
                            u = i - a,
                            l = i + a;
                        return u < 0 && l < 0 ? 0 : u < 0 ? l : u;
                    }
                    intersectBox(t, e = this.origin, r = this.direction) {
                        let n, i, o, s, a, u;
                        const l = 1 / r.x,
                            h = 1 / r.y,
                            c = 1 / r.z,
                            f = t.min,
                            p = t.max;
                        return (
                            (n = ((l >= 0 ? f.x : p.x) - e.x) * l),
                            (i = ((l >= 0 ? p.x : f.x) - e.x) * l),
                            (o = ((h >= 0 ? f.y : p.y) - e.y) * h),
                            (s = ((h >= 0 ? p.y : f.y) - e.y) * h),
                            n > s || o > i
                                ? 0
                                : (o > n && (n = o), s < i && (i = s), (a = ((c >= 0 ? f.z : p.z) - e.z) * c), (u = ((c >= 0 ? p.z : f.z) - e.z) * c), n > u || a > i ? 0 : (a > n && (n = a), u < i && (i = u), i < 0 ? 0 : n >= 0 ? n : i))
                        );
                    }
                    intersectTriangle(t, e, r, n = !0, i = this.origin, o = this.direction, s = ll) {
                        const a = hl,
                            u = cl,
                            l = fl;
                        a.sub(e, t), u.sub(r, t), s.cross(a, u);
                        let h,
                            c = o.dot(s);
                        if (!c) return 0;
                        if (c > 0) {
                            if (n) return 0;
                            h = 1;
                        } else (h = -1), (c = -c);
                        l.sub(i, t);
                        let f = h * o.dot(u.cross(l, u));
                        if (f < 0) return 0;
                        let p = h * o.dot(a.cross(l));
                        if (p < 0) return 0;
                        if (f + p > c) return 0;
                        let d = -h * l.dot(s);
                        return d < 0 ? 0 : d / c;
                    }
                    getBarycoord(t, e, r, n, i = hl) {
                        const o = cl,
                            s = fl,
                            a = pl;
                        o.sub(n, e), s.sub(r, e), a.sub(t, e);
                        const u = o.dot(o),
                            l = o.dot(s),
                            h = o.dot(a),
                            c = s.dot(s),
                            f = s.dot(a),
                            p = u * c - l * l;
                        if (0 === p) return i.set(-2, -1, -1);
                        const d = 1 / p,
                            g = (c * h - l * f) * d,
                            m = (u * f - l * h) * d;
                        return i.set(1 - g - m, m, g);
                    }
                }
                class ml extends Ra {
                    constructor(t, { width: e = 1, height: r = 1, widthSegments: n = 1, heightSegments: i = 1, attributes: o = {} } = {}) {
                        const s = n,
                            a = i,
                            u = (s + 1) * (a + 1),
                            l = s * a * 6,
                            h = new Float32Array(3 * u),
                            c = new Float32Array(3 * u),
                            f = new Float32Array(2 * u),
                            p = l > 65536 ? new Uint32Array(l) : new Uint16Array(l);
                        ml.buildPlane(h, c, f, p, e, r, 0, s, a), Object.assign(o, { position: { size: 3, data: h }, normal: { size: 3, data: c }, uv: { size: 2, data: f }, index: { data: p } }), super(t, o);
                    }
                    static buildPlane(t, e, r, n, i, o, s, a, u, l = 0, h = 1, c = 2, f = 1, p = -1, d = 0, g = 0) {
                        const m = d,
                            y = i / a,
                            v = o / u;
                        for (let D = 0; D <= u; D++) {
                            let _ = D * v - o / 2;
                            for (let o = 0; o <= a; o++, d++) {
                                let v = o * y - i / 2;
                                if (
                                    ((t[3 * d + l] = v * f),
                                    (t[3 * d + h] = _ * p),
                                    (t[3 * d + c] = s / 2),
                                    (e[3 * d + l] = 0),
                                    (e[3 * d + h] = 0),
                                    (e[3 * d + c] = s >= 0 ? 1 : -1),
                                    (r[2 * d] = o / a),
                                    (r[2 * d + 1] = 1 - D / u),
                                    D === u || o === a)
                                )
                                    continue;
                                let b = m + o + D * (a + 1),
                                    x = m + o + (D + 1) * (a + 1),
                                    w = m + o + (D + 1) * (a + 1) + 1,
                                    E = m + o + D * (a + 1) + 1;
                                (n[6 * g] = b), (n[6 * g + 1] = x), (n[6 * g + 2] = E), (n[6 * g + 3] = x), (n[6 * g + 4] = w), (n[6 * g + 5] = E), g++;
                            }
                        }
                    }
                }
                function yl(t) {
                    return (
                        (yl =
                            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                                  }),
                        yl(t)
                    );
                }
                function vl(t, e) {
                    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                }
                function Dl(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                function _l(t, e) {
                    return (
                        (_l =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        _l(t, e)
                    );
                }
                function bl(t) {
                    var e = (function () {
                        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ("function" == typeof Proxy) return !0;
                        try {
                            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
                        } catch (t) {
                            return !1;
                        }
                    })();
                    return function () {
                        var r,
                            n = wl(t);
                        if (e) {
                            var i = wl(this).constructor;
                            r = Reflect.construct(n, arguments, i);
                        } else r = n.apply(this, arguments);
                        return xl(this, r);
                    };
                }
                function xl(t, e) {
                    if (e && ("object" === yl(e) || "function" == typeof e)) return e;
                    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                    return (function (t) {
                        if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        return t;
                    })(t);
                }
                function wl(t) {
                    return (
                        (wl = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        wl(t)
                    );
                }
                var El = ea.bounds,
                    Cl = Ks,
                    Fl = $s,
                    Tl = (function (t) {
                        !(function (t, e) {
                            if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
                            (t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } })), e && _l(t, e);
                        })(o, t);
                        var e,
                            r,
                            n,
                            i = bl(o);
                        function o() {
                            return vl(this, o), i.apply(this, arguments);
                        }
                        return (
                            (e = o),
                            (r = [
                                {
                                    key: "mount",
                                    value: function (t, e, r, n) {
                                        var i = this,
                                            o = t.gl,
                                            s = t.scene;
                                        (this.el = e), (this.offset = { x: 0, y: 0, focus: 0 }), (this.progress = 1), (this.my = 1 - (n % 6) * 0.05), (this.tl = ei.timeline({ paused: !0, defaults: { duration: 0.5, ease: "expo" } }));
                                        var a = new Xu(o, { generateMipmaps: !1, minFilter: o.LINEAR }),
                                            u = e.dataset.src,
                                            l = new Image();
                                        (l.crossOrigin = "*"),
                                            (l.src = u),
                                            (this.name = u),
                                            (this.uniforms = {
                                                u_texture: { value: a },
                                                u_focusSize: { value: new Ju(El.ww, El.wh) },
                                                u_res: { value: new Ju(1, 1) },
                                                u_pos: { value: new Ju(0, 0) },
                                                u_scale: { value: 1 },
                                                u_progress: { value: 0 },
                                                u_alpha: { value: 0 },
                                            }),
                                            l.decode().then(function () {
                                                (a.image = l), ei.to(i.uniforms.u_alpha, { value: 1, duration: 0.5, ease: "power1", delay: 0.5 * Math.random() });
                                            });
                                        var h = new Na(o, {
                                            vertex:
                                                "precision mediump float;\n#define GLSLIFY 1\n\nattribute vec3 position;\nattribute vec2 uv;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\n\nuniform float u_diff;\nuniform float u_progress;\nuniform float u_scale;\n\nuniform vec2 u_pos;\nuniform vec2 u_focusSize;\nuniform vec2 u_res;\n\nvarying vec2 vUv;\n\nvoid main(){\n\tvec3 pos = position;\n\n\tpos.xy *= u_scale;\n\n\tvec4 mPos = modelViewMatrix * vec4(pos, 1.);\n\n\tvUv = uv;\n\tgl_Position = projectionMatrix * mPos;\n}",
                                            fragment:
                                                "precision mediump float;\n#define GLSLIFY 1\n\nuniform float u_alpha;\n\nuniform sampler2D u_texture;\n\nuniform vec2 u_res;\n\nvarying vec2 vUv;\n\nvoid main() {\n    vec2 uv = vUv;\n\n    vec4 texture = texture2D(u_texture, uv);\n\n    gl_FragColor = texture * u_alpha;\n}",
                                            uniforms: this.uniforms,
                                            cullFace: null,
                                            depthTest: !1,
                                            transparent: !0,
                                        });
                                        (this.mesh = new hu(o, { geometry: r, program: h, renderOrder: 1 })), this.addChild(this.mesh), this.setParent(s);
                                    },
                                },
                                {
                                    key: "tick",
                                    value: function (t) {
                                        var e = t.x,
                                            r = void 0 === e ? 0 : e,
                                            n = t.y,
                                            i = void 0 === n ? 0 : n,
                                            o = t.max,
                                            s = void 0 === o ? { x: 0, y: 0 } : o,
                                            a = this.rect,
                                            u = a.bottom,
                                            l = a.right,
                                            h = this.uniforms.u_pos,
                                            c = ei.utils.wrap(-(s.x - l), l, r) - this.offset.x,
                                            f = ei.utils.wrap(-(s.y - u), u, i * this.my) - this.offset.y;
                                        (this.position.y = f * this.progress + this.offset.focus * (1 - this.progress)), (this.position.x = c * this.progress), (h.value.x = c), (h.value.y = f);
                                    },
                                },
                                {
                                    key: "focus",
                                    value: function () {
                                        if (!this.focused) {
                                            (this.focused = !0), (this.mesh.frustumCulled = !1), (this.mesh.renderOrder = 10);
                                            var t = Cl(Fl(".js-grid-focused"));
                                            
                                            this.tl.clear().to(this, { progress: 0 }, 0).to(this.scale, { x: t.width, y: t.height }, 0).fromTo(this.text, { alpha: 0, y: "3rem" }, { alpha: 1, y: 0 }, 0.2).restart();
                                        }
                                    },
                                },
                                {
                                    key: "blur",
                                    value: function () {
                                        this.focused &&
                                            ((this.focused = !1),
                                            this.tl
                                                .clear()
                                                .to(this, { progress: 1 })
                                                .to(this.scale, { x: this.rect.width, y: this.rect.height }, 0)
                                                .to(this.text, { alpha: 0 }, 0)
                                                .set(this.mesh, { frustumCulled: !0, renderOrder: 1 })
                                                .restart());
                                    },
                                },
                                {
                                    key: "resize",
                                    value: function () {
                                        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.el;
                                        this.rect = Cl(t);
                                        var e = El.ww,
                                            r = El.wh,
                                            n = this.rect,
                                            i = n.left,
                                            o = n.top,
                                            s = n.width,
                                            a = n.height,
                                            u = this.uniforms.u_res;
                                        (this.offset.x = i + s / 2 - e / 2),
                                            (this.offset.y = o + a / 2 - r / 2),
                                            (this.position.x = this.offset.x),
                                            (this.position.y = this.offset.y),
                                            (this.scale.x = s),
                                            (this.scale.y = a),
                                            (u.value.x = s),
                                            (u.value.y = a);
                                    },
                                },
                            ]),
                            r && Dl(e.prototype, r),
                            n && Dl(e, n),
                            o
                        );
                    })(su);
                function Al(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                function Ml(t, e, r) {
                    return e in t ? Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : (t[e] = r), t;
                }
                var Ol = ea.bounds,
                    Sl = ea.dom,
                    Pl = ea.device,
                    kl = $s,
                    Rl = Zs,
                    Bl = Ks;
                const Ll = new ((function () {
                    function t() {
                        var e = this;
                        !(function (t, e) {
                            if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                        })(this, t),
                            Ml(this, "resize", function () {
                                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : Bl(e.el),
                                    r = Bl(kl(".js-grid-bounds")),
                                    n = r.width,
                                    i = r.height;
                                (e.max.x = n),
                                    (e.max.y = i),
                                    e.camera.orthographic({ near: 0.1, far: 10, left: t.width / -2, right: t.width / 2, top: t.height / 2, bottom: t.height / -2 }),
                                    e.renderer.setSize(t.width, t.height),
                                    e.post.resize(),
                                    // e.gl.canvas.height = ea.bounds.wh,
                                    e.pass.uniforms.u_res.value.set(e.gl.canvas.width, e.gl.canvas.height);
                                var o = 0.5 * Bl(kl(".js-grid-content")).height;
                                e.tiles &&
                                    e.tiles.forEach(function (t, r) {
                                        t.resize(e.elems[r]), (t.offset.focus = o), (t.text = e.texts[r]);
                                    });
                            }),
                            Ml(this, "onScroll", function (event) {
                                var scrollDelta = event.originalEvent.deltaY; 
                                var scrollDeltaX = event.originalEvent.deltaX; 
                                
                                e.tY -= 0.5 * scrollDelta;
                                e.tX -= 0.5 * scrollDeltaX;

                            }),
                            Ml(this, "move", function (t) {
                                var r = t.dX,
                                    n = t.dY;
                                (e.tY -= 0.5 * n), (e.tX += 0.5 * r);
                            }),
                            Ml(this, "tick", function () {
                                var t = e.tX - e.cX,
                                    r = e.tY - e.cY;
                                (e.cX += 0.085 * t),
                                    (e.cX = Math.round(100 * e.cX) / 100),
                                    (e.cY += 0.085 * r),
                                    (e.cY = Math.round(100 * e.cY) / 100),
                                    e.tiles.forEach(function (t) {
                                        return t.tick({ x: e.cX, y: e.cY, max: e.max });
                                    }),
                                    e.post.render({ scene: e.scene, camera: e.camera });
                            }),
                            Ml(this, "onMouseMove", function (t) {
                                var r = t.x,
                                    n = t.y;
                                e.isDragging && ((e.tX = e.on.x + 2.5 * r), (e.tY = e.on.y - 2.5 * n));
                            }),
                            Ml(this, "onMouseDown", function (t) {
                                var r = t.x,
                                    n = t.y;
                                t.target.closest(".js-grid") && !e.isDragging && ((e.isDragging = !0), (e.on.x = e.tX - 2.5 * r), (e.on.y = e.tY + 2.5 * n));
                            }),
                            Ml(this, "click", function (t, demo = 0) {
                                if(t.target.closest(".navbar") || t.target.closest(".header_cont")){
                                    return false;
                                }
                                window.demo = "hello";
                                    window.exam_t = t;

                                    if(t.click && window.anim_triggered == 1){
                                        return false;
                                    }
                                // if(t.click && !t.target.closest(".navbar")){
                                //     console.log("Close");
                                //     if(window.is_expand_click == 1){
                                //         window.is_expand_click = 0;
                                //     } else {
                                //         window.is_expand_click = 1;
                                //         setTimeout(() => {
                                //             jQuery("body").addClass("h_border"); 
                                //         }, 500);
                                //         var width_close = jQuery(".navbar .close_menu span").outerWidth() + 16;
                                //         setTimeout(function () {
                                //             jQuery(".close_menu").addClass("active");
                                //             jQuery(".menu_item").addClass("hidden");
                                //         }, 500);
                                //         jQuery(".navbar ul").animate({
                                //             width: width_close + "px"
                                //         }, 400);
                                //     }
                                // }
                                var r = t.x,
                                    n = t.y,
                                    i = t.click,
                                    o = t.target;

                                if ((e.isDragging && (e.isDragging = !1), i && o.closest(".js-grid"))) {
                                    // console.log(e.tiles);
                                    var s = Ol.ww,
                                        a = Ol.wh;
                                    (e.mouse.x = (r / s) * 2 - 1), (e.mouse.y = (-n / a) * 2 + 1), e.raycast.castMouse(e.camera, e.mouse);
                                    var u = e.tiles.map(function (t) {
                                        
                                            return t.children[0];
                                        }),
                                        l = e.raycast.intersectBounds(u);
                                    (0 === l.length || e.focusedTile) && e.focused
                                        ? (e.focusedTile.blur(), (e.focused = !1), e.fade()) 
                                        : ((e.focusedTile = l[0].parent), e.focusedTile.focus(), (e.focused = !0), e.fade(e.tiles, 0, 0.8, 1.25));
                                }
                            }),
                            Ml(this, "mount", function () {
                                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : kl(".js-grid");
                                (e.el = t),
                                    (e.elems = Rl(".js-tile")),
                                    (e.texts = Rl(".js-grid-text")),
                                    !e.tiles && e.createTiles(e.elems),
                                    e.resize(Bl(t)),
                                    Gs.on("resize", e.resize),
                                    Gs.on("tick", e.tick),
                                    Gs.on("mouseup", e.click),
                                    Gs.on("mousemove", e.onMouseMove),
                                    Gs.on("mousedown", e.onMouseDown),
                                    jQuery(document).on("wheel", e.onScroll), 
                                    
                                    !Pl.isMobile && Gs.on("vs", e.move),
                                    t.appendChild(e.gl.canvas);
                                    // console.log("mounted");
                            }),
                            Ml(this, "unmount", function () {
                                Gs.off("resize", e.resize), Gs.off("tick", e.tick), Gs.off("mouseup", e.click), Gs.off("mousemove", e.onMouseMove), Gs.off("mousedown", e.onMouseDown), !Pl.isMobile && Gs.off("vs", e.move);
                            }),
                            (this.tX = 0),
                            (this.tY = 0),
                            (this.cX = 0),
                            (this.cY = 0),
                            (this.max = { x: 0, y: 0 }),
                            (this.on = { x: 0, y: 0 }),
                            (this.isDragging = !1),
                            (this.renderer = new Ma({ dpr: ei.utils.clamp(1, 1.5, window.devicePixelRatio), alpha: !0 })),
                            (this.gl = this.renderer.gl),
                            this.gl.clearColor(229, 229, 229, 1),
                            this.gl.canvas.classList.add("gl", "z-5"),
                            (this.camera = new zu(this.gl)),
                            this.camera.position.set(0, 0, 5),
                            this.camera.lookAt([0, 0, 0]),
                            (this.post = new Vu(this.gl)),
                            (this.pass = this.post.addPass({
                                vertex:
                                    "#define GLSLIFY 1\nattribute vec2 uv;\nattribute vec2 position;\n\nuniform float u_scale;\n\nvarying vec2 vUv;\nvoid main() {\n    vec2 pos = position;\n\n    pos.xy *= u_scale;\n\n    vUv = uv;\n    gl_Position = vec4(pos, 0, 1);\n}",
                                fragment:
                                    "precision highp float;\n#define GLSLIFY 1\n\nuniform sampler2D tMap;\n\nuniform float u_diff;\nuniform float u_time;\n\nvarying vec2 vUv;\nvoid main() {\n    vec2 uv = vUv;\n\n    gl_FragColor = texture2D(tMap, uv);\n}",
                                uniforms: { u_res: { value: new Ju(0, 0) }, u_scale: { value: 1 }, u_diff: { value: 0 } },
                            })),
                            (this.scene = new su()),
                            (this.mouse = new Ju(0, 0)),
                            (this.raycast = new gl(this.gl)),
                            (this.tl = ei.timeline({ paused: !0, defaults: { duration: 0.35, ease: "power3" } })),
                            (this.texts = Rl(".js-grid-text")),
                            Gs.on("grid-mount", this.mount),
                            this.mount(),
                            window.canvas_elem = this,
                            Gs.on("grid-unmount", this.unmount);
                            setTimeout(() => {
                                this.resize();
                            }, 1);
                    }
                    var e, r, n;
                    return (
                        (e = t),
                        (r = [
                            {
                                key: "createTiles",
                                value: function (t) {
                                    var e = this,
                                        r = new ml(this.gl, { widthSegments: 1, heightSegments: 1, width: 1, height: 1 });
                                    this.tiles = t.map(function (t, n) {
                                        var i = new Tl();
                                        // var image = new Image();
                                        // image.src = jQuery(t).attr("data-src");
                                        // console.log("r",r);
                                        return i.mount(e, t, r, n), (i.text = e.texts[n]), i;
                                    });
                                },
                            },
                            {
                                key: "fade",
                                value: function () {
                                    var t = this,
                                        e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.tiles,
                                        r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1,
                                        n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1,
                                        i = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 1;
                                    this.tl.clear().to(this.pass.uniforms.u_scale, { value: i }),
                                        e.forEach(function (e) {
                                            var i = e.uniforms;
                                            t.tl.to(i.u_scale, { value: n, ease: "expo" }, 0), !e.focused && t.tl.to(i.u_alpha, { value: r }, 0);
                                        }),
                                        this.tl.restart();
                                },
                            },
                            {
                                key: "preload",
                                value: function () {
                                    var t = JSON.parse(Sl.body.dataset.textures);
                                    Sl.body.removeAttribute("data-textures"),
                                        Promise.all(
                                            t.map(function (t) {
                                                return new Promise(function (e) {
                                                    var r = new Image();
                                                    (r.src = t),
                                                        r.decode().then(function () {
                                                            return e();
                                                        });
                                                });
                                            })
                                        ).then(function () {
                                            return Gs.emit("loaded");
                                        });
                                },
                            },
                        ]),
                        r && Al(e.prototype, r),
                        n && Al(e, n),
                        t
                    );
                })())();
                // end of grid
                var jl = $s,
                    Nl = Zs,
                    zl = ea.flags;
                function Il() {
                    
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : jl(".js-story"),
                        e = [jl(".js-story-open"), Nl(".js-story-close", t)],
                        r = jl(".js-story-bg", t),
                        n = jl(".js-story-content", t),
                        i = ei
                            .timeline({ defaults: { duration: 0.75, ease: "power4" } })
                            .set(r, { alpha: 0 })
                            .set(n, { yPercent: 100 }),
                        o = null;
                    function s() {
                        (zl.locked = !0), o ? o.mount() : (o = Pu(t)), i.clear().set(t, { autoAlpha: 1 }).to(r, { alpha: 1 }).to(n, { yPercent: 0 }, 0).restart();
                    }
                    function a() {
                        (zl.locked = !1), o.unmount(), i.clear().to(r, { alpha: 0 }).to(n, { yPercent: 100 }, 0).set(t, { autoAlpha: 0 }).restart();
                    }
                    function u() {
                        Gs.off("click", e[0], s), Gs.off("click", e[1], a), o && o.unmount();
                    }
                    function l() {
                        Gs.on("click", e[0], s), Gs.on("click", e[1], a);
                    }
                    return l(), { unmount: u };
                }
                r(248);
                var Ul = $s,
                    Yl = [];
                var ql = $s,
                    Vl = Zs,
                    Gl = ea.dom,
                    Wl = ea.flags;
                var Hl = $s,
                    $l = Zs,
                    Zl = Ks,
                    Kl = ea.bounds;
                function Ql(t) {
                    return (
                        (Ql =
                            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                                  }),
                        Ql(t)
                    );
                }
                function Jl(t, e) {
                    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                }
                function th(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                function eh(t, e) {
                    return (
                        (eh =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        eh(t, e)
                    );
                }
                function rh(t) {
                    var e = (function () {
                        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ("function" == typeof Proxy) return !0;
                        try {
                            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
                        } catch (t) {
                            return !1;
                        }
                    })();
                    return function () {
                        var r,
                            n = ih(t);
                        if (e) {
                            var i = ih(this).constructor;
                            r = Reflect.construct(n, arguments, i);
                        } else r = n.apply(this, arguments);
                        return nh(this, r);
                    };
                }
                function nh(t, e) {
                    if (e && ("object" === Ql(e) || "function" == typeof e)) return e;
                    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                    return (function (t) {
                        if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        return t;
                    })(t);
                }
                function ih(t) {
                    return (
                        (ih = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        ih(t)
                    );
                }
                var oh,
                    sh,
                    ah = ea.dom,
                    uh = ea.flags,
                    lh = ea.device,
                    hh = Zs,
                    ch = (function (t) {
                        !(function (t, e) {
                            if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
                            (t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } })), e && eh(t, e);
                        })(o, t);
                        var e,
                            r,
                            n,
                            i = rh(o);
                        function o() {
                            return Jl(this, o), i.apply(this, arguments);
                        }
                        return (
                            (e = o),
                            (r = [
                                {
                                    key: "setup",
                                    value: function () {
                                        var t = this;
                                        this.onEnter(),
                                            (function () {
                                                var t = ei.timeline({ paused: !0 }),
                                                    e = ql(".js-pl"),
                                                    r = ql(".js-i-down"),
                                                    n = ql(".js-i-title-svg"),
                                                    i = Vl(".js-i-l"),
                                                    o = ql(".js-i-intro"),
                                                    s = Vl(".js-i-side"),
                                                    a = 0.5,
                                                    u = !1;
                                                Gs.on("loaded", h);
                                                var l = ei
                                                    .timeline({
                                                        defaults: { duration: 3, ease: "power3.inOut" },
                                                        onComplete: function () {
                                                            u ? (c(), Gs.off("loaded", h)) : Gs.on("loaded", c);
                                                        },
                                                    })
                                                    .to(".js-pl-numb-1", { yPercent: -50, duration: 1.5 }, 1.5)
                                                    .to(".js-pl-numb-2", { yPercent: -100 }, 0)
                                                    .to(".js-pl-numb-3", { yPercent: -100 }, 0);
                                                function h() {
                                                    u = !0;
                                                }
                                                function c() {
                                                    t
                                                        .clear()
                                                        .to([e, ".js-pl-mask"], { yPercent: ei.utils.wrap([-100, 100]), duration: 0.75, ease: "power3.inOut" })
                                                        .add(function () {
                                                            Gl.body.classList.remove("is-loading"), l.kill(), e.remove();
                                                        }),
                                                        r && t.from(r, { y: "-4.5rem", duration: 1.5, ease: "power3" }, a),
                                                        i && t.from(i, { alpha: 0, yPercent: -10, rotationX: -15, duration: 1, stagger: 0.035, ease: "expo" }, a),
                                                        n && t.from(n, { alpha: 0, duration: 1, ease: "expo" }, a),
                                                        o && t.from(new (wu())(o, { types: "lines" }).lines, { alpha: 0, duration: 1, stagger: 0.05, ease: "power1" }, 0.75),
                                                        s && t.from(s, { alpha: 0, x: ei.utils.wrap(["-3rem", "3rem"]), duration: 1, ease: "expo" }, 0.55),
                                                        t
                                                            .add(function () {
                                                                return (Wl.ready = !0);
                                                            }, Gl.body.classList.add("is-loaded"))
                                                            .restart();
                                                }
                                            })(),
                                            Ll.preload(),
                                            lh.isSafari && ah.body.classList.add("is-safari"),
                                            (window.onload = function () {
                                                return t.load();
                                            });
                                    },
                                },
                                {
                                    key: "onEnter",
                                    value: function () {
                                        (oh = this),
                                            Gs.on("transition:end first", this.onTransitionCompleted),
                                            Gs.emit("menu-clip"),
                                            (this.el = document.querySelector(".main")),
                                            ah.currentPage && ah.body.classList.remove("page-".concat(ah.currentPage.id)),
                                            (ah.currentPage = this.el),
                                            ah.body.classList.add("page-".concat(ah.currentPage.id)),
                                            sh && !sh.inited() && sh.initial();
                                    },
                                },
                                {
                                    key: "onEnterCompleted",
                                    value: function () {
                                        this.initSmooth(), this.initLazy();
                                    },
                                },
                                {
                                    key: "onLeave",
                                    value: function () {
                                        (uh.locked = !0), Gs.off("transition:end first", this.onTransitionCompleted);
                                    },
                                },
                                {
                                    key: "onLeaveCompleted",
                                    value: function () {
                                        this.smooth && this.smooth.unmount(),
                                            this.lazy && this.lazy.unmount(),
                                            this.projectHovers && this.projectHovers.unmount(),
                                            this.carousels &&
                                                this.carousels.forEach(function (t) {
                                                    return t();
                                                });
                                    },
                                },
                                {
                                    key: "onTransitionCompleted",
                                    value: function () {
                                        Io.getAll().forEach(function (t) {
                                            return t.kill();
                                        }),
                                            (function () {
                                                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : Fu.body,
                                                    e = Cu(".js-s-fades", t);
                                                e.length &&
                                                    e.forEach(function (t) {
                                                        var e = Eu(".js-fade-story", t);
                                                        if (null == t.dataset.landscape || !Tu.isPortrait) {
                                                            var r = ei
                                                                .timeline({ scrollTrigger: { trigger: t, start: "top+=33% bottom" }, defaults: { ease: "expo" } })
                                                                .fromTo(Cu(".js-fade", t), { y: "3rem", alpha: 0 }, { y: 0, alpha: 1, duration: 1, stagger: 0.1 });
                                                            e && r.from(Eu("circle", e), { drawSVG: 0, duration: 0.75 }, 0.1).from(e, { scale: 0, duration: 0.5 }, 0.1);
                                                        }
                                                    }),
                                                    (e = Cu(".js-s-lines", t)).length &&
                                                        e.forEach(function (t) {
                                                            ei.fromTo(new (wu())(t, { type: "lines" }).lines, { y: "3rem", alpha: 0 }, { y: 0, alpha: 1, duration: 1, stagger: 0.05, ease: "expo", scrollTrigger: { trigger: t } });
                                                        }),
                                                    (e = Cu(".js-s-p-lines", t)).length &&
                                                        e.forEach(function (t) {
                                                            var e,
                                                                r = Cu("p", t);
                                                            (e = r.length
                                                                ? r
                                                                      .map(function (t) {
                                                                          return new (wu())(t, { type: "lines" }).lines;
                                                                      })
                                                                      .flat()
                                                                : new (wu())(t, { type: "lines" }).lines),
                                                                ei.fromTo(e, { y: "3rem", alpha: 0 }, { y: 0, alpha: 1, duration: 1, stagger: 0.05, ease: "expo", scrollTrigger: { trigger: t } });
                                                        }),
                                                    (e = Cu(".js-vid", t)).length &&
                                                        e.forEach(function (t) {
                                                            Io.create({
                                                                trigger: t,
                                                                onToggle: function (e) {
                                                                    e.isActive ? t.play() : t.pause();
                                                                },
                                                            });
                                                        });
                                                var r = Eu(".js-s-toggle-next", t);
                                                if (r) {
                                                    var n = Eu(".js-s-next", t),
                                                        i = Eu(".js-p-hero", n);
                                                    Io.create({
                                                        trigger: r,
                                                        onToggle: function (e) {
                                                            e.isActive ? ei.set(n, { autoAlpha: 1 }, t.classList.remove("is-active")) : ei.set(n, { autoAlpha: 0 }, t.classList.add("is-active"));
                                                        },
                                                    }),
                                                        ei.fromTo(i, { scale: 1.15 }, { scale: 1, scrollTrigger: { trigger: r, endTrigger: Eu(".js-p-next-end", t), end: "bottom bottom", scrub: !0 } });
                                                }
                                            })(oh.el),
                                            oh.initProjectHovers(),
                                            (uh.locked = !1);
                                    },
                                },
                                {
                                    key: "load",
                                    value: function () {
                                        this.onEnterCompleted(),
                                            !(sh = (function () {
                                                var t,
                                                    e,
                                                    r = du(".js-menu"),
                                                    n = du(".js-menu-line", r),
                                                    i = gu(".js-menu-link", r),
                                                    o = ei.timeline({ paused: !0, defaults: { duration: 0.4, ease: "power2.inOut" } }),
                                                    s = !1;
                                                function a() {
                                                    var t = e.find(function (t) {
                                                        return t.href === window.location.pathname;
                                                    });
                                                    if (t) {
                                                        i.indexOf(t.item);
                                                        var r = t.cx,
                                                            s = t.cs;
                                                        o.clear().to(n, { x: r, scaleX: s }).restart();
                                                    }
                                                }
                                                return (
                                                    (t = mu(n)),
                                                    (e = i.map(function (e) {
                                                        var r = e.pathname,
                                                            n = mu(du(".js-menu-link-elem", e)),
                                                            i = n.left,
                                                            o = n.width;
                                                        return { item: e, cx: i + 4 - t.left, cs: (o - 8) / t.width, href: r };
                                                    })),
                                                    Gs.on("menu-clip", a),
                                                    {
                                                        unmount: function () {
                                                            Gs.off("click", i, a);
                                                        },
                                                        initial: function () {
                                                            var t = e.find(function (t) {
                                                                return t.href === window.location.pathname;
                                                            });
                                                            if (t) {
                                                                var r = t.cx,
                                                                    i = t.cs;
                                                                ei.set(n, { x: r, scaleX: i }), (s = !0);
                                                            }
                                                        },
                                                        inited: function () {
                                                            return s;
                                                        },
                                                    }
                                                );
                                            })()).inited() && sh.initial(),
                                            Gs.emit("first");
                                    },
                                },
                                {
                                    key: "initSmooth",
                                    value: function () {
                                        var t = hh("[data-smooth-item]", this.el);
                                        t.length &&
                                            (this.smooth = (function () {
                                                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : yu("[data-smooth-item]"),
                                                    e = arguments.length > 1 ? arguments[1] : void 0,
                                                    r = arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
                                                    n = 0,
                                                    i = !1,
                                                    o = null;
                                                bu.infiniteScroll = r;
                                                var s = t.length - 1,
                                                    a = r && [vu(".js-replace", e), vu(".js-replacement", e)];
                                                function u() {
                                                    o = t.map(function (t, e) {
                                                        ei.set(t, { y: 0 });
                                                        var r = Du(t),
                                                            n = r.top,
                                                            i = r.bottom,
                                                            o = n - _u.wh,
                                                            a = i;
                                                        return e === s && (_u.maxScroll = i - _u.wh), { el: t, start: o, end: a, out: !0 };
                                                    });
                                                }
                                                function l(t) {
                                                    t.replaced = !0;
                                                    var e = a[1];
                                                    (e.style.pointerEvents = "auto"), (e.style.opacity = 1), a[0].remove();
                                                    var r = vu("[data-src]", e),
                                                        n = r.dataset.src;
                                                    if (n) {
                                                        var i = new Image();
                                                        (i.src = n),
                                                            i.decode().then(function () {
                                                                r.appendChild(i), r.classList.add("is-loaded");
                                                            });
                                                    }
                                                }
                                                function h(t) {
                                                    var e = t.cY;
                                                    (n = e), !i && (bu.infiniteScroll ? f() : c());
                                                }
                                                function c() {
                                                    bu.locked ||
                                                        (o.length &&
                                                            o.forEach(function (t) {
                                                                var e = t.el;
                                                                d(t.start, t.end) || i ? (t.out && (t.out = !1), p(e, n)) : t.out || ((t.out = !0), p(e, n));
                                                            }));
                                                }
                                                function f() {
                                                    if (!bu.locked) {
                                                        var t = _u.maxScroll + _u.wh;
                                                        o.length &&
                                                            o.forEach(function (e, r) {
                                                                var o = e.el,
                                                                    s = e.start,
                                                                    a = e.end,
                                                                    u = ei.utils.wrap(-(t - a), a, n);
                                                                d(s, a, u) || i ? (e.out && (e.out = !1), p(o, u)) : e.out || ((e.out = !0), p(o, u), 0 === r && !e.replaced && l(e));
                                                            });
                                                    }
                                                }
                                                function p(t) {
                                                    var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : n;
                                                    t.style.transform = "translate3d(0, ".concat(-e, "px, 0)");
                                                }
                                                function d(t, e) {
                                                    var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : n;
                                                    return r > t && r < e;
                                                }
                                                function g() {
                                                    (i = !0),
                                                        u(),
                                                        Gs.emit("resize:on-reset"),
                                                        requestAnimationFrame(function () {
                                                            c(), (i = !1);
                                                        });
                                                }
                                                function m() {
                                                    Gs.on("tick", h), Gs.on("resize resize:scroll", g);
                                                }
                                                function y() {
                                                    Gs.off("tick", h), Gs.off("resize resize:scroll", g), (o = null), Gs.emit("scroll:on-reset");
                                                }
                                                return a && ((a[1].style.pointerEvents = "none"), (a[1].style.opacity = 0)), u(), m(), { unmount: y };
                                            })(t, this.el, void 0 !== this.el.dataset.infinite));
                                    },
                                },
                                {
                                    key: "initLazy",
                                    value: function () {
                                        var t = hh("[data-lazy-src]", this.el);
                                        t.length &&
                                            (this.lazy = (function () {
                                                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : ku("[data-lazy-src]"),
                                                    e = new IntersectionObserver(r);
                                                function r(t) {
                                                    t.forEach(function (t) {
                                                        return t.isIntersecting && (n(t.target), e.unobserve(t.target));
                                                    });
                                                }
                                                function n(t) {
                                                    var e = t.dataset.lazySrc;
                                                    if (e) {
                                                        var r = new Image();
                                                        !t.classList.contains("media-fill") && t.classList.add("media-fill"),
                                                            (r.alt = ""),
                                                            (r.src = e),
                                                            r.decode().then(function () {
                                                                t.appendChild(r), t.classList.add("is-loaded");
                                                            });
                                                    }
                                                }
                                                function i() {
                                                    e.disconnect();
                                                }
                                                return (
                                                    t.forEach(function (t) {
                                                        return e.observe(t);
                                                    }),
                                                    { unmount: i }
                                                );
                                            })(t));
                                    },
                                },
                                {
                                    key: "initProjectHovers",
                                    value: function () {
                                        if (!lh.isSmall && !lh.isMobile) {
                                            var t = hh(".js-m-move-wrap", this.el);
                                            t.length &&
                                                (this.projectHovers = (function () {
                                                    var t,
                                                        e,
                                                        r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : $l(".js-m-move-wrap"),
                                                        n = 0,
                                                        i = 0,
                                                        o = 0,
                                                        s = 0,
                                                        a = 0,
                                                        u = [0, 0],
                                                        l = !1;
                                                    function h() {
                                                        (a = Zl(Hl(".js-scroll-height")).height),
                                                            (t = r.map(function (t, e) {
                                                                var r = Hl(".js-m-move", t),
                                                                    n = Zl(r),
                                                                    i = n.left,
                                                                    o = n.top,
                                                                    s = n.height,
                                                                    a = i + n.width / 2,
                                                                    u = o + s / 2,
                                                                    l = 1;
                                                                return o <= Kl.wh && ((u += Kl.wh), (l = 0)), { item: r, ox: a, oy: u, si: l };
                                                            }));
                                                    }
                                                    function c(t) {
                                                        var r = t.cY;
                                                        if (l) {
                                                            var h = e,
                                                                c = h.ox,
                                                                f = h.oy,
                                                                p = h.item,
                                                                d = h.si;
                                                            0 === d ? (u[0] = ei.utils.wrap(0, a - Kl.wh, r)) : (u[1] = ei.utils.wrap(0, a, r)),
                                                                (o = n - c),
                                                                (s = i - (f - u[d])),
                                                                (p.style.transform = "translate3d(".concat(o, "px, ").concat(s, "px, 0)"));
                                                        }
                                                    }
                                                    function f(t) {
                                                        var e = t.x,
                                                            r = t.y;
                                                        (n = e), (i = r);
                                                    }
                                                    function p(a) {
                                                        var u = a.currentTarget;
                                                        (o = n), (s = i), (e = t[r.indexOf(u)]), (l = !0);
                                                    }
                                                    function d() {
                                                        l = !1;
                                                    }
                                                    function g() {
                                                        Gs.on("mouseenter", r, p), Gs.on("mouseleave", r, d), Gs.on("mousemove", f), Gs.on("resize:on-reset", h), Gs.on("tick", c);
                                                    }
                                                    function m() {
                                                        Gs.off("mouseenter", r, p), Gs.off("mouseleave", r, d), Gs.off("mousemove", f), Gs.off("resize:on-reset", h), Gs.off("tick", c);
                                                    }
                                                    return h(), g(), { unmount: m };
                                                })(t));
                                        }
                                    },
                                },
                            ]),
                            r && th(e.prototype, r),
                            n && th(e, n),
                            o
                        );
                    })(h.Renderer);
                function fh(t) {
                    return (
                        (fh =
                            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                                  }),
                        fh(t)
                    );
                }
                function ph(t, e) {
                    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                }
                function dh(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                function gh() {
                    return (
                        (gh =
                            "undefined" != typeof Reflect && Reflect.get
                                ? Reflect.get
                                : function (t, e, r) {
                                      var n = mh(t, e);
                                      if (n) {
                                          var i = Object.getOwnPropertyDescriptor(n, e);
                                          return i.get ? i.get.call(arguments.length < 3 ? t : r) : i.value;
                                      }
                                  }),
                        gh.apply(this, arguments)
                    );
                }
                function mh(t, e) {
                    for (; !Object.prototype.hasOwnProperty.call(t, e) && null !== (t = bh(t)); );
                    return t;
                }
                function yh(t, e) {
                    return (
                        (yh =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        yh(t, e)
                    );
                }
                function vh(t) {
                    var e = (function () {
                        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ("function" == typeof Proxy) return !0;
                        try {
                            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
                        } catch (t) {
                            return !1;
                        }
                    })();
                    return function () {
                        var r,
                            n = bh(t);
                        if (e) {
                            var i = bh(this).constructor;
                            r = Reflect.construct(n, arguments, i);
                        } else r = n.apply(this, arguments);
                        return Dh(this, r);
                    };
                }
                function Dh(t, e) {
                    if (e && ("object" === fh(e) || "function" == typeof e)) return e;
                    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                    return _h(t);
                }
                function _h(t) {
                    if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                    return t;
                }
                function bh(t) {
                    return (
                        (bh = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        bh(t)
                    );
                }
                function xh(t, e, r) {
                    return e in t ? Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : (t[e] = r), t;
                }
                var wh = null,
                    Eh = (function (t) {
                        !(function (t, e) {
                            if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
                            (t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } })), e && yh(t, e);
                        })(o, t);
                        var e,
                            r,
                            n,
                            i = vh(o);
                        function o() {
                            var t;
                            ph(this, o);
                            for (var e = arguments.length, r = new Array(e), n = 0; n < e; n++) r[n] = arguments[n];
                            return (
                                xh(_h((t = i.call.apply(i, [this].concat(r)))), "toWorks", function () {
                                    Of.redirect(location.origin + "/work");
                                }),
                                t
                            );
                        }
                        return (
                            (e = o),
                            (r = [
                                {
                                    key: "onEnter",
                                    value: function () {
                                        gh(bh(o.prototype), "onEnter", this).call(this), Xl();
                                    },
                                },
                                {
                                    key: "onLeave",
                                    value: function () {
                                        Gs.off("scroll", this.toWorks), gh(bh(o.prototype), "onLeave", this).call(this);
                                    },
                                },
                                {
                                    key: "onEnterCompleted",
                                    value: function () {
                                        gh(bh(o.prototype), "onEnterCompleted", this).call(this),
                                            !wh &&
                                                (wh = (function () {
                                                    var t = new Ma(),
                                                        e = t.gl;
                                                    function r() {
                                                        t.setSize(cu.ww, cu.wh);
                                                    }
                                                    e.clearColor(1, 1, 1, 1), r();
                                                    var n = new Ba(e),
                                                        i =
                                                            (function () {
                                                                var t = new Date();
                                                                return (
                                                                    (t = t.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "America/New_York" }).replace(/^0+/, "").replace(/\D/g, "")),
                                                                    500 <= (t = parseFloat(t)) && t <= 900
                                                                        ? "1"
                                                                        : 900 <= t && t <= 1200
                                                                        ? "2"
                                                                        : 1200 <= t && t <= 1500
                                                                        ? "3"
                                                                        : 1500 <= t && t <= 1700
                                                                        ? "4"
                                                                        : 1700 <= t && t <= 2e3
                                                                        ? "5"
                                                                        : 2e3 <= t && t <= 2400
                                                                        ? "6"
                                                                        : 0 <= t && t <= 500
                                                                        ? "7"
                                                                        : void 0
                                                                );
                                                            })() - 1,
                                                        o = new Na(e, {
                                                            vertex: "#define GLSLIFY 1\nattribute vec2 uv;\nattribute vec2 position;\nvarying vec2 vUv;\nvoid main() {\n    vUv = uv;\n    gl_Position = vec4(position, 0, 1);\n}",
                                                            fragment:
                                                                "precision highp float;\n#define GLSLIFY 1\n\n//\n// Description : Array and textureless GLSL 2D simplex noise function.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289(vec2 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute(vec3 x) {\n  return mod289(((x*34.0)+1.0)*x);\n}\n\nfloat snoise(vec2 v)\n  {\n  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626,  // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i  = floor(v + dot(v, C.yy) );\n  vec2 x0 = v -   i + dot(i, C.xx);\n\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n// Permutations\n  i = mod289(i); // Avoid truncation effects in permutation\n  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n    + i.x + vec3(0.0, i1.x, 1.0 ));\n\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n// Normalise gradients implicitly by scaling m\n// Approximation of: m *= inversesqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n// Compute final noise value at P\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\nuniform float u_time;\n\nuniform vec3 u_color1;\nuniform vec3 u_color2;\nuniform vec3 u_color3;\nuniform vec3 u_color4;\n\nvarying vec2 vUv;\nvoid main() {\n    vec2 uv = vUv;\n\n    float noise = snoise(uv * .75 + (u_time / 15.)) * .75;\n\n    float progress1 = smoothstep(0.0, 0.25, uv.y);\n    vec3 mix1 = mix(u_color1, u_color2, progress1);\n    float progress2 = smoothstep(0., .5, uv.y);\n    vec3 mix2 = mix(mix1, u_color3, progress2);\n    float progress3 = smoothstep(0.25, 1.0, uv.y);\n    vec3 final = mix(mix2, u_color4, progress3 + noise);\n\n    gl_FragColor.rgb = final;\n    gl_FragColor.a = 1.;\n}",
                                                            uniforms: {
                                                                u_time: { value: 0 },
                                                                u_color1: { value: new Wa(pu[i][0]) },
                                                                u_color2: { value: new Wa(pu[i][1]) },
                                                                u_color3: { value: new Wa(pu[i][2]) },
                                                                u_color4: { value: new Wa(pu[i][3]) },
                                                            },
                                                        }),
                                                        s = new hu(e, { geometry: n, program: o });
                                                    function a(e) {
                                                        var r = e.time;
                                                        (o.uniforms.u_time.value = r), t.render({ scene: s });
                                                    }
                                                    return {
                                                        mount: function () {
                                                            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : fu(".js-gradient");
                                                            Gs.on("resize", r), Gs.on("tick", a), t.appendChild(e.canvas), e.canvas.classList.add("gl"), r();
                                                        },
                                                        unmount: function () {
                                                            Gs.off("resize", r), Gs.off("tick", a);
                                                        },
                                                    };
                                                })()),
                                            wh.mount(),
                                            Gs.on("scroll", this.toWorks);
                                    },
                                },
                                {
                                    key: "onLeaveCompleted",
                                    value: function () {
                                        gh(bh(o.prototype), "onLeaveCompleted", this).call(this), wh.unmount();
                                    },
                                },
                                {
                                    key: "load",
                                    value: function () {
                                        gh(bh(o.prototype), "load", this).call(this);
                                    },
                                },
                            ]),
                            r && dh(e.prototype, r),
                            n && dh(e, n),
                            o
                        );
                    })(ch);
                function Ch(t) {
                    return (
                        (Ch =
                            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                                  }),
                        Ch(t)
                    );
                }
                function Fh(t, e) {
                    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                }
                function Th(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                function Ah() {
                    return (
                        (Ah =
                            "undefined" != typeof Reflect && Reflect.get
                                ? Reflect.get
                                : function (t, e, r) {
                                      var n = Mh(t, e);
                                      if (n) {
                                          var i = Object.getOwnPropertyDescriptor(n, e);
                                          return i.get ? i.get.call(arguments.length < 3 ? t : r) : i.value;
                                      }
                                  }),
                        Ah.apply(this, arguments)
                    );
                }
                function Mh(t, e) {
                    for (; !Object.prototype.hasOwnProperty.call(t, e) && null !== (t = Rh(t)); );
                    return t;
                }
                function Oh(t, e) {
                    return (
                        (Oh =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        Oh(t, e)
                    );
                }
                function Sh(t) {
                    var e = (function () {
                        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ("function" == typeof Proxy) return !0;
                        try {
                            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
                        } catch (t) {
                            return !1;
                        }
                    })();
                    return function () {
                        var r,
                            n = Rh(t);
                        if (e) {
                            var i = Rh(this).constructor;
                            r = Reflect.construct(n, arguments, i);
                        } else r = n.apply(this, arguments);
                        return Ph(this, r);
                    };
                }
                function Ph(t, e) {
                    if (e && ("object" === Ch(e) || "function" == typeof e)) return e;
                    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                    return kh(t);
                }
                function kh(t) {
                    if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                    return t;
                }
                function Rh(t) {
                    return (
                        (Rh = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        Rh(t)
                    );
                }
                function Bh(t, e, r) {
                    return e in t ? Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : (t[e] = r), t;
                }
                var Lh,
                    jh = $s,
                    Nh = ea.device,
                    zh = (function (t) {
                        !(function (t, e) {
                            if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
                            (t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } })), e && Oh(t, e);
                        })(o, t);
                        var e,
                            r,
                            n,
                            i = Sh(o);
                        function o() {
                            var t;
                            Fh(this, o);
                            for (var e = arguments.length, r = new Array(e), n = 0; n < e; n++) r[n] = arguments[n];
                            return (
                                Bh(kh((t = i.call.apply(i, [this].concat(r)))), "initStory", function () {
                                    var e = jh(".js-story", t.el);
                                    e && (t.story = Il(e));
                                }),
                                Bh(kh(t), "topClip", function () {
                                    var e = jh(".js-s-case-top", t.el);
                                    if (e) {
                                        var r = 1,
                                            n = !1;
                                        Io.create({
                                            trigger: e,
                                            endTrigger: jh(".js-s-case-top-end", t.el),
                                            start: "top top",
                                            end: "top top",
                                            onUpdate: function (i) {
                                                t.leave ||
                                                    ((r = 1 - i.progress),
                                                    Nh.isSmall
                                                        ? ei.set(e, {
                                                              clipPath: "inset("
                                                                  .concat(8 * r, "rem 0 0 0 round ")
                                                                  .concat(1.2 * r, "rem ")
                                                                  .concat(1.2 * r, "rem 0 0)"),
                                                          })
                                                        : ei.set(e, {
                                                              clipPath: "inset("
                                                                  .concat(8 * r, "rem ")
                                                                  .concat(2 * r, "rem 0 ")
                                                                  .concat(2 * r, "rem round ")
                                                                  .concat(1.2 * r, "rem ")
                                                                  .concat(1.2 * r, "rem 0 0)"),
                                                          }),
                                                    1 !== i.progress || n ? n && ((n = !1), t.el.classList.remove("is-active")) : (!n && (n = !0), t.el.classList.add("is-active")));
                                            },
                                        });
                                    }
                                }),
                                Bh(kh(t), "onESC", function (e) {
                                    var r = e.key;
                                    (t.escaped = !0), document.removeEventListener("keyup", t.onESC), "ESCAPE" === r.toUpperCase() && Of.redirect(location.origin + "/work");
                                }),
                                t
                            );
                        }
                        return (
                            (e = o),
                            (r = [
                                {
                                    key: "setup",
                                    value: function () {
                                        Ah(Rh(o.prototype), "setup", this).call(this);
                                    },
                                },
                                {
                                    key: "onEnter",
                                    value: function () {
                                        Ah(Rh(o.prototype), "onEnter", this).call(this), (Lh = this);
                                    },
                                },
                                {
                                    key: "onLeave",
                                    value: function () {
                                        (this.leave = !0), this.el.classList.remove("is-active"), Ah(Rh(o.prototype), "onLeave", this).call(this), this.story && this.story.unmount();
                                    },
                                },
                                {
                                    key: "onEnterCompleted",
                                    value: function () {
                                        Ah(Rh(o.prototype), "onEnterCompleted", this).call(this), document.addEventListener("keyup", this.onESC);
                                    },
                                },
                                {
                                    key: "onLeaveCompleted",
                                    value: function () {
                                        Ah(Rh(o.prototype), "onLeaveCompleted", this).call(this), !this.escaped && document.removeEventListener("keyup", this.onESC);
                                    },
                                },
                                {
                                    key: "onTransitionCompleted",
                                    value: function () {
                                        Ah(Rh(o.prototype), "onTransitionCompleted", this).call(this), Lh.initStory(), Lh.topClip();
                                    },
                                },
                                {
                                    key: "load",
                                    value: function () {
                                        Ah(Rh(o.prototype), "load", this).call(this);
                                    },
                                },
                            ]) && Th(e.prototype, r),
                            n && Th(e, n),
                            o
                        );
                    })(ch);
                function Ih(t) {
                    return (
                        (Ih =
                            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                                  }),
                        Ih(t)
                    );
                }
                function Uh(t, e) {
                    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                }
                function Yh(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                function Xh() {
                    return (
                        (Xh =
                            "undefined" != typeof Reflect && Reflect.get
                                ? Reflect.get
                                : function (t, e, r) {
                                      var n = qh(t, e);
                                      if (n) {
                                          var i = Object.getOwnPropertyDescriptor(n, e);
                                          return i.get ? i.get.call(arguments.length < 3 ? t : r) : i.value;
                                      }
                                  }),
                        Xh.apply(this, arguments)
                    );
                }
                function qh(t, e) {
                    for (; !Object.prototype.hasOwnProperty.call(t, e) && null !== (t = Hh(t)); );
                    return t;
                }
                function Vh(t, e) {
                    return (
                        (Vh =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        Vh(t, e)
                    );
                }
                function Gh(t) {
                    var e = (function () {
                        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ("function" == typeof Proxy) return !0;
                        try {
                            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
                        } catch (t) {
                            return !1;
                        }
                    })();
                    return function () {
                        var r,
                            n = Hh(t);
                        if (e) {
                            var i = Hh(this).constructor;
                            r = Reflect.construct(n, arguments, i);
                        } else r = n.apply(this, arguments);
                        return Wh(this, r);
                    };
                }
                function Wh(t, e) {
                    if (e && ("object" === Ih(e) || "function" == typeof e)) return e;
                    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                    return (function (t) {
                        if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        return t;
                    })(t);
                }
                function Hh(t) {
                    return (
                        (Hh = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        Hh(t)
                    );
                }
                ea.flags;
                var $h = (function (t) {
                    !(function (t, e) {
                        if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
                        (t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } })), e && Vh(t, e);
                    })(o, t);
                    var e,
                        r,
                        n,
                        i = Gh(o);
                    function o() {
                        return Uh(this, o), i.apply(this, arguments);
                    }
                    return (
                        (e = o),
                        (r = [
                            {
                                key: "setup",
                                value: function () {
                                    Xh(Hh(o.prototype), "setup", this).call(this);
                                },
                            },
                            {
                                key: "onEnter",
                                value: function () {
                                    Xh(Hh(o.prototype), "onEnter", this).call(this), this;
                                },
                            },
                            {
                                key: "onLeave",
                                value: function () {
                                    Xh(Hh(o.prototype), "onLeave", this).call(this);
                                },
                            },
                            {
                                key: "onEnterCompleted",
                                value: function () {
                                    Xh(Hh(o.prototype), "onEnterCompleted", this).call(this),
                                        (this.aboutLists = (function () {
                                            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : Bu(".js-about-list-trigger"),
                                                e = null;
                                            function r(t) {
                                                var r = t.currentTarget;
                                                (e = Ru(".js-about-list", r)) && (ei.set(e, { display: "flex" }), Gs.emit("resize", !0));
                                            }
                                            function n() {
                                                ei.set(e, { display: "none" }), Gs.emit("resize", !0);
                                            }
                                            function i() {
                                                Gs.on("mouseenter", t, r), Gs.on("mouseleave", t, n);
                                            }
                                            function o() {
                                                Gs.off("mouseenter", t, r), Gs.off("mouseleave", t, n);
                                            }
                                            return i(), { unmount: o };
                                        })());
                                },
                            },
                            {
                                key: "onLeaveCompleted",
                                value: function () {
                                    Xh(Hh(o.prototype), "onLeaveCompleted", this).call(this), this.aboutLists.unmount();
                                },
                            },
                            {
                                key: "onTransitionCompleted",
                                value: function () {
                                    Xh(Hh(o.prototype), "onTransitionCompleted", this).call(this);
                                },
                            },
                            {
                                key: "load",
                                value: function () {
                                    Xh(Hh(o.prototype), "load", this).call(this);
                                },
                            },
                        ]),
                        r && Yh(e.prototype, r),
                        n && Yh(e, n),
                        o
                    );
                })(ch);
                function Zh(t) {
                    return (
                        (Zh =
                            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                                  }),
                        Zh(t)
                    );
                }
                function Kh(t, e) {
                    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                }
                function Qh(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                function Jh() {
                    return (
                        (Jh =
                            "undefined" != typeof Reflect && Reflect.get
                                ? Reflect.get
                                : function (t, e, r) {
                                      var n = tc(t, e);
                                      if (n) {
                                          var i = Object.getOwnPropertyDescriptor(n, e);
                                          return i.get ? i.get.call(arguments.length < 3 ? t : r) : i.value;
                                      }
                                  }),
                        Jh.apply(this, arguments)
                    );
                }
                function tc(t, e) {
                    for (; !Object.prototype.hasOwnProperty.call(t, e) && null !== (t = ic(t)); );
                    return t;
                }
                function ec(t, e) {
                    return (
                        (ec =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        ec(t, e)
                    );
                }
                function rc(t) {
                    var e = (function () {
                        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ("function" == typeof Proxy) return !0;
                        try {
                            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
                        } catch (t) {
                            return !1;
                        }
                    })();
                    return function () {
                        var r,
                            n = ic(t);
                        if (e) {
                            var i = ic(this).constructor;
                            r = Reflect.construct(n, arguments, i);
                        } else r = n.apply(this, arguments);
                        return nc(this, r);
                    };
                }
                function nc(t, e) {
                    if (e && ("object" === Zh(e) || "function" == typeof e)) return e;
                    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                    return (function (t) {
                        if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        return t;
                    })(t);
                }
                function ic(t) {
                    return (
                        (ic = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        ic(t)
                    );
                }
                var oc = (function (t) {
                    !(function (t, e) {
                        if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
                        (t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } })), e && ec(t, e);
                    })(o, t);
                    var e,
                        r,
                        n,
                        i = rc(o);
                    function o() {
                        return Kh(this, o), i.apply(this, arguments);
                    }
                    return (
                        (e = o),
                        (r = [
                            {
                                key: "onEnter",
                                value: function () {
                                    Jh(ic(o.prototype), "onEnter", this).call(this);
                                },
                            },
                            {
                                key: "onLeave",
                                value: function () {
                                    Jh(ic(o.prototype), "onLeave", this).call(this);
                                },
                            },
                            {
                                key: "onEnterCompleted",
                                value: function () {
                                    Jh(ic(o.prototype), "onEnterCompleted", this).call(this), Gs.emit("grid-mount");
                                },
                            },
                            {
                                key: "onLeaveCompleted",
                                value: function () {
                                    Jh(ic(o.prototype), "onLeaveCompleted", this).call(this), Gs.emit("grid-unmount");
                                },
                            },
                            {
                                key: "load",
                                value: function () {
                                    Jh(ic(o.prototype), "load", this).call(this);
                                },
                            },
                        ]) && Qh(e.prototype, r),
                        n && Qh(e, n),
                        o
                    );
                })(ch);
                function sc(t) {
                    return (
                        (sc =
                            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                                  }),
                        sc(t)
                    );
                }
                function ac(t, e) {
                    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                }
                function uc(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                function lc() {
                    return (
                        (lc =
                            "undefined" != typeof Reflect && Reflect.get
                                ? Reflect.get
                                : function (t, e, r) {
                                      var n = hc(t, e);
                                      if (n) {
                                          var i = Object.getOwnPropertyDescriptor(n, e);
                                          return i.get ? i.get.call(arguments.length < 3 ? t : r) : i.value;
                                      }
                                  }),
                        lc.apply(this, arguments)
                    );
                }
                function hc(t, e) {
                    for (; !Object.prototype.hasOwnProperty.call(t, e) && null !== (t = dc(t)); );
                    return t;
                }
                function cc(t, e) {
                    return (
                        (cc =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        cc(t, e)
                    );
                }
                function fc(t) {
                    var e = (function () {
                        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ("function" == typeof Proxy) return !0;
                        try {
                            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
                        } catch (t) {
                            return !1;
                        }
                    })();
                    return function () {
                        var r,
                            n = dc(t);
                        if (e) {
                            var i = dc(this).constructor;
                            r = Reflect.construct(n, arguments, i);
                        } else r = n.apply(this, arguments);
                        return pc(this, r);
                    };
                }
                function pc(t, e) {
                    if (e && ("object" === sc(e) || "function" == typeof e)) return e;
                    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                    return (function (t) {
                        if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        return t;
                    })(t);
                }
                function dc(t) {
                    return (
                        (dc = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        dc(t)
                    );
                }
                var gc = $s,
                    mc = (function (t) {
                        !(function (t, e) {
                            if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
                            (t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } })), e && cc(t, e);
                        })(o, t);
                        var e,
                            r,
                            n,
                            i = fc(o);
                        function o() {
                            return ac(this, o), i.apply(this, arguments);
                        }
                        return (
                            (e = o),
                            (r = [
                                {
                                    key: "onEnter",
                                    value: function () {
                                        var t = this;
                                        lc(dc(o.prototype), "onEnter", this).call(this);
                                        var e = gc("form");
                                        e.onsubmit = function (r) {
                                            r.preventDefault(),
                                                "Aotearoa2022" !== gc("#access-code").value
                                                    ? e.classList.add("is-error")
                                                    : (t.setCookie("protected", "protected", 30),
                                                      ei.to(t.el, {
                                                          alpha: 0,
                                                          duration: 0.5,
                                                          ease: "power1",
                                                          onComplete: function () {
                                                              return location.reload();
                                                          },
                                                      }));
                                        };
                                    },
                                },
                                {
                                    key: "setCookie",
                                    value: function (t, e, r) {
                                        var n = "";
                                        if (r) {
                                            var i = new Date();
                                            i.setTime(i.getTime() + 24 * r * 60 * 60 * 1e3), (n = "; expires=" + i.toUTCString());
                                        }
                                        document.cookie = t + "=" + (e || "") + n + "; path=/";
                                    },
                                },
                            ]),
                            r && uc(e.prototype, r),
                            n && uc(e, n),
                            o
                        );
                    })(ch);
                function yc(t) {
                    return (
                        (yc =
                            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                                  }),
                        yc(t)
                    );
                }
                function vc(t, e) {
                    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                }
                function Dc(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                function _c(t, e) {
                    return (
                        (_c =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        _c(t, e)
                    );
                }
                function bc(t) {
                    var e = (function () {
                        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ("function" == typeof Proxy) return !0;
                        try {
                            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
                        } catch (t) {
                            return !1;
                        }
                    })();
                    return function () {
                        var r,
                            n = wc(t);
                        if (e) {
                            var i = wc(this).constructor;
                            r = Reflect.construct(n, arguments, i);
                        } else r = n.apply(this, arguments);
                        return xc(this, r);
                    };
                }
                function xc(t, e) {
                    if (e && ("object" === yc(e) || "function" == typeof e)) return e;
                    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                    return (function (t) {
                        if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        return t;
                    })(t);
                }
                function wc(t) {
                    return (
                        (wc = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        wc(t)
                    );
                }
                var Ec = $s,
                    Cc = Zs,
                    Fc = ea.dom,
                    Tc = ea.fromPage,
                    Ac = ea.device,
                    Mc = ei.timeline({ paused: !0, defaults: { force3D: !0 } }),
                    Oc = ei.timeline({ paused: !0, defaults: { force3D: !0 } }),
                    Sc = null,
                    Pc = null,
                    kc = null,
                    Rc = 0,
                    Bc = 0,
                    Lc = (function (t) {
                        !(function (t, e) {
                            if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
                            (t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } })), e && _c(t, e);
                        })(o, t);
                        var e,
                            r,
                            n,
                            i = bc(o);
                        function o() {
                            return vc(this, o), i.apply(this, arguments);
                        }
                        return (
                            (e = o),
                            (r = [
                                {
                                    key: "in",
                                    value: function (t) {
                                        var e = t.to,
                                            r = t.done;
                                        Gs.emit("scroll:on-reset"), r(), (kc = Ec(".js-t-mask", e));
                                        var n = Cc(".js-t-item", e),
                                            i = Cc(".js-t-l", e),
                                            o = Ec(".js-t-intro", e),
                                            s = Ac.isSmall ? Cc(".js-t-about-mob", e) : Cc(".js-t-about-desk", e),
                                            a = Rc;
                                        (Rc = new Date()),
                                            (Bc = ei.utils.clamp(0, 400, 400 - Math.abs(Rc.getMilliseconds() - a.getMilliseconds())) / 1e3),
                                            Oc.clear()
                                                .set(e, { zIndex: 10 })
                                                .fromTo(kc, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: "power4" }, Bc)
                                                .add(function () {
                                                    Tc.routes[0].remove(), Mc.clear(), Gs.emit("resize:scroll"), Gs.emit("transition:end");
                                                })
                                                .set(Fc.body, { clearProps: "pointerEvents" }, "+=0.1"),
                                            i.length && Oc.from(i, { alpha: 0, yPercent: -10, rotationX: -15, duration: 1, stagger: 0.035, ease: "expo" }, 0.5 + Bc),
                                            o && Oc.from(new (wu())(o, { types: "lines" }).lines, { alpha: 0, duration: 1, stagger: 0.05, ease: "power1" }, 0.75 + Bc),
                                            n.length && Oc.fromTo(n, { y: "4.5rem", alpha: 0 }, { y: 0, alpha: 1, duration: 0.75, stagger: 0.075, ease: "expo" }, 0.4 + Bc),
                                            s.length && Oc.fromTo(s, { y: "4.5rem", alpha: 0 }, { y: 0, alpha: 1, duration: 0.75, stagger: 0.075, ease: "expo" }, 0.4 + Bc),
                                            Oc.restart();
                                    },
                                },
                                {
                                    key: "out",
                                    value: function (t) {
                                        (Tc.routes = Cc("[data-router-view]")), (Tc.total = Tc.routes.length);
                                        var e = 2 === Tc.total,
                                            r = e ? Tc.routes[1] : t.from;
                                        (Sc = Ec(".js-t-fade", r)),
                                            (Pc = Ec(".js-t-mask", r)),
                                            (Rc = new Date()),
                                            Mc.clear().set(Fc.body, { pointerEvents: "none" }).fromTo(Sc, { alpha: 0 }, { alpha: 1, duration: 0.25, ease: "power1" }, 0),
                                            !Pc.closest("#case") && Mc.set(Pc, { transformOrigin: "bottom" }, 0).fromTo(Pc, { scale: 1 }, { scale: 0.965, duration: 0.75, ease: "power3" }, 0),
                                            Mc.add(function () {
                                                return e && (Tc.routes[0].remove(), Tc.routes.shift());
                                            }).add(function () {
                                                return t.done();
                                            }, 0),
                                            Mc.restart();
                                    },
                                },
                            ]),
                            r && Dc(e.prototype, r),
                            n && Dc(e, n),
                            o
                        );
                    })(h.Transition);
                function jc(t) {
                    return (
                        (jc =
                            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                                  }),
                        jc(t)
                    );
                }
                function Nc(t) {
                    return (
                        (function (t) {
                            if (Array.isArray(t)) return zc(t);
                        })(t) ||
                        (function (t) {
                            if (("undefined" != typeof Symbol && null != t[Symbol.iterator]) || null != t["@@iterator"]) return Array.from(t);
                        })(t) ||
                        (function (t, e) {
                            if (!t) return;
                            if ("string" == typeof t) return zc(t, e);
                            var r = Object.prototype.toString.call(t).slice(8, -1);
                            "Object" === r && t.constructor && (r = t.constructor.name);
                            if ("Map" === r || "Set" === r) return Array.from(t);
                            if ("Arguments" === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return zc(t, e);
                        })(t) ||
                        (function () {
                            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                        })()
                    );
                }
                function zc(t, e) {
                    (null == e || e > t.length) && (e = t.length);
                    for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
                    return n;
                }
                function Ic(t, e) {
                    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                }
                function Uc(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                function Yc(t, e) {
                    return (
                        (Yc =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        Yc(t, e)
                    );
                }
                function Xc(t) {
                    var e = (function () {
                        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ("function" == typeof Proxy) return !0;
                        try {
                            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
                        } catch (t) {
                            return !1;
                        }
                    })();
                    return function () {
                        var r,
                            n = Vc(t);
                        if (e) {
                            var i = Vc(this).constructor;
                            r = Reflect.construct(n, arguments, i);
                        } else r = n.apply(this, arguments);
                        return qc(this, r);
                    };
                }
                function qc(t, e) {
                    if (e && ("object" === jc(e) || "function" == typeof e)) return e;
                    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                    return (function (t) {
                        if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        return t;
                    })(t);
                }
                function Vc(t) {
                    return (
                        (Vc = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        Vc(t)
                    );
                }
                var Gc = $s,
                    Wc = ea.dom,
                    Hc = (ea.flags, ei.timeline({ paused: !0, defaults: { force3D: !0 } })),
                    $c = ei.timeline({ paused: !0, defaults: { force3D: !0 } }),
                    Zc = null,
                    Kc = null,
                    Qc = (function (t) {
                        !(function (t, e) {
                            if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
                            (t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } })), e && Yc(t, e);
                        })(o, t);
                        var e,
                            r,
                            n,
                            i = Xc(o);
                        function o() {
                            return Ic(this, o), i.apply(this, arguments);
                        }
                        return (
                            (e = o),
                            (r = [
                                {
                                    key: "in",
                                    value: function (t) {
                                        var e = t.to,
                                            r = t.done;
                                        Gs.emit("scroll:on-reset"), r(), (Kc = Gc(".js-t-mask", e));
                                        var n = Gc(".js-t-title", e);
                                        n && (n = new (wu())(n, { type: "words" }).words);
                                        var i = Gc(".js-t-small", e),
                                            o = i && n ? [i].concat(Nc(n)) : null;
                                        $c
                                            .clear()
                                            .set(e, { zIndex: 10 })
                                            .fromTo(Kc, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: "power4" }, 0)
                                            .add(function () {
                                                Hc.clear(), Gs.emit("resize:scroll"), Gs.emit("transition:end");
                                            })
                                            .set(Wc.body, { clearProps: "pointerEvents" }, "+=0.1"),
                                            o && $c.fromTo(o, { y: "4.5rem", alpha: 0 }, { y: 0, alpha: 1, duration: 0.75, stagger: 0.075, ease: "expo" }, 0.25),
                                            $c.restart();
                                    },
                                },
                                {
                                    key: "out",
                                    value: function (t) {
                                        var e = t.from,
                                            r = t.done;
                                        (Zc = Gc(".js-t-fade", e)),
                                            Hc.clear()
                                                .set(Wc.body, { pointerEvents: "none" })
                                                .fromTo(Zc, { alpha: 0 }, { alpha: 1, duration: 0.25, ease: "power1" }, 0)
                                                .add(function () {
                                                    return r();
                                                })
                                                .restart();
                                    },
                                },
                            ]) && Uc(e.prototype, r),
                            n && Uc(e, n),
                            o
                        );
                    })(h.Transition);
                function Jc(t) {
                    return (
                        (Jc =
                            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                                  }),
                        Jc(t)
                    );
                }
                function tf(t) {
                    return (
                        (function (t) {
                            if (Array.isArray(t)) return ef(t);
                        })(t) ||
                        (function (t) {
                            if (("undefined" != typeof Symbol && null != t[Symbol.iterator]) || null != t["@@iterator"]) return Array.from(t);
                        })(t) ||
                        (function (t, e) {
                            if (!t) return;
                            if ("string" == typeof t) return ef(t, e);
                            var r = Object.prototype.toString.call(t).slice(8, -1);
                            "Object" === r && t.constructor && (r = t.constructor.name);
                            if ("Map" === r || "Set" === r) return Array.from(t);
                            if ("Arguments" === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return ef(t, e);
                        })(t) ||
                        (function () {
                            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                        })()
                    );
                }
                function ef(t, e) {
                    (null == e || e > t.length) && (e = t.length);
                    for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
                    return n;
                }
                function rf(t, e) {
                    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                }
                function nf(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                function of(t, e) {
                    return (
                        (of =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        of(t, e)
                    );
                }
                function sf(t) {
                    var e = (function () {
                        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ("function" == typeof Proxy) return !0;
                        try {
                            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
                        } catch (t) {
                            return !1;
                        }
                    })();
                    return function () {
                        var r,
                            n = uf(t);
                        if (e) {
                            var i = uf(this).constructor;
                            r = Reflect.construct(n, arguments, i);
                        } else r = n.apply(this, arguments);
                        return af(this, r);
                    };
                }
                function af(t, e) {
                    if (e && ("object" === Jc(e) || "function" == typeof e)) return e;
                    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                    return (function (t) {
                        if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        return t;
                    })(t);
                }
                function uf(t) {
                    return (
                        (uf = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        uf(t)
                    );
                }
                var lf = $s,
                    hf = Zs,
                    cf = Ks,
                    ff = ea.dom,
                    pf = ea.fromPage,
                    df = ei.timeline({ paused: !0, delay: 0.1, defaults: { duration: 0.4, ease: "power3" } }),
                    gf = ei.timeline({ paused: !0, defaults: { force3D: !0 } }),
                    mf = null,
                    yf = null,
                    vf = (function (t) {
                        !(function (t, e) {
                            if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
                            (t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } })), e && of(t, e);
                        })(o, t);
                        var e,
                            r,
                            n,
                            i = sf(o);
                        function o() {
                            return rf(this, o), i.apply(this, arguments);
                        }
                        return (
                            (e = o),
                            (r = [
                                {
                                    key: "in",
                                    value: function (t) {
                                        var e = t.to,
                                            r = t.done;
                                        Gs.emit("scroll:on-reset"),
                                            r(),
                                            (yf = lf(".js-t-mask", e)),
                                            gf
                                                .clear()
                                                .set(e, { zIndex: 10 })
                                                .fromTo(yf, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: "power3" }, 0)
                                                .add(function () {
                                                    mf && e.prepend(mf.cloneNode(!0)), pf.routes[0].remove(), df.clear(), Gs.emit("resize:scroll"), Gs.emit("transition:end");
                                                })
                                                .set(ff.body, { clearProps: "pointerEvents" }, "+=0.1")
                                                .fromTo(
                                                    [lf(".js-t-small", e)].concat(tf(new (wu())(lf(".js-t-title", e), { type: "words" }).words)),
                                                    { y: "4.5rem", alpha: 0 },
                                                    { y: 0, alpha: 1, duration: 1, stagger: 0.1, ease: "expo" },
                                                    0.25
                                                ),
                                            gf.restart(),
                                            ff.body.classList.remove("is-loading");
                                    },
                                },
                                {
                                    key: "out",
                                    value: function (t) {
                                        ff.body.classList.add("is-loading"), (pf.routes = hf("[data-router-view]")), (pf.total = pf.routes.length);
                                        var e = 2 === pf.total,
                                            r = e ? pf.routes[1] : t.from;
                                        (mf = lf(".js-t-hero", r)) && mf.classList.remove("js-t-hero"), mf.parentNode.classList.add("is-active");
                                        var n = lf(".js-t-bottom", r);
                                        n.classList.add("is-out"),
                                            df
                                                .clear()
                                                .set(ff.body, { pointerEvents: "none" })
                                                .to(n, { y: -cf(n).bottom }, 0)
                                                .add(function () {
                                                    return e && (pf.routes[0].remove(), pf.routes.shift());
                                                }, 0.4)
                                                .add(function () {
                                                    return t.done();
                                                }, 0.4)
                                                .restart();
                                    },
                                },
                            ]),
                            r && nf(e.prototype, r),
                            n && nf(e, n),
                            o
                        );
                    })(h.Transition);
                function Df(t) {
                    return (
                        (Df =
                            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                                  }),
                        Df(t)
                    );
                }
                function _f(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                function bf() {
                    return (
                        (bf =
                            "undefined" != typeof Reflect && Reflect.get
                                ? Reflect.get
                                : function (t, e, r) {
                                      var n = xf(t, e);
                                      if (n) {
                                          var i = Object.getOwnPropertyDescriptor(n, e);
                                          return i.get ? i.get.call(arguments.length < 3 ? t : r) : i.value;
                                      }
                                  }),
                        bf.apply(this, arguments)
                    );
                }
                function xf(t, e) {
                    for (; !Object.prototype.hasOwnProperty.call(t, e) && null !== (t = Ff(t)); );
                    return t;
                }
                function wf(t, e) {
                    return (
                        (wf =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        wf(t, e)
                    );
                }
                function Ef(t) {
                    var e = (function () {
                        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ("function" == typeof Proxy) return !0;
                        try {
                            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
                        } catch (t) {
                            return !1;
                        }
                    })();
                    return function () {
                        var r,
                            n = Ff(t);
                        if (e) {
                            var i = Ff(this).constructor;
                            r = Reflect.construct(n, arguments, i);
                        } else r = n.apply(this, arguments);
                        return Cf(this, r);
                    };
                }
                function Cf(t, e) {
                    if (e && ("object" === Df(e) || "function" == typeof e)) return e;
                    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                    return (function (t) {
                        if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        return t;
                    })(t);
                }
                function Ff(t) {
                    return (
                        (Ff = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        Ff(t)
                    );
                }
                    Gs.on("vs", function (t) {
                        var e = t.dY,
                            r = t.dX;
                        sa.locked || Gs.emit("scroll", { y: -1 * e, x: r });
                    }),
                    (function () {
                        var t,
                            e,
                            r,
                            n = 0,
                            i = 0,
                            o = 0,
                            s = null,
                            a = { move: aa ? "touchmove" : "mousemove", down: aa ? "touchstart" : "mousedown", up: aa ? "touchend" : "mouseup" };
                        function u(t) {
                            (n = t.changedTouches ? t.changedTouches[0].clientX : t.clientX), (i = t.changedTouches ? t.changedTouches[0].clientY : t.clientY), (s = t.target);
                        }
                        function l(t) {
                            u(t), Gs.emit("mousemove", { x: n, y: i, target: s, e: t });
                        }
                        function h(t) {
                            u(t), (o = n), Gs.emit("mousedown", { x: n, y: i, target: s });
                        }
                        function c(t) {
                            u(t), Gs.emit("mouseup", { x: n, y: i, target: s, click: Math.abs(n - o) < 10 });
                        }
                        (t = a.move), (e = a.down), (r = a.up), Gs.on(t, window, l), Gs.on(e, window, h), Gs.on(r, window, c);
                    })(),
                    (function () {
                        function t() {
                            var t = window.innerWidth;
                            (fa && t === ha.ww) ||
                                ((ha.ww = t), (ha.wh = window.innerHeight), (ca.isSmall = window.matchMedia("(max-width: 649px)").matches), (ca.isPortrait = window.matchMedia("(orientation: portrait)").matches), e(), Gs.emit("resize"));
                        }
                        function e() {
                            document.documentElement.style.setProperty("--vh", "".concat(ha.wh / 100, "px"));
                        }
                        e(), Gs.on("resize", window, la()(t, 200)), Gs.on("orientationchange", window, t);
                    })(),
                    (function () {
                        var t = { tY: 0, cY: 0, ease: 0.2 };
                        function e(e) {
                            (t.cY += (t.tY - t.cY) * t.ease), (t.cY = Math.round(100 * t.cY) / 100), Io.update(), Gs.emit("tick", { cY: t.cY, time: e });
                        }
                        function r(e) {
                            var r = e.y;
                            ga.locked || ((t.tY += r), !ga.infiniteScroll && i());
                        }
                        function n(e) {
                            var r = e.currentTarget;
                            if (r) {
                                var n = qs(r.dataset.to);
                                if (n) {
                                    var i = n.offsetTop;
                                    ei.to(t, { tY: i > 0 ? i : n.parentNode.offsetTop, ease: "power1.in", duration: 0.5 });
                                }
                            }
                        }
                        function i() {
                            t.tY = ei.utils.clamp(0, da.maxScroll, t.tY);
                        }
                        function o() {
                            (t.cY = t.tY = 0), Io.refresh();
                        }
                        function s() {
                            var e = t.tY;
                            o(), i(), (t.cY = t.tY = e);
                        }
                        Io.defaults({ scroller: pa.body }),
                            Io.scrollerProxy(pa.body, {
                                scrollTop: function () {
                                    return t.cY;
                                },
                                scrollLeft: function () {
                                    return t.cY;
                                },
                                getBoundingClientRect: function () {
                                    return { top: 0, left: 0, width: da.ww, height: da.wh };
                                },
                            }),
                            ei.ticker.fps(-1),
                            ei.ticker.add(e),
                            Gs.on("resize:on-reset", s),
                            Gs.on("scroll", r),
                            Gs.on("scroll:to", n),
                            Gs.on("scroll:on-reset", o);
                    })();
                var Tf = function () {
                        var t = ei.parseEase(),
                            e = function (t) {
                                return function (e) {
                                    var r = 0.5 + e / 2;
                                    return function (e) {
                                        return t(2 * (1 - e) * e * r + e * e);
                                    };
                                };
                            };
                        for (var r in t) t[r].config || (t[r].config = e(t[r]));
                    },
                    Af = ea.features,
                    Mf = ea.dom;
                "scrollRestoration" in history && (history.scrollRestoration = "manual"), Af.hasSmoothScroll && Mf.body.classList.add("is-smooth");
                var Of = new ((function (t) {
                    !(function (t, e) {
                        if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
                        (t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } })), e && wf(t, e);
                    })(o, t);
                    var e,
                        r,
                        n,
                        i = Ef(o);
                    function o() {
                        var t;
                        return (
                            (function (t, e) {
                                if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                            })(this, o),
                            (t = i.call(this, { renderers: { home: Eh, case: zh, about: $h, archive: oc, protected: mc, default: ch }, transitions: { default: Lc, contextual: { case: Qc, nextCase: vf } } })),
                            Tf(),
                            t
                        );
                    }
                    return (
                        (e = o),
                        (r = [
                            {
                                key: "navigate",
                                value: function (t) {
                                    (ea.dom.lastClicked = t.currentTarget), bf(Ff(o.prototype), "navigate", this).call(this, t);
                                },
                            },
                        ]),
                        r && _f(e.prototype, r),
                        n && _f(e, n),
                        o
                    );
                })(h.Core))();
            },
            862: function (t, e) {
                var r, n, i, o;
                function s(t) {
                    return (
                        (s =
                            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                                  }),
                        s(t)
                    );
                }
                (o = function (t) {
                    "use strict";
                    var e = /([\uD800-\uDBFF][\uDC00-\uDFFF](?:[\u200D\uFE0F][\uD800-\uDBFF][\uDC00-\uDFFF]){2,}|\uD83D\uDC69(?:\u200D(?:(?:\uD83D\uDC69\u200D)?\uD83D\uDC67|(?:\uD83D\uDC69\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]\uFE0F|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC6F\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3C-\uDD3E\uDDD6-\uDDDF])\u200D[\u2640\u2642]\uFE0F|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F\u200D[\u2640\u2642]|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642])\uFE0F|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC69\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708]))\uFE0F|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83D\uDC69\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]))|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\u200D(?:(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F)/;
                    function r(t) {
                        var e = t.nodeType,
                            n = "";
                        if (1 === e || 9 === e || 11 === e) {
                            if ("string" == typeof t.textContent) return t.textContent;
                            for (t = t.firstChild; t; t = t.nextSibling) n += r(t);
                        } else if (3 === e || 4 === e) return t.nodeValue;
                        return n;
                    }
                    var n,
                        i,
                        o,
                        a = /(?:\r|\n|\t\t)/g,
                        u = /(?:\s\s+)/g,
                        l = function (t) {
                            return i.getComputedStyle(t);
                        },
                        h = Array.isArray,
                        c = [].slice,
                        f = function (t, e) {
                            var r;
                            return h(t) ? t : "string" === (r = s(t)) && !e && t ? c.call(n.querySelectorAll(t), 0) : t && "object" === r && "length" in t ? c.call(t, 0) : t ? [t] : [];
                        },
                        p = function (t) {
                            return "absolute" === t.position || !0 === t.absolute;
                        },
                        d = function (t, e) {
                            for (var r, n = e.length; --n > -1; ) if (((r = e[n]), t.substr(0, r.length) === r)) return r.length;
                        },
                        g = function (t, e) {
                            void 0 === t && (t = "");
                            var r = ~t.indexOf("++"),
                                n = 1;
                            return (
                                r && (t = t.split("++").join("")),
                                function () {
                                    return "<" + e + " style='position:relative;display:inline-block;'" + (t ? " class='" + t + (r ? n++ : "") + "'>" : ">");
                                }
                            );
                        },
                        m = function t(e, r, n) {
                            var i = e.nodeType;
                            if (1 === i || 9 === i || 11 === i) for (e = e.firstChild; e; e = e.nextSibling) t(e, r, n);
                            else (3 !== i && 4 !== i) || (e.nodeValue = e.nodeValue.split(r).join(n));
                        },
                        y = function (t, e) {
                            for (var r = e.length; --r > -1; ) t.push(e[r]);
                        },
                        v = function (t, e, r) {
                            for (var n; t && t !== e; ) {
                                if ((n = t._next || t.nextSibling)) return n.textContent.charAt(0) === r;
                                t = t.parentNode || t._parent;
                            }
                        },
                        D = function t(e) {
                            var r,
                                n,
                                i = f(e.childNodes),
                                o = i.length;
                            for (r = 0; r < o; r++)
                                (n = i[r])._isSplit
                                    ? t(n)
                                    : (r && 3 === n.previousSibling.nodeType ? (n.previousSibling.nodeValue += 3 === n.nodeType ? n.nodeValue : n.firstChild.nodeValue) : 3 !== n.nodeType && e.insertBefore(n.firstChild, n),
                                      e.removeChild(n));
                        },
                        _ = function (t, e) {
                            return parseFloat(e[t]) || 0;
                        },
                        b = function (t, e, r, i, o, s, a) {
                            var u,
                                h,
                                c,
                                f,
                                d,
                                g,
                                b,
                                x,
                                w,
                                E,
                                C,
                                F,
                                T = l(t),
                                A = _("paddingLeft", T),
                                M = -999,
                                O = _("borderBottomWidth", T) + _("borderTopWidth", T),
                                S = _("borderLeftWidth", T) + _("borderRightWidth", T),
                                P = _("paddingTop", T) + _("paddingBottom", T),
                                k = _("paddingLeft", T) + _("paddingRight", T),
                                R = 0.2 * _("fontSize", T),
                                B = T.textAlign,
                                L = [],
                                j = [],
                                N = [],
                                z = e.wordDelimiter || " ",
                                I = e.tag ? e.tag : e.span ? "span" : "div",
                                U = e.type || e.split || "chars,words,lines",
                                Y = o && ~U.indexOf("lines") ? [] : null,
                                X = ~U.indexOf("words"),
                                q = ~U.indexOf("chars"),
                                V = p(e),
                                G = e.linesClass,
                                W = ~(G || "").indexOf("++"),
                                H = [];
                            for (W && (G = G.split("++").join("")), c = (h = t.getElementsByTagName("*")).length, d = [], u = 0; u < c; u++) d[u] = h[u];
                            if (Y || V)
                                for (u = 0; u < c; u++)
                                    ((g = (f = d[u]).parentNode === t) || V || (q && !X)) &&
                                        ((F = f.offsetTop),
                                        Y && g && Math.abs(F - M) > R && ("BR" !== f.nodeName || 0 === u) && ((b = []), Y.push(b), (M = F)),
                                        V && ((f._x = f.offsetLeft), (f._y = F), (f._w = f.offsetWidth), (f._h = f.offsetHeight)),
                                        Y &&
                                            (((f._isSplit && g) || (!q && g) || (X && g) || (!X && f.parentNode.parentNode === t && !f.parentNode._isSplit)) && (b.push(f), (f._x -= A), v(f, t, z) && (f._wordEnd = !0)),
                                            "BR" === f.nodeName && ((f.nextSibling && "BR" === f.nextSibling.nodeName) || 0 === u) && Y.push([])));
                            for (u = 0; u < c; u++)
                                (g = (f = d[u]).parentNode === t),
                                    "BR" !== f.nodeName
                                        ? (V &&
                                              ((w = f.style),
                                              X || g || ((f._x += f.parentNode._x), (f._y += f.parentNode._y)),
                                              (w.left = f._x + "px"),
                                              (w.top = f._y + "px"),
                                              (w.position = "absolute"),
                                              (w.display = "block"),
                                              (w.width = f._w + 1 + "px"),
                                              (w.height = f._h + "px")),
                                          !X && q
                                              ? f._isSplit
                                                  ? ((f._next = f.nextSibling), f.parentNode.appendChild(f))
                                                  : f.parentNode._isSplit
                                                  ? ((f._parent = f.parentNode),
                                                    !f.previousSibling && f.firstChild && (f.firstChild._isFirst = !0),
                                                    f.nextSibling && " " === f.nextSibling.textContent && !f.nextSibling.nextSibling && H.push(f.nextSibling),
                                                    (f._next = f.nextSibling && f.nextSibling._isFirst ? null : f.nextSibling),
                                                    f.parentNode.removeChild(f),
                                                    d.splice(u--, 1),
                                                    c--)
                                                  : g ||
                                                    ((F = !f.nextSibling && v(f.parentNode, t, z)),
                                                    f.parentNode._parent && f.parentNode._parent.appendChild(f),
                                                    F && f.parentNode.appendChild(n.createTextNode(" ")),
                                                    "span" === I && (f.style.display = "inline"),
                                                    L.push(f))
                                              : f.parentNode._isSplit && !f._isSplit && "" !== f.innerHTML
                                              ? j.push(f)
                                              : q && !f._isSplit && ("span" === I && (f.style.display = "inline"), L.push(f)))
                                        : Y || V
                                        ? (f.parentNode && f.parentNode.removeChild(f), d.splice(u--, 1), c--)
                                        : X || t.appendChild(f);
                            for (u = H.length; --u > -1; ) H[u].parentNode.removeChild(H[u]);
                            if (Y) {
                                for (
                                    V && ((E = n.createElement(I)), t.appendChild(E), (C = E.offsetWidth + "px"), (F = E.offsetParent === t ? 0 : t.offsetLeft), t.removeChild(E)), w = t.style.cssText, t.style.cssText = "display:none;";
                                    t.firstChild;

                                )
                                    t.removeChild(t.firstChild);
                                for (x = " " === z && (!V || (!X && !q)), u = 0; u < Y.length; u++) {
                                    for (
                                        b = Y[u],
                                            (E = n.createElement(I)).style.cssText = "display:block;text-align:" + B + ";position:" + (V ? "absolute;" : "relative;"),
                                            G && (E.className = G + (W ? u + 1 : "")),
                                            N.push(E),
                                            c = b.length,
                                            h = 0;
                                        h < c;
                                        h++
                                    )
                                        "BR" !== b[h].nodeName &&
                                            ((f = b[h]),
                                            E.appendChild(f),
                                            x && f._wordEnd && E.appendChild(n.createTextNode(" ")),
                                            V && (0 === h && ((E.style.top = f._y + "px"), (E.style.left = A + F + "px")), (f.style.top = "0px"), F && (f.style.left = f._x - F + "px")));
                                    0 === c ? (E.innerHTML = "&nbsp;") : X || q || (D(E), m(E, String.fromCharCode(160), " ")), V && ((E.style.width = C), (E.style.height = f._h + "px")), t.appendChild(E);
                                }
                                t.style.cssText = w;
                            }
                            V &&
                                (a > t.clientHeight && ((t.style.height = a - P + "px"), t.clientHeight < a && (t.style.height = a + O + "px")),
                                s > t.clientWidth && ((t.style.width = s - k + "px"), t.clientWidth < s && (t.style.width = s + S + "px"))),
                                y(r, L),
                                X && y(i, j),
                                y(o, N);
                        },
                        x = function (t, i, o, s) {
                            var l,
                                h,
                                c,
                                f,
                                g,
                                y,
                                v,
                                D,
                                _ = i.tag ? i.tag : i.span ? "span" : "div",
                                b = ~(i.type || i.split || "chars,words,lines").indexOf("chars"),
                                x = p(i),
                                w = i.wordDelimiter || " ",
                                E = " " !== w ? "" : x ? "&#173; " : " ",
                                C = "</" + _ + ">",
                                F = 1,
                                T = i.specialChars ? ("function" == typeof i.specialChars ? i.specialChars : d) : null,
                                A = n.createElement("div"),
                                M = t.parentNode;
                            for (
                                M.insertBefore(A, t),
                                    A.textContent = t.nodeValue,
                                    M.removeChild(t),
                                    v = -1 !== (l = r((t = A))).indexOf("<"),
                                    !1 !== i.reduceWhiteSpace && (l = l.replace(u, " ").replace(a, "")),
                                    v && (l = l.split("<").join("{{LT}}")),
                                    g = l.length,
                                    h = (" " === l.charAt(0) ? E : "") + o(),
                                    c = 0;
                                c < g;
                                c++
                            )
                                if (((y = l.charAt(c)), T && (D = T(l.substr(c), i.specialChars)))) (y = l.substr(c, D || 1)), (h += b && " " !== y ? s() + y + "</" + _ + ">" : y), (c += D - 1);
                                else if (y === w && l.charAt(c - 1) !== w && c) {
                                    for (h += F ? C : "", F = 0; l.charAt(c + 1) === w; ) (h += E), c++;
                                    c === g - 1 ? (h += E) : ")" !== l.charAt(c + 1) && ((h += E + o()), (F = 1));
                                } else
                                    "{" === y && "{{LT}}" === l.substr(c, 6)
                                        ? ((h += b ? s() + "{{LT}}</" + _ + ">" : "{{LT}}"), (c += 5))
                                        : (y.charCodeAt(0) >= 55296 && y.charCodeAt(0) <= 56319) || (l.charCodeAt(c + 1) >= 65024 && l.charCodeAt(c + 1) <= 65039)
                                        ? ((f = ((l.substr(c, 12).split(e) || [])[1] || "").length || 2), (h += b && " " !== y ? s() + l.substr(c, f) + "</" + _ + ">" : l.substr(c, f)), (c += f - 1))
                                        : (h += b && " " !== y ? s() + y + "</" + _ + ">" : y);
                            (t.outerHTML = h + (F ? C : "")), v && m(M, "{{LT}}", "<");
                        },
                        w = function t(e, r, n, i) {
                            var o,
                                s,
                                a = f(e.childNodes),
                                u = a.length,
                                h = p(r);
                            if (3 !== e.nodeType || u > 1) {
                                for (r.absolute = !1, o = 0; o < u; o++)
                                    (3 !== (s = a[o]).nodeType || /\S+/.test(s.nodeValue)) &&
                                        (h && 3 !== s.nodeType && "inline" === l(s).display && ((s.style.display = "inline-block"), (s.style.position = "relative")), (s._isSplit = !0), t(s, r, n, i));
                                return (r.absolute = h), void (e._isSplit = !0);
                            }
                            x(e, r, n, i);
                        },
                        E = (function () {
                            function t(t, e) {
                                o || ((n = document), (i = window), (o = 1)), (this.elements = f(t)), (this.chars = []), (this.words = []), (this.lines = []), (this._originals = []), (this.vars = e || {}), this.split(e);
                            }
                            var e = t.prototype;
                            return (
                                (e.split = function (t) {
                                    this.isSplit && this.revert(), (this.vars = t = t || this.vars), (this._originals.length = this.chars.length = this.words.length = this.lines.length = 0);
                                    for (var e, r, n, i = this.elements.length, o = t.tag ? t.tag : t.span ? "span" : "div", s = g(t.wordsClass, o), a = g(t.charsClass, o); --i > -1; )
                                        (n = this.elements[i]), (this._originals[i] = n.innerHTML), (e = n.clientHeight), (r = n.clientWidth), w(n, t, s, a), b(n, t, this.chars, this.words, this.lines, r, e);
                                    return this.chars.reverse(), this.words.reverse(), this.lines.reverse(), (this.isSplit = !0), this;
                                }),
                                (e.revert = function () {
                                    var t = this._originals;
                                    if (!t) throw "revert() call wasn't scoped properly.";
                                    return (
                                        this.elements.forEach(function (e, r) {
                                            return (e.innerHTML = t[r]);
                                        }),
                                        (this.chars = []),
                                        (this.words = []),
                                        (this.lines = []),
                                        (this.isSplit = !1),
                                        this
                                    );
                                }),
                                (t.create = function (e, r) {
                                    return new t(e, r);
                                }),
                                t
                            );
                        })();
                    (E.version = "3.0.0"), (t.SplitText = E), (t.default = E), Object.defineProperty(t, "__esModule", { value: !0 });
                }),
                    "object" === s(e) ? o(e) : ((n = [e]), void 0 === (i = "function" == typeof (r = o) ? r.apply(e, n) : r) || (t.exports = i));
            },
            198: (t, e, r) => {
                var n = /^\s+|\s+$/g,
                    i = /^[-+]0x[0-9a-f]+$/i,
                    o = /^0b[01]+$/i,
                    s = /^0o[0-7]+$/i,
                    a = parseInt,
                    u = "object" == typeof r.g && r.g && r.g.Object === Object && r.g,
                    l = "object" == typeof self && self && self.Object === Object && self,
                    h = u || l || Function("return this")(),
                    c = Object.prototype.toString,
                    f = Math.max,
                    p = Math.min,
                    d = function () {
                        return h.Date.now();
                    };
                function g(t) {
                    var e = typeof t;
                    return !!t && ("object" == e || "function" == e);
                }
                function m(t) {
                    if ("number" == typeof t) return t;
                    if (
                        (function (t) {
                            return (
                                "symbol" == typeof t ||
                                ((function (t) {
                                    return !!t && "object" == typeof t;
                                })(t) &&
                                    "[object Symbol]" == c.call(t))
                            );
                        })(t)
                    )
                        return NaN;
                    if (g(t)) {
                        var e = "function" == typeof t.valueOf ? t.valueOf() : t;
                        t = g(e) ? e + "" : e;
                    }
                    if ("string" != typeof t) return 0 === t ? t : +t;
                    t = t.replace(n, "");
                    var r = o.test(t);
                    return r || s.test(t) ? a(t.slice(2), r ? 2 : 8) : i.test(t) ? NaN : +t;
                }
                t.exports = function (t, e, r) {
                    var n,
                        i,
                        o,
                        s,
                        a,
                        u,
                        l = 0,
                        h = !1,
                        c = !1,
                        y = !0;
                    if ("function" != typeof t) throw new TypeError("Expected a function");
                    function v(e) {
                        var r = n,
                            o = i;
                        return (n = i = void 0), (l = e), (s = t.apply(o, r));
                    }
                    function D(t) {
                        return (l = t), (a = setTimeout(b, e)), h ? v(t) : s;
                    }
                    function _(t) {
                        var r = t - u;
                        return void 0 === u || r >= e || r < 0 || (c && t - l >= o);
                    }
                    function b() {
                        var t = d();
                        if (_(t)) return x(t);
                        a = setTimeout(
                            b,
                            (function (t) {
                                var r = e - (t - u);
                                return c ? p(r, o - (t - l)) : r;
                            })(t)
                        );
                    }
                    function x(t) {
                        return (a = void 0), y && n ? v(t) : ((n = i = void 0), s);
                    }
                    function w() {
                        var t = d(),
                            r = _(t);
                        if (((n = arguments), (i = this), (u = t), r)) {
                            if (void 0 === a) return D(u);
                            if (c) return (a = setTimeout(b, e)), v(u);
                        }
                        return void 0 === a && (a = setTimeout(b, e)), s;
                    }
                    return (
                        (e = m(e) || 0),
                        g(r) && ((h = !!r.leading), (o = (c = "maxWait" in r) ? f(m(r.maxWait) || 0, e) : o), (y = "trailing" in r ? !!r.trailing : y)),
                        (w.cancel = function () {
                            void 0 !== a && clearTimeout(a), (l = 0), (n = u = i = a = void 0);
                        }),
                        (w.flush = function () {
                            return void 0 === a ? s : x(d());
                        }),
                        w
                    );
                };
            },
            248: (t) => {
                var e = (function (t) {
                    "use strict";
                    var e,
                        r = Object.prototype,
                        n = r.hasOwnProperty,
                        i = "function" == typeof Symbol ? Symbol : {},
                        o = i.iterator || "@@iterator",
                        s = i.asyncIterator || "@@asyncIterator",
                        a = i.toStringTag || "@@toStringTag";
                    function u(t, e, r) {
                        return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e];
                    }
                    try {
                        u({}, "");
                    } catch (t) {
                        u = function (t, e, r) {
                            return (t[e] = r);
                        };
                    }
                    function l(t, e, r, n) {
                        var i = e && e.prototype instanceof m ? e : m,
                            o = Object.create(i.prototype),
                            s = new A(n || []);
                        return (
                            (o._invoke = (function (t, e, r) {
                                var n = c;
                                return function (i, o) {
                                    if (n === p) throw new Error("Generator is already running");
                                    if (n === d) {
                                        if ("throw" === i) throw o;
                                        return O();
                                    }
                                    for (r.method = i, r.arg = o; ; ) {
                                        var s = r.delegate;
                                        if (s) {
                                            var a = C(s, r);
                                            if (a) {
                                                if (a === g) continue;
                                                return a;
                                            }
                                        }
                                        if ("next" === r.method) r.sent = r._sent = r.arg;
                                        else if ("throw" === r.method) {
                                            if (n === c) throw ((n = d), r.arg);
                                            r.dispatchException(r.arg);
                                        } else "return" === r.method && r.abrupt("return", r.arg);
                                        n = p;
                                        var u = h(t, e, r);
                                        if ("normal" === u.type) {
                                            if (((n = r.done ? d : f), u.arg === g)) continue;
                                            return { value: u.arg, done: r.done };
                                        }
                                        "throw" === u.type && ((n = d), (r.method = "throw"), (r.arg = u.arg));
                                    }
                                };
                            })(t, r, s)),
                            o
                        );
                    }
                    function h(t, e, r) {
                        try {
                            return { type: "normal", arg: t.call(e, r) };
                        } catch (t) {
                            return { type: "throw", arg: t };
                        }
                    }
                    t.wrap = l;
                    var c = "suspendedStart",
                        f = "suspendedYield",
                        p = "executing",
                        d = "completed",
                        g = {};
                    function m() {}
                    function y() {}
                    function v() {}
                    var D = {};
                    u(D, o, function () {
                        return this;
                    });
                    var _ = Object.getPrototypeOf,
                        b = _ && _(_(M([])));
                    b && b !== r && n.call(b, o) && (D = b);
                    var x = (v.prototype = m.prototype = Object.create(D));
                    function w(t) {
                        ["next", "throw", "return"].forEach(function (e) {
                            u(t, e, function (t) {
                                return this._invoke(e, t);
                            });
                        });
                    }
                    function E(t, e) {
                        function r(i, o, s, a) {
                            var u = h(t[i], t, o);
                            if ("throw" !== u.type) {
                                var l = u.arg,
                                    c = l.value;
                                return c && "object" == typeof c && n.call(c, "__await")
                                    ? e.resolve(c.__await).then(
                                          function (t) {
                                              r("next", t, s, a);
                                          },
                                          function (t) {
                                              r("throw", t, s, a);
                                          }
                                      )
                                    : e.resolve(c).then(
                                          function (t) {
                                              (l.value = t), s(l);
                                          },
                                          function (t) {
                                              return r("throw", t, s, a);
                                          }
                                      );
                            }
                            a(u.arg);
                        }
                        var i;
                        this._invoke = function (t, n) {
                            function o() {
                                return new e(function (e, i) {
                                    r(t, n, e, i);
                                });
                            }
                            return (i = i ? i.then(o, o) : o());
                        };
                    }
                    function C(t, r) {
                        var n = t.iterator[r.method];
                        if (n === e) {
                            if (((r.delegate = null), "throw" === r.method)) {
                                if (t.iterator.return && ((r.method = "return"), (r.arg = e), C(t, r), "throw" === r.method)) return g;
                                (r.method = "throw"), (r.arg = new TypeError("The iterator does not provide a 'throw' method"));
                            }
                            return g;
                        }
                        var i = h(n, t.iterator, r.arg);
                        if ("throw" === i.type) return (r.method = "throw"), (r.arg = i.arg), (r.delegate = null), g;
                        var o = i.arg;
                        return o
                            ? o.done
                                ? ((r[t.resultName] = o.value), (r.next = t.nextLoc), "return" !== r.method && ((r.method = "next"), (r.arg = e)), (r.delegate = null), g)
                                : o
                            : ((r.method = "throw"), (r.arg = new TypeError("iterator result is not an object")), (r.delegate = null), g);
                    }
                    function F(t) {
                        var e = { tryLoc: t[0] };
                        1 in t && (e.catchLoc = t[1]), 2 in t && ((e.finallyLoc = t[2]), (e.afterLoc = t[3])), this.tryEntries.push(e);
                    }
                    function T(t) {
                        var e = t.completion || {};
                        (e.type = "normal"), delete e.arg, (t.completion = e);
                    }
                    function A(t) {
                        (this.tryEntries = [{ tryLoc: "root" }]), t.forEach(F, this), this.reset(!0);
                    }
                    function M(t) {
                        if (t) {
                            var r = t[o];
                            if (r) return r.call(t);
                            if ("function" == typeof t.next) return t;
                            if (!isNaN(t.length)) {
                                var i = -1,
                                    s = function r() {
                                        for (; ++i < t.length; ) if (n.call(t, i)) return (r.value = t[i]), (r.done = !1), r;
                                        return (r.value = e), (r.done = !0), r;
                                    };
                                return (s.next = s);
                            }
                        }
                        return { next: O };
                    }
                    function O() {
                        return { value: e, done: !0 };
                    }
                    return (
                        (y.prototype = v),
                        u(x, "constructor", v),
                        u(v, "constructor", y),
                        (y.displayName = u(v, a, "GeneratorFunction")),
                        (t.isGeneratorFunction = function (t) {
                            var e = "function" == typeof t && t.constructor;
                            return !!e && (e === y || "GeneratorFunction" === (e.displayName || e.name));
                        }),
                        (t.mark = function (t) {
                            return Object.setPrototypeOf ? Object.setPrototypeOf(t, v) : ((t.__proto__ = v), u(t, a, "GeneratorFunction")), (t.prototype = Object.create(x)), t;
                        }),
                        (t.awrap = function (t) {
                            return { __await: t };
                        }),
                        w(E.prototype),
                        u(E.prototype, s, function () {
                            return this;
                        }),
                        (t.AsyncIterator = E),
                        (t.async = function (e, r, n, i, o) {
                            void 0 === o && (o = Promise);
                            var s = new E(l(e, r, n, i), o);
                            return t.isGeneratorFunction(r)
                                ? s
                                : s.next().then(function (t) {
                                      return t.done ? t.value : s.next();
                                  });
                        }),
                        w(x),
                        u(x, a, "Generator"),
                        u(x, o, function () {
                            return this;
                        }),
                        u(x, "toString", function () {
                            return "[object Generator]";
                        }),
                        (t.keys = function (t) {
                            var e = [];
                            for (var r in t) e.push(r);
                            return (
                                e.reverse(),
                                function r() {
                                    for (; e.length; ) {
                                        var n = e.pop();
                                        if (n in t) return (r.value = n), (r.done = !1), r;
                                    }
                                    return (r.done = !0), r;
                                }
                            );
                        }),
                        (t.values = M),
                        (A.prototype = {
                            constructor: A,
                            reset: function (t) {
                                if (((this.prev = 0), (this.next = 0), (this.sent = this._sent = e), (this.done = !1), (this.delegate = null), (this.method = "next"), (this.arg = e), this.tryEntries.forEach(T), !t))
                                    for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = e);
                            },
                            stop: function () {
                                this.done = !0;
                                var t = this.tryEntries[0].completion;
                                if ("throw" === t.type) throw t.arg;
                                return this.rval;
                            },
                            dispatchException: function (t) {
                                if (this.done) throw t;
                                var r = this;
                                function i(n, i) {
                                    return (a.type = "throw"), (a.arg = t), (r.next = n), i && ((r.method = "next"), (r.arg = e)), !!i;
                                }
                                for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                                    var s = this.tryEntries[o],
                                        a = s.completion;
                                    if ("root" === s.tryLoc) return i("end");
                                    if (s.tryLoc <= this.prev) {
                                        var u = n.call(s, "catchLoc"),
                                            l = n.call(s, "finallyLoc");
                                        if (u && l) {
                                            if (this.prev < s.catchLoc) return i(s.catchLoc, !0);
                                            if (this.prev < s.finallyLoc) return i(s.finallyLoc);
                                        } else if (u) {
                                            if (this.prev < s.catchLoc) return i(s.catchLoc, !0);
                                        } else {
                                            if (!l) throw new Error("try statement without catch or finally");
                                            if (this.prev < s.finallyLoc) return i(s.finallyLoc);
                                        }
                                    }
                                }
                            },
                            abrupt: function (t, e) {
                                for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                                    var i = this.tryEntries[r];
                                    if (i.tryLoc <= this.prev && n.call(i, "finallyLoc") && this.prev < i.finallyLoc) {
                                        var o = i;
                                        break;
                                    }
                                }
                                o && ("break" === t || "continue" === t) && o.tryLoc <= e && e <= o.finallyLoc && (o = null);
                                var s = o ? o.completion : {};
                                return (s.type = t), (s.arg = e), o ? ((this.method = "next"), (this.next = o.finallyLoc), g) : this.complete(s);
                            },
                            complete: function (t, e) {
                                if ("throw" === t.type) throw t.arg;
                                return (
                                    "break" === t.type || "continue" === t.type
                                        ? (this.next = t.arg)
                                        : "return" === t.type
                                        ? ((this.rval = this.arg = t.arg), (this.method = "return"), (this.next = "end"))
                                        : "normal" === t.type && e && (this.next = e),
                                    g
                                );
                            },
                            finish: function (t) {
                                for (var e = this.tryEntries.length - 1; e >= 0; --e) {
                                    var r = this.tryEntries[e];
                                    if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), T(r), g;
                                }
                            },
                            catch: function (t) {
                                for (var e = this.tryEntries.length - 1; e >= 0; --e) {
                                    var r = this.tryEntries[e];
                                    if (r.tryLoc === t) {
                                        var n = r.completion;
                                        if ("throw" === n.type) {
                                            var i = n.arg;
                                            T(r);
                                        }
                                        return i;
                                    }
                                }
                                throw new Error("illegal catch attempt");
                            },
                            delegateYield: function (t, r, n) {
                                return (this.delegate = { iterator: M(t), resultName: r, nextLoc: n }), "next" === this.method && (this.arg = e), g;
                            },
                        }),
                        t
                    );
                })(t.exports);
                try {
                    regeneratorRuntime = e;
                } catch (t) {
                    "object" == typeof globalThis ? (globalThis.regeneratorRuntime = e) : Function("r", "regeneratorRuntime = r")(e);
                }
            },
        },
        e = {};
    function r(n) {
        var i = e[n];
        if (void 0 !== i) return i.exports;
        var o = (e[n] = { exports: {} });
        return t[n].call(o.exports, o, o.exports, r), o.exports;
    }
    (r.n = (t) => {
        var e = t && t.__esModule ? () => t.default : () => t;
        return r.d(e, { a: e }), e;
    }),
        (r.d = (t, e) => {
            for (var n in e) r.o(e, n) && !r.o(t, n) && Object.defineProperty(t, n, { enumerable: !0, get: e[n] });
        }),
        (r.g = (function () {
            if ("object" == typeof globalThis) return globalThis;
            try {
                return this || new Function("return this")();
            } catch (t) {
                if ("object" == typeof window) return window;
            }
        })()),
        (r.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e)),
        r(248);
    r(924);
})();
