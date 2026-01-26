const getAllTodos = async (url: string) => {
    try {
        console.log("Fetching todos from:", url);
        const response = await fetch(`${url}/todos`);

        if (!response.ok) {
            return { todos: [] };
        }
        const todos = await response.json();

        return { todos };
    } catch (error) {
        console.error('Error fetching todos:', error);
        return { todos: [] };
    }
}

const updateTodoItem = async (formData: FormData, url: string) => {
    const id = formData.get("update-todo-item") as string;
    console.log("Updating todo item with id:", id);
    await fetch(`${url}/todos`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: parseInt(id), completed: true }),
    });

    return { success: true };
}

const createTodo = async (formData: FormData, url: string) => {
    const todoText = formData.get("todo-text-field") as string;

    if (!todoText || todoText.length < 1) {
        return { error: "Todo text is required" };
    }

    try {
        const response = await fetch(`${url}/todos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "todo-text-field": todoText }),
        });

        if (!response.ok) {
            return { error: "Failed to create todo" };
        }

        return { success: true };
    } catch (error) {
        console.error('Error creating todo:', error);
        return { error: "Network error" };
    }
}

export { createTodo, updateTodoItem, getAllTodos };