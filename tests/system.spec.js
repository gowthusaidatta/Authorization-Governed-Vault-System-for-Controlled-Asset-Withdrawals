const { expect } = require("chai");
const { ethers } = require("hardhat");

function buildAuthHash(auth) {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "address", "uint256", "uint256", "uint256"],
    [auth.vault, auth.recipient, auth.amount, auth.nonce, auth.chainId]
  );
  return ethers.keccak256(encoded);
}

async function signAuthorization(auth, signer) {
  const hash = buildAuthHash(auth);
  return signer.signMessage(ethers.getBytes(hash));
}

describe("Authorization-governed vault", function () {
  let deployer;
  let recipient;
  let signer;
  let authorizationManager;
  let vault;

  beforeEach(async () => {
    [deployer, recipient, signer] = await ethers.getSigners();
    const AuthorizationManager = await ethers.getContractFactory("AuthorizationManager");
    authorizationManager = await AuthorizationManager.deploy(signer.address);
    const SecureVault = await ethers.getContractFactory("SecureVault");
    vault = await SecureVault.deploy(authorizationManager.target);
    await authorizationManager.setVault(vault.target);
  });

  it("tracks deposits", async () => {
    const depositValue = ethers.parseEther("1");
    await expect(
      deployer.sendTransaction({ to: vault.target, value: depositValue })
    ).to.changeEtherBalances([deployer, vault], [depositValue * -1n, depositValue]);

    const totalDeposited = await vault.totalDeposited();
    expect(totalDeposited).to.equal(depositValue);
  });

  it("allows a single authorized withdrawal", async () => {
    const amount = ethers.parseEther("0.5");
    await deployer.sendTransaction({ to: vault.target, value: amount });

    const auth = {
      vault: vault.target,
      recipient: recipient.address,
      amount,
      nonce: 1,
      chainId: 31337
    };
    const signature = await signAuthorization(auth, signer);

    await expect(vault.withdraw(auth, signature)).to.changeEtherBalances(
      [vault, recipient],
      [amount * -1n, amount]
    );

    const hash = buildAuthHash(auth);
    expect(await authorizationManager.consumed(hash)).to.equal(true);
    expect(await vault.totalWithdrawn()).to.equal(amount);
  });

  it("rejects reused authorization", async () => {
    const amount = ethers.parseEther("0.2");
    await deployer.sendTransaction({ to: vault.target, value: amount });

    const auth = {
      vault: vault.target,
      recipient: recipient.address,
      amount,
      nonce: 42,
      chainId: 31337
    };
    const signature = await signAuthorization(auth, signer);

    await vault.withdraw(auth, signature);
    await expect(vault.withdraw(auth, signature)).to.be.reverted;
  });

  it("rejects signatures from wrong signer", async () => {
    const amount = ethers.parseEther("0.3");
    await deployer.sendTransaction({ to: vault.target, value: amount });

    const auth = {
      vault: vault.target,
      recipient: recipient.address,
      amount,
      nonce: 7,
      chainId: 31337
    };

    const badSignature = await signAuthorization(auth, deployer);
    await expect(vault.withdraw(auth, badSignature)).to.be.revertedWithCustomError(
      authorizationManager,
      "InvalidSignature"
    );
  });
});
