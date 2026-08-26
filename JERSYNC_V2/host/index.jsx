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
function JV2_embedPlacedItems(container){
    if(!container)return;

    // Embed linked images so they remain in the generated AI file after
    // source/master documents are closed.
    try{
        for(var pi=container.placedItems.length-1;pi>=0;pi--){
            try{
                container.placedItems[pi].embed();
            }catch(e1){}
        }
    }catch(e2){}

    try{
        for(var gi=0;gi<container.groupItems.length;gi++){
            JV2_embedPlacedItems(container.groupItems[gi]);
        }
    }catch(e3){}
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

    var rb=JV2_b(r);
    var gb=JV2_b(g);

    var rw=JV2_w(rb);
    var rh=JV2_h(rb);

    if(!rw||!rh)return null;

    // Store relative center position AND relative size against the
    // source reference object. This lets FIXED_OBJECT follow every size.
    return{
        group:g,
        rx:(JV2_cx(gb)-rb[0])/rw,
        ry:(rb[1]-JV2_cy(gb))/rh,
        rw:JV2_w(gb)/rw,
        rh:JV2_h(gb)/rh
    };
}

function JV2_addFixed(src,refName,target,dLayer,dGroup){
    var d=JV2_fixedData(src,refName);
    if(!d)return;

    var tb=JV2_b(target);
    var tw=JV2_w(tb);
    var th=JV2_h(tb);

    if(!tw||!th)return;

    // Target center position, based on the same relative source position.
    var x=tb[0]+d.rx*tw;
    var y=tb[1]-d.ry*th;

    var q=d.group.duplicate(dLayer,ElementPlacement.PLACEATEND);
    q.name="FIXED_OBJECT";

    // v2.0.9 B24:
    // Scale FIXED_OBJECT to the NEW target size.
    // This works even when FIXED_OBJECT is hidden in the source artwork.
    // Hidden state does not stop the geometry from being measured/scaled.
    var qb=JV2_b(q);
    var qw=JV2_w(qb);
    var qh=JV2_h(qb);

    var targetW=d.rw*tw;
    var targetH=d.rh*th;

    if(qw && qh && targetW>0 && targetH>0){
        q.resize(
            (targetW/qw)*100,
            (targetH/qh)*100,
            true,
            true,
            true,
            true,
            100,
            Transformation.CENTER
        );
    }

    // Recalculate bounds after scaling, then place at the correct
    // relative position on the new garment size.
    qb=JV2_b(q);

    q.translate(
        x-JV2_cx(qb),
        y-JV2_cy(qb)
    );

    // Preserve source visibility state where possible.
    try{
        q.hidden=d.group.hidden;
    }catch(eHidden){}

    q.move(dGroup,ElementPlacement.PLACEATEND);

    try{
        q.zOrder(ZOrderMethod.BRINGTOFRONT);
    }catch(eZ){}
}

function JV2_addVisibleOutline(sourcePath,dGroup){
    if(!JV2_OPT_STROKE || !dGroup)return null;

    try{
        var width=Number(JV2_OPT_STROKE_WIDTH);
        if(isNaN(width))width=0.5;
        if(width<0)width=0;

        var col=JV2_strokeColor(JV2_OPT_STROKE_COLOR);

        // v2.0.9 B23:
        // Always rebuild PATTERN_STROKE from the FINAL group's CLIP_MASK.
        // This prevents the stroke from keeping oversized source/template
        // bounds and making the whole pattern selection box too large.
        var finalMask=null;

        try{
            finalMask=JV2_findItem(dGroup,"CLIP_MASK");
        }catch(e0){}

        // During JV2_applyPart the final CLIP_MASK may not exist yet,
        // so fall back to the supplied sourcePath and then rebuild later.
        var strokeSource=finalMask||sourcePath;
        if(!strokeSource)return null;

        // Remove any old/oversized PATTERN_STROKE first.
        try{
            var oldStroke=JV2_findItem(dGroup,"PATTERN_STROKE");
            if(oldStroke){
                oldStroke.locked=false;
                oldStroke.hidden=false;
                oldStroke.remove();
            }
        }catch(eOld){}

        var o=strokeSource.duplicate(dGroup,ElementPlacement.PLACEATEND);
        o.name="PATTERN_STROKE";

        function stylePath(p){
            try{
                p.clipping=false;
            }catch(eClip){}

            try{
                p.filled=false;
                p.stroked=true;
                p.strokeWidth=width;
                p.strokeColor=col;
            }catch(eStyle){}
        }

        function walk(item){
            if(!item)return;

            if(item.typename==="PathItem"){
                stylePath(item);
                return;
            }

            if(item.typename==="CompoundPathItem"){
                for(var i=0;i<item.pathItems.length;i++){
                    stylePath(item.pathItems[i]);
                }
                return;
            }

            if(item.typename==="GroupItem"){
                for(var j=0;j<item.pageItems.length;j++){
                    walk(item.pageItems[j]);
                }
            }
        }

        walk(o);

        try{o.zOrder(ZOrderMethod.BRINGTOFRONT);}catch(eZ){}

        // Re-apply after z-order.
        walk(o);

        return o;
    }catch(e){
        return null;
    }
}

function JV2_rebuildFinalPatternStroke(finalGroup){
    if(!JV2_OPT_STROKE || !finalGroup)return null;

    try{
        var mask=JV2_findItem(finalGroup,"CLIP_MASK");
        if(!mask)return null;

        // Delete the old stroke generated from the source/template path.
        try{
            var old=JV2_findItem(finalGroup,"PATTERN_STROKE");
            if(old){
                old.locked=false;
                old.hidden=false;
                old.remove();
            }
        }catch(eOld){}

        // Create the stroke from the FINAL CLIP_MASK only.
        return JV2_addVisibleOutline(mask,finalGroup);

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

    // Preserve linked/raster images inside the generated artwork.
    // Embed only the duplicated output copy; source artwork is untouched.
    try{
        JV2_embedPlacedItems(cg);
    }catch(embedErr){}

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

    // Visible stroke must be rebuilt from the FINAL CLIP_MASK.
    // This keeps PATTERN_STROKE bounds identical to the actual pattern.
    JV2_rebuildFinalPatternStroke(outer);

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
function JV2_removeKidsMasterSizeMark(g,size){
    if(!g)return;

    var targetSize=String(size);

    function walk(container){
        if(!container)return;

        // Remove ONLY inherited/master size text from KIDS pattern.
        try{
            for(var ti=container.textFrames.length-1;ti>=0;ti--){
                var tf=container.textFrames[ti];
                var nm="",txt="";
                try{nm=String(tf.name||"").toUpperCase();}catch(e1){}
                try{txt=String(tf.contents||"");}catch(e2){}

                if(
                    txt===targetSize ||
                    nm==="TAG_SIZE" ||
                    nm==="SIZE_TAG" ||
                    nm.indexOf("SIZE_LABEL_")===0 ||
                    nm==="SAIZ "+targetSize ||
                    nm==="SAIZ_"+targetSize ||
                    nm==="SIZE "+targetSize ||
                    nm==="SIZE_"+targetSize
                ){
                    try{
                        tf.locked=false;
                        tf.hidden=false;
                        tf.remove();
                    }catch(e3){}
                }
            }
        }catch(e4){}

        // Remove inherited master group named SIZE_TAG only.
        // This runs BEFORE generated artwork tags are added.
        try{
            for(var gi=container.groupItems.length-1;gi>=0;gi--){
                var gr=container.groupItems[gi];
                var gn="";
                try{gn=String(gr.name||"").toUpperCase();}catch(e5){}

                if(gn==="SIZE_TAG"){
                    try{
                        gr.locked=false;
                        gr.hidden=false;
                        gr.remove();
                    }catch(e6){}
                    continue;
                }

                walk(gr);
            }
        }catch(e7){}
    }

    walk(g);
}

function JV2_mm(v){return v*72/25.4;}

function JV2_directGroup(c,n){
    var g;try{g=c.groupItems;}catch(e){return null;}
    for(var i=0;i<g.length;i++)if(g[i].name===n)return g[i];
    return null;
}
function JV2_visualBounds(it){
    if(!it)return null;

    // For generated *_FINAL groups, use the garment clipping mask as the
    // spacing reference. This ignores TAG / FIXED_OBJECT / labels that can
    // make visibleBounds much wider than the actual pattern piece.
    try{
        var mask=JV2_findItem(it,"CLIP_MASK");
        if(mask)return mask.visibleBounds;
    }catch(e){}

    try{return it.visibleBounds;}catch(e2){return null;}
}

function JV2_moveVisualTopLeft(it,x,y){
    var b=JV2_visualBounds(it);
    if(!b)return false;
    it.translate(x-b[0],y-b[1]);
    return true;
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
    // Tight visual layout:
    // BODY_FRONT | BODY_BACK
    // SS_LEFT    | SS_RIGHT
    // LS_LEFT    | LS_RIGHT
    //
    // IMPORTANT: spacing is calculated from CLIP_MASK silhouette bounds,
    // not from TAG / FIXED_OBJECT / other decoration bounds.

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

    // Smaller visual gap between pieces.
    var pieceGap=JV2_mm(28);

    var topY=0;
    var x=0;
    var maxBodyH=0;

    if(bf){
        JV2_moveVisualTopLeft(bf,x,topY);
        var b1=JV2_visualBounds(bf);
        if(b1){
            x+=JV2_w(b1)+pieceGap;
            maxBodyH=Math.max(maxBodyH,JV2_h(b1));
        }
    }

    if(bb){
        JV2_moveVisualTopLeft(bb,x,topY);
        var b2=JV2_visualBounds(bb);
        if(b2)maxBodyH=Math.max(maxBodyH,JV2_h(b2));
    }

    var ssY=topY-maxBodyH-pieceGap;
    var ssX=0;
    var maxSSH=0;
    var ss=[ssl,ssr];

    for(var i=0;i<ss.length;i++){
        var sl=ss[i];
        if(!sl)continue;
        JV2_moveVisualTopLeft(sl,ssX,ssY);
        var sb=JV2_visualBounds(sl);
        if(sb){
            ssX+=JV2_w(sb)+pieceGap;
            maxSSH=Math.max(maxSSH,JV2_h(sb));
        }
    }

    var hasSS=(ssl||ssr)?true:false;

    // v2.0.9 B18:
    // BODY + LS only remains unchanged.
    // When BOTH SS + LS exist, calculate the SS bottom edge directly
    // from the already-positioned sleeve groups so there is no scope error.
    var sleeveRowGap=JV2_mm(14);
    var lsY=ssY;

    if(hasSS){
        var ssBottom=null;
        var sslB=JV2_visualBounds(ssl);
        var ssrB=JV2_visualBounds(ssr);

        if(sslB){
            ssBottom=sslB[3];
        }

        if(ssrB){
            if(ssBottom===null || ssrB[3]<ssBottom){
                ssBottom=ssrB[3];
            }
        }

        if(ssBottom!==null){
            lsY=ssBottom-sleeveRowGap;
        }else{
            lsY=ssY-maxSSH-sleeveRowGap;
        }
    }

    var lsX=0;
    var ls=[lsl,lsr];

    for(var j=0;j<ls.length;j++){
        var ll=ls[j];
        if(!ll)continue;
        JV2_moveVisualTopLeft(ll,lsX,lsY);
        var lb=JV2_visualBounds(ll);
        if(lb)lsX+=JV2_w(lb)+pieceGap;
    }

    var oldNames=[
        "BODY_FRONT","BODY_BACK",
        "SLEEVE_SS_RIGHT","SLEEVE_SS_LEFT",
        "SLEEVE_LS_RIGHT","SLEEVE_LS_LEFT"
    ];

    // B21: remove the original master/template groups after the
    // generated *_FINAL groups are ready. These old groups can retain
    // hidden/reference geometry far outside the visible jersey pieces.
    for(var k=0;k<oldNames.length;k++){
        var g=JV2_directGroup(pattern,oldNames[k]);
        if(g){
            try{
                g.locked=false;
                g.hidden=false;
                g.remove();
            }catch(e){}
        }
    }

    // Clean stray direct helper/reference objects copied from master.
    // Keep only the final generated garment groups.
    for(var pi=pattern.pageItems.length-1;pi>=0;pi--){
        var it=pattern.pageItems[pi];
        try{
            if(it.parent!==pattern)continue;

            var nm=String(it.name||"");
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

    function musVisualBounds(item){
        if(!item)return null;

        // Use the actual garment clipping silhouette for MUSV spacing.
        try{
            var mask=JV2_findItem(item,"CLIP_MASK");
            if(mask)return mask.visibleBounds;
        }catch(e){}

        try{return item.visibleBounds;}catch(e2){return null;}
    }

    function moveTL(item,x,y){
        if(!item)return null;
        var b=musVisualBounds(item);
        if(!b)return null;
        item.translate(x-b[0],y-b[1]);
        return musVisualBounds(item);
    }

    // Use zero-based local coordinates for each MUSV set.
    // MUSV has its own tighter internal spacing.
    var musGap=JV2_mm(14);
    var topY=0;
    var x=0;
    var maxBodyH=0;

    var b1=moveTL(bf,x,topY);
    if(b1){
        x+=JV2_w(b1)+musGap;
        maxBodyH=Math.max(maxBodyH,JV2_h(b1));
    }

    var b2=moveTL(bb,x,topY);
    if(b2){
        maxBodyH=Math.max(maxBodyH,JV2_h(b2));
    }

    // Sleeves directly below the tallest body.
    var sleeveY=topY-maxBodyH-musGap;
    var sx=0;

    var s1=moveTL(sl,sx,sleeveY);
    if(s1){
        sx+=JV2_w(s1)+musGap;
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

function JV2_generatedVisualBounds(container){
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

    var names=[
        "BODY_FRONT_FINAL","BODY_BACK_FINAL",
        "SLEEVE_SS_RIGHT_FINAL","SLEEVE_SS_LEFT_FINAL",
        "SLEEVE_LS_RIGHT_FINAL","SLEEVE_LS_LEFT_FINAL",
        "BODY_FRONT_MUS_FINAL","BODY_BACK_MUS_FINAL",
        "SLEEVE_RIGHT_MUS_FINAL","SLEEVE_LEFT_MUS_FINAL"
    ];

    for(var i=0;i<names.length;i++){
        var g=null;
        try{g=JV2_findGroup(container,names[i]);}catch(e){}
        if(!g)continue;

        var b=null;
        try{
            var mask=JV2_findItem(g,"CLIP_MASK");
            b=mask?mask.visibleBounds:g.visibleBounds;
        }catch(e2){
            try{b=g.visibleBounds;}catch(e3){}
        }

        if(b)out=merge(out,b);
    }

    return out;
}

function JV2_addSizeLabel(jobLayer,size,gap){
    try{
        if(!jobLayer)return null;
        var b=JV2_generatedVisualBounds(jobLayer);
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

        tf.left=b[0];
        tf.top=b[1]+JV2_mm(28);

        try{tf.zOrder(ZOrderMethod.BRINGTOFRONT);}catch(e6){}
        return tf;
    }catch(e){
        return null;
    }
}

function JV2_rebuildCleanStandardPattern(jobLayer,target,type){
    if(!jobLayer || !target)return target;
    if(String(type||"").toUpperCase()==="MUSV")return target;

    try{
        var clean=jobLayer.groupItems.add();
        clean.name="PATTERN";

        var names=[
            "BODY_FRONT_FINAL",
            "BODY_BACK_FINAL",
            "SLEEVE_SS_RIGHT_FINAL",
            "SLEEVE_SS_LEFT_FINAL",
            "SLEEVE_LS_RIGHT_FINAL",
            "SLEEVE_LS_LEFT_FINAL"
        ];

        var moved=0;

        for(var i=0;i<names.length;i++){
            var g=JV2_directGroup(target,names[i]);
            if(g){
                try{
                    g.move(clean,ElementPlacement.PLACEATEND);
                    moved++;
                }catch(eMove){}
            }
        }

        // Only replace the old PATTERN if at least one FINAL group moved.
        if(moved>0){
            try{
                target.locked=false;
                target.hidden=false;
                target.remove();
            }catch(eRemove){}
            return clean;
        }

        // Nothing moved: keep original target and remove empty clean wrapper.
        try{clean.remove();}catch(eClean){}
        return target;

    }catch(e){
        return target;
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

        var JV2_DOC_SPACE=(String(colorMode||"CMYK").toUpperCase()==="RGB")
            ? DocumentColorSpace.RGB
            : DocumentColorSpace.CMYK;

        // v2.0.9 B14:
        // Create a larger output canvas from the start.
        // Pattern arrangement coordinates are NOT changed.
        // This only gives the white artboard enough room to follow mixed
        // Standard + KIDS layouts that exceed the legacy document limits.
        try{
            outDoc=app.documents.add(JV2_DOC_SPACE,16000,16000);
        }catch(eLarge){
            outDoc=app.documents.add(JV2_DOC_SPACE,12000,12000);
        }

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

            // KIDS only: remove the inherited/master size mark here,
            // BEFORE any generated SIZE_TAG / plugin size label is created.
            if(type==="KIDS"){
                JV2_removeKidsMasterSizeMark(target,size);
            }

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
            }else{
                JV2_layoutGeneratedSet(target,gap);

                // v2.0.9 B22:
                // Rebuild STANDARD/KIDS into a clean PATTERN containing ONLY
                // the generated *_FINAL garment groups.
                target=JV2_rebuildCleanStandardPattern(jobLayer,target,type);
            }

            // v2.0.9 B23:
            // Final safety rebuild for PATTERN_STROKE on every garment type,
            // including STANDARD, KIDS and MUSV.
            try{
                var strokeNames=[
                    "BODY_FRONT_FINAL",
                    "BODY_BACK_FINAL",
                    "SLEEVE_SS_RIGHT_FINAL",
                    "SLEEVE_SS_LEFT_FINAL",
                    "SLEEVE_LS_RIGHT_FINAL",
                    "SLEEVE_LS_LEFT_FINAL",
                    "BODY_FRONT_MUS_FINAL",
                    "BODY_BACK_MUS_FINAL",
                    "SLEEVE_RIGHT_MUS_FINAL",
                    "SLEEVE_LEFT_MUS_FINAL"
                ];

                for(var psi=0;psi<strokeNames.length;psi++){
                    var psg=JV2_findGroup(jobLayer,strokeNames[psi]);
                    if(psg)JV2_rebuildFinalPatternStroke(psg);
                }
            }catch(strokeRebuildErr){}

            jobs.push(jobLayer);
            jobSizes.push(size);
        }

        // Auto-arrange complete generated sets in queue order.
        // Illustrator Layer objects do NOT expose visibleBounds, so calculate
        // bounds from the pageItems contained by each job layer.

        function JV2_jobVisualBounds(ly){
            return JV2_generatedVisualBounds(ly);
        }
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

        var setGap=JV2_mm(48);
        var x=0,y=0,rowH=0,col=0;

        for(var j=0;j<jobs.length;j++){
            var ly=jobs[j];

            // Use garment silhouette bounds for packing.
            var b=JV2_jobVisualBounds(ly);
            if(!b)b=JV2_layerBounds(ly);
            if(!b)continue;

            var w=b[2]-b[0],h=b[1]-b[3];

            if(col>=maxRow){
                x=0;
                y-=rowH+setGap;
                rowH=0;
                col=0;
            }

            var dx=x-b[0];
            var dy=y-b[1];
            JV2_translateLayer(ly,dx,dy);

            x+=w+setGap;
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
            // No visual margin: first garment starts at the artboard edge.
            var margin=0;

            // Calculate VISUAL garment bounds only, ignoring tag/fixed-object
            // protrusions for the top-left starting point.
            var visualAllB=null;
            for(var vi=0;vi<jobs.length;vi++){
                var vb=JV2_jobVisualBounds(jobs[vi]);
                if(!vb)continue;
                visualAllB=JV2_mergeBounds(visualAllB,vb);
            }
            if(!visualAllB)visualAllB=allB;

            // Upper-left anchor on Illustrator pasteboard.
            var anchorLeft=-7000;
            var anchorTop=7000;

            // First move ALL artwork so the first visible garment starts
            // exactly at the top-left artboard anchor.
            var edgeGap=JV2_mm(2);
            var dx=(anchorLeft+edgeGap)-visualAllB[0];
            var dy=(anchorTop-edgeGap)-visualAllB[1];

            JV2_translateLayer(outLayer,dx,dy);
            app.redraw();

            // Recompute FULL bounds after movement so all artwork remains
            // inside the artboard, while visual garment stays at the start edge.
            allB=JV2_layerBounds(outLayer);

            if(allB){
                try{
                    var artLeft=Math.min(anchorLeft,allB[0]);
                    var artTop=Math.max(anchorTop,allB[1]);
                    var artRight=Math.max(anchorLeft,allB[2]);
                    var artBottom=Math.min(anchorTop,allB[3]);

                    outDoc.artboards[0].artboardRect=[
                        artLeft,
                        artTop,
                        artRight,
                        artBottom
                    ];
                }catch(artErr){}
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

        // v2.0.9 B15 — FULL ARTBOARD + ALL PATTERNS INSIDE
        // Keep the approved FULL white artboard from B14.
        // Do not rearrange individual patterns. Move the COMPLETE output layer
        // as one unit so all generated patterns sit inside the full artboard.
        try{
            var finalB=JV2_layerBounds(outLayer);

            if(finalB){
                var margin=JV2_mm(15);
                var abr=outDoc.artboards[0].artboardRect;

                // Desired content start = 15 mm inside current full artboard.
                var targetLeft=abr[0]+margin;
                var targetTop=abr[1]-margin;

                // Move the entire generated output together.
                // Relative spacing/positions between patterns do not change.
                var moveX=targetLeft-finalB[0];
                var moveY=targetTop-finalB[1];

                JV2_translateLayer(outLayer,moveX,moveY);
                app.redraw();

                // Re-read bounds after whole-output move.
                finalB=JV2_layerBounds(outLayer);

                if(finalB){
                    // If the B14 full artboard is still smaller on the far
                    // right/bottom, extend ONLY those edges. Never shrink it.
                    var needRight=finalB[2]+margin;
                    var needBottom=finalB[3]-margin;

                    var newRight=Math.max(abr[2],needRight);
                    var newBottom=Math.min(abr[3],needBottom);

                    outDoc.artboards[0].artboardRect=[
                        abr[0],
                        abr[1],
                        newRight,
                        newBottom
                    ];
                }
            }

            app.redraw();
            outDoc.selection=null;
        }catch(fitErr){}

        app.redraw();

        // v2.0.9 B25 — FINAL PATTERN UNGROUP
        // Last step only. Keep each BODY/SLEEVE *_FINAL group intact,
        // but remove the outer PATTERN wrapper so body and sleeves are
        // individually selectable/editable in Illustrator.
        try{
            for(var uj=0;uj<jobs.length;uj++){
                var uLayer=jobs[uj];
                if(!uLayer)continue;

                var pat=JV2_findDirectGroup(uLayer,"PATTERN");
                if(!pat)continue;

                // Move direct child groups out of PATTERN into the job layer.
                // Moving does not change artwork coordinates.
                for(var ug=pat.groupItems.length-1;ug>=0;ug--){
                    try{
                        pat.groupItems[ug].move(uLayer,ElementPlacement.PLACEATEND);
                    }catch(eMove){}
                }

                // Move any remaining direct page items too, without touching
                // the internal grouping of BODY/SLEEVE final pieces.
                for(var up=pat.pageItems.length-1;up>=0;up--){
                    try{
                        var pit=pat.pageItems[up];
                        if(pit.parent===pat){
                            pit.move(uLayer,ElementPlacement.PLACEATEND);
                        }
                    }catch(eMove2){}
                }

                try{
                    pat.locked=false;
                    pat.hidden=false;
                    pat.remove();
                }catch(eRemove){}
            }
        }catch(ungroupErr){}

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
