// All look values are creative recipes, not measurements of branded hardware or film.
export const films = [
{id:'portra',name:'Portra 400',brand:'Kodak inspired',type:'COLOR NEGATIVE',category:'color',iso:400,color:'#d3b570',description:'Warm skin tones.\nSoft, timeless color.',b:1.04,c:.92,s:.88,w:14,h:0,g:22,fade:.05},
{id:'gold',name:'Gold 200',brand:'Kodak inspired',type:'COLOR NEGATIVE',category:'color',iso:200,color:'#e5bc3d',description:'Golden afternoons.\nA touch of nostalgia.',b:1.03,c:1.06,s:1.1,w:26,h:-3,g:28,fade:.03},
{id:'superia',name:'Superia 400',brand:'Fujifilm inspired',type:'COLOR NEGATIVE',category:'color',iso:400,color:'#669578',description:'Cool greens.\nEveryday adventures.',b:1.02,c:1.06,s:1.05,w:-8,h:7,g:24,fade:.02},
{id:'cine',name:'Cine 800T',brand:'Cinema inspired',type:'TUNGSTEN',category:'cinema',iso:800,color:'#7a928b',description:'Blue-hour stories.\nA cinematic mood.',b:.96,c:1.12,s:.8,w:-23,h:-5,g:30,fade:.03},
{id:'hp5',name:'HP5 Plus',brand:'Ilford inspired',type:'BLACK & WHITE',category:'bw',iso:400,color:'#788477',description:'Honest contrast.\nA little beautiful grit.',b:1.02,c:1.16,s:0,w:0,h:0,g:38,fade:.02},
{id:'velvia',name:'Velvia 50',brand:'Fujifilm inspired',type:'COLOR REVERSAL',category:'color',iso:50,color:'#a34b80',description:'Vivid landscapes.\nColors with a pulse.',b:1,c:1.15,s:1.4,w:0,h:2,g:8,fade:0},
{id:'ektar',name:'Ektar 100',brand:'Kodak inspired',type:'COLOR NEGATIVE',category:'color',iso:100,color:'#b75843',description:'Rich reds.\nCrisp, clear afternoons.',b:1.01,c:1.12,s:1.2,w:8,h:-4,g:10,fade:0},
{id:'pro400h',name:'Pro 400H',brand:'Fujifilm inspired',type:'COLOR NEGATIVE',category:'color',iso:400,color:'#6a9f87',description:'Airy pastels.\nGentle green shadows.',b:1.08,c:.87,s:.84,w:-7,h:5,g:18,fade:.07},
{id:'tri-x',name:'Tri-X 400',brand:'Kodak inspired',type:'BLACK & WHITE',category:'bw',iso:400,color:'#a79a6b',description:'Street-life energy.\nBold monochrome.',b:1,c:1.29,s:0,w:0,h:0,g:44,fade:.01},
{id:'delta',name:'Delta 100',brand:'Ilford inspired',type:'BLACK & WHITE',category:'bw',iso:100,color:'#888f9d',description:'Smooth silver tones.\nQuiet, fine detail.',b:1.04,c:1.08,s:0,w:0,h:0,g:10,fade:.02},
{id:'ektachrome',name:'Ektachrome',brand:'Kodak inspired',type:'COLOR REVERSAL',category:'color',iso:100,color:'#638fba',description:'Cool blue skies.\nBright, clean color.',b:1.01,c:1.12,s:1.15,w:-12,h:1,g:12,fade:0},
{id:'provia',name:'Provia 100F',brand:'Fujifilm inspired',type:'COLOR REVERSAL',category:'color',iso:100,color:'#668eac',description:'Balanced and bright.\nNatural adventure.',b:1.01,c:1.07,s:1.08,w:-3,h:0,g:10,fade:0},
{id:'cine50',name:'Cine 50D',brand:'Cinema inspired',type:'DAYLIGHT',category:'cinema',iso:50,color:'#d0a85f',description:'Sunlit cinema.\nSmooth, golden detail.',b:1.04,c:.94,s:.94,w:12,h:-2,g:8,fade:.02},
{id:'vision',name:'Vision 250D',brand:'Cinema inspired',type:'DAYLIGHT',category:'cinema',iso:250,color:'#b99670',description:'Subtle amber.\nMade for storytelling.',b:1,c:.93,s:.82,w:14,h:-4,g:22,fade:.05},
{id:'lomo',name:'Lomo 800',brand:'Lomography inspired',type:'COLOR NEGATIVE',category:'color',iso:800,color:'#b75753',description:'Punchy and playful.\nAfter-dark character.',b:1,c:1.16,s:1.22,w:14,h:-6,g:42,fade:.03},
{id:'acros',name:'Acros 100',brand:'Fujifilm inspired',type:'BLACK & WHITE',category:'bw',iso:100,color:'#73777d',description:'Deep blacks.\nSoft silver highlights.',b:1.02,c:1.22,s:0,w:0,h:0,g:16,fade:.01},
{id:'instant',name:'Instant 600',brand:'Instant film inspired',type:'INSTANT COLOR',category:'color',iso:600,color:'#c7bb92',description:'Faded memories.\nSoft, imperfect magic.',b:1.08,c:.78,s:.75,w:20,h:3,g:26,fade:.12},
{id:'clean',name:'Pure Light',brand:'Luma original',type:'DIGITAL ORIGINAL',category:'color',iso:0,color:'#c8d0b8',description:'Your light, untouched.\nA clean place to start.',b:1,c:1,s:1,w:0,h:0,g:0,fade:0},
{id:'portra160',name:'Portra 160',brand:'Kodak inspired',type:'COLOR NEGATIVE',category:'color',iso:160,color:'#c3a877',description:'Fine grain, gentle light.\nQuiet skin tones.',b:1.04,c:.88,s:.86,w:9,h:0,g:9,fade:.025},
{id:'portra800',name:'Portra 800',brand:'Kodak inspired',type:'COLOR NEGATIVE',category:'color',iso:800,color:'#b69b67',description:'Warm evening portraits.\nTactile, lively grain.',b:1.02,c:.98,s:.92,w:18,h:0,g:40,fade:.04},
{id:'ultramax',name:'UltraMax 400',brand:'Kodak inspired',type:'COLOR NEGATIVE',category:'color',iso:400,color:'#e1b957',description:'Bright everyday colors.\nWarm, carefree days.',b:1.03,c:1.08,s:1.15,w:13,h:-2,g:29,fade:.025},
{id:'c200',name:'C200',brand:'Fujifilm inspired',type:'COLOR NEGATIVE',category:'color',iso:200,color:'#7aab80',description:'Fresh greens.\nA soft everyday negative.',b:1.04,c:.95,s:.96,w:-6,h:3,g:19,fade:.04},
{id:'xp2',name:'XP2 Super',brand:'Ilford inspired',type:'BLACK & WHITE',category:'bw',iso:400,color:'#9a8f85',description:'Creamy silver highlights.\nSoft monochrome portraits.',b:1.05,c:.94,s:0,w:0,h:0,g:21,fade:.04},
{id:'panf',name:'Pan F 50',brand:'Ilford inspired',type:'BLACK & WHITE',category:'bw',iso:50,color:'#8a8171',description:'Rich, sculpted shadows.\nFine-grained stillness.',b:1,c:1.21,s:0,w:0,h:0,g:6,fade:0},
{id:'redscale',name:'Redscale XR',brand:'Experimental original',type:'EXPERIMENTAL',category:'color',iso:200,color:'#b76d44',description:'Copper skies.\nAn unexpected warmth.',b:1.03,c:.97,s:.72,w:48,h:-15,g:32,fade:.06},
{id:'vision500',name:'Vision 500T',brand:'Cinema inspired',type:'TUNGSTEN',category:'cinema',iso:500,color:'#65868a',description:'Cool shadows, warm lights.\nA late-night narrative.',b:1,c:.98,s:.85,w:-18,h:-4,g:31,fade:.02},
{id:'bleach',name:'Silver Bypass',brand:'Cinema original',type:'BLEACH BYPASS',category:'cinema',iso:400,color:'#96958b',description:'Muted color, deep contrast.\nA dramatic silver story.',b:.99,c:1.26,s:.38,w:-5,h:0,g:32,fade:.01},
{id:'ccd',name:'Pocket CCD',brand:'Luma original',type:'DIGITAL NOSTALGIA',category:'color',iso:100,color:'#9bafca',description:'Cool highlights.\nA tiny-camera flashback.',b:1.05,c:1.08,s:1.12,w:-9,h:2,g:12,fade:.015}
];
export const cameras=[
{name:'LUMA Natural',desc:'สีผิวละมุน แสงนุ่ม เป็นธรรมชาติ',c:1,s:1,w:0},
{name:'Leica M · warm documentary',desc:'โทนอุ่น คอนทราสต์ชัด สำหรับเรื่องราวริมทาง',c:1.09,s:.9,w:5},
{name:'Fujifilm X · classic color',desc:'สีละมุน เงาสงบ สไตล์คลาสสิก',c:.96,s:.9,w:-3},
{name:'Hasselblad · soft natural',desc:'สีสุภาพ นุ่มนวล เหมาะกับภาพคน',c:.93,s:.98,w:2},
{name:'Canon EOS · warm portrait',desc:'สีผิวอบอุ่น สดใส เหมาะกับภาพคน',c:1.02,s:1.04,w:6},
{name:'Nikon Z · crisp daylight',desc:'สีธรรมชาติ คมชัดในแสงกลางวัน',c:1.06,s:1.02,w:0},
{name:'Sony α · neutral modern',desc:'โทนเป็นกลาง สะอาด ร่วมสมัย',c:1.03,s:.97,w:-3},
{name:'Ricoh GR · street contrast',desc:'เงาชัด สีเข้ม สำหรับภาพสตรีท',c:1.16,s:.87,w:0},
{name:'OM System · vivid travel',desc:'สีสดใสสำหรับธรรมชาติและการเดินทาง',c:1.08,s:1.12,w:1},
{name:'Lumix S · cinema neutral',desc:'โทนภาพยนตร์ คอนทราสต์นุ่ม',c:.95,s:.93,w:-4},
{name:'Pentax · rich landscape',desc:'สีเขียวเข้มและท้องฟ้าสด',c:1.1,s:1.15,w:1},
{name:'Phase One · soft editorial',desc:'แสงนุ่ม สีสงบ สำหรับภาพสไตล์ editorial',c:.9,s:.94,w:2},
{name:'Nikon F3 · 35mm documentary',desc:'แรงบันดาลใจจากภาพ 35mm สารคดี เงาชัด สีสุขุม',c:1.08,s:.91,w:3,group:'135'},
{name:'Canon AE-1 · warm 35mm',desc:'โทนอุ่นย้อนยุค เหมาะกับคนและแสงกลางวัน',c:1.02,s:.96,w:9,group:'135'},
{name:'Olympus OM-1 · travel negative',desc:'ฟิล์มท่องเที่ยว สีสดกำลังดี แสงนุ่ม',c:1.04,s:1.04,w:4,group:'135'},
{name:'Pentax K1000 · everyday 35mm',desc:'ภาพชีวิตประจำวัน คอนทราสต์สมดุล',c:1.05,s:.96,w:2,group:'135'},
{name:'Contax T2 · compact classic',desc:'ภาพคอมแพกต์ สีอบอุ่น เงาคม',c:1.12,s:.92,w:5,group:'135'},
{name:'Minolta CLE · quiet street',desc:'ภาพริมทาง สีสงบและเงานุ่ม',c:.98,s:.88,w:1,group:'135'},
{name:'Mamiya 7 · soft medium format',desc:'สูตรสีนุ่ม รายละเอียดขึ้นกับกล้องมือถือจริง',c:.88,s:.92,w:3,group:'medium'},
{name:'Hasselblad 500 · square stories',desc:'แรงบันดาลใจจากภาพคนและภาพฟิล์มสี่เหลี่ยม',c:.92,s:.9,w:5,group:'medium'},
{name:'Rolleiflex · silver portrait',desc:'ภาพคนคลาสสิก สีสุภาพและคอนทราสต์นุ่ม',c:.94,s:.86,w:2,group:'medium'},
{name:'LUMA 8 · home movies',desc:'สีอุ่น เกรนและกลิ่นอายหนังบ้าน',c:1.10,s:.82,w:12,group:'cinema'},
{name:'LUMA 16 · daylight cinema',desc:'โทนภาพยนตร์ สีสงบ แสงกลางวัน',c:.94,s:.87,w:4,group:'cinema'},
{name:'LUMA CCD · pocket digital',desc:'โทนดิจิทัลคอมแพกต์ เงาชัด สีเย็น',c:1.13,s:1.1,w:-7,group:'digital'}
];
export function cropRect(sw,sh,ratio,zoom=1){let w=sw,h=sh;if(sw/sh>ratio)w=sh*ratio;else h=sw/ratio;w/=zoom;h/=zoom;return{x:(sw-w)/2,y:(sh-h)/2,w,h};}
export function outputSize(sw,sh,ratio,max=4096,zoom=1){const r=cropRect(sw,sh,ratio,zoom);const scale=Math.min(1,max/Math.max(r.w,r.h));return{width:Math.max(1,Math.round(r.w*scale)),height:Math.max(1,Math.round(r.h*scale))};}
export function colorRecipe(film,camera,a,intensity,original=false){if(original)return{filter:'none',warm:0,fade:0,grain:0,vignette:0};const t=intensity/100;const lerp=(v)=>1+(v-1)*t;return{filter:`brightness(${Math.pow(2,a.exposure)*lerp(film.b)}) contrast(${(1+a.contrast/100)*lerp(film.c)*camera.c}) saturate(${Math.max(0,(1+a.saturation/100)*lerp(film.s)*camera.s)}) hue-rotate(${film.h*t}deg)`,warm:(film.w*t+camera.w+a.warmth)/180,fade:film.fade*t,grain:Math.min(1,(film.g*t+a.grain)/150),vignette:a.vignette/100};}
// Safari versions without Canvas 2D filters use the same affine color operations
// on pixels. Preview is capped separately to keep this path practical on phones.
export function applyPixelFilter(data,filter){if(filter==='none')return;const n=[...filter.matchAll(/\((-?[\d.]+)/g)].map(m=>+m[1]);const[b,c,s,angle]=n,rad=angle*Math.PI/180,co=Math.cos(rad),si=Math.sin(rad);const hue=[.213+.787*co-.213*si,.715-.715*co-.715*si,.072-.072*co+.928*si,.213-.213*co+.143*si,.715+.285*co+.140*si,.072-.072*co-.283*si,.213-.213*co-.787*si,.715-.715*co+.715*si,.072+.928*co+.072*si];for(let i=0;i<data.length;i+=4){let r=(data[i]*b-127.5)*c+127.5,g=(data[i+1]*b-127.5)*c+127.5,bl=(data[i+2]*b-127.5)*c+127.5;const l=.213*r+.715*g+.072*bl;r=l+(r-l)*s;g=l+(g-l)*s;bl=l+(bl-l)*s;data[i]=hue[0]*r+hue[1]*g+hue[2]*bl;data[i+1]=hue[3]*r+hue[4]*g+hue[5]*bl;data[i+2]=hue[6]*r+hue[7]*g+hue[8]*bl;}}

// Distinct creative families, informed by published descriptions of negative,
// slide, instant, cinema and compact-digital rendering. No proprietary LUTs.
films.push(
{id:'classicprint',name:'Classic Print',brand:'Luma color negative',family:'negative',type:'CLASSIC NEGATIVE',category:'color',iso:400,color:'#708170',description:'Deep greens, warm reds.\nA printed street memory.',b:1,c:1.13,s:.90,w:6,h:0,g:23,fade:.025},
{id:'ambermemory',name:'Amber Memory',brand:'Luma nostalgic color',family:'negative',type:'NOSTALGIC NEGATIVE',category:'color',iso:200,color:'#bc9363',description:'Amber highlights.\nCool, open shadows.',b:1.035,c:.94,s:.93,w:4,h:0,g:19,fade:.035},
{id:'chromediary',name:'Chrome Diary',brand:'Luma documentary',family:'negative',type:'MUTED COLOR',category:'color',iso:200,color:'#718183',description:'Quiet skies, olive greens.\nA documentary palette.',b:1.015,c:1.09,s:.78,w:0,h:0,g:17,fade:.02},
{id:'soft100',name:'Soft Portrait 100',brand:'Luma soft color',family:'negative',type:'SOFT PORTRAIT',category:'color',iso:100,color:'#c9aaa0',description:'Gentle skin, pastel color.\nSoft afternoon portraits.',b:1.05,c:.87,s:.91,w:5,h:0,g:8,fade:.025},
{id:'realaday',name:'True Daylight',brand:'Luma natural color',family:'negative',type:'BALANCED DAYLIGHT',category:'color',iso:100,color:'#718e91',description:'Clear, honest color.\nFirm but natural contrast.',b:1.01,c:1.08,s:1.01,w:0,h:0,g:9,fade:0},
{id:'softcinema',name:'Soft Cinema',brand:'Luma motion picture',family:'cinema',type:'SOFT CINEMA',category:'cinema',iso:250,color:'#7c9389',description:'Soft color, rich shadows.\nA quiet cinematic frame.',b:1.02,c:.86,s:.71,w:-2,h:0,g:16,fade:.04},
{id:'ccdflash',name:'CCD Flash 90',brand:'Luma pocket digital',family:'ccd',type:'COMPACT DIGITAL',category:'color',iso:100,color:'#b5bdc5',description:'Bright whites, cool blues.\nA 90s pocket-camera mood.',b:1.04,c:1.14,s:1.14,w:-5,h:0,g:6,fade:0},
{id:'ccdhoney',name:'CCD Honey',brand:'Luma pocket digital',family:'ccd',type:'WARM COMPACT',category:'color',iso:100,color:'#c3aa7f',description:'Honey skin, cyan skies.\nWarm digital nostalgia.',b:1.04,c:1.04,s:1.03,w:12,h:0,g:7,fade:.015},
{id:'disposable',name:'Disposable Sun',brand:'Luma everyday film',family:'negative',type:'DISPOSABLE 35MM',category:'color',iso:400,color:'#b4ad56',description:'Sunny yellows, playful reds.\nA carefree disposable roll.',b:1.035,c:1.08,s:1.11,w:18,h:0,g:31,fade:.035},
{id:'mint',name:'Half-Frame Mint',brand:'Luma half-frame color',family:'creative',type:'PASTEL HALF FRAME',category:'color',iso:200,color:'#83a99c',description:'Mint shadows, airy whites.\nTiny everyday stories.',b:1.055,c:.83,s:.81,w:-7,h:0,g:20,fade:.055},
{id:'instantpeach',name:'Instant Peach',brand:'Luma instant color',family:'instant',type:'WARM INSTANT',category:'color',iso:600,color:'#c9a08c',description:'Peach skin, creamy light.\nA soft instant keepsake.',b:1.07,c:.82,s:.78,w:15,h:0,g:23,fade:.07},
{id:'instantfaded',name:'Instant Faded',brand:'Luma instant color',family:'instant',type:'AGED INSTANT',category:'color',iso:600,color:'#aba28b',description:'Faded ink, green shadows.\nFound in an old photo box.',b:1.055,c:.77,s:.67,w:8,h:0,g:28,fade:.11},
{id:'velvetnight',name:'Velvet Night',brand:'Luma night cinema',family:'cinema',type:'NEON CINEMA',category:'cinema',iso:800,color:'#756a94',description:'Teal shadows, violet blues.\nNeon after midnight.',b:1,c:1.08,s:.96,w:-12,h:0,g:31,fade:.025},
{id:'silversepia',name:'Silver Sepia',brand:'Luma silver print',family:'bw',type:'TONED SILVER',category:'bw',iso:200,color:'#ab9272',description:'Warm silver, soft paper.\nA timeless sepia print.',b:1.02,c:.99,s:0,w:0,h:0,g:21,fade:.025}
);
for(const film of films){if(!film.family)film.family=film.id==='ccd'?'ccd':film.id==='instant'?'instant':film.id==='redscale'?'creative':film.category==='bw'?'bw':film.category==='cinema'?'cinema':'negative';}
// Small selective-color differences supplement each camera's neutral recipe.
const cameraPalettes=[
[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
[[.008,.02,0],[-.012,-.04,0],[.008,-.08,-.008],[0,-.03,0],[.005,-.05,-.01],[0,-.02,0]],
[[.006,-.02,0],[-.014,-.06,.005],[.014,-.08,-.005],[.008,-.04,0],[.008,-.05,-.005],[0,-.03,0]],
[[0,-.02,.006],[0,-.02,.005],[0,-.035,.003],[0,-.015,0],[0,-.02,.003],[0,-.02,.003]],
[[.006,.025,.004],[0,-.03,.003],[0,-.02,0],[0,0,0],[0,-.02,0],[0,-.02,0]],
[[0,0,0],[0,0,0],[.003,.03,-.003],[0,.015,0],[0,.025,-.005],[0,0,0]]
];
cameras.forEach((camera,index)=>{camera.palette=cameraPalettes[index%cameraPalettes.length];camera.detail=camera.group==='medium'?.08:camera.name.includes('CCD')?.65:camera.name.includes('Ricoh')?.4:.18;});

const featuredLooks=["soft100","mint","instantpeach","ambermemory","portra160","ccdhoney","portra","gold","chromediary","classicprint","softcinema","velvetnight"];films.forEach(f=>f.featured=featuredLooks.includes(f.id)?featuredLooks.indexOf(f.id)+1:0);

// Refined print recipes; IDs remain stable for saved preferences.
const refinedRecipes={soft100:{name:"Soft Peach 100",b:1.065,c:.96,s:.96,w:6,g:9,fade:.018,description:"ผิวพีชละมุน แสงใสไม่ซีด\nเหมาะกับคนและแสงหน้าต่าง"},mint:{name:"Tokyo Milk",b:1.045,c:.93,s:.89,w:-2,g:15,fade:.025,description:"เงาฟ้าเทา ขาวนวล สีผิวอ่อนโยน\nโทนคาเฟ่และภาพกลางวัน"},instantpeach:{b:1.055,c:.91,s:.90,w:7,g:20,fade:.045,description:"สีพีช ครีม และเงากุหลาบบางๆ\nอินสแตนต์นุ่มแต่ยังมีมิติ"},ambermemory:{b:1.03,c:1.01,s:.96,w:3,g:17,fade:.02},ccdhoney:{b:1.03,c:1.08,s:1.02,w:6,g:6,fade:.008},portra160:{b:1.035,c:.99,s:.92,w:5,g:9,fade:.014},portra:{b:1.02,c:.99,s:.94,w:8,g:18,fade:.018},gold:{b:1.025,c:1.07,s:1.06,w:13,g:24,fade:.02},disposable:{b:1.035,c:1.08,s:1.04,w:10,g:25,fade:.025},chromediary:{b:1.02,c:1.07,s:.86,w:2,g:15,fade:.015},classicprint:{b:1.015,c:1.09,s:.91,w:4,g:20,fade:.02}};for(const film of films)if(refinedRecipes[film.id])Object.assign(film,refinedRecipes[film.id]);
