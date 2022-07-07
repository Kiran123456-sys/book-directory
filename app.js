require("dotenv").config();
const express = require("express");

const app = express()
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const port = 3000

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URL, {
    dbName: 'book_directory',
    useNewUrlParser: true,
    useUnifiedTopology: true 
}, err => err ? console.log(err) : console.log('Connected to database'));

const authorSchema = {
    first_name: String,
    last_name: String,
    age: Number
}

const bookSchema = {
    title: String,
    author: authorSchema,
    published: Date,
    quantity: Number,
}

const Author = mongoose.model('author', authorSchema);
const Book = mongoose.model('book', bookSchema);

app.get("/", (req, res) => {
    res.render("index");
})

app.route('/books')
    .get((req, res) => {
        Book.find({}, (err, books) => {
            if (err) return console.log(err);
            res.render('books', {books: books});
        })
    })
    .post((req, res) => {
        Book.find({"title" : {$regex : req.body.search}}, (err, books) => {
            if (err) return console.log(err);
            res.render('books', {books: books});
        });
    });

app.route('/add')
    .get((req, res) => {
        res.render('add');
    })
    .post((req, res) => {
        Author.findOne({first_name: req.body.first_name, last_name: req.body.last_name, age: req.body.age}, async (err, author) => {
            if(err) {
                console.log(err);
            } else if(author) {
                console.log('Author already exists');
                const book = new Book({
                    title: req.body.title,
                    published: req.body.date,
                    quantity: req.body.qty,
                    author: author
                });
                book.save((err) => {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log('Book added');
                        res.redirect('/books');
                    }
                });
            } else {
                const newAuthor = new Author({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    age: req.body.age
                });
                newAuthor.save((err) => {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log('Author added');
                        const book = new Book({
                            title: req.body.title,
                            published: req.body.date,
                            quantity: req.body.qty,
                            author: newAuthor
                        });
                        book.save((err) => {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log('Book added');
                                res.redirect('/books');
                            }
                        });
                    }
                });
            }
        })
    })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})