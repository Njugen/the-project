import Index from "~/contents";
import type { Route } from "./+types/home";
import { createTodo, updateTodoItem, getAllTodos } from "./forms/todo";

const serviceUrl = "http://todo-app-service:3001";

export async function loader() {
  return await getAllTodos(serviceUrl);
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const mark = formData.get("update-todo-item");
  console.log("Form data received in action:", formData);
  if(mark) return updateTodoItem(formData, serviceUrl);

  const intent = formData.get("intent");

  
  switch (intent) {
    case "create-todo-form":
      return createTodo(formData, serviceUrl);
    default:
      return { error: "Invalid form submission" };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Todo - DevOps With Kubernetes" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Index />;
}
