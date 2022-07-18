require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

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

  # Dependencies
  s.dependency 'React-Core'

  # Tests spec
  s.test_spec 'Tests' do |test_spec|
    test_spec.source_files = 'ios/Tests/**/*'
    test_spec.framework = 'XCTest'
  end
end
