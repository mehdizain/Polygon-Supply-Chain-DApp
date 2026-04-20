// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract YourName_SupplyChain {
    address public owner;
    string public developerName = "Your Name";

    enum Role { None, Manufacturer, Distributor, Retailer, Customer }
    enum Status { Manufactured, InTransit, Delivered }

    struct Product {
        uint256 id;
        string name;
        string description;
        address currentOwner;
        Status status;
        uint256 timestamp;
    }

    struct HistoryEntry {
        address from;
        address to;
        Status status;
        uint256 timestamp;
    }

    mapping(address => Role) public roles;
    mapping(uint256 => Product) public products;
    mapping(uint256 => HistoryEntry[]) public productHistory;
    uint256 public productCount;

    event RoleAssigned(address indexed account, Role role);
    event ProductRegistered(uint256 indexed productId, string name, address manufacturer);
    event OwnershipTransferred(uint256 indexed productId, address from, address to, Status newStatus);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }
    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Unauthorized role");
        _;
    }

    constructor() {
        owner = msg.sender;
        roles[msg.sender] = Role.Manufacturer;
    }

    function assignRole(address _account, Role _role) external onlyOwner {
        roles[_account] = _role;
        emit RoleAssigned(_account, _role);
    }

    function registerProduct(string calldata _name, string calldata _description)
        external onlyRole(Role.Manufacturer)
    {
        productCount++;
        products[productCount] = Product({
            id: productCount,
            name: _name,
            description: _description,
            currentOwner: msg.sender,
            status: Status.Manufactured,
            timestamp: block.timestamp
        });
        productHistory[productCount].push(HistoryEntry({
            from: address(0),
            to: msg.sender,
            status: Status.Manufactured,
            timestamp: block.timestamp
        }));
        emit ProductRegistered(productCount, _name, msg.sender);
    }

    function transferToDistributor(uint256 _productId, address _distributor)
        external onlyRole(Role.Manufacturer)
    {
        require(roles[_distributor] == Role.Distributor, "Target must be Distributor");
        _transfer(_productId, _distributor, Status.InTransit);
    }

    function transferToRetailer(uint256 _productId, address _retailer)
        external onlyRole(Role.Distributor)
    {
        require(roles[_retailer] == Role.Retailer, "Target must be Retailer");
        _transfer(_productId, _retailer, Status.InTransit);
    }

    function transferToCustomer(uint256 _productId, address _customer)
        external onlyRole(Role.Retailer)
    {
        require(roles[_customer] == Role.Customer, "Target must be Customer");
        _transfer(_productId, _customer, Status.Delivered);
    }

    function _transfer(uint256 _productId, address _to, Status _status) internal {
        Product storage p = products[_productId];
        require(p.currentOwner == msg.sender, "Not current owner");
        address from = p.currentOwner;
        p.currentOwner = _to;
        p.status = _status;
        p.timestamp = block.timestamp;
        productHistory[_productId].push(HistoryEntry({
            from: from,
            to: _to,
            status: _status,
            timestamp: block.timestamp
        }));
        emit OwnershipTransferred(_productId, from, _to, _status);
    }

    function getProduct(uint256 _productId) external view returns (Product memory) {
        return products[_productId];
    }

    function getHistory(uint256 _productId) external view returns (HistoryEntry[] memory) {
        return productHistory[_productId];
    }

    function getMyRole() external view returns (Role) {
        return roles[msg.sender];
    }
}