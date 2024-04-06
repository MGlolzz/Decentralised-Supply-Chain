pragma solidity ^0.6.0;

import "./ItemManager.sol";
contract Item{
    uint public index;
    uint public priceInWei;
    uint public paidWei;

    ItemManager parentContract;
    constructor(ItemManager _parentContract,uint _index, uint _priceInWei)public{
        index = _index;
        priceInWei = _priceInWei;
        parentContract = _parentContract;
    }

    receive() external payable{
        //less gas can be transferred along
        // address(parentContract).transfer()

        //use low level function ,caveat:no error throw 

        require(msg.value == priceInWei,"Only full payment allowed");
        require(paidWei == 0,"Item is paid");

        (bool success,) = address(parentContract).call.value(msg.value)(abi.encodeWithSignature("triggerPayment(uint256)",index));
        
        require(success == true,"Transaction is not successful");
        paidWei+=msg.value;
        

    }

    fallback () external{

    }


}