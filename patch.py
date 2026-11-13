p = 'android/app/src/main/AndroidManifest.xml'
s = open(p, encoding='utf8').read()
s = s.replace('<application', '<application android:requestLegacyExternalStorage="true"', 1)
filters = '''
            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <action android:name="android.intent.action.SEND_MULTIPLE" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="application/pdf" />
                <data android:mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="content" />
                <data android:scheme="file" />
                <data android:mimeType="application/pdf" />
            </intent-filter>
        '''
assert '</activity>' in s
receivers = '''
        <receiver android:name="com.quran.muthabbit.PdfScanPlugin$AlarmReceiver" android:exported="false" />
        <receiver android:name="com.quran.muthabbit.PdfScanPlugin$SnoozeReceiver" android:exported="false" />
        <receiver android:name="com.quran.muthabbit.PdfScanPlugin$BootReceiver" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
                <action android:name="android.intent.action.TIME_SET" />
                <action android:name="android.intent.action.TIMEZONE_CHANGED" />
            </intent-filter>
        </receiver>
    '''
assert '</application>' in s
s = s.replace('</application>', receivers + '</application>', 1)
s = s.replace('</activity>', filters + '</activity>', 1)
perms = '''    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
'''
s = s.replace('</manifest>', perms + '</manifest>')
open(p, 'w', encoding='utf8').write(s)

g = 'android/app/build.gradle'
t = open(g, encoding='utf8').read()
sign = '''android {
    signingConfigs {
        debug {
            storeFile file("/tmp/apk/ks.jks")
            storePassword "qmpass123"
            keyAlias "qm"
            keyPassword "qmpass123"
        }
    }'''
assert 'android {' in t
t = t.replace('android {', sign, 1)
deps = '''dependencies {
    implementation "androidx.credentials:credentials:1.3.0"
    implementation "androidx.credentials:credentials-play-services-auth:1.3.0"
    implementation "com.google.android.libraries.identity.googleid:googleid:1.1.1"'''
assert 'dependencies {' in t
t = t.replace('dependencies {', deps, 1)
open(g, 'w', encoding='utf8').write(t)
import os
os.makedirs('android/app/src/main/res/drawable', exist_ok=True)
open('android/app/src/main/res/drawable/ic_stat_qm.xml', 'w', encoding='utf8').write('''<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M12,22c1.1,0 2,-0.9 2,-2h-4c0,1.1 0.89,2 2,2zM18,16v-5c0,-3.07 -1.64,-5.64 -4.5,-6.32V4c0,-0.83 -0.67,-1.5 -1.5,-1.5s-1.5,0.67 -1.5,1.5v0.68C7.63,5.36 6,7.92 6,11v5l-2,2v1h16v-1l-2,-2z" />
</vector>
''')
print('patched OK')
