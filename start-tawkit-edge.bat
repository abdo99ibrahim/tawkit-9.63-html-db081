@echo off
:: This script automatically launches Tawkit in Microsoft Edge
:: --kiosk opens the browser instantly in Full Screen
:: --autoplay-policy=no-user-gesture-required forces the audio to work immediately without clicking

start msedge.exe --kiosk --autoplay-policy=no-user-gesture-required "%~dp0index.html"
exit
