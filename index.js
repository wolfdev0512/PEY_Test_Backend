const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");

// Merkle Tree

const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

dotenv.config();

const PORT = process.env.PORT || 9000;

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));

// Temp Ethereum addresses

let addresses = [];
let merkleTree;

const setMerkle = () => {
  // Hash leaves
  let leaves = addresses.map((addr) => keccak256(addr));
  // Create tree
  merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
};

// Get Root
const getRoot = () => {
  setMerkle();
  let rootHash = merkleTree.getRoot().toString("hex");

  return rootHash;
};

// Get Proof
const getProof = (address) => {
  setMerkle();
  let hashedAddress = keccak256(address);
  let proof = merkleTree.getHexProof(hashedAddress);
  return proof;
};

app.get("/", (req, res) => {
  res.json("Hello from the NFT world!");
});

app.get("/all", (req, res) => {
  res.json({ addresses: addresses });
});

app.get("/add/:address", (req, res) => {
  if (!addresses.includes(req.params.address)) {
    addresses.push(req.params.address);
    res.json({ root: getRoot(addresses) });
  } else {
    res.json({ root: "Address already exists" });
  }
});

app.get("/get/:address", (req, res) => {
  res.json({ proof: getProof(req.params.address) });
});

app.get("/root", (req, res) => {
  res.json({ root: getRoot() });
});

app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));
