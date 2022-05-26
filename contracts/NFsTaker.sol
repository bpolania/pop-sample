// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

/// @author Boris Polania
/// @title A simple NFT Staking Contract

import "./interfaces/IERC20.sol";
import "./interfaces/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract NFsTaker is AccessControlUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, IERC721Receiver {

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    address public popToken;
    address public popNft;
    address[] public nftAddresses;
    
    mapping(address => uint64) nfts;
    mapping(address =>  mapping(address => uint64)) stakers;
    mapping(address =>  mapping(address => uint64[])) staked;
    mapping(address => address[]) stakedNftAddresses;
    
    PoPToken internal pop;
    IERC721 internal nft;

    event Funding(address indexed _from, uint256 _amount);
    event Transfer(address indexed _from, uint64 _tokenId);
    event Staked(address indexed _from, uint64 _tokenId);
    event Unstaked(address indexed _from, uint64 _tokenId);
    event OperatorRoleSet(address indexed _to);
    event Approved(uint256 _amount);

    modifier onlyOperator() {
        require(
            hasRole(OPERATOR_ROLE, msg.sender),
            "Caller is not an Operator"
        );
        _;
    }

    function initialize() external initializer {
        __NFsTaker_init();
    }
    
    /** 
     * Initializer for upgradeable contract
     * @dev initialize the ERC-20 token
     */
    function __NFsTaker_init() internal onlyInitializing {
        __Ownable_init();
    }

    /**
     * @dev IERC721Receiver method
     * @dev Always returns `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /** 
     * Set the address of the ERC-20 token and instanstiate the contract
     * @param _erc20 the address of the ERC-20 token contract
     */
    function setPopToken(address _erc20) external nonReentrant {
        popToken = _erc20;
        pop = PoPToken(popToken);
    }

    /** 
     * Receives an ERC_721 token and returns a number of ERC-20 tokens
     * @param _nft the address of the ERC-721 token contract
     * @param _tokenId the id of the token being staked
     * @dev emits a `Staked` event, and updates the `stakers` map
     */
    function stake(address _nft, uint64 _tokenId) external nonReentrant {
        uint64 stakeAmount = nfts[_nft];
        address staker = msg.sender;
        nft = IERC721(_nft);
        require(stakeAmount != 0, 'This NFT is not stakeable');
        require(staker == nft.ownerOf(_tokenId), 'The sender does not own this NFT');
        approveAndTransfer(staker, address(this), _nft, _tokenId);
        pop.mint(staker, stakeAmount);
        stakers[staker][_nft] =  stakeAmount;
        staked[staker][_nft].push(_tokenId);
        stakedNftAddresses[staker].push(_nft);
        emit Staked(staker, stakeAmount);
    }

    /** 
     * Receives a ERC_20 tokens and returns an ERC-721 token
     * @param _nft the address of the ERC-721 token contract
     * @param _tokenId the id of the token being staked
     * @param _amount the amount of tokens sent to unstake
     * @dev emits a `Unstaked` event, and updates the `stakers` map
     */
    function unstake(address _nft, uint64 _tokenId, uint256 _amount) external nonReentrant {
        address staker = msg.sender;
        uint64 stakeAmount = stakers[staker][_nft];
        require(stakeAmount == _amount, 'Stake amount does not match');
        require(address(this) == nft.ownerOf(_tokenId), 'We do not own this NFT');
        pop.burnFrom(msg.sender, _amount);
        approveAndTransfer(address(this), staker, _nft, _tokenId);
        stakers[staker][_nft] = 0;
        removeNft(staker, _nft);
        removeId(staker, _nft);
        emit Unstaked(staker, stakeAmount);
    }

    /** 
     * Adds an ERC-721 to the list of approved tokens and set a staking amount
     * @param _nft the address of the ERC-721 token contract
     * @param _amount the amount of tokens that must be sent to stake this ERC-721 token
     * @dev only addresses using the operator role can call this function
     */
    function addNFT(address _nft, uint64 _amount) external nonReentrant onlyOperator {
        nfts[_nft] = _amount;
        nftAddresses.push(_nft);
    }

    /** 
     * Gets a list of all NFTs
     * @return address[] the list of NFTS
     */
    function getAllNftsAddresses() external view returns(address[] memory) {
        return nftAddresses;
    }

    /** 
     * Gets a list of NFTs staked by an account
     * @param account the address of the account
     * @return address[] the list of NFTS
     */
    function getNftsAddressesOf(address account) external view returns(address[] memory) {
        return stakedNftAddresses[account];
    }

    /** 
     * Gets the staking amount of an NFT
     * @param _nft the address of the ERC-721 token contract
     * @return address[] the list of NFTS
     */
    function getStakingAmountOf(address _nft) external view returns(uint256) {
        return nfts[_nft];
    }

    /** 
     * Gets the ids of the NFTs staked by an account 
     * @param _staker the address of the staker 
     * @param _nft the address of the ERC-721 token contract
     * @return uint256[] a list of ids
     */
    function getStakedIds(address _staker, address _nft) external view returns(uint64[] memory) {
        return staked[_staker][_nft];
    }

    /** 
     * Verifies is an address has been assigned the operator role
     * @param _operator the address that is cheked for the operator role
     * @dev only the owner of the contract can call this function
     * @dev emits a `OperatorRoleSet` event
     */
    function setOperatorRole(address _operator) external onlyOwner {
        _setupRole(OPERATOR_ROLE, _operator);
        emit OperatorRoleSet(_operator);
    }
    
    /** 
     * Verifies is an address has been assigned the operator role
     * @param _account the address that is cheked for the operator role
     * @return bool has the address been assigned the operator role?
     */
    function isOperator(address _account) external view returns (bool) {
        return hasRole(OPERATOR_ROLE, _account);
    }

    /** 
     * Returns the address of the ERC20 PoP token
     * @return address the ERC20 PoP token address
     */
    function tokenAddress() external view returns (address) {
        return popToken;
    }

    /** 
     * Approve and transfer transfer ERC-721 tokens between twp addresses
     * @param _from the address providing the tokens
     * @param _to the address receiving the tokens
     * @param _nft the address of the ERC-721 token contract
     * @param _tokenId the id of the token being transferred
     * @dev emits a `Transfer` event
     */
    function approveAndTransfer(
        address _from, 
        address _to, 
        address _nft, 
        uint64 _tokenId
    ) 
        internal 
    {
        nft = IERC721(_nft);
        nft.safeTransferFrom(_from, _to, _tokenId);
        emit Transfer(_from, _tokenId);
    }

    function removeNft(address staker, address stakedNft) internal {
        uint256 index = 0;
        address[] storage stakedNfts = stakedNftAddresses[staker];

        for(uint i=0; i<stakedNfts.length; i++){
            if (stakedNfts[i] == stakedNft) {
                index = i;
            }
        }
        stakedNfts[index] = stakedNfts[stakedNfts.length - 1];
        stakedNfts.pop();
    }

    function removeId(address staker, address stakedNft) internal {
        uint64[] storage ids = staked[staker][stakedNft];
        ids.pop();
    }
}