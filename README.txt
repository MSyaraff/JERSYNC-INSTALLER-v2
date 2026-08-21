JERSYNC V2 v2.0.3 — WINDOWS INSTALLER BUILDER

This builder creates:
JERSYNC_V2_Installer_Windows_2020Plus_v2.0.3.exe

Recommended method:
1. Extract this ZIP.
2. Upload ALL contents to a GitHub repository.
3. GitHub > Actions > Build JERSYNC V2 Windows v2.0.3.
4. Run workflow.
5. Download artifact: JERSYNC-V2-Windows-v2.0.3.

Installer:
- Installs JERSYNC V2 to:
  %APPDATA%\Adobe\CEP\extensions\JERSYNC_V2
- Enables PlayerDebugMode for CSXS 9–13.
- Removes old JERSYNC_V2_TEST / JERSYNC_V2 folder before install.
- Intended for Illustrator 2020+ / CEP 9+.

IMPORTANT:
This V2 installer is separate from JERSYNC V1.
It does NOT remove the original JERSYNC V1 folder.
