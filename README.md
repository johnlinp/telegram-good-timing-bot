# Good Timing Bot [![Build Status](https://travis-ci.org/johnlinp/telegram-good-timing-bot.svg?branch=master)](https://travis-ci.org/johnlinp/telegram-good-timing-bot)

It is a [Telegram](https://telegram.org/) Bot to help you find a good timing to do things.


## Example

![example screenshot](example-screenshot.jpg)


## What Can Be a "Timing"?

Good timings can be:

- "when i am bored"
- "when i am hungry"
- "when i want to read"

and more, whatever you want.


## How to Run Locally

To run the server locally, you have to prepare the `.env` file first:

```
$ cp .env.example .env
$ vim .env # to edit
```

After preparing the `.env` file, you can start building a Docker image:

```
$ docker build -t telegram-good-timing-bot .
```

Then run it:

```
$ docker run --rm telegram-good-timing-bot
```
