const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity, MockProvider } = require("ethereum-waffle");

use(solidity);

const [wallet, otherWallet] = new MockProvider().getWallets();

describe("Alarm", function () {
  let myContract;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("Alarm", function () {
    it("Should deploy Alarm", async function () {
      const Alarm = await ethers.getContractFactory("Alarm");

      myContract = await Alarm.deploy();
    });

    describe("expireAlarms()", function() {
      it("deletes any expired alarms", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        // Date.now() comes back in milliseconds and block.timestamp is in seconds
        time = (Date.now() * 0.001).toFixed(0)
        myContract.connect(addr2).setAlarm(time, {value: ethers.utils.parseEther("1.0")})
        await new Promise(r => setTimeout(r, 100))
        resp = await myContract.alarms(addr2.address);
        expect(resp.time).to.equal(time)
        await hre.ethers.provider.send('evm_increaseTime', [60 * 60])
        await myContract.expireAlarms();
        resp2 = await myContract.alarms(addr2.address);
        expect(resp2.time).to.equal(0)
      })
    })

    describe("setAlarm()", function () {
      it("reverts the transaction if the time is invalid", async function () {
        time = 0
        await expect(myContract.setAlarm(time, {value: ethers.utils.parseEther("1.0")})).to.be.reverted;
      });

      it("does not not let you set an alarm if you already have one set", async function() {
        time = Date.now() + 10000;
        await myContract.setAlarm(time, {value: ethers.utils.parseEther("1.0")});
        await expect(myContract.setAlarm(time, {value: ethers.utils.parseEther("1.0")})).to.be.reverted;
      })

      it("does not let you set an alarm if you do not stake at least 100 wei", async function() {
        time = Date.now() + 1000;
        await expect(myContract.setAlarm(time)).to.be.reverted;
      })

      it("lets you set an alarm", async function() {
        const [owner, addr1] = await ethers.getSigners();
        
        time = Date.now() + 1000;
        await myContract.connect(addr1).setAlarm(time, {value: ethers.utils.parseEther("1")})
        resp = await myContract.alarms(addr1.address);
        expect(resp.time).to.equal(time)
      })
    });

    describe("checkUpkeep()", function() {
      await myContract.checkUpkeep()
    })
  });
});
