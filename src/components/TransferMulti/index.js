import React, { useState, useContext } from "react";
import cn from "classnames";
import styles from "./Transfer.module.sass";
import Icon from "../Icon";
import TextInput from "../TextInput";
import Dropdown from "../Dropdown";

import { CloudContext } from "../../context/CloudContext";


const fromDirectionOptions = ["Margin", "Fiat and Spot"];
const toDirectionOptions = [
  "Ethereum Goerli",
  "BNB Chain",
  "Polygon",
  "Avalanche",
  "Fantom",
  "Moonbase",
  "Celo",
  "Arbitrum",
  "Optimism",
  "Base",
  "Linea",
  "Polygon zkEVM",
  "Filecoin",
  "Kava",
];
const coinOptions = [
  "aUSDC",
  "WAXL",
  "axl-wstETH",
  "CELO",
  "axlWETH",
  "WMATIC",
  "WAVAX",
  "WFTM",
  "WBNB",
  "WDEV",
];

const TransferMulti = () => {
  const [fromDirection, setFromDirection] = useState(fromDirectionOptions[0]);
  const [toDirection, setToDirection] = useState(toDirectionOptions[0]);
  const [coin, setCoin] = useState(coinOptions[0]);

  const {
    accountBalance
  } = useContext(CloudContext);

  return (
    <div className={styles.transfer}>
      <div className={cn("h4", styles.title)}>
        <Icon name='arrow-left' size='32' />
        Multi-Transfer
      </div>
      <div className={styles.wrap}>
        <div className={styles.category}>
          Available <br></br>balance
        </div>
        <div className={styles.details}>
          <div className={styles.currency}>{accountBalance} aUSDC</div>
          {/* <div className={styles.price}>$10,095.35</div> */}
        </div>
      </div>
      <div className={styles.field}>
        {/* <Dropdown
          className={styles.dropdown}
          label='from'
          value={fromDirection}
          setValue={setFromDirection}
          options={fromDirectionOptions}
        /> */}
        <TextInput
          className={styles.field}
          label='Receiver Address 1 *'
          name='Address'
          type='text'
          note=''
          required
        />
        <TextInput
          className={styles.field}
          label='Receiver Address 2 *'
          name='Address'
          type='text'
          note=''
          required
        />
        <TextInput
          className={styles.field}
          label='Receiver Address 3'
          name='Address'
          type='text'
          note=''
        />
        <TextInput
          className={styles.field}
          label='Receiver Address 4'
          name='Address'
          type='text'
          note=''
        />
      </div>
      {/* <div className={styles.sign}>
        <Icon name='arrows' size='16' />
      </div> */}
      <div className={styles.field}>
        <Dropdown
          className={styles.dropdown}
          label='Chain'
          value={toDirection}
          setValue={setToDirection}
          options={toDirectionOptions}
        />
      </div>
      <div className={styles.field}>
        <Dropdown
          className={styles.dropdown}
          label='coin'
          value={coin}
          setValue={setCoin}
          options={coinOptions}
        />
      </div>
      <div className={styles.box}>
        <TextInput
          className={styles.field}
          label='Amount to transfer'
          name='amount'
          type='text'
          note={`${accountBalance} aUSDC available`}
          required
        />
        <button className={cn("button-stroke button-small", styles.button)}>
          Max amount
        </button>
      </div>
      <button className={cn("button", styles.button)}>Transfer</button>
    </div>
  );
};

export default TransferMulti;
