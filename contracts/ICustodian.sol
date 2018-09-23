pragma solidity ^0.4.24;

contract ICustodian {
    
    uint8 public THRESHOLD_OF_PARTICIPANTS;

    uint256 public numOfTotalVoterClients;
    bytes32 public newly_opened_seq;    
    bytes32 public last_finalized_seq;    
    
    mapping (bytes32 => uint256) public votesCountOnCamp;       // Total number of votes
    mapping (bytes32 => uint8) public finalResultOnCamp;        // Final result: 0 as not finalized, 1 as true, 2 as false
    mapping (bytes32 => int) public currVotesBalanceOnCamp;     // Current vote balance 
    mapping (address => bool) public clientIsKnown;             // Client is known/or not, to calculate total number of clients
    mapping (address => mapping (bytes32 => bool)) clientHasVotedOnSeq;
    mapping (bytes32 => bool) public campHasFinished;

    function acceptVote(bytes32 _seq, bool _value) public;

    event VoteCampFinished(
        bytes32 seq, 
        uint8 finalResult
    );
}
