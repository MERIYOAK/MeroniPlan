import bodyParser from "body-parser";
import express from "express";
import mongoose from 'mongoose';
import _ from "lodash";
import { config as configDotenv } from "dotenv";
import bcrypt from 'bcrypt';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import sharp from 'sharp';
import { generatePresignedUrl } from './imageUrlGenerator.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';

// Load environment variables from .env file
configDotenv();

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err);
});

const mongoStore = new MongoStore({
    mongoUrl: process.env.MONGODB_URI,
    collection: 'sessions',
    ttl: process.env.SESSION_TTL,
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: {
        maxAge: process.env.SESSION_TTL * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
    },
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const BUCKET_NAME = process.env.BUCKET_NAME
const BUCKET_REGION = process.env.BUCKET_REGION
const ACCESS_KEY_ID = process.env.ACCESS_KEY
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    region: BUCKET_REGION,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY
    }
});

const todoSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    todo: {
        type: String,
        required: [true, "you added an invalid todo!"]
    },
    datetime: {
        type: Date
    }
});

const Todo = mongoose.model("todolist", todoSchema);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    firstName: String,
    middleName: String,
    lastName: String,
    username: String,
    age: Number,
    sex: String,
    country: String,
    city: String,
    imageName: String
});

const User = mongoose.model('User', userSchema);

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const authenticate = async (req, res, next) => {
    try {
        const sessionId = req.headers.sessionid;

        mongoStore.get(sessionId, async (err, session) => {
            if (err) {
                console.error('Error fetching session from database:', err);
                return res.status(500).send('Internal Server Error');
            }

            if (session && session.isAuthenticated) {
                console.log('Authenticated');
                next();
            } else {
                console.log('Not authenticated');
                res.redirect('/');
            }
        });
    } catch (error) {
        console.error('Error checking authentication:', error);
        res.status(500).send('Internal Server Error');
    }
};

app.post('/register', upload.single('image'), async (req, res) => {
    const { password, firstName, middleName, lastName, username, age, sex, country, city } = req.body;
    const userEmail = `${username.toLowerCase()}@meroni.com`;
    try {
        if (req.file) {
            const userExists = await User.findOne({ email: userEmail });

            if (userExists) {
                res.json({ error: true, message: 'User already exists' });
                console.log('User Name already exists');
                return;
            }

            const buffer = await sharp(req.file.buffer).resize({ width: 200, height: 200, fit: 'cover' }).toBuffer();
            const imageName = randomImageName();

            try {
                const params = {
                    Bucket: BUCKET_NAME,
                    Key: imageName,
                    Body: buffer,
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(params);
                await s3.send(command);
                console.log('Image uploaded successfully to S3');
            } catch (error) {
                console.error('Error uploading image to S3:', error);
            }

            const hash = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

            // Save the rest of the data to the database
            const newUser = new User({
                email: userEmail,
                password: hash,
                firstName,
                middleName,
                lastName,
                username,
                imageName: imageName,
                country,
                city,
                age,
                sex
            });

            try {
                await newUser.save();

                const preSignedUrl = await generatePresignedUrl(newUser);
                const imageUrl = preSignedUrl.imageUrl;

                //Set session values
                req.session.isAuthenticated = true;
                req.session.username = newUser.username;
                req.session.userId = newUser._id.toString();

                await new Promise((resolve, reject) => {
                    req.session.save((err) => {
                        if (err) {
                            reject(err);
                            console.error('Error saving session:', err);
                        } else {
                            resolve();
                            console.log('Session saved successfully');
                        }
                    });
                });

                res.json({
                    success: true,
                    message: 'User created successfully',
                    sessionId: req.sessionID,
                    isAuthenticated: req.session.isAuthenticated,
                    id: req.session.userId,
                    firstName: newUser.firstName,
                    middleName: newUser.middleName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    username: newUser.username,
                    imageUrl: imageUrl,
                });;


                console.log('User created successfully');
            } catch (saveError) {
                console.error('Error saving user to the database:', saveError);
                res.json({ error: true, message: 'Error saving user to the database' });
            }
        } else {
            // Handle the case where no image is provided
            res.json({ error: true, message: 'Image is required' });
        }
    } catch (error) {
        console.error('Error creating newUser:', error);
        res.status(500).json({ error: 'Error creating reader' });
    }
});

app.post('/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;

    try {
        const user = await User.findOne(
            {
                $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
            });

        if (!user) {
            res.json({ error: true, message: 'User not found' });
            return;
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            res.json({ error: true, message: 'Incorrect password' });
            return;
        }

        // Set session values
        req.session.isAuthenticated = true;
        req.session.username = user.username;
        req.session.userId = user._id.toString();

        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    reject(err);
                    console.error('Error saving session:', err);
                } else {
                    resolve();
                    console.log('Session saved successfully');
                }
            });
        });

        const preSignedUrl = await generatePresignedUrl(user);
        const imageUrl = preSignedUrl.imageUrl;

        const existingTodos = await Todo.find({ userId: user._id }).sort({ datetime: 1 });

        res.json({
            success: true,
            message: 'User logged in successfully',
            sessionId: req.sessionID,
            isAuthenticated: req.session.isAuthenticated,
            id: req.session.userId,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            imageUrl: imageUrl,
            todos: existingTodos,
        });


        console.log('User logged in successfully');
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Error logging in user' });
    }
});

app.post('/logout', authenticate, async (req, res) => {
    try {
        const sessionId = req.headers.sessionid;
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                throw new Error('Error logging out user');
            }

            // Remove the session from the MongoDB store
            mongoStore.destroy(sessionId, (destroyError) => {
                if (destroyError) {
                    console.error('Error destroying session in MongoDB:', destroyError);
                    throw new Error('Error logging out user');
                }

                res.json({ success: true, message: 'User logged out successfully' });
                console.log('User logged out successfully');
            });
        });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out user',
        });
    }
});

app.post('/addtodo', authenticate, async (req, res) => {
    const { userId, todo, datetime } = req.body;

    try {
        const newTodo = new Todo({
            userId: userId,
            todo: todo,
            datetime: datetime
        });
        await newTodo.save();

        const existingTodos = await Todo.find({ userId: userId }).sort({ datetime: 1 });

        res.json({ success: true, message: 'Todo added successfully', todos: existingTodos });
    } catch (error) {
        console.error('Error adding todo:', error);
        res.status(500).json({ success: false, message: 'Error adding todo' });
    }

});

app.delete('/deletetodo/:todoId', authenticate, async (req, res) => {
    const todoId = req.params.todoId;
    try {
        const deletedTodo = await Todo.findByIdAndDelete(todoId);

        if (!deletedTodo) {
            res.status(404).json({ success: false, message: 'Todo not found' });
        } else {

            const existingTodos = await Todo.find({ userId: deletedTodo.userId }).sort({ datetime: 1 });

            res.json({ success: true, message: 'Todo deleted successfully', todos: existingTodos });
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ success: false, message: 'Error deleting todo' });
    }
});

app.post('/imageChange', upload.single('image'), authenticate, async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: true, message: 'No image file uploaded' });
            console.log('No image file uploaded');
            return; // Exit the function early if no file uploaded
        } else {
            try {
                const user = await User.findById(req.body.userId);
                if (!user) {
                    res.status(404).json({ error: true, message: 'User not found' });
                    console.log('User not found');
                    return;
                }

                try {
                    // Delete existing image from S3 bucket
                    const deleteParams = {
                        Bucket: BUCKET_NAME,
                        Key: user.imageName
                    };
                    const deleteCommand = new DeleteObjectCommand(deleteParams);
                    await s3.send(deleteCommand);

                    console.log('Image deleted successfully from S3');

                    user.imageName = ""; // Set imageName to undefined or null
                    await user.save();

                    const newImageName = randomImageName();

                    try {
                        const buffer = await sharp(req.file.buffer).resize({ width: 200, height: 200, fit: 'cover' }).toBuffer();

                        const uploadParams = {
                            Bucket: BUCKET_NAME,
                            Key: newImageName,
                            Body: buffer,
                            ContentType: req.file.mimetype
                        };
                        const uploadCommand = new PutObjectCommand(uploadParams);
                        await s3.send(uploadCommand);

                        console.log('Image uploaded successfully to S3');
                    } catch (error) {
                        console.error('Error uploading image to S3:', error);
                        res.status(500).json({ success: false, message: 'Error uploading image to S3' });
                    }

                    user.imageName = newImageName; // Set imageName to undefined or null
                    await user.save();

                    const preSignedUrl = await generatePresignedUrl(user);

                    res.status(200).json({ success: true, message: 'Profile picture uploaded successfully', imageUrl: preSignedUrl.imageUrl });
                    console.log('Profile picture uploaded successfully');

                } catch (error) {
                    console.error('Error deleting image in s3 bucket:', error);
                    res.status(500).json({ success: false, message: 'Error deleting image in s3 bucket' });
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                res.status(500).json({ success: false, message: 'Error fetching user' });
            }
        }
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading profile picture',
        });
    }
});

app.listen(port, () => {
    console.log("listening on port " + port);
});
