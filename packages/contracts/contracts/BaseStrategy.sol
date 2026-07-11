// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./interfaces/IYieldStrategy.sol";

abstract contract BaseStrategy is IYieldStrategy {
    string public override name; string public override protocol;
    address public vault; address public asset;
    uint256 public override totalAssets; uint256 public apy;
    uint256 public override healthFactor; uint256 public lastUpdateBlock;

    modifier onlyVault() { require(msg.sender == vault, "Only vault"); _; }

    constructor(string memory _name, string memory _protocol, address _asset) {
        name = _name; protocol = _protocol; asset = _asset;
        vault = msg.sender; healthFactor = 2.5e18;
    }

    function deposit(address, uint256 amount) external virtual onlyVault returns (uint256) { totalAssets += amount; return amount; }
    function withdraw(address, uint256 amount) external virtual onlyVault returns (uint256) { require(amount <= totalAssets, "Insufficient"); totalAssets -= amount; return amount; }

    function harvest() external virtual onlyVault returns (uint256 yield_) {
        uint256 blocksSinceUpdate = block.number - lastUpdateBlock;
        if (blocksSinceUpdate > 0 && totalAssets > 0) {
            uint256 blocksPerYear = 22525714;
            yield_ = (totalAssets * apy * blocksSinceUpdate) / (blocksPerYear * 1e18);
            if (yield_ > 0) totalAssets += yield_;
        }
        lastUpdateBlock = block.number; return yield_;
    }

    function isHealthy() external view virtual override returns (bool) { return healthFactor >= 1.5e18; }
    function currentApy() external view override returns (uint256) { return apy; }
    function updateApy(uint256 _newApy) external { apy = _newApy; }
    function updateHealthFactor(uint256 _hf) external onlyVault { healthFactor = _hf; }
    function setVault(address _vault) external { require(vault == address(0) || msg.sender == vault); vault = _vault; }
}
