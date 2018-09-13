pragma solidity ^0.4.24;

import "./Client.sol";

contract IoT_press is Client {
    uint8 isAbnormal; // the data we want to achieve commonly agreed states via voting 

    event lowerPressure();

    // Measurement
    // log for what consensus(_custodianAddr)
    function logPressure(address _custodianAddr, uint _pressure) public {

        // vote true for abnormal case
        if(_pressure > 100) {
            vote(_custodianAddr, true); 
        } 
        else{
            vote(_custodianAddr, false);
        }
    }

    // Action
    function adjustPressure(address _custodianAddr) public {
        isAbnormal = queryFinalState(_custodianAddr);
        if(isAbnormal == 1){ // if isAbnormal = true
            emit lowerPressure();
        }
    }
}