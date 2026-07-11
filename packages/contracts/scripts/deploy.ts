import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  console.log("Deploying YieldGuard contracts... Network:", network.name);
  console.log("Deployer:", deployer.address);

  const isMainnet = network.chainId === 196n;
  const USDC = isMainnet
    ? "0x74b7F16337b8972027F6196A17a631aC6dE26d22"
    : await (async () => {
        const m = await (await ethers.getContractFactory("MockERC20")).deploy("USD Coin", "USDC", ethers.parseEther("1000000"));
        await m.waitForDeployment();
        const addr = await m.getAddress();
        const token = await ethers.getContractAt("MockERC20", addr, deployer);
        const tGas = await token.transfer.estimateGas(deployer.address, ethers.parseEther("50000"));
        await token.transfer(deployer.address, ethers.parseEther("50000"), { gasLimit: tGas * 2n });
        console.log("USDC:", addr, "| Transferred 50k to deployer");
        return addr;
      })();

  const factory = await (await ethers.getContractFactory("YieldGuardFactory")).deploy();
  await factory.waitForDeployment();
  const f = await ethers.getContractAt("YieldGuardFactory", await factory.getAddress(), deployer);
  console.log("Factory:", await f.getAddress());

  // Note: eth_estimateGas is unreliable on X Layer for CREATE ops, use fixed gasLimit
  const tx = await f.deployVault("YieldGuard USDC Vault", USDC, 1000, { gasLimit: 5_000_000 });
  const receipt = await tx.wait();
  const ev = receipt.logs.find((l: any) => l.fragment?.name === "VaultDeployed");
  console.log("Vault:", ev.args.vault, "| Aave:", ev.args.aaveStrategy, "| Morpho:", ev.args.morphoStrategy);
  console.log("Done!");
}

main().catch(console.error);
