// Keep the existing resource/chat interface scoped to its mounted workspace.
// Personal shortcuts are never shared with another account on the same browser.
export function legacyWorkspaceScript(script:string,email:string,owner:boolean){
 const key='synapse-chats-v1:'+encodeURIComponent(email.toLowerCase());
 return script.replaceAll('document.querySelector(', 'container.querySelector(')
  .replaceAll('document.querySelectorAll(', 'container.querySelectorAll(')
  .replaceAll('document.addEventListener(', 'container.addEventListener(')
  .replace("window.addEventListener('hashchange',render);",'')
  .replace("current=location.hash.slice(1)||'home'",'current=initialView')
  .replace('window.scrollTo(0,0);','')
  .replace("localStorage.getItem('synapse-chats-v1')",`(localStorage.getItem(${JSON.stringify(key)})${owner?"||localStorage.getItem('synapse-chats-v1')":''})`)
  .replace("localStorage.setItem('synapse-chats-v1',",`localStorage.setItem(${JSON.stringify(key)},`);
}
