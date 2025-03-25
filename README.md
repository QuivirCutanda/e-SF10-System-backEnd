# e-SF10-System-backEnd

=======================
--------------------------------------------------
1. Prerequisites
--------------------------------------------------
- Node.js (v12 or higher recommended)
- npm (Node Package Manager)
- Git

--------------------------------------------------
2. Clone the Repository from GitHub
--------------------------------------------------
a. Open your terminal and run:
   git clone https://github.com/YourUsername/e-SF10-System-backEnd.git

b. Navigate into the project directory:
   cd e-SF10-System-backEnd

--------------------------------------------------
3. Environment Setup
--------------------------------------------------
a. In the root directory of your project, create a file named ".env".

b. Add the following lines to your .env file:
   ----------------------------------------
    PORT=3001
    API_KEY=e0ba448b-879b-4baa-baa7-afbcce605b0f
   ----------------------------------------

--------------------------------------------------

--------------------------------------------------
4. Running the Application
--------------------------------------------------
a. Open your terminal in the project directory.

b. Start the server by running:
   node index.js

   or you can use nodemon for auto resfresh
   `npm i nodemon`
   and Start the server by running:
  `nodemon index.js`

The server should now be running on the port http://localhost:3001

--------------------------------------------------
5. Testing the API
--------------------------------------------------
You can test the API endpoints using a tool like Postman or cURL.

- Public Route:
  URL: GET http://localhost:3001/
  Auth Type:API KEY
  Key:x-api-key
  Value:e0ba448b-879b-4baa-baa7-afbcce605b0f

--------------------------------------------------
Additional Resources
--------------------------------------------------
- Express.js Documentation: https://expressjs.com/
- dotenv Documentation: https://github.com/motdotla/dotenv
- Postman: https://www.postman.com/

Happy coding!
