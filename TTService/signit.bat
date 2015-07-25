cd platforms\android
ant release
cd bin
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ..\..\..\quilkin.keystore timetrial.apk quilkin
zipalign -v 4 timetrial.apk timetrial091.apk
pause