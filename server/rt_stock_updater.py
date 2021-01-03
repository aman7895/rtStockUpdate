import asyncio
import random
from asyncio import sleep
from threading import Thread
from typing import Optional

import uvicorn
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, StrictInt, validator

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app_configuration = None
stocks = {}
frequency = 0.3


class Configuration(BaseModel):
    symbols: list = ["AAA"]
    update_frequency_milliseconds: Optional[int] = 300
    elements_per_update: Optional[StrictInt] = 50

    @validator('update_frequency_milliseconds')
    def update_frequency_must_be_above_100(cls, v):
        if v < 100:
            raise ValueError("update_frequency_milliseconds can't be below 100")
        return v


@app.post("/setConfiguration", tags=["configuration"])
async def set_app_configuration(config: Configuration):
    print(config)
    global app_configuration, frequency
    app_configuration = config
    if app_configuration.update_frequency_milliseconds:
        frequency = app_configuration.update_frequency_milliseconds / 1000
    start_thread_to_publish_data()


@app.get("/getConfiguration", tags=["configuration"])
def get_app_configuration():
    return app_configuration


@app.post("/setFrequency", tags=["configuration"])
def update_frequency(new_update_frequency: int):
    global frequency
    print("Frequency: ", frequency)
    if new_update_frequency < 100:
        raise ValueError("update_frequency_milliseconds can't be below 100")

    app_configuration.update_frequency_milliseconds = new_update_frequency
    frequency = new_update_frequency


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    gen = break_updates()
    while True:
        await asyncio.sleep(frequency)
        await websocket.send_json(next(gen))


def start_thread_to_publish_data():
    t1 = Thread(target=start_publishing_data)
    t1.start()


def start_publishing_data():
    for i in app_configuration.symbols:
        stocks[i] = 0
    while True:
        sleep(frequency)  # Based on the update frequency
        generate_stock_prices()


def generate_stock_prices():
    for stock in stocks.keys():
        stocks[stock] = random.randrange(100, 200)


def break_updates():
    partitions = app_configuration.elements_per_update if hasattr(app_configuration, 'elements_per_update') else len(
        stocks)
    i = 0
    while True:
        yield {k: stocks[k] for k in list(stocks.keys())[i:min(i + partitions, len(stocks.keys()))]}
        i = (i + partitions)
        if i >= len(stocks):
            i = 0


if __name__ == '__main__':
    uvicorn.run(app)
