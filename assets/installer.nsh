# Custom installer script for DysaBot Enterprise
# NSIS Script for Windows Installer

!macro customInit
    ; Check for administrative privileges
    UserInfo::GetAccountType
    Pop $R0
    StrCmp $R0 "Admin" admin_ok
    MessageBox MB_OK|MB_ICONSTOP "Administrator privileges required!"
    Quit
    admin_ok:

    ; Check Windows version
    ${If} ${AtMostWinVista}
        MessageBox MB_OK|MB_ICONSTOP "Windows 7 or higher is required!"
        Quit
    ${EndIf}

    ; Check for required dependencies
    ReadRegStr $0 HKLM "SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full\" "Release"
    ${If} $0 == ""
        MessageBox MB_YESNO|MB_ICONQUESTION "Microsoft .NET Framework 4.7.2 or higher is required. Would you like to download it now?" IDYES download_dotnet IDNO skip_dotnet
        download_dotnet:
            ExecShell "open" "https://dotnet.microsoft.com/download/dotnet-framework/net472"
        skip_dotnet:
    ${EndIf}

    ; Create installation directory if it doesn't exist
    CreateDirectory "$INSTDIR"
    
    ; Set proper permissions
    AccessControl::GrantOnFile "$INSTDIR" "(BU)" "FullAccess"
    AccessControl::GrantOnFile "$INSTDIR" "Administrators" "FullAccess"
!macroend

!macro customInstall
    ; Create application data directories
    CreateDirectory "$APPDATA\DysaBot Enterprise"
    CreateDirectory "$APPDATA\DysaBot Enterprise\logs"
    CreateDirectory "$APPDATA\DysaBot Enterprise\backups"
    CreateDirectory "$APPDATA\DysaBot Enterprise\config"
    CreateDirectory "$APPDATA\DysaBot Enterprise\temp"

    ; Set proper permissions for app data
    AccessControl::GrantOnFile "$APPDATA\DysaBot Enterprise" "(BU)" "FullAccess"
    
    ; Create shortcuts
    CreateDirectory "$SMPROGRAMS\DysaBot Enterprise"
    CreateShortcut "$SMPROGRAMS\DysaBot Enterprise\DysaBot Enterprise.lnk" "$INSTDIR\DysaBot Enterprise.exe"
    CreateShortcut "$SMPROGRAMS\DysaBot Enterprise\Uninstall.lnk" "$INSTDIR\uninstall.exe"
    
    ; Desktop shortcut (optional)
    CreateShortcut "$DESKTOP\DysaBot Enterprise.lnk" "$INSTDIR\DysaBot Enterprise.exe"
    
    ; Register URL protocol
    WriteRegStr HKCR "dysabot" "" "URL:DysaBot Protocol"
    WriteRegStr HKCR "dysabot" "URL Protocol" ""
    WriteRegStr HKCR "dysabot\DefaultIcon" "" "$INSTDIR\DysaBot Enterprise.exe,1"
    WriteRegStr HKCR "dysabot\shell\open\command" "" '"$INSTDIR\DysaBot Enterprise.exe" "%1"'
    
    ; Register file associations
    WriteRegStr HKCR ".dysabot" "" "DysaBot.File"
    WriteRegStr HKCR "DysaBot.File" "" "DysaBot Configuration File"
    WriteRegStr HKCR "DysaBot.File\DefaultIcon" "" "$INSTDIR\DysaBot Enterprise.exe,2"
    WriteRegStr HKCR "DysaBot.File\shell\open\command" "" '"$INSTDIR\DysaBot Enterprise.exe" "%1"'
    
    ; Windows Firewall rules
    nsExec::ExecToLog 'netsh advfirewall firewall add rule name="DysaBot Enterprise" dir=in action=allow program="$INSTDIR\DysaBot Enterprise.exe" enable=yes profile=any'
    nsExec::ExecToLog 'netsh advfirewall firewall add rule name="DysaBot Enterprise Backend" dir=in action=allow protocol=TCP localport=8005'
    
    ; Register with Windows Security Center (if available)
    ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "Windows Security Health Service"
    ${If} $0 != ""
        WriteRegStr HKLM "SOFTWARE\Microsoft\Security Center\Provider\Av" "DysaBot Enterprise" "$INSTDIR\DysaBot Enterprise.exe"
    ${EndIf}
    
    ; Auto-start configuration
    WriteRegStr HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "DysaBot Enterprise" '"$INSTDIR\DysaBot Enterprise.exe" --minimized'
    
    ; Event log source
    nsExec::ExecToLog 'eventcreate /T INFORMATION /ID 1000 /L APPLICATION /SO "DysaBot Enterprise" /D "DysaBot Enterprise has been installed successfully."'
!macroend

!macro customUnInstall
    ; Remove shortcuts
    Delete "$SMPROGRAMS\DysaBot Enterprise\DysaBot Enterprise.lnk"
    Delete "$SMPROGRAMS\DysaBot Enterprise\Uninstall.lnk"
    RMDir "$SMPROGRAMS\DysaBot Enterprise"
    Delete "$DESKTOP\DysaBot Enterprise.lnk"
    
    ; Remove registry entries
    DeleteRegKey HKCR "dysabot"
    DeleteRegKey HKCR ".dysabot"
    DeleteRegKey HKCR "DysaBot.File"
    DeleteRegValue HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "DysaBot Enterprise"
    DeleteRegValue HKLM "SOFTWARE\Microsoft\Security Center\Provider\Av" "DysaBot Enterprise"
    
    ; Remove firewall rules
    nsExec::ExecToLog 'netsh advfirewall firewall delete rule name="DysaBot Enterprise"'
    nsExec::ExecToLog 'netsh advfirewall firewall delete rule name="DysaBot Enterprise Backend"'
    
    ; Ask user if they want to keep user data
    MessageBox MB_YESNO|MB_ICONQUESTION "Do you want to keep your DysaBot Enterprise data and configuration files?" IDYES keep_data IDNO remove_data
    
    remove_data:
        RMDir /r "$APPDATA\DysaBot Enterprise"
        goto done
        
    keep_data:
        MessageBox MB_OK|MB_ICONINFORMATION "Your data has been preserved in: $APPDATA\DysaBot Enterprise"
        
    done:
    
    ; Event log
    nsExec::ExecToLog 'eventcreate /T INFORMATION /ID 1001 /L APPLICATION /SO "DysaBot Enterprise" /D "DysaBot Enterprise has been uninstalled."'
!macroend

# Custom pages
!macro customWelcomePage
    !insertmacro MUI_PAGE_WELCOME
    !define MUI_WELCOMEPAGE_TITLE "Welcome to DysaBot Enterprise Setup"
    !define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of DysaBot Enterprise, a complete restaurant chatbot management solution.$\r$\n$\r$\nBefore continuing, please ensure that you have administrator privileges and that no other instances of DysaBot Enterprise are running.$\r$\n$\r$\nClick Next to continue."
!macroend

!macro customFinishPage
    !insertmacro MUI_PAGE_FINISH
    !define MUI_FINISHPAGE_TITLE "DysaBot Enterprise Installation Complete"
    !define MUI_FINISHPAGE_TEXT "DysaBot Enterprise has been successfully installed on your computer.$\r$\n$\r$\nThe application will start automatically when Windows starts. You can also launch it manually from the Start Menu or Desktop shortcut.$\r$\n$\r$\nFor support and documentation, visit: https://www.zgamersa.com/chatbot$\r$\n$\r$\nClick Finish to complete the installation."
    !define MUI_FINISHPAGE_RUN "$INSTDIR\DysaBot Enterprise.exe"
    !define MUI_FINISHPAGE_RUN_TEXT "Launch DysaBot Enterprise now"
    !define MUI_FINISHPAGE_SHOWREADME ""
    !define MUI_FINISHPAGE_SHOWREADME_TEXT "View documentation"
    !define MUI_FINISHPAGE_SHOWREADME_FUNCTION ShowReadme
!macroend

Function ShowReadme
    ExecShell "open" "https://www.zgamersa.com/chatbot/docs"
FunctionEnd

# License agreement
!macro customLicensePage
    !insertmacro MUI_PAGE_LICENSE "assets\license.txt"
!macroend

# Components page
!macro customComponentsPage
    !insertmacro MUI_PAGE_COMPONENTS
    !define MUI_COMPONENTSPAGE_TEXT_TOP "Select the components you want to install:"
    !define MUI_COMPONENTSPAGE_TEXT_COMPLIST "Core Application"
    !define MUI_COMPONENTSPAGE_TEXT_INSTTYPE "Installation Type:"
!macroend