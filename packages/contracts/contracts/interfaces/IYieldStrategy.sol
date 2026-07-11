// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IYieldStrategy {
    function name() external view returns (string memory);
    function protocol() external view returns (string memory);
    function currentApy() external view returns (uint256);
    function totalAssets() external view returns (uint256);
    function deposit(address asset, uint256 amount) external returns (uint256 shares);
    function withdraw(address asset, uint256 amount) external returns (uint256 assets);
    function harvest() external returns (uint256 yield);
    function isHealthy() external view returns (bool);
    function healthFactor() external view returns (uint256);
}
