# rtStockUpdate

This is the codebase for running a client side GUI where the user can view stocks and their price movements in real time.

- Workflow:
  - The `config.json` file in the `src` folder has the initial config that is sent to the backend via a `POST` request.
  - The backend maintains a global variable that updates it's values based on the configuration.
  - As soon as the configuration is done, the frontend connects to the backend using a websocket, which upon establishment, sends data to the frontend.
  - As per the configuration, only a fixed amount of elements can be updated in one batch.
  - Apart from this, the update frequency of all elements is also set in the configuration, which can be overridden on the GUI.
  - The coloring works based on the third column in the GUI where any value above the number is Green and otherwise Red. 
  - The current range of stock values lies between 100 to 200. 
 
- Running the application:
  - Clone the repository locally
  - Start the backend by either running it directly using an IDE like `PyCharm` or run `uvicorn rt_stock_updater:app --reload` on the terminal while pointing to the folder that contains it. It runs on `http://127.0.0.1:8000`.
  - Since the backend runs using FastAPI, you can go to `http://127.0.0.1:8000/docs` to see the swagger and play around with it.
  - Start the frontend by doing an `npm install` followed by a `npm start` pointing to the frontend folder. It runs on `http://localhost:3000/`.
  
