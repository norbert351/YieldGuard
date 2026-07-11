// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./BaseStrategy.sol";

contract AaveStrategy is BaseStrategy {
    uint256 public supplyRate; uint256 public liquidationThreshold; uint256 public ltv;
    uint256 public aTokenBalance;

    constructor(address _asset) BaseStrategy("Aave V3 Supply", "Aave V3", _asset) {
        supplyRate = 0.062e18; apy = supplyRate; liquidationThreshold = 0.8e18; ltv = 0.7e18;
    }

    function deposit(address, uint256 amount) external override onlyVault returns (uint256) {
        totalAssets += amount; aTokenBalance += amount; return amount;
    }

    function withdraw(address, uint256 amount) external override onlyVault returns (uint256) {
        require(amount <= aTokenBalance, "Insufficient aToken");
        aTokenBalance -= amount; totalAssets -= amount; return amount;
    }

    function harvest() external override onlyVault returns (uint256 yield_) {
        uint256 blocksSinceUpdate = block.number - lastUpdateBlock;
        if (blocksSinceUpdate > 0 && aTokenBalance > 0) {
            uint256 blocksPerYear = 22525714;
            uint256 accrued = (aTokenBalance * supplyRate * blocksSinceUpdate) / (blocksPerYear * 1e18);
            if (accrued > 0) { aTokenBalance += accrued; totalAssets += accrued; yield_ = accrued; }
        }
        lastUpdateBlock = block.number; return yield_;
    }

    function updateSupplyRate(uint256 _newRate) external { supplyRate = _newRate; apy = _newRate; }
    function calculateHealthFactor(uint256 _debt) external view returns (uint256) {
        if (_debt == 0) return type(uint256).max;
        return (aTokenBalance * liquidationThreshold) / _debt;
    }
}
