// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    
    bool public paused = false;

    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        _mint(msg.sender, initialSupply);
        paused = false; // start unpaused
    }

    // Modifier to allow only when not paused
    modifier whenNotPaused() {
        require(!paused, "Execution prevented because the circuit breaker is open");
        _;
    }

    // Function to buy HBAR using MTK tokens
    function buyHBAR(address treasury, uint256 amount) external whenNotPaused {
    require(balanceOf(msg.sender) >= amount, "Insufficient MTK");

    // Transfer MTK to treasury
    _transfer(msg.sender, treasury, amount);

    // Send HBAR back to user (1:1 for example)
    uint256 hbarAmount = amount; // define conversion rate here
    require(address(this).balance >= hbarAmount, "Not enough HBAR in contract");
    payable(msg.sender).transfer(hbarAmount);
}


    // Unpause function for owner
    function unpause() external onlyOwner {
        paused = false;
    }

    // Optional: pause function for owner
    function pause() external onlyOwner {
        paused = true;
    }
}
