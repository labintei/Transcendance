// peut creer des serveur avec NestJs Fastify HTTP/2 https express koa nest(ws) fastify... 
 // On va faire le server le plus basic possible

import { Server } from "socket.io";

 const s = new Server(3000, {});

 s.on("connection", (socket) => {});

 s.listen((parseInt(process.env.WEBSITE_PORT, 10) || 3001));

 // code 0 transport unknown 1 session id unknown 2 bad handshake methid, 3 Bad Request 4 Forbbiden 5 Unsupported protocol version
 s.on("connection_error", (err) => {
    console.log(err.req);
    console.log(err.code);
    console.log(err.message);
    console.log(err.context);
 });


 


