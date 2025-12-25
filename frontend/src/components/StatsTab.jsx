import React from 'react'
import './StatsTab.css'

export default function StatsTab({ stats, loading }) {
  if (loading) {
    return <div className="loading">Loading vault statistics...</div>
  }

  return (
    <div className="stats-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💾</div>
          <div className="stat-content">
            <div className="stat-label">Vault Balance</div>
            <div className="stat-value">{stats?.vaultBalance || '0 ETH'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Total Deposited</div>
            <div className="stat-value">{stats?.totalDeposited || '0 ETH'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <div className="stat-label">Total Withdrawn</div>
            <div className="stat-value">{stats?.totalWithdrawn || '0 ETH'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-label">Your Balance</div>
            <div className="stat-value">{stats?.userBalance || '0 ETH'}</div>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h3>System Details</h3>
        <div className="details-list">
          <div className="detail-item">
            <span className="detail-label">Nonce:</span>
            <span className="detail-value mono">{stats?.nonce || '0'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Authorization Manager:</span>
            <span className="detail-value mono">{stats?.authManagerAddress?.slice(0, 10)}...</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Vault Address:</span>
            <span className="detail-value mono">{stats?.vaultAddress?.slice(0, 10)}...</span>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <h3>How It Works</h3>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Deposit</h4>
              <p>Send ETH to the vault contract to deposit funds</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Authorize</h4>
              <p>Off-chain authorization signed by the designated signer</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Withdraw</h4>
              <p>Submit authorization to withdraw funds securely</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
