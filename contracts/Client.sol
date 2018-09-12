pragma solidity ^0.4.24;

import "./Custodian.sol";

contract Client {
    bytes32 public seq;

    Custodian C;
    uint8 public finalResultOnCamp;   // 0 as not finalized, 1 as true, 2 as false, only store the latest state or keep the history? TODO
    
    constructor(address _custodianAddr) public {
        C = Custodian(_custodianAddr);
    }
    
    function vote(bool _value) public {
        // sync before voting to prevent voting to past camp
        syncToNewlyOpenedSeq();
        C.acceptVote(seq, _value);
    }

    function queryFinalState() public view returns (uint8) {
        return C.finalResultOnCamp(C.last_finalized_seq());
    }

    function syncToNewlyOpenedSeq() private {
        seq = C.newly_opened_seq();
    }
}