<div align="center">
<img src="./src/lib/assets/logo.png" width="200" />
<h3>Wishlist</h3>
<p> A sharable wishlist for your friends and family </p>
</div>

## About

Wishlist is a self-hosted wishlist application that you can share with your friends and family. You no longer have to wonder what to get your parents for the holidays, simply check their wishlist and claim any available item. With a simple user interface, even the grandparents can get involved!

## Features

- [x] Claim items on a wishlist
- [x] Check off claimed items as purchased
- [x] Invite users via email (SMTP configuration required)
- [x] Options for [suggestions](#suggestions)
- [ ] Draw names for a "secret santa" experience
- [ ] Group support

## Getting Started

Getting started is simple with Docker Compose

Create a `docker-compose.yaml` file:

```compose.yml
version: "3"

services:
  wishlist:
    container_name: wishlist-app
    image: cmintey/wishlist:latest
    ports:
      - 3280:3280
    volumes:
      - ./uploads:/usr/src/app/uploads
      - ./data:/usr/src/app/data
    environment:
      ORIGIN: https://wishlist.example.com
```

Then simply run `docker compose up -d`.

You can now connect to your application at `http://<host>:3280`.

> **Note**
>
> Set the `ORIGIN` environment variable to the url you will be connecting to, otherwise you will experience issues

