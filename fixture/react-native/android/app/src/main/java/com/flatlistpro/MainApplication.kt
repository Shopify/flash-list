package com.flatlistpro

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.modules.i18nmanager.I18nUtil

class MainApplication : Application(), ReactApplication {

    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            packageList =
                PackageList(this).packages.apply {
                    // Packages that cannot be autolinked yet can be added manually here
                    add(AppPackage())
                },
        )
    }

    override fun onCreate() {
        super.onCreate()
        val sharedI18nUtilInstance: I18nUtil = I18nUtil.instance
        sharedI18nUtilInstance.allowRTL(applicationContext, true)
        loadReactNative(this)
    }
}
