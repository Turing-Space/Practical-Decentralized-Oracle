pragma solidity ^0.4.24;

import "./ICustodian.sol";
import "./IClient.sol";

contract Client is IClient {
    
    bytes32 public seq;
    
    // each custodianAddr corresponds to each consensus to be reached
    function vote(address _custodianAddr, bool _value) public {
        // sync before voting to prevent voting to past camp
        _syncToNewlyOpenedSeq(_custodianAddr);
        ICustodian(_custodianAddr).acceptVote(seq, _value);
    }

    function queryFinalState(address _custodianAddr) public view returns (uint8) {
        return ICustodian(_custodianAddr).finalResultOnCamp(ICustodian(_custodianAddr).last_finalized_seq());
    }

    function _syncToNewlyOpenedSeq(address _custodianAddr) private {
        seq = ICustodian(_custodianAddr).newly_opened_seq();
    }
}   