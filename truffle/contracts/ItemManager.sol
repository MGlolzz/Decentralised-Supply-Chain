pragma solidity ^0.6.0;

import "./Item.sol";
import "./Ownable.sol";

contract ItemManager is Ownable{
    enum DeliveryStatus{Created,Paid,Delivered}

    struct ItemStruct{
        ItemManager.DeliveryStatus status;
        string id;
        uint priceInWei;
        Item item;
    }

    mapping(uint => ItemStruct) public items;
    uint index;

    event DeliverySteps(uint itemIndex,uint status,address itemAddress);

    function createItem(string memory id,uint priceInWei)public onlyOwner{
        Item item = new Item(this,index,priceInWei);
        items[index].item = item;
        items[index].priceInWei = priceInWei;
        items[index].id = id;
        items[index].status = DeliveryStatus.Created;
        emit DeliverySteps(index,uint(items[index].status),address(item));
        index++;
    }

    function triggerPayment(uint _index) public payable {
        
        require(msg.value == items[_index].priceInWei,"Only full payment is accepter");

        require(items[_index].status == DeliveryStatus.Created,"Item is not in CREATED status");
        items[_index].status = DeliveryStatus.Paid;
        emit DeliverySteps(_index,uint(items[_index].status),address(items[_index].item));
    }

    function triggerDelivery (uint _index) public onlyOwner{
        require(items[_index].status == DeliveryStatus.Paid,"Item is not in PAID status");
        
        items[_index].status = DeliveryStatus.Delivered;

        emit DeliverySteps(_index,uint(items[_index].status),address(items[_index].item));

    }

}