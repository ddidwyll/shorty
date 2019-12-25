var app=function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function l(e){e.forEach(t)}function c(e){return"function"==typeof e}function r(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function s(e,t,n){e.$$.on_destroy.push(function(e,t){const n=e.subscribe(t);return n.unsubscribe?()=>n.unsubscribe():n}(t,n))}function o(e,t,n,l){if(e){const c=a(e,t,n,l);return e[0](c)}}function a(e,t,n,l){return e[1]&&l?function(e,t){for(const n in t)e[n]=t[n];return e}(n.ctx.slice(),e[1](l(t))):n.ctx}function i(e,t,n,l){if(e[2]&&l){const c=e[2](l(n));if("object"==typeof t.dirty){const e=[],n=Math.max(t.dirty.length,c.length);for(let l=0;l<n;l+=1)e[l]=t.dirty[l]|c[l];return e}return t.dirty|c}return t.dirty}function u(e,t){e.appendChild(t)}function d(e,t,n){e.insertBefore(t,n||null)}function $(e){e.parentNode.removeChild(e)}function f(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function p(e){return document.createElement(e)}function m(e){return document.createTextNode(e)}function g(){return m(" ")}function h(){return m("")}function b(e,t,n,l){return e.addEventListener(t,n,l),()=>e.removeEventListener(t,n,l)}function v(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function x(e,t){t=""+t,e.data!==t&&(e.data=t)}function y(e,t,n){e.classList[n?"add":"remove"](t)}let w;function k(e){w=e}function L(){if(!w)throw new Error("Function called outside component initialization");return w}function S(e){L().$$.on_mount.push(e)}function _(){const e=L();return(t,n)=>{const l=e.$$.callbacks[t];if(l){const c=function(e,t){const n=document.createEvent("CustomEvent");return n.initCustomEvent(e,!1,!1,t),n}(t,n);l.slice().forEach(t=>{t.call(e,c)})}}}function j(e,t){const n=e.$$.callbacks[t.type];n&&n.slice().forEach(e=>e(t))}const E=[],O=[],C=[],N=[],q=Promise.resolve();let T=!1;function z(e){C.push(e)}function A(){const e=new Set;do{for(;E.length;){const e=E.shift();k(e),I(e.$$)}for(;O.length;)O.pop()();for(let t=0;t<C.length;t+=1){const n=C[t];e.has(n)||(n(),e.add(n))}C.length=0}while(E.length);for(;N.length;)N.pop()();T=!1}function I(e){if(null!==e.fragment){e.update(),l(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(z)}}const U=new Set;let D;function J(){D={r:0,c:[],p:D}}function R(){D.r||l(D.c),D=D.p}function W(e,t){e&&e.i&&(U.delete(e),e.i(t))}function B(e,t,n,l){if(e&&e.o){if(U.has(e))return;U.add(e),D.c.push(()=>{U.delete(e),l&&(n&&e.d(1),l())}),e.o(t)}}function H(e){e&&e.c()}function M(e,n,r){const{fragment:s,on_mount:o,on_destroy:a,after_update:i}=e.$$;s&&s.m(n,r),z(()=>{const n=o.map(t).filter(c);a?a.push(...n):l(n),e.$$.on_mount=[]}),i.forEach(z)}function F(e,t){const n=e.$$;null!==n.fragment&&(l(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function P(e,t){-1===e.$$.dirty[0]&&(E.push(e),T||(T=!0,q.then(A)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function X(t,c,r,s,o,a,i=[-1]){const u=w;k(t);const d=c.props||{},$=t.$$={fragment:null,ctx:null,props:a,update:e,not_equal:o,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:[]),callbacks:n(),dirty:i};let f=!1;$.ctx=r?r(t,d,(e,n,l=n)=>($.ctx&&o($.ctx[e],$.ctx[e]=l)&&($.bound[e]&&$.bound[e](l),f&&P(t,e)),n)):[],$.update(),f=!0,l($.before_update),$.fragment=!!s&&s($.ctx),c.target&&(c.hydrate?$.fragment&&$.fragment.l(function(e){return Array.from(e.childNodes)}(c.target)):$.fragment&&$.fragment.c(),c.intro&&W(t.$$.fragment),M(t,c.target,c.anchor),A()),k(u)}class Y{$destroy(){F(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(){}}function G(e){let t,n;const l=e[5].default,c=o(l,e,e[4],null);return{c(){t=p("div"),c&&c.c(),v(t,"class","svelte-aalbab"),y(t,"scrollx",e[0]),y(t,"scrolly",e[1]),y(t,"small",e[2]),y(t,"middle",e[3])},m(e,l){d(e,t,l),c&&c.m(t,null),n=!0},p(e,[n]){c&&c.p&&16&n&&c.p(a(l,e,e[4],null),i(l,e[4],n,null)),1&n&&y(t,"scrollx",e[0]),2&n&&y(t,"scrolly",e[1]),4&n&&y(t,"small",e[2]),8&n&&y(t,"middle",e[3])},i(e){n||(W(c,e),n=!0)},o(e){B(c,e),n=!1},d(e){e&&$(t),c&&c.d(e)}}}function K(e,t,n){let{scrollx:l=!1}=t,{scrolly:c=!1}=t,{small:r=!1}=t,{middle:s=!1}=t,{$$slots:o={},$$scope:a}=t;return e.$set=e=>{"scrollx"in e&&n(0,l=e.scrollx),"scrolly"in e&&n(1,c=e.scrolly),"small"in e&&n(2,r=e.small),"middle"in e&&n(3,s=e.middle),"$$scope"in e&&n(4,a=e.$$scope)},[l,c,r,s,a,o]}class Q extends Y{constructor(e){super(),X(this,e,K,G,r,{scrollx:0,scrolly:1,small:2,middle:3})}}function V(e){let t,n;const l=e[7].default,c=o(l,e,e[6],null);return{c(){t=p("div"),c&&c.c(),v(t,"class","svelte-w6pxxg"),y(t,"center",e[0]),y(t,"block",e[1]),y(t,"right",e[2]),y(t,"between",e[3]),y(t,"wrap",e[4]),y(t,"gutter",e[5])},m(e,l){d(e,t,l),c&&c.m(t,null),n=!0},p(e,[n]){c&&c.p&&64&n&&c.p(a(l,e,e[6],null),i(l,e[6],n,null)),1&n&&y(t,"center",e[0]),2&n&&y(t,"block",e[1]),4&n&&y(t,"right",e[2]),8&n&&y(t,"between",e[3]),16&n&&y(t,"wrap",e[4]),32&n&&y(t,"gutter",e[5])},i(e){n||(W(c,e),n=!0)},o(e){B(c,e),n=!1},d(e){e&&$(t),c&&c.d(e)}}}function Z(e,t,n){let{center:l=!1}=t,{block:c=!1}=t,{right:r=!1}=t,{between:s=!1}=t,{wrap:o=!1}=t,{gutter:a=!1}=t,{$$slots:i={},$$scope:u}=t;return e.$set=e=>{"center"in e&&n(0,l=e.center),"block"in e&&n(1,c=e.block),"right"in e&&n(2,r=e.right),"between"in e&&n(3,s=e.between),"wrap"in e&&n(4,o=e.wrap),"gutter"in e&&n(5,a=e.gutter),"$$scope"in e&&n(6,u=e.$$scope)},[l,c,r,s,o,a,u,i]}class ee extends Y{constructor(e){super(),X(this,e,Z,V,r,{center:0,block:1,right:2,between:3,wrap:4,gutter:5})}}const te=e=>({}),ne=e=>({});function le(e){let t,n,l,c,r,s,f=(e[1]||"")+"";const h=e[17].default,w=o(h,e,e[16],null),k=e[17].badge,L=o(k,e,e[16],ne);return{c(){t=p("button"),w||(n=m(f)),w&&w.c(),l=g(),c=p("figure"),L&&L.c(),v(c,"class","svelte-11wkn4z"),v(t,"aria-label",e[1]),v(t,"title",e[1]),t.disabled=e[2],t.hidden=e[3],v(t,"style",e[15]),v(t,"class","svelte-11wkn4z"),y(t,"active",e[4]),y(t,"success",e[5]),y(t,"inverse",e[6]),y(t,"danger",e[7]),y(t,"clean",e[8]),y(t,"card",e[11]),y(t,"large",e[10]),y(t,"small",e[9]),y(t,"image",e[0]),y(t,"center",e[14]),y(t,"width",e[13]),y(t,"block",e[12]),s=b(t,"click",e[18])},m(e,s){d(e,t,s),w||u(t,n),w&&w.m(t,null),u(t,l),u(t,c),L&&L.m(c,null),r=!0},p(e,[l]){w||(!r||2&l)&&f!==(f=(e[1]||"")+"")&&x(n,f),w&&w.p&&65536&l&&w.p(a(h,e,e[16],null),i(h,e[16],l,null)),L&&L.p&&65536&l&&L.p(a(k,e,e[16],ne),i(k,e[16],l,te)),(!r||2&l)&&v(t,"aria-label",e[1]),(!r||2&l)&&v(t,"title",e[1]),(!r||4&l)&&(t.disabled=e[2]),(!r||8&l)&&(t.hidden=e[3]),(!r||32768&l)&&v(t,"style",e[15]),16&l&&y(t,"active",e[4]),32&l&&y(t,"success",e[5]),64&l&&y(t,"inverse",e[6]),128&l&&y(t,"danger",e[7]),256&l&&y(t,"clean",e[8]),2048&l&&y(t,"card",e[11]),1024&l&&y(t,"large",e[10]),512&l&&y(t,"small",e[9]),1&l&&y(t,"image",e[0]),16384&l&&y(t,"center",e[14]),8192&l&&y(t,"width",e[13]),4096&l&&y(t,"block",e[12])},i(e){r||(W(w,e),W(L,e),r=!0)},o(e){B(w,e),B(L,e),r=!1},d(e){e&&$(t),w&&w.d(e),L&&L.d(e),s()}}}function ce(e,t,n){let{image:l=null}=t,{label:c=null}=t,{disabled:r=!1}=t,{hidden:s=!1}=t,{active:o=!1}=t,{success:a=!1}=t,{inverse:i=!1}=t,{danger:u=!1}=t,{clean:d=!1}=t,{small:$=!1}=t,{large:f=!1}=t,{card:p=!1}=t,{block:m=!1}=t,{width:g=!1}=t,{center:h=!1}=t,{style:b=null}=t,{$$slots:v={},$$scope:x}=t;return e.$set=e=>{"image"in e&&n(0,l=e.image),"label"in e&&n(1,c=e.label),"disabled"in e&&n(2,r=e.disabled),"hidden"in e&&n(3,s=e.hidden),"active"in e&&n(4,o=e.active),"success"in e&&n(5,a=e.success),"inverse"in e&&n(6,i=e.inverse),"danger"in e&&n(7,u=e.danger),"clean"in e&&n(8,d=e.clean),"small"in e&&n(9,$=e.small),"large"in e&&n(10,f=e.large),"card"in e&&n(11,p=e.card),"block"in e&&n(12,m=e.block),"width"in e&&n(13,g=e.width),"center"in e&&n(14,h=e.center),"style"in e&&n(15,b=e.style),"$$scope"in e&&n(16,x=e.$$scope)},[l,c,r,s,o,a,i,u,d,$,f,p,m,g,h,b,x,v,function(t){j(e,t)}]}class re extends Y{constructor(e){super(),X(this,e,ce,le,r,{image:0,label:1,disabled:2,hidden:3,active:4,success:5,inverse:6,danger:7,clean:8,small:9,large:10,card:11,block:12,width:13,center:14,style:15})}}const se=e=>({}),oe=e=>({}),ae=e=>({}),ie=e=>({});function ue(e){let t,n,l;const c=e[0].default,r=o(c,e,e[1],null),s=e[0].center,u=o(s,e,e[1],ie),f=e[0].right,p=o(f,e,e[1],oe);return{c(){r&&r.c(),t=g(),u&&u.c(),n=g(),p&&p.c()},m(e,c){r&&r.m(e,c),d(e,t,c),u&&u.m(e,c),d(e,n,c),p&&p.m(e,c),l=!0},p(e,t){r&&r.p&&2&t&&r.p(a(c,e,e[1],null),i(c,e[1],t,null)),u&&u.p&&2&t&&u.p(a(s,e,e[1],ie),i(s,e[1],t,ae)),p&&p.p&&2&t&&p.p(a(f,e,e[1],oe),i(f,e[1],t,se))},i(e){l||(W(r,e),W(u,e),W(p,e),l=!0)},o(e){B(r,e),B(u,e),B(p,e),l=!1},d(e){r&&r.d(e),e&&$(t),u&&u.d(e),e&&$(n),p&&p.d(e)}}}function de(e){let t,n;const l=new Q({props:{$$slots:{default:[ue]},$$scope:{ctx:e}}});return{c(){t=p("header"),H(l.$$.fragment),v(t,"class","svelte-dz5bw8")},m(e,c){d(e,t,c),M(l,t,null),n=!0},p(e,[t]){const n={};2&t&&(n.$$scope={dirty:t,ctx:e}),l.$set(n)},i(e){n||(W(l.$$.fragment,e),n=!0)},o(e){B(l.$$.fragment,e),n=!1},d(e){e&&$(t),F(l)}}}function $e(e,t,n){let{$$slots:l={},$$scope:c}=t;return e.$set=e=>{"$$scope"in e&&n(1,c=e.$$scope)},[l,c]}class fe extends Y{constructor(e){super(),X(this,e,$e,de,r,{})}}const pe=[];function me(t,n=e){let l;const c=[];function s(e){if(r(t,e)&&(t=e,l)){const e=!pe.length;for(let e=0;e<c.length;e+=1){const n=c[e];n[1](),pe.push(n,t)}if(e){for(let e=0;e<pe.length;e+=2)pe[e][0](pe[e+1]);pe.length=0}}}return{set:s,update:function(e){s(e(t))},subscribe:function(r,o=e){const a=[r,o];return c.push(a),1===c.length&&(l=n(s)||e),r(t),()=>{const e=c.indexOf(a);-1!==e&&c.splice(e,1),0===c.length&&(l(),l=null)}}}}function ge(e){let t,n,c;const r=e[10].default,s=o(r,e,e[9],null);return{c(){t=p("div"),s&&s.c(),v(t,"class","svelte-11om7ek"),y(t,"scroll",e[4]),c=[b(t,"mousedown",e[12]),b(t,"mouseup",e[13]),b(t,"mouseleave",e[14]),b(t,"mousemove",e[15])]},m(l,c){d(l,t,c),s&&s.m(t,null),e[11](t),n=!0},p(e,n){s&&s.p&&512&n&&s.p(a(r,e,e[9],null),i(r,e[9],n,null)),16&n&&y(t,"scroll",e[4])},i(e){n||(W(s,e),n=!0)},o(e){B(s,e),n=!1},d(n){n&&$(t),s&&s.d(n),e[11](null),l(c)}}}function he(e){let t,n;const l=e[10].default,c=o(l,e,e[9],null);return{c(){t=p("div"),c&&c.c(),v(t,"class","svelte-11om7ek")},m(e,l){d(e,t,l),c&&c.m(t,null),n=!0},p(e,t){c&&c.p&&512&t&&c.p(a(l,e,e[9],null),i(l,e[9],t,null))},i(e){n||(W(c,e),n=!0)},o(e){B(c,e),n=!1},d(e){e&&$(t),c&&c.d(e)}}}function be(e){let t,n,l,c;const r=[he,ge],s=[];return t=window.orientation?0:1,n=s[t]=r[t](e),{c(){n.c(),l=h()},m(e,n){s[t].m(e,n),d(e,l,n),c=!0},p(e,[t]){n.p(e,t)},i(e){c||(W(n),c=!0)},o(e){B(n),c=!1},d(e){s[t].d(e),e&&$(l)}}}function ve(e,t,n){let l,c=!1;const r=me(!1);let o;s(e,r,e=>n(4,l=e));let a=null,i=null,u=()=>{},d=()=>{},$=()=>{};S(()=>{window.orientation||(n(1,u=()=>{r.set(!1),a=null,i=null,c=!1}),n(2,d=(e,t)=>{o.scrollWidth<=o.clientWidth||(c=!0,a=e.pageX-o.offsetLeft,i=o.scrollLeft)}),n(3,$=(e,t)=>{if(!c)return;r.set(!0),e.preventDefault();const l=e.pageX-o.offsetLeft-a;n(0,o.scrollLeft=i-l,o)}))});let{$$slots:f={},$$scope:p}=t;return e.$set=e=>{"$$scope"in e&&n(9,p=e.$$scope)},[o,u,d,$,l,r,c,a,i,p,f,function(e){O[e?"unshift":"push"](()=>{n(0,o=e)})},e=>d(e),()=>u(),()=>u(),e=>$(e)]}class xe extends Y{constructor(e){super(),X(this,e,ve,be,r,{})}}function ye(e,t,n){const l=e.slice();return l[35]=t[n],l}function we(e){let t,n=(e[15]?`(${e[18]}/${e[15]})`:"")+"";return{c(){t=m(n)},m(e,n){d(e,t,n)},p(e,l){294912&l[0]&&n!==(n=(e[15]?`(${e[18]}/${e[15]})`:"")+"")&&x(t,n)},d(e){e&&$(t)}}}function ke(e){let t,n=e[19],l=[];for(let t=0;t<n.length;t+=1)l[t]=Le(ye(e,n,t));return{c(){t=p("figure");for(let e=0;e<l.length;e+=1)l[e].c();v(t,"class","svelte-4pj98e")},m(e,n){d(e,t,n);for(let e=0;e<l.length;e+=1)l[e].m(t,null)},p(e,c){if(4718592&c[0]){let r;for(n=e[19],r=0;r<n.length;r+=1){const s=ye(e,n,r);l[r]?l[r].p(s,c):(l[r]=Le(s),l[r].c(),l[r].m(t,null))}for(;r<l.length;r+=1)l[r].d(1);l.length=n.length}},d(e){e&&$(t),f(l,e)}}}function Le(e){let t,n,l,c=e[35]+"";function r(...t){return e[34](e[35],...t)}return{c(){t=p("span"),n=m(c),v(t,"class","svelte-4pj98e"),l=b(t,"click",r)},m(e,l){d(e,t,l),u(t,n)},p(t,l){e=t,524288&l[0]&&c!==(c=e[35]+"")&&x(n,c)},d(e){e&&$(t),l()}}}function Se(e){let t,n,c,r,s,f,h,w,k,L,S,_,j,E,O=(e[0]||"")+"",C=e[11]&&e[19].length&&!~e[11].indexOf(e[13]),N="text"===e[12]&&we(e),q=C&&ke(e);const T=e[27].default,z=o(T,e,e[26],null);return{c(){t=p("div"),n=p("input"),h=g(),w=p("label"),k=m(O),L=g(),N&&N.c(),S=g(),q&&q.c(),_=g(),z&&z.c(),v(n,"type",e[12]),n.value=c=e[20](e[13]),v(n,"min",r=e[14]?e[21](e[14]):null),v(n,"max",s=e[15]?e[21](e[15]):null),v(n,"maxlength",f="text"===e[12]&&e[15]?e[15]:null),v(n,"placeholder",e[0]),v(n,"aria-label",e[0]),n.disabled=e[1],n.hidden=e[2],n.required=e[10],n.autofocus=e[16],v(n,"class","svelte-4pj98e"),y(n,"valid",e[3]),y(n,"invalid",e[4]),y(n,"clean",e[5]),y(n,"simple",e[6]),v(w,"class","svelte-4pj98e"),y(w,"active",e[13]||0===e[13]),v(t,"class","svelte-4pj98e"),y(t,"block",e[7]),y(t,"small",e[8]),y(t,"large",e[9]),E=[b(n,"focus",e[28]),b(n,"blur",e[29]),b(n,"input",e[31]),b(n,"change",e[32]),b(n,"keydown",e[33])]},m(l,c){d(l,t,c),u(t,n),e[30](n),u(t,h),u(t,w),u(w,k),u(w,L),N&&N.m(w,null),u(t,S),q&&q.m(t,null),u(t,_),z&&z.m(t,null),j=!0},p(e,l){(!j||4096&l[0])&&v(n,"type",e[12]),(!j||8192&l[0]&&c!==(c=e[20](e[13])))&&(n.value=c),(!j||16384&l[0]&&r!==(r=e[14]?e[21](e[14]):null))&&v(n,"min",r),(!j||32768&l[0]&&s!==(s=e[15]?e[21](e[15]):null))&&v(n,"max",s),(!j||36864&l[0]&&f!==(f="text"===e[12]&&e[15]?e[15]:null))&&v(n,"maxlength",f),(!j||1&l[0])&&v(n,"placeholder",e[0]),(!j||1&l[0])&&v(n,"aria-label",e[0]),(!j||2&l[0])&&(n.disabled=e[1]),(!j||4&l[0])&&(n.hidden=e[2]),(!j||1024&l[0])&&(n.required=e[10]),(!j||65536&l[0])&&(n.autofocus=e[16]),8&l[0]&&y(n,"valid",e[3]),16&l[0]&&y(n,"invalid",e[4]),32&l[0]&&y(n,"clean",e[5]),64&l[0]&&y(n,"simple",e[6]),(!j||1&l[0])&&O!==(O=(e[0]||"")+"")&&x(k,O),"text"===e[12]?N?N.p(e,l):(N=we(e),N.c(),N.m(w,null)):N&&(N.d(1),N=null),8192&l[0]&&y(w,"active",e[13]||0===e[13]),534528&l[0]&&(C=e[11]&&e[19].length&&!~e[11].indexOf(e[13])),C?q?q.p(e,l):(q=ke(e),q.c(),q.m(t,_)):q&&(q.d(1),q=null),z&&z.p&&67108864&l[0]&&z.p(a(T,e,e[26],null),i(T,e[26],l,null)),128&l[0]&&y(t,"block",e[7]),256&l[0]&&y(t,"small",e[8]),512&l[0]&&y(t,"large",e[9])},i(e){j||(W(z,e),j=!0)},o(e){B(z,e),j=!1},d(n){n&&$(t),e[30](null),N&&N.d(),q&&q.d(),z&&z.d(n),l(E)}}}function _e(e,t,n){const l=_();let{label:c=null}=t,{disabled:r=!1}=t,{hidden:s=!1}=t,{valid:o=!1}=t,{invalid:a=!1}=t,{clean:i=!1}=t,{simple:u=!1}=t,{block:d=!1}=t,{small:$=!1}=t,{large:f=!1}=t,{required:p=!1}=t,{hints:m=null}=t,{type:g="text"}=t,{value:h=""}=t,{min:b=null}=t,{max:v=null}=t,{autofocus:x=!1}=t,y=null,w=0;const k=e=>{switch(g){case"date":return+e>0?new Date(+e).toLocaleDateString("en-GB").split("/").reverse().join("-"):"";case"number":return+e||null;default:return n(18,w=(e=e||"").length),v?e.slice(0,v):e}},L=e=>{y&&y.focus(),S({type:"input",target:{value:e}})},S=e=>{const t=e.target.value;let n;switch(g){case"date":n=t?new Date(t).getTime():null;break;case"number":n=+t||0;break;default:n=v?t.slice(0,v):t}l(e.type,n)},E=e=>{13===e.keyCode&&(e.preventDefault(),l("enter"))};let{$$slots:C={},$$scope:N}=t;let q;return e.$set=e=>{"label"in e&&n(0,c=e.label),"disabled"in e&&n(1,r=e.disabled),"hidden"in e&&n(2,s=e.hidden),"valid"in e&&n(3,o=e.valid),"invalid"in e&&n(4,a=e.invalid),"clean"in e&&n(5,i=e.clean),"simple"in e&&n(6,u=e.simple),"block"in e&&n(7,d=e.block),"small"in e&&n(8,$=e.small),"large"in e&&n(9,f=e.large),"required"in e&&n(10,p=e.required),"hints"in e&&n(11,m=e.hints),"type"in e&&n(12,g=e.type),"value"in e&&n(13,h=e.value),"min"in e&&n(14,b=e.min),"max"in e&&n(15,v=e.max),"autofocus"in e&&n(16,x=e.autofocus),"$$scope"in e&&n(26,N=e.$$scope)},e.$$.update=()=>{10240&e.$$.dirty[0]&&n(19,q=(m||[]).filter(e=>~e.toUpperCase().indexOf((h||"").toUpperCase())))},[c,r,s,o,a,i,u,d,$,f,p,m,g,h,b,v,x,y,w,q,k,e=>{switch(g){case"date":return e?k(e):"";case"number":return e||"";default:return null}},L,S,E,l,N,C,function(t){j(e,t)},function(t){j(e,t)},function(e){O[e?"unshift":"push"](()=>{n(17,y=e)})},e=>S(e),e=>S(e),e=>E(e),e=>L(e)]}class je extends Y{constructor(e){super(),X(this,e,_e,Se,r,{label:0,disabled:1,hidden:2,valid:3,invalid:4,clean:5,simple:6,block:7,small:8,large:9,required:10,hints:11,type:12,value:13,min:14,max:15,autofocus:16},[-1,-1])}}function Ee(e){let t;const n=e[0].default,l=o(n,e,e[1],null);return{c(){l&&l.c()},m(e,n){l&&l.m(e,n),t=!0},p(e,t){l&&l.p&&2&t&&l.p(a(n,e,e[1],null),i(n,e[1],t,null))},i(e){t||(W(l,e),t=!0)},o(e){B(l,e),t=!1},d(e){l&&l.d(e)}}}function Oe(e){let t,n;const l=new Q({props:{scrolly:!0,$$slots:{default:[Ee]},$$scope:{ctx:e}}});return{c(){t=p("main"),H(l.$$.fragment),v(t,"class","svelte-1xhfp1m")},m(e,c){d(e,t,c),M(l,t,null),n=!0},p(e,[t]){const n={};2&t&&(n.$$scope={dirty:t,ctx:e}),l.$set(n)},i(e){n||(W(l.$$.fragment,e),n=!0)},o(e){B(l.$$.fragment,e),n=!1},d(e){e&&$(t),F(l)}}}function Ce(e,t,n){let{$$slots:l={},$$scope:c}=t;return e.$set=e=>{"$$scope"in e&&n(1,c=e.$$scope)},[l,c]}class Ne extends Y{constructor(e){super(),X(this,e,Ce,Oe,r,{})}}const qe=()=>{const[e,t]=location.hash.slice(1).split("?");return{action:e,param:t}},{subscribe:Te,set:ze}=me(qe());window.addEventListener("hashchange",()=>ze(qe()));var Ae={subscribe:Te,go:(e,t)=>{let n=e||"";t&&(n+="?"+t),location.hash=n}};const{subscribe:Ie,update:Ue}=((e,t)=>{const n=localStorage.getItem(e);return(t=me(n?JSON.parse(n):t)).subscribe(t=>{void 0!==t&&localStorage.setItem(e,JSON.stringify(t))}),t})("myLinks",{});var De={subscribe:Ie,add:e=>Ue(t=>(t[e.id]=e,{...t})),del:e=>Ue(t=>(delete t[e],{...t}))};function Je(e){let t;return{c(){t=m("paste")},m(e,n){d(e,t,n)},d(e){e&&$(t)}}}function Re(e){let t,n=e[2].url?"!":"x";return{c(){t=m(n)},m(e,n){d(e,t,n)},p(e,l){4&l&&n!==(n=e[2].url?"!":"x")&&x(t,n)},d(e){e&&$(t)}}}function We(e){let t,n;const l=new re({props:{hidden:!e[3]||e[0],label:"< "+e[3],clean:!0,large:!0,$$slots:{default:[Je]},$$scope:{ctx:e}}});l.$on("click",e[10]);const c=new re({props:{hidden:!e[0],danger:e[2].url,label:"clear",large:!0,$$slots:{default:[Re]},$$scope:{ctx:e}}});return c.$on("click",e[11]),{c(){H(l.$$.fragment),t=g(),H(c.$$.fragment)},m(e,r){M(l,e,r),d(e,t,r),M(c,e,r),n=!0},p(e,t){const n={};9&t&&(n.hidden=!e[3]||e[0]),8&t&&(n.label="< "+e[3]),262144&t&&(n.$$scope={dirty:t,ctx:e}),l.$set(n);const r={};1&t&&(r.hidden=!e[0]),4&t&&(r.danger=e[2].url),262148&t&&(r.$$scope={dirty:t,ctx:e}),c.$set(r)},i(e){n||(W(l.$$.fragment,e),W(c.$$.fragment,e),n=!0)},o(e){B(l.$$.fragment,e),B(c.$$.fragment,e),n=!1},d(e){F(l,e),e&&$(t),F(c,e)}}}function Be(e){let t,n=e[2].mail?"!":"x";return{c(){t=m(n)},m(e,n){d(e,t,n)},p(e,l){4&l&&n!==(n=e[2].mail?"!":"x")&&x(t,n)},d(e){e&&$(t)}}}function He(e){let t;const n=new re({props:{hidden:!e[1],danger:e[2].mail,label:"clear",large:!0,$$slots:{default:[Be]},$$scope:{ctx:e}}});return n.$on("click",e[14]),{c(){H(n.$$.fragment)},m(e,l){M(n,e,l),t=!0},p(e,t){const l={};2&t&&(l.hidden=!e[1]),4&t&&(l.danger=e[2].mail),262148&t&&(l.$$scope={dirty:t,ctx:e}),n.$set(l)},i(e){t||(W(n.$$.fragment,e),t=!0)},o(e){B(n.$$.fragment,e),t=!1},d(e){F(n,e)}}}function Me(e){let t,n,l,c,r,s,o,a,i,f,h,b=e[2].message+"";const y=new je({props:{block:!0,large:!0,label:e[2].url||"Enter URL you want to shorten, e.g. http://example.com",value:e[0],invalid:e[2].url,$$slots:{default:[We]},$$scope:{ctx:e}}});y.$on("input",e[12]),y.$on("enter",e[13]);const w=new je({props:{block:!0,large:!0,label:e[2].mail||"You can specify your email, to edit this link in future",value:e[1],hints:e[5](),invalid:e[2].mail,$$slots:{default:[He]},$$scope:{ctx:e}}});w.$on("input",e[15]),w.$on("enter",e[16]);const k=new re({props:{disabled:!e[0],large:!0,label:e[0]?"Let's shorten":"URL required",width:!0,center:!0}});return k.$on("click",e[17]),{c(){t=p("h2"),t.textContent="Welcome! Ready to get started?",n=g(),l=p("h4"),l.textContent="No registration, no ads, no logs, no fee.",c=g(),H(y.$$.fragment),r=g(),H(w.$$.fragment),s=g(),H(k.$$.fragment),o=g(),a=p("p"),i=m(b),v(t,"class","svelte-xzpybw"),v(l,"class","svelte-xzpybw"),a.hidden=f=!e[2].message},m(e,$){d(e,t,$),d(e,n,$),d(e,l,$),d(e,c,$),M(y,e,$),d(e,r,$),M(w,e,$),d(e,s,$),M(k,e,$),d(e,o,$),d(e,a,$),u(a,i),h=!0},p(e,t){const n={};4&t&&(n.label=e[2].url||"Enter URL you want to shorten, e.g. http://example.com"),1&t&&(n.value=e[0]),4&t&&(n.invalid=e[2].url),262157&t&&(n.$$scope={dirty:t,ctx:e}),y.$set(n);const l={};4&t&&(l.label=e[2].mail||"You can specify your email, to edit this link in future"),2&t&&(l.value=e[1]),4&t&&(l.invalid=e[2].mail),262150&t&&(l.$$scope={dirty:t,ctx:e}),w.$set(l);const c={};1&t&&(c.disabled=!e[0]),1&t&&(c.label=e[0]?"Let's shorten":"URL required"),k.$set(c),(!h||4&t)&&b!==(b=e[2].message+"")&&x(i,b),(!h||4&t&&f!==(f=!e[2].message))&&(a.hidden=f)},i(e){h||(W(y.$$.fragment,e),W(w.$$.fragment,e),W(k.$$.fragment,e),h=!0)},o(e){B(y.$$.fragment,e),B(w.$$.fragment,e),B(k.$$.fragment,e),h=!1},d(e){e&&$(t),e&&$(n),e&&$(l),e&&$(c),F(y,e),e&&$(r),F(w,e),e&&$(s),F(k,e),e&&$(o),e&&$(a)}}}function Fe(e){let t,n;const l=new Q({props:{small:!0,middle:!0,$$slots:{default:[Me]},$$scope:{ctx:e}}});return{c(){H(l.$$.fragment),n=b(window,"focus",e[9])},m(e,n){M(l,e,n),t=!0},p(e,[t]){const n={};262159&t&&(n.$$scope={dirty:t,ctx:e}),l.$set(n)},i(e){t||(W(l.$$.fragment,e),t=!0)},o(e){B(l.$$.fragment,e),t=!1},d(e){F(l,e),n()}}}function Pe(e,t,n){let l;s(e,De,e=>n(8,l=e));let c="",r="",o={},a=null,i="";const u=async()=>{const e=await navigator.clipboard.readText();e.startsWith("http")&&n(3,i=e)};S(()=>u());const d=async()=>{if(!c)return;const e={url:c,mail:r||void 0},t=await fetch("/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(400===t.status)n(2,o=await t.json());else if(200===t.status){const e=await t.json();De.add(e),Ae.go("search",e.id)}else n(2,o={message:"Something went wrong, try again later"});clearInterval(a),a=setInterval(()=>n(2,o={}),5e3)};return[c,r,o,i,u,()=>{const e=Object.values(l).map(e=>e.mail).filter(e=>e);return[...new Set(e)]},d,a,l,()=>u(),()=>n(0,c=i),()=>n(0,c=""),e=>n(0,c=e.detail),()=>d(),()=>n(1,r=""),e=>n(1,r=e.detail),()=>d(),()=>d()]}class Xe extends Y{constructor(e){super(),X(this,e,Pe,Fe,r,{})}}function Ye(e,t,n){const l=e.slice();return l[17]=t[n],l}function Ge(e){let t;return{c(){t=m("x")},m(e,n){d(e,t,n)},d(e){e&&$(t)}}}function Ke(e){let t,n,l;const c=new re({props:{hidden:!e[2].param,label:"All",clean:!0,large:!0,$$slots:{default:[Ge]},$$scope:{ctx:e}}});c.$on("click",e[10]);const r=new re({props:{disabled:!e[2].param,label:e[0].id?"Not found":"Search",danger:e[0].id,success:e[1]&&e[1].id==e[2].param,large:!0}});return r.$on("click",e[11]),{c(){t=p("div"),H(c.$$.fragment),n=g(),H(r.$$.fragment)},m(e,s){d(e,t,s),M(c,t,null),u(t,n),M(r,t,null),l=!0},p(e,t){const n={};4&t&&(n.hidden=!e[2].param),1048576&t&&(n.$$scope={dirty:t,ctx:e}),c.$set(n);const l={};4&t&&(l.disabled=!e[2].param),1&t&&(l.label=e[0].id?"Not found":"Search"),1&t&&(l.danger=e[0].id),6&t&&(l.success=e[1]&&e[1].id==e[2].param),r.$set(l)},i(e){l||(W(c.$$.fragment,e),W(r.$$.fragment,e),l=!0)},o(e){B(c.$$.fragment,e),B(r.$$.fragment,e),l=!1},d(e){e&&$(t),F(c),F(r)}}}function Qe(e){let t;return{c(){t=m("x")},m(e,n){d(e,t,n)},d(e){e&&$(t)}}}function Ve(e){let t,n,l;const c=new re({props:{label:"Copy",clean:!0,small:!0}});c.$on("click",(function(...t){return e[14](e[17],...t)}));const r=new re({props:{label:"Edit",hidden:!e[4][e[17].id]&&!e[17].shadow,clean:!0,small:!0}});r.$on("click",(function(...t){return e[15](e[17],...t)}));const s=new re({props:{label:"Hide",hidden:!e[4][e[17].id],clean:!0,small:!0,$$slots:{default:[Qe]},$$scope:{ctx:e}}});return s.$on("click",(function(...t){return e[16](e[17],...t)})),{c(){H(c.$$.fragment),t=g(),H(r.$$.fragment),n=g(),H(s.$$.fragment)},m(e,o){M(c,e,o),d(e,t,o),M(r,e,o),d(e,n,o),M(s,e,o),l=!0},p(t,n){e=t;const l={};24&n&&(l.hidden=!e[4][e[17].id]&&!e[17].shadow),r.$set(l);const c={};24&n&&(c.hidden=!e[4][e[17].id]),1048576&n&&(c.$$scope={dirty:n,ctx:e}),s.$set(c)},i(e){l||(W(c.$$.fragment,e),W(r.$$.fragment,e),W(s.$$.fragment,e),l=!0)},o(e){B(c.$$.fragment,e),B(r.$$.fragment,e),B(s.$$.fragment,e),l=!1},d(e){F(c,e),e&&$(t),F(r,e),e&&$(n),F(s,e)}}}function Ze(e){let t,n,l,c,r,s,o,a,i,f,h,b,y,w,k,L=location.origin+"",S=e[17].id+"",_=e[17].url+"";const j=new ee({props:{right:!0,block:!0,$$slots:{default:[Ve]},$$scope:{ctx:e}}});return{c(){t=p("tr"),n=p("td"),l=p("a"),c=m(L),r=m("/"),s=m(S),a=g(),i=p("td"),f=p("span"),h=m(_),b=g(),y=p("td"),H(j.$$.fragment),w=g(),v(l,"href",o="/"+e[17].id),v(l,"target","_blank"),v(n,"class","svelte-1gcv88r"),v(f,"class","svelte-1gcv88r"),v(i,"class","svelte-1gcv88r"),v(y,"class","svelte-1gcv88r"),v(t,"class","svelte-1gcv88r")},m(e,o){d(e,t,o),u(t,n),u(n,l),u(l,c),u(l,r),u(l,s),u(t,a),u(t,i),u(i,f),u(f,h),u(t,b),u(t,y),M(j,y,null),u(t,w),k=!0},p(e,t){(!k||8&t)&&S!==(S=e[17].id+"")&&x(s,S),(!k||8&t&&o!==(o="/"+e[17].id))&&v(l,"href",o),(!k||8&t)&&_!==(_=e[17].url+"")&&x(h,_);const n={};1048600&t&&(n.$$scope={dirty:t,ctx:e}),j.$set(n)},i(e){k||(W(j.$$.fragment,e),k=!0)},o(e){B(j.$$.fragment,e),k=!1},d(e){e&&$(t),F(j)}}}function et(e){let t,n,l,c,r,s,o;const a=new je({props:{block:!0,large:!0,label:e[0].id||location.origin+"/"+(e[2].param||""),value:e[2].param||"",invalid:e[0].id,valid:e[1]&&e[1].id==e[2].param,$$slots:{default:[Ke]},$$scope:{ctx:e}}});a.$on("input",e[12]),a.$on("enter",e[13]);let i=e[3],m=[];for(let t=0;t<i.length;t+=1)m[t]=Ze(Ye(e,i,t));const h=e=>B(m[e],1,1,()=>{m[e]=null});return{c(){t=p("table"),n=p("tr"),l=p("th"),H(a.$$.fragment),c=g(),r=p("tr"),r.innerHTML='<th class="svelte-1gcv88r">Link</th> \n      <th class="svelte-1gcv88r">To</th> \n      <th class="svelte-1gcv88r"></th>',s=g();for(let e=0;e<m.length;e+=1)m[e].c();v(l,"colspan","3"),v(l,"class","svelte-1gcv88r"),v(n,"class","svelte-1gcv88r"),v(r,"class","svelte-1gcv88r"),v(t,"class","svelte-1gcv88r")},m(e,i){d(e,t,i),u(t,n),u(n,l),M(a,l,null),u(t,c),u(t,r),u(t,s);for(let e=0;e<m.length;e+=1)m[e].m(t,null);o=!0},p(e,n){const l={};if(5&n&&(l.label=e[0].id||location.origin+"/"+(e[2].param||"")),4&n&&(l.value=e[2].param||""),1&n&&(l.invalid=e[0].id),6&n&&(l.valid=e[1]&&e[1].id==e[2].param),1048583&n&&(l.$$scope={dirty:n,ctx:e}),a.$set(l),152&n){let l;for(i=e[3],l=0;l<i.length;l+=1){const c=Ye(e,i,l);m[l]?(m[l].p(c,n),W(m[l],1)):(m[l]=Ze(c),m[l].c(),W(m[l],1),m[l].m(t,null))}for(J(),l=i.length;l<m.length;l+=1)h(l);R()}},i(e){if(!o){W(a.$$.fragment,e);for(let e=0;e<i.length;e+=1)W(m[e]);o=!0}},o(e){B(a.$$.fragment,e),m=m.filter(Boolean);for(let e=0;e<m.length;e+=1)B(m[e]);o=!1},d(e){e&&$(t),F(a),f(m,e)}}}function tt(e){let t;const n=new xe({props:{$$slots:{default:[et]},$$scope:{ctx:e}}});return{c(){H(n.$$.fragment)},m(e,l){M(n,e,l),t=!0},p(e,[t]){const l={};1048607&t&&(l.$$scope={dirty:t,ctx:e}),n.$set(l)},i(e){t||(W(n.$$.fragment,e),t=!0)},o(e){B(n.$$.fragment,e),t=!1},d(e){F(n,e)}}}function nt(e,t,n){let l,c;s(e,Ae,e=>n(2,l=e)),s(e,De,e=>n(4,c=e));let r=l.param||"",o={},a=null,i=null;const u=async()=>{if(!l.param)return;if(c[l.param])return n(1,i=c[l.param]);const e=await fetch("/get/"+l.param);404==e.status?(n(0,o=await e.json()),clearInterval(a),a=setInterval(()=>n(0,o={}),2e3)):200==e.status&&n(1,i=await e.json())};S(()=>u());const d=e=>{const t=location.origin+"/",n=e.detail.replace(t,"");Ae.go("search",n)},$=e=>{const t=location.origin+"/"+e;navigator.clipboard.writeText(t)};let f;return e.$$.update=()=>{22&e.$$.dirty&&n(3,f=l.param?i&&l.param==i.id?[i]:[]:Object.values(c))},[o,i,l,f,c,u,d,$,a,r,()=>Ae.go("search"),()=>u(),e=>d(e),()=>u(),e=>$(e.id),e=>Ae.go("edit",e.id),e=>De.del(e.id)]}class lt extends Y{constructor(e){super(),X(this,e,nt,tt,r,{})}}function ct(t){return{c:e,m:e,d:e}}function rt(e){let t,n,l,c,r,s=JSON.stringify(e[0],null,2)+"";const o=new Q({props:{small:!0,scrollx:!0,$$slots:{default:[ct]},$$scope:{ctx:e}}});return{c(){H(o.$$.fragment),t=g(),n=p("pre"),l=m(s),n.hidden=c=!1},m(e,c){M(o,e,c),d(e,t,c),d(e,n,c),u(n,l),r=!0},p(e,[t]){const n={};16&t&&(n.$$scope={dirty:t,ctx:e}),o.$set(n),(!r||1&t)&&s!==(s=JSON.stringify(e[0],null,2)+"")&&x(l,s)},i(e){r||(W(o.$$.fragment,e),r=!0)},o(e){B(o.$$.fragment,e),r=!1},d(e){F(o,e),e&&$(t),e&&$(n)}}}function st(e,t,n){let l;return s(e,De,e=>n(0,l=e)),[l]}class ot extends Y{constructor(e){super(),X(this,e,st,rt,r,{})}}function at(t){let n;return{c(){n=p("a"),n.textContent="Fork me!",v(n,"href","https://github.com/ddidwyll/shorty"),v(n,"target","_blank")},m(e,t){d(e,n,t)},p:e,i:e,o:e,d(e){e&&$(n)}}}class it extends Y{constructor(e){super(),X(this,e,null,at,r,{})}}function ut(e){let t,n,l;const c=new re({props:{label:"Add",disabled:!e[0].action,clean:!0}});c.$on("click",e[2]);const r=new re({props:{label:"Search",disabled:"search"===e[0].action,clean:!0}});r.$on("click",e[3]);const s=new re({props:{label:"Help",disabled:"help"===e[0].action,clean:!0}});return s.$on("click",e[4]),{c(){H(c.$$.fragment),t=g(),H(r.$$.fragment),n=g(),H(s.$$.fragment)},m(e,o){M(c,e,o),d(e,t,o),M(r,e,o),d(e,n,o),M(s,e,o),l=!0},p(e,t){const n={};1&t&&(n.disabled=!e[0].action),c.$set(n);const l={};1&t&&(l.disabled="search"===e[0].action),r.$set(l);const o={};1&t&&(o.disabled="help"===e[0].action),s.$set(o)},i(e){l||(W(c.$$.fragment,e),W(r.$$.fragment,e),W(s.$$.fragment,e),l=!0)},o(e){B(c.$$.fragment,e),B(r.$$.fragment,e),B(s.$$.fragment,e),l=!1},d(e){F(c,e),e&&$(t),F(r,e),e&&$(n),F(s,e)}}}function dt(e){let t,n,l,c,r,s=(e[0].action||"Shorty")+"";const o=new ee({props:{right:!0,$$slots:{default:[ut]},$$scope:{ctx:e}}});return{c(){t=p("h1"),n=m(s),l=g(),H(o.$$.fragment),v(t,"class","svelte-1b5h9hz"),r=b(t,"click",e[1])},m(e,r){d(e,t,r),u(t,n),d(e,l,r),M(o,e,r),c=!0},p(e,t){(!c||1&t)&&s!==(s=(e[0].action||"Shorty")+"")&&x(n,s);const l={};33&t&&(l.$$scope={dirty:t,ctx:e}),o.$set(l)},i(e){c||(W(o.$$.fragment,e),c=!0)},o(e){B(o.$$.fragment,e),c=!1},d(e){e&&$(t),e&&$(l),F(o,e),r()}}}function $t(e){let t;const n=new it({});return{c(){H(n.$$.fragment)},m(e,l){M(n,e,l),t=!0},i(e){t||(W(n.$$.fragment,e),t=!0)},o(e){B(n.$$.fragment,e),t=!1},d(e){F(n,e)}}}function ft(e){let t;const n=new lt({});return{c(){H(n.$$.fragment)},m(e,l){M(n,e,l),t=!0},i(e){t||(W(n.$$.fragment,e),t=!0)},o(e){B(n.$$.fragment,e),t=!1},d(e){F(n,e)}}}function pt(e){let t;const n=new ot({});return{c(){H(n.$$.fragment)},m(e,l){M(n,e,l),t=!0},i(e){t||(W(n.$$.fragment,e),t=!0)},o(e){B(n.$$.fragment,e),t=!1},d(e){F(n,e)}}}function mt(e){let t;const n=new Xe({});return{c(){H(n.$$.fragment)},m(e,l){M(n,e,l),t=!0},i(e){t||(W(n.$$.fragment,e),t=!0)},o(e){B(n.$$.fragment,e),t=!1},d(e){F(n,e)}}}function gt(e){let t,n,l,c;const r=[mt,pt,ft,$t],s=[];function o(e,t){return e[0].action?"edit"===e[0].action?1:"search"===e[0].action?2:"help"===e[0].action?3:-1:0}return~(t=o(e))&&(n=s[t]=r[t](e)),{c(){n&&n.c(),l=h()},m(e,n){~t&&s[t].m(e,n),d(e,l,n),c=!0},p(e,c){let a=t;t=o(e),t!==a&&(n&&(J(),B(s[a],1,1,()=>{s[a]=null}),R()),~t?(n=s[t],n||(n=s[t]=r[t](e),n.c()),W(n,1),n.m(l.parentNode,l)):n=null)},i(e){c||(W(n),c=!0)},o(e){B(n),c=!1},d(e){~t&&s[t].d(e),e&&$(l)}}}function ht(e){let t,n,l,c;document.title=t="shorty / "+(e[0].action||"add")+(e[0].param?" / "+e[0].param:"");const r=new fe({props:{$$slots:{default:[dt]},$$scope:{ctx:e}}}),s=new Ne({props:{$$slots:{default:[gt]},$$scope:{ctx:e}}});return{c(){n=g(),H(r.$$.fragment),l=g(),H(s.$$.fragment)},m(e,t){d(e,n,t),M(r,e,t),d(e,l,t),M(s,e,t),c=!0},p(e,[n]){(!c||1&n)&&t!==(t="shorty / "+(e[0].action||"add")+(e[0].param?" / "+e[0].param:""))&&(document.title=t);const l={};33&n&&(l.$$scope={dirty:n,ctx:e}),r.$set(l);const o={};33&n&&(o.$$scope={dirty:n,ctx:e}),s.$set(o)},i(e){c||(W(r.$$.fragment,e),W(s.$$.fragment,e),c=!0)},o(e){B(r.$$.fragment,e),B(s.$$.fragment,e),c=!1},d(e){e&&$(n),F(r,e),e&&$(l),F(s,e)}}}function bt(e,t,n){let l;s(e,Ae,e=>n(0,l=e));return[l,()=>Ae.go(),()=>Ae.go(),()=>Ae.go("search"),()=>Ae.go("help")]}return new class extends Y{constructor(e){super(),X(this,e,bt,ht,r,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
