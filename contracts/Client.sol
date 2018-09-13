pragma solidity ^0.4.24;

import "./Custodian.sol";

contract Client {
    
    bytes32 public seq;
    
    // each custodianAddr corresponds to each consensus to be reached
    function vote(address _custodianAddr, bool _value) public {
        // sync before voting to prevent voting to past camp
        _syncToNewlyOpenedSeq(_custodianAddr);
        Custodian(_custodianAddr).acceptVote(seq, _value);
    }

    function queryFinalState(address _custodianAddr) public view returns (uint8) {
        return Custodian(_custodianAddr).finalResultOnCamp(Custodian(_custodianAddr).last_finalized_seq());
    }

    function _syncToNewlyOpenedSeq(address _custodianAddr) private {
        seq = Custodian(_custodianAddr).newly_opened_seq();
    }
}