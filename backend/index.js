const http = require('http');
const { createReadStream } = require('fs');
const {
    imageExists,
    getImageFilePath,
    getMimeType,
    runAnonymousImagePrep
} = require('./scripts/utils/randomImageHandling');
const db = require('./scripts/utils/database');
const { sendDataToNATS } = require('./scripts/utils/nats');

const port = process.env.PORT || 3000;
console.log("PORT", port);
let databaseInitialized = false;

const getRandomImage = (req, res) => {
    const { headers } = req;
    const url = new URL(req.url, `http://${headers.host}`);
    const pathname = url.pathname;

    const requestedFile = pathname.slice(16);
    const filePath = getImageFilePath();

    if (filePath) {
        const filename = filePath.split('/').pop();
        const requestedBaseName = requestedFile.split('.')[0];
        const actualBaseName = filename.split('.')[0];

        if (requestedBaseName === actualBaseName) {
            const filetype = filePath.split('.').pop();
            const mimeType = getMimeType(filetype);
            res.statusCode = 200;
            res.setHeader("Content-Type", mimeType);

            const cacheEnabled = process.env['cache.enabled'] === 'true';
            if (!cacheEnabled) {
                res.setHeader("Cache-Control", process.env['cache.control'] || "no-store, no-cache, must-revalidate");
                res.setHeader("Pragma", process.env['cache.pragma'] || "no-cache");
                res.setHeader("Expires", process.env['cache.expires'] || "0");
            }

            return createReadStream(filePath).pipe(res);
        }
    }

    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end('Nothing here');
}

const getAllTodos = async (req, res) => {
    const response = await db.getAllTodoItems();

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(response));
}

const updateTodoItems = async (req, res) => {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                if (req.headers['content-type']?.includes('application/json')) {
                    const data = JSON.parse(body);
                    const { id, completed } = data;

                    const result = await db.updateTodoItem(id, completed);
                    await sendDataToNATS("MAPPER_DATA", `Todo item ${id} updated`, true);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    const payload = JSON.stringify({ success: result });
                    res.end(payload);
                }
            } catch (err) {
                reject(err);
            }
        });

        req.on('error', reject);
    });
};

const createTodo = (req, res) => {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                let todoText = '';

                if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
                    const params = new URLSearchParams(body);
                    todoText = params.get('todo-text-field');
                }

                if (req.headers['content-type']?.includes('application/json')) {
                    const data = JSON.parse(body);
                    todoText = data['todo-text-field'];
                }

                if (todoText) {
                    if (todoText.length > 140) {
                        res.statusCode = 405;
                        res.setHeader("Content-Type", "application/json");
                        const message = 'Todo text exceeds maximum length of 140 characters';

                        console.error(message);
                        const payload = JSON.stringify({ error: message });
                        res.end(payload);
                    } else {
                        console.log("Adding new TODO item to database:", todoText);
                        await db.addTodoItem(todoText);
                        console.log("Finished adding TODO item to database.");
                        await sendDataToNATS("MAPPER_DATA", todoText, false);

                        const todos = await db.getAllTodoItems();

                        res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");

                        const payload = JSON.stringify(todos);
                        res.end(payload);
                    }
                } else {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    console.error('Invalid todo data');
                    const payload = JSON.stringify({ error: 'Invalid todo data' });
                    res.end(payload);
                }
                resolve();
            } catch (err) {
                reject(err);
            }
        });

        req.on('error', reject);
    });
};

if (!imageExists()) runAnonymousImagePrep();
setInterval(runAnonymousImagePrep, 10 * 60 * 1000);

const setupRunner = setInterval(() => {
    try {
        if (databaseInitialized) {
            clearInterval(setupRunner);
            return;
        }
        db.createTodoTable((state) => databaseInitialized = state);
    } catch (error) {
        console.error("Error during database initialization:", error);
    }
}, 5000);

const server = http.createServer((req, res) => {
    if (!databaseInitialized) {
        res.statusCode = 503;
        res.setHeader("Content-Type", "text/plain");
        res.end('Database could not be reached.');
        return;
    }
    console.log(`Incoming request: ${req.method} ${req.url}`);
    const { method, headers } = req;
    const url = new URL(req.url, `http://${headers.host}`);
    const pathname = url.pathname;
    const methodToLower = method.toLowerCase();

    if (methodToLower === 'get') {
        if (pathname.startsWith('/db-diagnosis')) {
            if (databaseInitialized) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/plain");
                res.end('Database was reached successfully.');
                return;
            }
        }
        if (pathname.startsWith('/storage/images')) return getRandomImage(req, res);
        if (pathname.startsWith('/todos')) {
            console.log("TODO GET request received. Processing...")

            return getAllTodos(req, res).catch(err => {
                console.error('Error in getAllTodos:', err);
                res.statusCode = 500;
                res.end('Internal Server Error');
            });
        }
        if (pathname === '/') {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end('Todo Backend is running.');
            return;
        }
    } else if (methodToLower === 'post') {
        if (pathname.startsWith('/todos')) {
            let success = true;
            console.log("TODO POST request received. Processing...")

            return createTodo(req, res).catch(err => {
                success = false;
                console.error("Failed to add a new Todo item:", err);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }).finally(() => {
                if (success) console.log("TODO item added successfully.");
            });
        }
    } else if (methodToLower === 'put') {
        if (pathname.startsWith('/todos')) {
            console.log("TODO UPDATE request received. Processing...")
            return updateTodoItems(req, res).catch(err => {
                console.error("Failed to update the Todo item:", err);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }).finally(() => {
                console.log("TODO item updated successfully.");
            });
        }

        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");

        res.end('Nothing here');
    }
});


server.listen(port);