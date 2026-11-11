package com.quran.muthabbit;

import android.Manifest;
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
}
