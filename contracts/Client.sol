pragma solidity ^0.4.24;

import "./Custodian.sol";

contract Client {
    bytes32 public seq;

    event VoteCampFinished(bytes32 seq, uint8 finalResult);
  
    Custodian C;
    mapping (bytes32 => uint8) public finalResultOnCamp;   // 0 as not finalized, 1 as true, 2 as false
    
    constructor(address _custodianAddr) public {
        C = Custodian(_custodianAddr);
    }
    
    function vote(bool _value) public {
        bool voteCampFinished = C.acceptVote(seq, _value);
        
        if(voteCampFinished) {
            storeFinalState();
            emit VoteCampFinished(seq, finalResultOnCamp[seq]);

            syncToNewlyOpenedSeq();
        }
    }
    
    function storeFinalState() public {
        finalResultOnCamp[seq] = C.finalResultOnCamp(seq);
    }

    function syncToNewlyOpenedSeq() public {
        seq = C.newly_opened_seq();
    }
}