#define MyAppName "JERSYNC V2"
#define MyAppVersion "2.1.0"
#define MyAppPublisher "Solo Creative"
#define MyAppId "com.solocreative.jersyncv2"

[Setup]
AppId={#MyAppId}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}

DefaultDirName={userappdata}\Adobe\CEP\extensions\JERSYNC_V2

DisableDirPage=yes
DisableProgramGroupPage=yes

PrivilegesRequired=lowest

OutputDir=Output
OutputBaseFilename=JERSYNC_V2_Installer_Windows_2020Plus_v2.1.0

Compression=lzma2
SolidCompression=yes
WizardStyle=modern

Uninstallable=yes
SetupLogging=yes

ArchitecturesAllowed=x86 x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[InstallDelete]

; Remove previous JERSYNC V2 test/final installation
Type: filesandordirs; Name: "{userappdata}\Adobe\CEP\extensions\JERSYNC_V2_TEST"
Type: filesandordirs; Name: "{userappdata}\Adobe\CEP\extensions\JERSYNC_V2"

[Files]

; Install full JERSYNC V2 extension folder
Source: "JERSYNC_V2\*"; \
DestDir: "{userappdata}\Adobe\CEP\extensions\JERSYNC_V2"; \
Flags: ignoreversion recursesubdirs createallsubdirs

[Registry]

; Adobe CEP Debug Mode
Root: HKCU; \
Subkey: "Software\Adobe\CSXS.9"; \
ValueType: string; \
ValueName: "PlayerDebugMode"; \
ValueData: "1"

Root: HKCU; \
Subkey: "Software\Adobe\CSXS.10"; \
ValueType: string; \
ValueName: "PlayerDebugMode"; \
ValueData: "1"

Root: HKCU; \
Subkey: "Software\Adobe\CSXS.11"; \
ValueType: string; \
ValueName: "PlayerDebugMode"; \
ValueData: "1"

Root: HKCU; \
Subkey: "Software\Adobe\CSXS.12"; \
ValueType: string; \
ValueName: "PlayerDebugMode"; \
ValueData: "1"

Root: HKCU; \
Subkey: "Software\Adobe\CSXS.13"; \
ValueType: string; \
ValueName: "PlayerDebugMode"; \
ValueData: "1"

[UninstallDelete]

Type: filesandordirs; \
Name: "{userappdata}\Adobe\CEP\extensions\JERSYNC_V2"