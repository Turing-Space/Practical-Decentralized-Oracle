pragma solidity ^0.4.24;

/**
 * @title Client interface
 */ 
contract IClient {
    
    bytes32 public seq;
    
    function vote(address _custodianAddr, bool _value) public;

    function queryFinalState(address _custodianAddr) public view returns (uint8);

    function _syncToNewlyOpenedSeq(address _custodianAddr) private;
}