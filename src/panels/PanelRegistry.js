import {el,clear} from "../utils/dom.js";
import {createPanel,metric,sectionTitle} from "./PanelFactory.js";
import {CommandCenter} from "./CommandCenter.js";
import {DefenderView} from "./DefenderView.js";
import {NetworkViz} from "./NetworkViz.js";
import {createRadar} from "./RadarViz.js";
import {GlobeViz} from "./GlobeViz.js";
import {FileExplorer} from "./FileExplorer.js";
import {ValidationView} from "./ValidationView.js";
import {EventStream} from "./EventStream.js";
import {DonnaView} from "./DonnaView.js";
import {gestureGuide} from "./GestureGuide.js";
import {incidentDesk} from "./IncidentDesk.js";
import {processView} from "./ProcessView.js";
export class PanelRegistry{
  constructor({bus,layer,panelManager}){this.bus=bus;this.layer=layer;this.pm=panelManager;this.panels=new Map()}
  add(spec){const p=createPanel(spec);this.layer.append(p);this.pm.register(p);this.panels.set(spec.id,p);return p}
  body(panel){return panel.querySelector(".hud-panel__body")}
  mount(){
    const command=new CommandCenter(this.bus);this.add({id:"command",title:"Cyber Command Center",source:"hybrid",x:18,y:18,w:380,h:330,content:command.root});
    const defender=new DefenderView(this.bus);this.add({id:"defender",title:"Defender Health",source:"real",x:18,y:370,w:355,h:260,content:defender.root});
    const net=new NetworkViz(this.bus);this.add({id:"network",title:"Interactive Network Map",source:"simulated",x:innerWidth-410,y:18,w:390,h:300,content:net.canvas});
    this.add({id:"radar",title:"Threat Radar",source:"simulated",x:innerWidth-380,y:338,w:350,h:285,content:createRadar()});
    const logs=new EventStream(this.bus);this.add({id:"logs",title:"Live Log Mixer",source:"hybrid",x:410,y:18,w:480,h:270,content:logs.root});
    const events=el("div");this.add({id:"event-intel",title:"Windows Event Intelligence",source:"real",x:410,y:310,w:430,h:300,content:events});
    const connections=el("div");this.add({id:"connections",title:"TCP Connections",source:"real",x:860,y:310,w:400,h:275,content:connections});
    const globe=new GlobeViz(this.bus);this.add({id:"globe",title:"Global Link Simulation",source:"simulated",x:420,y:80,w:430,h:330,content:globe.canvas});globe.start();
    const files=new FileExplorer(this.bus);this.add({id:"files",title:"Holographic File System",source:"hybrid",x:40,y:70,w:420,h:330,content:files.root});
    const validation=new ValidationView(this.bus);this.add({id:"validation",title:"Validation Matrix",source:"hybrid",x:480,y:90,w:420,h:340,content:validation.root});
    this.add({id:"gestures",title:"Gesture Lab",source:"simulated",x:920,y:80,w:340,h:300,content:gestureGuide()});
    const donna=new DonnaView(this.bus);this.add({id:"donna",title:"Donna AI",source:"hybrid",x:innerWidth-390,y:40,w:365,h:300,content:donna.root});
    this.add({id:"incidents",title:"Incident Desk",source:"hybrid",x:60,y:90,w:450,h:330,content:incidentDesk()});
    this.add({id:"processes",title:"Process Observatory",source:"real",x:530,y:80,w:400,h:300,content:processView()});
    this.bus.on("telemetry:update",s=>this.renderStatic(s,events,connections));this.bus.on("panel:open",({id})=>this.pm.show(id));
    return this;
  }
  renderStatic(s,events,connections){
    clear(events);events.append(metric("Parsed rows",s.real.windowsEvents.parsedRows.toLocaleString(),"real snapshot"),sectionTitle("Top event IDs"),...s.real.windowsEvents.topEventIds.slice(0,6).map(e=>el("div",{class:"list-row"},el("div",{class:"list-row__main"},el("strong",{},`Event ${e.id}`),el("small",{},e.label)),el("span",{class:"badge real"},e.count))));
    clear(connections);connections.append(metric("Established",s.real.network.observedStates.established,"real aggregate"),sectionTitle("Observed destinations"),...s.real.network.notableDestinations.map(x=>el("div",{class:"list-row"},el("div",{class:"list-row__main"},el("strong",{},x.service),el("small",{},`TCP/${x.port} · ${x.state}`)),el("span",{class:"badge real"},"SANITIZED"))));
  }
}
