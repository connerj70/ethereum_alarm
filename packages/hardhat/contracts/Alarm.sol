pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";


contract Alarm is Ownable, KeeperCompatibleInterface {

  mapping (address => AAlarm) public alarms;
  address[] alarmOwners;
  uint public immutable interval;
  uint public lastTimeStamp;
  address eaAddress = 0x530aCBD13f321984B8a04bdf63Df8749Dba5E8cf;

  event AlarmSet(address indexed _for, uint256 time, uint256 value);
  event AlarmCancelled(address indexed _for, uint256 value);

  constructor() {
    interval = 60;
    lastTimeStamp = block.timestamp;
  }

  struct AAlarm {
    uint256 time;
    uint256 value;
  }

  event Donate(address indexed _from, address _to, uint _value);

  function setAlarm(uint256 time) public payable {
    require(time > block.timestamp, "The alarm must be set for the future.");
    require(msg.value > 2_373_772_267_865_400 wei, "You must stake at least 0.0025 eth.");
    AAlarm memory currentAlarm = alarms[msg.sender];
    require(currentAlarm.time == 0, "You already have an alarm set.");

    alarms[msg.sender] = AAlarm(time, msg.value);
    alarmOwners.push(msg.sender);
    emit AlarmSet(msg.sender, time, msg.value);
  }

  function stopAlarm() public {
    (bool sent,) = msg.sender.call{value: alarms[msg.sender].value}("");
    require(sent, "Failed to return Ether");
    emit AlarmCancelled(msg.sender, alarms[msg.sender].value);
    delete alarms[msg.sender];
  }

  function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
    upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
  }

  function performUpkeep(bytes calldata) external override {
    lastTimeStamp = block.timestamp;
    for(uint i = 0; i < alarmOwners.length; i++) {
      if(alarms[alarmOwners[i]].time < block.timestamp && alarms[alarmOwners[i]].time != 0) {
        (bool sent,) = eaAddress.call{value: alarms[alarmOwners[i]].value}("");
        require(sent, "Failed to donate Ether");
        emit Donate(msg.sender, eaAddress, alarms[alarmOwners[i]].value);
        delete alarms[alarmOwners[i]];
        delete alarmOwners[i];
      }
    }
  }
}
