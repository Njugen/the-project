import { Form, useLoaderData, useActionData, useNavigation } from "react-router";
import { useEffect, useRef } from "react";

interface TodoItem {
    id: number;
    task: string;
    completed: boolean;
}

const Index = () => {
    const { todos } = useLoaderData<{ todos: TodoItem[] }>();
    const actionData = useActionData<{ error?: string; success?: boolean }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const formRef = useRef<HTMLFormElement>(null);

    const todoTextFieldMaxLength = parseInt(process.env['todo.fields.todotextfield.length'] || '140');

    useEffect(() => {
        if (actionData?.success && formRef.current) {
            formRef.current.reset();
        }
    }, [actionData]);

    return (
        <div className="container mx-auto p-4 flex justify-center items-center">
            <div className="max-h-100 w-auto space-y-4">
                <h1 style={{fontSize:"2.75em", fontWeight:"bold", margin:"1em 0 0 0"}}>The project app</h1>
                <img src="/storage/images/random-image.jpg" alt="Random image" className="h-75 w-auto rounded-md" />
                <Form ref={formRef} method="post" className="space-x-4">
                    <input type="hidden" name="intent" value="create-todo-form" />
                    <input name="todo-text-field" type="text" className="p-0.5 rounded-sm border border-gray-600" />
                    <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 cursor-pointer" disabled={isSubmitting}>
                        Create todo
                    </button>
                

                    {todos.length ? <ul className="list-disc">
                        {todos.map((todo, index) => (
                            <li key={index}>
                                {todo.task}
                                {!todo.completed ? <button style={{ background: "blue", padding: "6px", borderRadius: "5px", cursor: "pointer", color: "white" }} name="update-todo-item" value={`${todo.id}`}>
                                    Mark as complete
                                </button> : <span> (Completed)</span>}
                            </li>
                        ))}
                    </ul>: <p>No todos yet</p>}
                </Form>
                <h2 style={{fontSize:"1.5em", fontWeight:"bold", margin:"1em 0 0 0"}}>Done</h2>
                {todos.length > 0 ? <ul className="list-disc">{todos.filter(todo => todo.completed).map((todo, index) => (
                    <li key={index}>{todo.task}</li>
                ))}</ul> : <p>No completed todos yet</p>}
            </div>
        </div>
    );
}

export default Index;