import * as THREE from './vendor/three.module.js';

// Decorative only: no document content or interaction is drawn on this canvas.
const host=document.createElement('div');
host.id='particle-world';host.setAttribute('aria-hidden','true');
document.body.prepend(host);
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const compact=matchMedia('(max-width: 700px)');
let renderer;
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});}catch{host.dataset.state='fallback';}
if(renderer){
  host.append(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,100);
  camera.position.z=14;
  const field=new THREE.Group();scene.add(field);
  const count=compact.matches?230:850;
  host.dataset.particles=String(count);
  const positions=new Float32Array(count*3),colors=new Float32Array(count*3),sizes=new Float32Array(count),phases=new Float32Array(count);
  let seed=71;const random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  const palette=[new THREE.Color('#ff9933'),new THREE.Color('#e2eee7'),new THREE.Color('#60b578')];
  for(let i=0;i<count;i++){
    positions[i*3]=(random()-.5)*36;
    positions[i*3+1]=(random()-.5)*23;
    positions[i*3+2]=-random()*13;
    const color=palette[i%3];color.toArray(colors,i*3);
    sizes[i]=random()<.12?5+random()*3:1.8+random()*2.7;
    phases[i]=random()*Math.PI*2;
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  geo.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));
  geo.setAttribute('aPhase',new THREE.BufferAttribute(phases,1));
  const uniforms={uTime:{value:0},uOpacity:{value:.78},uPixelRatio:{value:1},uPointer:{value:new THREE.Vector2(99,99)}};
  const material=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,vertexColors:true,blending:THREE.AdditiveBlending,uniforms,
    vertexShader:`attribute float aSize;attribute float aPhase;uniform float uTime;uniform float uPixelRatio;uniform vec2 uPointer;varying vec3 vColor;varying float vPulse;
      void main(){vec3 p=position;p.x+=sin(uTime*.10+aPhase)*.34;p.y+=sin(uTime*.13+aPhase*1.4)*.45;
      vec4 screen=projectionMatrix*modelViewMatrix*vec4(p,1.);vec2 delta=screen.xy/screen.w-uPointer;
      float influence=exp(-dot(delta,delta)*16.);p.xy+=normalize(delta+vec2(.0001))*.48*influence;
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*uPixelRatio*(17./-mv.z),1.,17.);
      vColor=color+vec3(influence*.18);vPulse=.55+.45*sin(uTime*.45+aPhase);}`,
    fragmentShader:`uniform float uOpacity;varying vec3 vColor;varying float vPulse;
      void main(){float d=length(gl_PointCoord-vec2(.5))*2.;if(d>1.)discard;
      float core=1.-smoothstep(.05,.55,d);float halo=pow(1.-d,2.)*.3;
      gl_FragColor=vec4(vColor,(core+halo)*uOpacity*(.55+.45*vPulse));}`
  });
  field.add(new THREE.Points(geo,material));
  // A sparse constellation references connections and routes without covering text.
  const links=[];const networkCount=compact.matches?24:80;
  for(let a=0;a<networkCount;a++)for(let b=a+1;b<networkCount;b++){
    const ia=a*3,ib=b*3;
    const d=Math.hypot(positions[ia]-positions[ib],positions[ia+1]-positions[ib+1],positions[ia+2]-positions[ib+2]);
    if(d<4.3)links.push(...positions.slice(ia,ia+3),...positions.slice(ib,ib+3));
  }
  const lineGeo=new THREE.BufferGeometry();lineGeo.setAttribute('position',new THREE.Float32BufferAttribute(links,3));
  const lineMaterial=new THREE.LineBasicMaterial({color:'#83b99d',transparent:true,opacity:.12,depthWrite:false});
  field.add(new THREE.LineSegments(lineGeo,lineMaterial));
  const rings=new THREE.Group();rings.position.set(10,-2,-7);scene.add(rings);
  const ringMaterial=new THREE.LineBasicMaterial({color:'#d69552',transparent:true,opacity:.095,depthWrite:false});
  const ringGeos=[];
  for(let i=0;i<3;i++){
    const points=[];for(let j=0;j<160;j++){const angle=j/160*Math.PI*2;points.push(new THREE.Vector3(Math.cos(angle)*(5+i*.7),Math.sin(angle)*(5+i*.7),0));}
    const geometry=new THREE.BufferGeometry().setFromPoints(points);ringGeos.push(geometry);
    const ring=new THREE.LineLoop(geometry,ringMaterial);ring.rotation.set(.5+i*.5,.5+i*.7,i*.35);rings.add(ring);
  }
  // A translucent geometric satellite follows a fine pointer, behind all content.
  const solid=new THREE.IcosahedronGeometry(.62,1);
  const satelliteGeo=new THREE.WireframeGeometry(solid);solid.dispose();
  const satelliteMaterial=new THREE.LineBasicMaterial({color:'#ffb477',transparent:true,opacity:.19,depthWrite:false});
  const satellite=new THREE.LineSegments(satelliteGeo,satelliteMaterial);satellite.visible=false;scene.add(satellite);
  let targetX=0,targetY=0,scroll=0,scrollTarget=0,scrollPhase=0,time=0,last=0,raf=0,paused=false,disposed=false,manualMotion=false,pointerActive=false;
  const pointerTarget=new THREE.Vector2(99,99);
  const motionAllowed=()=>!reduce.matches||manualMotion;
  try{paused=localStorage.getItem('rw-dsa-particles')==='paused';}catch{}
  const toggle=document.createElement('button');toggle.id='ambience-toggle';toggle.type='button';
  document.body.append(toggle);
  function label(){const staticPreference=reduce.matches&&!manualMotion;toggle.dataset.labelKey=staticPreference?'enable':paused?'resume':'pause';toggle.textContent=staticPreference?'✦ Enable motion':paused?'✦ Resume ambience':'Ⅱ Pause ambience';toggle.setAttribute('aria-pressed',String(!paused&&!staticPreference));toggle.setAttribute('aria-label',staticPreference?'Enable background animation':paused?'Resume background animation':'Pause background animation');}
  function draw(){renderer.render(scene,camera);host.dataset.state='ready';}
  function frame(now){raf=0;if(disposed||paused||document.hidden||!motionAllowed())return;
    raf=requestAnimationFrame(frame);if(now-last<33)return;
    const dt=Math.min((now-(last||now))/1000,.08);last=now;time+=dt;uniforms.uTime.value=time;
    camera.position.x+=(targetX-camera.position.x)*.025;camera.position.y+=(targetY-camera.position.y)*.025;
    scrollPhase+=(scrollTarget-scrollPhase)*.035;
    field.rotation.y=Math.sin(time*.035)*.065+scrollPhase*.12;field.rotation.z=Math.sin(time*.025)*.025-scrollPhase*.045;
    field.position.y+=(scroll-field.position.y)*.035;rings.rotation.z=time*.018+scrollPhase*.8;
    rings.rotation.y=scrollPhase*.38;rings.position.x=10-scrollPhase*3;
    satellite.visible=pointerActive&&!compact.matches;
    if(pointerActive){
      uniforms.uPointer.value.lerp(pointerTarget,.07);
      const half=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*16;
      satellite.position.x+=(pointerTarget.x*half*camera.aspect-satellite.position.x)*.035;
      satellite.position.y+=(pointerTarget.y*half-satellite.position.y)*.035;satellite.position.z=-2;
      satellite.rotation.set(time*.1,time*.17,scrollPhase*.5);
    }
    draw();
  }
  function resume(){cancelAnimationFrame(raf);raf=0;last=0;const running=!paused&&!document.hidden&&motionAllowed();host.dataset.motion=running?'running':'static';if(running)raf=requestAnimationFrame(frame);else draw();}
  function resize(){const ratio=Math.min(devicePixelRatio||1,compact.matches?1.25:1.5);renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight);uniforms.uPixelRatio.value=ratio;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();draw();}
  function theme(){const light=document.body.classList.contains('light-mode');uniforms.uOpacity.value=light?.42:.78;lineMaterial.opacity=light?.09:.12;ringMaterial.opacity=light?.055:.095;material.blending=light?THREE.NormalBlending:THREE.AdditiveBlending;material.needsUpdate=true;draw();}
  toggle.onclick=()=>{if(reduce.matches&&!manualMotion){manualMotion=true;paused=false;}else paused=!paused;try{localStorage.setItem('rw-dsa-particles',paused?'paused':'playing');}catch{}label();resume();};
  const move=e=>{if(e.pointerType==='touch'||compact.matches)return;pointerActive=true;pointerTarget.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);targetX=pointerTarget.x*.45;targetY=pointerTarget.y*.325;};
  const leave=()=>{pointerActive=false;targetX=targetY=0;uniforms.uPointer.value.set(99,99);satellite.visible=false;};
  const onScroll=()=>{scroll=-Math.min(scrollY,7000)*.00013;scrollTarget=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);};
  const onVisibility=()=>resume();
  const onReduce=()=>{manualMotion=false;label();resume();};
  addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',leave);addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',onVisibility);reduce.addEventListener('change',onReduce);
  const themeWatch=new MutationObserver(theme);themeWatch.observe(document.body,{attributes:true,attributeFilter:['class']});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);host.dataset.state='fallback';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{resize();theme();resume();});
  label();resize();theme();onScroll();onReduce();
  addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;cancelAnimationFrame(raf);themeWatch.disconnect();geo.dispose();material.dispose();lineGeo.dispose();lineMaterial.dispose();ringGeos.forEach(g=>g.dispose());ringMaterial.dispose();satelliteGeo.dispose();satelliteMaterial.dispose();renderer.dispose();},{once:true});
}
