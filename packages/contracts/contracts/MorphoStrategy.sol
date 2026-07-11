// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./BaseStrategy.sol";

contract MorphoStrategy is BaseStrategy {
    uint256 public supplyRate; uint256 public matchingRatio; uint256 public totalSupplied;

    constructor(address _asset) BaseStrategy("Morpho Blue Supply", "Morpho", _asset) {
        supplyRate = 0.089e18; apy = supplyRate; matchingRatio = 0.85e18;
    }

    function deposit(address, uint256 amount) external override onlyVault returns (uint256) {
        totalAssets += amount; totalSupplied += amount; return amount;
    }

    function withdraw(address, uint256 amount) external override onlyVault returns (uint256) {
        require(amount <= totalSupplied, "Insufficient");
        totalSupplied -= amount; totalAssets -= amount; return amount;
    }

    function harvest() external override onlyVault returns (uint256 yield_) {
        uint256 blocksSinceUpdate = block.number - lastUpdateBlock;
        if (blocksSinceUpdate > 0 && totalSupplied > 0) {
            uint256 blocksPerYear = 22525714;
            uint256 accrued = (totalSupplied * supplyRate * blocksSinceUpdate) / (blocksPerYear * 1e18);
            if (accrued > 0) { totalSupplied += accrued; totalAssets += accrued; yield_ = accrued; }
        }
        lastUpdateBlock = block.number; return yield_;
    }

    function updateSupplyRate(uint256 _newRate) external { supplyRate = _newRate; apy = _newRate; }
}
