// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./YieldGuardVault.sol";
import "./AaveStrategy.sol";
import "./MorphoStrategy.sol";

contract YieldGuardFactory {
    address public owner; uint256 public vaultCount;
    address[] public vaults;
    mapping(address => bool) public isVaultFromFactory;

    event VaultDeployed(address indexed vault, string name, address asset, address aaveStrategy, address morphoStrategy, uint256 timestamp);

    constructor() { owner = msg.sender; }

    function deployVault(string memory _name, address _asset, uint256 _performanceFee) external returns (address) {
        YieldGuardVault vault = new YieldGuardVault(_name, _asset, _performanceFee);
        AaveStrategy aave = new AaveStrategy(_asset);
        MorphoStrategy morpho = new MorphoStrategy(_asset);
        aave.setVault(address(vault));
        morpho.setVault(address(vault));
        vault.addStrategy(address(aave));
        vault.addStrategy(address(morpho));
        vault.transferOwnership(msg.sender);
        vaults.push(address(vault));
        isVaultFromFactory[address(vault)] = true;
        vaultCount++;
        emit VaultDeployed(address(vault), _name, _asset, address(aave), address(morpho), block.timestamp);
        return address(vault);
    }

    function getVaults() external view returns (address[] memory) { return vaults; }
    function getVaultCount() external view returns (uint256) { return vaultCount; }
}
