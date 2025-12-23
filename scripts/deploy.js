const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const signerAddress = process.env.AUTH_SIGNER || deployer.address;

  console.log("Deployer:", deployer.address);
  console.log("Auth signer:", signerAddress);

  const AuthorizationManager = await hre.ethers.getContractFactory("AuthorizationManager");
  const authorizationManager = await AuthorizationManager.deploy(signerAddress);
  await authorizationManager.waitForDeployment();

  const SecureVault = await hre.ethers.getContractFactory("SecureVault");
  const secureVault = await SecureVault.deploy(authorizationManager.target);
  await secureVault.waitForDeployment();

  const setVaultTx = await authorizationManager.setVault(secureVault.target);
  await setVaultTx.wait();

  const network = await hre.ethers.provider.getNetwork();

  const deployment = {
    network: {
      name: hre.network.name,
      chainId: Number(network.chainId)
    },
    deployer: deployer.address,
    signer: signerAddress,
    authorizationManager: authorizationManager.target,
    secureVault: secureVault.target
  };

  const outDir = path.join(__dirname, "..", "deployment");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "deployment.json"), JSON.stringify(deployment, null, 2));

  console.log("AuthorizationManager:", authorizationManager.target);
  console.log("SecureVault:", secureVault.target);
  console.log("Deployment saved to deployment/deployment.json");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
