import asyncio
import contextlib
from dataclasses import dataclass

from livekit import rtc
from livekit.agents import AgentSession
from livekit.plugins import liveavatar


@dataclass
class AgentHandle:
    task: asyncio.Task
    room: rtc.Room


async def run_liveavatar_agent(
    *,
    livekit_url: str,
    livekit_agent_token: str,
    avatar_id: str,
    session_id: str,
) -> None:
    """Join the LiveKit room as the agent participant and start the HeyGen LiveAvatar.

    Why this exists:
    - In HeyGen LiveAvatar, `/sessions/start` returns BOTH a client token and an agent token.
    - The *agent* participant is responsible for publishing the avatar A/V tracks into the room.
    - If only the browser joins (client token) you'll connect but see no tracks.

    This function:
    - connects a LiveKit RTC Room using the agent token
    - starts the liveavatar.AvatarSession
    - blocks until disconnected.
    """

    room = rtc.Room()

    @room.on("disconnected")
    def _on_disconnected(*args, **kwargs):
        # let the main await below finish
        pass

    await room.connect(livekit_url, livekit_agent_token)

    agent_session = AgentSession()

    # AvatarSession config per LiveKit docs
    avatar = liveavatar.AvatarSession(
        avatar_id=avatar_id,
        # keep a stable identity for debugging
        participant_identity=f"liveavatar-agent-{session_id}",
    )

    # Attach and start publishing tracks
    await avatar.start(agent_session, room=room)

    # Keep running until disconnected / cancelled
    try:
        while str(room.connection_state).lower() != "disconnected":
            await asyncio.sleep(0.5)
    finally:
        try:
            await room.disconnect()
        except Exception:
            pass


class AgentManager:
    """Small in-process manager for one agent per LiveAvatar session_id."""

    def __init__(self):
        self._by_session_id: dict[str, AgentHandle] = {}

    async def start(self, *, livekit_url: str, livekit_agent_token: str, avatar_id: str, session_id: str) -> None:
        if session_id in self._by_session_id:
            return

        room = rtc.Room()

        async def _runner():
            await room.connect(livekit_url, livekit_agent_token)
            agent_session = AgentSession()
            avatar = liveavatar.AvatarSession(
                avatar_id=avatar_id,
                participant_identity=f"liveavatar-agent-{session_id}",
            )
            await avatar.start(agent_session, room=room)
            while str(room.connection_state).lower() != "disconnected":
                await asyncio.sleep(0.5)

        task = asyncio.create_task(_runner())
        self._by_session_id[session_id] = AgentHandle(task=task, room=room)

    async def stop(self, session_id: str) -> None:
        h = self._by_session_id.pop(session_id, None)
        if not h:
            return
        try:
            await h.room.disconnect()
        except Exception:
            pass
        if not h.task.done():
            h.task.cancel()
            with contextlib.suppress(asyncio.CancelledError, Exception):
                await h.task

    def is_running(self, session_id: str) -> bool:
        h = self._by_session_id.get(session_id)
        return bool(h and not h.task.done())


# singleton
AGENT_MANAGER = AgentManager()

