The project/todo app was also moved to its own repository for simplicity and consistency. The images
of the frontend (backend), backend, broadcaster and cron job (publisher) NATS won't work in this release, as deployment of NATS queues were not a part of this assignment. 

This release has handlers for NATS, to prevent the backend and broadcaster from crashing (the latter will be pending indefinetly, but that is ok). This enables the other features (adding and marking todo items) to working correctly.

You may try this repo out in your ArgoCD yourself, or just use 
```
kubectl apply -k .
kubectl port-forward <TODO-APP POD NAME> 3003:3000
```

As with the ping-pong/log-output app, the github actions and deployments were written in the same manner.