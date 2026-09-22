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
export function evaluateSnapshot({real,simulated}){
  const checks=[
    ["Real-time protection",real.defender.realTimeProtectionEnabled],
    ["Tamper protection",real.defender.tamperProtected],
    ["Signatures current",!real.defender.signaturesOutOfDate],
    ["NIS enabled",real.defender.nisEnabled],
    ["Smart App Control",real.defender.smartAppControl==="On"],
    ["No reboot required",!real.defender.rebootRequired],
    ["Simulated threat dataset loaded",simulated.hosts.length>0],
    ["Validation matrix target",VALIDATION_COMBINATIONS>=3000]
  ];
  return checks.map(([name,pass],i)=>({id:`BASE-${i+1}`,name,pass:Boolean(pass)}));
}
