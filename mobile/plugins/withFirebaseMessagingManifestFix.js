/**
 * Expo config plugin: resolve the AndroidManifest merge conflict between
 * `expo-notifications` and `@react-native-firebase/messaging`.
 *
 * Both declare a <meta-data android:name=
 * "com.google.firebase.messaging.default_notification_color"> — expo-notifications
 * points it at its own color resource, while the firebase-messaging AAR points
 * it at @color/white. The manifest merger fails unless we explicitly say which
 * one wins via tools:replace.
 *
 * This runs during `expo prebuild`, so the fix is reapplied every time the
 * native android/ project is regenerated (unlike a manual edit there, which is
 * wiped by `--clean`).
 */
const { withAndroidManifest } = require("@expo/config-plugins");

const META_NAME = "com.google.firebase.messaging.default_notification_color";
const TOOLS_NS = "http://schemas.android.com/tools";

module.exports = function withFirebaseMessagingManifestFix(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    // Ensure the `tools` namespace is declared on the <manifest> root.
    manifest.$ = manifest.$ || {};
    if (!manifest.$["xmlns:tools"]) {
      manifest.$["xmlns:tools"] = TOOLS_NS;
    }

    const application = manifest.application && manifest.application[0];
    if (!application) {
      return cfg;
    }

    application["meta-data"] = application["meta-data"] || [];
    const entry = application["meta-data"].find(
      (m) => m.$ && m.$["android:name"] === META_NAME,
    );

    // Tell the merger to prefer our resource over the firebase-messaging AAR's.
    if (entry) {
      entry.$["tools:replace"] = "android:resource";
    }

    return cfg;
  });
};
