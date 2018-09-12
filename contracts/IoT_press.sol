pragma solidity ^0.4.24;

import "./Client.sol";

contract IoT_press is Client {
    uint8 isAbnormal; // the data we want to achieve commonly agreed states via voting 

    event lowerPressure();

    constructor(address _custodianAddr) Client(_custodianAddr) public {
        
    }

    // Measurement
    function logPressure(uint _pressure) public {

        // vote true for abnormal case
        if(_pressure > 100) {
            vote(true); 
        } 
        else{
            vote(false);
        }
    }

    // Action
    function adjustPressure() public {
        isAbnormal = queryFinalState();
        if(isAbnormal == 1){ // if isAbnormal = true
            emit lowerPressure();
        }
    }
}