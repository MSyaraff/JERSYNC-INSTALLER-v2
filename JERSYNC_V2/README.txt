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

JERSYNC V2 FINAL v2.0.5
- Rebuilt directly from the confirmed FINAL updater-enabled V2 build.
- Production extension identity forced to JERSYNC V2 (no TEST ID/menu).
- Updater remains active and uses the dedicated JERSYNC-UPDATE-V2 repository.
- Added a polished compact COLOR MODE panel at the very top.
- CMYK remains default; RGB is optional.
- Added optional Nama Tag / TAG_TYPE override.
- Core Standard 4x2 / MUSV 3x2 generation system unchanged.

JERSYNC V2 FINAL v2.0.6
- Added KIDS pattern type.
- KIDS master layer naming:
  KIDS > 22/24/26/28/30/32/34 > same-size inner layer.
- KIDS size picker shows ONLY: 22, 24, 26, 28, 30, 32, 34.
- KIDS part layers use existing standard names:
  BODY_FRONT / BODY_BACK
  SLEEVE_SS_RIGHT / SLEEVE_SS_LEFT
  SLEEVE_LS_RIGHT / SLEEVE_LS_LEFT
- KIDS supports SS / LS / BOTH.
- KIDS uses Standard layout 4x2, maximum 8 sets per output AI file.
- MUSV remains separate at 3x2.
- Existing FINAL updater, CMYK/RGB panel, custom TAG_TYPE, stroke and generation systems remain unchanged.

v2.0.6 KIDS SIZE PANEL FIX
- Fixed KIDS size panel switching.
- Selecting KIDS now replaces the entire size panel with:
  22, 24, 26, 28, 30, 32, 34.
- Selecting RN / POLO / VNECK / VFLAT / MUSV restores:
  XS, S, M, L, XL, 2XL ... 10XL.
- Size buttons remain multi-select.
- No generation/layout logic changed.

v2.0.6 KIDS POSITION FIX
- Fixed KIDS patterns generating far away from the RN/standard layout.
- Cause: KIDS master has an extra same-size wrapper:
  KIDS > 22 > 22 > BODY_FRONT...
- Engine now enters the inner same-size group before duplication.
- KIDS therefore uses the exact proven RN/Standard compact layout:
  BODY_FRONT | BODY_BACK
  SS below
  LS below SS (or directly below body when SS is not selected).
- No Standard/MUSV layout logic changed.

v2.0.6 KIDS STRICT POSITION FIX
- KIDS now has a dedicated strict layout using the SAME arrangement as RN.
- KIDS FINAL groups are reset from a clean local origin before global auto-arrange.
- Original KIDS master containers and stray direct master objects are removed.
- This prevents old master coordinates from pushing KIDS patterns outside the output artboard.
- RN/POLO/VNECK/VFLAT and MUSV logic unchanged.

v2.0.6 UPDATER CACHE FIX
- Updater remains on locked v2.0.6 build.
- Adds hard cache-bypass to version-v2.json requests.
- Request now uses timestamp + random cache-buster.
- Sends Cache-Control / Pragma / Expires no-cache headers where CEP allows.
- Core pattern generation, KIDS layout, CMYK/RGB, updater repo and all production logic unchanged.


TRACE BUILD 2.0.8-A1
- SPACING / STANDARD LAYOUT source: user-uploaded locked JERSYNC V2 v2.0.3.
- Exact Standard layout helpers restored from that file.
- Exact global auto-arrange + artboard positioning restored from that file.
- KIDS remains available but uses the SAME Standard layout function; no KIDS-specific spacing engine.
- KIDS sizes remain 22,24,26,28,30,32,34.
- Custom TAG_TYPE, CMYK/RGB, MUSV, updater cache fix and other new features remain.

TRACE BUILD 2.0.8-A2
- Spacing fix now uses garment CLIP_MASK silhouette bounds.
- TAG / FIXED_OBJECT / logo / auxiliary artwork no longer enlarges spacing calculations.
- Piece gap inside one set: 5 mm.
- Set-to-set gap: 5 mm.
- KIDS, TAG_TYPE override, CMYK/RGB, MUSV and updater cache fix retained.

TRACE BUILD 2.0.8-A3
- First pattern moved closer to the artboard top-left corner.
- Artboard edge margin reduced from 15 mm to 5 mm.
- Spacing between complete size sets increased from 5 mm to 12 mm.
- Size label positioning unchanged.
- Internal garment-piece spacing remains 5 mm.
- KIDS, custom TAG_TYPE, CMYK/RGB, MUSV and updater cache fix retained.

TRACE BUILD 2.0.8-A4
- First visible garment now starts exactly at the artboard top-left edge.
- Final artboard positioning now references garment visual bounds, not tag/fixed-object bounds.
- Body / sleeve piece spacing increased from 5 mm to 8 mm.
- Size-set spacing increased from 12 mm to 16 mm.
- Size label positioning unchanged.

TRACE BUILD 2.0.9-A1
- Fixed broken panel actions from A5 by rebuilding from working A4.
- Size labels and pattern packing now use the same clean visual-bounds helper.
- Label stays directly above its own pattern.
- Body/piece spacing: 10 mm.
- Size-set spacing: 18 mm.
- First visible pattern starts 2 mm from artboard top-left.

v2.0.9 B1 SAFE BUILD
- Rebuilt from v2.0.9-A1, the confirmed button-working build.
- No large host JSX blocks were deleted/replaced.
- Spacing: label 28 mm, internal pattern 28 mm, size-set 48 mm.
- Final artboard fit is injected only after labels are created.
- Artboard uses complete output-layer bounds with zero outer margin.
- Version remains v2.0.9 until final approval for v2.1.0.

v2.0.9 B2 EDGE START FIX
- Rebuilt from button-safe B1.
- First visible pattern now starts exactly from the LEFT edge of the artboard.
- Artboard top follows the size label / full content above the pattern.
- Right and bottom sides continue to follow the complete generated output.
- Existing spacing values remain unchanged.
- No button/UI logic changed.

v2.0.9 B3 ARTBOARD CONTENT FIX
- Keeps the approved B2 pattern arrangement.
- First visible pattern still starts from the left edge.
- After the final move, artboard is rebuilt from FULL output-layer bounds.
- All generated patterns, size labels and objects are forced inside the artboard.
- No spacing/UI/button logic changed.

v2.0.9 B5 NATIVE ARTBOARD FIT
- Returned to the approved B3 arrangement/spacing.
- Removed manual final artboardRect calculations.
- Final artboard now uses Illustrator's native fitArtboardToSelectedArt(0).
- Every generated page item in OUTPUT is selected before fitting.
- Fallback uses Illustrator's native Fit Artboard command.
- No Large Canvas document-size modification.
- No UI/button logic changed.

v2.0.9 B7 KIDS LABEL-ONLY FIX
- Based directly on B5 approved layout/artboard build.
- ARTBOARD LOGIC NOT CHANGED.
- SPACING / ARRANGEMENT NOT CHANGED.
- For KIDS only, inherited/master size text is removed immediately after the KIDS master pattern is duplicated.
- Cleanup happens BEFORE generated SIZE_TAG / plugin size label is created.
- The correctly positioned plugin size label remains.

v2.0.9 B8 ARTBOARD-ONLY FIX
- Based directly on B7 approved KIDS-label build.
- KIDS duplicate-label fix unchanged.
- Pattern spacing/arrangement unchanged.
- UI/buttons unchanged.
- Final artboard fit now recursively selects all generated items inside OUTPUT sublayers/groups before calling Illustrator native fitArtboardToSelectedArt.
- This addresses the previous issue where only top-level output items were selected, so the artboard did not follow all patterns.

v2.0.9 B9 FULL ARTBOARD + INNER MARGIN
- Based directly on B8.
- Pattern arrangement, spacing and KIDS label fix are unchanged.
- Illustrator first fits artboard to all recursively selected generated artwork.
- After native fit, artboard expands 15 mm on LEFT, TOP, RIGHT and BOTTOM.
- This creates a visible white inner margin while keeping every generated pattern inside the artboard.
- UI/buttons unchanged.

v2.0.9 B10
- Based on B9.
- MUSV only: body/body and sleeve spacing now uses dedicated 14 mm gap instead of generic 28 mm gap.
- Standard/KIDS arrangement and spacing unchanged.
- KIDS single size-label fix unchanged.
- Artboard final bounds now scan outDoc.pageItems document-wide, including nested/far-end generated items.
- Final white artboard adds 15 mm inner margin on all four sides.
- UI/buttons unchanged.

v2.0.9 B11 MIXED RN + KIDS ARTBOARD FIX
- Based directly on B10.
- MUSV spacing fix remains unchanged.
- Standard/KIDS/MUSV arrangement remains unchanged.
- KIDS duplicate size-label fix remains unchanged.
- Artboard now explicitly merges bounds from EVERY generated job layer.
- This specifically targets mixed RN + KIDS output, where RN-only already fitted correctly.
- Remaining OUTPUT items are merged too.
- 15 mm inner artboard margin retained.
- UI/buttons unchanged.

v2.0.9 B13 ARTBOARD-ONLY / NO PATTERN MOVE
- Based directly on B11, where pattern positions were already approved.
- NO pattern translate/move/rearrange is performed.
- Standard, KIDS and MUSV positions/spacings remain exactly as generated.
- Final bounds are merged from every generated job plus size labels and remaining OUTPUT objects.
- Only the white artboardRect is changed to follow all existing artwork.
- 15 mm inner margin is added around the existing artwork.
- KIDS duplicate-size-label fix and MUSV spacing fix remain.
- UI/buttons unchanged.

v2.0.9 B14 ARTBOARD CAPACITY FIX
- Based directly on B13.
- Pattern positions, spacing, RN/KIDS/MUSV layout are NOT changed.
- Only output document canvas capacity is increased at creation time.
- Final B13 artboard-only logic remains unchanged.
- Intended to let the white artboard actually expand/move around all mixed Standard + KIDS sizes without hitting the legacy Illustrator canvas limit.
- 15 mm inner margin remains.
- UI/buttons unchanged.

v2.0.9 B15 STANDARD + MUSV / FULL ARTBOARD
- Based directly on B14, whose full white artboard behavior was approved.
- KIDS now uses the same STANDARD layout/packing as RN, POLO, VNECK, VFLAT and other standard types.
- Only two layout families remain: STANDARD and MUSV.
- MUSV spacing fix remains unchanged.
- KIDS duplicate size-label fix remains unchanged.
- B14 large/full output canvas remains.
- Complete OUTPUT is moved as ONE unit 15 mm inside the full white artboard.
- Individual pattern positions and relative spacing are NOT changed.
- If required, only right/bottom artboard edges extend so every pattern stays inside.
- UI/buttons unchanged.

v2.0.9 B16 SLEEVE ROW GAP FIX
- Based directly on B15.
- Only the vertical gap between STANDARD short-sleeve row and long-sleeve row is changed.
- SS -> LS row gap is now 14 mm instead of following the larger general piece gap.
- Body spacing, size-set spacing, KIDS=STANDARD logic, MUSV layout, KIDS label fix and B15 full-artboard behavior remain unchanged.
- UI/buttons unchanged.

v2.0.9 B17 SS + LS GAP FIX
- Based directly on B16.
- BODY + LS-only behavior is unchanged.
- When BOTH SS and LS exist, LS is now positioned from the actual visible bottom edge of the SS sleeves.
- No longer relies only on maxSSH/group height, which could create a large SS-to-LS gap.
- Target SS-to-LS gap remains 14 mm.
- Body spacing, size-set spacing, KIDS=STANDARD, MUSV, artboard and UI/buttons unchanged.

v2.0.9 B18 FIX
- Fixes ERR Line 662: s1 is undefined from B17.
- SS bottom edge is now read directly from JV2_visualBounds(ssl/ssr).
- BODY + LS-only layout remains unchanged.
- BOTH SS + LS keeps the intended 14 mm SS-to-LS gap.
- No artboard, KIDS, MUSV, spacing, or UI/button logic changed.

v2.0.9 B19 MUSV CLIP + IMAGE PRESERVE
- Based directly on B18.
- MUSV arrangement now uses CLIP_MASK.visibleBounds when available.
- Artwork/tag/fixed/stroke outside the clipping silhouette no longer affects MUSV spacing.
- Linked/raster PlacedItem objects in duplicated generated artwork are embedded into the OUTPUT copy.
- Source artwork is not modified.
- Standard/KIDS layout, artboard logic, spacing and UI/buttons remain unchanged from B18.

v2.0.9 B21 STANDARD BOUNDING BOX CLEANUP
- Based directly on B19.
- Removes leftover master BODY/SLEEVE template groups after *_FINAL output is created.
- Removes stray direct helper/reference objects from PATTERN.
- Keeps final generated body/sleeve groups including artwork, CLIP_MASK, tags, fixed objects and embedded raster images.
- Intended to make Illustrator selection bounds follow the visible pattern instead of invisible/far master geometry.
- MUSV CLIP_MASK spacing and image-preserve fixes remain.
- Artboard, spacing and UI/buttons unchanged.

v2.0.9 B22 CLEAN FINAL PATTERN GROUP
- Based directly on B21.
- STANDARD/KIDS only: after layout, a brand-new clean PATTERN group is created.
- Only BODY/SLEEVE *_FINAL groups are moved into the clean PATTERN.
- The original duplicated master PATTERN is removed completely.
- This is intended to eliminate any hidden/reference objects still affecting Illustrator's selection bounding box.
- Relative positions of generated garment pieces are preserved.
- MUSV is not changed.
- Artboard, spacing, image-preserve, CLIP_MASK spacing and UI/buttons are unchanged.

v2.0.9 B23 PATTERN_STROKE BOUNDS FIX
- Based directly on B22.
- Fixes oversized Illustrator selection boxes caused by PATTERN_STROKE.
- PATTERN_STROKE is now rebuilt from the FINAL CLIP_MASK, not from the old source/template path.
- Old PATTERN_STROKE is removed before rebuild.
- Stroke width/color settings remain controlled by the existing plugin settings.
- Applies to STANDARD, KIDS and MUSV:
  BODY_FRONT/BACK, SS sleeves, LS sleeves, MUSV body/sleeves.
- Final safety pass rebuilds every generated PATTERN_STROKE after layout.
- MUSV CLIP_MASK spacing, image-preserve, artboard and UI/button logic remain unchanged.

v2.0.9 B24 FIXED_OBJECT SCALE PER SIZE
- Based directly on B23.
- FIXED_OBJECT now stores relative width/height and center position against the source reference.
- On every target garment size, FIXED_OBJECT is resized to match that new pattern size, then repositioned relatively.
- Hidden FIXED_OBJECT in the source artwork still gets measured and scaled.
- Source hidden/visible state is preserved on the duplicated output copy where Illustrator allows it.
- Applies to STANDARD, KIDS and MUSV because JV2_addFixed is shared.
- Pattern stroke fix, MUSV CLIP_MASK spacing, image preserve, artboard, spacing and UI/button logic remain unchanged.

v2.0.9 B25 UI + FINAL UNGROUP
- Based directly on B24.
- Adds RESET button to PILIH POLA panel only; queue is not cleared.
- RESET returns type to RN, sleeve to SS, clears selected sizes and clears Nama Tag.
- Adds × clear button inside Nama Tag input.
- UI horizontal overflow is constrained so the panel does not scroll too far left/right.
- Last generation step removes only the outer PATTERN wrapper.
- BODY_FRONT/BACK and sleeve *_FINAL groups stay intact and become individually selectable.
- Relative pattern positions are unchanged.
- B24 FIXED_OBJECT scale-per-size, B23 stroke fix, MUSV/KIDS and other production logic remain.

==================================================
JERSYNC V2 — FINAL v2.1.0
==================================================

FINAL BASE:
- Promoted directly from approved v2.0.9 B25.

CORE PRODUCTION
- STANDARD layout for RN / POLO / VNECK / VFLAT / KIDS.
- MUSV uses its own dedicated layout.
- KIDS size support: 22, 24, 26, 28, 30, 32, 34.
- SS / LS / BOTH support for Standard types.
- MUSV automatically uses LS.
- Automatic file splitting by production capacity.
- CMYK / RGB output with CMYK default.
- Custom TAG_TYPE / Nama Tag support.
- FIXED_OBJECT support with scale-per-size behavior.
- Stroke controls with PATTERN_STROKE rebuilt from final CLIP_MASK.
- Linked/raster image preservation in generated output.
- Size labels and generation summary.
- Remembered master pattern and stroke settings.
- Built-in updater support.

LAYOUT / OUTPUT
- KIDS follows STANDARD layout.
- MUSV spacing uses CLIP_MASK visual bounds.
- SS-to-LS spacing fix retained.
- Full artboard behavior retained from approved production build.
- Final PATTERN wrapper is removed only at the last step.
- BODY / SLEEVE *_FINAL groups remain intact and individually selectable.

UI
- RESET button in PILIH POLA panel.
- RESET does not clear the queue.
- Nama Tag has a quick × clear button.
- Horizontal UI overflow constrained to prevent excessive left/right scrolling.
- Queue grouping and production panel behavior retained.

FINAL STATUS
- Version: v2.1.0
- This build is the locked FINAL base for future updates.
