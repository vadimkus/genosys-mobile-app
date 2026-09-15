Pod::Spec.new do |s|
  s.name           = 'GenosysWallet'
  s.version        = '1.0.0'
  s.summary        = 'Native Apple Wallet pass presenter for GENOSYS'
  s.description    = 'Presents signed GENOSYS passes with PKAddPassesViewController.'
  s.author         = 'GENOSYS Middle East FZ-LLC'
  s.homepage       = 'https://genosys.ae'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'PassKit'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
