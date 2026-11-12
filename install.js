let pendingInstall=null;
const installButton=document.getElementById('browserInstall');
function updateInstallState(){
  const standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  document.getElementById('installedStatus').hidden=!standalone;
  installButton.hidden=standalone||!pendingInstall;
}
window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();pendingInstall=event;updateInstallState();
});
installButton.addEventListener('click',async()=>{
  if(!pendingInstall)return;
  await pendingInstall.prompt();await pendingInstall.userChoice;
  pendingInstall=null;updateInstallState();
});
window.addEventListener('appinstalled',()=>{pendingInstall=null;updateInstallState();});
updateInstallState();
document.getElementById('shareInstall').addEventListener('click',async()=>{
  const url=new URL('./',location.href).href;
  const status=document.getElementById('shareStatus');
  try{
    if(navigator.share){await navigator.share({title:'LUMA — กล้องฟิล์มบนมือถือ',url});return;}
    await navigator.clipboard.writeText(url);status.textContent='คัดลอกลิงก์กล้องแล้ว';
  }catch(error){
    if(error.name==='AbortError')return;
    status.textContent='คัดลอกลิงก์หน้ากล้องจากแถบที่อยู่เพื่อแชร์';
  }
});
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{});}
