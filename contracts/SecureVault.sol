// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {AuthorizationManager} from "./AuthorizationManager.sol";

// SecureVault holds ETH and delegates withdrawal authorization to AuthorizationManager.
contract SecureVault is ReentrancyGuard {
    AuthorizationManager public immutable authorizationManager;

    uint256 public totalDeposited;
    uint256 public totalWithdrawn;

    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount, bytes32 indexed authorizationHash);

    error ZeroDeposit();
    error ZeroRecipient();
    error ZeroAmount();
    error AuthorizationFailed();
    error InsufficientVaultFunds();

    constructor(AuthorizationManager authorizationManager_) {
        authorizationManager = authorizationManager_;
    }

    receive() external payable {
        if (msg.value == 0) revert ZeroDeposit();
        totalDeposited += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(
        AuthorizationManager.Authorization calldata auth,
        bytes calldata signature
    ) external nonReentrant {
        if (auth.vault != address(this)) revert AuthorizationFailed();
        if (auth.recipient == address(0)) revert ZeroRecipient();
        if (auth.amount == 0) revert ZeroAmount();

        bool ok = authorizationManager.verifyAuthorization(auth, signature);
        if (!ok) revert AuthorizationFailed();

        if (address(this).balance < auth.amount) revert InsufficientVaultFunds();

        totalWithdrawn += auth.amount;

        (bool success, ) = auth.recipient.call{value: auth.amount}("");
        if (!success) revert AuthorizationFailed();

        bytes32 authHash = authorizationManager.computeAuthorizationHash(auth);
        emit Withdrawal(auth.recipient, auth.amount, authHash);
    }
}
