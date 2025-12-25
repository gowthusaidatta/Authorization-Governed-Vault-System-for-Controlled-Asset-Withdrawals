import React, { useState } from 'react'
import { ethers } from 'ethers'
import './WalletConnect.css'

export default function WalletConnect({ onConnect }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const connectWallet = async () => {
    try {
      setLoading(true)
      setError(null)

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const account = accounts[0]

      onConnect(account, signer, provider)
    } catch (err) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wallet-connect-container">
      <div className="wallet-card">
        <div className="wallet-icon">🦊</div>
        <h2>Connect Your Wallet</h2>
        <p>Connect MetaMask to interact with the vault</p>

        {error && <div className="error-message">{error}</div>}

        <button 
          onClick={connectWallet}
          disabled={loading || typeof window.ethereum === 'undefined'}
          className="connect-button"
        >
          {loading ? 'Connecting...' : 'Connect MetaMask'}
        </button>

        {typeof window.ethereum === 'undefined' && (
          <div className="install-message">
            <p>MetaMask not found. Please <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">install MetaMask</a></p>
          </div>
        )}

        <div className="network-info">
          <h3>Supported Networks:</h3>
          <ul>
            <li>🧪 Sepolia Testnet</li>
            <li>🏠 Localhost (port 8545)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
