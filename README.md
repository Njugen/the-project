The project/todo app was also moved to its own repository for simplicity and consistency. The images
of the frontend (backend), backend, broadcaster and cron job (publisher) are now created and added to docker hub once a push request has been received by the repository.

ArgoCD reads the repository and syncs any changes locally. Unfortunately, NATS isn't deployed so not everything will run. 

