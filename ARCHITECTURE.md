# 🏗️ Architecture Design

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authorization-Governed Vault System           │
└─────────────────────────────────────────────────────────────────┘

                      ┌──────────────────────┐
                      │   External Caller    │
                      │   (User/Contract)    │
                      └──────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
        ┌──────────────────┐   ┌──────────────────┐
        │  Deposit (ETH)   │   │   Withdrawal     │
        │  Call receive()  │   │   Request        │
        └──────────────────┘   └──────────────────┘
                    │                     │
                    ▼                     ▼
        ┌─────────────────────────────────────────┐
        │        SecureVault Contract             │
        │                                         │
        │  • Holds ETH funds                     │
        │  • Tracks totalDeposited               │
        │  • Tracks totalWithdrawn               │
        │  • Non-reentrant protection            │
        │  • State management                    │
        └─────────────────────────────────────────┘
                        │
                        │ verifyAuthorization()
                        ▼
        ┌─────────────────────────────────────────┐
        │   AuthorizationManager Contract         │
        │                                         │
        │  • Validates signatures (ECDSA)        │
        │  • Tracks used authorizations (nonce)  │
        │  • Prevents replay attacks             │
        │  • Enforces one-time use               │
        └─────────────────────────────────────────┘
                        │
                        │ returns bool (true/false)
                        ▼
        ┌─────────────────────────────────────────┐
        │   Fund Transfer (if authorized)         │
        │                                         │
        │  • Update accounting (Effects)         │
        │  • Transfer ETH (Interactions)         │
        │  • Emit events                         │
        └─────────────────────────────────────────┘
```

---

## Contract Interaction Flow

### Deposit Flow

```
User
  │
  ├─ Transfer ETH
  │
  ▼
SecureVault.receive()
  │
  ├─ totalDeposited += msg.value
  ├─ Emit Deposit(msg.sender, msg.value)
  │
  ▼
✅ Fund stored in vault
```

### Withdrawal Flow (Happy Path)

```
User submits withdrawal request
  │
  ├─ Authorization (struct with: vault, recipient, amount, nonce, chainId)
  ├─ Signature (signed by trusted signer)
  │
  ▼
SecureVault.withdraw(auth, signature)
  │
  ├─ [CHECKS]
  │  ├─ vault == address(this) ✓
  │  ├─ recipient != address(0) ✓
  │  ├─ amount > 0 ✓
  │
  ├─ authorizationManager.verifyAuthorization(auth, signature)
  │  │
  │  ├─ [VERIFICATION]
  │  │  ├─ Recover signer from signature
  │  │  ├─ Check signer == trusted signer
  │  │  ├─ Hash(auth) not in consumedAuthorizations
  │  │
  │  ├─ [EFFECTS]
  │  │  ├─ consumedAuthorizations[hash] = true
  │  │  └─ return true
  │
  ├─ [EFFECTS]
  │  ├─ totalWithdrawn += amount
  │
  ├─ [INTERACTIONS]
  │  ├─ recipient.call{value: amount}("")
  │
  ├─ Emit Withdrawal(recipient, amount, authHash)
  │
  ▼
✅ Withdrawal successful
```

### Withdrawal Flow (Attack Scenarios)

```
Scenario 1: Replay Attack
─────────────────────────
User calls withdraw with same auth/signature twice
  │
  ├─ First call: authHash not in consumed → ✅ Success
  ├─ authHash added to consumed mapping
  │
  ├─ Second call: authHash in consumed → ❌ REVERT
  │               "AuthorizationAlreadyConsumed"

Scenario 2: Cross-Chain Replay
──────────────────────────────
Attacker tries to replay auth on different chain
  │
  ├─ auth.chainId = 1 (Ethereum)
  ├─ Current network = 11155111 (Sepolia)
  │
  ├─ Signature verification
  │  └─ hash = keccak256(abi.encode(vault, recipient, amount, nonce, chainId))
  │  └─ hash includes chainId = 1
  │  └─ On Sepolia, hash is different
  │  └─ Signature doesn't match hash
  │  └─ ❌ REVERT "AuthorizationFailed"

Scenario 3: Wrong Vault Address
────────────────────────────────
Attacker tries to use auth from Vault A with Vault B
  │
  ├─ auth.vault = VaultA
  ├─ SecureVault(this) = VaultB
  │
  ├─ Check: auth.vault != address(this)
  └─ ❌ REVERT "AuthorizationFailed"

Scenario 4: Reentrancy Attack
──────────────────────────────
Attacker's receive() tries to call withdraw again
  │
  ├─ First withdraw() enters nonReentrant lock
  ├─ Transfer calls attacker's receive()
  ├─ receive() tries to call withdraw()
  │
  ├─ ReentrancyGuard blocks re-entry
  └─ ❌ REVERT "ReentrantCall"
```

---

## Data Flow Diagram

### Authorization Hash Construction

```
Input Parameters
    ├─ vault address
    ├─ recipient address
    ├─ withdrawal amount
    ├─ unique nonce
    └─ chainId (network identifier)
          │
          ▼
    abi.encode(vault, recipient, amount, nonce, chainId)
          │
          ▼
    keccak256(encoded_data)
          │
          ▼
    authHash (32 bytes)
          │
          ▼
    [Signed by trusted signer using Ethereum Signed Message prefix]
          │
          ▼
    signature (65 bytes: r, s, v)
```

### State Management

```
SecureVault State
├─ authorizationManager (immutable)
├─ totalDeposited (uint256)
└─ totalWithdrawn (uint256)

AuthorizationManager State
├─ trustedSigner (address)
├─ vault (address)
└─ consumedAuthorizations (mapping: bytes32 → bool)
```

---

## Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    Component Hierarchy                       │
└─────────────────────────────────────────────────────────────┘

OpenZeppelin Libraries
├─ ReentrancyGuard
│  └─ Used by: SecureVault
│
├─ ECDSA
│  └─ Used by: AuthorizationManager
│
└─ Owned/Access Control
   └─ Used by: AuthorizationManager (initialize once)

SecureVault
├─ Depends on: AuthorizationManager
├─ Imports: ReentrancyGuard, AuthorizationManager
└─ Functions:
   ├─ receive() - payable
   └─ withdraw(auth, signature)

AuthorizationManager
├─ Depends on: Nothing (except OpenZeppelin)
├─ Imports: ECDSA
└─ Functions:
   ├─ initialize(signer)
   ├─ setVault(vault)
   └─ verifyAuthorization(auth, signature)
```

---

## Deployment Sequence

```
Step 1: Deploy AuthorizationManager
        ↓
     Store address: authManagerAddr

Step 2: Deploy SecureVault(authManagerAddr)
        ↓
     Store address: vaultAddr

Step 3: AuthorizationManager.setVault(vaultAddr)
        ↓
     Link vault to manager

Step 4: System ready
        ├─ Users can deposit
        └─ Authorized withdrawals possible
```

---

## Invariants

### Critical Invariants (Must Always Hold)

```
1. Vault Balance Invariant
   ─────────────────────
   address(vault).balance >= totalDeposited - totalWithdrawn
   
   Why: Every withdrawal must be <= available balance
   Protection: Check before transfer

2. Authorization One-Time Use
   ──────────────────────────
   For each (vault, recipient, amount, nonce, chainId):
      consumedAuthorizations[hash(auth)] = true
      → Can only be used once
   
   Why: Prevent replay attacks
   Protection: Mapping tracks consumption

3. Signer Authority
   ────────────────
   Only withdrawals signed by trustedSigner are valid
   
   Why: Authorization must come from trusted source
   Protection: ECDSA signature verification

4. Cross-Chain Isolation
   ────────────────────
   Authorization bound to specific chainId
   
   Why: Prevent cross-chain replay
   Protection: chainId included in authorization hash

5. Vault Isolation
   ───────────────
   Authorization bound to specific vault instance
   
   Why: Prevent using auth across different vaults
   Protection: vault address included in authorization hash

6. Amount Exactness
   ────────────────
   Authorization specifies exact withdrawal amount
   
   Why: Prevent authorization from being reinterpreted
   Protection: amount included in authorization hash
```

---

## Security Boundary Diagram

```
┌──────────────────────────────────────────────────┐
│          Trusted Signer (Off-Chain)              │
│                                                  │
│  ✓ Generates authorizations                     │
│  ✓ Signs authorization hashes                   │
│  ✓ Controls who can withdraw                    │
└──────────────────────────────────────────────────┘
          │
          │ Off-chain signature generation
          ▼
┌──────────────────────────────────────────────────┐
│      Smart Contract Layer (On-Chain)             │
│                                                  │
│  AuthorizationManager                           │
│  ├─ Verifies signatures                         │
│  ├─ Tracks authorization use                    │
│  └─ Enforces one-time use                       │
│                                                  │
│  SecureVault                                    │
│  ├─ Holds funds                                 │
│  ├─ Requests authorization validation           │
│  ├─ Protects against reentrancy                 │
│  └─ Updates accounting before transfer          │
│                                                  │
│  ❌ CANNOT: Verify signatures itself            │
│  ❌ CANNOT: Make authorization decisions        │
│  ✓ CAN: Execute authorized withdrawals          │
└──────────────────────────────────────────────────┘
          │
          │ On-chain execution
          ▼
┌──────────────────────────────────────────────────┐
│        User/External Contracts                   │
│                                                  │
│  ✓ Can deposit ETH                              │
│  ✓ Submit valid authorization + signature       │
│  ✓ Receive withdrawn funds                      │
│                                                  │
│  ❌ CANNOT: Forge signatures                    │
│  ❌ CANNOT: Reuse authorizations                │
│  ❌ CANNOT: Withdraw without authorization      │
└──────────────────────────────────────────────────┘
```

---

## Error Flow Diagram

```
Withdraw Request
      │
      ▼
┌─ Validation Checks ─┐
│                     │
├─ vault correct?     ──→ ❌ No → AuthorizationFailed
│                     │
├─ recipient valid?   ──→ ❌ No → ZeroRecipient
│                     │
├─ amount > 0?        ──→ ❌ No → ZeroAmount
│                     │
└─ vault has funds?   ──→ ❌ No → InsufficientVaultFunds
      │
      ▼ ✅ All checks pass
┌─ Authorization Verification ─┐
│                              │
├─ Signature valid?            ──→ ❌ No → AuthorizationFailed
│                              │
├─ Auth not consumed?          ──→ ❌ No → AuthorizationFailed
│                              │
└─ Correct signer?             ──→ ❌ No → AuthorizationFailed
      │
      ▼ ✅ Authorization valid
┌─ State Update ─┐
│                │
├─ Mark consumed│
├─ Update total │
│                │
└─ Transfer ETH │
      │
      ▼
Withdrawal Success
```

---

## Design Principles

```
1. Separation of Concerns
   ────────────────────
   ├─ AuthorizationManager: Permission validation
   ├─ SecureVault: Fund custody
   └─ Result: Clear responsibilities, easier audit

2. Checks-Effects-Interactions (CEI)
   ──────────────────────────────────
   ├─ Check: Validate inputs and authorizations
   ├─ Effects: Update vault state (totalWithdrawn)
   ├─ Interactions: Transfer funds (call)
   └─ Result: Reentrancy safe

3. Defense in Depth
   ────────────────
   ├─ Nonce for replay prevention
   ├─ Vault binding for cross-vault attacks
   ├─ ChainId for cross-chain attacks
   ├─ Amount exactness for misinterpretation
   ├─ Recipient binding for address hijacking
   └─ Result: Multiple layers of protection

4. Immutability for Security
   ──────────────────────────
   ├─ immutable authorizationManager (SecureVault)
   ├─ One-time initialization
   └─ Result: Contract relationships cannot be changed

5. Event Transparency
   ──────────────────
   ├─ Deposit events
   ├─ Withdrawal events
   ├─ Authorization events (if needed)
   └─ Result: Full audit trail on-chain
```

---

## State Transition Diagram

```
System Lifecycle
────────────────

    [Undeployed]
         │
         ▼
    [Deployed]
    ├─ Contracts on chain
    ├─ AuthorizationManager uninitialized
    ├─ Vault initialized
         │
         ▼
    [Initialized]
    ├─ AuthorizationManager.initialize(signer)
    ├─ AuthorizationManager.setVault(vault)
    ├─ Ready for deposits and withdrawals
         │
    ┌────┴────┐
    │          │
    ▼          ▼
[Deposit]   [Withdrawal]
    │          │
    │  ┌───────┘
    │  │
    ▼  ▼
[Running]
    │
    └─ Can accept deposits
    └─ Can process authorizations
    └─ Can execute withdrawals
    └─ All invariants held
```

---

This architecture ensures:
- ✅ Clear separation of concerns
- ✅ Security against common attacks
- ✅ Deterministic behavior
- ✅ One-time authorization use
- ✅ Cross-chain and cross-vault safety
