import React, { useState } from 'react'
import { Button, Input, DatePicker } from "antd";
const { utils, BigNumber } = require("ethers");
import { Transactor } from "../../helpers";
import EtherInput from '../EtherInput'
import {ethers} from 'ethers'

export default function SetAlarm({ contractFunction, provider, gasPrice }) {
    const [alarmTime, setAlarmTime] = useState(0);
    const [alarmPrice, setAlarmPrice] = useState(0);

    const tx = Transactor(provider, gasPrice);

    return (
        <div>
            <h3>Time</h3>
            <DatePicker
                size="large"
                placeholder="Time"
                autoComplete="off"
                value={alarmTime}
                name="AlarmTime"
                onChange={date => setAlarmTime(date)}
                picker="time"
            />
            <h3 style={{marginTop: "20px"}}>Penalty</h3>
            <div
                style={{width: "200px", margin: "0 auto"}}
            >
                <EtherInput
                    price={gasPrice}
                    onChange={ethValue => setAlarmPrice(ethValue) }
                />
            </div>
           
            <Button
            style={{marginTop: "20px"}}
            size="large"
            onClick={async () => {
                const overrides = {value: ethers.utils.parseEther(alarmPrice)};
                const returned = await tx(contractFunction((alarmTime.valueOf()/1000).toFixed(0), overrides));
            }}
            >
                Set Alarm
            </Button>
        </div>
    )
}