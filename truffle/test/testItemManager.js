// const { assert } = require("assert");

const ItemManager = artifacts.require("./ItemManager.sol");
//clean room test = always start your contract from scratch
contract ("ItemManager",accounts=>{
    it("should be able to add an Item", async function(){
        const Instance = await ItemManager.deployed();
        const itemName = "test1";
        const itemPrice = 5333;

        const result = await Instance.createItem(itemName,itemPrice,{from:accounts[0]});

        // console.log(result.logs[0].args.itemIndex.toNumber()
        //     );

        assert.equal(result.logs[0].args.itemIndex.toNumber(),0,"It is not the first item");

        const item = await Instance.items(0);
        console.log(item);
        assert.equal(item.id,itemName,"The identifier is different")
    })
})