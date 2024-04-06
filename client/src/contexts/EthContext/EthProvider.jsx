import React, { useReducer, useCallback, useEffect, useState } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

function EthProvider({ children }) {
  const [itemManagerState, itemManagerDispatch] = useReducer(reducer, initialState);
  const [itemState, itemDispatch] = useReducer(reducer, initialState);
  const [inputItem, setInputItem] = useState({ cost: 0, id: "Example_1", address: "", index: 0 });
  const [load, setLoad] = useState(false);

  const init = useCallback(
    async (artifact, cont) => {
      if (artifact) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        const { abi } = artifact;
        let address, contract;
        try {
          address = artifact.networks[networkID]?.address;
          contract = new web3.eth.Contract(abi, artifact.networks[networkID] && address);
        } catch (err) {
          console.error(err);
        }
        if (cont === "ItemManager") {

          itemManagerDispatch({
            type: actions.init,
            data: { artifact, web3, accounts, networkID, contract }
          });
        } else {
          itemDispatch({
            type: actions.init,
            data: { artifact, web3, accounts, networkID, contract }
          });
        }

      }
    }, []);

  useEffect(() => {

    const tryInit = async () => {
      try {
        const artifactItemManager = require("../../contracts/ItemManager.json");
        const artifactItem = require("../../contracts/Item.json");
        await init(artifactItemManager, "ItemManager");
        await init(artifactItem, "Item");


      } catch (err) {
        console.error(err);
      }
    };

    tryInit();

    setLoad(true);
  }, [init,]);
  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(itemState.artifact, "Item");
      init(itemManagerState.artifact, "ItemManager");

    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, itemState.artifact, itemManagerState.artifact]);
  // This useEffect hook is dedicated to setting up the event listener
  useEffect(() => {
    // Ensure the contract is initialized before setting up the listener
    if (itemManagerState.contract) {
      const { contract } = itemManagerState;

      const eventSubscription = contract.events.DeliverySteps()
        .on("data", function (event) {
          console.log(event);
          // Handle the event data here
        })
        .on("error", console.error);

      // Cleanup subscription when the component unmounts or if the contract instance changes
      return () => eventSubscription.unsubscribe();
    }
  }, [itemManagerState.contract]);

  const handleChange = (event) => {
    const target = event.target;
    const val = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    setInputItem({ ...inputItem, [name]: val });



  }

  const handleSubmit = async (event) => {
    const { accounts, contract } = itemManagerState;
    console.log(accounts[0]);
    let result = await contract.methods.createItem(inputItem.id, inputItem.cost).send({ from: accounts[0] });
    console.log(result)
    alert("Send " + inputItem.cost + " Wei to " + result.events.DeliverySteps.returnValues.itemAddress)
    setInputItem({
      ...inputItem,
      index: result.events.DeliverySteps.returnValues.itemIndex,
      address: result.events.DeliverySteps.returnValues.itemAddress
    })

  }
  const handleDelivery = async (event) => {
    const { accounts, contract } = itemManagerState;
    console.log(accounts[0]);
    let result = await contract.methods.triggerDelivery(inputItem.index).send({ from: accounts[0] });
    console.log(result)
    alert("Item " + inputItem.address + " delivered.")


  }
  const handleSubmitPayment = async (event) => {
    const { accounts, web3 } = itemManagerState;

    console.log(accounts);
    let result = await web3.eth.sendTransaction({ to: inputItem.address, value: inputItem.cost, from: accounts[1], gas: 300000 });
    console.log(result);
    alert("Item " + inputItem.address + " ready for delivery.")


  }


  return (
    <>
      {

        load ? (<div className="App">
          <h1>Event trigger / Supply CHAIN EXMAPLE</h1>
          <h2>Items Create</h2>
          <h2>Add Items</h2>
          <p>Cost(wei):<input type="text" name="cost" value={inputItem.cost} onChange={handleChange}></input>
          </p>
          <p>ID: <input type="text" name="id" value={inputItem.id} onChange={handleChange}></input> </p>
          <button type="button" onClick={handleSubmit}>Create Item</button>

          <br />
          <br />
          <h2>Items Payment</h2>
          <p>Address:<input width={"200px"} type="text" name="address" value={inputItem.address} onChange={handleChange}></input>
          </p>

          <button type="button" onClick={handleSubmitPayment}>Pay for Item</button>
          <br />
          <button type="button" onClick={handleDelivery}>Deliver Item</button>
        </div>) : (


          <div></div>

        )
      }
    </>

    // <EthContext.Provider value={{
    //   state,
    //   dispatch
    // }}>
    //   {children}
    // </EthContext.Provider>
  );
}

export default EthProvider;
