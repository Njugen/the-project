

const serviceUrl = "http://todo-app-service:1235";

const getRandomWikiURL = async () => {
    try {
        const response = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
        const data = await response.json();
        const url = data.content_urls?.desktop?.page;

        if (!url) {
            return { error: "No URL found in response" };
        }
        return url;
    } catch (error) {
        console.error('Error fetching random wiki summary:', error);
        return { error: "Network error" };
    }
}

const createTodo = async () => {
    try {
        const randomUrl = await getRandomWikiURL();

        const response = await fetch(`${serviceUrl}/todos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "todo-text-field": `Read ${randomUrl}` }),
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

createTodo().then(result => { }).catch(() => { });