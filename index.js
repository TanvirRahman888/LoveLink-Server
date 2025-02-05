const express = require('express');
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    const usersCollection = client.db("LoveLink").collection("users");
    const BiodataCollection = client.db("LoveLink").collection("Biodata");
    const SuccessStoryCollection = client.db("LoveLink").collection("SuccessStory");
    const WishListCollection = client.db("LoveLink").collection("WishList");


    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result)
    })
    app.delete('/users/:email', async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.deleteOne({ ContactEmail: email });
      if (result.deletedCount === 1) {
        res.send({ success: true, message: "User deleted successfully" });
      }
    });
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { ContactEmail: user.ContactEmail }
      const existingUser = await usersCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: "User Already Exists", insertedId: null })
      }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })

    // ------------------------------
    app.get('/allbiodata', async (req, res) => {
      const result = await BiodataCollection.find().toArray();
      res.send(result)
    })
    app.delete('/allbiodata/:email', async (req, res) => {
      const email = req.params.email;
      const result = await BiodataCollection.deleteOne({ ContactEmail: email });
      if (result.deletedCount === 1) {
        res.send({ success: true, message: "User deleted successfully" });
      }
    });

    app.get('/malebiodata', async (req, res) => {
      const query = { Gender: "Male" }
      const result = await BiodataCollection.find(query).toArray();
      res.send(result)
    })
    app.get('/femalebiodata', async (req, res) => {
      const query = { Gender: "Female" }
      const result = await BiodataCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/premiummember', async (req, res) => {
      const query = { PremiumMember: "true" }
      const result = await BiodataCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/biodata', async (req, res) => {
      const user = req.body;
      const query = { ContactEmail: user.ContactEmail }
      const existingUser = await BiodataCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: "User Already Exists", insertedId: null })
      }
      const result = await BiodataCollection.insertOne(user)
      res.send(result)
    })

    app.patch('/biodata/:email', async (req, res) => {
      const email = req.params.email;
      const updatedBiodata = req.body;
      delete updatedBiodata._id;
      console.log(updatedBiodata);

      const filter = { ContactEmail: email };
      const updateDoc = {
        $set: updatedBiodata,
      };
      const result = await BiodataCollection.updateOne(filter, updateDoc);
      res.send(result);

    });
    app.get('/myprofile/:email', async (req, res) => {
      const email = req.params.email;
      const query = { ContactEmail: email };
      const userBiodata = await BiodataCollection.findOne(query);
      res.send(userBiodata);
    });




    app.get('/biodata', async (req, res) => {
      const { Gender, PermanentDivisionName, minAge, maxAge, MaritalStatus, Occupation, Religion, premiumMember, sort } = req.query;
      let query = {};
      if (Gender) query.Gender = Gender;
      if (PermanentDivisionName) query.PermanentDivisionName = PermanentDivisionName;
      if (minAge && maxAge) {
        query.Age = { $gte: parseInt(minAge), $lte: parseInt(maxAge) };
      }
      if (MaritalStatus) query.MaritalStatus = MaritalStatus;
      if (Occupation) query.Occupation = Occupation;
      if (Religion) query.Religion = Religion;
      if (premiumMember) query.PremiumMember = premiumMember;

      let sortAge = {};
      if (sort) {
        if (sort === 'HighToLow') {
          sortAge.Age = -1;
        } else if (sort === 'LowToHigh') {
          sortAge.Age = 1;
        }
      }

      const result = await BiodataCollection.find(query).sort(sortAge).toArray();
      res.json(result);
    });

    app.get('/biodata/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }; // Convert id to ObjectId
      const result = await BiodataCollection.findOne(query);
      res.send(result);
    });

    app.get('/biodata/similar/:id', async (req, res) => {
      const id = req.params.id;
      const currentBiodata = await BiodataCollection.findOne({ _id: new ObjectId(id) });

      if (!currentBiodata) {
        return res.send("Finding the most similar Biodata");
      }

      const query = { Gender: currentBiodata.Gender, _id: { $ne: new ObjectId(id) } };
      const result = await BiodataCollection.find(query).limit(3).toArray();
      res.send(result);
    });




    // WishList Post
    app.post('/wishlist', async (req, res) => {
      const wishListBioData = req.body;
      const result = await WishListCollection.insertOne(wishListBioData);
      res.send(result)
    })
    app.get('/wishlist', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const result = await WishListCollection.find(query).toArray();
      res.send(result)
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
