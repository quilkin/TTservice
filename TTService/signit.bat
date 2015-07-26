cd platforms\android
ant release
cd bin
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ..\..\..\quilkin.keystore -storepass icespy1643 MainActivity-release-unsigned.apk quilkin
C:\android\zipalign -v 4 MainActivity-release-unsigned.apk timetrial091.apk
pause

