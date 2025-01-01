const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 5000;

const uri = 'mongodb+srv://serv:qwerty123@sneg.zhek2.mongodb.net/?retryWrites=true&w=majority&appName=Sneg';
const client = new MongoClient(uri);


const start = async () => {
    try {
        await client.connect()
        console.log('Соединение установлено')
        await client.db().createCollection ('users')
        const users = client.db().collection ('users')

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        app.post('/inc', async (req, res) => {
            let { id } = req.body;
            try {
                await users.findOneAndUpdate(
                    { id_: parseInt(id) },
                    { $inc: { count: 1 } },
                    { returnDocument: 'after', upsert: true }
                );
            } catch (error) {
                console.error(error);
                res.status(500).send('Error updating count');
            }
            res.status(200).send("Sucess")
        });


        app.post('/count', async (req, res) => {
            let { id } = req.body;
            console.log(req.body)
            try {
                let result = await users.findOne({ id_: parseInt(id) });
                console.log(result)

                if (!result) {
                    const insertResult = await users.insertOne({id_: parseInt(id), count: 0 });

                    if (insertResult.acknowledged) {
                        result = { id_: id, count: 0 };
                    } else {
                        return res.status(500).send('Error: Document could not be created.');
                    }
                }

                if (!result || result.count === undefined) {
                    return res.status(500).send('Error: Document has no count field');
                }

                res.status(200).send(result.count.toString());
            } catch (error) {
                console.error('Error retrieving or creating document:', error);
                res.status(500).send('Error retrieving count');
            }
        });


        // Запуск сервера
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (e) {
        console.error('Failed to connect to MongoDB', e);
    }
};


start();

