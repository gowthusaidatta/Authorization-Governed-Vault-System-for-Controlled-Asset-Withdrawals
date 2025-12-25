import React, { useState } from 'react'
import './WithdrawTab.css'

export default function WithdrawTab({ account, signer, provider, onSuccess, onError }) {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [loading, setLoading] = useState(false)

  const handleWithdraw = async (e) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0) {
      onError('Please enter a valid amount')
      return
    }

    if (!recipient || !recipient.startsWith('0x')) {
      onError('Please enter a valid recipient address')
      return
    }

    try {
      setLoading(true)
      // Demo functionality
      onSuccess(`Withdrawal of ${amount} ETH to ${recipient?.slice(0, 10)}... initiated! (Demo mode)`)
      setAmount('')
      setRecipient('')
    } catch (err) {
      onError(err.message || 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  const prefillRecipient = () => {
    setRecipient(account)
  }

  return (
    <div className="withdraw-tab">
      <div className="withdraw-form-container">
        <h3>Withdraw from Vault</h3>
        <form onSubmit={handleWithdraw} className="withdraw-form">
          <div className="form-group">
            <label htmlFor="recipient">Recipient Address</label>
            <div className="recipient-input-wrapper">
              <input
                id="recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                disabled={loading}
              />
              <button
                type="button"
                onClick={prefillRecipient}
                className="autofill-btn"
                disabled={loading}
              >
                Use My Address
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="withdraw-amount">Amount (ETH)</label>
            <div className="amount-input-wrapper">
              <input
                id="withdraw-amount"
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
            disabled={loading || !amount || !recipient}
            className="submit-btn"
          >
            {loading ? 'Processing...' : '🔓 Withdraw'}
          </button>
        </form>
      </div>

      <div class="authorization-flow">
        <h4>🔐 Authorization Flow</h4>
        <div className="flow-steps">
          <div className="flow-step">
            <div className="flow-step-num">1</div>
            <div className="flow-step-content">
              <strong>Create Authorization</strong>
              <p>Authorization message is created with vault, recipient, amount, nonce, and chainId</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="flow-step-num">2</div>
            <div className="flow-step-content">
              <strong>Off-Chain Signing</strong>
              <p>Designated signer signs the authorization hash with their private key</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="flow-step-num">3</div>
            <div className="flow-step-content">
              <strong>On-Chain Verification</strong>
              <p>Contract verifies signature and checks authorization hasn't been used before</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="flow-step-num">4</div>
            <div className="flow-step-content">
              <strong>Transfer Funds</strong>
              <p>Once verified, funds are transferred to recipient with reentrancy protection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="security-features">
        <h4>🛡️ Security Features</h4>
        <ul>
          <li><strong>Replay Protection:</strong> Each authorization has a unique nonce</li>
          <li><strong>Cross-Chain Safety:</strong> ChainId binding prevents cross-chain attacks</li>
          <li><strong>Reentrancy Guard:</strong> Prevents reentrancy attacks during withdrawal</li>
          <li><strong>ECDSA Recovery:</strong> Cryptographic signature verification</li>
          <li><strong>One-Time Use:</strong> Authorization can only be used once</li>
          <li><strong>Immutable Config:</strong> Contract addresses cannot be changed</li>
        </ul>
      </div>
    </div>
  )
}
