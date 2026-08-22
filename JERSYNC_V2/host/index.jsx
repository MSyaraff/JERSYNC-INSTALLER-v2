#target illustrator

var JV2_OPT_FIXED=true;
var JV2_OPT_SIZELABEL=true;
var JV2_OPT_STROKE=true;
var JV2_OPT_STROKE_WIDTH=0.5;
var JV2_OPT_STROKE_COLOR="Black";

function JV2_strokeColor(name){
    var c=new CMYKColor();
    c.cyan=0;c.magenta=0;c.yellow=0;c.black=100;
    if(name==="White"){c.black=0;}
    else if(name==="Red"){c.magenta=100;c.yellow=100;c.black=0;}
    else if(name==="Blue"){c.cyan=100;c.magenta=60;c.black=0;}
    else if(name==="Green"){c.cyan=100;c.yellow=100;c.black=0;}
    else if(name==="Yellow"){c.yellow=100;c.black=0;}
    else if(name==="Magenta"){c.magenta=100;c.black=0;}
    else if(name==="Cyan"){c.cyan=100;c.black=0;}
    return c;
}

function JV2_settingsFolder(){
    var f=new Folder(Folder.userData.fsName+"/JERSYNC_V2");
    if(!f.exists)try{f.create();}catch(e){}
    return f;
}
function JV2_strokeSettingsFile(){
    return new File(JV2_settingsFolder().fsName+"/stroke_settings.txt");
}
function JV2_saveStrokeSettings(enabled,width,color){
    try{
        var f=JV2_strokeSettingsFile();
        f.encoding="UTF-8";
        if(!f.open("w"))return"ERR";
        var w=parseFloat(width);
        if(isNaN(w))w=0.5;
        f.write((String(enabled)==="1"?"1":"0")+"|"+w+"|"+String(color||"Black"));
        f.close();
        return"OK";
    }catch(e){
        return"ERR";
    }
}
function JV2_getStrokeSettings(){
    try{
        var f=JV2_strokeSettingsFile();
        if(!f.exists)return"NONE";
        f.encoding="UTF-8";
        if(!f.open("r"))return"NONE";
        var raw=f.read();
        f.close();
        if(!raw)return"NONE";
        var p=raw.split("|");
        if(p.length<3)return"NONE";
        return"OK|"+p[0]+"|"+p[1]+"|"+p.slice(2).join("|");
    }catch(e){
        return"NONE";
    }
}

function JV2_masterSettingsFile(){
    return new File(JV2_settingsFolder().fsName+"/last_master.txt");
}
function JV2_saveRememberedMaster(p){
    try{
        var f=JV2_masterSettingsFile();
        f.encoding="UTF-8";
        if(f.open("w")){
            f.write(p||"");
            f.close();
            return"OK";
        }
    }catch(e){}
    return"ERR";
}
function JV2_getRememberedMaster(){
    try{
        var f=JV2_masterSettingsFile();
        if(!f.exists)return"NONE";
        f.encoding="UTF-8";
        if(!f.open("r"))return"NONE";
        var p=f.read();
        f.close();
        if(!p)return"NONE";
        var mf=new File(p);
        return mf.exists ? ("OK|"+mf.fsName) : "MISSING";
    }catch(e){
        return"NONE";
    }
}

function JV2_fileExists(p){
    try{
        if(!p)return"NO";
        return new File(p).exists?"YES":"NO";
    }catch(e){
        return"NO";
    }
}
function JV2_chooseMaster(){
    var f=File.openDialog("Pilih JERSYNC V2 Universal Master","*.ai");
    if(!f)return"CANCEL";
    JV2_saveRememberedMaster(f.fsName);
    return"OK|"+f.fsName;
}
function JV2_chooseOutput(){
    var f=File.saveDialog("Save JERSYNC V2 Output","*.ai");
    if(!f)return"CANCEL";
    if(!/\.ai$/i.test(f.name))f=new File(f.fsName+".ai");
    return"OK|"+f.fsName;
}
function JV2_findLayer(doc,n){
    for(var i=0;i<doc.layers.length;i++)if(doc.layers[i].name===n)return doc.layers[i];
    return null;
}
function JV2_findItem(c,n){
    var a;try{a=c.pageItems;}catch(e){return null;}
    for(var i=0;i<a.length;i++)if(a[i].name===n)return a[i];
    for(var j=0;j<a.length;j++)if(a[j].typename==="GroupItem"){
        var f=JV2_findItem(a[j],n);if(f)return f;
    }
    return null;
}
function JV2_findGroup(c,n){
    var g;try{g=c.groupItems;}catch(e){return null;}
    for(var i=0;i<g.length;i++)if(g[i].name===n)return g[i];
    for(var j=0;j<g.length;j++){
        var f=JV2_findGroup(g[j],n);if(f)return f;
    }
    return null;
}
function JV2_findDirectGroup(c,n){
    var g;try{g=c.groupItems;}catch(e){return null;}
    for(var i=0;i<g.length;i++)if(g[i].name===n)return g[i];
    return null;
}
function JV2_b(i){return i.geometricBounds;}
function JV2_w(b){return b[2]-b[0];}
function JV2_h(b){return b[1]-b[3];}
function JV2_cx(b){return(b[0]+b[2])/2;}
function JV2_cy(b){return(b[1]+b[3])/2;}
function JV2_clipCandidate(i){
    if(!i)return null;
    if(i.typename==="PathItem"||i.typename==="CompoundPathItem")return i;
    if(i.typename==="GroupItem"){
        if(i.compoundPathItems.length>0)return i.compoundPathItems[0];
        for(var x=0;x<i.pathItems.length;x++)if(!i.pathItems[x].guides)return i.pathItems[x];
        for(var y=0;y<i.pageItems.length;y++){
            var c=JV2_clipCandidate(i.pageItems[y]);if(c)return c;
        }
    }
    return null;
}
function JV2_removeNamed(c,n){
    var i=JV2_findItem(c,n);
    if(i)try{i.locked=false;i.hidden=false;i.remove();}catch(e){}
}
function JV2_removeGroup(c,n){
    var g=JV2_findGroup(c,n);
    if(g)try{g.locked=false;g.hidden=false;g.remove();}catch(e){}
}
function JV2_text(c,n,v){
    var i=JV2_findItem(c,n);
    if(i&&i.typename==="TextFrame"){i.contents=v;return true;}
    return false;
}
function JV2_tagData(src,refName){
    var t=JV2_findGroup(src,"SIZE_TAG"),r=JV2_findItem(src,refName);
    if(!t||!r)return null;
    var rb=JV2_b(r),tb=JV2_b(t),rw=JV2_w(rb),rh=JV2_h(rb);
    if(!rw||!rh)return null;
    return{tag:t,rx:(JV2_cx(tb)-rb[0])/rw,ry:(rb[1]-JV2_cy(tb))/rh};
}
function JV2_addTag(src,refName,target,dLayer,dGroup,size,part,type){
    var d=JV2_tagData(src,refName);if(!d)return;
    var tb=JV2_b(target),x=tb[0]+d.rx*JV2_w(tb),y=tb[1]-d.ry*JV2_h(tb);
    var q=d.tag.duplicate(dLayer,ElementPlacement.PLACEATEND);
    q.name="SIZE_TAG";
    JV2_text(q,"TAG_SIZE",size);
    JV2_text(q,"TAG_PART",part);
    JV2_text(q,"TAG_TYPE",type);
    var qb=JV2_b(q);
    q.translate(x-JV2_cx(qb),y-JV2_cy(qb));
    q.move(dGroup,ElementPlacement.PLACEATEND);
    try{q.zOrder(ZOrderMethod.BRINGTOFRONT);}catch(e){}
}
function JV2_fixedData(src,refName){
    var g=JV2_findGroup(src,"FIXED_OBJECT");
    if(!g)g=JV2_findGroup(src,"FIXED_OBJECTS");
    var r=JV2_findItem(src,refName);
    if(!g||!r)return null;
    var rb=JV2_b(r),gb=JV2_b(g),rw=JV2_w(rb),rh=JV2_h(rb);
    if(!rw||!rh)return null;
    return{group:g,rx:(JV2_cx(gb)-rb[0])/rw,ry:(rb[1]-JV2_cy(gb))/rh};
}
function JV2_addFixed(src,refName,target,dLayer,dGroup){
    var d=JV2_fixedData(src,refName);if(!d)return;
    var tb=JV2_b(target),x=tb[0]+d.rx*JV2_w(tb),y=tb[1]-d.ry*JV2_h(tb);
    var q=d.group.duplicate(dLayer,ElementPlacement.PLACEATEND);
    q.name="FIXED_OBJECT";
    var qb=JV2_b(q);q.translate(x-JV2_cx(qb),y-JV2_cy(qb));
    q.move(dGroup,ElementPlacement.PLACEATEND);
    try{q.zOrder(ZOrderMethod.BRINGTOFRONT);}catch(e){}
}
function JV2_addVisibleOutline(sourcePath,dGroup){
    if(!JV2_OPT_STROKE || !sourcePath)return null;

    try{
        var width=Number(JV2_OPT_STROKE_WIDTH);
        if(isNaN(width))width=0.5;
        if(width<0)width=0;

        var col=JV2_strokeColor(JV2_OPT_STROKE_COLOR);
        var o=sourcePath.duplicate(dGroup,ElementPlacement.PLACEATEND);
        o.name="PATTERN_STROKE";

        function stylePath(p){
            try{
                p.filled=false;
                p.stroked=true;
                p.strokeWidth=width;
                p.strokeColor=col;
            }catch(e){}
        }

        function walk(item){
            if(!item)return;

            if(item.typename==="PathItem"){
                stylePath(item);
                return;
            }

            if(item.typename==="CompoundPathItem"){
                for(var i=0;i<item.pathItems.length;i++)stylePath(item.pathItems[i]);
                return;
            }

            if(item.typename==="GroupItem"){
                for(var j=0;j<item.pageItems.length;j++)walk(item.pageItems[j]);
            }
        }

        walk(o);

        try{o.zOrder(ZOrderMethod.BRINGTOFRONT);}catch(e2){}

        // Re-apply exact width after duplication/z-order.
        walk(o);
        return o;
    }catch(e){
        return null;
    }
}

function JV2_mark(mark,dLayer,dGroup){
    if(!mark)return;
    try{
        var q=mark.duplicate(dLayer,ElementPlacement.PLACEATEND);
        q.name="FRONT_MARK";
        q.move(dGroup,ElementPlacement.PLACEATEND);
        try{q.zOrder(ZOrderMethod.BRINGTOFRONT);}catch(e2){}
    }catch(e){}
}
function JV2_applyPart(src,refName,target,dLayer,dGroup,name,size,part,type,mark){
    if(!src||!target)return false;
    var sr=JV2_findItem(src,refName);
    if(!sr)return false;

    var sb=JV2_b(sr),tb=JV2_b(target);
    var sw=JV2_w(sb),sh=JV2_h(sb),tw=JV2_w(tb),th=JV2_h(tb);
    if(!sw||!sh||!tw||!th)return false;

    var dup=src.duplicate(dLayer,ElementPlacement.PLACEATEND);
    dup.name=name+"_ART";
    JV2_removeGroup(dup,"SIZE_TAG");
    JV2_removeGroup(dup,"FIXED_OBJECT");
    JV2_removeGroup(dup,"FIXED_OBJECTS");

    var dr=JV2_findItem(dup,refName);
    if(!dr){try{dup.remove();}catch(e){}return false;}

    dup.resize((tw/sw)*100,(th/sh)*100,true,true,true,true,100,Transformation.TOPLEFT);
    dr=JV2_findItem(dup,refName);
    var db=JV2_b(dr);
    dup.translate(tb[0]-db[0],tb[1]-db[1]);
    JV2_removeNamed(dup,refName);

    var cp=JV2_clipCandidate(target);
    if(!cp){try{dup.remove();}catch(e){}return false;}

    var outer=dGroup.groupItems.add();
    outer.name=name+"_FINAL";
    var cg=outer.groupItems.add();
    cg.name="CLIPPED_ARTWORK";
    dup.move(cg,ElementPlacement.PLACEATEND);

    var mask=cp.duplicate(cg,ElementPlacement.PLACEATBEGINNING);
    mask.name="CLIP_MASK";
    try{
        if(mask.typename==="PathItem"){
            mask.clipping=true;
            mask.filled=false;
            mask.stroked=false;
        }else{
            for(var k=0;k<mask.pathItems.length;k++){
                mask.pathItems[k].clipping=true;
                mask.pathItems[k].filled=false;
                mask.pathItems[k].stroked=false;
            }
        }
    }catch(e){}
    cg.clipped=true;

    if(JV2_OPT_FIXED)JV2_addFixed(src,refName,target,dLayer,outer);
    JV2_addTag(src,refName,target,dLayer,outer,size,part,type);
    if(mark)JV2_mark(mark,dLayer,outer);

    // Visible stroke must be a separate outline object.
    // A clipping mask's own stroke is not reliable in Illustrator.
    JV2_addVisibleOutline(cp,outer);

    try{target.locked=false;target.hidden=false;target.remove();}catch(e){}
    if(mark)try{mark.locked=false;mark.hidden=false;mark.remove();}catch(e){}
    return true;
}
function JV2_getArtwork(){
    if(app.documents.length===0)return null;
    var d=app.activeDocument;
    var g=JV2_findGroup(d,"ARTWORK_L");
    if(!g){
        var ly=JV2_findLayer(d,"ARTWORK_L");
        if(ly)g=ly;
    }
    return g;
}
function JV2_getArtworkForTypeFromDoc(doc,type){
    if(!doc)return null;
    var name=(type==="MUSV")?"ARTWORK_MUS":"ARTWORK_L";

    var g=JV2_findGroup(doc,name);
    if(!g){
        var ly=JV2_findLayer(doc,name);
        if(ly)g=ly;
    }
    return g;
}

function JV2_getArtworkForType(type){
    if(app.documents.length===0)return null;
    return JV2_getArtworkForTypeFromDoc(app.activeDocument,type);
}
function JV2_componentNamesForType(type){
    if(type==="MUSV"){
        return{
            front:"BODY_FRONT_MUS",
            back:"BODY_BACK_MUS",
            ssr:null,
            ssl:null,
            lsr:"SLEEVE_RIGHT_MUS",
            lsl:"SLEEVE_LEFT_MUS"
        };
    }
    return{
        front:"BODY_FRONT",
        back:"BODY_BACK",
        ssr:"SLEEVE_SS_RIGHT",
        ssl:"SLEEVE_SS_LEFT",
        lsr:"SLEEVE_LS_RIGHT",
        lsl:"SLEEVE_LS_LEFT"
    };
}

function JV2_checkArtwork(){
    try{
        if(app.documents.length===0)return"ERR|Buka fail artwork dulu.";
        var d=app.activeDocument;

        var messages=[];
        var failed=false;

        // STANDARD ARTWORK_L
        var std=JV2_getArtworkForTypeFromDoc?JV2_getArtworkForTypeFromDoc(d,"RN"):JV2_getArtwork();
        if(!std){
            messages.push("STANDARD: ARTWORK_L tak jumpa");
            failed=true;
        }else{
            var reqStd=[
                ["BODY_FRONT","F"],
                ["BODY_BACK","B"],
                ["SLEEVE_SS_RIGHT","RSS"],
                ["SLEEVE_SS_LEFT","LSS"],
                ["SLEEVE_LS_RIGHT","RLS"],
                ["SLEEVE_LS_LEFT","LLS"]
            ];
            var missStd=[];
            for(var i=0;i<reqStd.length;i++){
                var g=JV2_findGroup(std,reqStd[i][0]);
                if(!g||!JV2_findItem(g,reqStd[i][1])){
                    missStd.push(reqStd[i][0]+" > "+reqStd[i][1]);
                }
            }
            if(missStd.length){
                messages.push("STANDARD tak lengkap: "+missStd.join(", "));
                failed=true;
            }else{
                messages.push("STANDARD OK");
            }
        }

        // MUSV ARTWORK_MUS
        var mus=null;
        if(typeof JV2_getArtworkForTypeFromDoc==="function"){
            mus=JV2_getArtworkForTypeFromDoc(d,"MUSV");
        }else{
            mus=JV2_findGroup(d,"ARTWORK_MUS");
            if(!mus){
                var ml=JV2_findLayer(d,"ARTWORK_MUS");
                if(ml)mus=ml;
            }
        }

        if(!mus){
            messages.push("MUSV: ARTWORK_MUS tak jumpa");
            failed=true;
        }else{
            var reqMus=[
                ["BODY_FRONT_MUS","F"],
                ["BODY_BACK_MUS","B"],
                ["SLEEVE_RIGHT_MUS","RLS"],
                ["SLEEVE_LEFT_MUS","LLS"]
            ];
            var missMus=[];
            for(var j=0;j<reqMus.length;j++){
                var mg=JV2_findGroup(mus,reqMus[j][0]);
                if(!mg||!JV2_findItem(mg,reqMus[j][1])){
                    missMus.push(reqMus[j][0]+" > "+reqMus[j][1]);
                }
            }
            if(missMus.length){
                messages.push("MUSV tak lengkap: "+missMus.join(", "));
                failed=true;
            }else{
                messages.push("MUSV OK");
            }
        }

        return (failed?"ERR|":"OK|")+messages.join(" • ");
    }catch(e){
        return"ERR|Line "+e.line+": "+e.message;
    }
}
function JV2_getSizeGroup(masterDoc,type,size){
    var outer=null;

    var typeLayer=JV2_findLayer(masterDoc,type);
    if(typeLayer){
        outer=JV2_findDirectGroup(typeLayer,size);
        if(!outer)outer=JV2_findGroup(typeLayer,size);
    }

    if(!outer){
        var typeGroup=JV2_findGroup(masterDoc,type);
        if(typeGroup){
            outer=JV2_findDirectGroup(typeGroup,size);
            if(!outer)outer=JV2_findGroup(typeGroup,size);
        }
    }

    if(!outer)return null;

    // KIDS master structure:
    // KIDS > 22 > 22 > BODY_FRONT / BODY_BACK / SLEEVES
    //
    // Return the INNER same-size group so the duplicated PATTERN root
    // has the exact same structure as RN/POLO and can use the proven
    // standard compact layout.
    if(type==="KIDS"){
        var inner=JV2_findDirectGroup(outer,size);
        if(inner)return inner;
    }

    return outer;
}
function JV2_removeSizeLabel(g,size){
    var names=["SAIZ "+size,"SAIZ_"+size,"SIZE "+size,"SIZE_"+size,size];
    for(var i=0;i<names.length;i++){
        var x=JV2_findItem(g,names[i]);
        if(x && x!==g)try{x.locked=false;x.hidden=false;x.remove();}catch(e){}
    }
}
function JV2_mm(v){return v*72/25.4;}

function JV2_directGroup(c,n){
    var g;try{g=c.groupItems;}catch(e){return null;}
    for(var i=0;i<g.length;i++)if(g[i].name===n)return g[i];
    return null;
}
function JV2_itemBounds(it){
    try{return it.visibleBounds;}catch(e){return null;}
}
function JV2_moveItemTopLeft(it,x,y){
    var b=JV2_itemBounds(it);if(!b)return false;
    it.translate(x-b[0],y-b[1]);
    return true;
}
function JV2_layoutGeneratedSet(pattern,gap){
    // Fixed compact layout for each generated set:
    //
    // BODY_FRONT | BODY_BACK
    // SS_LEFT    | SS_RIGHT
    // LS_LEFT    | LS_RIGHT
    //
    // If SS does not exist, LS moves directly under the body row.
    var bf=JV2_directGroup(pattern,"BODY_FRONT_FINAL");
    if(!bf)bf=JV2_directGroup(pattern,"BODY_FRONT_MUS_FINAL");
    var bb=JV2_directGroup(pattern,"BODY_BACK_FINAL");
    if(!bb)bb=JV2_directGroup(pattern,"BODY_BACK_MUS_FINAL");
    var ssr=JV2_directGroup(pattern,"SLEEVE_SS_RIGHT_FINAL");
    var ssl=JV2_directGroup(pattern,"SLEEVE_SS_LEFT_FINAL");
    var lsr=JV2_directGroup(pattern,"SLEEVE_LS_RIGHT_FINAL");
    if(!lsr)lsr=JV2_directGroup(pattern,"SLEEVE_RIGHT_MUS_FINAL");
    var lsl=JV2_directGroup(pattern,"SLEEVE_LS_LEFT_FINAL");
    if(!lsl)lsl=JV2_directGroup(pattern,"SLEEVE_LEFT_MUS_FINAL");

    var topY=0;
    var x=0;
    var maxBodyH=0;

    // BODY row
    if(bf){
        JV2_moveItemTopLeft(bf,x,topY);
        var b1=JV2_itemBounds(bf);
        if(b1){
            x+=JV2_w(b1)+gap;
            maxBodyH=Math.max(maxBodyH,JV2_h(b1));
        }
    }
    if(bb){
        JV2_moveItemTopLeft(bb,x,topY);
        var b2=JV2_itemBounds(bb);
        if(b2)maxBodyH=Math.max(maxBodyH,JV2_h(b2));
    }

    // SS row
    var ssY=topY-maxBodyH-gap;
    var ssX=0;
    var maxSSH=0;
    var ss=[ssl,ssr];
    for(var i=0;i<ss.length;i++){
        var sl=ss[i];
        if(!sl)continue;
        JV2_moveItemTopLeft(sl,ssX,ssY);
        var sb=JV2_itemBounds(sl);
        if(sb){
            ssX+=JV2_w(sb)+gap;
            maxSSH=Math.max(maxSSH,JV2_h(sb));
        }
    }

    // LS row. If SS exists, LS sits below SS.
    // If there is no SS, LS sits directly below body.
    var hasSS=(ssl||ssr)?true:false;
    var lsY=hasSS ? (ssY-maxSSH-gap) : ssY;
    var lsX=0;
    var ls=[lsl,lsr];
    for(var j=0;j<ls.length;j++){
        var ll=ls[j];
        if(!ll)continue;
        JV2_moveItemTopLeft(ll,lsX,lsY);
        var lb=JV2_itemBounds(ll);
        if(lb)lsX+=JV2_w(lb)+gap;
    }

    // Remove leftover empty source containers.
    var oldNames=[
        "BODY_FRONT","BODY_BACK",
        "SLEEVE_SS_RIGHT","SLEEVE_SS_LEFT",
        "SLEEVE_LS_RIGHT","SLEEVE_LS_LEFT"
    ];
    for(var k=0;k<oldNames.length;k++){
        var g=JV2_directGroup(pattern,oldNames[k]);
        if(g){
            try{
                if(g.pageItems.length===0 && g.groupItems.length===0)g.remove();
            }catch(e){}
        }
    }
}

function JV2_layoutKidsSet(pattern,gap){
    // KIDS uses exactly the same visual arrangement as RN,
    // but we reset every FINAL group from a clean local origin.
    //
    // BODY_FRONT | BODY_BACK
    // SS_LEFT    | SS_RIGHT
    // LS_LEFT    | LS_RIGHT

    var bf=JV2_directGroup(pattern,"BODY_FRONT_FINAL");
    var bb=JV2_directGroup(pattern,"BODY_BACK_FINAL");
    var ssl=JV2_directGroup(pattern,"SLEEVE_SS_LEFT_FINAL");
    var ssr=JV2_directGroup(pattern,"SLEEVE_SS_RIGHT_FINAL");
    var lsl=JV2_directGroup(pattern,"SLEEVE_LS_LEFT_FINAL");
    var lsr=JV2_directGroup(pattern,"SLEEVE_LS_RIGHT_FINAL");

    function moveTL(item,x,y){
        if(!item)return null;
        var b=JV2_itemBounds(item);
        if(!b)return null;
        item.translate(x-b[0],y-b[1]);
        return JV2_itemBounds(item);
    }

    var topY=0;
    var x=0;
    var maxBodyH=0;

    // Body row
    var b1=moveTL(bf,x,topY);
    if(b1){
        x+=JV2_w(b1)+gap;
        maxBodyH=Math.max(maxBodyH,JV2_h(b1));
    }

    var b2=moveTL(bb,x,topY);
    if(b2){
        maxBodyH=Math.max(maxBodyH,JV2_h(b2));
    }

    // SS row
    var ssY=topY-maxBodyH-gap;
    var ssX=0;
    var maxSSH=0;

    var s1=moveTL(ssl,ssX,ssY);
    if(s1){
        ssX+=JV2_w(s1)+gap;
        maxSSH=Math.max(maxSSH,JV2_h(s1));
    }

    var s2=moveTL(ssr,ssX,ssY);
    if(s2){
        maxSSH=Math.max(maxSSH,JV2_h(s2));
    }

    // LS row — exactly like RN:
    // if SS does not exist, LS goes directly below body.
    var hasSS=(ssl||ssr)?true:false;
    var lsY=hasSS ? (ssY-maxSSH-gap) : ssY;
    var lsX=0;

    var l1=moveTL(lsl,lsX,lsY);
    if(l1){
        lsX+=JV2_w(l1)+gap;
    }

    moveTL(lsr,lsX,lsY);

    // Remove original source pattern containers unconditionally.
    // KIDS source geometry can carry old master coordinates that otherwise
    // distort job bounds and push output outside the artboard.
    var oldNames=[
        "BODY_FRONT",
        "BODY_BACK",
        "SLEEVE_SS_RIGHT",
        "SLEEVE_SS_LEFT",
        "SLEEVE_LS_RIGHT",
        "SLEEVE_LS_LEFT"
    ];

    for(var i=0;i<oldNames.length;i++){
        var g=JV2_directGroup(pattern,oldNames[i]);
        if(g){
            try{
                g.locked=false;
                g.hidden=false;
                g.remove();
            }catch(e){}
        }
    }

    // Remove any direct copied master object that is not one of the
    // generated FINAL groups. This keeps KIDS bounds identical to RN output.
    for(var pi=pattern.pageItems.length-1;pi>=0;pi--){
        var it=pattern.pageItems[pi];
        try{
            if(it.parent!==pattern)continue;

            var nm=it.name||"";
            var keep=(
                nm==="BODY_FRONT_FINAL" ||
                nm==="BODY_BACK_FINAL" ||
                nm==="SLEEVE_SS_RIGHT_FINAL" ||
                nm==="SLEEVE_SS_LEFT_FINAL" ||
                nm==="SLEEVE_LS_RIGHT_FINAL" ||
                nm==="SLEEVE_LS_LEFT_FINAL"
            );

            if(!keep){
                it.locked=false;
                it.hidden=false;
                it.remove();
            }
        }catch(e2){}
    }
}

function JV2_layoutMusvSet(pattern,gap){
    // MUSV STRICT LAYOUT
    // BODY_FRONT_MUS | BODY_BACK_MUS
    // SLEEVE_LEFT_MUS | SLEEVE_RIGHT_MUS
    //
    // Do not use the original master positions at all.
    // Reposition the FINAL generated groups from a fresh local origin.

    var bf=JV2_directGroup(pattern,"BODY_FRONT_MUS_FINAL");
    var bb=JV2_directGroup(pattern,"BODY_BACK_MUS_FINAL");
    var sl=JV2_directGroup(pattern,"SLEEVE_LEFT_MUS_FINAL");
    var sr=JV2_directGroup(pattern,"SLEEVE_RIGHT_MUS_FINAL");

    function moveTL(item,x,y){
        if(!item)return null;
        var b=JV2_itemBounds(item);
        if(!b)return null;
        item.translate(x-b[0],y-b[1]);
        return JV2_itemBounds(item);
    }

    // Use zero-based local coordinates for each MUSV set.
    var topY=0;
    var x=0;
    var maxBodyH=0;

    var b1=moveTL(bf,x,topY);
    if(b1){
        x+=JV2_w(b1)+gap;
        maxBodyH=Math.max(maxBodyH,JV2_h(b1));
    }

    var b2=moveTL(bb,x,topY);
    if(b2){
        maxBodyH=Math.max(maxBodyH,JV2_h(b2));
    }

    // Sleeves directly below the tallest body.
    var sleeveY=topY-maxBodyH-gap;
    var sx=0;

    var s1=moveTL(sl,sx,sleeveY);
    if(s1){
        sx+=JV2_w(s1)+gap;
    }

    moveTL(sr,sx,sleeveY);

    // Remove ALL original MUSV source containers so their old far-away
    // master geometry cannot affect job bounds / auto-arrange.
    var oldNames=[
        "BODY_FRONT_MUS",
        "BODY_BACK_MUS",
        "SLEEVE_RIGHT_MUS",
        "SLEEVE_LEFT_MUS"
    ];

    for(var i=0;i<oldNames.length;i++){
        var g=JV2_directGroup(pattern,oldNames[i]);
        if(g){
            try{
                g.locked=false;
                g.hidden=false;
                g.remove();
            }catch(e){}
        }
    }

    // Remove stray size/reference objects copied from the MUSV master
    // if they are direct children of PATTERN and not one of the FINAL groups.
    for(var pi=pattern.pageItems.length-1;pi>=0;pi--){
        var it=pattern.pageItems[pi];
        try{
            if(it.parent!==pattern)continue;

            var nm=it.name||"";
            var keep=(
                nm==="BODY_FRONT_MUS_FINAL" ||
                nm==="BODY_BACK_MUS_FINAL" ||
                nm==="SLEEVE_LEFT_MUS_FINAL" ||
                nm==="SLEEVE_RIGHT_MUS_FINAL"
            );

            if(!keep){
                it.locked=false;
                it.hidden=false;
                it.remove();
            }
        }catch(e2){}
    }
}

function JV2_numberedOutputPath(basePath,index,total,category){
    var f=new File(basePath);
    var full=f.fsName;
    var dot=full.lastIndexOf(".");
    var stem=(dot>=0)?full.substring(0,dot):full;
    var ext=(dot>=0)?full.substring(dot):".ai";

    var cat=category?("_"+category):"";
    var n=index+1;
    var pad=(n<10)?"0"+n:String(n);

    // Always make category explicit so MUSV never mixes with standard files.
    return stem+cat+"_"+pad+ext;
}

function JV2_generate(masterPath,outputPath,jobCSV,gapMM,fixedObjects,sizeLabelOn,strokeOn,strokeWidth,strokeColor,colorMode){
    try{
        var JV2_GEN_START=(new Date()).getTime();
        JV2_OPT_FIXED=(String(fixedObjects)!=="0");
        JV2_OPT_SIZELABEL=(String(sizeLabelOn)!=="0");
        JV2_OPT_STROKE=(String(strokeOn)!=="0");

        var parsedStroke=parseFloat(strokeWidth);
        JV2_OPT_STROKE_WIDTH=isNaN(parsedStroke)?0.5:parsedStroke;
        JV2_OPT_STROKE_COLOR=String(strokeColor||"Black");
        var JV2_COLOR_MODE=(String(colorMode||"CMYK").toUpperCase()==="RGB")?"RGB":"CMYK";

        if(app.documents.length===0)return"ERR|Buka fail artwork dulu.";

        // Keep the ORIGINAL artwork file active between every generated batch.
        var artworkDoc=app.activeDocument;

        var allJobs=jobCSV?jobCSV.split(";"):[];
        if(!allJobs.length)return"ERR|Queue kosong.";



        // MUSV is intentionally isolated from all standard garments.
        var standardJobs=[];
        var musvJobs=[];

        for(var i=0;i<allJobs.length;i++){
            var p=allJobs[i].split("|");
            if(p[0]==="MUSV")musvJobs.push(allJobs[i]);
            else standardJobs.push(allJobs[i]);
        }

        var made=[];
        var warnings=[];
        var lastOutputDoc=null;
        var totalGeneratedFiles=0;

        function runCategory(category,jobs){
            if(!jobs.length)return null;

            // Fixed per-category layouts:
            // STANDARD = 4 × 2 = 8 set/file
            // MUSV     = 3 × 2 = 6 set/file
            var columns=(category==="MUSV")?3:4;
            var rows=(category==="MUSV")?2:2;
            var capacity=columns*rows;

            var totalFiles=Math.ceil(jobs.length/capacity);

            for(var fi=0;fi<totalFiles;fi++){
                try{
                    app.activeDocument=artworkDoc;
                }catch(adErr){
                    return"ERR|Artwork asal dah tertutup sebelum "+category+" file "+(fi+1)+".";
                }

                var start=fi*capacity;
                var end=Math.min(start+capacity,jobs.length);
                var batch=[];

                for(var ji=start;ji<end;ji++){
                    batch.push(jobs[ji]);
                }

                var outPath=JV2_numberedOutputPath(
                    outputPath,
                    fi,
                    totalFiles,
                    category
                );

                var r=JV2_generateSingle(
                    masterPath,
                    outPath,
                    batch.join(";"),
                    columns,
                    gapMM,
                    JV2_COLOR_MODE
                );

                if(!r || r.indexOf("OK|")!==0){
                    return"ERR|"+category+" file "+(fi+1)+"/"+totalFiles+" gagal.\\n"+(r||"Unknown error");
                }

                totalGeneratedFiles++;

                try{
                    lastOutputDoc=app.activeDocument;
                }catch(e){}

                made.push(new File(outPath).name);

                var wi=r.indexOf("\\n\\nTak jumpa / gagal:");
                if(wi>=0){
                    warnings.push(
                        category+" file "+(fi+1)+": "+r.substring(wi+2)
                    );
                }
            }

            return"OK";
        }

        var rStd=runCategory("STANDARD",standardJobs);
        if(rStd && rStd.indexOf("ERR|")===0)return rStd;

        var rMus=runCategory("MUSV",musvJobs);
        if(rMus && rMus.indexOf("ERR|")===0)return rMus;

        try{
            if(lastOutputDoc)app.activeDocument=lastOutputDoc;
        }catch(e){}

        var elapsedMs=(new Date()).getTime()-JV2_GEN_START;
        var elapsedSec=elapsedMs/1000;

        var msg="OK|GENERATE SELESAI\n";
        msg+="Total set: "+allJobs.length+"\n";
        msg+="STANDARD: "+standardJobs.length+" set\n";
        msg+="MUSV: "+musvJobs.length+" set\n";
        msg+="Total file: "+totalGeneratedFiles+"\n";
        msg+="Color mode: "+JV2_COLOR_MODE+"\n";
        msg+="Masa generate: "+elapsedSec.toFixed(1)+" saat\n\n";
        msg+=made.join("\n");

        if(warnings.length){
            msg+="\n\n"+warnings.join("\n");
        }

        return msg;

    }catch(e){
        return"ERR|Split engine line "+e.line+": "+e.message;
    }
}

function JV2_addSizeLabel(jobLayer,size,gap){
    try{
        function calcBounds(ly){
            var out=null;

            function merge(a,b){
                if(!a)return b;
                if(!b)return a;
                return[
                    Math.min(a[0],b[0]),
                    Math.max(a[1],b[1]),
                    Math.max(a[2],b[2]),
                    Math.min(a[3],b[3])
                ];
            }

            for(var i=0;i<ly.pageItems.length;i++){
                var it=ly.pageItems[i];
                try{
                    if(it.hidden)continue;
                    if(it.parent!==ly)continue;
                    out=merge(out,it.visibleBounds);
                }catch(e1){}
            }

            try{
                for(var j=0;j<ly.layers.length;j++){
                    out=merge(out,calcBounds(ly.layers[j]));
                }
            }catch(e2){}

            return out;
        }

        var b=calcBounds(jobLayer);
        if(!b)return null;

        var tf=jobLayer.textFrames.add();
        tf.name="SIZE_LABEL_"+size;
        tf.contents=String(size);

        try{tf.textRange.characterAttributes.size=200;}catch(e3){}
        try{tf.textRange.characterAttributes.textFont=app.textFonts.getByName("Arial-BoldMT");}catch(e4){}

        try{
            var c=new CMYKColor();
            c.cyan=0;
            c.magenta=0;
            c.yellow=0;
            c.black=100;
            tf.textRange.characterAttributes.fillColor=c;
        }catch(e5){}

        // Put the size just above the top-left of this set.
        tf.left=b[0];
        tf.top=b[1]+Math.max(JV2_mm(10),gap*0.40);

        try{tf.zOrder(ZOrderMethod.BRINGTOFRONT);}catch(e6){}
        return tf;
    }catch(e){
        return null;
    }
}

function JV2_generateSingle(masterPath,outputPath,jobCSV,maxPerRow,gapMM,colorMode){
    var masterDoc=null,outDoc=null;
    try{
        if(app.documents.length===0)return"ERR|Buka fail artwork dulu.";
        var artworkDoc=app.activeDocument;

        var mf=new File(masterPath);
        if(!mf.exists)return"ERR|Universal Master tak jumpa.";

        var of=new File(outputPath);
        if(of.exists)try{of.remove();}catch(e){}

        masterDoc=app.open(mf);
        outDoc=app.documents.add((String(colorMode||"CMYK").toUpperCase()==="RGB")?DocumentColorSpace.RGB:DocumentColorSpace.CMYK,2000,2000);
        var outLayer=outDoc.layers[0];
        outLayer.name="JERSYNC_V2_OUTPUT";

        var rows=jobCSV?jobCSV.split(";"):[];
        if(!rows.length)return"ERR|Queue kosong.";

        var gap=JV2_mm(parseFloat(gapMM)||20);
        var maxRow=parseInt(maxPerRow,10)||3;
        var missing=[],jobs=[],jobSizes=[],done=0;

        for(var i=0;i<rows.length;i++){
            var p=rows[i].split("|");
            var type=p[0],size=p[1],sleeve=p[2],tagType=(p.length>3&&p[3])?p[3]:p[0];
            var sg=JV2_getSizeGroup(masterDoc,type,size);
            if(!sg){missing.push(type+" > "+size);continue;}

            var jobLayer=outLayer.layers.add();
            jobLayer.name=("000"+(i+1)).slice(-3)+"_"+type+"_"+size+"_"+sleeve;

            var target=sg.duplicate(jobLayer,ElementPlacement.PLACEATEND);
            target.name="PATTERN";
            JV2_removeSizeLabel(target,size);

            var artwork=JV2_getArtworkForTypeFromDoc(artworkDoc,type);
            if(!artwork){
                missing.push(type+" artwork source");
                try{jobLayer.remove();}catch(e){}
                continue;
            }
            var cn=JV2_componentNamesForType(type);
            var af=cn.front?JV2_findGroup(artwork,cn.front):null;
            var ab=cn.back?JV2_findGroup(artwork,cn.back):null;
            var assr=cn.ssr?JV2_findGroup(artwork,cn.ssr):null;
            var assl=cn.ssl?JV2_findGroup(artwork,cn.ssl):null;
            var alsr=cn.lsr?JV2_findGroup(artwork,cn.lsr):null;
            var alsl=cn.lsl?JV2_findGroup(artwork,cn.lsl):null;

            var tf=cn.front?JV2_findGroup(target,cn.front):null;
            var tb=cn.back?JV2_findGroup(target,cn.back):null;
            var mark=tf?JV2_findItem(tf,"FRONT_MARK"):null;

            if(tf && JV2_applyPart(af,"F",JV2_findItem(tf,"F"),jobLayer,target,cn.front,size,"FRONT",tagType,mark))done++;
            else missing.push(type+" "+size+" BODY_FRONT");

            if(tb && JV2_applyPart(ab,"B",JV2_findItem(tb,"B"),jobLayer,target,cn.back,size,"BACK",tagType,null))done++;
            else missing.push(type+" "+size+" BODY_BACK");

            if(type==="MUSV"){
                sleeve="LS";
                var mlr=JV2_findGroup(target,"SLEEVE_RIGHT_MUS");
                var mll=JV2_findGroup(target,"SLEEVE_LEFT_MUS");

                if(mlr && JV2_applyPart(alsr,"RLS",JV2_findItem(mlr,"RLS"),jobLayer,target,"SLEEVE_RIGHT_MUS",size,"RIGHT",tagType,null))done++;
                else missing.push(type+" "+size+" LS RIGHT");

                if(mll && JV2_applyPart(alsl,"LLS",JV2_findItem(mll,"LLS"),jobLayer,target,"SLEEVE_LEFT_MUS",size,"LEFT",tagType,null))done++;
                else missing.push(type+" "+size+" LS LEFT");
            }else{
                if(sleeve==="SS"||sleeve==="BOTH"){
                    var tr=JV2_findGroup(target,"SLEEVE_SS_RIGHT");
                    var tl=JV2_findGroup(target,"SLEEVE_SS_LEFT");
                    if(tr && JV2_applyPart(assr,"RSS",JV2_findItem(tr,"RSS"),jobLayer,target,"SLEEVE_SS_RIGHT",size,"RIGHT",tagType,null))done++;
                    else missing.push(type+" "+size+" SS RIGHT");
                    if(tl && JV2_applyPart(assl,"LSS",JV2_findItem(tl,"LSS"),jobLayer,target,"SLEEVE_SS_LEFT",size,"LEFT",tagType,null))done++;
                    else missing.push(type+" "+size+" SS LEFT");
                }else{
                    var ss1=JV2_findGroup(target,"SLEEVE_SS_RIGHT");if(ss1)try{ss1.remove();}catch(e){}
                    var ss2=JV2_findGroup(target,"SLEEVE_SS_LEFT");if(ss2)try{ss2.remove();}catch(e){}
                }

                if(sleeve==="LS"||sleeve==="BOTH"){
                    var lr=JV2_findGroup(target,"SLEEVE_LS_RIGHT");
                    var ll=JV2_findGroup(target,"SLEEVE_LS_LEFT");
                    if(lr && JV2_applyPart(alsr,"RLS",JV2_findItem(lr,"RLS"),jobLayer,target,"SLEEVE_LS_RIGHT",size,"RIGHT",tagType,null))done++;
                    else missing.push(type+" "+size+" LS RIGHT");
                    if(ll && JV2_applyPart(alsl,"LLS",JV2_findItem(ll,"LLS"),jobLayer,target,"SLEEVE_LS_LEFT",size,"LEFT",tagType,null))done++;
                    else missing.push(type+" "+size+" LS LEFT");
                }else{
                    var ls1=JV2_findGroup(target,"SLEEVE_LS_RIGHT");if(ls1)try{ls1.remove();}catch(e){}
                    var ls2=JV2_findGroup(target,"SLEEVE_LS_LEFT");if(ls2)try{ls2.remove();}catch(e){}
                }
            }

            // Arrange every generated set internally.
            if(type==="MUSV"){
                JV2_layoutMusvSet(target,gap);
            }else if(type==="KIDS"){
                JV2_layoutKidsSet(target,gap);
            }else{
                JV2_layoutGeneratedSet(target,gap);
            }

            jobs.push(jobLayer);
            jobSizes.push(size);
        }

        // Auto-arrange complete generated sets in queue order.
        // Illustrator Layer objects do NOT expose visibleBounds, so calculate
        // bounds from the pageItems contained by each job layer.
        function JV2_mergeBounds(a,b){
            if(!a)return b;
            if(!b)return a;
            return[
                Math.min(a[0],b[0]),
                Math.max(a[1],b[1]),
                Math.max(a[2],b[2]),
                Math.min(a[3],b[3])
            ];
        }

        function JV2_layerBounds(ly){
            var out=null;

            // Direct/top-level pageItems on this layer.
            for(var bi=0;bi<ly.pageItems.length;bi++){
                var it=ly.pageItems[bi];
                try{
                    if(it.hidden)continue;
                    if(it.parent!==ly)continue;
                    out=JV2_mergeBounds(out,it.visibleBounds);
                }catch(be){}
            }

            // Include nested sublayers recursively.
            try{
                for(var li=0;li<ly.layers.length;li++){
                    out=JV2_mergeBounds(out,JV2_layerBounds(ly.layers[li]));
                }
            }catch(le){}

            return out;
        }

        function JV2_translateLayer(ly,dx,dy){
            // Translate direct items.
            for(var ti=0;ti<ly.pageItems.length;ti++){
                var it=ly.pageItems[ti];
                try{
                    if(it.parent===ly)it.translate(dx,dy);
                }catch(te){}
            }

            // Translate sublayers recursively.
            try{
                for(var li=0;li<ly.layers.length;li++){
                    JV2_translateLayer(ly.layers[li],dx,dy);
                }
            }catch(le){}
        }

        var x=0,y=0,rowH=0,col=0;
        for(var j=0;j<jobs.length;j++){
            var ly=jobs[j];
            var b=JV2_layerBounds(ly);
            if(!b)continue;
            var w=b[2]-b[0],h=b[1]-b[3];

            if(col>=maxRow){
                x=0;
                y-=rowH+gap;
                rowH=0;
                col=0;
            }

            var dx=x-b[0];
            var dy=y-b[1];
            JV2_translateLayer(ly,dx,dy);

            x+=w+gap;
            if(h>rowH)rowH=h;
            col++;
        }
// FINAL ARTBOARD POSITION + CONTENT
        //
        // Move the WHITE ARTBOARD itself toward the upper-left area of
        // Illustrator's pasteboard, then move all generated artwork with it.
        //
        // Safe anchor chosen inside classic Illustrator canvas limits.
        app.activeDocument=outDoc;
        app.redraw();

        var allB=JV2_layerBounds(outLayer);
        if(allB){
            var margin=JV2_mm(15);

            var contentW=allB[2]-allB[0];
            var contentH=allB[1]-allB[3];

            var artW=contentW+(margin*2);
            var artH=contentH+(margin*2);

            // Upper-left-ish position on the pasteboard.
            // Kept well inside Illustrator's canvas limits.
            var anchorLeft=-7000;
            var anchorTop=7000;

            var artRight=anchorLeft+artW;
            var artBottom=anchorTop-artH;

            var placed=false;

            try{
                // 1) Move/resize the WHITE artboard first.
                outDoc.artboards[0].artboardRect=[
                    anchorLeft,
                    anchorTop,
                    artRight,
                    artBottom
                ];
                placed=true;
            }catch(artErr){
                placed=false;
            }

            if(placed){
                // 2) Move ALL generated artwork inside that artboard,
                // starting from its top-left margin.
                var dx=(anchorLeft+margin)-allB[0];
                var dy=(anchorTop-margin)-allB[1];

                JV2_translateLayer(outLayer,dx,dy);
                app.redraw();
            }else{
                // Fallback: keep current artboard location, but still ensure
                // all artwork is inside it from the current top-left.
                var abr=outDoc.artboards[0].artboardRect;

                var dx2=(abr[0]+margin)-allB[0];
                var dy2=(abr[1]-margin)-allB[1];

                JV2_translateLayer(outLayer,dx2,dy2);
                app.redraw();

                allB=JV2_layerBounds(outLayer);

                if(allB){
                    try{
                        outDoc.artboards[0].artboardRect=[
                            abr[0],
                            abr[1],
                            Math.max(abr[2],allB[2]+margin),
                            Math.min(abr[3],allB[3]-margin)
                        ];
                    }catch(e2){}
                }
            }
        }

        // Add SIZE label to EVERY set only after all final
        // artboard/output movement is complete.
        if(JV2_OPT_SIZELABEL){
            for(var lj=0;lj<jobs.length;lj++){
                JV2_addSizeLabel(jobs[lj],jobSizes[lj],gap);
            }
        }
        app.redraw();

        var saveOpt=new IllustratorSaveOptions();
        outDoc.saveAs(of,saveOpt);
        outDoc.save();

        try{masterDoc.close(SaveOptions.DONOTSAVECHANGES);}catch(e){}
        app.activeDocument=outDoc;

        var msg="OK|Siap V2 TEST. "+jobs.length+" set dijana ("+done+" bahagian).\\n"+of.fsName;
        if(missing.length)msg+="\\n\\nTak jumpa / gagal:\\n- "+missing.join("\\n- ");
        return msg;
    }catch(e){
        try{if(masterDoc)masterDoc.close(SaveOptions.DONOTSAVECHANGES);}catch(e2){}
        return"ERR|Line "+e.line+": "+e.message;
    }
}
