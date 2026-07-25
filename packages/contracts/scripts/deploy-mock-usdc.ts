// scripts/deploy-mock-usdc.ts
import { ethers } from "hardhat";

async function main() {
  const SERVER_WALLET = "0x659ffcFEac8E07B5477Ef29DB04212431A524553";
  const VAULT_ADDRESS = "0x7400948698e7aa42B007E756699C8C22F047c8e2";
  
  console.log("Deploying Mock USDC to X Layer testnet...");
  
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const usdc = await MockERC20.deploy("Test USDC", "USDC", ethers.parseEther("0"));
  await usdc.waitForDeployment();
  
  const addr = await usdc.getAddress();
  console.log("Mock USDC deployed:", addr);
  
  // Mint 1M USDC to server wallet
  console.log("Minting 1,000,000 USDC to server wallet...");
  const tx = await usdc.mint(SERVER_WALLET, ethers.parseEther("1000000"));
  await tx.wait();
  
  // Mint 10,000 to deployer
  console.log("Minting 10,000 USDC to deployer...");
  const tx2 = await usdc.mint(await (await ethers.getSigners())[0].getAddress(), ethers.parseEther("10000"));
  await tx2.wait();
  
  console.log("Done! Mock USDC:", addr);
  console.log("Server wallet:", SERVER_WALLET);
  console.log("Vault address:", VAULT_ADDRESS);
  console.log("Now set TESTNET_VAULT_ADDRESS and update vault asset to this USDC address");
}

main().catch(console.error);
