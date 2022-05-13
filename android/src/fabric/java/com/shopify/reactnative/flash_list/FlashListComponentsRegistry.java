package com.shopify.reactnative.flash_list.react;

import com.facebook.jni.HybridData;
import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.fabric.ComponentFactory;
import com.facebook.soloader.SoLoader;

@DoNotStrip
public class FlashListComponentsRegistry {
  static {
    SoLoader.loadLibrary("fabricjni");
    SoLoader.loadLibrary("flashlist_modules");
  }

  @DoNotStrip private final HybridData mHybridData;

  @DoNotStrip
  private native HybridData initHybrid(ComponentFactory componentFactory);

  @DoNotStrip
  private FlashListComponentsRegistry(ComponentFactory componentFactory) {
    mHybridData = initHybrid(componentFactory);
  }

  @DoNotStrip
  public static FlashListComponentsRegistry register(ComponentFactory componentFactory) {
    return new FlashListComponentsRegistry(componentFactory);
  }
}
