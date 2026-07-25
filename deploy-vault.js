const { ethers } = require('ethers');

async function main() {
    const pk = "0xe8d9d70ce068abe54587368a503b5bfc9b53ca4bfd5a3c8c9f086ee10581d7c9";
    const MOCK_USDC = "0x40F1d849eF771FDab898A06d4ac44C5C1c668236";
    
    const provider = new ethers.JsonRpcProvider('https://testrpc.xlayer.tech');
    const wallet = new ethers.Wallet(pk, provider);
    
    const artifact = require('./packages/contracts/artifacts/contracts/YieldGuardVault.sol/YieldGuardVault.json');
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const vault = await factory.deploy('YieldGuard USDC Vault', MOCK_USDC, 1000); // 10% performance fee
    await vault.waitForDeployment();
    
    const addr = await vault.getAddress();
    console.log('Vault deployed:', addr);
    console.log('Asset:', MOCK_USDC);
    
    // Register Aave and Morpho as strategies
    const AAVE = "0xf122AF1A0ebDdaB36b6D1a3c7363CE909CD56008";
    const MORPHO = "0xa997593C196d350efAA04141C9eBE1Bed93c118c";
    
    const tx1 = await vault.addStrategy(AAVE);
    await tx1.wait();
    console.log('Aave registered');
    
    const tx2 = await vault.addStrategy(MORPHO);
    await tx2.wait();
    console.log('Morpho registered');
    
    console.log('\nSet on Render: TESTNET_VAULT_ADDRESS=' + addr);
}

main().catch(e => { console.error(e.message); });
