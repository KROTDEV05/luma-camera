// Original, physically inspired creative rendering. No measured-film or sensor claims.
const VERTEX=`attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=(a_position+1.0)*0.5;gl_Position=vec4(a_position,0.0,1.0);}`;
const FRAGMENT=`precision highp float;
varying vec2 v_uv;uniform sampler2D u_source;uniform sampler2D u_double;
uniform vec4 u_crop;uniform vec4 u_doubleCrop;uniform vec2 u_texel;uniform vec2 u_resolution;
uniform vec3 u_shadow;uniform vec3 u_highlight;uniform vec3 u_whiteBalance;
uniform vec3 u_palette[6];uniform vec3 u_toning;uniform float u_sharpness,u_softness,u_skinProtection,u_grainSize;
uniform float u_exposure,u_contrast,u_saturation,u_toe,u_shoulder,u_fade,u_grain,u_seed,u_glow,u_halation,u_vignette,u_doubleAmount,u_lens,u_original,u_mirror;
float luma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
float noise(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+u_seed)*43758.5453123);}
float clusteredNoise(vec2 p){vec2 cell=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(noise(cell),noise(cell+vec2(1.0,0.0)),f.x),mix(noise(cell+vec2(0.0,1.0)),noise(cell+vec2(1.0,1.0)),f.x),f.y);}
vec3 rgbToHsl(vec3 c){float hi=max(c.r,max(c.g,c.b)),lo=min(c.r,min(c.g,c.b)),d=hi-lo;float l=(hi+lo)*.5;float h=0.0,s=0.0;if(d>.00001){s=d/(1.0-abs(2.0*l-1.0)+.00001);if(hi==c.r)h=mod((c.g-c.b)/d,6.0);else if(hi==c.g)h=(c.b-c.r)/d+2.0;else h=(c.r-c.g)/d+4.0;h=fract(h/6.0+1.0);}return vec3(h,s,l);}
vec3 hslToRgb(vec3 hsl){vec3 hue=clamp(abs(fract(hsl.x+vec3(0.0,2.0/3.0,1.0/3.0))*6.0-3.0)-1.0,0.0,1.0);float chroma=(1.0-abs(2.0*hsl.z-1.0))*hsl.y;return (hsl.z-chroma*.5)+chroma*hue;}
vec3 paletteColor(vec3 color){vec3 hsl=rgbToHsl(clamp(color,0.0,1.0)),shift=vec3(0.0);float sum=0.0;for(int i=0;i<6;i++){float center=float(i)/6.0;float distance=abs(hsl.x-center);distance=min(distance,1.0-distance);float weight=1.0-smoothstep(0.0,1.0/6.0,distance);shift+=u_palette[i]*weight;sum+=weight;}shift/=max(sum,.001);float skin=smoothstep(.015,.07,hsl.x)*(1.0-smoothstep(.10,.15,hsl.x));hsl.x=fract(hsl.x+shift.x*(1.0-skin*.32)+1.0);hsl.y=clamp(hsl.y*(1.0+shift.y),0.0,1.0);hsl.z=clamp(hsl.z+shift.z*(.35+.65*sin(hsl.z*3.14159265)),0.0,1.0);return hslToRgb(hsl);}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.0,1.0);}
vec3 compressGamut(vec3 color){float y=clamp(luma(color),0.0,1.0),hi=max(color.r,max(color.g,color.b)),lo=min(color.r,min(color.g,color.b));float amount=min(1.0,min((1.0-y)/max(hi-y,.00001),y/max(y-lo,.00001)));return mix(vec3(y),color,amount);}
float portraitMask(vec3 hsl){return smoothstep(.005,.045,hsl.x)*(1.0-smoothstep(.105,.155,hsl.x))*smoothstep(.08,.25,hsl.y)*(1.0-smoothstep(.68,.95,hsl.y))*smoothstep(.10,.26,hsl.z);}
vec3 sampleSource(vec2 uv){return texture2D(u_source,clamp(u_crop.xy+uv*u_crop.zw,0.0,1.0)).rgb;}
vec3 bright(vec2 uv){vec3 c=sampleSource(uv);return c*smoothstep(.58,.97,luma(c));}
void main(){
 vec2 uv=v_uv;if(u_mirror>.5)uv.x=1.0-uv.x;vec2 p=uv-.5;
 if(u_original<.5&&u_lens>2.5&&u_lens<3.5)uv=.5+p*(1.0+.55*dot(p,p));
 vec3 raw=sampleSource(uv);vec3 color=raw;
 if(u_original<.5){
  vec2 stepSize=u_texel/max(u_crop.zw,vec2(.01))*mix(2.0,13.0,max(u_glow,u_halation));
  vec3 bloom=(bright(uv+vec2(stepSize.x,0.0))+bright(uv-vec2(stepSize.x,0.0))+bright(uv+vec2(0.0,stepSize.y))+bright(uv-vec2(0.0,stepSize.y)))*.16;
  bloom+=(bright(uv+stepSize*2.0)+bright(uv-stepSize*2.0)+bright(uv+stepSize*vec2(-2.0,2.0))+bright(uv+stepSize*vec2(2.0,-2.0)))*.09;
  float halo=max(0.0,luma(bloom)-luma(bright(uv))*.92);
  if(u_sharpness>0.0||u_softness>0.0){vec2 pixel=u_texel/max(u_crop.zw,vec2(.01))*1.4;vec3 local=(sampleSource(uv+vec2(pixel.x,0.0))+sampleSource(uv-vec2(pixel.x,0.0))+sampleSource(uv+vec2(0.0,pixel.y))+sampleSource(uv-vec2(0.0,pixel.y)))*.25;raw=clamp(mix(raw,local,u_softness*.45)+(raw-local)*u_sharpness*(1.0-u_softness),0.0,1.0);}
  if(u_lens>1.5&&u_lens<2.5){float split=.008*(.3+length(p));raw.r=sampleSource(uv+vec2(split,0.0)).r;raw.b=sampleSource(uv-vec2(split,0.0)).b;}
  if(u_doubleAmount>0.0){vec3 second=texture2D(u_double,u_doubleCrop.xy+uv*u_doubleCrop.zw).rgb;raw=mix(raw,1.0-(1.0-raw)*(1.0-second),u_doubleAmount);}
  vec3 linear=pow(max(raw,vec3(0.0)),vec3(2.2))*exp2(u_exposure)*u_whiteBalance;
  linear+=pow(bloom,vec3(2.2))*u_glow*.24;
  // Compress luminance together, preserving hue relationships near white.
  float sceneY=max(luma(linear),.00001);float filmY=aces(vec3(sceneY*.86)).r;
  filmY=mix(filmY,min(sceneY,1.0),.30*smoothstep(.45,1.0,sceneY));
  float mappedY=mix(sceneY,filmY,u_shoulder);
  color=pow(max(linear*(mappedY/sceneY),vec3(0.0)),vec3(1.0/2.2));
  float toneY=clamp(luma(color),.00001,.99999),brightPower=pow(toneY,u_contrast),darkPower=pow(1.0-toneY,u_contrast);
  float contrastY=brightPower/(brightPower+darkPower);
  contrastY=mix(contrastY,smoothstep(0.0,1.0,contrastY),u_toe*.32);
  color+=vec3(contrastY-toneY);
  vec3 shadows=pow(max(vec3(0.0),1.0-color),vec3(2.7));
  color+=u_shadow*shadows;
  float highlightY=clamp(luma(color),0.0,1.0);
  float highlightWeight=smoothstep(.32,.83,highlightY)*(1.0-.65*smoothstep(.93,1.0,highlightY));
  color*=mix(vec3(1.0),u_highlight,highlightWeight);
  float luminance=luma(color);float skin=smoothstep(.015,.12,color.r-color.g)*(1.0-smoothstep(.10,.30,color.g-color.b));
  float sat=u_saturation;if(sat>1.0)sat=mix(sat,1.0,skin*.22);
  color=mix(vec3(luminance),color,sat);
  color=paletteColor(color)*u_toning;
  // A hue-based guard keeps peach skin from becoming orange while retaining
  // the grade's luminance, texture and lighting. It is not face retouching.
  if(u_saturation>.01&&u_skinProtection>0.0){vec3 sourceHsl=rgbToHsl(raw),gradedHsl=rgbToHsl(clamp(color,0.0,1.0));float protect=portraitMask(sourceHsl)*u_skinProtection;float hueDelta=gradedHsl.x-sourceHsl.x;hueDelta=mod(hueDelta+1.5,1.0)-.5;gradedHsl.x=fract(gradedHsl.x-clamp(hueDelta,-.06,.06)*protect*.42+1.0);gradedHsl.y=mix(gradedHsl.y,min(gradedHsl.y,sourceHsl.y*1.12+.025),protect*.65);color=hslToRgb(gradedHsl);}
  color=mix(color,vec3(.50,.47,.40),u_fade);
  color+=vec3(1.0,.20,.045)*halo*u_halation*.24;
  float softness=u_glow;if(u_lens>.5&&u_lens<1.5)softness=max(softness,.6);
  color+=bloom*softness*.055;
  float edge=smoothstep(.12,.63,length(p));float vignette=u_vignette+(u_lens>3.5?.27:0.0);
  color*=1.0-edge*vignette*.7;
  color=compressGamut(color);
  vec2 grainPosition=v_uv*vec2(1400.0,1400.0*u_resolution.y/u_resolution.x)/max(.55,u_grainSize);
  float fine=(noise(floor(grainPosition))+noise(floor(grainPosition)+vec2(73.0,41.0)))*.5-.5;
  float clustered=clusteredNoise(grainPosition*.42)-.5;
  float density=clamp(luma(color),0.0,1.0);
  float grainResponse=.012+.058*pow(max(0.0,4.0*density*(1.0-density)),.7);
  float downsample=sqrt(min(1.0,u_resolution.x/900.0));
  color+=vec3(fine*.76+clustered*.24)*u_grain*grainResponse*downsample;
 }
 if(u_original<.5&&u_lens>2.5&&u_lens<3.5&&length(p)>.58)color=vec3(.007);
 gl_FragColor=vec4(clamp(color,0.0,1.0),1.0);
}`;

export const filmProfiles={
 portra:{shadow:[.019,.015,.010],highlight:[1.025,1.008,.977],toe:.16,shoulder:.58,halation:.12,glow:.13},
 gold:{shadow:[.029,.012,-.008],highlight:[1.048,1.01,.935],toe:.23,shoulder:.48,halation:.21,glow:.18},
 superia:{shadow:[-.006,.021,.017],highlight:[1.015,1.018,.99],toe:.22,shoulder:.44,halation:.13,glow:.10},
 cine:{shadow:[-.015,.018,.042],highlight:[1.04,.997,.947],toe:.26,shoulder:.64,halation:.55,glow:.28},
 hp5:{shadow:[.015,.015,.015],highlight:[1,1,1],toe:.30,shoulder:.45,halation:.03,glow:.08},
 velvia:{shadow:[-.012,-.008,.006],highlight:[1.014,1.016,1.025],toe:.38,shoulder:.32,halation:.05,glow:.04},
 instant:{shadow:[.07,.06,.025],highlight:[1.035,1.01,.935],toe:.08,shoulder:.76,halation:.21,glow:.48},
 clean:{shadow:[0,0,0],highlight:[1,1,1],toe:0,shoulder:0,halation:0,glow:0}
};
Object.assign(filmProfiles,{
 ektar:{shadow:[.003,-.004,.008],highlight:[1.032,1.006,.98],toe:.26,shoulder:.36,halation:.07,glow:.05},
 pro400h:{shadow:[.009,.027,.021],highlight:[1.015,1.018,.992],toe:.1,shoulder:.67,halation:.12,glow:.2},
 'tri-x':{shadow:[.009,.009,.009],highlight:[1,1,1],toe:.42,shoulder:.35,halation:.02,glow:.05},
 delta:{shadow:[.006,.006,.006],highlight:[1,1,1],toe:.19,shoulder:.55,halation:.02,glow:.07},
 ektachrome:{shadow:[-.007,.005,.021],highlight:[.995,1.008,1.027],toe:.30,shoulder:.3,halation:.05,glow:.04},
 provia:{shadow:[.002,.01,.014],highlight:[1.005,1.008,1.014],toe:.25,shoulder:.38,halation:.04,glow:.04},
 cine50:{shadow:[.02,.018,.011],highlight:[1.026,1.01,.98],toe:.14,shoulder:.65,halation:.19,glow:.18},
 vision:{shadow:[.006,.018,.025],highlight:[1.03,1.008,.974],toe:.15,shoulder:.7,halation:.28,glow:.21},
 lomo:{shadow:[.036,.006,.022],highlight:[1.045,1.006,.96],toe:.29,shoulder:.4,halation:.31,glow:.22},
 acros:{shadow:[.004,.004,.004],highlight:[1,1,1],toe:.36,shoulder:.49,halation:.02,glow:.04},
 portra160:{shadow:[.014,.013,.01],highlight:[1.018,1.008,.984],toe:.12,shoulder:.66,halation:.07,glow:.1},
 portra800:{shadow:[.026,.019,.012],highlight:[1.035,1.01,.97],toe:.19,shoulder:.53,halation:.22,glow:.2},
 ultramax:{shadow:[.02,.011,.003],highlight:[1.04,1.008,.966],toe:.26,shoulder:.4,halation:.17,glow:.14},
 c200:{shadow:[.007,.025,.019],highlight:[1.01,1.012,.987],toe:.17,shoulder:.55,halation:.1,glow:.16},
 xp2:{shadow:[.025,.025,.025],highlight:[1,1,1],toe:.14,shoulder:.66,halation:.01,glow:.14},
 panf:{shadow:[.001,.001,.001],highlight:[1,1,1],toe:.38,shoulder:.42,halation:.01,glow:.03},
 redscale:{shadow:[.05,.012,-.018],highlight:[1.1,1.0,.85],toe:.23,shoulder:.51,halation:.35,glow:.25},
 vision500:{shadow:[-.01,.018,.038],highlight:[1.04,1.01,.96],toe:.21,shoulder:.66,halation:.43,glow:.26},
 bleach:{shadow:[.002,.006,.012],highlight:[1.008,1.009,1.015],toe:.4,shoulder:.34,halation:.08,glow:.07},
 ccd:{shadow:[-.004,.008,.02],highlight:[.99,1.008,1.026],toe:.31,shoulder:.17,halation:0,glow:.03}
});
function shader(gl,type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){const reason=gl.getShaderInfoLog(sh);gl.deleteShader(sh);throw new Error(reason);}return sh;}
export class FilmRenderer{
 constructor(){this.canvas=document.createElement('canvas');this.gl=this.canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});this.available=false;this.doubleImage=null;if(!this.gl)return;const gl=this.gl;try{const program=gl.createProgram();const vs=shader(gl,gl.VERTEX_SHADER,VERTEX),fs=shader(gl,gl.FRAGMENT_SHADER,FRAGMENT);gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.deleteShader(vs);gl.deleteShader(fs);this.program=program;gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);this.locations={};this.texture=this.createTexture(0);this.doubleTexture=this.createTexture(1);this.uniform('u_source',0,'1i');this.uniform('u_double',1,'1i');gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);this.available=true;this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.available=false;});this.canvas.addEventListener('webglcontextrestored',()=>location.reload());}catch(error){console.warn('Film renderer fallback:',error.message);}}
 createTexture(unit){const gl=this.gl;gl.activeTexture(gl.TEXTURE0+unit);const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));return tex;}
 uniform(name,value,type='1f'){const gl=this.gl;if(!(name in this.locations))this.locations[name]=gl.getUniformLocation(this.program,name);const loc=this.locations[name];if(loc===null)return;if(type==='3fv')gl.uniform3fv(loc,value);else if(type==='2fv')gl.uniform2fv(loc,value);else if(type==='4fv')gl.uniform4fv(loc,value);else if(type==='1i')gl.uniform1i(loc,value);else gl.uniform1f(loc,value);}
 setDouble(image){this.doubleImage=image;this.doubleUploaded=false;}
 draw(target,source,config){if(!this.available)return false;const gl=this.gl,{state,film,camera,original,crop,sourceWidth:sw,sourceHeight:sh}=config;try{const width=target.width,height=target.height;if(width>gl.getParameter(gl.MAX_TEXTURE_SIZE)||height>gl.getParameter(gl.MAX_TEXTURE_SIZE))return false;if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}gl.viewport(0,0,width,height);gl.useProgram(this.program);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);let uploadSource=source;const limit=Math.min(4096,gl.getParameter(gl.MAX_TEXTURE_SIZE));if(sw>limit||sh>limit){if(!this.scaledSource)this.scaledSource=document.createElement('canvas');if(this.lastScaledSource!==source||source.videoWidth){const scale=limit/Math.max(sw,sh);this.scaledSource.width=Math.round(sw*scale);this.scaledSource.height=Math.round(sh*scale);this.scaledSource.getContext('2d').drawImage(source,0,0,this.scaledSource.width,this.scaledSource.height);this.lastScaledSource=source;}uploadSource=this.scaledSource;}gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,uploadSource);
 const intensity=state.intensity/100,a=state.adjust,fx=state.effects||{},base=filmProfiles[film.id]||filmProfiles[film.category==='bw'?'hp5':'portra'];
 const defaults=(value,neutral)=>neutral+(value-neutral)*intensity;
 const warmth=(film.w*intensity+camera.w+a.warmth)/100;
 this.uniform('u_crop',[crop.x/sw,crop.y/sh,crop.w/sw,crop.h/sh],'4fv');this.uniform('u_texel',[1/sw,1/sh],'2fv');this.uniform('u_resolution',[width,height],'2fv');
 const palette=(base.palette||Array.from({length:6},()=>[0,0,0])).map((band,i)=>band.map((v,j)=>v*intensity+(camera.palette?.[i]?.[j]||0)+(a.hsl?.[i]?.[j]||0)));this.uniform('u_palette[0]',palette.flat(),'3fv');this.uniform('u_toning',(base.toning||[1,1,1]).map(v=>defaults(v,1)),'3fv');this.uniform('u_sharpness',camera.detail||0);this.uniform('u_softness',(base.softness||0)*intensity);this.uniform('u_skinProtection',(base.skinProtection??.55)*intensity);this.uniform('u_grainSize',base.grainSize||1);this.uniform('u_whiteBalance',[1+warmth*.28,1+(a.tint||0)/250,1-warmth*.28],'3fv');this.uniform('u_exposure',a.exposure+Math.log2(defaults(film.b,1)));this.uniform('u_contrast',(1+a.contrast/100)*defaults(film.c,1)*camera.c);
 this.uniform('u_saturation',Math.max(0,(1+a.saturation/100)*defaults(film.s,1)*camera.s));this.uniform('u_toe',base.toe*intensity);this.uniform('u_shoulder',base.shoulder*intensity);
 this.uniform('u_shadow',base.shadow.map(x=>x*intensity),'3fv');this.uniform('u_highlight',base.highlight.map(x=>defaults(x,1)),'3fv');this.uniform('u_fade',film.fade*intensity*.4);
 this.uniform('u_grain',(film.g*intensity+a.grain)/65);this.uniform('u_seed',state.source==='camera'?Math.floor(performance.now()/100):19);
 this.uniform('u_glow',base.glow*intensity+(fx.bloom||0)/100);this.uniform('u_halation',(base.halation*intensity+(fx.halation||0)/100)*(film.category==='bw'?1-intensity:1));this.uniform('u_vignette',a.vignette/100);this.uniform('u_lens',+(fx.lens||0));this.uniform('u_original',original?1:0);this.uniform('u_mirror',state.source==='camera'&&state.facing==='user'&&state.mirror?1:0);
 let doubleAmount=0;if(this.doubleImage&&fx.doubleEnabled){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.doubleTexture);if(!this.doubleUploaded){let doubleSource=this.doubleImage;const dw=this.doubleImage.naturalWidth,dh=this.doubleImage.naturalHeight;if(dw>limit||dh>limit){const reduced=document.createElement('canvas'),scale=limit/Math.max(dw,dh);reduced.width=Math.round(dw*scale);reduced.height=Math.round(dh*scale);reduced.getContext('2d').drawImage(this.doubleImage,0,0,reduced.width,reduced.height);doubleSource=reduced;}gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,doubleSource);this.doubleUploaded=true;}const dw=this.doubleImage.naturalWidth,dh=this.doubleImage.naturalHeight;let cw=dw,ch=dh;if(dw/dh>width/height)cw=dh*width/height;else ch=dw*height/width;this.uniform('u_doubleCrop',[(dw-cw)/2/dw,(dh-ch)/2/dh,cw/dw,ch/dh],'4fv');doubleAmount=(fx.doubleAmount||40)/100;}this.uniform('u_doubleAmount',doubleAmount);
 gl.drawArrays(gl.TRIANGLES,0,6);const ctx=target.getContext('2d',{alpha:false});ctx.save();ctx.filter='none';ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.drawImage(this.canvas,0,0,width,height);ctx.restore();return true;}catch(error){console.warn('Film rendering fallback:',error.message);this.available=false;return false;}}
}

export function finishPrint(target,effects,{filmName='LUMA',original=false}={}){if(original)return;const c=target.getContext('2d'),w=target.width,h=target.height;const frame=effects.frame||'none';c.save();if(frame!=='none'){const border=Math.round(w*(frame==='instant'?.055:.035)),bottom=frame==='instant'?Math.round(Math.min(h*.17,w*.23)):border;const innerW=w-border*2,innerH=h-border-bottom;let sw=w,sh=h;if(w/h>innerW/innerH)sw=h*innerW/innerH;else sh=w*innerH/innerW;c.drawImage(target,(w-sw)/2,(h-sh)/2,sw,sh,border,border,innerW,innerH);c.fillStyle=frame==='negative'?'#171610':'#f1eee4';c.fillRect(0,0,w,border);c.fillRect(0,h-bottom,w,bottom);c.fillRect(0,border,border,h-border-bottom);c.fillRect(w-border,border,border,h-border-bottom);if(frame==='negative'){c.fillStyle='#bba56c';c.font=Math.max(7,w*.009)+'px monospace';c.textBaseline='middle';c.fillText('LUMA  •  '+filmName.toUpperCase()+'  ▷  01',border,h-border/2);const holeW=Math.max(2,w*.009),holeH=border*.42;c.fillStyle='#e5ddc8';for(let x=border;x<w-border;x+=w*.065){c.fillRect(x,border*.14,holeW,holeH);}}if(frame==='instant'){c.fillStyle='#9a9487';c.font='italic '+Math.max(10,w*.028)+'px Georgia';c.textAlign='center';c.fillText('a little more feeling.',w/2,h-bottom*.36);}}
 if(effects.dateStamp){const now=new Date(),stamp=String(now.getFullYear()).slice(2)+' '+String(now.getMonth()+1).padStart(2,'0')+' '+String(now.getDate()).padStart(2,'0');c.textAlign='right';c.textBaseline='bottom';c.font='500 '+Math.max(10,w*.033)+'px monospace';c.fillStyle='#ff9f56';c.shadowColor='#ff561a';c.shadowBlur=w*.005;const margin=w*.07;c.fillText(stamp,w-margin,h-(frame==='instant'?Math.min(h*.17,w*.23):0)-margin);}
 if(effects.lightLeak>0){const alpha=effects.lightLeak/100;const leak=c.createLinearGradient(0,0,w*.65,h*.15);leak.addColorStop(0,'rgba(255,84,22,'+alpha*.8+')');leak.addColorStop(.24,'rgba(255,130,45,'+alpha*.26+')');leak.addColorStop(1,'rgba(255,80,20,0)');c.globalCompositeOperation='screen';c.fillStyle=leak;c.fillRect(0,0,w,h);}
 c.restore();}

Object.assign(filmProfiles,{
classicprint:{shadow:[-.005,.018,.009],highlight:[1.045,1.012,.965],toe:.35,shoulder:.46,halation:.1,glow:.09,palette:[[-.008,.12,-.008],[-.023,-.15,.008],[.035,-.22,-.024],[.012,-.11,-.01],[.014,-.14,-.028],[0,-.09,0]]},
ambermemory:{shadow:[-.004,.021,.035],highlight:[1.075,1.025,.92],toe:.16,shoulder:.65,halation:.12,glow:.14,palette:[[.006,.03,.01],[-.01,-.10,.015],[.015,-.16,-.008],[0,-.12,.005],[.008,-.13,.008],[0,-.08,0]]},
chromediary:{shadow:[.008,.014,.019],highlight:[1.018,1.012,.976],toe:.30,shoulder:.49,halation:.05,glow:.07,palette:[[.013,-.03,0],[-.014,-.15,-.005],[-.025,-.22,-.018],[.01,-.15,-.01],[.008,-.21,-.025],[0,-.15,0]]},
soft100:{shadow:[.019,.018,.017],highlight:[1.027,1.012,.986],toe:.09,shoulder:.72,halation:.06,glow:.18,palette:[[.004,-.04,.012],[-.008,-.08,.01],[.005,-.12,.013],[0,-.08,.012],[.004,-.10,.015],[0,-.08,.012]]},
realaday:{shadow:[.002,.006,.008],highlight:[1.009,1.008,.997],toe:.24,shoulder:.43,halation:.03,glow:.03,palette:[[0,.015,0],[0,-.015,0],[.002,.02,-.005],[0,.01,0],[.002,.025,-.005],[0,.015,0]]},
softcinema:{shadow:[.009,.02,.025],highlight:[1.018,1.009,.981],toe:.10,shoulder:.74,halation:.13,glow:.13,palette:[[.005,-.04,.005],[-.008,-.08,0],[.018,-.17,-.008],[.012,-.1,-.005],[.009,-.13,-.008],[0,-.09,0]]},
ccdflash:{shadow:[-.008,.008,.022],highlight:[1.015,1.015,1.025],toe:.35,shoulder:.12,halation:0,glow:.025,palette:[[.006,.07,.005],[-.012,-.04,.005],[.01,.06,-.01],[.008,.08,0],[.008,.15,-.018],[.005,.03,0]]},
ccdhoney:{shadow:[-.006,.018,.025],highlight:[1.045,1.025,.95],toe:.25,shoulder:.23,halation:.02,glow:.055,palette:[[.012,.03,.012],[-.012,-.07,.012],[.016,-.07,0],[-.018,.08,.005],[.003,.025,-.005],[0,-.04,0]]},
disposable:{shadow:[.034,.023,.002],highlight:[1.058,1.027,.942],toe:.31,shoulder:.36,halation:.25,glow:.25,palette:[[.006,.09,0],[-.018,.10,-.005],[-.018,.035,-.012],[.012,-.09,0],[.012,-.09,-.012],[0,-.1,0]]},
mint:{shadow:[-.006,.043,.033],highlight:[1.012,1.03,1.012],toe:.07,shoulder:.72,halation:.12,glow:.22,palette:[[.008,-.06,.018],[-.005,-.16,.02],[.028,-.12,.015],[-.01,-.10,.018],[.012,-.16,.025],[0,-.14,.018]]},
instantpeach:{shadow:[.052,.035,.03],highlight:[1.065,1.018,.941],toe:.07,shoulder:.78,halation:.15,glow:.36,palette:[[.012,-.025,.02],[-.02,-.11,.012],[.018,-.28,.01],[.014,-.2,.018],[.012,-.26,.026],[.008,-.17,.015]]},
instantfaded:{shadow:[.064,.07,.036],highlight:[1.039,1.024,.94],toe:.055,shoulder:.81,halation:.13,glow:.38,palette:[[.014,-.12,.005],[-.01,-.18,.005],[-.016,-.23,-.005],[.018,-.22,.01],[.015,-.30,.025],[0,-.25,.01]]},
velvetnight:{shadow:[-.018,.028,.048],highlight:[1.045,.996,1.023],toe:.25,shoulder:.55,halation:.52,glow:.25,palette:[[.006,.035,0],[-.012,-.12,0],[.025,-.15,-.01],[-.018,.1,.002],[.031,.10,-.012],[.012,.07,.008]]},
silversepia:{shadow:[.017,.017,.017],highlight:[1,1,1],toe:.22,shoulder:.58,halation:0,glow:.13,toning:[1.075,1.012,.87],palette:[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]}
});
// Existing stocks receive selective color, preserving distinct palettes even at
// similar exposure and contrast settings. Saturation is not a blanket tint.
const palettes={
portra:[[.005,-.03,.009],[-.009,-.09,.008],[.012,-.13,-.005],[.004,-.07,0],[.01,-.12,.006],[0,-.06,0]],
gold:[[.006,.06,.003],[-.012,.025,.005],[-.012,-.06,-.008],[.01,-.10,0],[.01,-.09,-.008],[0,-.05,0]],
superia:[[.005,.025,0],[-.005,-.05,0],[.019,.045,-.009],[.015,-.015,0],[.008,.02,-.01],[0,-.03,0]],
cine:[[.01,-.03,0],[-.01,-.12,-.008],[.022,-.17,-.015],[-.012,.055,0],[.022,.045,-.015],[.012,.055,.005]],
velvia:[[0,.08,-.004],[0,.05,0],[.004,.09,-.016],[.006,.03,-.005],[.005,.08,-.02],[0,.04,0]],
pro400h:[[.006,-.06,.016],[-.008,-.12,.012],[.016,-.12,.014],[.01,-.1,.014],[.01,-.14,.02],[0,-.09,.012]],
ektar:[[.004,.09,-.005],[-.007,.02,0],[.006,.015,-.012],[.007,-.035,0],[.008,.03,-.016],[0,.01,0]],
instant:[[.012,-.1,.015],[-.014,-.18,.008],[.012,-.23,.012],[.01,-.16,.012],[.012,-.24,.022],[0,-.12,.012]]
};
for(const [id,palette]of Object.entries(palettes))filmProfiles[id].palette=palette;

// Second-pass print tuning: texture remains optical, skin stays recognizable,
// and cream lives in the upper midtones rather than tinting every white pixel.
const refinedPrints={
 soft100:{shadow:[.018,.016,.019],highlight:[1.025,1.004,.991],toe:.13,shoulder:.61,halation:.07,glow:.17,softness:.34,skinProtection:.88,grainSize:.72,palette:[[.009,-.025,.012],[-.012,-.07,.014],[.016,-.17,.014],[.009,-.10,.012],[.012,-.17,.017],[.006,-.07,.009]]},
 mint:{shadow:[.010,.023,.031],highlight:[1.022,1.017,1.004],toe:.11,shoulder:.64,halation:.06,glow:.16,softness:.28,skinProtection:.84,grainSize:.76,palette:[[.010,-.025,.014],[-.013,-.10,.016],[.022,-.18,.015],[.005,-.12,.018],[.012,-.18,.022],[.004,-.10,.012]]},
 instantpeach:{shadow:[.033,.024,.026],highlight:[1.038,1.004,.983],toe:.14,shoulder:.66,halation:.12,glow:.20,softness:.40,skinProtection:.86,grainSize:.88,palette:[[.013,-.025,.018],[-.020,-.12,.013],[.022,-.23,.012],[.012,-.17,.018],[.014,-.22,.022],[.007,-.11,.013]]},
 ambermemory:{shadow:[.008,.016,.028],highlight:[1.045,1.016,.956],toe:.17,shoulder:.57,halation:.10,glow:.12,softness:.19,skinProtection:.76,grainSize:.83,palette:[[.006,.015,.008],[-.014,-.07,.013],[.020,-.14,.002],[.006,-.09,.009],[.010,-.12,.009],[.004,-.06,.006]]},
 ccdhoney:{shadow:[.006,.012,.021],highlight:[1.029,1.013,.977],toe:.24,shoulder:.28,halation:.015,glow:.06,softness:.12,skinProtection:.80,grainSize:.65,palette:[[.009,.025,.009],[-.013,-.06,.009],[.016,-.09,.003],[-.012,.045,.008],[.006,.018,-.003],[.003,-.035,.003]]},
 portra160:{shadow:[.012,.011,.012],highlight:[1.023,1.010,.987],toe:.13,shoulder:.57,halation:.055,glow:.10,softness:.24,skinProtection:.88,grainSize:.65,palette:[[.005,-.025,.008],[-.010,-.075,.008],[.012,-.11,.003],[.004,-.06,.005],[.008,-.10,.009],[.002,-.06,.005]]},
 portra:{shadow:[.014,.012,.010],highlight:[1.029,1.010,.977],toe:.18,shoulder:.54,halation:.10,glow:.12,softness:.18,skinProtection:.82,grainSize:.80,palette:[[.006,-.02,.008],[-.012,-.075,.009],[.015,-.12,-.003],[.005,-.07,.003],[.009,-.11,.007],[.002,-.05,.004]]},
 gold:{shadow:[.023,.016,.008],highlight:[1.041,1.013,.958],toe:.24,shoulder:.46,halation:.16,glow:.13,softness:.15,skinProtection:.72,grainSize:.92,palette:[[.007,.035,.004],[-.015,.01,.006],[-.008,-.08,-.006],[.010,-.09,.002],[.012,-.11,-.006],[.002,-.05,.002]]},
 disposable:{shadow:[.024,.021,.009],highlight:[1.043,1.020,.953],toe:.27,shoulder:.40,halation:.18,glow:.18,softness:.25,skinProtection:.72,grainSize:1.12,palette:[[.007,.06,.004],[-.016,.045,.006],[-.010,-.01,-.007],[.014,-.10,.004],[.013,-.11,-.007],[.003,-.09,.003]]},
 chromediary:{shadow:[.010,.015,.021],highlight:[1.020,1.013,.978],toe:.28,shoulder:.48,halation:.04,glow:.07,softness:.12,skinProtection:.69,grainSize:.87},
 classicprint:{softness:.11,skinProtection:.67,grainSize:.96},
 softcinema:{softness:.21,skinProtection:.72,grainSize:.92},
 clean:{skinProtection:0,softness:0,grainSize:1}
};
for(const [id,settings]of Object.entries(refinedPrints))Object.assign(filmProfiles[id],settings);
