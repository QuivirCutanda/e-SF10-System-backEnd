# e-SF10-System-backEnd

=======================

## ⚠️ WARNING ⚠️
**Do NOT modify the backend code if you are not part of the backend team.**
You are only required to run the server. Any unauthorized changes may cause system failures.

--------------------------------------------------
## 1. Prerequisites
--------------------------------------------------
- Node.js (v12 or higher recommended)
- npm (Node Package Manager)
- Git

--------------------------------------------------
## 2. Clone the Repository from GitHub
--------------------------------------------------
### a. Open your terminal and run:
```
git clone https://github.com/YourUsername/e-SF10-System-backEnd.git
```
### b. Navigate into the project directory:
```
cd e-SF10-System-backEnd
```

--------------------------------------------------
## 3. Environment Setup
--------------------------------------------------

### a. Import e-SF10-database.sql file  manualy in your database (*phpMyAdmin, etc.).

### b. In the root directory of your project, create a file named `.env`.

### c. Add the following lines to your `.env` base on your database info:
```
DB_HOST=enter your host name
DB_USER=root
DB_PASSWORD="" add password if your database have password
DB_NAME=e_sf10_db
JWT_SECRET=bisagonsa rani hehhe
PORT=3001

```
### d. Install nodemodule:
```
npm install
```
--------------------------------------------------
## 4. Running the Application
--------------------------------------------------
### a. Open your terminal in the project directory.

### b. Start the server by running:
```
node server.js
```

or you can use `nodemon` for automatic refresh:
```
npm i nodemon
nodemon server.js
```

The server should now be running on: http://localhost:3001/esf10/

--------------------------------------------------
## 5. Testing the API
--------------------------------------------------
You can test the API endpoints using a tool like **Postman** or **cURL**.

#postman

--------------------------------------------------
## Additional Resources
--------------------------------------------------
- [Express.js Documentation](https://expressjs.com/)
- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [Postman](https://www.postman.com/)

🚀 **Happy coding!**

