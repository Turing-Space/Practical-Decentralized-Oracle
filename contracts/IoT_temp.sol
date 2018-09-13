pragma solidity ^0.4.24;

import "./Client.sol";

contract IoT_temp is Client {
    uint8 isAbnormal; // the data we want to achieve commonly agreed states via voting 

    event CoolDown();

    // Measurement
    function logTemperature(address _custodianAddr, uint _temperature) public {

        // vote true for abnormal case
        if(_temperature > 40) {
            vote(_custodianAddr, true); 
        } 
        else{
            vote(_custodianAddr, false);
        }
    }

    // Action
    function adjustTemp(address _custodianAddr) public {
        isAbnormal = queryFinalState(_custodianAddr);
        if(isAbnormal == 1){ // if isAbnormal = true
            emit CoolDown();
        }
    }
}