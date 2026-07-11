// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/IYieldStrategy.sol";

contract YieldGuardVault {
    address public owner;
    string public vaultName;
    address public asset;
    uint256 public totalShares;
    uint256 public totalAssets_;
    uint256 public accumulatedFees;
    uint256 public performanceFee;
    uint256 public constant FEE_DENOMINATOR = 10000;
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lastHarvest;
    address[] public strategies;
    mapping(address => bool) public isStrategy;
    mapping(address => uint256) public strategyAllocation;

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event StrategyAdded(address indexed strategy);
    event StrategyRemoved(address indexed strategy);
    event Rebalanced(address indexed strategy, uint256 amount);
    event Harvested(uint256 totalYield, uint256 fees);
    event EmergencyDeallocate(address indexed strategy, uint256 amount);

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }

    constructor(string memory _name, address _asset, uint256 _performanceFee) {
        owner = msg.sender; vaultName = _name; asset = _asset; performanceFee = _performanceFee;
    }

    function deposit(uint256 _amount) external returns (uint256 shares) {
        require(_amount > 0, "Zero deposit");
        require(IERC20(asset).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        if (totalShares == 0) shares = _amount;
        else shares = (_amount * totalShares) / totalAssets_;
        balances[msg.sender] += shares;
        totalShares += shares; totalAssets_ += _amount;
        emit Deposited(msg.sender, _amount, shares);
    }

    function withdraw(uint256 _shares) external returns (uint256 assets) {
        require(_shares > 0 && balances[msg.sender] >= _shares, "Insufficient shares");
        assets = (_shares * totalAssets_) / totalShares;
        require(assets > 0, "Zero assets");

        // Pull from strategies if vault doesn't have enough idle balance
        uint256 idleBalance = IERC20(asset).balanceOf(address(this));
        if (idleBalance < assets) {
            uint256 needed = assets - idleBalance;
            for (uint i = 0; i < strategies.length; i++) {
                if (!isStrategy[strategies[i]]) continue;
                uint256 stratBalance = IYieldStrategy(strategies[i]).totalAssets();
                if (stratBalance == 0) continue;
                uint256 toPull = needed < stratBalance ? needed : stratBalance;
                uint256 pulled = IYieldStrategy(strategies[i]).withdraw(asset, toPull);
                strategyAllocation[strategies[i]] -= pulled;
                if (pulled >= needed) break;
                needed -= pulled;
            }
            require(IERC20(asset).balanceOf(address(this)) >= assets, "Insufficient liquidity after withdrawal");
        }

        balances[msg.sender] -= _shares;
        totalShares -= _shares; totalAssets_ -= assets;
        require(IERC20(asset).transfer(msg.sender, assets), "Transfer failed");
        emit Withdrawn(msg.sender, assets, _shares);
    }

    function sharePrice() external view returns (uint256) {
        if (totalShares == 0) return 1e18;
        return (totalAssets_ * 1e18) / totalShares;
    }

    function balanceOf(address _user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return (balances[_user] * totalAssets_) / totalShares;
    }

    function addStrategy(address _strategy) external onlyOwner {
        require(!isStrategy[_strategy], "Already added");
        isStrategy[_strategy] = true; strategies.push(_strategy);
        emit StrategyAdded(_strategy);
    }

    function removeStrategy(address _strategy) external onlyOwner {
        require(isStrategy[_strategy], "Not found");
        isStrategy[_strategy] = false;
        for (uint i = 0; i < strategies.length; i++) {
            if (strategies[i] == _strategy) {
                strategies[i] = strategies[strategies.length - 1];
                strategies.pop(); break;
            }
        }
        emit StrategyRemoved(_strategy);
    }

    function allocateToStrategy(address _strategy, uint256 _amount) external onlyOwner {
        _harvestAll();
        require(isStrategy[_strategy], "Invalid strategy");
        require(_amount <= IERC20(asset).balanceOf(address(this)), "Insufficient idle assets");
        strategyAllocation[_strategy] += _amount;
        require(IERC20(asset).transfer(_strategy, _amount), "Transfer to strategy failed");
        IYieldStrategy(_strategy).deposit(asset, _amount);
        emit Rebalanced(_strategy, _amount);
    }

    function rebalance(address _from, address _to, uint256 _amount) external onlyOwner {
        _harvestAll();
        require(isStrategy[_from] && isStrategy[_to], "Invalid strategy");
        require(_from != _to, "Same strategy");
        require(_amount <= IYieldStrategy(_from).totalAssets(), "Insufficient in source");
        uint256 withdrawn = IYieldStrategy(_from).withdraw(asset, _amount);
        require(IERC20(asset).transfer(_to, withdrawn), "Transfer failed");
        IYieldStrategy(_to).deposit(asset, withdrawn);
        strategyAllocation[_from] -= withdrawn;
        strategyAllocation[_to] += withdrawn;
        emit Rebalanced(_to, withdrawn);
    }

    function deallocateFromStrategy(address _strategy, uint256 _amount) external onlyOwner {
        _harvestAll();
        require(isStrategy[_strategy], "Invalid strategy");
        require(_amount <= IYieldStrategy(_strategy).totalAssets(), "Insufficient in strategy");
        uint256 withdrawn = IYieldStrategy(_strategy).withdraw(asset, _amount);
        strategyAllocation[_strategy] -= withdrawn;
        emit Rebalanced(address(0), withdrawn);
    }

    function emergencyDeallocate(address _strategy) external {
        require(isStrategy[_strategy], "Invalid strategy");
        uint256 hf = IYieldStrategy(_strategy).healthFactor();
        require(hf < 1e18, "HF still safe"); // HF < 1.0 (18 decimals)
        uint256 balance = IYieldStrategy(_strategy).totalAssets();
        require(balance > 0, "No assets");
        uint256 pulled = IYieldStrategy(_strategy).withdraw(asset, balance);
        strategyAllocation[_strategy] -= pulled;
        emit EmergencyDeallocate(_strategy, pulled);
    }

    function _harvestAll() internal returns (uint256 totalYield) {
        for (uint i = 0; i < strategies.length; i++) {
            if (isStrategy[strategies[i]]) {
                uint256 yield_ = IYieldStrategy(strategies[i]).harvest();
                totalYield += yield_; totalAssets_ += yield_;
            }
        }
        if (totalYield > 0) {
            uint256 fees = (totalYield * performanceFee) / FEE_DENOMINATOR;
            accumulatedFees += fees;
            emit Harvested(totalYield, fees);
        }
    }

    function harvestAll() external returns (uint256 totalYield) {
        totalYield = _harvestAll();
    }

    function getStrategies() external view returns (address[] memory) { return strategies; }
    function strategyCount() external view returns (uint256) { return strategies.length; }

    function healthFactor() external view returns (uint256) {
        if (strategies.length == 0) return type(uint256).max;
        uint256 minHealth = type(uint256).max;
        for (uint i = 0; i < strategies.length; i++) {
            if (isStrategy[strategies[i]]) {
                uint256 hf = IYieldStrategy(strategies[i]).healthFactor();
                if (hf < minHealth) minHealth = hf;
            }
        }
        return minHealth;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address"); owner = _newOwner;
    }

    function withdrawFees() external onlyOwner {
        uint256 fees = accumulatedFees; accumulatedFees = 0;
        require(IERC20(asset).transfer(owner, fees), "Fee transfer failed");
    }
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}
