const clamp=value=>Math.min(4,Math.max(1,value));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const interactive='button,a,input,select,textarea,[contenteditable="true"]';

// Keep digital zoom in the existing render/capture pipeline, not in CSS page scaling.
export function attachCameraZoom(element,{getZoom,setZoom,isDisabled=()=>false}){
  const pointers=new Map();
  let baseline=null,multi=false,tapStart=null,lastTap=null;
  const reset=()=>{pointers.clear();baseline=null;multi=false;tapStart=null;lastTap=null;};
  const begin=event=>{
    if(event.pointerType!=='touch'||isDisabled()||pointers.size>=2||event.target.closest(interactive))return;
    const point={x:event.clientX,y:event.clientY};
    if(!pointers.size){multi=false;tapStart={...point,time:event.timeStamp};}
    pointers.set(event.pointerId,point);
    try{element.setPointerCapture(event.pointerId);}catch{}
    if(pointers.size>=2){
      multi=true;lastTap=null;
      const [a,b]=pointers.values();
      baseline={distance:Math.max(1,distance(a,b)),zoom:getZoom()};
    }
  };
  const move=event=>{
    if(!pointers.has(event.pointerId))return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.size<2||!baseline||isDisabled())return;
    event.preventDefault();
    const [a,b]=pointers.values();
    setZoom(clamp(baseline.zoom*distance(a,b)/baseline.distance));
  };
  const end=event=>{
    if(!pointers.has(event.pointerId))return;
    if(event.type==='pointerup'&&!multi&&tapStart&&!isDisabled()){
      const point={x:event.clientX,y:event.clientY};
      const shortTap=event.timeStamp-tapStart.time<300&&distance(tapStart,point)<14;
      if(shortTap&&lastTap&&event.timeStamp-lastTap.time<320&&distance(lastTap,point)<30){
        event.preventDefault();setZoom(getZoom()<1.5?2:1);lastTap=null;
      }else{lastTap=shortTap?{...point,time:event.timeStamp}:null;}
    }else{lastTap=null;}
    pointers.delete(event.pointerId);
    if(pointers.size<2)baseline=null;
    if(!pointers.size){multi=false;tapStart=null;}
  };
  const preventBrowserZoom=event=>event.preventDefault();
  element.addEventListener('pointerdown',begin);
  element.addEventListener('pointermove',move,{passive:false});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,end);
  for(const type of ['dblclick','gesturestart','gesturechange','gestureend'])element.addEventListener(type,preventBrowserZoom,{passive:false});
  const visibility=()=>{if(document.hidden)reset();};
  if(typeof document!=='undefined')document.addEventListener('visibilitychange',visibility);
  return ()=>{
    reset();element.removeEventListener('pointerdown',begin);element.removeEventListener('pointermove',move);
    for(const type of ['pointerup','pointercancel','lostpointercapture'])element.removeEventListener(type,end);
    for(const type of ['dblclick','gesturestart','gesturechange','gestureend'])element.removeEventListener(type,preventBrowserZoom);
    if(typeof document!=='undefined')document.removeEventListener('visibilitychange',visibility);
  };
}
