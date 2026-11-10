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
s = s.replace('</activity>', filters + '</activity>', 1)
perms = '''    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
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
open(g, 'w', encoding='utf8').write(t)
print('patched OK')
