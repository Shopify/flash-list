require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

fabric_enabled = ENV['RCT_NEW_ARCH_ENABLED'] == '1'

Pod::Spec.new do |s|
  s.name             = 'RNFlashList'
  s.version          = package['version']
  s.summary          = package['description']
  s.homepage         = package['homepage']
  s.license          = package['license']
  s.author           = package['author']
  s.source           = { git: 'https://github.com/shopify/flash-list.git', tag: "v#{s.version}" }
  s.source_files     = 'ios/Sources/**/*'
  s.requires_arc     = true
  s.swift_version    = '5.0'
  s.pod_target_xcconfig = { 'OTHER_SWIFT_FLAGS' => '-D RCT_NEW_ARCH_ENABLED', }

  if defined?(install_modules_dependencies()) != nil
    install_modules_dependencies(s)
    s.ios.deployment_target = "12.4"
    s.platforms        = { :ios => '12.4', :tvos => '12.0' }
  else
    s.dependency "React-Core"
    s.platforms        = { :ios => '11.0', :tvos => '12.0' }
  end

  # Tests spec
  s.test_spec 'Tests' do |test_spec|
    test_spec.source_files = 'ios/Tests/**/*'
    test_spec.framework = 'XCTest'
  end
end
