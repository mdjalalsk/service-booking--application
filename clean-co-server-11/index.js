require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// Application settings
const app = express();
const port = 5000;

//parsers
app.use(
  cors( {
    origin: 'http://127.0.0.1:5173',
    credentials: true,
  }));
 
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z89qnzj.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const serviceCollection = client.db('carDoctors').collection('services');
    const orderCollections = client.db('carDoctors').collection('orders');
    // const bookingCollection = client.db('carDoctors').collection('bookings');
    const bookingCollection = client.db('carDoctors').collection('service_bookings');

    const verifyToken = (req, res,next) => {
      const token = req?.cookies?.token;
      const secret=process.env.USER_ACCESS_TOKEN_SECRET
      // res.send(secret);
      // console.log(secret);

      if (!token) {
        return res.status(401).send({ message: 'unauthorized access' });
      }

      jwt.verify(token,secret,(err, decoded) => {
        // console.log(token);
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' });
        }
        //  console.log(decoded);
        req.user = decoded;
        next()
      });
    };

    // CREATE SERVICE
    app.post('/api/v1/services',verifyToken, async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

//  servicer filter and  pagination 

//http://localhost:5000/api/v1/services     //all services
//http://localhost:5000/api/v1/services?title=Engine Oil Change     //specific title/category?

// sort api for service pice
//http://localhost:5000/api/v1/services?sortFiled=price&sortOrder=desc


    // GET ALL SERVICES verifyToken
    app.get('/api/v1/services',verifyToken,async (req, res) => {
     
      let queryObj={ };
      let sortObj={};
      
      // filter
      const category=req.query.title;
      // sort
      const sortFiled = req.query.sortFiled; // Corrected typo here
      const sortOrder = req.query.sortOrder; // Corrected typo here
     //pagination
      //http://localhost:5000/api/v1/services?page=1&limit=3
      let page=parseInt(req.query.page);
      let limit=parseFloat(req.query.limit);
      let skip=(page-1)* limit;
  
      if(category){
        queryObj.title=category
      }
      if(sortFiled && sortOrder){
        sortObj[sortFiled]=sortOrder;
      }
      console.log(sortObj);
      const cursor = serviceCollection.find(queryObj).skip(skip).limit(limit).sort(sortObj);
      const result = await cursor.toArray();
       const total= await serviceCollection.countDocuments();
      // res.send(result);
      res.send({
        total,
        result
      });
    });

    //GET SINGLE SERVICE
    app.get('/api/v1/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    // UPDATE SERVICE
    app.patch('/api/v1/services/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedService = req.body;

      const updateDoc = {
        $set: {
          ...updatedService,
        },
      };
      const result = await serviceCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // DELETE SERVICE
    app.delete('api/v1/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });

    // CREATE BOOKING
    app.post('/api/v1/create-bookings', async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    // GET SINGLE BOOKINGS
    app.get('/api/v1/bookings', verifyToken, async (req, res) => {
      const userEmail = req.query.email;

      if (userEmail !== req.user.email) {
        return res
          .status(403)
          .send({ message: 'You are not allowed to access !' });
      }
      let query = {}; //get all bookings
      if (req.query?.email) {
        query.email = userEmail;
      }

      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    // UPDATE BOOKING
    app.patch('/api/v1/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updatedBooking = req.body;

      const updateDoc = {
        $set: {
          ...updatedBooking,
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // DELETE BOOKING
    app.delete('/api/v1/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    app.post('/api/v1/auth/access-token', async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.USER_ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
 
      res
        .cookie('token', token, {
          httpOnly: false,
          secure: true,
          sameSite: 'none',
        })
        .send({ success: true });
    });

    app.post('/api/v1/auth/logout', async (req, res) => {
      const user = req.body;

      res.clearCookie('token').send({ success: true });
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
