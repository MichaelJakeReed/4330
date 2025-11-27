# 4330
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First clone the code

Next run in powershell after moving into where file is stored
```bash
npm install
```
to install dependencies

Go into the code and create a file called .env and paste
```bash
DATABASE_URL= database you want to hook up


NEXT_PUBLIC_BASE_URL=http://127.0.0.1:3000
SESSION_SECRET=supersecretdevelopmentkey




SPOTIFY_CLIENT_ID= spotify client ID you get from spotify developer
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/spotify/callback --------> redirct link youll need to put into Spotify developer callback
```

Then
```bash
npm run dev
```

Open [http:///127.0.0.1:3000](http://127.0.0.1:3000) with your browser to see the result.


