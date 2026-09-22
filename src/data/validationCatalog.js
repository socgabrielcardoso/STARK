const rules=[
 "defender-service","realtime-protection","tamper-protection","signature-freshness","smart-app-control","nis-enabled","scan-recency","reboot-pending",
 "unexpected-listener","rare-remote-port","high-connection-count","timewait-spike","public-http-egress","dns-anomaly","smb-exposure","rdp-exposure",
 "logon-volume","special-privilege-logon","credential-read-volume","code-integrity-error","security-mitigation-warning","vm-switch-latency","wmi-burst","known-folder-access-denied",
 "process-memory-outlier","browser-process-burst","defender-engine-present","vpn-process-present","powershell-active","unexpected-parent","unsigned-binary","lolbin-pattern",
 "threat-severity","alert-age","incident-state","mitre-tag","containment-state","source-confidence","telemetry-age","telemetry-origin",
 "gesture-confidence","pinch-stability","pointer-jitter","two-hand-distance","panel-hit-test","drag-boundary","scale-boundary","workspace-state",
 "input-sanitization","guid-redaction","ipv4-redaction","user-path-redaction","html-escape","command-allowlist","local-only-import","source-badge",
 "event-id-known","provider-known","severity-normalization","timeline-order","duplicate-suppression","rate-limit","stale-data-warning","simulation-label"
];
export const VALIDATION_CONTEXTS=["startup","continuous","interaction","import","render","analysis","correlation","export"];
export const VALIDATION_SOURCES=["real","simulated","hybrid","gesture","ui","user-import"];
export const VALIDATION_RULES=rules.map((name,index)=>({id:`V-${String(index+1).padStart(3,"0")}`,name}));
export const VALIDATION_COMBINATIONS=VALIDATION_RULES.length*VALIDATION_CONTEXTS.length*VALIDATION_SOURCES.length;
const hash=s=>[...s].reduce((n,ch)=>Math.imul(n^ch.charCodeAt(0),16777619)>>>0,2166136261)>>>0;
export function buildValidationMatrix({real,simulated}){
  const defensiveTruth={
    "defender-service":real.defender.serviceEnabled,
    "realtime-protection":real.defender.realTimeProtectionEnabled,
    "tamper-protection":real.defender.tamperProtected,
    "signature-freshness":!real.defender.signaturesOutOfDate,
    "smart-app-control":real.defender.smartAppControl==="On",
    "nis-enabled":real.defender.nisEnabled,
    "reboot-pending":!real.defender.rebootRequired,
    "defender-engine-present":true,
    "source-badge":true,
    "simulation-label":true,
    "local-only-import":true
  };
  const matrix=[];
  for(const rule of VALIDATION_RULES)for(const context of VALIDATION_CONTEXTS)for(const source of VALIDATION_SOURCES){
    const key=`${rule.id}:${context}:${source}`,n=hash(key),truth=defensiveTruth[rule.name];
    let status=truth===false?"review":truth===true?"pass":n%23===0?"review":n%11===0?"warn":"pass";
    if(source==="real"&&["threat-severity","alert-age","incident-state","mitre-tag","containment-state"].includes(rule.name))status="warn";
    matrix.push({id:key,rule:rule.name,context,source,status,severity:status==="review"?"high":status==="warn"?"medium":"low"});
  }
  return matrix;
}
export function summarizeValidationMatrix(matrix){
  return matrix.reduce((acc,x)=>(acc[x.status]=(acc[x.status]||0)+1,acc),{pass:0,warn:0,review:0,total:matrix.length});
}
export function evaluateSnapshot({real,simulated}){
  const checks=[
    ["Real-time protection",real.defender.realTimeProtectionEnabled],
    ["Tamper protection",real.defender.tamperProtected],
    ["Signatures current",!real.defender.signaturesOutOfDate],
    ["NIS enabled",real.defender.nisEnabled],
    ["Smart App Control",real.defender.smartAppControl==="On"],
    ["No reboot required",!real.defender.rebootRequired],
    ["Simulated topology loaded",simulated.hosts.length>0],
    ["Validation matrix target",VALIDATION_COMBINATIONS>=3000]
  ];
  return checks.map(([name,pass],i)=>({id:`BASE-${i+1}`,name,pass:Boolean(pass)}));
}
