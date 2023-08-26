import React, { useContext } from "react";
import cn from "classnames";
import styles from "./Table.module.sass";
import { Link } from "react-router-dom";

import { CloudContext } from "../../../context/CloudContext";

import { shortenAddress } from "../../../utils/shortenAddress.jsx";

const Table = ({ className, items, receive }) => {
  const { receivingTxns, sendingTxns } = useContext(CloudContext);

  console.log("State txs: ", receivingTxns);

  return (
    <div className={cn(className, styles.table)}>
      <div className={styles.row}>
        <div className={styles.col}>
          <div className="sorting">Type</div>
        </div>
        <div className={styles.col}>
          <div className="sorting">Coin</div>
        </div>
        <div className={styles.col}>
          <div className="sorting">Amount</div>
        </div>
        <div className={styles.col}>
          <div className="sorting">Address</div>
        </div>
        <div className={styles.col}>
          <div className="sorting">Chain</div>
        </div>
        <div className={styles.col}>Date</div>
      </div>

      {items.map((x, index) => (
        <div className={styles.row} key={index} to={x.url}>
          <div className={styles.col}>
            {x.withdrew && (
              <div className={cn("category-blue", styles.category)}>
                {receive && receivingTxns[0] && receivingTxns[0].status}
                {receive || (sendingTxns[0] && sendingTxns[0].status)}
              </div>
            )}
            {x.deposited && (
              <div className={cn("category-green", styles.category)}>
                Confirmed
              </div>
            )}
          </div>
          <div className={styles.col}>
            <div className={styles.item}>
              <div className={styles.icon}>
                <img src={x.image} alt="Coin" />
              </div>
              <div className={styles.currency}>{x.currency}</div>
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.label}>Amount</div>
            {receive && receivingTxns[0] && receivingTxns[0].amount}
            {receive || (sendingTxns[0] && sendingTxns[0].amount)}
          </div>
          <div className={styles.col}>
            <div className={styles.label}>Address</div>
            {receive &&
              receivingTxns[0] &&
              shortenAddress(receivingTxns[0].sender)}
            {receive ||
              (sendingTxns[0] && shortenAddress(sendingTxns[0].receiver))}
          </div>
          <div className={styles.col}>
            <div className={styles.label}>Transaction ID</div>
            {receive && receivingTxns[0] && receivingTxns[0].chain}
            {receive || (sendingTxns[0] && sendingTxns[0].chain)}
          </div>
          <div className={styles.col}>
            <div className={styles.label}>Date</div>
            {receive && receivingTxns[0] && receivingTxns[0].startTime}
            {receive || (sendingTxns[0] && sendingTxns[0].startTime)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Table;
