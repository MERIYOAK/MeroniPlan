import bodyParser from "body-parser";
import express from "express";
import mongoose from 'mongoose';
import _ from "lodash";
import { config as configDotenv } from "dotenv";

// Load environment variables from .env file
configDotenv();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB);

// const connectWithRetry = () => {
//     mongoose.connect("mongodb+srv://Meron-Michael:07448717@cluster1.lhcceb8.mongodb.net/todoListDB?retryWrites=true&w=majority")
//         .then(() => {
//             console.log('Connected to MongoDB');
//         })
//         .catch((err) => {
//             console.error('Failed to connect to MongoDB. Retrying in 5 seconds...', err);
//             setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
//         });
// };

// connectWithRetry();

const todoSchema = new mongoose.Schema({
    todo: {
        type: String,
        required: [true, "you added an invalid todo!"]
    }
});

const Todo = mongoose.model("todolist", todoSchema);

const todo1 = new Todo({
    todo: "Welcome to your todo list"
});
const todo2 = new Todo({
    todo: "Click the work tab to add new todo."
});
const todo3 = new Todo({
    todo: "<-- Hit this to delete an item."
});

const defaultTodos = [todo1, todo2, todo3]

const listSchema = new mongoose.Schema({
    name: String,
    todos: [todoSchema]
});

const List = mongoose.model('List', listSchema);

app.get("/", async (req, res) => {
    try {
        // Check if there are any documents in the "todolist" collection
        const count = await Todo.countDocuments({});

        if (count === 0) {
            await Todo.insertMany(defaultTodos);
            console.log("Successfully inserted default todos to todoListDB");
        } else {
            console.log("Default todos already exist in the database.");
        }
    } catch (error) {
        console.log("Error:", error);
    }

    // Fetch existing todos after ensuring the default todos are inserted
    try {
        let existingTodos = await Todo.find();
        res.render("index.ejs", { listTitle: "Today", newListItems: existingTodos });;
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Error fetching todos.");
    }
});

app.get("/:name", async (req, res) => {
    const customListName = _.capitalize(req.params.name);

    try {
        const list = await List.findOne({ name: customListName });

        if (list && list.todos && list.todos.length === 0) {
            // Push each default todo individually into the list's todos array
            for (const defaultTodo of defaultTodos) {
                list.todos.push(defaultTodo);
            }

            // Save the updated list
            await list.save();
            console.log("Successfully inserted default lists");
        } else {
            console.log("Default lists already exist in the database.");
        }
    } catch (error) {
        console.log("Error:", error);
    }

    try {
        const foundList = await List.findOne({ name: customListName });

        if (!foundList) {
            const list = new List({
                name: customListName,
                todos: defaultTodos
            });

            await list.save();
            res.redirect("/" + customListName);
        } else {
            res.render("index.ejs", { listTitle: foundList.name, newListItems: foundList.todos });
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Error fetching todos.");
    }
});

app.post("/submit", async (req, res) => {
    const newTodoText = req.body.todo;
    const listName = req.body.list;

    const newTodo = new Todo({
        todo: newTodoText,
    });

    if (listName === "Today") {
        try {
            await newTodo.save();
            console.log("Successfully added a new todo to the database.");
        } catch (error) {
            console.error("Error:", error);
        }
        res.redirect("/");
    } else {
        try {
            const newList = await List.findOne({ name: listName });
            if (newList) {
                newList.todos.push(newTodo);
                await newList.save();
                console.log("Successfully added a new todo to the" + listName + " databases.");
                res.redirect("/" + listName);
            } else {
                console.log("List not found");
                redirect("/");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
});

app.post('/delete', async (req, res) => {
    const checkedId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        try {
            await Todo.findByIdAndRemove(checkedId);
            res.redirect("/");
            console.log("Todo deleted successfully");
        } catch (error) {
            console.error("Error", error);
            res.status(500).send("Error in deleting todos.");
        }
    } else {
        try {
            await List.findOneAndUpdate({ name: listName }, { $pull: { todos: { _id: checkedId } } });
            res.redirect("/" + listName);
        } catch (error) {
            console.error("Error", error);
            res.status(500).send("Error in deleting todos.");
        }
    }


});

app.listen(port, () => {
    console.log("listening on port " + port);
});
