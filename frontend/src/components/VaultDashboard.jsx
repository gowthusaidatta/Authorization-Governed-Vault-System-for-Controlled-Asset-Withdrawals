import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './VaultDashboard.css'
import DepositTab from './DepositTab'
import WithdrawTab from './WithdrawTab'
import StatsTab from './StatsTab'

const SEPOLIA_RPC = 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'

export default function VaultDashboard({ account, signer, provider, onDisconnect }) {
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [chainId, setChainId] = useState(null)

  useEffect(() => {
    const getChainId = async () => {
      try {
        const network = await provider.getNetwork()
        setChainId(Number(network.chainId))
      } catch (err) {
        console.error('Error getting chain ID:', err)
      }
    }
    getChainId()
  }, [provider])

  useEffect(() => {
    const refreshStats = async () => {
      try {
        setLoading(true)
        // Simulate stats fetch - in real app, call contract methods
        const mockStats = {
          vaultBalance: '0 ETH',
          totalDeposited: '0 ETH',
          totalWithdrawn: '0 ETH',
          userBalance: '0 ETH',
          nonce: 0,
          authManagerAddress: '0x...',
          vaultAddress: '0x...'
        }
        setStats(mockStats)
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    refreshStats()
    const interval = setInterval(refreshStats, 10000)
    return () => clearInterval(interval)
  }, [provider])

  const showMessage = (msg, type = 'info') => {
    setMessage({ text: msg, type })
    setTimeout(() => setMessage(null), 5000)
  }

  return (
    <div className="vault-dashboard">
      <div className="dashboard-header">
        <div className="chain-indicator">
          <span className={`chain-badge ${chainId === 11155111 ? 'sepolia' : 'localhost'}`}>
            {chainId === 11155111 ? '🧪 Sepolia' : '🏠 Localhost'}
          </span>
        </div>
        <button onClick={onDisconnect} className="disconnect-btn">
          Disconnect
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tabs-container">
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Vault Stats
          </button>
          <button
            className={`tab-btn ${activeTab === 'deposit' ? 'active' : ''}`}
            onClick={() => setActiveTab('deposit')}
          >
            💰 Deposit
          </button>
          <button
            className={`tab-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdraw')}
          >
            🔓 Withdraw
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'stats' && (
            <StatsTab stats={stats} loading={loading} />
          )}
          {activeTab === 'deposit' && (
            <DepositTab 
              account={account}
              signer={signer}
              provider={provider}
              onSuccess={(msg) => showMessage(msg, 'success')}
              onError={(msg) => showMessage(msg, 'error')}
            />
          )}
          {activeTab === 'withdraw' && (
            <WithdrawTab 
              account={account}
              signer={signer}
              provider={provider}
              onSuccess={(msg) => showMessage(msg, 'success')}
              onError={(msg) => showMessage(msg, 'error')}
            />
          )}
        </div>
      </div>

      <div className="demo-info">
        <h4>📝 Demo Information</h4>
        <p>This is a demonstration interface for the Authorization-Governed Vault System. To use actual contract functionality:</p>
        <ol>
          <li>Deploy contracts to Sepolia testnet</li>
          <li>Update contract addresses in the configuration</li>
          <li>Connect with a funded wallet</li>
        </ol>
      </div>
    </div>
  )
}
