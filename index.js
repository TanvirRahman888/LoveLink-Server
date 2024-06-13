const express = require('express');
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion , ObjectId} = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ilfvfer.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const BiodataCollection = client.db("LoveLink").collection("Biodata");
    const SuccessStoryCollection = client.db("LoveLink").collection("SuccessStory");

    app.get('/biodata', async (req, res) => {
      const result = await BiodataCollection.find().toArray();
      res.send(result)
    })
    app.get('/biodata/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }; // Convert id to ObjectId
      const result = await BiodataCollection.findOne(query);
      res.send(result);
    });

    


    app.get('/successstory', async (req, res) => {
      const result = await SuccessStoryCollection.find().toArray();
      res.send(result)
    })
    


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("LoveLink Server is running")
})
app.listen(port, () => {
  console.log("LoveLink is running on Port: ", port);
})
