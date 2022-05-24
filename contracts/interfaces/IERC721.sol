// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface ERC721 {
    function ownerOf(uint256 tokenId) external returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
}