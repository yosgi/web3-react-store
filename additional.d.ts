
declare global {
    interface Window {
        ethereum: any;
        web3: any;
        myProperty: any;
        provider: any;
    }
}
interface Window {
    ethereum: any;
    web3: any;
    myProperty: any;
}
interface Account {
    address: string;
    balance: BigNumber;
}