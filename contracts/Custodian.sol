pragma solidity ^0.4.24;

import "./Ownable.sol";

contract Custodian is Ownable {
    
    uint8 public THRESHOLD_OF_PARTICIPANTS = 60;
    
    uint256 public numOfTotalClients;
    uint256 public TIMEOUT = 1 days;
    bytes32 public newly_opened_seq;
    
    mapping (bytes32 => uint256) public votesCountOnCamp;       // Total number of votes
    mapping (bytes32 => uint8) public finalResultOnCamp;        // Final result: 0 as not finalized, 1 as true, 2 as false
    mapping (bytes32 => int) public currVotesBalanceOnCamp;     // Current vote balance 
    mapping (bytes32 => uint256) public startTimeOnCamp;        // Start time 
    mapping (address => bool) public clientIsKnown;             // Client is known/or not, to calculate total number of clients
    mapping (address => mapping (bytes32 => bool)) clientHasVotedOnSeq;
    
    
    function acceptVote(bytes32 _seq, bool _value) public returns (bool)  {
        
        address client = msg.sender;
        
        // Each client has single vote on a Seq
        if (clientHasVotedOnSeq[client][_seq]) revert();
        clientHasVotedOnSeq[client][_seq] = true;
        
        // Check clientIsKnown, maintain the growth of the voters' population
        if (!clientIsKnown[client]) {
            clientIsKnown[client] = true;
            numOfTotalClients++;
        }
        
        // update start time if this is the first vote on this camp ID
        if (votesCountOnCamp[_seq] == 0) {      // Unknown sequence
            startTimeOnCamp[_seq] = now;
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
        // threshiold of participanst OR timeout
        if ((votesCountOnCamp[_seq] > (THRESHOLD_OF_PARTICIPANTS * numOfTotalClients / 100)) 
            || (now >= startTimeOnCamp[_seq] + TIMEOUT)) {
            if (currVotesBalanceOnCamp[_seq] > 0) { 
                finalResultOnCamp[_seq] = 1;
            } else if (currVotesBalanceOnCamp[_seq] < 0) {
                finalResultOnCamp[_seq] = 2;
            } // 0 do nothing
            newly_opened_seq = keccak256(_seq);
            
            return true;
        } 
        
        return false;

    }
    

}
