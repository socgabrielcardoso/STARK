export function escapeHtml(value=""){return String(value).replace(/[&<>"']/g,(ch)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]))}
export function maskIPv4(ip){const p=String(ip).split(".");return p.length===4?`${p[0]}.${p[1]}.${p[2]}.x`:"masked"}
export function safeText(value,max=180){return String(value??"").replace(/[\u0000-\u001f]/g," ").slice(0,max)}
export function sanitizeImportedLog(text){return safeText(text,20000).replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g,maskIPv4).replace(/[A-F0-9]{8}-[A-F0-9-]{27,}/gi,"<GUID>").replace(/([A-Z]:\\Users\\)[^\\\s]+/gi,"$1<USER>")}
