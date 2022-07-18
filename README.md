<a href="https://stapp.studio" target="__blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://i.imgur.com/V24uWnb.png">
    <source media="(prefers-color-scheme: light)" srcset="https://i.imgur.com/bwYR7a5.png">
    <img alt="Stapp Studio horizontal logo" src="https://i.imgur.com/bwYR7a5.png">
  </picture>
</a>

<br />

# Passkeys with Firebase - Example Project

An example repository of how to use Multi-Device FIDO Credentials (a.k.a. Passkeys) with Firebase!

- Backend server is entirely built on Firebase Functions;
- Challenges and credentials are stored on Firebase Firestore;
- User is created on Firebase Auth and authenticated using custom tokens generated after the server validates the passkey;
- Frontend is an SPA made with [Nuxt 3 RC](http://v3.nuxtjs.org) and deployed on Firebase Hosting;

WebAuthn support both on server and browser is provided by [SimpleWebAuthn](https://github.com/MasterKale/SimpleWebAuthn) packages.

> A live demo of this repo can be found at https://passkey.stapp.studio :)

## Coming Soon

- A better README;
- WebAuthn Autofill support;
- Mobile implementation in Flutter;

***

## Need any help with your app? We are available for hiring!

Do you want to build an app or need any help to grow your existing Flutter app? We can help you!

Here at Stapp Studio we are building experiences for mobile for over 8 years.

[Let's talk about your app!](mailto:us@stapp.studio)