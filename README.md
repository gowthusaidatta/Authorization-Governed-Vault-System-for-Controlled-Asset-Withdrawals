# Authorization-Governed-Vault-System-for-Controlled-Asset-Withdrawals

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

This starts a local Hardhat node on `localhost:8545`, compiles contracts, deploys AuthorizationManager and SecureVault, and writes deployed addresses to `deployment/deployment.json`.

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

## Testing

`npx hardhat test` runs system-level tests covering deposit tracking, successful withdrawal, replay rejection, and invalid signer rejection.

## Deployment details

- Deployment order: AuthorizationManager (with signer address) → SecureVault (with manager address) → `setVault(vault)` called once.
- Outputs are written to `deployment/deployment.json` with network and addresses.

## Security notes / assumptions

- Only the configured vault can consume authorizations; unauthorized callers cannot burn them.
- Replay protection is hash-based; collisions are mitigated by the strict ABI encoding and nonce.
- ETH transfers use `call` and are non-reentrant via `ReentrancyGuard` in the vault.
- Signatures use `eth_sign`-style hashing. For production, an EIP-712 domain could be adopted with the same fields.

