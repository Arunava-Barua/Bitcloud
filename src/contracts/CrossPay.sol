// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// CONTRACT_ADDRESS - 0xcA82A7B87De5EAf45305422aF17Da0A092584cda Polygon
// CONTRACT_ADDRESS - 0xEC6C1001a15c48D4Ea2C7CD7C45a1c5b6aD120E9 FTM
// Polygon ---> FTM

import "@openzeppelin/contracts/utils/Counters.sol";

import { IAxelarGateway } from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";


import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract CrossPay is VRFConsumerBaseV2, ConfirmedOwner, AxelarExecutable {
    address public admin;
    IAxelarGasService public immutable gasService;

    uint256[] public verificationCodes;

    // event - initiated, waiting for acceptance, waiting for approval, confirmed

    event TxInitiated(address sender, address receiver, uint256 amount, string chain, uint256 startTime);
    event TxAccepted(address sender, address receiver, uint256 amount, string chain);
    event TxApproved(address sender, address receiver, uint256 amount, string chain);
    event TxCompleted(address sender, address receiver, uint256 amount, string chain, uint256 endTime);

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;  // Polygon Mumbai

    uint32 callbackGasLimit = 2500000;

    uint16 requestConfirmations = 3;

    uint32 numWords = 1;

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }

    mapping(uint256 => RequestStatus) public s_requests; /* requestId --> requestStatus */
    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 s_subscriptionId;

    // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    // IAxelarGateway public immutable gateway;
    IERC20 public immutable token;

    using Counters for Counters.Counter;
    Counters.Counter private _transactionIdCounter;

    receive() payable external{}

    // 0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B, 0x2c852e740B62308c46DD29B982FBb650D063Bd07, 5768, 0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6 - Polygon
    // 0x97837985Ec0494E7b9C71f5D3f9250188477ae14, 0x75Cc4fDf1ee3E781C1A3Ee9151D5c6Ce34Cf5C61, 5768, 0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6 - FTM
    constructor(address _gateway, address _token, uint64 subscriptionId, address _gasService) 
        AxelarExecutable(_gateway) VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
        ConfirmedOwner(msg.sender) 
    {
        admin = msg.sender;

        gasService = IAxelarGasService(_gasService);
        // gateway = IAxelarGateway(0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B); // 0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B Polygon
        token = IERC20(_token); // 0x2c852e740B62308c46DD29B982FBb650D063Bd07 Polygon

        COORDINATOR = VRFCoordinatorV2Interface(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed); // Polygon Mumbai
        s_subscriptionId = subscriptionId;
    }

    modifier onlyAdmin(address _user) {
        require(_user == admin, "Not authorized!");
        _;
    }

    struct Transaction {
        uint256 transactionId;
        uint256 verficationId;
        address sender;
        address receiver;
        string receiverStr;
        uint256 amount;
        string chain;
        string status; // "Waiting for acceptance", "Waiting for approval", "Completed", "Cancelled"
        uint256 startTime;
        uint256 endTime; 
    }
    Transaction[] public transactions;

    mapping(uint256 => Transaction) public transactionById;
    mapping(address => Transaction[]) public allMyTransactions;
    mapping(address => Transaction[]) public senderTransactions;
    mapping(address => Transaction[]) public receiverTransactions;


    function balance(address _user) onlyAdmin(_user) public view returns(uint256) { // working
        return address(this).balance;
    }

    function withdraw(address _user, uint256 _txId) onlyAdmin(_user) payable public { // working
        require(transactionById[_txId].amount > 0, "Not enough token balance");

        uint256 _amount = transactionById[_txId].amount;
        token.transfer(_user, _amount);
    }

    function send(address _sender, uint256 _amount, address receiver,  string memory _receiver, string memory _chain) public payable { // call after transferring token to this contract
        uint256 amount = _amount * 10 ** 6;
        
        token.approve(address(gateway), amount);

        gateway.sendToken(
            // Ethereum Goerli, BNB Chain, Polygon, Avalanche, Fantom, Moonbase, Celo, Arbitrum, Optimism, Base, Linea, Polygon zkEVM, Filecoin, Kava
            _chain, 
            _receiver,
            "aUSDC",
            amount
        );

        emit TxCompleted(_sender, receiver, _amount, _chain, block.timestamp);
    }

    // STEP-3
    function executePayment(address _sender, address _receiver, uint256 _amount, string memory _chain, string memory _receiverStr) public payable {
        uint256 _transactionId = _transactionIdCounter.current();
        uint256 _endTime = block.timestamp + 30 minutes;

        uint256 _verficationId = verificationCodes[verificationCodes.length - 1];

        Transaction memory newTransaction = Transaction(_transactionId, _verficationId, _sender, _receiver, _receiverStr, _amount, _chain, "Waiting for acceptance", block.timestamp, _endTime);

        transactions.push(newTransaction);
        transactionById[_transactionId] = newTransaction; // Transaction by ID

        allMyTransactions[_sender].push(newTransaction);
        allMyTransactions[_receiver].push(newTransaction);

        senderTransactions[_sender].push(newTransaction); // Sender list
        receiverTransactions[_receiver].push(newTransaction);  // Receiver list

        _transactionIdCounter.increment();

        emit TxInitiated(_sender, _receiver, _amount, _chain, block.timestamp);
    }

    function cancelPayment(address _sender, uint256 _transactionId) public payable {
        require(transactionById[_transactionId].sender == _sender, "You are not the sender!");

        transactionById[_transactionId].status = "Cancelled";

        uint256 _amount = transactionById[_transactionId].amount;
        token.transfer(_sender, _amount);
    }

    function acceptIncomingPayment(address _receiver, uint256 _transactionId, uint256 _verifyPin) public payable {
        require(transactionById[_transactionId].receiver == _receiver, "You are not the receiver!");
        require(transactionById[_transactionId].endTime >= block.timestamp, "You are out of time");
        require(transactionById[_transactionId].verficationId == _verifyPin, "Wrong Pin!");

        bool verifyStatus = keccak256(abi.encode(transactionById[_transactionId].status)) == keccak256(abi.encode("Waiting for acceptance"));
        require(verifyStatus == true, "Status not accepting!");

        transactionById[_transactionId].status = "Waiting for approval";

        emit TxAccepted(transactionById[_transactionId].sender, transactionById[_transactionId].receiver, transactionById[_transactionId].amount, transactionById[_transactionId].chain);
    }

    function approveOutgoingPayment(address _sender, uint256 _transactionId) public payable {
        Transaction memory tempTransaction = transactionById[_transactionId];

        require(tempTransaction.sender == _sender, "You are not the sender!");

        bool verifyStatus = keccak256(abi.encode(tempTransaction.status)) == keccak256(abi.encode("Waiting for approval"));
        require(verifyStatus == true, "Status not for approval!");

        transactionById[_transactionId].status = "Completed";

        send(_sender, tempTransaction.amount, tempTransaction.receiver, tempTransaction.receiverStr, tempTransaction.chain); // 1v1 Tx

        emit TxApproved(transactionById[_transactionId].sender, transactionById[_transactionId].receiver, transactionById[_transactionId].amount, transactionById[_transactionId].chain);
    }


    function getSendingPayments(address _sender) public view returns(Transaction[] memory) {
        Transaction[] memory items = new Transaction[](senderTransactions[_sender].length);

        for(uint256 i = 0; i < senderTransactions[_sender].length; i++) {
            items[i] = transactionById[senderTransactions[_sender][i].transactionId]; // wrong
        }        

        return items;
    }

    function getReceivingPayments(address _receiver) public view returns(Transaction[] memory) {
        Transaction[] memory items = new Transaction[](receiverTransactions[_receiver].length);

        for(uint256 i = 0; i < receiverTransactions[_receiver].length; i++) {
            items[i] = transactionById[receiverTransactions[_receiver][i].transactionId]; // wrong
        }        

        return items;
    }

    // Assumes the subscription is funded sufficiently. STEP-1 
    function requestRandomWords()
        external
        returns (uint256 requestId)
    {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);

        return requestId;
    }

    // STEP-2
    function fulfillRandomWords( // Call Send token here
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;

        // Update Verification codes
        verificationCodes.push(_randomWords[0]);

        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];

        return (request.fulfilled, request.randomWords);
    }

    
    function sendToMany(  // For multi transfer
        string calldata destinationChain,
        string calldata destinationAddress, // address of contract in other chain
        address[] calldata walletAddresses, // array
        string calldata symbol,
        uint256 amount,
        address sender
    ) external payable {
        address tokenAddress = gateway.tokenAddresses(symbol);
        // IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        IERC20(tokenAddress).approve(address(gateway), amount);
        bytes memory payload = abi.encode(walletAddresses);

        if (msg.value > 0) {
            gasService.payNativeGasForContractCallWithToken{value: msg.value} (
                address(this),
                destinationChain,
                destinationAddress,
                payload,
                symbol,
                amount,
                sender
            );
        }

        gateway.callContractWithToken(destinationChain, destinationAddress, payload, symbol, amount);
    }

    function _executeWithToken(
        string calldata sourceChain, 
        string calldata sourceAddress, 
        bytes calldata payload, 
        string calldata tokenSymbol, 
        uint256 amount
        ) internal override {

        address[] memory recipients = abi.decode(payload, (address[]));
        address tokenAddress = gateway.tokenAddresses(tokenSymbol);

        uint256 sentAmount = amount / recipients.length;

        for (uint256 i = 0; i < recipients.length; i++) {
            IERC20(tokenAddress).transfer(recipients[i], sentAmount); 
        }
    }
}


