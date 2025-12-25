import React, { useState } from 'react'
import './DepositTab.css'

export default function DepositTab({ account, signer, provider, onSuccess, onError }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDeposit = async (e) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      onError('Please enter a valid amount')
      return
    }

    try {
      setLoading(true)
      // Demo functionality - show how deposit would work
      const amountInWei = String(parseFloat(amount) * 1e18)
      
      onSuccess(`Deposit of ${amount} ETH initiated! (Demo mode)`)
      setAmount('')
    } catch (err) {
      onError(err.message || 'Deposit failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="deposit-tab">
      <div className="deposit-form-container">
        <h3>Deposit ETH to Vault</h3>
        <form onSubmit={handleDeposit} className="deposit-form">
          <div className="form-group">
            <label htmlFor="amount">Amount (ETH)</label>
            <div className="amount-input-wrapper">
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={loading}
              />
              <span className="currency">ETH</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !amount}
            className="submit-btn"
          >
            {loading ? 'Processing...' : '💰 Deposit'}
          </button>
        </form>
      </div>

      <div className="deposit-info">
        <h4>ℹ️ About Deposits</h4>
        <ul>
          <li>
            <strong>Direct Transfer:</strong> You can also send ETH directly to the vault contract address
          </li>
          <li>
            <strong>Immediate Credit:</strong> Deposits are credited immediately to your account
          </li>
          <li>
            <strong>Secure Storage:</strong> Funds are held in the ReentrancyGuard protected contract
          </li>
          <li>
            <strong>Withdrawal Authorization:</strong> Withdrawals require valid authorization signatures
          </li>
        </ul>
      </div>

      <div className="fee-structure">
        <h4>💡 Fee Information</h4>
        <div className="fees-table">
          <div className="fee-row">
            <span>Deposit Fee</span>
            <span>None (Gas only)</span>
          </div>
          <div className="fee-row">
            <span>Withdrawal Fee</span>
            <span>None (Gas only)</span>
          </div>
          <div className="fee-row">
            <span>Network</span>
            <span>Sepolia / Localhost</span>
          </div>
        </div>
      </div>
    </div>
  )
}
