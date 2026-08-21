JERSYNC V2 TEST v0.1

THIS IS A SEPARATE DEVELOPMENT PLUGIN.
It does not replace JERSYNC V1.

SUPPORTED IN THIS FIRST TEST:
- Universal Master AI.
- RN and POLO.
- XS–10XL.
- SS / LS / BOTH.
- Mixed Job Queue.
- Quantity per job.
- Queue-order Auto Arrange.
- BODY_FRONT / BODY_BACK.
- SLEEVE_SS_RIGHT / SLEEVE_SS_LEFT.
- SLEEVE_LS_RIGHT / SLEEVE_LS_LEFT.
- POLO FRONT_MARK supported when placed inside BODY_FRONT.
- Artwork source structure: ARTWORK_L.
- SIZE_TAG / FIXED_OBJECTS from artwork source are retained in generated parts.

EXPECTED ARTWORK STRUCTURE:
ARTWORK_L
  BODY_FRONT > F
  BODY_BACK > B
  SLEEVE_SS_RIGHT > RSS
  SLEEVE_SS_LEFT > LSS
  SLEEVE_LS_RIGHT > RLS
  SLEEVE_LS_LEFT > LLS

EXPECTED UNIVERSAL MASTER:
RN
  XS
  S
  M
  L
    SAIZ L
    BODY_FRONT > F
    BODY_BACK > B
    SLEEVE_SS_RIGHT > RSS
    SLEEVE_SS_LEFT > LSS
    SLEEVE_LS_RIGHT > RLS
    SLEEVE_LS_LEFT > LLS
  ...

POLO
  ...
  L
    BODY_FRONT
      FRONT_MARK (optional)
      F
    ...

IMPORTANT:
This is a test engine. Test using copies of AI files first.

v0.1.2 FIX
- Fixed ERR Line 311 / undefined is not an object.
- Cause: Illustrator ExtendScript Layer has no visibleBounds property.
- Auto Arrange now calculates bounds from layer pageItems.
- Translation only moves top-level layer items to prevent nested objects moving twice.

v0.1.3
- Output document is now CMYK.
- Generated pattern no longer keeps the physical arrangement from the master file.
- Internal set layout is forced:
    BODY_FRONT | BODY_BACK
    sleeves below (LEFT then RIGHT)
- Mixed job sets are still arranged in queue order after each set is internally arranged.

v0.1.4 LAYOUT FIX
- Fixed generated-part layout using *_FINAL groups instead of empty source containers.
- BODY_FRONT_FINAL + BODY_BACK_FINAL are forced to top row.
- Sleeve FINAL groups are forced below the bodies, LEFT then RIGHT.
- Auto-arrange bounds now include nested job sublayers.
- Output artboard now fits generated artwork instead of staying at the default position.
- CMYK output retained.

v0.1.5 TOP-LEFT ARTBOARD FIX
- Entire generated layout is re-anchored to the artboard top-left.
- Output no longer starts from the middle of the canvas.
- Artboard is fitted tightly around all generated artwork with 15 mm margin.
- CMYK output retained.

v0.1.6 COMPACT LAYOUT + REMEMBER MASTER
- Master AI path is remembered automatically after selecting it once.
- On the next plugin open, the previous master is restored if the file still exists.
- Internal set layout:
    BODY_FRONT | BODY_BACK
    SS_LEFT    | SS_RIGHT
    LS_LEFT    | LS_RIGHT
- When BOTH is selected, LS is placed directly below the SS row.
- When LS only is selected, LS is placed directly below the body row.
- Multiple generated sets continue packing from left to right, then to the next row.
- CMYK output and top-left artboard anchoring retained.

v0.1.7 ARTBOARD CoOA FIX
- Fixes Illustrator error 1095724867 ('CoOA') while resizing the output artboard.
- Uses Illustrator fitArtboardToSelectedArt() instead of forcing artboardRect first.
- Adds margin only when Illustrator canvas limits allow it.
- If artboard resizing fails, generation still completes instead of stopping.
- Compact BODY / SS / LS layout and remembered master retained.

v0.1.8 LARGE WHITE ARTBOARD / TOP-LEFT ORIGIN
- White artboard remains large instead of shrinking around generated artwork.
- Generated layout starts from the real top-left corner of the white artboard.
- Initial artboard remains 2000 x 2000 pt.
- If many jobs exceed the page, the artboard expands only to the right and bottom.
- Top-left origin never moves.
- CMYK, compact BODY/SS/LS layout and remembered master retained.

v0.1.9 TRUE TOP-LEFT + PERSISTENT MASTER
- White artboard top-left is forced to Illustrator coordinate 0,0.
- Generated artwork begins 15 mm from the actual white artboard top-left.
- Artboard grows to the right and downward to contain all generated output.
- Master path is now stored in Folder.userData/JERSYNC_V2/last_master.txt.
- Master survives Illustrator/plugin restarts more reliably than localStorage.
- If remembered master is moved/deleted, plugin asks for a new one.

v0.2.2 HOTFIX
- Rebuilt from the last working v0.1.9 host script.
- Fixes CEP host-script parse failure that caused buttons to report:
  JV2_chooseOutput is not a function.
- Artboard-first logic re-added cleanly.
- All generated artwork starts inside the white artboard from its top-left margin.
- Artboard expands only right/down if required.
- Persistent remembered master retained.

v0.2.3 MOVE WHITE ARTBOARD TO UPPER-LEFT
- Moves the white artboard itself toward the upper-left pasteboard area.
- Generated artwork moves together with the artboard and remains inside it.
- Artboard size is calculated from the whole generated layout + 15 mm margin.
- Uses a safe anchor within Illustrator canvas limits.
- Falls back to the current artboard position if Illustrator refuses the move.
- CMYK, queue layout and remembered master retained.

v0.2.4 ROW/COLUMN SPLIT
- Quantity removed. Every ADD TO QUEUE is exactly 1 set.
- Default Columns = 3.
- Default Rows = 4.
- Maximum 12 sets per output AI file with default settings.
- If queue exceeds capacity, output automatically splits:
  filename_01.ai, filename_02.ai, filename_03.ai, ...
- Example: 29 jobs at 3 x 4 -> 12 + 12 + 5 across 3 AI files.
- Each file remains CMYK.
- Existing compact BODY / SS / LS set layout retained.
- Remembered master retained.

v0.2.5 AUTO-SPLIT MULTI-FILE FIX
- Fixes File 2/2 error: "Tak jumpa ARTWORK_L dalam artwork aktif."
- Original artwork document is remembered for the entire split job.
- Before every new output file, JERSYNC V2 switches back to the original ARTWORK document.
- After all batches finish, the last generated output file stays active.
- 3 columns × 4 rows / 12 sets per file retained.

v0.2.6 SIZE LABEL
- Adds automatic size-only label to every generated set.
- Label text examples: L, XL, 2XL.
- No garment type or sleeve text is shown.
- Label is placed at the top-left of each generated set.
- Multi-file auto split and remembered master retained.

v0.2.7 DEFAULT GRID CHANGE
- Default Columns = 4.
- Default Rows = 2.
- Maximum 8 sets per output AI file by default.
- Overflow automatically creates the next AI file.
- Size label feature from v0.2.6 retained.

v0.2.8 SIZE LABEL REAL FIX
- Fixes size labels not appearing.
- Size labels are created only AFTER final job arrangement.
- Labels are placed on a dedicated top-level SIZE_LABELS layer.
- Label contains SIZE ONLY: M, L, XL, 2XL, etc.
- 36 pt bold black label for clear production visibility.
- Default grid remains 4 columns x 2 rows (8 sets/file).

v0.2.9 SIZE LABEL PER SET FIX
- Fixes only one size label appearing.
- Every generated set gets its own SIZE label.
- Label is created inside that job layer, not in one shared label layer.
- Labels are created only AFTER final artboard/output movement.
- Label shows size only: M, L, XL, 2XL, etc.
- 4 columns x 2 rows and auto-split remain unchanged.

v0.3.0 JOB SIZE ARRAY FIX
- Fixes: ERR Line 563: jobSizes is undefined.
- jobSizes now lives inside JV2_generateSingle, parallel to jobs[].
- Each generated job pushes its own size before labels are created.
- Per-set size labels retained.

v0.3.1 SIZE LABEL SCOPE FIX
- Root cause fixed: size label helper was calling a bounds function that only existed inside JV2_generateSingle.
- Size label helper now calculates its own layer bounds.
- Every generated set should now show its own size label.
- Label size increased to 42 pt for easier visibility.
- 4 columns x 2 rows and auto-split retained.

v0.3.2 SIZE LABEL 400%
- Size label enlarged to 400% of v0.3.1.
- 42 pt -> 168 pt.
- All other V2 behavior unchanged.

v0.3.3 WORKFLOW REWORK
- Master path remembered.
- Tambah Job -> Tambah Pola.
- Dropdown jenis pola.
- Multi-select saiz.
- SS / LS / BOTH.
- Tukar jenis pola reset pilihan saiz.
- List diasingkan ikut jenis pola + sleeve, saiz ikut turutan, ada pangkah buang.
- Auto Arrange -> Susunan Pola.
- Generation/layout/split/CMYK/size-label system retained.

v0.3.4 FUTURISTIC + MASTER/ADVANCED/STROKE
- Fixed remembered master startup: restoreLastMaster() now runs every panel load.
- CHECK ARTWORK moved to a compact row at the bottom.
- Added Advanced panel:
  Auto Tag, FIXED_OBJECTS, Size Label.
- Added Stroke panel:
  enable/disable, width, color.
- Pattern types now available:
  RN, POLO, VNECK, MUS, VFLAT.
- TAG_TYPE automatically follows selected pattern type.
- Futuristic dark blue glass UI refresh.
- Existing V2 arrangement, 4x2 split, CMYK, multi-file split and queue workflow retained.

v0.3.5 FIX
- Removed Auto Tag option. Tags are always generated automatically.
- Fixes ERR: autoTag is undefined.
- Stroke engine rebuilt:
  clipping mask remains no-stroke;
  visible PATTERN_STROKE is generated as a separate outline object.
- Prevents duplicate pattern selection:
  same TYPE + SIZE + SLEEVE can only exist once in the list.
- If a duplicate is selected again it is ignored.

v0.3.6 FIXED_OBJECT + STROKE WIDTH + SS/LS MERGE
- FIXED_OBJECTS renamed to FIXED_OBJECT in generated output.
- Engine reads FIXED_OBJECT first, with legacy FIXED_OBJECTS fallback.
- Stroke width now uses the exact numeric pt value entered in the plugin.
- Visible outline traversal rebuilt so nested path items also receive the requested width.
- Same TYPE + SIZE can exist only once.
- If SS is already selected and the same TYPE + SIZE is later added as LS, it automatically becomes BOTH.
- LS then SS behaves the same.
- BOTH remains one generated size containing both SS and LS sleeves.

v0.3.7 FIX
- Fixes ERR: fixedObjects is undefined.
  Runtime options are now assigned inside JV2_generate(), not JV2_checkArtwork().
- Stroke width now reads the exact entered number and is re-applied after outline duplication.
- Stroke settings are remembered in:
  Folder.userData/JERSYNC_V2/stroke_settings.txt
  (On/Off, width, color).
- Last stroke settings restore automatically when panel opens.
- Pattern list is clearer:
  grouped by TYPE only;
  each item shows SIZE + SS/LS/BOTH clearly;
  each item keeps its remove x button.

v0.3.8 LIST GROUPING
- Main grouping by pattern TYPE retained.
- Inside each pattern type, list is now separated by sleeve:
  SS
  LS
  BOTH
- Sizes remain sorted inside each sleeve section.
- Each size keeps its individual remove (x) button.
- Compact layout retained.

v0.3.9 LIST UI POLISH
- Added spacing above the first sleeve group.
- Added cleaner separation between SS / LS / BOTH sections.
- Improved sleeve header contrast.
- Size chips are brighter and easier to scan.
- Pattern type header and count badge are clearer.
- Remove (x) remains minimalist.

v0.4.0 HIGH CONTRAST UI
- Increased contrast across the whole plugin UI.
- Darker panel backgrounds and brighter borders/text.
- Inputs, buttons and selected sizes are easier to distinguish.
- Pattern list TYPE header is larger and more prominent.
- SS / LS / BOTH sections and size chips have clearer visual hierarchy.
- Functional/generation system unchanged from v0.3.9.

v0.4.1 MUSV
- UI MUS renamed to MUSV.
- MUSV auto forces LS and locks sleeve selector.
- MUSV master uses BODY_FRONT_MUS, BODY_BACK_MUS, SLEEVE_RIGHT_MUS, SLEEVE_LEFT_MUS.
- MUSV artwork uses ARTWORK_MUS.
- Standard types continue using ARTWORK_L.
- TAG_TYPE for Muslimah output = MUSV.

v0.4.2 ARTWORK SOURCE FIX
- Fixes false "RN/POLO/MUSV artwork source" failures.
- Root cause: opening the Master AI changes Illustrator activeDocument to the master.
- Per-job artwork lookup now reads from the original artwork document explicitly.
- Standard types read ARTWORK_L from the artwork file.
- MUSV reads ARTWORK_MUS from the same artwork file.

v0.4.3 MUSV SEPARATE FILE ENGINE
- MUSV no longer shares output AI files with RN/POLO/VNECK/VFLAT.
- Standard garments generate to:
  <name>_STANDARD_01.ai, _02.ai, ...
- Muslimah generates to:
  <name>_MUSV_01.ai, _02.ai, ...
- Row x Column capacity is applied separately to STANDARD and MUSV.
- MUSV uses its own compact internal layout:
    BODY_FRONT_MUS | BODY_BACK_MUS
    SLEEVE_LEFT_MUS | SLEEVE_RIGHT_MUS
- MUSV sleeve row sits directly below the body row.
- Standard layout remains unchanged.

v0.4.4 MUSV STRICT LAYOUT FIX
- Fixes MUSV generated patterns appearing far below / far away.
- MUSV FINAL groups are repositioned from a fresh local 0,0 origin.
- Sleeves sit directly under the tallest body row.
- Original MUSV master source containers are removed after generation.
- Stray direct master objects are removed so they cannot distort auto-arrange bounds.
- Standard garment layout is unchanged.
- Size labels remain unchanged.

v0.4.5 FIXED LAYOUT ENGINE
- Removed SUSUNAN POLA controls from UI.
- STANDARD is permanently 4 columns x 2 rows = 8 sets/file.
- MUSV is permanently 3 columns x 2 rows = 6 sets/file.
- STANDARD and MUSV remain separate output file groups.
- Overflow continues automatically into _02, _03, etc.
- Gap is fixed internally at 20 mm.
- Existing generation/layout/stroke/settings logic retained.


JERSYNC V2 FINAL v2.0.0
- Update checker added at bottom, same workflow as V1.
- V2 uses a separate update channel: version-v2.json.
- Generate result now shows total set, Standard set, MUSV set, total files, and elapsed generation time.
- CHECK ARTWORK validates BOTH ARTWORK_L and ARTWORK_MUS, including all MUSV component groups.
- Size label enlarged from 168 pt to 200 pt.
- Description under List Jenis & Saiz Pola removed.
- Core generation/layout system remains locked.

JERSYNC V2 FINAL v2.0.1
- Added description under LIST JENIS & SAIZ POLA:
  "Semak jenis dan saiz baju di bawah"
- Slightly enlarged small/secondary UI text for readability.
- Enlarged size text in the pattern size picker.
- Core generation, artwork, MUSV, layout and output logic unchanged.

JERSYNC V2 FINAL v2.0.2
- Enlarged Jenis Pola text in Pilih Pola.
- Enlarged size picker text.
- Standardized small/detail UI typography.
- Jenis Pola, Saiz, Lengan, Ketebalan, Warna Stroke and Clear now use consistent sizing/weight.
- Core generation and layout logic unchanged.

JERSYNC V2 FINAL v2.0.3
- Added more spacing between PILIH POLA title and its description.
- Added matching spacing between LIST JENIS & SAIZ POLA title and its description.
- Core plugin logic unchanged.

v2.0.3 UPDATER ENDPOINT FIX
- Updater now uses the dedicated V2 repository:
  MSyaraff/JERSYNC-UPDATE-V2
- Update manifest:
  version-v2.json
- Core plugin/generation version remains v2.0.3.
