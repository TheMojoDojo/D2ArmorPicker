(()=>{"use strict";var e,r,t,o={142:(e,r,t)=>{var o=t(304),s=(()=>(function(e){e[e.HELMET_ID=0]="HELMET_ID",e[e.GAUNTLET_ID=1]="GAUNTLET_ID",e[e.CHEST_ID=2]="CHEST_ID",e[e.LEG_ID=3]="LEG_ID",e[e.STATS_MOBILITY_RESILIENCE=4]="STATS_MOBILITY_RESILIENCE",e[e.STATS_RECOVERY_DISCIPLINE=5]="STATS_RECOVERY_DISCIPLINE",e[e.STATS_INTELLECT_STRENGTH=6]="STATS_INTELLECT_STRENGTH",e[e.EXOTIC_ID_LOBYTE=7]="EXOTIC_ID_LOBYTE",e[e.EXOTIC_ID_HIBYTE=8]="EXOTIC_ID_HIBYTE",e[e.MASTERWORK_NUMBER=9]="MASTERWORK_NUMBER",e[e.ELEMENTAL_AFFINITIES=10]="ELEMENTAL_AFFINITIES",e[e.WIDTH=11]="WIDTH"}(s||(s={})),s))(),n=(()=>(function(e){e[e.PERMUTATION_ID_BYTE0=0]="PERMUTATION_ID_BYTE0",e[e.PERMUTATION_ID_BYTE1=1]="PERMUTATION_ID_BYTE1",e[e.PERMUTATION_ID_BYTE2=2]="PERMUTATION_ID_BYTE2",e[e.PERMUTATION_ID_BYTE3=3]="PERMUTATION_ID_BYTE3",e[e.USED_MOD1=4]="USED_MOD1",e[e.USED_MOD2=5]="USED_MOD2",e[e.USED_MOD3=6]="USED_MOD3",e[e.USED_MOD4=7]="USED_MOD4",e[e.USED_MOD5=8]="USED_MOD5",e[e.WIDTH=9]="WIDTH"}(n||(n={})),n))();addEventListener("message",function(){var e=(0,o.Z)(function*({data:e}){console.group("WebWorker: Results Builder"),console.time("WebWorker: Results Builder");let r=e.config,o=new Uint16Array(e.permutations);console.group("Input"),console.debug("config",r),console.debug("mods",r.enabledMods),console.groupEnd(),console.time("split permutations in packages of size 5e5");let i=[];for(let t=0;t<o.length/s.WIDTH;t+=5e5)i.push({buffer:Uint16Array.from(o.subarray(t*s.WIDTH,(t+5e5)*s.WIDTH)).buffer,startPosition:t});console.timeEnd("split permutations in packages of size 5e5"),console.time("Get results from webworker helpers");let T=[];for(let s=0;s<i.length;s+=6){console.log(s,i.length);let e=i.slice(s,s+6);T=T.concat(yield Promise.all(e.map(e=>new Promise(o=>{const s=new Worker(t.tu(new URL(t.p+t.u(118),t.b)));s.onmessage=({data:e})=>{o(e)},s.postMessage({permutations:e.buffer,startPosition:e.startPosition,config:r},[e.buffer])}))))}console.timeEnd("Get results from webworker helpers");let E=[0,0,0,0,0,0],a=new Set,l=new Set,u=T.reduce((e,r)=>e+r.buffer.byteLength,0);const I=new ArrayBuffer(u),_=new Uint8Array(I);let f=0;for(let t of T){let e=new Uint8Array(t.buffer);_.set(e,f),f+=e.length;for(let r=0;r<6;r++)t.maximumPossibleTiers[r]>E[r]&&(E[r]=t.maximumPossibleTiers[r]);a=new Set([...a,...t.statCombo3x100]),l=new Set([...l,...t.statCombo4x100])}console.log(`Sending ${_.length/n.WIDTH} results in ${u} bytes.`,_),console.timeEnd("WebWorker: Results Builder"),console.groupEnd(),postMessage({view:_.buffer,allArmorPermutations:e.permutations,maximumPossibleTiers:E,statCombo3x100:Array.from(a).sort(),statCombo4x100:Array.from(l).sort()},[_.buffer,e.permutations])});return function(r){return e.apply(this,arguments)}}())}},s={};function n(e){var r=s[e];if(void 0!==r)return r.exports;var t=s[e]={exports:{}};return o[e](t,t.exports,n),t.exports}n.m=o,n.x=()=>{var e=n.O(void 0,[592],()=>n(142));return n.O(e)},e=[],n.O=(r,t,o,s)=>{if(!t){var i=1/0;for(a=0;a<e.length;a++){for(var[t,o,s]=e[a],T=!0,E=0;E<t.length;E++)(!1&s||i>=s)&&Object.keys(n.O).every(e=>n.O[e](t[E]))?t.splice(E--,1):(T=!1,s<i&&(i=s));T&&(e.splice(a--,1),r=o())}return r}s=s||0;for(var a=e.length;a>0&&e[a-1][2]>s;a--)e[a]=e[a-1];e[a]=[t,o,s]},n.d=(e,r)=>{for(var t in r)n.o(r,t)&&!n.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:r[t]})},n.f={},n.e=e=>Promise.all(Object.keys(n.f).reduce((r,t)=>(n.f[t](e,r),r),[])),n.u=e=>(592===e?"common":e)+"."+{118:"4a61680628f9930c0926",592:"5f72fd69276d7fec5cb1"}[e]+".js",n.miniCssF=e=>{},n.o=(e,r)=>Object.prototype.hasOwnProperty.call(e,r),n.tu=e=>(void 0===r&&(r={createScriptURL:e=>e},"undefined"!=typeof trustedTypes&&trustedTypes.createPolicy&&(r=trustedTypes.createPolicy("angular#bundler",r))),r.createScriptURL(e)),n.p="",(()=>{n.b=self.location+"";var e={142:1};n.f.i=(r,t)=>{e[r]||importScripts(n.tu(n.p+n.u(r)))};var r=self.webpackChunkd2_armor_picker=self.webpackChunkd2_armor_picker||[],t=r.push.bind(r);r.push=r=>{var[o,s,i]=r;for(var T in s)n.o(s,T)&&(n.m[T]=s[T]);for(i&&i(n);o.length;)e[o.pop()]=1;t(r)}})(),t=n.x,n.x=()=>n.e(592).then(t),n.x()})();