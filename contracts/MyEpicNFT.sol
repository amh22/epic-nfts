// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

// We need some util functions for strings.
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

// We need to import the helper functions
import { Base64 } from "./libraries/Base64.sol";

contract MyEpicNFT is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  uint256 public totalMinted = 0;
  uint256 public totalSupply = 50;

  // This is our SVG code. All we need to change is the word that's displayed. Everything else stays the same.
  // So, we make a baseSvg variable here that all our NFTs can use.
  // string baseSvg = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

  // We split the SVG at the part where it asks for the background color.
  string svgPartOne = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='";
  string svgPartTwo = "'/><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

  // I create three arrays, each with their own theme of random words.
  // Pick some random funny words, names of anime characters, foods you like, whatever!
  string[] firstWords = ["Epic", "Super", "Stupendous", "Astounding", "Awesome", "Remarkable", "Extraordinary", "Astonishing", "Mint", "Rad", "Mint", "Cool", "Electrifying", "Yo", "Yada"];
  string[] secondWords = ["Hoochie", "Low", "Man", "Moops", "Domain", "Schmoopie", "Serenity", "Shrinkage", "Jimmy", "Urban", "Yada", "Yo", "Mandarin", "Double", "Festivus"];
  string[] thirdWords = ["Mama", "Talker", "Hands", "Bro", "Master", "Soup", "Now", "Newman", "Cosmo", "Switcheroo", "Sombrero", "Yada", "Ma", "Cartwright", "Dipper"];

  // Get fancy with it! Declare a bunch of colors.
  string[] colors = ["#ee22cc", "#aa3377", "#442222", "#66bbbb", "#99bb11", "#4499cc", "#11eeff"];

  // MAGICAL EVENTS!
  event NewEpicNFTMinted(address sender, uint256 tokenId);

  constructor() ERC721 ("MINfTYs", "MINfTY") {
    console.log("I've got an answering machine that'll talk to you. Woah!");
  }

  // I create a function to randomly pick a word from each array.
  function pickRandomFirstWord(uint256 tokenId) public view returns (string memory) {
    // I seed the random generator. More on this in the lesson.
    uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));
    // Squash the # between 0 and the length of the array to avoid going out of bounds.
    rand = rand % firstWords.length;
    return firstWords[rand];
  }

  function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
    rand = rand % secondWords.length;
    return secondWords[rand];
  }

  function pickRandomThirdWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
    rand = rand % thirdWords.length;
    return thirdWords[rand];
  }

  // Pick a random color.
  function pickRandomColor(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("COLOR", Strings.toString(tokenId))));
    rand = rand % colors.length;
    return colors[rand];
  }

  function random(string memory input) internal pure returns (uint256) {
      return uint256(keccak256(abi.encodePacked(input)));
  }

  function makeAnEpicNFT() public {
    uint256 newItemId = _tokenIds.current();

    require(newItemId < totalSupply, "Sorry, sold out.");

    totalMinted = totalMinted + 1;

    // We go and randomly grab one word from each of the three arrays.
    string memory first = pickRandomFirstWord(newItemId);
    string memory second = pickRandomSecondWord(newItemId);
    string memory third = pickRandomThirdWord(newItemId);
    string memory combinedWord = string(abi.encodePacked(first, second, third));

    // Add the random color in.
    string memory randomColor = pickRandomColor(newItemId);

    // I concatenate it all together, and then close the <text> and <svg> tags.
    // string memory finalSvg = string(abi.encodePacked(baseSvg, combinedWord, "</text></svg>"));
    string memory finalSvg = string(abi.encodePacked(svgPartOne, randomColor, svgPartTwo, combinedWord, "</text></svg>"));
    // console.log("\n--------------------");
    // console.log(finalSvg);
    // console.log("--------------------\n");

     // Get all the JSON metadata in place and base64 encode it.
    string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                    '{"name": "',
                    // We set the title of our NFT as the generated word.
                    combinedWord,
                    '", "description": "A highly acclaimed collection of MINfTY squares.", "image": "data:image/svg+xml;base64,',
                    // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                    Base64.encode(bytes(finalSvg)),
                    '"}'
                )
            )
        )
    );

    // Just like before, we prepend data:application/json;base64, to our data.
    string memory finalTokenUri = string(
        abi.encodePacked("data:application/json;base64,", json)
    );

    console.log("\n--------------------");
    console.log(finalTokenUri);
    console.log("--------------------\n");

    _safeMint(msg.sender, newItemId);

     // Update your URI!!!
    _setTokenURI(newItemId, finalTokenUri);

    _tokenIds.increment();
    console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);

    // EMIT MAGICAL EVENTS
    // Send address and item ID are only local variables so we need to 'emit' them
    // i.e. we can call them in our frontend
    emit NewEpicNFTMinted(msg.sender, newItemId);
  }
}