const { expect } = require("chai");

describe("Debate", function () {
	let Debate, debate, owner, addr1, addr2, addrs;

	beforeEach(async () => {
		Debate = await ethers.getContractFactory("Debate");
		debate = await Debate.deploy();
		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();
	});

	it("Should create a new debate and emit an event", async function () {
		await expect(debate.createDebate([owner.address, addr1.address]))
			.to.emit(debate, "DebateCreated")
			.withArgs(0, [owner.address, addr1.address]);

		const debateData = await debate.debates(0);
		expect(debateData.participants[0]).to.equal(owner.address);
		expect(debateData.participants[1]).to.equal(addr1.address);
	});

	it("Should allow users to suggest a topic", async function () {
		await debate.createDebate([owner.address, addr1.address]);
		await expect(debate.suggestTopic(0, "Topic1")).to.emit(debate, "TopicSuggested").withArgs(0, "Topic1");
	});

	it("Should allow users to vote on a suggested topic", async function () {
		await debate.createDebate([owner.address, addr1.address]);
		await debate.suggestTopic(0, "Topic1");

		await debate.connect(addr2).voteForTopic(0, "Topic1");
		const topicVotes = await debate.debates(0).topicVotes["Topic1"];

		expect(topicVotes).to.equal(1);
	});
	it("Should allow participants to start a round", async function () {
		await debate.createDebate([owner.address, addr1.address]);
		await expect(debate.startRound(0))
			.to.emit(debate, "RoundStarted")
			.withArgs(0, 1, await ethers.provider.getBlock("latest").timestamp);
	});

	it("Should not allow non-participants to start a round", async function () {
		await debate.createDebate([owner.address, addr1.address]);
		await expect(debate.connect(addr2).startRound(0)).to.be.revertedWith("You are not a participant in this debate.");
	});

	it("Should automatically end a round after a set duration", async function () {
		await debate.createDebate([owner.address, addr1.address]);
		await debate.startRound(0);

		// Simulating time passage in a test environment.
		await hre.network.provider.send("evm_increaseTime", [3600]); // 1 hour
		await hre.network.provider.send("evm_mine");

		await expect(debate.endRound(0)).to.emit(debate, "RoundEnded").withArgs(0, 1, owner.address); // Assuming owner wins the round.
	});
	it("Should not allow suggesting the same topic multiple times", async function () {
		await debate.createDebate([owner.address, addr1.address]);
		await debate.suggestTopic(0, "Topic1");

		// Expect a revert when suggesting the same topic.
		await expect(debate.suggestTopic(0, "Topic1")).to.be.reverted;
	});

	it("Should not allow voting for non-suggested topics", async function () {
		await debate.createDebate([owner.address, addr1.address]);
		await expect(debate.voteForTopic(0, "NonExistentTopic")).to.be.reverted;
	});

	it("Should not allow voting multiple times on the same topic by the same user", async function () {
		await debate.createDebate([owner.address, addr1.address]);
		await debate.suggestTopic(0, "Topic1");
		await debate.connect(addr2).voteForTopic(0, "Topic1");

		// Expect a revert for the second vote.
		await expect(debate.connect(addr2).voteForTopic(0, "Topic1")).to.be.revertedWith(
			"You've already voted for this topic."
		);
	});
});
