
## CCAPDEV Major Course Output

## Getting Started
There are two ways to run the application

## 1 Open the website on which it is run
The link to the website: https://laboratory-reservation-jvni.onrender.com

## 2 Run the development server #
To do so
Ensure you have the following installed on your machine:
  • Node.js

  • MongoDB Community Server
  
  • MongoDB Compass
If you have not installed everything that is mentioned above, do install them first and come back to this after.

----------------- How to Use ------------------
```
1. Download the folder of this repository. (Another option is to clone this repository.)
2. Then, open MongoDB compass.
3. You should see "New Connection", and in the URI textbox below, paste this: mongodb+srv://masterUser122:Y6SDtkXn09rMDZTO@cluster0.req0igx.mongodb.net/
4. Click connect, and you should be able to see a schema called "lab_reserve", click on that.
5. Open your terminal/command prompt.
6. CD (change directory) to the path of the project folder (Phase2) on your machine
7. After that, start the server by typing "node server" or "npm start" on your command prompt/terminal, and if successful, you should see these: Server running on port 3000 Connected to MongoDB Atlas :). The data loading should also be seen.
8. Then, go to your preferred web browser and enter: localhost:3000. (Preferrably after the data has been loaded.)
9. After entering, you should see the frontend website.
10. You can click sign in, click register, and after registering, you should be able to login and use the features of a student or staff account. (Another option is to use the pre-loaded accounts, so you don't have to make one.)
```    
Every data is be fetched, stored, updated, and deleted in the database.
