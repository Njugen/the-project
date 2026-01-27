const { create } = require('node:domain');
const { Pool } = require('pg');

const dbInstance = new Pool({
    host: process.env.POSTGRES_HOST || process.env.POSTGRES_SERVICE_SERVICE_HOST || 'postgres-service',
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
});

const createTodoTable = async (callback) => {
    try {
        console.log("Creating todo table...")
        await dbInstance.query(`
            create table if not exists todos (id serial primary key, task varchar(140) not null, completed boolean not null default false)
        `);
        console.log("Todo table created")

        callback(true);
    } catch (err) {
        console.error('Something went wrong when initializing the database...', err);
        callback(false);
    }
}

const addTodoItem = async (task) => {
    try {
        console.log("Adding todo item:", task)
        await dbInstance.query('insert into todos (task, completed) values ($1, $2)', [task, false]);
        console.log("Todo item added")
    } catch (err) {
        console.error('Something went wrong when adding a todo to the database...', err);
    }
}

const updateTodoItem = async (id, completed) => {
    try {
        console.log(`Updating todo item ${id}`)
        await dbInstance.query('update todos set completed=$1 where id=$2', [completed, id]);
        console.log("Todo item updated")
        return true;
    } catch (err) {
        console.error('Something went wrong when updating a todo in the database...', err);
    }
    return false;
}

const getAllTodoItems = async () => {
    try {
        console.log("Fetching all todo items")
        const result = await dbInstance.query('select * from todos order by id');
        console.log("Fetched todo items:")
        return result.rows;
    } catch (err) {
        console.error('Something went wrong when fetching the todo list from the database...', err);
        return [];
    }
}

module.exports = {
    createTodoTable,
    addTodoItem,
    updateTodoItem,
    getAllTodoItems,
};