package com.quran.muthabbit;

import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ActionMode;
import android.webkit.ValueCallback;
import androidx.activity.OnBackPressedCallback;
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
    /* زر الرجوع: نسأل صفحة الويب أولاً (تتراجع خطوة خطوة ثم تسأل عن الخروج في «اليوم»)،
       وإن لم تعالجه تُترك المعالجة الافتراضية */
    getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
      @Override
      public void handleOnBackPressed() {
        final OnBackPressedCallback self = this;
        try {
          if (getBridge() == null || getBridge().getWebView() == null) {
            qmFallback(self);
            return;
          }
          getBridge().getWebView().evaluateJavascript(
              "(function(){try{return window.qmBack?window.qmBack():false}catch(e){return false}})()",
              new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String v) {
                  if (!"true".equals(v)) qmFallback(self);
                }
              });
        } catch (Exception e) {
          qmFallback(self);
        }
      }
    });
  }

  private void qmFallback(OnBackPressedCallback cb) {
    cb.setEnabled(false);
    getOnBackPressedDispatcher().onBackPressed();
    cb.setEnabled(true);
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
