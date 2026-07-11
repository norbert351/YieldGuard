import { expect } from "chai";
import { ethers } from "hardhat";

describe("YieldGuard", function () {
  let owner: any, user: any, vault: any, factory: any, mockToken: any;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("USD Coin", "USDC", ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();

    const Factory = await ethers.getContractFactory("YieldGuardFactory");
    factory = await Factory.deploy();
    await factory.waitForDeployment();
  });

  describe("YieldGuardVault", function () {
    beforeEach(async function () {
      const tx = await factory.deployVault("Test Vault", await mockToken.getAddress(), 1000);
      const receipt = await tx.wait();
      const event = receipt.logs.find((l: any) => l.fragment?.name === "VaultDeployed");
      vault = await ethers.getContractAt("YieldGuardVault", event.args.vault);
    });

    it("should deploy with correct name and asset", async function () {
      expect(await vault.vaultName()).to.equal("Test Vault");
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("should accept deposits and mint shares", async function () {
      const amt = ethers.parseEther("1000");
      await mockToken.transfer(user.address, amt);
      await mockToken.connect(user).approve(await vault.getAddress(), amt);
      await vault.connect(user).deposit(amt);
      expect(await vault.balanceOf(user.address)).to.equal(amt);
    });

    it("should allow withdrawal", async function () {
      const amt = ethers.parseEther("1000");
      await mockToken.transfer(user.address, amt);
      await mockToken.connect(user).approve(await vault.getAddress(), amt);
      await vault.connect(user).deposit(amt);
      await vault.connect(user).withdraw(amt);
      expect(await vault.balanceOf(user.address)).to.equal(0);
    });

    it("should add and track strategies", async function () {
      const AaveStrategy = await ethers.getContractFactory("AaveStrategy");
      const aave = await AaveStrategy.deploy(await mockToken.getAddress());
      await aave.waitForDeployment();
      await vault.addStrategy(await aave.getAddress());
      expect(await vault.strategyCount()).to.equal(3);
    });

    it("should allocate only deposited idle capital to strategies", async function () {
      const amt = ethers.parseEther("1000");
      await mockToken.transfer(user.address, amt);
      await mockToken.connect(user).approve(await vault.getAddress(), amt);
      await vault.connect(user).deposit(amt);

      const [strategy] = await vault.getStrategies();
      await expect(vault.allocateToStrategy(strategy, ethers.parseEther("600")))
        .to.emit(vault, "Rebalanced")
        .withArgs(strategy, ethers.parseEther("600"));

      expect(await mockToken.balanceOf(await vault.getAddress())).to.equal(ethers.parseEther("400"));
      await expect(vault.allocateToStrategy(strategy, ethers.parseEther("500"))).to.be.revertedWith("Insufficient idle assets");
    });
  });

  describe("YieldGuardFactory", function () {
    it("should deploy vault with strategies", async function () {
      const tx = await factory.deployVault("Factory Vault", await mockToken.getAddress(), 500);
      const receipt = await tx.wait();
      const event = receipt.logs.find((l: any) => l.fragment?.name === "VaultDeployed");
      expect(event.args.name).to.equal("Factory Vault");
      expect(await factory.vaultCount()).to.equal(1);
    });
  });

  describe("AaveStrategy", function () {
    it("should have correct initial APY", async function () {
      const AaveStrategy = await ethers.getContractFactory("AaveStrategy");
      const aave = await AaveStrategy.deploy(await mockToken.getAddress());
      await aave.waitForDeployment();
      expect(await aave.currentApy()).to.equal(ethers.parseEther("0.062"));
    });
  });

  describe("MorphoStrategy", function () {
    it("should have higher APY than Aave", async function () {
      const MorphoStrategy = await ethers.getContractFactory("MorphoStrategy");
      const morpho = await MorphoStrategy.deploy(await mockToken.getAddress());
      await morpho.waitForDeployment();
      expect(await morpho.currentApy()).to.be.gt(ethers.parseEther("0.08"));
    });
  });
});
