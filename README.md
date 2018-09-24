## Init
1. `truffle compile`
2. `truffle test`

## Experiements (platform: Kovan PoA)
1. Agreement reaching latency (ms): a client from voted to camp finalized with the same seq id 
    - N (total number of voters): 1, 5, 10, 20, 50, 100, 200, 500, 1000
        - study whether the latency will increase exponentially or linearly as N grows
    - Consensus: 1, 5, 10, 20, 50, 100, 200, 500, 1000
        - fixed N, multiple consensus to reach (eg. "consensus1", "consensus2")  
        - test the scale of the concurrency
        - each voting action is atmoic 
    - Thresh (Binary): 10, 20, ..., 90, 100
        - configurable according to network stability
    - Thresh (Multi-valued): 
        - dim1: parti thresh: 10, 20, ..., 90, 100
        - dim2: value diversity: 3, 4, 5, ..., 10
            - graph impl2 (candi thresh): each diversity as a line, x as thresh(%), y as latency(ms)
            - graph impl1 vs binary (parti thresh): bi mul as two lines, x as thresh(%), y as latency(ms)

## Lit review
1. Avalanche
    - Ava is p2p query, CC is p2cus query
    - Ava eager to bias to consensus, CC reach state based on sufficient evidence
    - Ava client active query(want to query/reach consensus), CC custodian passive receive(want to know consensus)

## Discussion
1. Multi-valued
    - implement1: thresh on participation
     - adv
     - dis
    - implement2: thresh on candidate
     - adv
     - dis