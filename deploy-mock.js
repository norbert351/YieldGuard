const { ethers } = require('ethers');

async function main() {
    const pk = "0xe8d9d70ce068abe54587368a503b5bfc9b53ca4bfd5a3c8c9f086ee10581d7c9";
    const SERVER = "0x659ffcFEac8E07B5477Ef29DB04212431A524553";
    
    const provider = new ethers.JsonRpcProvider('https://testrpc.xlayer.tech');
    const wallet = new ethers.Wallet(pk, provider);
    console.log('Deployer:', wallet.address);

    const artifact = require('./packages/contracts/artifacts/contracts/mocks/MockERC20.sol/MockERC20.json');
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const contract = await factory.deploy('Test USDC', 'USDC', ethers.parseEther('0'));
    await contract.waitForDeployment();
    
    const addr = await contract.getAddress();
    console.log('Mock USDC deployed:', addr);
    
    const tx = await contract.mint(SERVER, ethers.parseEther('1000000'));
    await tx.wait();
    console.log('Minted 1M USDC to', SERVER);
    
    const bal = await contract.balanceOf(SERVER);
    console.log('Server balance:', ethers.formatEther(bal), 'USDC');
}

main().catch(e => { console.error(e.message); });
