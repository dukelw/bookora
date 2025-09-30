// const { io } = require("socket.io-client");
//
// const socket = io("http://localhost:4000"); // backend URL
// const bookId = "68c964ca646bc995563f2d09";
//
// socket.on("connect", () => {
//   console.log(" Connected to WebSocket server");
//   // Join room
//   socket.emit("joinProductRoom", bookId);
// });
//
// socket.on("ratingUpdate", (data) => {
//   console.log(" Realtime rating update:", data);
// });
//
// socket.on("disconnect", () => {
//   console.log(" Disconnected");
// });
