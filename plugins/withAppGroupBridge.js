/**
 * Expo Config Plugin — injects a lightweight React Native bridge module
 * (AppGroupBridge) into the iOS project. This lets JS code write JSON data
 * to the App Group UserDefaults so the WidgetKit widget can read it.
 *
 * Two files are written into ios/<ProjectName>/:
 *   AppGroupBridge.swift       — implementation
 *   AppGroupBridge.m           — RCT_EXTERN_MODULE declaration
 */
const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs   = require('fs');

const APP_GROUP_ID = 'group.com.smemorandum.app';

const SWIFT_CONTENT = `
import Foundation

@objc(AppGroupBridge)
class AppGroupBridge: NSObject {

  private let suiteName = "${APP_GROUP_ID}"

  @objc
  func setString(_ key: String, value: String) {
    UserDefaults(suiteName: suiteName)?.set(value, forKey: key)
    UserDefaults(suiteName: suiteName)?.synchronize()
  }

  @objc
  func getString(_ key: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let result = UserDefaults(suiteName: suiteName)?.string(forKey: key)
    resolve(result)
  }

  @objc
  static func requiresMainQueueSetup() -> Bool { false }
}
`;

const OBJC_CONTENT = `
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AppGroupBridge, NSObject)
RCT_EXTERN_METHOD(setString:(NSString *)key value:(NSString *)value)
RCT_EXTERN_METHOD(getString:(NSString *)key resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
@end
`;

module.exports = function withAppGroupBridge(config) {
  return withDangerousMod(config, [
    'ios',
    (mod) => {
      const projectRoot = mod.modRequest.platformProjectRoot;
      const projectName = mod.modRequest.projectName;
      const targetDir   = path.join(projectRoot, projectName);

      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'AppGroupBridge.swift'), SWIFT_CONTENT.trim());
      fs.writeFileSync(path.join(targetDir, 'AppGroupBridge.m'),     OBJC_CONTENT.trim());

      return mod;
    },
  ]);
};
