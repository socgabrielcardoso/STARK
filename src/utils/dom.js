export function el(tag,attrs={},...children){
  const node=document.createElement(tag);
  for(const [key,value] of Object.entries(attrs||{})){
    if(key==="class")node.className=value;
    else if(key==="dataset")Object.assign(node.dataset,value);
    else if(key.startsWith("on")&&typeof value==="function")node.addEventListener(key.slice(2).toLowerCase(),value);
    else if(value!==false&&value!=null)node.setAttribute(key,String(value));
  }
  for(const child of children.flat()){if(child==null)continue;node.append(child instanceof Node?child:document.createTextNode(String(child)))}
  return node;
}
export const qs=(selector,root=document)=>root.querySelector(selector);
export const qsa=(selector,root=document)=>[...root.querySelectorAll(selector)];
export function clear(node){while(node?.firstChild)node.firstChild.remove();return node}
export function icon(symbol,label){return el("span",{"aria-label":label||symbol,role:"img"},symbol)}
export function uid(prefix="stark"){return `${prefix}-${crypto.randomUUID?.()||Math.random().toString(36).slice(2)}`}
export function sourceBadge(type="simulated",label){const normalized=type.includes("real")?"real":type==="hybrid"?"hybrid":"simulated";return el("span",{class:`badge ${normalized}`},label||type.replaceAll("-"," ").toUpperCase())}
