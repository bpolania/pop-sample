// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFT is ERC721, PullPayment, Ownable {
  using Counters for Counters.Counter;

  uint256 public constant TOTAL_SUPPLY = 10;

  Counters.Counter private currentTokenId;

  /// @dev Base token URI used as a prefix by tokenURI().
  string public baseTokenURI;
  
  constructor() ERC721("POP", "NFT") {
    baseTokenURI = "ipfs://QmW38Qb4mUpP5c3fHvm6oNq94dqH3zvkTpdW48ZKgoXRtN";
  }

  function mintTo(address recipient) public payable returns (uint256) {
    uint256 newItemId = 0;
    currentTokenId.increment();
    newItemId = currentTokenId.current();
    _safeMint(recipient, newItemId); 
    return newItemId;
  }

  function totalSupply() external pure returns (uint256) {
      return TOTAL_SUPPLY;
  }

  /// @dev Sets the base token URI prefix.
  function setBaseTokenURI(string memory _baseTokenURI) public onlyOwner {
    baseTokenURI = _baseTokenURI;
  }

  /// @dev Returns an URI for a given token ID
  function _baseURI() internal view virtual override returns (string memory) {
    return baseTokenURI;
  }

  
}