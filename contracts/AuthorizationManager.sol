// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// AuthorizationManager validates single-use withdrawal authorizations produced off-chain.
contract AuthorizationManager {
    using ECDSA for bytes32;

    struct Authorization {
        address vault;
        address recipient;
        uint256 amount;
        uint256 nonce;
        uint256 chainId;
    }

    address public immutable signer; // trusted off-chain signer
    address public immutable owner;  // deployer who can set the vault once
    address public vault;
    bool public vaultSet;

    mapping(bytes32 => bool) public consumed;

    event VaultConfigured(address indexed vault);
    event AuthorizationUsed(bytes32 indexed authHash, address indexed vault, address indexed recipient, uint256 amount);

    error CallerNotOwner();
    error CallerNotVault();
    error VaultAlreadySet();
    error InvalidVault();
    error AuthorizationConsumed();
    error InvalidSignature();
    error ChainIdMismatch();

    constructor(address signer_) {
        if (signer_ == address(0)) revert InvalidSignature();
        signer = signer_;
        owner = msg.sender;
    }

    function setVault(address vault_) external {
        if (msg.sender != owner) revert CallerNotOwner();
        if (vaultSet) revert VaultAlreadySet();
        if (vault_ == address(0)) revert InvalidVault();
        vault = vault_;
        vaultSet = true;
        emit VaultConfigured(vault_);
    }

    function computeAuthorizationHash(Authorization calldata auth) public pure returns (bytes32) {
        return keccak256(abi.encode(auth.vault, auth.recipient, auth.amount, auth.nonce, auth.chainId));
    }

    function verifyAuthorization(Authorization calldata auth, bytes calldata signature) external returns (bool) {
        if (!vaultSet || msg.sender != vault) revert CallerNotVault();
        if (auth.vault != vault) revert InvalidVault();
        if (auth.chainId != block.chainid) revert ChainIdMismatch();

        bytes32 authHash = computeAuthorizationHash(auth);
        if (consumed[authHash]) revert AuthorizationConsumed();

        address recovered = authHash.toEthSignedMessageHash().recover(signature);
        if (recovered != signer) revert InvalidSignature();

        consumed[authHash] = true;
        emit AuthorizationUsed(authHash, auth.vault, auth.recipient, auth.amount);
        return true;
    }

    function isConsumed(bytes32 authHash) external view returns (bool) {
        return consumed[authHash];
    }
}
