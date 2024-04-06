pragma solidity ^0.6.0;
contract Ownable{
    address payable _owner;

    constructor () public{
        _owner = msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender == _owner,"Ownable:caller is not the owner");
        _;
    }

    function isOwner() public view returns (bool){
        return (msg.sender == _owner);
    }
    
}