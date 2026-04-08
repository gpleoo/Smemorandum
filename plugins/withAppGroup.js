/**
 * Expo Config Plugin — adds the App Group entitlement to the main iOS app.
 * This allows UserDefaults(suiteName:) data to be shared with the widget extension.
 *
 * Usage: add "./plugins/withAppGroup" to the plugins array in app.json
 */
const { withEntitlementsPlist } = require('@expo/config-plugins');

const APP_GROUP_ID = 'group.com.smemorandum.app';

module.exports = function withAppGroup(config) {
  return withEntitlementsPlist(config, (mod) => {
    const existing =
      mod.modResults['com.apple.security.application-groups'] || [];
    if (!existing.includes(APP_GROUP_ID)) {
      existing.push(APP_GROUP_ID);
    }
    mod.modResults['com.apple.security.application-groups'] = existing;
    return mod;
  });
};
