<div align="center">
<img src="./src/lib/assets/logo.png" width="200" />
<h1>Wishlist</h1>
<p> A sharable wishlist for your friends and family </p>
</div>

## About

Wishlist is a self-hosted wishlist application that you can share with your friends and family. You no longer have to wonder what to get your parents for the holidays, simply check their wishlist and claim any available item. With a simple user interface, even the grandparents can get involved!

## Features

- [x] Claim items on a wishlist
- [x] Check off claimed items as purchased
- [x] Automatically fetch product data from URL
- [x] Invite users via email (SMTP configuration required)
- [x] Options for [suggestions](#suggestions)
- [x] PWA Support
- [x] Multiple groups
- [x] Registry Mode (single list)
- [x] OAuth Authentication

<p float="left">
    <img src="./assets/homepage-desktop.png" width="74%" />
    <img src="./assets/homepage-mobile.png" width="25%" />
    Multiple groups for friends and family
</p>

<p float="left">
    <img src="./assets/my-wishes-mobile.png" width="49%" />
    <img src="./assets/wishes-mobile.png" width="49%" />
    Add items to your list so other's can claim them
</p>

<img src="./assets/wish-form.png" />
Create a wish from a URL, or manually fill in the details

## Getting Started

Getting started is simple with Docker Compose.

> [!NOTE]
> A [Helm chart is available](https://github.com/mddeff/wishlist-charts) via a community contributor

Create a `docker-compose.yaml` file:

```compose.yml
services:
  wishlist:
    container_name: wishlist
    image: ghcr.io/cmintey/wishlist:latest
    ports:
      - 3280:3280
    volumes:
      - ./uploads:/usr/src/app/uploads  # This is where user image uploads will be stored
      - ./data:/usr/src/app/data        # This is where the sqlite database will be stored
    environment:
      # ORIGIN: https://wishlist.example.com
      ORIGIN: http://192.168.2.10:3280 # The URL your users will be connecting to
      TOKEN_TIME: 72 # hours until signup and password reset tokens expire
```

Then simply run `docker compose up -d`.

You can now connect to your application at `http://<host>:3280`.

> [!NOTE]
> Set the `ORIGIN` environment variable to the url you will be connecting to, otherwise you will experience issues

### Environment Variables

`ORIGIN`: The URL your users will connect to e.g. `https://wishlist.domain.com`, `http://192.168.2.10:3280`. **Note**, if this value is an IP address, then it must include the exposed port of the application

`TOKEN_TIME`: The amount of time (hours) that signup and password reset tokens are valid for

`DEFAULT_CURRENCY`: The global default currency to be used. Currency can still be changed on a per-item basis

### Running behind a reverse proxy

It is recommended to run Wishlist behind a reverse proxy. Currently, Wishlist does not support running on a different subpath (i.e. `https://domain.com/wishlist`).

#### Nginx

There is a [known issue](https://github.com/cmintey/wishlist/issues/170) when running behind Nginx. It is recommended to set the following properties in your Nginx configuration:

```
proxy_buffer_size   128k;
proxy_buffers   4 256k;
proxy_busy_buffers_size   256k;
```

## Groups

Wishlist has support for multiple wishlist groups. For example, you can have one group for friends and one for family. The wishes on these lists will be completely separate. You can switch between groups using the menu when you click on your profile picture.

Currently, anyone can create a group. The group creator is automatically added as a "manager" of the group. A Group Manager can invite users to Wishlist and add/remove existing users to the group they manage. The Group Manager can also delete the group. An Admin will have the same permissions as the Group Manager.

## Registry Mode

Wishlist has the ability to turn a group into a Registry. In this mode, only a single user can be part of the group and there is only one list. The owner of the group can add items to the list as normal and then get a public link to share out to friends and family. Users accessing this link will not need to sign in or create an account. Public users can view the items on the list and also claim items. In order to claim an item, the user just needs to enter some identifier (email for example) and can optionally add their name. Currently there is no way to un-claim items that are claimed in this manner.

To activate this mode, go to the admin panel of your group and change the mode from "Wishlist" to "Registry".

## Configuration

There are several configuration options in the admin panel.

### Public Signup

By default, anyone with the url can signup for an account. You can turn this off and have it be invite only.

If you have [SMTP enabled](#smtp), then you can enter a user's email and an invite link will be sent there. Otherwise, an invite link will be generated for you to copy and send to the user manually.

### Suggestions

Suggestions are enabled by default. With suggestions enabled, you will be able to add items to another person's wishlist. There are a few different suggestion methods.

#### ▶ Approval Required

In this mode, the suggested item will need to be approved by the suggestee in order for it to show up on their wishlist. If the item is approved, it can be edited and deleted by the suggestee at any time.

#### ▶ Auto Approval

In this mode, the suggested item will be automatically approved and added to the wishlist. Similar to the previous method, the item can be edited and delted by the suggestee at any time.

#### ▶ Suprise Me

In this mode, the suggested item is automatically approved and added to the wishlist. **However**, the item only shows for everyone except for the suggestee. The suggestee cannot see and therefore cannot edit or delete the item once it has been added.

### SMTP

SMTP does not need to be configured for the app to function. SMTP enables inviting users via email and the forgot password flow. Without SMTP, you can still manually generate invite links and forgot password links.

### External Authentication

#### OAuth via OpenID Connect

_since v0.42.0_

Wishlist can be configured to authenticate users against any third-party Identity Provider which support the OpenID Connect specification. This includes providers such as Authelia, Authentik, Keycloak, and Google.

To configure your provider for authentication, navigate to the Wishlist Administration Settings page. You will be required to provide the Issuer URL (the URL of your Identity Provider), the Client ID, and the Client Secret. All other configurations are optional. Any and all role-based access should be handled with your Identity Provider.

The redirect URL to specify within your IdP will look like `https://<my_wishlist_domain>/login`

> [!NOTE]
> The first user to be created will need to be created with credentials via the setup wizard.

#### Proxy / Header

> [!WARNING]  
> When header authentication is enabled, Wishlist makes no assumptions about the validity of the headers. It is up to you to have your proxy properly configured. An improperly configured proxy **could allow anyone** to gain access to the application by forging the headers.

If you have a reverse proxy you want to use to login your users, you do it via our proxy authentication method. To configure this method, your proxy must send HTTP headers containing the name, username and email for the logged in user.
You configure this using environment variables.

`HEADER_AUTH_ENABLED`: Enable proxy authentication

`HEADER_USERNAME`: The name of the headers that contains the username of the user

`HEADER_NAME`: The name of the headers that contains the full name of the user

`HEADER_EMAIL`: The name of the headers that contains the email of the user

## Add items using a Bookmarklet

Wishlist supports adding items via a bookmarklet. Whenever you're on a product page that you want to add to Wishlist, you can click on your bookmarklet to open Wishlist in a new tab and instantly start creating a new item.

To create a bookmarklet, paste the following code into a [bookmarklet generator site](https://caiorss.github.io/bookmarklet-maker/). Change the two variables that have comments, generate, and save the bookmarklet.

```js
var url = document.URL.endsWith("/") ? document.URL.slice(0, -1) : document.URL;
var wishlist = "http://localhost:5173"; // host of your wishlist instance
var listId = "xyz"; // this is the id of the list you want to add the item to. You can get the id of the list from the URL

var list = "/lists/" + listId;
var dest = new URL(list + "/create-item", wishlist);
dest.searchParams.append("redirectTo", list);
dest.searchParams.append("productUrl", url);
window.open(dest, "_blank");
```

## Contributing

Code contributions are always welcome! If you have something in mind that you would like to work on, please open an issue or comment on an existing issue indicating your interest to make sure someone else isn't already working on it and to discuss any implementation details. Open a PR when you feel that it is ready. You can also open a draft PR as soon as you start work to help track progress.

### Translations

Translations are provided by the community and new translations are greatly appreciated. Translations are managed through [Weblate](https://hosted.weblate.org/projects/wishlist/wishlist-web/). With Weblate, you can contribute an entire language, or make suggestions to existing translations. If the language you wish to translate has not been added yet, you can request it [here](https://hosted.weblate.org/new-lang/wishlist/wishlist-web/). The translation strings use ICU Message Syntax which you can reference [here](https://formatjs.github.io/docs/core-concepts/icu-syntax).

**Translation Progress**

![Weblate translation status](https://hosted.weblate.org/widget/wishlist/wishlist-web/horizontal-auto.svg)
