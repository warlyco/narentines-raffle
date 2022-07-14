import { useEffect, useState } from "react";
// pages/client-side.js

import Head from "next/head";
import styles from "../styles/Home.module.css";
import ClientOnly from "features/client-only";
import RaffleItemList from "features/raffle-item-list";

export default function ClientSide() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>RAFFLE</h1>
        <ClientOnly>
          <RaffleItemList />
        </ClientOnly>
      </main>
    </div>
  );
}
