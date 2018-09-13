pragma solidity ^0.4.24;

contract Custodian {
    
    uint8 public THRESHOLD_OF_PARTICIPANTS = 60;

    uint256 public numOfTotalVoterClients;
    bytes32 public newly_opened_seq;    
    bytes32 public last_finalized_seq;    
    
    mapping (bytes32 => uint256) public votesCountOnCamp;       // Total number of votes
    mapping (bytes32 => uint8) public finalResultOnCamp;        // Final result: 0 as not finalized, 1 as true, 2 as false
    mapping (bytes32 => int) public currVotesBalanceOnCamp;     // Current vote balance 
    mapping (address => bool) public clientIsKnown;             // Client is known/or not, to calculate total number of clients
    mapping (address => mapping (bytes32 => bool)) clientHasVotedOnSeq;
    mapping (bytes32 => bool) public campHasFinished;

    event VoteCampFinished(bytes32 seq, uint8 finalResult);
    
    function acceptVote(bytes32 _seq, bool _value) public  {
        
        address client = msg.sender;
        // TODO: check if msg.sender is really a client
                
        // Each client has single vote on a Seq
        if (clientHasVotedOnSeq[client][_seq]) revert("Each client can only vote once");
        clientHasVotedOnSeq[client][_seq] = true;
        
        // Check clientIsKnown, maintain the growth of the voters' population
        if (!clientIsKnown[client]) {
            clientIsKnown[client] = true;
            numOfTotalVoterClients++;
        }
        
        // update total counts
        votesCountOnCamp[_seq] = votesCountOnCamp[_seq] + 1;
        
        // update vote balance
        if (_value) {
            currVotesBalanceOnCamp[_seq] ++;
        } else {
            currVotesBalanceOnCamp[_seq] --;
        }
        
        // check finalization
        if ((votesCountOnCamp[_seq] > (THRESHOLD_OF_PARTICIPANTS * numOfTotalVoterClients / 100))) {
            if (currVotesBalanceOnCamp[_seq] > 0) { 
                finalResultOnCamp[_seq] = 1;
            } else if (currVotesBalanceOnCamp[_seq] < 0) {
                finalResultOnCamp[_seq] = 2;
            } // if = 0 -> no agreement reached -> do nothing

            campHasFinished[_seq] = true;
            last_finalized_seq = _seq;
            newly_opened_seq = keccak256(abi.encodePacked(_seq));
            
            emit VoteCampFinished(_seq, finalResultOnCamp[_seq]);
        } 
    }
}
