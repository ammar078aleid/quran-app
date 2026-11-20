# True = صلاحيات «كل الملفات» و«تجاهل تحسين البطارية» (فحص تلقائي لملفات PDF + منبّهات موثوقة).
# إن ظهر تحذير Play Protect وأردت تجربة نسخة بدونهما غيّرها إلى False (يبقى «رفع ملف/مجلد» يعمل).
FULL_ACCESS = True

p = 'android/app/src/main/AndroidManifest.xml'
s = open(p, encoding='utf8').read()
s = s.replace('<application', '<application android:requestLegacyExternalStorage="true"', 1)
import re
s = re.sub(r'android:launchMode="[^"]*"', 'android:launchMode="singleTask"', s)
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
perms = '''    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
'''
if FULL_ACCESS:
    perms += '''    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
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
        android:fillType="evenOdd"
        android:pathData="M12.00,1.40 L15.10,4.50 L19.50,4.50 L19.50,8.90 L22.60,12.00 L19.50,15.10 L19.50,19.50 L15.10,19.50 L12.00,22.60 L8.90,19.50 L4.50,19.50 L4.50,15.10 L1.40,12.00 L4.50,8.90 L4.50,4.50 L8.90,4.50 Z M8.6,12 a3.4,3.4 0 1,0 6.8,0 a3.4,3.4 0 1,0 -6.8,0 Z" />
</vector>
''')
print('patched OK')


# ===== شاشة البدء: لون العنّابي بدل الأبيض (آمن: لا يكسر البناء إن اختلف القالب) =====
import os
try:
    sp = 'android/app/src/main/res/values/styles.xml'
    if os.path.exists(sp):
        st = open(sp, encoding='utf8').read()
        m = re.search(r'(<style name="AppTheme\.NoActionBarLaunch"[^>]*>)', st)
        if m and 'Theme.SplashScreen' in m.group(1):
            st = re.sub(r'\s*<item name="windowSplashScreenBackground">[^<]*</item>', '', st)
            st = st.replace(m.group(1), m.group(1) + '\n        <item name="windowSplashScreenBackground">#FFFFFF</item>', 1)
            open(sp, 'w', encoding='utf8').write(st)
        elif m:
            st = st.replace(m.group(1), m.group(1) + '\n        <item name="android:windowBackground">#FFFFFF</item>', 1)
            open(sp, 'w', encoding='utf8').write(st)
except Exception as e:
    print('splash style skipped', e)
