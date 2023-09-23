const hre = require("hardhat");

async function main() {
	const [deployer] = await hre.ethers.getSigners();

	console.log("Deploying contracts with the account:", deployer.address);
	console.log("Account balance:", (await deployer.getBalance()).toString());

	// Deploy the Debate contract
	const Debate = await hre.ethers.getContractFactory("Debate");
	const debate = await Debate.deploy();
	await debate.deployed();

	console.log("Debate contract deployed to:", debate.address);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
