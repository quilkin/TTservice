xcopy "C:\Users\Chris\Documents\Visual Studio 2012\Projects\TTService\TTService\js\*.*" "C:\macshare\projects\www\js" /d /y
xcopy "C:\Users\Chris\Documents\Visual Studio 2012\Projects\TTService\TTService\css\*.*" "C:\macshare\projects\www\css" /d /y
xcopy "C:\Users\Chris\Documents\Visual Studio 2012\Projects\TTService\TTService\index.html" "C:\macshare\projects\www" /d /y
xcopy "C:\Users\Chris\Documents\Visual Studio 2012\Projects\TTService\TTService\res\*.*" "C:\macshare\projects\www\res" /d /y /s

:: xcopy "C:\Users\Chris\Documents\Visual Studio 2012\Projects\TTService\TTService\js\*.*" "\\MACMINI-AF1F54\www\js" /d /y
:: xcopy "C:\Users\Chris\Documents\Visual Studio 2012\Projects\TTService\TTService\css\*.*" "\\MACMINI-AF1F54\www\css" /d /y
:: xcopy "C:\Users\Chris\Documents\Visual Studio 2012\Projects\TTService\TTService\index.html" "\\MACMINI-AF1F54\www" /d /y
:: xcopy "C:\Users\Chris\Documents\Visual Studio 2012\Projects\TTService\TTService\res\*.*" "\\MACMINI-AF1F54\www\res" /d /y /s


:: xcopy "C:\Users\Chris\Documents\Visual Studio 2012\Projects\TTService\TTService\js\*.*" "C:\Users\Chris\Documents\phonegap-android\projects\assets\www\js" /d /y
:: xcopy "C:\Users\Chris\Documents\Visual Studio 2012\Projects\TTService\TTService\css\*.*" "C:\Users\Chris\Documents\phonegap-android\projects\assets\www\css" /d /y
:: xcopy "C:\Users\Chris\Documents\Visual Studio 2012\Projects\TTService\TTService\index.html" "C:\Users\Chris\Documents\phonegap-android\projects\assets\www" /d /y
:: xcopy "C:\Users\Chris\Documents\Visual Studio 2012\Projects\TTService\TTService\res\*.*" "C:\Users\Chris\Documents\phonegap-android\projects\assets\www\res" /d /y /s

xcopy "C:\Users\chris\Documents\GitHub\TTService\TTService\js\*.*" "C:\Users\Chris\Documents\cordova\timetrial\www\js" /d /y
xcopy "C:\Users\Chris\Documents\GitHub\TTService\TTService\css\*.*" "C:\Users\Chris\Documents\cordova\timetrial\www\css" /d /y /s
xcopy "C:\Users\Chris\Documents\GitHub\TTService\TTService\index.html" "C:\Users\Chris\Documents\cordova\timetrial\www" /d /y
xcopy "C:\Users\Chris\Documents\GitHub\TTService\TTService\res\*.*" "C:\Users\Chris\Documents\cordova\timetrial\www\res" /d /y /s
xcopy "C:\Users\Chris\Documents\GitHub\TTService\TTService\images\*.*" "C:\Users\Chris\Documents\cordova\timetrial\www\images" /d /y
xcopy "C:\Users\Chris\Documents\GitHub\TTService\TTService\config.xml" "C:\Users\Chris\Documents\cordova\timetrial" /y
xcopy "C:\Users\Chris\Documents\GitHub\TTService\TTService\signit.bat" "C:\Users\Chris\Documents\cordova\timetrial" /y
pause
cd C:\Users\chris\Documents\cordova\timetrial
cordova run android

