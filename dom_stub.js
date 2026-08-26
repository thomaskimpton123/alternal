// Minimal DOM/browser stubs so index.html's inline script can execute far enough
// to catch top-level ReferenceErrors / TDZ bugs (the exact class of bug that broke
// this site three times on 2026-08-26) without needing a real browser.
// Used by check.sh — not shipped to the site itself.
class FakeEl {
  constructor(tag){ this.tagName=tag; this.style={}; this.dataset={}; this.classList={add(){},remove(){},toggle(){},contains(){return false;}};
    this.children=[]; this._listeners={}; this.innerHTML='';
    // real <canvas> elements default to 300x150 until width/height are set — matches
    // that so a canvas never read before its explicit sync call still has numbers
    this.width=300; this.height=150; }
  addEventListener(ev,fn){ (this._listeners[ev] ||= []).push(fn); }
  removeEventListener(){}
  appendChild(c){ this.children.push(c); return c; }
  querySelector(){ return new FakeEl('div'); }
  querySelectorAll(){ return []; }
  getBoundingClientRect(){ return {left:0,top:0,width:100,height:100}; }
  getContext(){ return { canvas:this, clearRect(){}, createLinearGradient(){return {addColorStop(){}};}, createRadialGradient(){return {addColorStop(){}};}, fillRect(){}, fillStyle:'' }; }
  get textContent(){ return this._text||''; } set textContent(v){ this._text=v; }
}
global.document = {
  getElementById(id){ return new FakeEl('div'); },
  querySelectorAll(sel){ return sel==='.navlinks span' ? [new FakeEl('span'),new FakeEl('span'),new FakeEl('span')] : []; },
  createElement(tag){ return new FakeEl(tag); },
  addEventListener(){},
  body: new FakeEl('body'),
};
global.window = {
  innerWidth:1000, innerHeight:800, devicePixelRatio:1,
  addEventListener(){}, matchMedia(){ return {matches:false}; },
  AudioContext: function(){ return { decodeAudioData(){ return Promise.resolve({getChannelData(){return new Float32Array(100);}, duration:60}); } }; },
};
global.navigator = {};
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = (fn) => {}; // don't actually recurse
global.fetch = () => Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
global.Audio = function(){ return { addEventListener(){}, play(){}, pause(){}, paused:true }; };
global.THREE = {
  WebGLRenderer: function(){ return { setPixelRatio(){}, setSize(){}, setClearColor(){}, render(){} }; },
  Scene: function(){ return { add(){} }; },
  PerspectiveCamera: function(){ return { position:{set(){}, z:14}, aspect:1, updateProjectionMatrix(){} }; },
  Group: function(){ return { add(){}, rotation:{x:0,y:0}, scale:{set(){}} }; },
  Color: function(hex){ this.r=1;this.g=1;this.b=1; this.clone=()=>this; this.lerp=()=>this; },
  BufferGeometry: function(){ return { setAttribute(){} }; },
  BufferAttribute: function(){ return {}; },
  CanvasTexture: function(){ return {}; },
  PointsMaterial: function(){ return { size:0.16 }; },
  Points: function(){ return {}; },
  AdditiveBlending: 1,
};
global.location = { hash: '', pathname: '/', search: '' };
global.history = { pushState(){} };
global.localStorage = { getItem(){return null;}, setItem(){}, removeItem(){} };
