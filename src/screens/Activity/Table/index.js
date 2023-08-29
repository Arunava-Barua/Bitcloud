// RECEIVING TABLE

import React, { useContext } from "react";
import cn from "classnames";
import styles from "./Table.module.sass";
import { Link } from "react-router-dom";

import { CloudContext } from "../../../context/CloudContext";

import { shortenAddress } from "../../../utils/shortenAddress.jsx";

const Table = ({ className, items }) => {
  const { receivingTxns } = useContext(CloudContext);

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

      {receivingTxns.length == 0 && (
        <div className={styles.currency}>No records found</div>
      )}
      {receivingTxns.length > 0 && receivingTxns.map((x, index) => (
        <div className={styles.row} key={index}>
          <div className={styles.col}>
            {(x.status === "Completed" || x.status === "Cancelled") ? (
              <div className={cn("category-green", styles.category)}>
                {x.status}
              </div>
            ): (
              <div className={cn("category-blue", styles.category)} style={{'cursor': 'pointer'}} onClick={() => {
                  // handleApproveTxn(x.id); // MODAL for entering verification id
                }}>
                {x.status == "Waiting for acceptance" ? "Approve" : x.status}
              </div>
            )}
          </div>
          <div className={styles.col}>
            <div className={styles.item}>
              <div className={styles.icon}>
                <img src={'/images/content/currency/usd-coin.svg'} alt="Coin" />
              </div>
              <div className={styles.currency}>{'aUSDC'}</div>
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.label}>Amount</div>
            {x.amount}
          </div>
          <div className={styles.col}>
            <div className={styles.label}>Address</div>
            {shortenAddress(x.sender)}

          </div>
          <div className={styles.col}>
            <div className={styles.label}>Transaction ID</div>
            {x.chain}
          </div>
          <div className={styles.col}>
            <div className={styles.label}>Date</div>
            {x.startTime}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Table;
