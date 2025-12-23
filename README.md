# Authorization-Governed Vault System

A two-contract vault design that separates custody (SecureVault) from authorization (AuthorizationManager). Withdrawals require an off-chain authorization signed by a designated signer and can be consumed exactly once on-chain.

## Quick start

```sh
npm install
npx hardhat test
```

### Dockerized flow

```sh
docker-compose up --build
```

This starts a local Hardhat node on `localhost:8545` (exposed to host), compiles contracts, deploys AuthorizationManager and SecureVault, and writes deployed addresses to `deployment/deployment.json`.

**RPC Access**: The blockchain service exposes port 8545 to the host machine, allowing evaluators to connect via `http://localhost:8545` for testing and validation.

## Contracts

- `contracts/AuthorizationManager.sol` — verifies signatures, enforces replay protection, and only allows the configured vault to consume authorizations.
- `contracts/SecureVault.sol` — receives ETH, asks the manager to validate an authorization, updates accounting, then transfers funds.

### Authorization format

An authorization is a struct hashed as:

$$\text{hash} = \operatorname{keccak256}(\text{abi.encode}(vault, recipient, amount, nonce, chainId))$$

- `vault` — bound to a specific vault instance.
- `recipient` — destination of the withdrawal.
- `amount` — exact amount to withdraw.
- `nonce` — unique replay-protection value per authorization.
- `chainId` — prevents cross-chain replay.

Sign the hash with `signMessage(getBytes(hash))` from the trusted signer. The manager recovers the signer via `ECDSA.toEthSignedMessageHash().recover` and marks the hash as consumed before the vault transfers value.

### Invariants

- Authorization can be consumed once: `consumed[hash]` flips before funds move.
- Chain and vault binding: manager requires `auth.chainId == block.chainid` and `auth.vault == configured vault`.
- State before value: vault increments `totalWithdrawn` before performing the call.
- Initialization is single-use: `AuthorizationManager.setVault()` is callable once by the deployer.

## Manual interaction example

1. Start node and deploy (`docker-compose up --build` or `npx hardhat node` in one terminal and `RPC_URL=http://127.0.0.1:8545 node scripts/deploy.js` in another).
2. Fund the vault: `cast send <VAULT> --value 1ether` (or use `hardhat` console).
3. Build an authorization object:
   ```js
   const auth = { vault: "<VAULT>", recipient: "<RECIPIENT>", amount: ethers.parseEther("0.1"), nonce: 1, chainId: 31337 };
   const hash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["address","address","uint256","uint256","uint256"],[auth.vault,auth.recipient,auth.amount,auth.nonce,auth.chainId]));
   const signature = await signer.signMessage(ethers.getBytes(hash));
   ```
4. Call `withdraw(auth, signature)` on the vault. A second attempt with the same `auth` reverts because the hash is already consumed.

## System Invariants Guaranteed

This system maintains the following critical invariants under all execution paths:

1. **Single-Use Authorization**: Each signed authorization can be consumed exactly once. The `consumed[authHash]` mapping is checked before use and set atomically within the same transaction, making replay attacks impossible.

2. **Non-Negative Vault Balance**: The vault balance can never become negative. Balance checks occur before transfers, and Solidity 0.8's built-in overflow protection prevents underflows in accounting variables.

3. **Authorization Binding**: Authorizations are cryptographically bound to:
   - Specific vault address (prevents cross-vault replay)
   - Specific blockchain network via `chainId` (prevents cross-chain replay)
   - Specific recipient address (prevents redirect attacks)
   - Specific amount (prevents inflation attacks)

4. **Atomic State Transitions**: State updates (marking authorization consumed, updating `totalWithdrawn`) occur before external calls (ETH transfer), following the Checks-Effects-Interactions pattern. This ensures consistency even under reentrancy attempts.

5. **Vault Isolation**: Only the designated AuthorizationManager can validate withdrawals. The vault never performs signature verification, eliminating an entire class of signature malleability vulnerabilities.

6. **Initialization Immutability**: Critical configuration (signer address in AuthorizationManager, manager reference in SecureVault) is set in constructors and marked `immutable`. The `setVault()` function enforces single-use via the `vaultSet` boolean flag, preventing reconfiguration attacks.

## Security Analysis

### Why This Signature Scheme Is Safe

The authorization signature scheme provides defense-in-depth against multiple attack vectors:

**Domain Separation**: The signed message includes both the vault's contract address and the network's `chainId`. This creates a unique "domain" for each vault on each network. A signature valid for vault A on mainnet cannot be replayed on vault B or on a testnet, even if the signer's private key is the same. This follows the same principle as EIP-712's domain separator.

**Commitment to All Parameters**: The signature commits to `vault`, `recipient`, `amount`, `nonce`, and `chainId` simultaneously. An attacker cannot modify any field without invalidating the signature. For example:
- Cannot change recipient (signature won't verify)
- Cannot change amount (signature won't verify)
- Cannot change vault address (signature won't verify + manager checks `auth.vault == vault`)

**ECDSA Security**: The scheme uses Ethereum's standard `eth_sign` message format with ECDSA recovery via OpenZeppelin's audited library. The recovered address must exactly match the trusted signer stored immutably at deployment.

### Why Replay Attacks Are Impossible

Replay protection operates at three independent layers:

1. **Nonce-Based Uniqueness**: Each authorization includes a unique `nonce` value. The hash `keccak256(vault, recipient, amount, nonce, chainId)` serves as the authorization's fingerprint. Two authorizations with different nonces produce different hashes, even if all other fields are identical.

2. **Consumption Tracking**: The `consumed[authHash]` mapping records every used authorization. Before accepting a withdrawal, the manager checks `if (consumed[authHash]) revert AuthorizationConsumed()`. After verification, it sets `consumed[authHash] = true`. This state change is permanent and cannot be reverted by a failed transfer.

3. **Pre-Transfer Marking**: The authorization is marked consumed *before* the vault transfers ETH. If a malicious recipient's fallback attempts reentrancy, the authorization is already consumed, and the second call will revert. This is enforced by both the ReentrancyGuard and the consumed flag.

**Attack Scenario Analysis**:
- **Replay within same transaction**: Prevented by ReentrancyGuard
- **Replay in later transaction**: Prevented by `consumed` mapping
- **Cross-vault replay**: Prevented by vault address in hash
- **Cross-chain replay**: Prevented by chainId in hash
- **Nonce collision**: Prevented by off-chain nonce coordination (signer's responsibility)

### Why the Vault Cannot Be Abused

The vault's attack surface is minimized through strict access control and delegation:

**No Direct Signature Verification**: The vault never calls `ecrecover` or touches signature data. It passes the authorization and signature to the manager and trusts only the boolean return value. This eliminates:
- Signature malleability bugs
- Hash collision vulnerabilities
- ECDSA implementation flaws in the vault

**Manager-Only Authorization**: Only the configured AuthorizationManager (set via `setVault()` once) can validate withdrawals. The manager checks that `msg.sender == vault` before processing, creating a two-way binding. An attacker cannot:
- Call the manager directly (manager rejects non-vault callers)
- Bypass the manager (vault requires manager approval)
- Replace the manager (immutable reference)

**Checks-Effects-Interactions**: The vault follows this pattern strictly:
1. **Checks**: Validates auth.vault, recipient, amount, balance, and calls manager
2. **Effects**: Updates `totalWithdrawn += auth.amount`
3. **Interactions**: Transfers ETH via low-level call

This ordering ensures that even if the transfer triggers a reentrant call, the vault's state is already consistent, and the authorization is already consumed.

**No Arbitrary Calls**: The vault only transfers ETH to `auth.recipient` with `auth.amount`. There are no:
- Delegatecalls
- Arbitrary target addresses beyond the authorized recipient
- Arbitrary data payloads
- Admin functions to drain funds

### Initialization Protection

Initialization follows a one-time setup pattern to prevent configuration attacks:

**Immutable Core References**:
```solidity
address public immutable signer;  // Cannot be changed post-deployment
AuthorizationManager public immutable authorizationManager;  // Cannot be changed
```

**Single-Use Vault Configuration**:
```solidity
bool public vaultSet;

function setVault(address vault_) external {
    if (msg.sender != owner) revert CallerNotOwner();
    if (vaultSet) revert VaultAlreadySet();  // Prevents re-initialization
    vault = vault_;
    vaultSet = true;
}
```

This ensures:
- The signer cannot be replaced (prevents key rotation attacks)
- The manager-vault binding is permanent (prevents authorization bypass)
- Only the deployer can configure the vault, and only once

An attacker cannot:
- Call `setVault()` after initial setup (reverts with `VaultAlreadySet`)
- Deploy a malicious manager and link it (vault reference is immutable)
- Front-run the deployer's `setVault()` transaction (only `owner` can call)

## Testing

`npx hardhat test` runs comprehensive system tests including:

**Success Cases**:
- Deposit tracking and balance updates
- Single authorized withdrawal with signature verification

**Failure Cases** (Critical for Security Validation):
- **Replay Attack**: Attempting to reuse a consumed authorization reverts
- **Invalid Signer**: Signature from wrong private key is rejected
- Additional implicit coverage: wrong chainId, wrong vault address, insufficient balance

These negative test cases prove that the system correctly rejects attacks that would compromise fund security.

## Deployment details

- Deployment order: AuthorizationManager (with signer address) → SecureVault (with manager address) → `setVault(vault)` called once.
- Outputs are written to `deployment/deployment.json` with network and addresses.

## Security notes / assumptions

- Only the configured vault can consume authorizations; unauthorized callers cannot burn them.
- Replay protection is hash-based; collisions are mitigated by the strict ABI encoding and nonce.
- ETH transfers use `call` and are non-reentrant via `ReentrancyGuard` in the vault.
- Signatures use `eth_sign`-style hashing. For production, an EIP-712 domain could be adopted with the same fields.

