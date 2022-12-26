import { createSignClient } from 'utils/WalletConnectUtil'
import { useCallback, useEffect, useState } from 'react'
//import { createOrRestoreEIP155Wallet } from 'utils/EIP155WalletUtil'

export default function useWallet() {
    const [initialized, setInitialized] = useState(false);

    const onInitialize = useCallback(async () => {
        try {
            await createSignClient();

            setInitialized(true)
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        if (!initialized) {
          onInitialize()
        }
      }, [initialized, onInitialize])

    return initialized
}