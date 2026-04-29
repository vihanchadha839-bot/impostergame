import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "";

// ─── Socket singleton ─────────────────────────────────────────────────────────
let socket = null;
function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL || window.location.origin, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

// ─── Emoji avatar helper ──────────────────────────────────────────────────────
const EMOJIS = ["⚽","🏆","🎯","🦁","🔥","🌟","💎","🎮","🚀","🦊","🐺","🎸"];
function getEmoji(name) { return EMOJIS[name.charCodeAt(0) % EMOJIS.length]; }

// ═════════════════════════════════════════════════════════════════════════════
// SCREENS
// ═════════════════════════════════════════════════════════════════════════════

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomeScreen({ onJoin }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState(null); // "create" | "join"
  const [error, setError] = useState("");

  const sock = getSocket();

  useEffect(() => {
    const onErr = (msg) => setError(msg);
    sock.on("error", onErr);
    return () => sock.off("error", onErr);
  }, []);

  useEffect(() => {
    const onJoined = ({ code, players, isHost }) => onJoin({ code, players, isHost });
    sock.on("room_joined", onJoined);
    return () => sock.off("room_joined", onJoined);
  }, [onJoin]);

  const handleCreate = () => {
    if (!name.trim()) return setError("Enter your name first");
    setError("");
    sock.emit("create_room", { name: name.trim() });
  };

  const handleJoin = () => {
    if (!name.trim()) return setError("Enter your name first");
    if (!code.trim()) return setError("Enter a room code");
    setError("");
    sock.emit("join_room", { name: name.trim(), code: code.trim().toUpperCase() });
  };

  return (
    <div className="screen">
      <div>
        <div className="logo">IMPOSTER<br /><span>QUESTION</span></div>
        <div className="subtitle" style={{marginTop:4}}>Pass-the-phone multiplayer game</div>
      </div>

      <div className="card">
        <div className="card-title">YOUR NAME</div>
        <input
          type="text"
          placeholder="Enter your name..."
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={16}
          autoComplete="off"
        />
      </div>

      {!mode && (
        <>
          <button className="btn btn-primary" onClick={() => setMode("create")}>
            ⚡ Create Room
          </button>
          <div className="divider">or</div>
          <button className="btn btn-secondary" onClick={() => setMode("join")}>
            🔑 Join Room
          </button>
        </>
      )}

      {mode === "create" && (
        <>
          <button className="btn btn-primary" onClick={handleCreate}>
            🚀 Create & Start
          </button>
          <button className="btn btn-secondary" onClick={() => { setMode(null); setError(""); }}>
            ← Back
          </button>
        </>
      )}

      {mode === "join" && (
        <>
          <div className="card">
            <div className="card-title">ROOM CODE</div>
            <input
              type="text"
              placeholder="Enter code (e.g. XK92A)"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={5}
              autoComplete="off"
            />
          </div>
          <button className="btn btn-primary" onClick={handleJoin}>
            🔑 Join Room
          </button>
          <button className="btn btn-secondary" onClick={() => { setMode(null); setError(""); }}>
            ← Back
          </button>
        </>
      )}

      {error && <div className="error-msg">⚠️ {error}</div>}

      <div className="card" style={{marginTop: "auto"}}>
        <div style={{fontSize:"0.8rem", color:"var(--text-muted)", lineHeight:1.6}}>
          <strong style={{color:"var(--green)"}}>How to play:</strong><br/>
          3–8 players • One is the imposter<br/>
          Everyone gets a question — the imposter's is slightly different<br/>
          Discuss → Vote → Reveal!
        </div>
      </div>
    </div>
  );
}

// ─── Lobby ────────────────────────────────────────────────────────────────────
function LobbyScreen({ code, players: initPlayers, isHost, onStart, onBack }) {
  const [players, setPlayers] = useState(initPlayers);
  const [error, setError] = useState("");
  const sock = getSocket();

  useEffect(() => {
    const onUpdate = (p) => setPlayers(p);
    const onErr = (msg) => setError(msg);
    const onStart = (data) => {}; // handled in parent
    sock.on("players_updated", onUpdate);
    sock.on("error", onErr);
    return () => {
      sock.off("players_updated", onUpdate);
      sock.off("error", onErr);
    };
  }, []);

  const handleStart = () => {
    if (players.length < 3) return setError("Need at least 3 players to start");
    setError("");
    sock.emit("start_game", { code });
  };

  return (
    <div className="screen">
      <div>
        <div className="logo" style={{fontSize:"2rem"}}>LOBBY</div>
        <div className="room-code" style={{marginTop:12}}>
          <div className="label">Room Code — share this!</div>
          <div className="code">{code}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">PLAYERS ({players.length}/8)</div>
        <div className="player-list">
          {players.map(p => (
            <div className="player-item" key={p.id}>
              <div className="player-avatar">{getEmoji(p.name)}</div>
              <span className="player-name">{p.name}</span>
              {p.isHost && <span className="host-badge">Host</span>}
            </div>
          ))}
        </div>
        {players.length < 3 && (
          <div className="waiting pulse" style={{marginTop:12}}>
            Waiting for more players... ({players.length}/3 min)
          </div>
        )}
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}

      {isHost ? (
        <button className="btn btn-primary" onClick={handleStart} disabled={players.length < 3}>
          ▶ START GAME
        </button>
      ) : (
        <div className="waiting pulse" style={{textAlign:"center"}}>
          Waiting for host to start...
        </div>
      )}

      <button className="btn btn-secondary" style={{marginTop:"auto"}} onClick={onBack}>
        ← Leave Room
      </button>
    </div>
  );
}

// ─── Question ────────────────────────────────────────────────────────────────
function QuestionScreen({ question, players, myId, code, onAllSeen }) {
  const [ready, setReady] = useState(false);
  const [readyCount, setReadyCount] = useState(0);
  const [total] = useState(players.length);
  const sock = getSocket();

  useEffect(() => {
    const onSeen = ({ seen }) => setReadyCount(seen);
    const onDiscuss = () => onAllSeen();
    sock.on("seen_update", onSeen);
    sock.on("phase_discuss", onDiscuss);
    return () => {
      sock.off("seen_update", onSeen);
      sock.off("phase_discuss", onDiscuss);
    };
  }, [onAllSeen]);

  const handleReady = () => {
    if (ready) return;
    setReady(true);
    sock.emit("seen_question", { code });
  };

  return (
    <div className="screen">
      <div>
        <div className="logo" style={{fontSize:"2rem"}}>YOUR QUESTION</div>
        <div className="subtitle">Read it — don't show anyone!</div>
      </div>

      <div className="question-box">
        <div className="question-label">YOUR QUESTION IS</div>
        <div className="question-text">{question}</div>
      </div>

      <div className="card" style={{fontSize:"0.85rem", color:"var(--text-muted)", textAlign:"center"}}>
        📌 Remember your question. Discuss with the group — but don't reveal it directly!
      </div>

      <button className="btn btn-primary" onClick={handleReady} disabled={ready}>
        {ready ? "✅ Waiting for others..." : "✋ I'm Ready to Vote"}
      </button>

      {ready && (
        <div className="seen-counter">
          <strong>{readyCount}</strong>/{total} players ready...
        </div>
      )}
    </div>
  );
}

// ─── Discuss ──────────────────────────────────────────────────────────────────
function DiscussScreen({ isHost, code, players, onVote }) {
  const sock = getSocket();

  useEffect(() => {
    const onVotePhase = ({ players }) => onVote(players);
    sock.on("phase_vote", onVotePhase);
    return () => sock.off("phase_vote", onVotePhase);
  }, [onVote]);

  const startVote = () => sock.emit("start_vote", { code });

  return (
    <div className="screen">
      <div>
        <div className="logo" style={{fontSize:"2rem"}}>🗣 DISCUSS</div>
        <div className="subtitle">Talk it out — who's the imposter?</div>
      </div>

      <div className="card">
        <div className="card-title">RULES</div>
        <div style={{fontSize:"0.9rem", color:"var(--text-muted)", lineHeight:1.7}}>
          ✅ Describe your question without saying it directly<br/>
          ✅ Ask others about their answers<br/>
          ❌ Don't reveal your exact question<br/>
          ❌ No lying about whether you're the imposter (optional 😈)
        </div>
      </div>

      <div className="card">
        <div className="card-title">PLAYERS</div>
        <div className="player-list">
          {players.map(p => (
            <div className="player-item" key={p.id}>
              <div className="player-avatar">{getEmoji(p.name)}</div>
              <span className="player-name">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <button className="btn btn-gold" onClick={startVote}>
          🗳 START VOTING
        </button>
      ) : (
        <div className="waiting pulse" style={{textAlign:"center"}}>
          Waiting for host to start voting...
        </div>
      )}
    </div>
  );
}

// ─── Vote ─────────────────────────────────────────────────────────────────────
function VoteScreen({ players, myId, code, onReveal }) {
  const [voted, setVoted] = useState(null);
  const [voteCount, setVoteCount] = useState(0);
  const [total, setTotal] = useState(players.length);
  const sock = getSocket();

  useEffect(() => {
    const onVoteUpdate = ({ voteCount, total }) => { setVoteCount(voteCount); setTotal(total); };
    const onRevealPhase = (data) => onReveal(data);
    sock.on("vote_update", onVoteUpdate);
    sock.on("phase_reveal", onRevealPhase);
    return () => {
      sock.off("vote_update", onVoteUpdate);
      sock.off("phase_reveal", onRevealPhase);
    };
  }, [onReveal]);

  const handleVote = (id) => {
    if (voted) return;
    setVoted(id);
    sock.emit("submit_vote", { code, votedId: id });
  };

  const others = players.filter(p => p.id !== myId);

  return (
    <div className="screen">
      <div>
        <div className="logo" style={{fontSize:"2rem"}}>🗳 VOTE</div>
        <div className="subtitle">Who do you think is the imposter?</div>
      </div>

      {!voted ? (
        <div className="vote-list">
          {others.map(p => (
            <button
              key={p.id}
              className={`vote-btn ${voted === p.id ? "selected" : ""}`}
              onClick={() => handleVote(p.id)}
              disabled={!!voted}
            >
              <span style={{fontSize:"1.3rem"}}>{getEmoji(p.name)}</span>
              <span>{p.name}</span>
              {voted === p.id && <span style={{marginLeft:"auto"}}>✅</span>}
            </button>
          ))}
        </div>
      ) : (
        <div className="card" style={{textAlign:"center"}}>
          <div style={{fontSize:"2rem", marginBottom:8}}>✅</div>
          <div style={{fontWeight:700}}>Vote submitted!</div>
          <div className="seen-counter" style={{marginTop:8}}>
            <strong>{voteCount}</strong>/{total} votes in...
          </div>
          <div className="waiting pulse" style={{marginTop:8}}>Waiting for others...</div>
        </div>
      )}

      {voted && (
        <div className="seen-counter">
          Voted for: <strong style={{color:"var(--green)"}}>{players.find(p=>p.id===voted)?.name}</strong>
        </div>
      )}
    </div>
  );
}

// ─── Reveal ───────────────────────────────────────────────────────────────────
function RevealScreen({ data, isHost, code, onPlayAgain }) {
  const { imposter, normalQuestion, imposterQuestion, imposterCaught, votes, tally, players } = data;
  const sock = getSocket();

  useEffect(() => {
    const onLobby = ({ players }) => onPlayAgain(players);
    sock.on("back_to_lobby", onLobby);
    return () => sock.off("back_to_lobby", onLobby);
  }, [onPlayAgain]);

  const maxVotes = Math.max(...Object.values(tally || {}), 1);

  return (
    <div className="screen">
      <div className={`reveal-banner ${imposterCaught ? "caught" : "escaped"}`}>
        <div className="reveal-emoji">{imposterCaught ? "🎉" : "😈"}</div>
        <div className="reveal-title">{imposterCaught ? "CAUGHT!" : "ESCAPED!"}</div>
        <div style={{fontSize:"0.95rem", color:"var(--text-muted)", marginTop:8}}>
          {imposterCaught
            ? `${imposter?.name} was the imposter!`
            : `${imposter?.name} fooled everyone!`}
        </div>
      </div>

      <div className="card">
        <div className="card-title">THE QUESTIONS</div>
        <div className="q-compare">
          <div className="q-box normal">
            <div className="qlabel">✅ Normal</div>
            <div className="qtext">{normalQuestion}</div>
          </div>
          <div className="q-box imposter-q">
            <div className="qlabel">🎭 Imposter</div>
            <div className="qtext">{imposterQuestion}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">VOTE TALLY</div>
        <div className="vote-tally">
          {players.map(p => {
            const count = tally?.[p.id] || 0;
            const isImposter = p.id === imposter?.id;
            return (
              <div className="tally-row" key={p.id}>
                <div className="tally-name" style={{color: isImposter ? "var(--red)" : "var(--text)"}}>
                  {getEmoji(p.name)} {p.name}{isImposter ? " 🎭" : ""}
                </div>
                <div className="tally-bar-wrap">
                  <div
                    className={`tally-bar ${isImposter ? "imposter" : ""}`}
                    style={{width: `${(count/maxVotes)*100}%`}}
                  />
                </div>
                <div className="tally-count">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {isHost ? (
        <button className="btn btn-primary" onClick={() => sock.emit("play_again", { code })}>
          🔄 PLAY AGAIN
        </button>
      ) : (
        <div className="waiting pulse" style={{textAlign:"center"}}>
          Waiting for host to restart...
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("home");
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [myQuestion, setMyQuestion] = useState("");
  const [revealData, setRevealData] = useState(null);
  const myIdRef = useRef(null);

  const sock = getSocket();

  // Get my socket id
  useEffect(() => {
    const onConnect = () => { myIdRef.current = sock.id; };
    if (sock.connected) myIdRef.current = sock.id;
    sock.on("connect", onConnect);
    return () => sock.off("connect", onConnect);
  }, []);

  // Game started event
  useEffect(() => {
const onGameStarted = ({ question, players }) => {
      setMyQuestion(question);
      setPlayers(players);
      setScreen("question");
    };
    sock.on("game_started", onGameStarted);
    return () => sock.off("game_started", onGameStarted);
  }, []);

  const handleJoin = ({ code, players, isHost }) => {
    setRoomCode(code);
    setPlayers(players);
    setIsHost(isHost);
    setScreen("lobby");
  };

  const handleAllSeen = () => setScreen("discuss");
  const handleVote = (players) => { setPlayers(players); setScreen("vote"); };
  const handleReveal = (data) => { setRevealData(data); setScreen("reveal"); };
  const handlePlayAgain = (players) => { setPlayers(players); setScreen("lobby"); };

  if (screen === "home") return <HomeScreen onJoin={handleJoin} />;
  if (screen === "lobby") return (
    <LobbyScreen
      code={roomCode} players={players} isHost={isHost}
      onStart={() => {}} onBack={() => setScreen("home")}
    />
  );
  if (screen === "question") return (
    <QuestionScreen
      question={myQuestion} players={players} myId={myIdRef.current}
      code={roomCode} onAllSeen={handleAllSeen}
    />
  );
  if (screen === "discuss") return (
    <DiscussScreen isHost={isHost} code={roomCode} players={players} onVote={handleVote} />
  );
  if (screen === "vote") return (
    <VoteScreen players={players} myId={myIdRef.current} code={roomCode} onReveal={handleReveal} />
  );
  if (screen === "reveal") return (
    <RevealScreen data={revealData} isHost={isHost} code={roomCode} onPlayAgain={handlePlayAgain} />
  );

  return null;
}
