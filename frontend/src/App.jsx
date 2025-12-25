import React, { useState, useEffect } from 'react'
import './App.css'
import WalletConnect from './components/WalletConnect'
import VaultDashboard from './components/VaultDashboard'

function App() {
  const [connected, setConnected] = useState(false)
  const [account, setAccount] = useState(null)
  const [signer, setSigner] = useState(null)
  const [provider, setProvider] = useState(null)

  return (
    <div className="app-container">
      <div className="app-content">
        <header className="app-header">
          <div className="header-title">
            <h1>🔐 Authorization-Governed Vault</h1>
            <p className="subtitle">Secure Asset Withdrawal System</p>
          </div>
          {connected && (
            <div className="account-info">
              <span className="account-label">Connected:</span>
              <span className="account-address">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
            </div>
          )}
        </header>

        <main className="app-main">
          {!connected ? (
            <WalletConnect 
              onConnect={(acc, sig, prov) => {
                setAccount(acc)
                setSigner(sig)
                setProvider(prov)
                setConnected(true)
              }}
            />
          ) : (
            <VaultDashboard 
              account={account}
              signer={signer}
              provider={provider}
              onDisconnect={() => {
                setConnected(false)
                setAccount(null)
                setSigner(null)
                setProvider(null)
              }}
            />
          )}
        </main>

        <footer className="app-footer">
          <p>💡 Tip: Use Sepolia Testnet for testing</p>
        </footer>
      </div>
    </div>
  )
}

export default App
