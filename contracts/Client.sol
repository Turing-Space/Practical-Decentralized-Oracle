pragma solidity ^0.4.24;

import "./Custodian.sol";

contract Client {
    
    bytes32 public seq;
    Custodian C;
    
    constructor(address _custodianAddr) public {
        C = Custodian(_custodianAddr);
    }
    
    function vote(bool _value) public {
        // sync before voting to prevent voting to past camp
        _syncToNewlyOpenedSeq();
        C.acceptVote(seq, _value);
    }

    function queryFinalState() public view returns (uint8) {
        return C.finalResultOnCamp(C.last_finalized_seq());
    }

    function _syncToNewlyOpenedSeq() private {
        seq = C.newly_opened_seq();
    }
}