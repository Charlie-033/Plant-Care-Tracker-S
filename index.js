const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 8cmIeHFeopGT7SVc
// Plant-Care-Tracker

const uri = "mongodb+srv://Plant-Care-Tracker:8cmIeHFeopGT7SVc@cluster001.bmpze7a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster001";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Plant Care Tracker Server!")
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})