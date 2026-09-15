import ExpoModulesCore
import PassKit

private final class WalletPassDelegate: NSObject, PKAddPassesViewControllerDelegate {
  private let pass: PKPass
  private let completion: (Bool) -> Void

  init(pass: PKPass, completion: @escaping (Bool) -> Void) {
    self.pass = pass
    self.completion = completion
  }

  func addPassesViewControllerDidFinish(_ controller: PKAddPassesViewController) {
    let wasAdded = PKPassLibrary().containsPass(pass)
    controller.dismiss(animated: true) {
      self.completion(wasAdded)
    }
  }
}

public class GenosysWalletModule: Module {
  private var activeDelegates: [UUID: WalletPassDelegate] = [:]

  public func definition() -> ModuleDefinition {
    Name("GenosysWallet")

    AsyncFunction("addPassAsync") { (passBase64: String, promise: Promise) in
      guard let passData = Data(
        base64Encoded: passBase64,
        options: [.ignoreUnknownCharacters]
      ) else {
        promise.reject("ERR_INVALID_PASS_DATA", "Apple Wallet pass data is not valid base64.")
        return
      }

      let pass: PKPass
      do {
        pass = try PKPass(data: passData)
      } catch {
        promise.reject("ERR_INVALID_PASS", "Apple Wallet rejected the signed pass.")
        return
      }

      if PKPassLibrary().containsPass(pass) {
        promise.resolve(["status": "already_added"])
        return
      }

      guard PKAddPassesViewController.canAddPasses() else {
        promise.resolve(["status": "unavailable"])
        return
      }
      guard let presenter = self.appContext?.utilities?.currentViewController() else {
        promise.reject("ERR_NO_VIEW_CONTROLLER", "No active screen can present Apple Wallet.")
        return
      }
      guard let walletController = PKAddPassesViewController(pass: pass) else {
        promise.reject("ERR_WALLET_CONTROLLER", "Apple Wallet could not open this pass.")
        return
      }

      let delegateId = UUID()
      let delegate = WalletPassDelegate(pass: pass) { [weak self] wasAdded in
        self?.activeDelegates.removeValue(forKey: delegateId)
        promise.resolve(["status": wasAdded ? "added" : "cancelled"])
      }
      activeDelegates[delegateId] = delegate
      walletController.delegate = delegate
      presenter.present(walletController, animated: true)
    }.runOnQueue(.main)
  }
}
