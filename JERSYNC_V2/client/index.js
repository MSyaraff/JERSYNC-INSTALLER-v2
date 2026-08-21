
function restoreLastMaster(){
  evalHost("JV2_getRememberedMaster()",function(r){
    if(r && r.indexOf("OK|")===0){
      state.masterPath=r.substring(3);
      document.getElementById("masterPath").value=state.masterPath;
      setStatus("Master terakhir dimuatkan semula.","ok");
    }else if(r==="MISSING"){
      state.masterPath="";
      document.getElementById("masterPath").value="";
      setStatus("Master terakhir dah dipindah/dipadam. Pilih semula.");
    }
  });
}

var cs=new CSInterface();

var state={
  masterPath:"",
  outputPath:"",
  jobs:[],
  selectedSizes:[]
};

function esc(s){
  return String(s).replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g,"\\n");
}
function evalHost(code,cb){cs.evalScript(code,function(r){if(cb)cb(r);});}
function setStatus(t,c){
  var e=document.getElementById("status");
  e.textContent=t;
  e.className="status"+(c?" "+c:"");
}
function sizeRank(s){
  var order=["XS","S","M","L","XL","2XL","3XL","4XL","5XL","6XL","7XL","8XL","9XL","10XL"];
  var i=order.indexOf(s); return i<0?999:i;
}
function renderQueue(){
  var q=document.getElementById("queue");

  if(!state.jobs.length){
    q.className="queue empty";
    q.innerHTML='<div class="empty-msg">Belum ada pola.</div>';
    return;
  }

  q.className="queue";
  q.innerHTML="";

  var groups={};

  state.jobs.forEach(function(j,idx){
    if(!groups[j.type])groups[j.type]={SS:[],LS:[],BOTH:[]};

    if(!groups[j.type][j.sleeve]){
      groups[j.type][j.sleeve]=[];
    }

    groups[j.type][j.sleeve].push({
      job:j,
      index:idx
    });
  });

  ["RN","POLO","VNECK","MUSV","VFLAT"].forEach(function(type){
    if(!groups[type])return;

    var total=0;
    ["SS","LS","BOTH"].forEach(function(sleeve){
      total+=groups[type][sleeve].length;
    });

    var wrap=document.createElement("div");
    wrap.className="queue-group";

    var head=document.createElement("div");
    head.className="queue-group-head";
    head.innerHTML=
      '<span class="queue-type-title">'+type+'</span>'+
      '<span class="queue-count">'+total+' POLA</span>';

    wrap.appendChild(head);

    ["SS","LS","BOTH"].forEach(function(sleeve){
      var items=groups[type][sleeve];
      if(!items || !items.length)return;

      items=items.slice().sort(function(a,b){
        return sizeRank(a.job.size)-sizeRank(b.job.size);
      });

      var sleeveBlock=document.createElement("div");
      sleeveBlock.className="queue-sleeve-block";

      var sleeveHead=document.createElement("div");
      sleeveHead.className="queue-sleeve-head";
      sleeveHead.innerHTML=
        '<span class="queue-sleeve-title">'+sleeve+'</span>'+
        '<span class="queue-sleeve-count">'+items.length+'</span>';

      sleeveBlock.appendChild(sleeveHead);

      var list=document.createElement("div");
      list.className="queue-size-list";

      items.forEach(function(it){
        var chip=document.createElement("div");
        chip.className="queue-size-item clear-item";
        chip.innerHTML=
          '<span class="queue-size-main">'+it.job.size+'</span>'+
          '<button data-index="'+it.index+'" title="Buang">×</button>';

        list.appendChild(chip);
      });

      sleeveBlock.appendChild(list);
      wrap.appendChild(sleeveBlock);
    });

    q.appendChild(wrap);
  });

  q.querySelectorAll(".queue-size-item button").forEach(function(b){
    b.onclick=function(){
      state.jobs.splice(
        parseInt(this.getAttribute("data-index"),10),
        1
      );
      renderQueue();
    };
  });
}

function resetSizePicker(){
  state.selectedSizes=[];
  document.querySelectorAll(".size-chip").forEach(function(b){b.classList.remove("active");});
}
document.querySelectorAll(".size-chip").forEach(function(b){
  b.onclick=function(){
    var size=this.getAttribute("data-size"),i=state.selectedSizes.indexOf(size);
    if(i>=0){state.selectedSizes.splice(i,1);this.classList.remove("active");}
    else{state.selectedSizes.push(size);this.classList.add("active");}
  };
});
function syncSleeveForPattern(){
  var type=document.getElementById("patternType").value;
  var sleeve=document.getElementById("patternSleeve");
  if(type==="MUSV"){
    sleeve.value="LS";
    sleeve.disabled=true;
  }else{
    sleeve.disabled=false;
  }
}
document.getElementById("patternType").onchange=function(){
  resetSizePicker();
  syncSleeveForPattern();
};
document.getElementById("addPatterns").onclick=function(){
  if(!state.selectedSizes.length){
    setStatus("Pilih sekurang-kurangnya satu saiz.","bad");
    return;
  }

  var type=document.getElementById("patternType").value;
  var sleeve=document.getElementById("patternSleeve").value;
  var added=0;
  var merged=0;
  var skipped=0;

  state.selectedSizes
    .slice()
    .sort(function(a,b){return sizeRank(a)-sizeRank(b);})
    .forEach(function(size){

      // One TYPE + SIZE only in the list.
      // SS + LS for the same TYPE + SIZE becomes BOTH automatically.
      var existingIndex=-1;
      for(var i=0;i<state.jobs.length;i++){
        if(state.jobs[i].type===type && state.jobs[i].size===size){
          existingIndex=i;
          break;
        }
      }

      if(existingIndex<0){
        state.jobs.push({
          type:type,
          size:size,
          sleeve:sleeve
        });
        added++;
        return;
      }

      var existing=state.jobs[existingIndex];

      if(existing.sleeve==="BOTH"){
        skipped++;
        return;
      }

      if(sleeve==="BOTH"){
        existing.sleeve="BOTH";
        merged++;
        return;
      }

      if(existing.sleeve===sleeve){
        skipped++;
        return;
      }

      // Opposite SS / LS found -> merge into BOTH.
      if(
        (existing.sleeve==="SS" && sleeve==="LS") ||
        (existing.sleeve==="LS" && sleeve==="SS")
      ){
        existing.sleeve="BOTH";
        merged++;
        return;
      }

      skipped++;
    });

  renderQueue();

  var parts=[];
  if(added)parts.push(added+" pola ditambah");
  if(merged)parts.push(merged+" saiz jadi BOTH");
  if(skipped)parts.push(skipped+" duplicate diabaikan");

  setStatus(parts.length?parts.join(" • "):"Tiada perubahan pada list.", added||merged?"ok":"bad");
  resetSizePicker();
}

document.getElementById("clearQueue").onclick=function(){
  state.jobs=[];
  renderQueue();
  setStatus("List pola dikosongkan.");
};

document.getElementById("checkArtwork").onclick=function(){
  evalHost("JV2_checkArtwork()",function(r){
    var ok=r&&r.indexOf("OK|")===0;
    document.getElementById("artworkState").textContent=ok?r.substring(3):(r||"Gagal");
    document.getElementById("artworkState").className="mini-check-state "+(ok?"ok":"bad");
    setStatus(ok?"Artwork structure OK.":(r||"Artwork check gagal."),ok?"ok":"bad");
  });
};

document.getElementById("chooseMaster").onclick=function(){
  evalHost("JV2_chooseMaster()",function(r){
    if(r&&r.indexOf("OK|")===0){
      state.masterPath=r.substring(3);
      document.getElementById("masterPath").value=state.masterPath;
      setStatus("Universal master dipilih dan diingati.","ok");
    }else if(r!=="CANCEL"){
      setStatus(r||"Tak dapat pilih master.","bad");
    }
  });
};

document.getElementById("chooseOutput").onclick=function(){
  evalHost("JV2_chooseOutput()",function(r){
    if(r&&r.indexOf("OK|")===0){
      state.outputPath=r.substring(3);
      document.getElementById("outputPath").value=state.outputPath;
      setStatus("Output dipilih.","ok");
    }else if(r!=="CANCEL"){
      setStatus(r||"Tak dapat pilih output.","bad");
    }
  });
};


document.getElementById("advancedToggle").onclick=function(){
  var body=document.getElementById("advancedBody");
  var arrow=document.getElementById("advancedArrow");
  var open=!body.classList.contains("hidden");
  if(open){
    body.classList.add("hidden");
    arrow.textContent="⌄";
  }else{
    body.classList.remove("hidden");
    arrow.textContent="⌃";
  }
};


function saveStrokeSettings(){
  var enabled=document.getElementById("strokeOn").checked?1:0;
  var width=document.getElementById("strokeWidth").value;
  var color=document.getElementById("strokeColor").value;

  evalHost(
    'JV2_saveStrokeSettings("'+enabled+'","'+esc(width)+'","'+esc(color)+'")',
    function(){}
  );
}

function restoreStrokeSettings(){
  evalHost("JV2_getStrokeSettings()",function(r){
    if(!r || r.indexOf("OK|")!==0)return;

    var p=r.split("|");
    if(p.length<4)return;

    document.getElementById("strokeOn").checked=(p[1]==="1");
    document.getElementById("strokeWidth").value=p[2];
    document.getElementById("strokeColor").value=p.slice(3).join("|");
  });
}

document.getElementById("generate").onclick=function(){
  var generateStartedAt=(new Date()).getTime();
  if(!state.masterPath){setStatus("Pilih Universal Master Pola dulu.","bad");return;}
  if(!state.outputPath){setStatus("Pilih SAVE AS dulu.","bad");return;}
  if(!state.jobs.length){setStatus("Tambah sekurang-kurangnya satu job.","bad");return;}

  // Fixed engine layouts:
  // STANDARD = 4 columns × 2 rows
  // MUSV     = 3 columns × 2 rows
  var gap=20;

  var jobs=[];
  state.jobs.forEach(function(j){
    jobs.push([j.type,j.size,j.sleeve].join("|"));
  });

  var standardCount=0;
  var musvCount=0;

  state.jobs.forEach(function(j){
    if(j.type==="MUSV")musvCount++;
    else standardCount++;
  });

  var standardFiles=standardCount?Math.ceil(standardCount/8):0;
  var musvFiles=musvCount?Math.ceil(musvCount/6):0;
  var fileCount=standardFiles+musvFiles;

  setStatus(
    "Generating V2...\n"+
    standardCount+" standard • "+
    musvCount+" MUSV • "+
    fileCount+" file"
  );
  var fixedObjects=document.getElementById("fixedObjects").checked?1:0;
  var sizeLabelOn=document.getElementById("sizeLabelOn").checked?1:0;
  var strokeOn=document.getElementById("strokeOn").checked?1:0;
  var strokeWidth=parseFloat(document.getElementById("strokeWidth").value);
  if(isNaN(strokeWidth))strokeWidth=0.5;
  var strokeColor=document.getElementById("strokeColor").value;

  var call='JV2_generate("'+esc(state.masterPath)+'","'+esc(state.outputPath)+'","'+esc(jobs.join(";"))+'","'+gap+'","'+fixedObjects+'","'+sizeLabelOn+'","'+strokeOn+'","'+strokeWidth+'","'+esc(strokeColor)+'")';
  evalHost(call,function(r){
    var ok=r&&r.indexOf("OK|")===0;
    var elapsed=((new Date()).getTime()-generateStartedAt)/1000;
    var text=ok?r.substring(3):(r||"Generate V2 gagal.");

    if(ok && text.indexOf("Masa generate:")<0){
      text+="\nMasa generate: "+elapsed.toFixed(1)+" saat";
    }

    setStatus(text,ok?"ok":"bad");
  });
};

document.getElementById("strokeOn").onchange=saveStrokeSettings;
document.getElementById("strokeWidth").onchange=saveStrokeSettings;
document.getElementById("strokeWidth").onblur=saveStrokeSettings;
document.getElementById("strokeColor").onchange=saveStrokeSettings;

renderQueue();
restoreLastMaster();
restoreStrokeSettings();
syncSleeveForPattern();

// ===== JERSYNC V2 UPDATER =====
var JERSYNC_V2_CURRENT_VERSION="2.0.3";
var JERSYNC_V2_UPDATE_URL="https://raw.githubusercontent.com/MSyaraff/JERSYNC-UPDATE/main/version-v2.json";
var JERSYNC_V2_LATEST_INFO=null;

function compareVersionsV2(a,b){
  var aa=String(a||"0").split(".");
  var bb=String(b||"0").split(".");
  var len=Math.max(aa.length,bb.length);
  for(var i=0;i<len;i++){
    var av=parseInt(aa[i]||"0",10);
    var bv=parseInt(bb[i]||"0",10);
    if(av>bv)return 1;
    if(av<bv)return -1;
  }
  return 0;
}

function setUpdateDotV2(cls){
  var d=document.getElementById("updateDot");
  if(d)d.className="update-dot "+(cls||"idle");
}

function setUpdateStateV2(title,notes,cls,meta){
  var s=document.getElementById("updateState");
  var n=document.getElementById("updateNotes");
  var m=document.getElementById("updateMeta");

  if(s){
    s.textContent=title||"";
    s.className="update-state"+(cls?(" "+cls):"");
  }
  if(n)n.textContent=notes||"";
  if(m)m.textContent=meta||("Versi semasa: v"+JERSYNC_V2_CURRENT_VERSION);

  setUpdateDotV2(cls||"idle");
}

function setChangelogV2(text){
  var wrap=document.getElementById("changelogWrap");
  var el=document.getElementById("updateChangelog");
  if(!wrap||!el)return;

  var value=String(text||"").replace(/^\s+|\s+$/g,"");
  if(!value){
    wrap.classList.add("hidden");
    el.textContent="";
    return;
  }

  el.textContent=value;
  wrap.classList.remove("hidden");
}

function getPlatformInstallerV2(info){
  var p=(navigator.platform||navigator.userAgent||"").toLowerCase();
  if(p.indexOf("mac")>=0)return info.mac_url||"";
  return info.windows_url||"";
}

function checkForJersyncV2Updates(){
  var btn=document.getElementById("checkUpdates");
  var dl=document.getElementById("downloadUpdate");
  var hint=document.getElementById("installHint");

  if(btn){
    btn.disabled=true;
    btn.textContent="CHECKING...";
  }

  if(dl)dl.classList.add("hidden");
  if(hint)hint.classList.add("hidden");
  setChangelogV2("");

  setUpdateStateV2(
    "Sedang semak...",
    "Menghubungi JERSYNC V2 Update Channel.",
    "loading",
    "Versi semasa: v"+JERSYNC_V2_CURRENT_VERSION
  );

  var xhr=new XMLHttpRequest();
  xhr.open("GET",JERSYNC_V2_UPDATE_URL+"?t="+(new Date().getTime()),true);
  xhr.timeout=12000;

  function resetButton(){
    if(btn){
      btn.disabled=false;
      btn.textContent="CHECK FOR UPDATES";
    }
  }

  xhr.onreadystatechange=function(){
    if(xhr.readyState!==4)return;
    resetButton();

    if(xhr.status>=200&&xhr.status<300){
      try{
        var info=JSON.parse(xhr.responseText);
        JERSYNC_V2_LATEST_INFO=info;

        var latest=String(info.version||"");
        if(!latest)throw new Error("Version missing");

        var cmp=compareVersionsV2(JERSYNC_V2_CURRENT_VERSION,latest);
        var notes=info.notes||"";
        var changelog=info.changelog||notes||"";

        if(cmp<0){
          setUpdateStateV2(
            "Update tersedia — v"+latest,
            "Versi baru JERSYNC V2 telah tersedia.",
            "warn",
            "v"+JERSYNC_V2_CURRENT_VERSION+"  →  v"+latest
          );

          setChangelogV2(changelog);

          if(dl){
            dl.textContent="DOWNLOAD UPDATE v"+latest;
            dl.classList.remove("hidden");
          }
          if(hint)hint.classList.remove("hidden");

        }else if(cmp===0){
          setUpdateStateV2(
            "JERSYNC V2 sudah terkini",
            "Tiada update baru buat masa ini.",
            "ok",
            "Versi semasa: v"+JERSYNC_V2_CURRENT_VERSION
          );
          setChangelogV2("");

        }else{
          setUpdateStateV2(
            "Build ini lebih baru",
            "Versi plugin ini lebih baru daripada release online.",
            "ok",
            "Local v"+JERSYNC_V2_CURRENT_VERSION+" • Online v"+latest
          );
          setChangelogV2("");
        }

      }catch(e){
        setUpdateStateV2(
          "Data update tak dapat dibaca",
          "version-v2.json tidak sah atau belum tersedia.",
          "bad",
          "Versi semasa: v"+JERSYNC_V2_CURRENT_VERSION
        );
      }
    }else{
      setUpdateStateV2(
        "Tak dapat semak update",
        "Semak internet dan cuba lagi. JERSYNC V2 masih boleh digunakan seperti biasa.",
        "bad",
        "Versi semasa: v"+JERSYNC_V2_CURRENT_VERSION
      );
    }
  };

  xhr.ontimeout=function(){
    resetButton();
    setUpdateStateV2(
      "Connection timeout",
      "Tak dapat hubungi server update. Cuba lagi.",
      "bad",
      "Versi semasa: v"+JERSYNC_V2_CURRENT_VERSION
    );
  };

  xhr.onerror=function(){
    resetButton();
    setUpdateStateV2(
      "Tiada sambungan",
      "Semak internet dan cuba lagi.",
      "bad",
      "Versi semasa: v"+JERSYNC_V2_CURRENT_VERSION
    );
  };

  try{
    xhr.send();
  }catch(e){
    resetButton();
    setUpdateStateV2(
      "Tak dapat semak update",
      String(e),
      "bad",
      "Versi semasa: v"+JERSYNC_V2_CURRENT_VERSION
    );
  }
}

document.getElementById("checkUpdates").onclick=checkForJersyncV2Updates;

document.getElementById("downloadUpdate").onclick=function(){
  if(!JERSYNC_V2_LATEST_INFO){
    setUpdateStateV2(
      "Semak update dahulu",
      "Tekan CHECK FOR UPDATES dahulu.",
      "bad",
      "Versi semasa: v"+JERSYNC_V2_CURRENT_VERSION
    );
    return;
  }

  var url=getPlatformInstallerV2(JERSYNC_V2_LATEST_INFO);

  if(!url){
    setUpdateStateV2(
      "Installer tak tersedia",
      "Link installer untuk platform ini kosong.",
      "bad",
      "Versi semasa: v"+JERSYNC_V2_CURRENT_VERSION
    );
    return;
  }

  try{
    var csUpdate=new CSInterface();
    csUpdate.openURLInDefaultBrowser(url);

    setUpdateStateV2(
      "Installer dibuka",
      "Download installer, tutup Illustrator, kemudian install versi baru.",
      "ok",
      "Update: v"+String(JERSYNC_V2_LATEST_INFO.version||"")
    );

    var hint=document.getElementById("installHint");
    if(hint)hint.classList.remove("hidden");

  }catch(e){
    window.open(url,"_blank");
  }
};

