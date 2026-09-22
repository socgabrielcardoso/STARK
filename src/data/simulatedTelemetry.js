import {seeded,randomBetween} from "../utils/math.js";
const rng=seeded(0x57A2C);
const regions=["São Paulo","Virginia","Frankfurt","Singapore","Sydney","Tokyo","London"];
const protocols=["HTTPS","DNS","SSH","RDP","SMB","QUIC"];
export function buildSimulatedTelemetry(){
  const hosts=Array.from({length:18},(_,i)=>({id:`SIM-${String(i+1).padStart(2,"0")}`,name:["EDGE","SOC","DB","WEB","AUTH","DNS"][i%6]+`-${(i%9)+1}`,x:randomBetween(.08,.92,rng),y:randomBetween(.12,.88,rng),risk:Math.floor(randomBetween(3,82,rng)),source:"simulated"}));
  const links=Array.from({length:28},(_,i)=>({from:hosts[i%hosts.length].id,to:hosts[(i*5+3)%hosts.length].id,protocol:protocols[i%protocols.length],eps:Math.floor(randomBetween(2,900,rng)),source:"simulated"}));
  return{threatLevel:"LOW",secureScore:94,activeDevices:18,eps:Math.floor(randomBetween(220,480,rng)),throughputMbps:randomBetween(12,78,rng).toFixed(1),hosts,links,regions,
    alerts:[
      {title:"Impossible travel pattern",severity:"medium",status:"simulated"},
      {title:"Repeated auth failures",severity:"low",status:"simulated"},
      {title:"Unsigned PowerShell child process",severity:"medium",status:"simulated"},
      {title:"Outbound beacon-like interval",severity:"high",status:"simulated"}
    ]
  };
}
