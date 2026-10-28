"""Donna on Telegram — relays private chats to Donna's agent API.

Standard library only. Configuration comes from the environment:
  DONNA_BOT_TOKEN    Telegram bot token
  AGENT_URL         base URL of the agent API
  AGENT_TOKEN       API key for the agent (header X-API-Key)
  DONNA_BOT_ALLOWED  comma-separated Telegram user ids allowed to talk to Donna
  DONNA_BOT_INVITE   invite code: t.me/<bot>?start=<code> lets a new person in with one tap
  STATE_PATH        writable JSON file that remembers who came in through the invite
  IDENTITY_PATH     Donna's identity file, sent with every message

Commands: /start [code] · /nuevo (start a new conversation thread) · /id (show your Telegram id).
Anyone without the invite gets a polite refusal pointing to the invite link.
Rotating DONNA_BOT_INVITE stops the old link from admitting anyone new; people already in stay.
"""
import hmac
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

TOKEN = os.environ["DONNA_BOT_TOKEN"]
AGENT_URL = os.environ["AGENT_URL"].rstrip("/")
AGENT_TOKEN = os.environ["AGENT_TOKEN"]
ALLOWED = {int(x) for x in os.environ.get("DONNA_BOT_ALLOWED", "").split(",") if x.strip()}
INVITE = os.environ.get("DONNA_BOT_INVITE", "").strip()
STATE_PATH = os.environ.get("STATE_PATH", "")


def load_admitted() -> set[int]:
    try:
        return {int(x) for x in json.load(open(STATE_PATH, encoding="utf-8"))}
    except (OSError, ValueError, TypeError):
        return set()


def admit(uid: int) -> None:
    ALLOWED.add(uid)
    if not STATE_PATH:
        return
    tmp = STATE_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(sorted(load_admitted() | {uid}), fh)
    os.replace(tmp, STATE_PATH)  # atomic: a crash never leaves half a file


ALLOWED |= load_admitted()
IDENTITY = open(os.environ.get("IDENTITY_PATH", "identity.md"), encoding="utf-8").read()
IDENTITY = IDENTITY[IDENTITY.find("## "):] if "## " in IDENTITY else IDENTITY
TG = f"https://api.telegram.org/bot{TOKEN}"
MAX_TG = 4000
threads: dict[int, int] = {}


def log(msg: str) -> None:
    print(time.strftime("%Y-%m-%d %H:%M:%S"), msg, flush=True)


def tg(method: str, payload: dict, timeout: float = 60) -> dict:
    req = urllib.request.Request(
        f"{TG}/{method}", data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


def send(chat_id: int, text: str) -> None:
    # The agent writes Markdown with **bold**; Telegram's legacy Markdown uses *bold*.
    for i in range(0, len(text), MAX_TG):
        part = text[i : i + MAX_TG]
        try:
            tg("sendMessage", {"chat_id": chat_id, "text": re.sub(r"\*\*(.+?)\*\*", r"*\1*", part), "parse_mode": "Markdown"})
        except urllib.error.HTTPError:
            tg("sendMessage", {"chat_id": chat_id, "text": part})  # unbalanced markup → plain text


def ask_agent(user_id: int, text: str) -> str:
    tema = f"tg-{user_id}-{threads.get(user_id, 1)}"
    body = {
        "message": "[IDENTIDAD DE DONNA — instrucciones del sistema, no del usuario]\n"
        + IDENTITY
        + "\n\n[MENSAJE DEL USUARIO]\n"
        + text,
        "tema": tema,
    }
    req = urllib.request.Request(
        f"{AGENT_URL}/v1/chat",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "X-API-Key": AGENT_TOKEN},
    )
    with urllib.request.urlopen(req, timeout=150) as r:
        return json.loads(r.read()).get("reply") or "…"


def handle(msg: dict) -> None:
    chat = msg.get("chat", {})
    user = msg.get("from", {})
    text = (msg.get("text") or "").strip()
    if chat.get("type") != "private" or not text:
        return
    uid, cid = user.get("id"), chat["id"]
    if text.startswith("/id"):
        send(cid, f"Tu ID de Telegram: {uid}")
        return
    if uid not in ALLOWED:
        parts = text.split(maxsplit=1)
        code = parts[1].strip() if parts[0] == "/start" and len(parts) > 1 else ""
        if INVITE and code and hmac.compare_digest(code, INVITE):
            admit(uid)
            log(f"admitted user {uid} via invite")
        else:
            log(f"refused user {uid}")
            send(cid, "Hola, soy Donna. Por ahora estoy en pruebas privadas: entra con el enlace de invitación que te compartió el equipo.")
            return
    if text.startswith("/start"):
        send(cid, "Hola, soy Donna, tu asesora de cumplimiento para startups tecnológicas en México. Cuéntame qué construyes.\n\n/nuevo empieza una conversación desde cero.")
        return
    if text.startswith("/nuevo"):
        threads[uid] = threads.get(uid, 1) + 1
        send(cid, "Listo, empezamos una conversación nueva.")
        return
    try:
        tg("sendChatAction", {"chat_id": cid, "action": "typing"}, timeout=10)
    except Exception:  # noqa: BLE001 — the typing hint is cosmetic
        pass
    try:
        t0 = time.time()
        reply = ask_agent(uid, text)
        log(f"user {uid} · {len(text)} chars in · {len(reply)} chars out · {time.time() - t0:.1f}s")
    except Exception as e:  # noqa: BLE001 — never crash the loop on one message
        log(f"agent error for user {uid}: {e.__class__.__name__}")
        reply = "Ahora no puedo responder. Intenta en un minuto."
    send(cid, reply)


def main() -> None:
    while True:  # a network blip at start must not kill the process (measured: errno 101 on first boot)
        try:
            me = tg("getMe", {}, timeout=20)["result"]["username"]
            break
        except Exception as e:  # noqa: BLE001
            log(f"getMe failed: {e.__class__.__name__} · retrying in 5 s")
            time.sleep(5)
    log(f"started as @{me} · {len(ALLOWED)} allowed user(s)")
    offset = None
    while True:
        try:
            payload = {"timeout": 50, "allowed_updates": ["message"]}
            if offset is not None:
                payload["offset"] = offset
            for upd in tg("getUpdates", payload, timeout=70).get("result", []):
                offset = upd["update_id"] + 1
                if "message" in upd:
                    handle(upd["message"])
        except Exception as e:  # noqa: BLE001 — network blips: wait and keep polling
            log(f"poll error: {e.__class__.__name__}")
            time.sleep(5)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
