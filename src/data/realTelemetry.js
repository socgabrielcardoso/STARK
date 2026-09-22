export const REAL_TELEMETRY = Object.freeze({
  capturedAt:"2026-09-21T21:41:35-03:00",
  label:"REAL · SANITIZED SNAPSHOT",
  privacy:"Raw identifiers were intentionally not committed. Values below are sanitized aggregates derived from the supplied local Windows snapshots.",
  defender:{
    productVersion:"4.18.26080.4",runningMode:"Normal",serviceEnabled:true,antivirusEnabled:true,realTimeProtectionEnabled:true,tamperProtected:true,nisEnabled:true,onAccessProtectionEnabled:true,smartAppControl:"On",signaturesOutOfDate:false,signatureVersion:"1.459.324.0",signatureUpdated:"21/09/2026 11:07:22",quickScanAgeDays:4,fullScanAgeDays:45,rebootRequired:false
  },
  network:{
    observedStates:{established:25,listen:33,bound:22,timeWait:5},localAddress:"192.168.15.x",
    notableDestinations:[
      {service:"GitHub",port:443,state:"Established",source:"real-sanitized"},
      {service:"Microsoft",port:443,state:"Established",source:"real-sanitized"},
      {service:"HTTPS endpoint",port:443,state:"Established",source:"real-sanitized"},
      {service:"HTTP endpoint",port:80,state:"Established",source:"real-sanitized"}
    ]
  },
  windowsEvents:{
    parsedRows:3057,
    levels:{information:2308,warning:315,error:239,verbose:194,critical:1},
    topEventIds:[
      {id:5379,count:704,label:"Credential Manager credentials read"},
      {id:8001,count:437,label:"Store licensing activity"},
      {id:4798,count:177,label:"Local group membership enumerated"},
      {id:148,count:109,label:"Observed Windows event ID 148"},
      {id:285,count:101,label:"Hyper-V vSwitch statistics delay"},
      {id:2006,count:87,label:"Observed Windows event ID 2006"},
      {id:5858,count:79,label:"Observed Windows event ID 5858"},
      {id:8011,count:54,label:"Observed Windows event ID 8011"},
      {id:4624,count:47,label:"Successful account logon"},
      {id:4672,count:45,label:"Special privileges assigned"},
      {id:3033,count:43,label:"Code Integrity decision"},
      {id:3089,count:43,label:"Code Integrity signature information"}
    ],
    providers:[
      {name:"Security-Auditing",count:1007},
      {name:"Store",count:537},
      {name:"Hyper-V-VmSwitch",count:210},
      {name:"PushNotifications-Platform",count:177},
      {name:"Install-Agent",count:127},
      {name:"LiveId",count:106},
      {name:"WMI-Activity",count:101},
      {name:"CodeIntegrity",count:86},
      {name:"Security-Mitigations",count:65}
    ],
    samples:[
      {severity:"warning",provider:"KnownFolders",id:1002,message:"Access check returned 0x80070005"},
      {severity:"error",provider:"CodeIntegrity",id:3033,message:"Code Integrity reported a process decision"},
      {severity:"warning",provider:"Hyper-V-VmSwitch",id:285,message:"vSwitch statistics operation exceeded expected duration"},
      {severity:"info",provider:"Security-Auditing",id:4624,message:"Successful account logon"},
      {severity:"info",provider:"Security-Auditing",id:4672,message:"Special privileges assigned to new logon"}
    ]
  }
});
