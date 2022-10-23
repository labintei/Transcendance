import {Server} from "socket.io";
import { createServer} from "http";
import { readFileSync } from "fs";
import { Http2ServerRequest } from "http2";
import { io } from "socket.io-client"


// options port puis options
const serv = new Server((parseInt(process.env.WEBSITE_PORT, 10) || 3001),{});
// peut egalement se connecter a un server http
const httpServ = createServer();
const other = new Server(httpServ, {});
// peut egalement se connecter a un https server
const httpsServ = createServer({key: readFileSync("/key.pem"), cert: readFileSync("/path/to/my/cert.pem")})
const otherserv = new Server(httpsServ,{});
otherserv.on("connection", (socket) => {});
httpsServ.listen(3000);
// Server avec client certification
// Server part
const s = createServer({
    key: readFileSync("path/to/server-key.pem"),
    cert: readFileSync("path/to/server-cert.pem"),
    requestCert: true,
    ca: [
        readFileSync("/path/to/my-client.pem")
    ]
})
const ns = new Server(httpServer, {});
ns.engine.on("connection", (rawSocket) => {rawSocket.peerCertificate = rawSocket.request.client.getPeerCertifiacte()});
ns.on("connection", (socket) => {console.log(socket.conn.peerCertificate);});
s.listen(3000);
//client part
const socket = io("https://example.com", {key: readFileSync("path/to/client.pem"), cert: readFileSync("/path/to/client-cert.pem"), ca: [readFileSync("pathserver_path.pem")]});
other.on("connection", (socket) => {});
other.listen(3002);
// met en ecoute
serv.on("connection", (socket) => {});
serv.listen((parseInt(process.env.WEBSITE_PORT, 10) || 3001));


// ON peut utiliser in Server#Engine

const count = serv.engine.clientsCount;
// peut generer des uuid
// peut emmettre des evenements speciaux tels que des headers qui contiennent des cookies

serv.engine.on("initial_headers", (headers, req) => {
    headers["test"] = "123";
    headers["set-cookies"] = "mycookies";//...
});

serv.engine.on("connection_error", (err) => {
    console.log(err.req);
    console.log(err.code);
    console.log(err.message);
    console.log(err.context);
})