package com.quran.muthabbit;

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.os.PowerManager;
import android.view.ActionMode;
import android.view.Menu;
import android.view.MenuItem;
import android.view.Window;
import android.webkit.WebView;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import java.util.Calendar;
import org.json.JSONArray;
import org.json.JSONObject;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.CancellationSignal;
import android.os.Environment;
import android.provider.OpenableColumns;
import android.provider.Settings;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@CapacitorPlugin(name = "PdfScan")
public class PdfScanPlugin extends Plugin {
  private final List<Uri> pending = new ArrayList<>();

  @Override
  public void load() {
    collect(getActivity().getIntent());
  }

  @Override
  protected void handleOnNewIntent(Intent intent) {
    super.handleOnNewIntent(intent);
    collect(intent);
  }

  @SuppressWarnings("deprecation")
  private void collect(Intent i) {
    if (i == null || i.getAction() == null) return;
    String a = i.getAction();
    synchronized (pending) {
      if (Intent.ACTION_SEND.equals(a)) {
        Uri u = i.getParcelableExtra(Intent.EXTRA_STREAM);
        if (u == null && i.getClipData() != null && i.getClipData().getItemCount() > 0) {
          u = i.getClipData().getItemAt(0).getUri();
        }
        if (u != null) pending.add(u);
      } else if (Intent.ACTION_SEND_MULTIPLE.equals(a)) {
        ArrayList<Uri> l = i.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
        if (l != null) pending.addAll(l);
      } else if (Intent.ACTION_VIEW.equals(a) && i.getData() != null) {
        pending.add(i.getData());
      }
    }
  }

  private boolean granted() {
    if (Build.VERSION.SDK_INT >= 30) return Environment.isExternalStorageManager();
    return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_EXTERNAL_STORAGE)
        == PackageManager.PERMISSION_GRANTED;
  }

  @PluginMethod
  public void hasAccess(PluginCall call) {
    JSObject o = new JSObject();
    o.put("granted", granted());
    call.resolve(o);
  }

  @PluginMethod
  public void requestAccess(PluginCall call) {
    try {
      if (Build.VERSION.SDK_INT >= 30) {
        try {
          Intent i = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
              Uri.parse("package:" + getContext().getPackageName()));
          getActivity().startActivity(i);
        } catch (Exception e) {
          getActivity().startActivity(new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION));
        }
      } else {
        ActivityCompat.requestPermissions(getActivity(),
            new String[] {Manifest.permission.READ_EXTERNAL_STORAGE}, 7001);
      }
    } catch (Exception e) {
    }
    call.resolve();
  }

  @PluginMethod
  public void scan(PluginCall call) {
    new Thread(() -> {
      JSArray arr = new JSArray();
      try {
        File root = Environment.getExternalStorageDirectory();
        walk(root, 0, arr, root);
      } catch (Throwable t) {
      }
      JSObject o = new JSObject();
      o.put("files", arr);
      call.resolve(o);
    }).start();
  }

  private void walk(File d, int depth, JSArray out, File root) {
    if (depth > 14 || out.length() >= 6000) return;
    File[] fs = d.listFiles();
    if (fs == null) return;
    for (File f : fs) {
      String n = f.getName();
      if (f.isDirectory()) {
        if (n.startsWith(".")) continue;
        if (d.equals(root) && n.equals("Android")) {
          File m = new File(f, "media");
          if (m.isDirectory()) walk(m, depth + 1, out, root);
          continue;
        }
        walk(f, depth + 1, out, root);
      } else if (n.toLowerCase(Locale.ROOT).endsWith(".pdf") && f.length() > 8) {
        JSObject o = new JSObject();
        o.put("path", f.getAbsolutePath());
        o.put("name", n);
        o.put("size", f.length());
        o.put("lm", f.lastModified());
        out.put(o);
      }
    }
  }

  private String nameOf(Uri u) {
    String n = null;
    if ("content".equals(u.getScheme())) {
      try (Cursor c = getContext().getContentResolver().query(u, null, null, null, null)) {
        if (c != null && c.moveToFirst()) {
          int i = c.getColumnIndex(OpenableColumns.DISPLAY_NAME);
          if (i >= 0) n = c.getString(i);
        }
      } catch (Exception e) {
      }
    }
    if (n == null || n.isEmpty()) {
      n = u.getLastPathSegment();
      if (n == null) n = "file";
      int k = n.lastIndexOf('/');
      if (k >= 0) n = n.substring(k + 1);
    }
    String mt = getContext().getContentResolver().getType(u);
    if (mt != null && mt.equals("application/pdf") && !n.toLowerCase(Locale.ROOT).endsWith(".pdf")) n += ".pdf";
    return n;
  }

  @PluginMethod
  public void getShared(PluginCall call) {
    new Thread(() -> {
      JSArray arr = new JSArray();
      List<Uri> l;
      synchronized (pending) {
        l = new ArrayList<>(pending);
        pending.clear();
      }
      File dir = new File(getContext().getCacheDir(), "shared");
      dir.mkdirs();
      File[] old = dir.listFiles();
      if (old != null) {
        for (File f : old) {
          if (System.currentTimeMillis() - f.lastModified() > 3600000L) f.delete();
        }
      }
      for (Uri u : l) {
        try {
          String name = nameOf(u);
          File f = new File(dir, System.currentTimeMillis() + "_" + name.replaceAll("[\\\\/:*?\"<>|]", "_"));
          try (InputStream in = getContext().getContentResolver().openInputStream(u);
               OutputStream out = new FileOutputStream(f)) {
            byte[] b = new byte[65536];
            int r;
            while ((r = in.read(b)) != -1) out.write(b, 0, r);
          }
          JSObject o = new JSObject();
          o.put("path", f.getAbsolutePath());
          o.put("name", name);
          o.put("size", f.length());
          arr.put(o);
        } catch (Exception e) {
        }
      }
      JSObject r = new JSObject();
      r.put("files", arr);
      call.resolve(r);
    }).start();
  }

  @PluginMethod
  public void googleSignIn(PluginCall call) {
    String cid = call.getString("clientId");
    if (cid == null || cid.isEmpty()) {
      call.reject("no clientId");
      return;
    }
    try {
      GetSignInWithGoogleOption opt = new GetSignInWithGoogleOption.Builder(cid).build();
      GetCredentialRequest req = new GetCredentialRequest.Builder().addCredentialOption(opt).build();
      CredentialManager cm = CredentialManager.create(getContext());
      cm.getCredentialAsync(getActivity(), req, new CancellationSignal(), ContextCompat.getMainExecutor(getContext()),
          new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
            @Override
            public void onResult(GetCredentialResponse res) {
              Credential c = res.getCredential();
              if (c instanceof CustomCredential
                  && GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(c.getType())) {
                try {
                  GoogleIdTokenCredential g = GoogleIdTokenCredential.createFrom(((CustomCredential) c).getData());
                  JSObject o = new JSObject();
                  o.put("idToken", g.getIdToken());
                  o.put("email", g.getId());
                  o.put("name", g.getDisplayName());
                  call.resolve(o);
                } catch (Exception e) {
                  call.reject("parse: " + e.getMessage());
                }
              } else {
                call.reject("unexpected credential type");
              }
            }

            @Override
            public void onError(GetCredentialException e) {
              if (e instanceof GetCredentialCancellationException) call.reject("cancelled", "cancelled");
              else call.reject(e.getType() + ": " + e.getMessage(), "error");
            }
          });
    } catch (Throwable t) {
      call.reject("native: " + t.getMessage());
    }
  }

  @PluginMethod
  public void openNotifSettings(PluginCall call) {
    try {
      Intent i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
      i.putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName());
      getActivity().startActivity(i);
    } catch (Exception e) {
    }
    call.resolve();
  }

  @PluginMethod
  public void minimize(PluginCall call) {
    try {
      getActivity().moveTaskToBack(true);
    } catch (Exception e) {
    }
    call.resolve();
  }

  /* ---------- ملء الشاشة وتدوير الشاشة ---------- */
  @PluginMethod
  public void immersive(PluginCall call) {
    final boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
    getActivity().runOnUiThread(() -> {
      try {
        Window w = getActivity().getWindow();
        WindowInsetsControllerCompat ctl = WindowCompat.getInsetsController(w, w.getDecorView());
        if (on) {
          ctl.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
          ctl.hide(WindowInsetsCompat.Type.systemBars());
        } else {
          ctl.show(WindowInsetsCompat.Type.systemBars());
        }
      } catch (Throwable t) {
      }
      call.resolve();
    });
  }

  @PluginMethod
  public void orient(PluginCall call) {
    final String mode = call.getString("mode", "auto");
    getActivity().runOnUiThread(() -> {
      try {
        int o = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED;
        if ("landscape".equals(mode)) o = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        else if ("portrait".equals(mode)) o = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT;
        getActivity().setRequestedOrientation(o);
      } catch (Throwable t) {
      }
      call.resolve();
    });
  }

  /* ---------- الإشعارات والمنبّهات الأصلية ---------- */
  static final String CH_ALARM = "qm_alarm";
  static final String CH_REMIND = "qm_remind";

  @PluginMethod
  public void notifState(PluginCall call) {
    Context c = getContext();
    boolean en = NotificationManagerCompat.from(c).areNotificationsEnabled();
    String st = "granted";
    if (!en) {
      boolean asked = c.getSharedPreferences("qm_prefs", Context.MODE_PRIVATE).getBoolean("notifAsked", false);
      st = (Build.VERSION.SDK_INT >= 33 && !asked) ? "prompt" : "denied";
    }
    JSObject o = new JSObject();
    o.put("state", st);
    call.resolve(o);
  }

  @PluginMethod
  public void requestNotif(PluginCall call) {
    try {
      getContext().getSharedPreferences("qm_prefs", Context.MODE_PRIVATE).edit().putBoolean("notifAsked", true).apply();
      if (Build.VERSION.SDK_INT >= 33) {
        ActivityCompat.requestPermissions(getActivity(), new String[] {"android.permission.POST_NOTIFICATIONS"}, 7002);
      }
    } catch (Exception e) {
    }
    call.resolve();
  }

  @PluginMethod
  public void batteryState(PluginCall call) {
    boolean ign = true;
    try {
      if (Build.VERSION.SDK_INT >= 23) {
        PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
        ign = pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
      }
    } catch (Exception e) {
    }
    JSObject o = new JSObject();
    o.put("ignoring", ign);
    call.resolve(o);
  }

  @PluginMethod
  public void batteryOpen(PluginCall call) {
    try {
      Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
          Uri.parse("package:" + getContext().getPackageName()));
      getActivity().startActivity(i);
    } catch (Exception e) {
      try {
        getActivity().startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS));
      } catch (Exception e2) {
      }
    }
    call.resolve();
  }

  @PluginMethod
  public void setSchedule(PluginCall call) {
    try {
      Context c = getContext();
      JSArray items = call.getArray("items");
      long now = System.currentTimeMillis();
      JSONArray old = loadItems(c);
      JSONArray keep = new JSONArray();
      for (int i = 0; i < old.length(); i++) {
        JSONObject o = old.optJSONObject(i);
        if (o == null) continue;
        if (o.optInt("snz") == 1 && o.optLong("at") > now) keep.put(o);
        else disarm(c, o.optInt("id"));
      }
      JSONArray all = new JSONArray();
      if (items != null) {
        for (int i = 0; i < items.length(); i++) all.put(items.getJSONObject(i));
      }
      for (int i = 0; i < keep.length(); i++) all.put(keep.getJSONObject(i));
      store(c, all);
      for (int i = 0; i < all.length(); i++) arm(c, all.getJSONObject(i));
      call.resolve();
    } catch (Exception e) {
      call.reject("schedule: " + e.getMessage());
    }
  }

  static SharedPreferences sp(Context c) {
    return c.getSharedPreferences("qm_alarms", Context.MODE_PRIVATE);
  }

  static JSONArray loadItems(Context c) {
    try {
      return new JSONArray(sp(c).getString("items", "[]"));
    } catch (Exception e) {
      return new JSONArray();
    }
  }

  static void store(Context c, JSONArray a) {
    sp(c).edit().putString("items", a.toString()).apply();
  }

  static PendingIntent opPi(Context c, int id) {
    Intent i = new Intent(c, AlarmReceiver.class).setAction("qm.fire." + id).putExtra("id", id);
    return PendingIntent.getBroadcast(c, id, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }

  static PendingIntent showPi(Context c) {
    Intent i = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    return PendingIntent.getActivity(c, 0, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }

  static long nextWeekly(int wd, int h, int m, long after) {
    Calendar c = Calendar.getInstance();
    c.setTimeInMillis(after);
    c.set(Calendar.HOUR_OF_DAY, h);
    c.set(Calendar.MINUTE, m);
    c.set(Calendar.SECOND, 0);
    c.set(Calendar.MILLISECOND, 0);
    int cur = c.get(Calendar.DAY_OF_WEEK);
    c.add(Calendar.DAY_OF_MONTH, (wd - cur + 7) % 7);
    if (c.getTimeInMillis() <= after) c.add(Calendar.DAY_OF_MONTH, 7);
    return c.getTimeInMillis();
  }

  static long nextTime(JSONObject it, long after) {
    if (it.optBoolean("once")) {
      long at = it.optLong("at", 0);
      return at > after ? at : 0;
    }
    return nextWeekly(it.optInt("wd", 1), it.optInt("h", 0), it.optInt("m", 0), after);
  }

  static void arm(Context c, JSONObject it) {
    try {
      long t = nextTime(it, System.currentTimeMillis());
      if (t <= 0) return;
      AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
      am.setAlarmClock(new AlarmManager.AlarmClockInfo(t, showPi(c)), opPi(c, it.getInt("id")));
    } catch (Exception e) {
    }
  }

  static void disarm(Context c, int id) {
    try {
      AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
      am.cancel(opPi(c, id));
    } catch (Exception e) {
    }
  }

  static void channels(Context c) {
    if (Build.VERSION.SDK_INT < 26) return;
    NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
    AudioAttributes al = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
    NotificationChannel a = new NotificationChannel(CH_ALARM, "المنبّهات", NotificationManager.IMPORTANCE_HIGH);
    a.setDescription("منبّهات الحفظ والمراجعة");
    a.setSound(Settings.System.DEFAULT_ALARM_ALERT_URI, al);
    a.enableVibration(true);
    a.setVibrationPattern(new long[] {0, 500, 250, 500, 250, 800});
    a.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
    nm.createNotificationChannel(a);
    AudioAttributes no = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
    NotificationChannel r = new NotificationChannel(CH_REMIND, "التذكيرات والمؤقتات", NotificationManager.IMPORTANCE_HIGH);
    r.setDescription("التذكيرات وانتهاء المؤقتات");
    r.setSound(Settings.System.DEFAULT_NOTIFICATION_URI, no);
    r.enableVibration(true);
    r.setVibrationPattern(new long[] {0, 350, 200, 350});
    r.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
    nm.createNotificationChannel(r);
  }

  static void show(Context c, JSONObject it) {
    try {
      channels(c);
      int id = it.optInt("id");
      String kind = it.optString("kind", "remind");
      String title = it.optString("title", "تنبيه");
      String body = it.optString("body", "");
      boolean alarm = "alarm".equals(kind);
      Intent open = new Intent(c, MainActivity.class)
          .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
      PendingIntent content = PendingIntent.getActivity(c, id, open,
          PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
      int icon = c.getResources().getIdentifier("ic_stat_qm", "drawable", c.getPackageName());
      if (icon == 0) icon = android.R.drawable.ic_dialog_info;
      NotificationCompat.Builder b = new NotificationCompat.Builder(c, alarm ? CH_ALARM : CH_REMIND)
          .setSmallIcon(icon)
          .setColor(0xFF1B5E20)
          .setContentTitle(title)
          .setContentText(body)
          .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
          .setPriority(NotificationCompat.PRIORITY_MAX)
          .setCategory(alarm ? NotificationCompat.CATEGORY_ALARM : NotificationCompat.CATEGORY_REMINDER)
          .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
          .setDefaults(NotificationCompat.DEFAULT_ALL)
          .setAutoCancel(true)
          .setShowWhen(true)
          .setWhen(System.currentTimeMillis())
          .setContentIntent(content);
      if (!"timer".equals(kind)) {
        Intent sn = new Intent(c, SnoozeReceiver.class).setAction("qm.snooze." + id).putExtra("id", id)
            .putExtra("kind", kind).putExtra("title", title).putExtra("body", body);
        Intent dm = new Intent(c, SnoozeReceiver.class).setAction("qm.dismiss." + id).putExtra("id", id);
        b.addAction(0, "تأجيل 10 دقائق", PendingIntent.getBroadcast(c, 100000 + id, sn,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        b.addAction(0, "إيقاف", PendingIntent.getBroadcast(c, 200000 + id, dm,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
      }
      NotificationManagerCompat.from(c).notify(id, b.build());
    } catch (Throwable t) {
    }
  }

  public static class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent in) {
      try {
        int id = in.getIntExtra("id", -1);
        JSONArray a = loadItems(c);
        for (int i = 0; i < a.length(); i++) {
          JSONObject it = a.optJSONObject(i);
          if (it == null || it.optInt("id") != id) continue;
          show(c, it);
          if (it.optBoolean("once")) {
            a.remove(i);
            store(c, a);
          } else {
            arm(c, it);
          }
          break;
        }
      } catch (Throwable t) {
      }
    }
  }

  public static class SnoozeReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent in) {
      try {
        int id = in.getIntExtra("id", -1);
        NotificationManagerCompat.from(c).cancel(id);
        String act = in.getAction();
        if (act != null && act.startsWith("qm.snooze.")) {
          JSONObject o = new JSONObject();
          int nid = 700000 + (int) ((System.currentTimeMillis() / 1000L) % 200000L);
          o.put("id", nid);
          o.put("kind", in.getStringExtra("kind"));
          o.put("title", in.getStringExtra("title"));
          o.put("body", in.getStringExtra("body"));
          o.put("once", true);
          o.put("snz", 1);
          o.put("at", System.currentTimeMillis() + 10L * 60L * 1000L);
          JSONArray a = loadItems(c);
          a.put(o);
          store(c, a);
          arm(c, o);
        }
      } catch (Throwable t) {
      }
    }
  }

  public static class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent in) {
      try {
        JSONArray a = loadItems(c);
        for (int i = 0; i < a.length(); i++) {
          JSONObject it = a.optJSONObject(i);
          if (it != null) arm(c, it);
        }
      } catch (Throwable t) {
      }
    }
  }
}
