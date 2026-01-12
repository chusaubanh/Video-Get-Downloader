; Custom installer script for Video-Get-Downloader
; This file contains custom NSIS installer commands

!macro customHeader
  !system "echo 'Building Video-Get-Downloader Installer...'"
!macroend

!macro preInit
  ; Add any pre-initialization commands here
!macroend

!macro customInit
  ; Custom initialization
!macroend

!macro customInstall
  ; Create additional shortcuts or perform post-install tasks
  ; WriteRegStr HKCU "Software\Video-Get-Downloader" "InstallPath" "$INSTDIR"
!macroend

!macro customUnInstall
  ; Clean up on uninstall
  ; DeleteRegKey HKCU "Software\Video-Get-Downloader"
!macroend
