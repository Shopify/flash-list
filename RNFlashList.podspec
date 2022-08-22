require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

fabric_enabled = ENV['RCT_NEW_ARCH_ENABLED']

Pod::Spec.new do |s|
  s.name             = 'RNFlashList'
  s.version          = package['version']
  s.summary          = package['description']
  s.homepage         = package['homepage']
  s.license          = package['license']
  s.author           = package['author']
  s.platforms        = { :ios => '11.0', :tvos => '12.0' }
  s.source           = { git: 'https://github.com/shopify/flash-list.git', tag: "v#{s.version}" }
  s.source_files     = 'ios/Sources/**/*'
  s.requires_arc     = true
  s.swift_version    = '5.0'

  if fabric_enabled
    folly_compiler_flags = '-DFOLLY_NO_CONFIG -DRN_FABRIC_ENABLED -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

    s.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/boost" "$(PODS_ROOT)/boost-for-react-native" "$(PODS_ROOT)/RCT-Folly"',
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'OTHER_SWIFT_FLAGS' => '-D RCT_NEW_ARCH_ENABLED',
    }
    s.platforms       = { :ios => '11.0', :tvos => '12.0' }
    s.compiler_flags  = folly_compiler_flags

    s.dependency "React"
    s.dependency "React-RCTFabric" # This is for fabric component
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
  else
    s.platforms = { :ios => "11.0", :tvos => "12.0" }

    s.dependency "React-Core"
  end

  # Tests spec
  s.test_spec 'Tests' do |test_spec|
    test_spec.source_files = 'ios/Tests/**/*'
    test_spec.framework = 'XCTest'
  end
end
