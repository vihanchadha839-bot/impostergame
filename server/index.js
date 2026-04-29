const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// ─── Question Bank ────────────────────────────────────────────────────────────
const QUESTIONS = [
  // Football
  { normal: "Name a famous football stadium", imposter: "Name a famous basketball arena" },
  { normal: "Who is the greatest footballer of all time?", imposter: "Who is the greatest tennis player of all time?" },
  { normal: "What is the offside rule in football?", imposter: "What is the offsides rule in ice hockey?" },
  { normal: "Name a football World Cup host country", imposter: "Name an Olympics host city" },
  { normal: "What does a yellow card mean in football?", imposter: "What does a red flag mean in Formula 1?" },
  { normal: "Name a famous football club from Spain", imposter: "Name a famous football club from Italy" },
  { normal: "How many players are on a football pitch per team?", imposter: "How many players are on a rugby team?" },
  { normal: "What do you call it when a footballer scores 3 goals?", imposter: "What do you call it when a cricketer takes 3 wickets in a row?" },
  { normal: "Name a famous football manager", imposter: "Name a famous cricket coach" },
  { normal: "What is the Champions League?", imposter: "What is the Europa League?" },
  // Food
  { normal: "Name a dish you'd eat at a BBQ", imposter: "Name a dish you'd eat at a fancy restaurant" },
  { normal: "What is the most popular pizza topping?", imposter: "What is the most popular pasta sauce?" },
  { normal: "Name a street food from India", imposter: "Name a street food from Mexico" },
  { normal: "What do you put in a club sandwich?", imposter: "What do you put in a BLT sandwich?" },
  { normal: "Name a dessert that uses chocolate", imposter: "Name a dessert that uses vanilla" },
  { normal: "What's a common breakfast in the UK?", imposter: "What's a common breakfast in Japan?" },
  { normal: "Name a popular fast food chain", imposter: "Name a popular coffee chain" },
  { normal: "What ingredient makes bread rise?", imposter: "What ingredient makes cake fluffy?" },
  // Movies & TV
  { normal: "Name a Marvel superhero", imposter: "Name a DC superhero" },
  { normal: "What is the most watched Netflix show ever?", imposter: "What is the most watched HBO show ever?" },
  { normal: "Name a film that won Best Picture at the Oscars", imposter: "Name a film that won the Palme d'Or at Cannes" },
  { normal: "Name a famous horror movie villain", imposter: "Name a famous thriller movie villain" },
  { normal: "What is the highest grossing film of all time?", imposter: "What is the most expensive film ever made?" },
  { normal: "Name a popular reality TV show", imposter: "Name a popular game show" },
  { normal: "Name a famous animated Disney film", imposter: "Name a famous animated Pixar film" },
  // Music
  { normal: "Name a song by Beyoncé", imposter: "Name a song by Rihanna" },
  { normal: "What instrument does a drummer play?", imposter: "What instrument does a bassist play?" },
  { normal: "Name a famous music festival", imposter: "Name a famous awards show" },
  { normal: "What genre is Drake?", imposter: "What genre is Kendrick Lamar?" },
  { normal: "Name the best-selling album of all time", imposter: "Name the best-selling single of all time" },
  // Travel
  { normal: "Name a famous landmark in Paris", imposter: "Name a famous landmark in Rome" },
  { normal: "What country is the Amazon rainforest mainly in?", imposter: "What country is the Sahara desert mainly in?" },
  { normal: "Name a popular beach holiday destination", imposter: "Name a popular ski holiday destination" },
  { normal: "What is the world's most visited city?", imposter: "What is the world's most visited country?" },
  { normal: "Name a famous national park", imposter: "Name a famous nature reserve" },
  // Tech
  { normal: "Who founded Apple?", imposter: "Who founded Microsoft?" },
  { normal: "What does AI stand for?", imposter: "What does ML stand for?" },
  { normal: "Name a popular social media platform", imposter: "Name a popular messaging app" },
  { normal: "What is the best-selling video game console?", imposter: "What is the best-selling handheld console?" },
  { normal: "Name a programming language", imposter: "Name a database system" },
  // Random & Funny
  { normal: "What's something you'd find in a teenager's bedroom?", imposter: "What's something you'd find in a grandparent's living room?" },
  { normal: "Name something people do when they're bored", imposter: "Name something people do when they're nervous" },
  { normal: "What's a common excuse for being late?", imposter: "What's a common excuse for not doing homework?" },
  { normal: "Name something that gets louder as the night goes on", imposter: "Name something that gets quieter as the night goes on" },
  { normal: "What do you bring to a house party?", imposter: "What do you bring to a wedding?" },
  { normal: "Name a job people lie about having", imposter: "Name a job people are embarrassed to admit they have" },
  { normal: "What's something you'd regret saying at a job interview?", imposter: "What's something you'd regret saying on a first date?" },
  { normal: "Name something people do in the shower", imposter: "Name something people do in the car alone" },
  // Sports (non-football)
  { normal: "Name an Olympic sport that uses a ball", imposter: "Name an Olympic sport that uses a racket" },
  { normal: "What country dominates in sumo wrestling?", imposter: "What country dominates in table tennis?" },
  { normal: "Name a famous boxer", imposter: "Name a famous MMA fighter" },
  { normal: "What sport is played at Wimbledon?", imposter: "What sport is played at Augusta National?" },
  // Animals
  { normal: "Name an animal that lives in the jungle", imposter: "Name an animal that lives in the savannah" },
  { normal: "What's the fastest land animal?", imposter: "What's the fastest animal in water?" },
  { normal: "Name an animal that people keep as an exotic pet", imposter: "Name an animal that people are terrified of" },
  // History & Culture
  { normal: "Name a famous ancient civilization", imposter: "Name a famous medieval kingdom" },
  { normal: "Who painted the Mona Lisa?", imposter: "Who painted the Sistine Chapel ceiling?" },
  { normal: "Name a country that had a revolution in the 20th century", imposter: "Name a country that gained independence in the 20th century" },
  { normal: "Name something associated with ancient Egypt", imposter: "Name something associated with ancient Greece" },
  // Lifestyle
  { normal: "Name a reason someone might go to therapy", imposter: "Name a reason someone might hire a life coach" },
  { normal: "What's a typical Sunday morning activity?", imposter: "What's a typical Saturday night activity?" },
  { normal: "Name something people do to show off", imposter: "Name something people do to impress their in-laws" },
  { normal: "What do rich people waste money on?", imposter: "What do broke people waste money on?" },
  { normal: "Name a sign that someone is in love", imposter: "Name a sign that someone is obsessed" },
];

// ─── In-Memory Rooms ──────────────────────────────────────────────────────────
const rooms = {};

function generateCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function getRandomQuestion() {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
}

// ─── Socket Logic ─────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("create_room", ({ name }) => {
    const code = generateCode();
    rooms[code] = {
      code,
      players: [{ id: socket.id, name, isHost: true }],
      phase: "lobby", // lobby | question | discuss | vote | reveal
      imposter: null,
      question: null,
      votes: {},
      seenCount: 0,
    };
    socket.join(code);
    socket.emit("room_joined", { code, players: rooms[code].players, isHost: true });
    console.log(`Room ${code} created by ${name}`);
  });

  socket.on("join_room", ({ name, code }) => {
    const room = rooms[code];
    if (!room) return socket.emit("error", "Room not found");
    if (room.phase !== "lobby") return socket.emit("error", "Game already started");
    if (room.players.length >= 8) return socket.emit("error", "Room is full");

    room.players.push({ id: socket.id, name, isHost: false });
    socket.join(code);
    socket.emit("room_joined", { code, players: room.players, isHost: false });
    io.to(code).emit("players_updated", room.players);
    console.log(`${name} joined room ${code}`);
  });

  socket.on("start_game", ({ code }) => {
    const room = rooms[code];
    if (!room) return;
    if (room.players.length < 3) return socket.emit("error", "Need at least 3 players");

    // Pick imposter and question
    const imposterIndex = Math.floor(Math.random() * room.players.length);
    room.imposter = room.players[imposterIndex].id;
    room.question = getRandomQuestion();
    room.phase = "question";
    room.seenCount = 0;
    room.votes = {};

    // Tell everyone to go to question phase, send each their own question
    room.players.forEach((p) => {
      const q = p.id === room.imposter ? room.question.imposter : room.question.normal;
      io.to(p.id).emit("game_started", { question: q });
    });
    console.log(`Game started in room ${code}, imposter: ${room.imposter}`);
  });

  socket.on("seen_question", ({ code }) => {
    const room = rooms[code];
    if (!room) return;
    room.seenCount++;
    io.to(code).emit("seen_update", { seen: room.seenCount, total: room.players.length });
    if (room.seenCount >= room.players.length) {
      room.phase = "discuss";
      io.to(code).emit("phase_discuss");
    }
  });

  socket.on("start_vote", ({ code }) => {
    const room = rooms[code];
    if (!room) return;
    room.phase = "vote";
    io.to(code).emit("phase_vote", { players: room.players });
  });

  socket.on("submit_vote", ({ code, votedId }) => {
    const room = rooms[code];
    if (!room) return;
    room.votes[socket.id] = votedId;

    const voteCount = Object.keys(room.votes).length;
    io.to(code).emit("vote_update", { voteCount, total: room.players.length });

    if (voteCount >= room.players.length) {
      // Tally votes
      const tally = {};
      Object.values(room.votes).forEach((id) => {
        tally[id] = (tally[id] || 0) + 1;
      });

      const mostVoted = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
      const imposterCaught = mostVoted === room.imposter;
      const imposterPlayer = room.players.find((p) => p.id === room.imposter);

      room.phase = "reveal";
      io.to(code).emit("phase_reveal", {
        imposter: imposterPlayer,
        normalQuestion: room.question.normal,
        imposterQuestion: room.question.imposter,
        imposterCaught,
        votes: room.votes,
        tally,
        players: room.players,
      });
    }
  });

  socket.on("play_again", ({ code }) => {
    const room = rooms[code];
    if (!room) return;
    room.phase = "lobby";
    room.imposter = null;
    room.question = null;
    room.votes = {};
    room.seenCount = 0;
    io.to(code).emit("back_to_lobby", { players: room.players });
  });

  socket.on("disconnect", () => {
    for (const code in rooms) {
      const room = rooms[code];
      const idx = room.players.findIndex((p) => p.id === socket.id);
      if (idx === -1) continue;
      room.players.splice(idx, 1);
      if (room.players.length === 0) {
        delete rooms[code];
      } else {
        if (idx === 0) room.players[0].isHost = true;
        io.to(code).emit("players_updated", room.players);
      }
      break;
    }
    console.log("Disconnected:", socket.id);
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("Imposter Game Server Running"));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
