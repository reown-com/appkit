(function(p,m){typeof exports=="object"&&typeof module<"u"?m(exports):typeof define=="function"&&define.amd?define(["exports"],m):(p=typeof globalThis<"u"?globalThis:p||self,m(p["@web3modal/core"]={}))})(this,function(p){"use strict";/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const m=window.ShadowRoot&&(window.ShadyCSS===void 0||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,R=Symbol(),q=new WeakMap;class K{constructor(t,e,i){if(this._$cssResult$=!0,i!==R)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(m&&t===void 0){const i=e!==void 0&&e.length===1;i&&(t=q.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&q.set(e,t))}return t}toString(){return this.cssText}}const g=n=>new K(typeof n=="string"?n:n+"",void 0,R),z=(n,...t)=>{const e=n.length===1?n[0]:t.reduce((i,s,r)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+n[r+1],n[0]);return new K(e,n,R)},$t=(n,t)=>{m?n.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):t.forEach(e=>{const i=document.createElement("style"),s=window.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=e.cssText,n.appendChild(i)})},J=m?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return g(e)})(n):n;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var B;const F=window.trustedTypes,ft=F?F.emptyScript:"",G=window.reactiveElementPolyfillSupport,L={toAttribute(n,t){switch(t){case Boolean:n=n?ft:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let e=n;switch(t){case Boolean:e=n!==null;break;case Number:e=n===null?null:Number(n);break;case Object:case Array:try{e=JSON.parse(n)}catch{e=null}}return e}},Q=(n,t)=>t!==n&&(t==t||n==n),j={attribute:!0,type:String,converter:L,reflect:!1,hasChanged:Q};class y extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(t){var e;(e=this.h)!==null&&e!==void 0||(this.h=[]),this.h.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((e,i)=>{const s=this._$Ep(i,e);s!==void 0&&(this._$Ev.set(s,i),t.push(s))}),t}static createProperty(t,e=j){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i=typeof t=="symbol"?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);s!==void 0&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const r=this[t];this[e]=s,this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||j}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,i=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const s of i)this.createProperty(s,e[s])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const s of i)e.unshift(J(s))}else t!==void 0&&e.push(J(t));return e}static _$Ep(t,e){const i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(t=this.constructor.h)===null||t===void 0||t.forEach(e=>e(this))}addController(t){var e,i;((e=this._$ES)!==null&&e!==void 0?e:this._$ES=[]).push(t),this.renderRoot!==void 0&&this.isConnected&&((i=t.hostConnected)===null||i===void 0||i.call(t))}removeController(t){var e;(e=this._$ES)===null||e===void 0||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])})}createRenderRoot(){var t;const e=(t=this.shadowRoot)!==null&&t!==void 0?t:this.attachShadow(this.constructor.shadowRootOptions);return $t(e,this.constructor.elementStyles),e}connectedCallback(){var t;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$ES)===null||t===void 0||t.forEach(e=>{var i;return(i=e.hostConnected)===null||i===void 0?void 0:i.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$ES)===null||t===void 0||t.forEach(e=>{var i;return(i=e.hostDisconnected)===null||i===void 0?void 0:i.call(e)})}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=j){var s,r;const o=this.constructor._$Ep(t,i);if(o!==void 0&&i.reflect===!0){const d=((r=(s=i.converter)===null||s===void 0?void 0:s.toAttribute)!==null&&r!==void 0?r:L.toAttribute)(e,i.type);this._$El=t,d==null?this.removeAttribute(o):this.setAttribute(o,d),this._$El=null}}_$AK(t,e){var i,s;const r=this.constructor,o=r._$Ev.get(t);if(o!==void 0&&this._$El!==o){const d=r.getPropertyOptions(o),l=d.converter,a=(s=(i=l?.fromAttribute)!==null&&i!==void 0?i:typeof l=="function"?l:null)!==null&&s!==void 0?s:L.fromAttribute;this._$El=o,this[o]=a(e,d.type),this._$El=null}}requestUpdate(t,e,i){let s=!0;t!==void 0&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||Q)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),i.reflect===!0&&this._$El!==t&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((s,r)=>this[r]=s),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),(t=this._$ES)===null||t===void 0||t.forEach(s=>{var r;return(r=s.hostUpdate)===null||r===void 0?void 0:r.call(s)}),this.update(i)):this._$Ek()}catch(s){throw e=!1,this._$Ek(),s}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;(e=this._$ES)===null||e===void 0||e.forEach(i=>{var s;return(s=i.hostUpdated)===null||s===void 0?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){this._$EC!==void 0&&(this._$EC.forEach((e,i)=>this._$EO(i,this[i],e)),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}y.finalized=!0,y.elementProperties=new Map,y.elementStyles=[],y.shadowRootOptions={mode:"open"},G?.({ReactiveElement:y}),((B=globalThis.reactiveElementVersions)!==null&&B!==void 0?B:globalThis.reactiveElementVersions=[]).push("1.3.4");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var D;const A=globalThis.trustedTypes,X=A?A.createPolicy("lit-html",{createHTML:n=>n}):void 0,v=`lit$${(Math.random()+"").slice(9)}$`,Y="?"+v,gt=`<${Y}>`,w=document,C=(n="")=>w.createComment(n),P=n=>n===null||typeof n!="object"&&typeof n!="function",tt=Array.isArray,vt=n=>tt(n)||typeof n?.[Symbol.iterator]=="function",k=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,et=/-->/g,it=/>/g,_=RegExp(`>|[ 	
\f\r](?:([^\\s"'>=/]+)([ 	
\f\r]*=[ 	
\f\r]*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),st=/'/g,nt=/"/g,ot=/^(?:script|style|textarea|title)$/i,mt=n=>(t,...e)=>({_$litType$:n,strings:t,values:e}),rt=mt(1),E=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),lt=new WeakMap,_t=(n,t,e)=>{var i,s;const r=(i=e?.renderBefore)!==null&&i!==void 0?i:t;let o=r._$litPart$;if(o===void 0){const d=(s=e?.renderBefore)!==null&&s!==void 0?s:null;r._$litPart$=o=new U(t.insertBefore(C(),d),d,void 0,e??{})}return o._$AI(n),o},S=w.createTreeWalker(w,129,null,!1),bt=(n,t)=>{const e=n.length-1,i=[];let s,r=t===2?"<svg>":"",o=k;for(let l=0;l<e;l++){const a=n[l];let f,h,c=-1,$=0;for(;$<a.length&&(o.lastIndex=$,h=o.exec(a),h!==null);)$=o.lastIndex,o===k?h[1]==="!--"?o=et:h[1]!==void 0?o=it:h[2]!==void 0?(ot.test(h[2])&&(s=RegExp("</"+h[2],"g")),o=_):h[3]!==void 0&&(o=_):o===_?h[0]===">"?(o=s??k,c=-1):h[1]===void 0?c=-2:(c=o.lastIndex-h[2].length,f=h[1],o=h[3]===void 0?_:h[3]==='"'?nt:st):o===nt||o===st?o=_:o===et||o===it?o=k:(o=_,s=void 0);const O=o===_&&n[l+1].startsWith("/>")?" ":"";r+=o===k?a+gt:c>=0?(i.push(f),a.slice(0,c)+"$lit$"+a.slice(c)+v+O):a+v+(c===-2?(i.push(void 0),l):O)}const d=r+(n[e]||"<?>")+(t===2?"</svg>":"");if(!Array.isArray(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return[X!==void 0?X.createHTML(d):d,i]};class T{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0;const d=t.length-1,l=this.parts,[a,f]=bt(t,e);if(this.el=T.createElement(a,i),S.currentNode=this.el.content,e===2){const h=this.el.content,c=h.firstChild;c.remove(),h.append(...c.childNodes)}for(;(s=S.nextNode())!==null&&l.length<d;){if(s.nodeType===1){if(s.hasAttributes()){const h=[];for(const c of s.getAttributeNames())if(c.endsWith("$lit$")||c.startsWith(v)){const $=f[o++];if(h.push(c),$!==void 0){const O=s.getAttribute($.toLowerCase()+"$lit$").split(v),M=/([.?@])?(.*)/.exec($);l.push({type:1,index:r,name:M[2],strings:O,ctor:M[1]==="."?At:M[1]==="?"?Et:M[1]==="@"?St:N})}else l.push({type:6,index:r})}for(const c of h)s.removeAttribute(c)}if(ot.test(s.tagName)){const h=s.textContent.split(v),c=h.length-1;if(c>0){s.textContent=A?A.emptyScript:"";for(let $=0;$<c;$++)s.append(h[$],C()),S.nextNode(),l.push({type:2,index:++r});s.append(h[c],C())}}}else if(s.nodeType===8)if(s.data===Y)l.push({type:2,index:r});else{let h=-1;for(;(h=s.data.indexOf(v,h+1))!==-1;)l.push({type:7,index:r}),h+=v.length-1}r++}}static createElement(t,e){const i=w.createElement("template");return i.innerHTML=t,i}}function x(n,t,e=n,i){var s,r,o,d;if(t===E)return t;let l=i!==void 0?(s=e._$Cl)===null||s===void 0?void 0:s[i]:e._$Cu;const a=P(t)?void 0:t._$litDirective$;return l?.constructor!==a&&((r=l?._$AO)===null||r===void 0||r.call(l,!1),a===void 0?l=void 0:(l=new a(n),l._$AT(n,e,i)),i!==void 0?((o=(d=e)._$Cl)!==null&&o!==void 0?o:d._$Cl=[])[i]=l:e._$Cu=l),l!==void 0&&(t=x(n,l._$AS(n,t.values),l,i)),t}class yt{constructor(t,e){this.v=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}p(t){var e;const{el:{content:i},parts:s}=this._$AD,r=((e=t?.creationScope)!==null&&e!==void 0?e:w).importNode(i,!0);S.currentNode=r;let o=S.nextNode(),d=0,l=0,a=s[0];for(;a!==void 0;){if(d===a.index){let f;a.type===2?f=new U(o,o.nextSibling,this,t):a.type===1?f=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(f=new xt(o,this,t)),this.v.push(f),a=s[++l]}d!==a?.index&&(o=S.nextNode(),d++)}return r}m(t){let e=0;for(const i of this.v)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class U{constructor(t,e,i,s){var r;this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$C_=(r=s?.isConnected)===null||r===void 0||r}get _$AU(){var t,e;return(e=(t=this._$AM)===null||t===void 0?void 0:t._$AU)!==null&&e!==void 0?e:this._$C_}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=x(this,t,e),P(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==E&&this.T(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.k(t):vt(t)?this.S(t):this.T(t)}j(t,e=this._$AB){return this._$AA.parentNode.insertBefore(t,e)}k(t){this._$AH!==t&&(this._$AR(),this._$AH=this.j(t))}T(t){this._$AH!==u&&P(this._$AH)?this._$AA.nextSibling.data=t:this.k(w.createTextNode(t)),this._$AH=t}$(t){var e;const{values:i,_$litType$:s}=t,r=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=T.createElement(s.h,this.options)),s);if(((e=this._$AH)===null||e===void 0?void 0:e._$AD)===r)this._$AH.m(i);else{const o=new yt(r,this),d=o.p(this.options);o.m(i),this.k(d),this._$AH=o}}_$AC(t){let e=lt.get(t.strings);return e===void 0&&lt.set(t.strings,e=new T(t)),e}S(t){tt(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new U(this.j(C()),this.j(C()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for((i=this._$AP)===null||i===void 0||i.call(this,!1,!0,e);t&&t!==this._$AB;){const s=t.nextSibling;t.remove(),t=s}}setConnected(t){var e;this._$AM===void 0&&(this._$C_=t,(e=this._$AP)===null||e===void 0||e.call(this,t))}}class N{constructor(t,e,i,s,r){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=u}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const r=this.strings;let o=!1;if(r===void 0)t=x(this,t,e,0),o=!P(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else{const d=t;let l,a;for(t=r[0],l=0;l<r.length-1;l++)a=x(this,d[i+l],e,l),a===E&&(a=this._$AH[l]),o||(o=!P(a)||a!==this._$AH[l]),a===u?t=u:t!==u&&(t+=(a??"")+r[l+1]),this._$AH[l]=a}o&&!s&&this.P(t)}P(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class At extends N{constructor(){super(...arguments),this.type=3}P(t){this.element[this.name]=t===u?void 0:t}}const wt=A?A.emptyScript:"";class Et extends N{constructor(){super(...arguments),this.type=4}P(t){t&&t!==u?this.element.setAttribute(this.name,wt):this.element.removeAttribute(this.name)}}class St extends N{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){var i;if((t=(i=x(this,t,e,0))!==null&&i!==void 0?i:u)===E)return;const s=this._$AH,r=t===u&&s!==u||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==u&&(s===u||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;typeof this._$AH=="function"?this._$AH.call((i=(e=this.options)===null||e===void 0?void 0:e.host)!==null&&i!==void 0?i:this.element,t):this._$AH.handleEvent(t)}}class xt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){x(this,t)}}const at=window.litHtmlPolyfillSupport;at?.(T,U),((D=globalThis.litHtmlVersions)!==null&&D!==void 0?D:globalThis.litHtmlVersions=[]).push("2.2.7");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var I,W;class H extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return(t=(e=this.renderOptions).renderBefore)!==null&&t!==void 0||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=_t(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)===null||t===void 0||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)===null||t===void 0||t.setConnected(!1)}render(){return E}}H.finalized=!0,H._$litElement$=!0,(I=globalThis.litElementHydrateSupport)===null||I===void 0||I.call(globalThis,{LitElement:H});const ht=globalThis.litElementPolyfillSupport;ht?.({LitElement:H}),((W=globalThis.litElementVersions)!==null&&W!==void 0?W:globalThis.litElementVersions=[]).push("3.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ct=n=>t=>typeof t=="function"?((e,i)=>(window.customElements.define(e,i),i))(n,t):((e,i)=>{const{kind:s,elements:r}=i;return{kind:s,elements:r,finisher(o){window.customElements.define(e,o)}}})(n,t);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Pt=(n,t)=>t.kind==="method"&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(e){e.createProperty(t.key,n)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){typeof t.initializer=="function"&&(this[t.key]=t.initializer.call(this))},finisher(e){e.createProperty(t.key,n)}};function dt(n){return(t,e)=>e!==void 0?((i,s,r)=>{s.constructor.createProperty(r,i)})(n,t,e):Pt(n,t)}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var V;((V=window.HTMLSlotElement)===null||V===void 0?void 0:V.prototype.assignedElements)!=null;var kt=rt`
  <svg width="28" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#a)">
      <path
        d="M7.386 6.482c3.653-3.576 9.575-3.576 13.228 0l.44.43a.451.451 0 0 1 0 .648L19.55 9.033a.237.237 0 0 1-.33 0l-.606-.592c-2.548-2.496-6.68-2.496-9.228 0l-.648.634a.237.237 0 0 1-.33 0L6.902 7.602a.451.451 0 0 1 0-.647l.483-.473Zm16.338 3.046 1.339 1.31a.451.451 0 0 1 0 .648l-6.035 5.909a.475.475 0 0 1-.662 0L14.083 13.2a.119.119 0 0 0-.166 0l-4.283 4.194a.475.475 0 0 1-.662 0l-6.035-5.91a.451.451 0 0 1 0-.647l1.338-1.31a.475.475 0 0 1 .662 0l4.283 4.194c.046.044.12.044.166 0l4.283-4.194a.475.475 0 0 1 .662 0l4.283 4.194c.046.044.12.044.166 0l4.283-4.194a.475.475 0 0 1 .662 0Z"
        fill="#000000"
      />
    </g>
    <defs>
      <clipPath id="a"><path fill="#ffffff" d="M0 0h28v20H0z" /></clipPath>
    </defs>
  </svg>
`;function Tt(){return z`
    .w3m-font {
      font-style: normal;
      font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu,
        'Helvetica Neue', sans-serif;
      font-feature-settings: 'case' on;
    }

    .w3m-font-xxsmall-bold {
      font-weight: 700;
      font-size: 10px;
      line-height: 12px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .w3m-font-xsmall-normal {
      font-weight: 600;
      font-size: 12px;
      line-height: 14px;
      letter-spacing: -0.03em;
    }

    .w3m-font-small-thin {
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
      letter-spacing: -0.03em;
    }

    .w3m-font-small-bold {
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
      letter-spacing: -0.03em;
    }

    .w3m-font-medium-thin {
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: -0.03em;
    }

    .w3m-font-medium-normal {
      font-weight: 600;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: -0.03em;
    }

    .w3m-font-medium-bold {
      font-weight: 700;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: -0.03em;
    }

    .w3m-font-large-bold {
      font-weight: 700;
      font-size: 20px;
      line-height: 24px;
      letter-spacing: -0.05em;
    }
  `}var Ut=z`
  *,
  *::after,
  *::before {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-style: normal;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: antialiased;
  }
`;function b(n=1){return{light:{foreground:{accent:`rgba(51, 150, 255, ${n})`,inverse:`rgba(255, 255, 255, ${n})`,1:`rgba(20, 20, 20, ${n})`,2:`rgba(121, 134, 134, ${n})`,3:`rgba(158, 169, 169, ${n})`},background:{accent:`rgba(232, 242, 252, ${n})`,1:`rgba(255, 255, 255, ${n})`,2:`rgba(241, 243, 243, ${n})`,3:`rgba(228, 231, 231, ${n})`},overlay:{thin:"rgba(0, 0, 0, 0.1)",thick:"rgba(0, 0, 0, 0.4)"}},dark:{foreground:{accent:`rgba(71, 161, 255, ${n})`,inverse:`rgba(255, 255, 255, ${n})`,1:`rgba(228, 231, 231, ${n})`,2:`rgba(148, 158, 158, ${n})`,3:`rgba(110, 119, 119, ${n})`},background:{accent:`rgba(21, 38, 55, ${n})`,1:`rgba(20, 20, 20, ${n})`,2:`rgba(39, 42, 42, ${n})`,3:`rgba(59, 64, 64, ${n})`},overlay:{thin:"rgba(0, 0, 0, 0.1)",thick:"rgba(0, 0, 0, 0.4)"}}}}const Ht=g(b().light.foreground.accent),Nt=g(b().dark.foreground.accent),Ot=g(b().light.background[3]),Mt=g(b().dark.background[3]),ct=g(b().light.foreground.inverse),ut=g(b().light.foreground[3]),pt=g(b().dark.foreground[3]);var Rt=z`
  button {
    border: none;
    transition: 0.2s filter ease-in-out;
    padding: 0 15px 2px;
    height: 40px;
    border-radius: 10px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${ct};
  }

  button:disabled {
    cursor: not-allowed;
  }

  svg {
    width: 28px;
    height: 20px;
    margin-right: 3px;
    margin-left: -5px;
  }

  svg path {
    fill: ${ct};
  }

  span {
    padding-top: 1px;
  }

  @media (prefers-color-scheme: dark) {
    button {
      background-color: ${Nt};
    }

    button:hover {
      filter: brightness(110%);
    }

    button:active {
      filter: brightness(120%);
    }

    button:disabled {
      background-color: ${Mt};
      color: ${pt};
    }

    button:disabled svg path {
      fill: ${pt};
    }
  }

  @media (prefers-color-scheme: light) {
    button {
      background-color: ${Ht};
    }

    button:hover {
      filter: brightness(90%);
    }

    button:active {
      filter: brightness(80%);
    }

    button:disabled {
      background-color: ${Ot};
      color: ${ut};
    }

    button:disabled svg path {
      fill: ${ut};
    }
  }
`,zt=Object.defineProperty,Bt=Object.getOwnPropertyDescriptor,Z=(n,t,e,i)=>{for(var s=i>1?void 0:i?Bt(t,e):t,r=n.length-1,o;r>=0;r--)(o=n[r])&&(s=(i?o(t,e,s):o(s))||s);return i&&s&&zt(t,e,s),s};p.ConnectButtonWC=class extends H{constructor(){super(...arguments),this.label="Connect Wallet",this.icon=!0}iconTemplate(){return this.icon?kt:null}render(){return rt`
      <button class="w3m-font w3m-font-medium-normal">
        ${this.iconTemplate()}
        <span>${this.label}</span>
      </button>
    `}},p.ConnectButtonWC.styles=[Ut,Tt(),Rt],Z([dt({type:String})],p.ConnectButtonWC.prototype,"label",2),Z([dt({type:Boolean})],p.ConnectButtonWC.prototype,"icon",2),p.ConnectButtonWC=Z([Ct("connect-button")],p.ConnectButtonWC),Object.defineProperty(p,"__esModule",{value:!0})});
//# sourceMappingURL=index.umd.js.map
