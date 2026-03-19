@echo off
REM Wrapper to launch start.ps1
powershell -ExecutionPolicy RemoteSigned -File "%~dp0start.ps1" %*
