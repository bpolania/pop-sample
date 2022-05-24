// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
contract PoPToken is ERC20Burnable, ERC20PresetMinterPauser {

    constructor() ERC20PresetMinterPauser("PoP", "POP") {
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20PresetMinterPauser) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function setMinterRole(address account) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ERC20PresetMinterPauser: must have Admin role to mint");
        _setupRole(MINTER_ROLE, account);
    }

}