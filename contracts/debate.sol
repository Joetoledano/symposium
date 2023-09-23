// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Debate {
    
    struct DebateStruct {
        address[] participants;
        string[] suggestedTopics;
        mapping(string => uint256) topicVotes;
        mapping(address => mapping(string => bool)) hasVotedForTopic;
        string chosenTopic;
        uint256 startTime;
        uint256[] roundEndTimes; 
        uint8 currentRound;
        address[] roundWinners;
    }

    mapping(uint256 => DebateStruct) public debates;
    uint256 public debateCounter = 0;

    uint256 public constant ROUND_DURATION = 1 hours; // Or set your desired round duration

    event DebateCreated(uint256 debateId, address[] participants);
    event TopicSuggested(uint256 debateId, string topic);
    event TopicVoted(uint256 debateId, string topic, address voter);
    event RoundStarted(uint256 debateId, uint8 roundNumber, uint256 startTime);
    event RoundEnded(uint256 debateId, uint8 roundNumber, address winner);

    modifier onlyParticipant(uint256 debateId) {
        require(isParticipant(debateId, msg.sender), "You are not a participant in this debate.");
        _;
    }

    function createDebate(address[] memory _participants) public returns (uint256) {
        debates[debateCounter] = DebateStruct({
            participants: _participants,
            suggestedTopics: new string[](0),
            chosenTopic: "",
            startTime: 0,
            roundEndTimes: new uint256[](3),
            currentRound: 0,
            roundWinners: new address[](3)
        });
        
        emit DebateCreated(debateCounter, _participants);
        
        return debateCounter++;
    }
    
    function suggestTopic(uint256 debateId, string memory topic) public {
        debates[debateId].suggestedTopics.push(topic);
        debates[debateId].topicVotes[topic] = 0;
        
        emit TopicSuggested(debateId, topic);
    }

    function voteForTopic(uint256 debateId, string memory topic) public {
        require(!debates[debateId].hasVotedForTopic[msg.sender][topic], "You've already voted for this topic.");

        debates[debateId].topicVotes[topic]++;
        debates[debateId].hasVotedForTopic[msg.sender][topic] = true;

        emit TopicVoted(debateId, topic, msg.sender);
    }

    function startRound(uint256 debateId) public onlyParticipant(debateId) {
        DebateStruct storage debate = debates[debateId];

        require(debate.currentRound < 3, "All rounds have been completed.");
        debate.currentRound++;
        debate.startTime = block.timestamp;
        debate.roundEndTimes[debate.currentRound - 1] = block.timestamp + ROUND_DURATION;

        emit RoundStarted(debateId, debate.currentRound, debate.startTime);
    }

    function endRound(uint256 debateId) public {
        DebateStruct storage debate = debates[debateId];

        require(block.timestamp > debate.roundEndTimes[debate.currentRound - 1], "The round is still ongoing.");
        require(debate.currentRound <= 3, "All rounds have been completed.");

        // Logic to determine the round's winner can be added here.
        // Placeholder: let's assume participant 0 wins for simplicity.
        debate.roundWinners[debate.currentRound - 1] = debate.participants[0];

        emit RoundEnded(debateId, debate.currentRound, debate.roundWinners[debate.currentRound - 1]);
    }

    function isParticipant(uint256 debateId, address user) public view returns (bool) {
        for(uint i = 0; i < debates[debateId].participants.length; i++) {
            if(debates[debateId].participants[i] == user) return true;
        }
        return false;
    }
}
