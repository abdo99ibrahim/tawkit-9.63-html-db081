@echo off
:: This script automatically launches Tawkit in Google Chrome
:: --kiosk opens the browser instantly in Full Screen
:: --autoplay-policy=no-user-gesture-required forces the audio to work immediately without clicking

start chrome.exe --kiosk --autoplay-policy=no-user-gesture-required "file:///d:/tawkit-9.63-html-db081/index.html"
exit
