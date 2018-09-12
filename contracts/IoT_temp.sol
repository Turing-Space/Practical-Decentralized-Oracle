pragma solidity ^0.4.24;

import "./Client.sol";

contract IoT_temp is Client {
    uint8 isAbnormal; // the data we want to achieve commonly agreed states via voting 

    event CoolDown();

    constructor(address _custodianAddr) Client(_custodianAddr) public {
        
    }

    // Measurement
    function logTemperature(uint _temperature) public {

        // vote true for abnormal case
        if(_temperature > 40) {
            vote(true); 
        } 
        else{
            vote(false);
        }
    }

    // Action
    function adjustTemp() public {
        isAbnormal = queryFinalState();
        if(isAbnormal == 1){ // if isAbnormal = true
            emit CoolDown();
        }
    }
}