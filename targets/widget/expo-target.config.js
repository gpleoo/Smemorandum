/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  deploymentTarget: '16.0',
  entitlements: {
    // App Group: shared storage between app and widget
    'com.apple.security.application-groups': ['group.com.smemorandum.app'],
  },
};
