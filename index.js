const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3001;
require('dotenv').config();

app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER, process.env.DB_PASSWORD);

const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster001.bmpze7a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster001`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const plantCollection = client.db("PlantDB").collection("plants");

    // post plants
    app.post("/plants", async (req, res) => {
      const plant = req.body;
      const result = await plantCollection.insertOne(plant);
      res.send(result);
    });

    // Get recently added 6 plants
    app.get("/plants/recent", async (req, res) => {
      const cursor = plantCollection.find().sort({ _id: -1 }).limit(8);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get Sort by Watering Frequency and get all plants
    app.get("/plants", async (req, res) => {
      const sortKey = req.query.sort;
      let sortOptions = {};
      if (sortKey === "wateringFrequency") {
        sortOptions = { wateringFrequency: 1 };
        const result = await plantCollection.find().sort(sortOptions).toArray();
        res.send(result);
      } else if (sortKey === "careLevel") {
        const result = await plantCollection
          .aggregate([
            {
              $addFields: {
                careLevelOrder: {
                  $indexOfArray: [
                    ["Easy", "Moderate", "Difficult"],
                    "$careLevel",
                  ],
                },
              },
            },
            { $sort: { careLevelOrder: 1 } },
            { $project: { careLevelOrder: 0 } },
          ]).toArray();
          res.send(result);
      }
      const cursor = plantCollection.find().sort();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get single plant
    app.get("/plants/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantCollection.findOne(query);
      res.send(result);
    });
    // Delete a plant by user
    app.delete("/plants/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantCollection.deleteOne(query);
      res.send(result);
    });

    // Update a plant
    app.put("/plants/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatePlant = req.body;
      console.log(updatePlant);
      const updateDoc = {
        $set: updatePlant,
      };
      const result = await plantCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Plant by user
    app.get("/plants/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await plantCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Plant Care Tracker Server!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
