// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract TradeVault {
    struct Trade {
        address partyA;
        address partyB;
        uint256 amountA;
        uint256 amountB;
        bool depositedA;
        bool depositedB;
        bool completed;
    }

    mapping(uint256 => Trade) public trades;
    uint256 public tradeCounter = 0;

    event TradeCreated(uint256 tradeId, address partyA, address partyB, uint256 amountA, uint256 amountB);
    event Deposited(uint256 tradeId, address from, uint256 amount);
    event TradeCompleted(uint256 tradeId);

    modifier onlyParties(uint256 tradeId) {
        Trade storage t = trades[tradeId];
        require(msg.sender == t.partyA || msg.sender == t.partyB, "Not a participant");
        _;
    }

    function createTrade(address _partyB, uint256 _amountA, uint256 _amountB) external returns (uint256) {
        tradeCounter++;
        trades[tradeCounter] = Trade({
            partyA: msg.sender,
            partyB: _partyB,
            amountA: _amountA,
            amountB: _amountB,
            depositedA: false,
            depositedB: false,
            completed: false
        });
        emit TradeCreated(tradeCounter, msg.sender, _partyB, _amountA, _amountB);
        return tradeCounter;
    }

    function deposit(uint256 tradeId) external payable onlyParties(tradeId) {
        Trade storage t = trades[tradeId];
        require(!t.completed, "Trade already completed");

        if (msg.sender == t.partyA) {
            require(msg.value == t.amountA, "Wrong amount for A");
            t.depositedA = true;
        } else {
            require(msg.value == t.amountB, "Wrong amount for B");
            t.depositedB = true;
        }

        emit Deposited(tradeId, msg.sender, msg.value);

        if (t.depositedA && t.depositedB) {
            _completeTrade(tradeId);
        }
    }

    function _completeTrade(uint256 tradeId) internal {
        Trade storage t = trades[tradeId];
        require(!t.completed, "Already completed");

        t.completed = true;

        // Transfer: A gets B’s deposit, B gets A’s deposit
        payable(t.partyA).transfer(t.amountB);
        payable(t.partyB).transfer(t.amountA);

        emit TradeCompleted(tradeId);
    }

    function getTrade(uint256 tradeId) external view returns (Trade memory) {
        return trades[tradeId];
    }
}
