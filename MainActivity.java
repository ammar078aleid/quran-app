package com.quran.muthabbit;

import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ActionMode;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private ActionMode qmMode;
  private final Handler qmH = new Handler(Looper.getMainLooper());
  private final Runnable qmHide = new Runnable() {
    @Override
    public void run() {
      if (qmMode != null && Build.VERSION.SDK_INT >= 23) {
        try {
          qmMode.hide(3000L);
        } catch (Exception e) {
        }
        qmH.postDelayed(this, 1500);
      }
    }
  };

  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(PdfScanPlugin.class);
    super.onCreate(savedInstanceState);
  }

  /* إخفاء شريط التحديد الأصلي (نسخ/مشاركة...) مع إبقاء التحديد وأدوات التطبيق */
  @Override
  public void onActionModeStarted(ActionMode mode) {
    super.onActionModeStarted(mode);
    if (Build.VERSION.SDK_INT >= 23 && mode != null && mode.getType() == ActionMode.TYPE_FLOATING) {
      qmMode = mode;
      qmH.removeCallbacks(qmHide);
      qmH.post(qmHide);
    }
  }

  @Override
  public void onActionModeFinished(ActionMode mode) {
    super.onActionModeFinished(mode);
    if (mode == qmMode) {
      qmMode = null;
      qmH.removeCallbacks(qmHide);
    }
  }
}
