package com.quran.muthabbit;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(PdfScanPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
