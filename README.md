# Activity Service

This is an event-driven microservice built with Node.js, Express, Kafka, and MongoDB. It receives user activity logs, sends them through Kafka, stores them in MongoDB, and lets you read them through a REST API with pagination and filtering.

## Live demo

The service runs on a Kubernetes cluster (minikube) and is exposed publicly through a Cloudflare tunnel at this address:

https://floor-finds-responsibilities-completing.trycloudflare.com

You can try https://carries-minutes-general-exotic.trycloudflare.com/api/health to check the service and https://carries-minutes-general-exotic.trycloudflare.com/api/activities to read the saved logs.

This link is temporary. It only works while my tunnel is running. If it is offline when you read this, please watch the demo video or run the project locally using the steps below.

## How it works

When a client sends a POST request to /api/activities, the Express API validates the data and publishes it to a Kafka topic called user-activity. A Kafka consumer running inside the same service reads the event and saves it to MongoDB. When a client sends a GET request to /api/activities, the API reads the saved logs directly from MongoDB.

## Code structure

The code follows Domain-Driven Design and lives in the src folder. The domain folder has the Activity entity and the repository interface. The application folder has the use cases IngestActivity and QueryActivities. The infrastructure folder has the Kafka producer and consumer and the MongoDB model and repository. The interfaces folder has the Express routes. The file main.js connects everything together. The Kubernetes manifests are in k8s/all.yaml, and there is a Dockerfile and a docker-compose.yml in the project root.

## How to run with Docker

You need Docker installed. Run these commands:

```
git clone https://github.com/kareemibrahim99/Event_Driven_Microservice.git
cd activity-service
cp .env.example .env
docker compose up --build
```

Wait about one minute for Kafka to start. Some connection errors at the beginning are normal because the app keeps retrying until Kafka is ready. The service is ready when you see "Connected to MongoDB", "Kafka consumer is running", and "Server is running on port 3000".

## How to use the API

To check that the service is running, send a GET request to /api/health.

To send an activity event, send a POST request to /api/activities with a JSON body that has userId and action, and optionally metadata. The API replies with 202 Accepted because the event is processed asynchronously.

```
curl -X POST localhost:3000/api/activities -H "Content-Type: application/json" -d '{"userId":"u1","action":"login"}'
```

To read the saved logs, send a GET request to /api/activities. You can filter with userId, action, from, and to, and you can paginate with page (default 1) and limit (default 10, maximum 100). The response contains the data, the page, the limit, the total, and the total number of pages.

```
curl "localhost:3000/api/activities?userId=u1&page=1&limit=5"
```

The same requests work against the live demo address by replacing localhost:3000 with https://carries-minutes-general-exotic.trycloudflare.com.

## How to run on Kubernetes

These commands start a local minikube cluster, build the image inside it, deploy everything, and forward the service to port 8080:

```
minikube start --driver=docker
eval $(minikube docker-env)
docker build -t activity-service:latest .
kubectl apply -f k8s/all.yaml
kubectl get pods -n activity
kubectl port-forward -n activity svc/activity-service 8080:3000
```

Wait until all pods show 1/1 Running before testing. To make the service public for a demo, I used a temporary Cloudflare tunnel with this command:

```
cloudflared tunnel --url http://localhost:8080
```

## Architecture choices

I used Kafka between the API and the database so the API can reply immediately after publishing the event, and so events are not lost if MongoDB is temporarily down. The Kafka message key is the userId, which sends all events of one user to the same partition and keeps their order.

I used Domain-Driven Design so the business logic does not depend on Kafka, Express, or MongoDB. The domain defines the repository interface and MongoDB implements it, so the database could be replaced without changing the use cases.

MongoDB has three indexes that match the API queries: userId with timestamp, action with timestamp, and timestamp alone. This keeps filtering and newest-first sorting fast.

On Kubernetes, the app runs with two replicas and a readiness probe. Kafka runs in KRaft mode, so ZooKeeper is not needed.

## Limitations

MongoDB and Kafka on Kubernetes do not use persistent volumes, so their data is lost if those pods restart. If saving an event fails, the consumer logs the error and skips the event, with no retry or dead-letter topic yet. The service is deployed on a local minikube cluster because I did not have a cloud account, but the same manifests would work on any cloud cluster by changing the image name.
