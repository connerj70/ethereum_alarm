import { Card, Button } from "antd";
import React, { useMemo, useState, useEffect } from "react";
import { useContractExistsAtAddress, useContractLoader } from "eth-hooks";
import SetAlarm from './SetAlarm'
import { Transactor } from "../../helpers";
import { useEventListener } from "eth-hooks/events/useEventListener";
const { utils } = require("ethers");

const noContractDisplay = (
  <div>
    Loading...{" "}
    <div style={{ padding: 32 }}>
      You need to run{" "}
      <span
        className="highlight"
        style={{ marginLeft: 4, /* backgroundColor: "#f1f1f1", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
      >
        yarn run chain
      </span>{" "}
      and{" "}
      <span
        className="highlight"
        style={{ marginLeft: 4, /* backgroundColor: "#f1f1f1", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
      >
        yarn run deploy
      </span>{" "}
      to see your contract here.
    </div>
    <div style={{ padding: 32 }}>
      <span style={{ marginRight: 4 }} role="img" aria-label="warning">
        ☢️
      </span>
      Warning: You might need to run
      <span
        className="highlight"
        style={{ marginLeft: 4, /* backgroundColor: "#f1f1f1", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
      >
        yarn run deploy
      </span>{" "}
      <i>again</i> after the frontend comes up!
    </div>
  </div>
);

const isQueryable = fn => (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;

export default function Contract({
  customContract,
  account,
  gasPrice,
  signer,
  provider,
  name,
  show,
  price,
  blockExplorer,
  chainId,
  contractConfig,
}) {
  const contracts = useContractLoader(provider, contractConfig, chainId);
  let contract;
  if (!customContract) {
    contract = contracts ? contracts[name] : "";
  } else {
    contract = customContract;
  }

  const address = contract ? contract.address : "";
  const contractIsDeployed = useContractExistsAtAddress(provider, address);

  const displayedContractFunctions = useMemo(() => {
    const results = contract
      ? Object.entries(contract.interface.functions).filter(
          fn => fn[1]["type"] === "function" && !(show && show.indexOf(fn[1]["name"]) < 0),
        )
      : [];
    return results;
  }, [contract, show]);

  const alarmContractFunction = displayedContractFunctions.filter(con => con[0] === 'setAlarm(uint256)')

  const [refreshRequired, triggerRefresh] = useState(false);

  return (
    <div style={{ margin: "auto", width: "70vw" }}>
      <Card
        size="large"
        style={{ marginTop: 25, width: "100%" }}
      >
        <h1>Set an alarm to get started!</h1>
        <div style={{maxWidth: '50%', margin: '0 auto'}}>
          <SetAlarm 
          contractFunction={contract?.connect(signer)[alarmContractFunction[0][0]]}
          provider={provider}
          gasPrice={gasPrice}
          />
        </div>
      </Card>
    </div>
  );
}
