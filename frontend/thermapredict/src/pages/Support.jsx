import { useEffect, useRef, useState } from "react";
import ChatMarkdown from "../components/ChatMarkdown";
import PageShell from "../components/PageShell";
import { MAX_CHAT_HISTORY, MAX_CHAT_MESSAGE, sendChatMessage } from "../chat_client";
import { getMachines } from "../machines_client";
import { predictFailure } from "../predict_client";
import { supabase } from "../supabase";

const chatErrors = {
  400: "Check your message and remove any passwords or tokens before trying again.",
  401: "Your session expired or could not be verified. Sign in to continue.",
  404: "This machine is unavailable. Select another machine or ask a general question.",
  413: "This conversation is too large. Start a new conversation and try again.",
  429: "ThermaBot is busy or has reached its request limit. Wait a minute and try again.",
  502: "ThermaBot could not answer. Try rephrasing your question.",
  503: "ThermaBot is temporarily unavailable. Try again later.",
  504: "ThermaBot took too long to respond. Try again.",
};

function Support() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [machines, setMachines] = useState([]);
  const [machineError, setMachineError] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [conversations, setConversations] = useState([{ id: 0, machineId: null, messages: [] }]);
  const [activeId, setActiveId] = useState(0);
  const nextId = useRef(1);
  const requestRef = useRef(null);
  const transcript = useRef(null);
  const latestReply = useRef(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState("");
  const [error, setError] = useState(null);
  const conversation = conversations.find(({ id }) => id === activeId);
  const { machineId, messages } = conversation;
  const selected = machines.find((machine) => machine.Machine_ID === machineId);
  const result = analysis?.machineId === machineId ? analysis.result : null;
  const analysisFailed = analysis?.machineId === machineId && analysis.failed;

  useEffect(() => {
    let active = true;
    getMachines().then((rows) => {
      if (active) setMachines(rows);
    }).catch(() => {
      if (active) setMachineError(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    predictFailure({ payload: selected })
      .then((prediction) => {
        if (active) setAnalysis({ machineId: selected.Machine_ID, result: prediction });
      })
      .catch(() => {
        if (active) setAnalysis({ machineId: selected.Machine_ID, failed: true });
      });
    return () => { active = false; };
  }, [selected]);

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    const panel = transcript.current;
    if (!panel?.clientHeight || !(messages.length || pending || error)) return;

    const reply = latestReply.current;
    if (!pending && !error && reply && reply.offsetHeight > panel.clientHeight) {
      const top = reply.getBoundingClientRect().top - panel.getBoundingClientRect().top;
      panel.scrollTop += top;
    } else {
      panel.scrollTop = panel.scrollHeight;
    }
  }, [messages, pending, error, historyOpen]);

  function openConversation(id) {
    requestRef.current?.abort();
    requestRef.current = null;
    setActiveId(id);
    setPending("");
    setDraft("");
    setError(null);
    setHistoryOpen(false);
  }

  function newConversation(contextId) {
    const id = nextId.current++;
    setConversations((current) => [
      { id, machineId: contextId, messages: [] },
      ...current,
    ].slice(0, 20));
    openConversation(id);
  }

  async function send(text) {
    const message = text.trim();
    if (!message || message.length > MAX_CHAT_MESSAGE || requestRef.current || error?.status === 401) return;

    const controller = new AbortController();
    requestRef.current = controller;
    setDraft("");
    setPending(message);
    setError(null);
    try {
      const { reply } = await sendChatMessage(message, messages.slice(-MAX_CHAT_HISTORY), machineId, controller.signal);
      if (controller.signal.aborted || requestRef.current !== controller) return;

      setConversations((current) => current.map((item) => item.id === activeId ? {
        ...item,
        messages: [
          ...item.messages,
          { role: "user", content: message },
          { role: "assistant", content: reply },
        ].slice(-40),
      } : item));
    } catch (failure) {
      if (controller.signal.aborted || requestRef.current !== controller) return;
      setDraft((current) => current || message);
      setError({ status: failure.status, message: chatErrors[failure.status] || "Could not reach ThermaBot. Check your connection and try again." });
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setPending("");
      }
    }
  }

  async function returnToSignIn() {
    try {
      const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
      if (signOutError) throw signOutError;
    } catch {
      setError({ status: 401, message: "Could not end this session. Try signing out again." });
    }
  }

  const currentLabel = selected ? selected.Machine_Type + " #" + selected.Machine_ID : "General maintenance";
  const historyTitle = (item) => item.messages[0]?.content
    || (item.machineId ? "Machine " + item.machineId : "General maintenance");
  const matching = conversations.filter((item) =>
    historyTitle(item).toLowerCase().includes(search.trim().toLowerCase())
  );
  const prompt = selected
    ? "Explain this machine's readings and predicted risk."
    : "What readings are useful for predictive maintenance?";
  const readings = selected ? [
    ["Temperature", selected.Temperature_C, " C"],
    ["Vibration", selected.Vibration_mms ?? selected.Vibration_mm_s, " mm/s"],
    ["Sound", selected.Sound_dB, " dB"],
    ["Power", selected.Power_Consumption_kW, " kW"],
  ] : [];

  function renderMessage(role, content, key) {
    const isAssistant = role === "assistant";
    return (
      <li
        key={key}
        ref={isAssistant && key === messages.length - 1 ? latestReply : undefined}
        className={isAssistant
          ? "w-full min-w-0 rounded-[24px] bg-[#eef2ff] p-4 text-slate-800 sm:p-6"
          : "ml-auto w-fit min-w-0 max-w-[90%] rounded-[24px] bg-blue-600 px-4 py-3 text-white"}
      >
        <p className={isAssistant ? "mb-3 text-sm font-semibold text-blue-800" : "mb-1 text-sm font-semibold"}>{isAssistant ? "ThermaBot · AI-generated advice" : "You"}</p>
        {isAssistant
          ? <ChatMarkdown content={content} />
          : <p className="whitespace-pre-wrap wrap-anywhere leading-relaxed">{content}</p>}
      </li>
    );
  }

  return (
    <PageShell>
      <div className="flex min-h-72 min-w-0 flex-1 flex-col xl:flex-row">
        <button
          type="button"
          aria-expanded={historyOpen}
          aria-controls="conversation-history"
          className="min-h-11 shrink-0 self-start px-4 font-semibold text-blue-700 xl:hidden"
          onClick={() => setHistoryOpen(!historyOpen)}
        >
          {historyOpen ? "Hide history and machine options" : "Show history and machine options"}
        </button>

        <aside
          id="conversation-history"
          aria-label="Conversation history"
          className={`${historyOpen ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto bg-[#f7f7fd] p-4 xl:flex xl:w-64 xl:flex-none xl:border-r xl:border-gray-200 2xl:w-80`}
        >
          <h2 className="text-2xl font-bold text-[#111827]">Conversation history</h2>
          <input
            aria-label="Search history"
            placeholder="Search history..."
            value={search}
            maxLength={160}
            onChange={(event) => setSearch(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4"
          />
          <label className="block text-sm font-semibold">
            Machine context
            <select
              value={machineId ?? ""}
              onChange={(event) => newConversation(event.target.value || null)}
              className="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
            >
              <option value="">General maintenance</option>
              {machines.map((machine) => (
                <option key={machine.Machine_ID} value={machine.Machine_ID}>
                  {machine.Machine_Type} #{machine.Machine_ID}
                </option>
              ))}
            </select>
          </label>
          {machineError && <p role="status" className="text-sm">Machine list unavailable. You can still ask general questions.</p>}
          <button
            type="button"
            onClick={() => newConversation(machineId)}
            className="min-h-12 rounded-[36px] border-2 border-dashed border-gray-300 font-semibold transition hover:bg-gray-100"
          >
            + New Conversation
          </button>
          <ul className="space-y-3">
            {matching.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={activeId === item.id ? "true" : undefined}
                  onClick={() => item.id === activeId ? setHistoryOpen(false) : openConversation(item.id)}
                  className="w-full rounded-[28px] border border-gray-200 bg-white p-4 text-left font-semibold wrap-anywhere aria-current:border-blue-500"
                >
                  {historyTitle(item).slice(0, 80)}
                </button>
              </li>
            ))}
          </ul>
          {!matching.length && <p className="text-sm text-gray-500">No matching conversations.</p>}
        </aside>

        <section aria-label="ThermaBot" className={`${historyOpen ? "hidden" : "flex"} min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7fd] xl:flex`}>
          <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3 py-2 sm:px-6">
            <div aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-600 text-2xl text-white">🤖</div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold">ThermaBot</h2>
              <p className="wrap-anywhere text-sm text-blue-700">{currentLabel}</p>
            </div>
          </header>

          <div ref={transcript} className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain wrap-anywhere px-3 py-5 sm:px-6">
            {!messages.length && !pending && (
              <div className="mb-6 flex flex-col items-center text-center">
                <div aria-hidden="true" className="grid size-16 place-items-center rounded-[42px] bg-[#eef2ff] text-4xl sm:size-24">🤖</div>
                <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">How can I help today?</h1>
                <p className="mt-4 max-w-prose text-gray-600">Ask about predictive maintenance or select a machine to discuss its dataset readings and estimated risk.</p>
                <button
                  type="button"
                  onClick={() => send(prompt)}
                  disabled={error?.status === 401}
                  className="mt-5 min-h-11 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm disabled:opacity-50 sm:text-base"
                >
                  {prompt}
                </button>
              </div>
            )}

            {selected && (
              <div className="mx-auto mb-6 max-w-[1350px] rounded-[40px] border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <h3 className="text-xl font-bold">{selected.Machine_Type}</h3>
                <p className="mt-2 text-sm font-semibold text-gray-600">Dataset sensor readings</p>
                <dl className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] gap-3">
                  {readings.map(([label, value, unit]) => (
                    <div key={label} className="rounded-[28px] bg-[#f8f9fd] p-4">
                      <dt className="text-sm text-gray-600">{label}</dt>
                      <dd className="mt-2 text-xl font-bold">{value == null ? "Unavailable" : value + unit}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-sm font-semibold">
                  AdaBoost estimated risk: {result ? result.failure_probability + "% · " + result.status
                    : analysisFailed ? "Unavailable" : "Calculating..."}
                </p>
                {result && (
                  <div
                    role="meter"
                    aria-label="AdaBoost estimated failure probability"
                    aria-valuenow={result.failure_probability}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100"
                  >
                    <div className="h-full rounded-full bg-blue-600" style={{ width: result.failure_probability + "%" }} />
                  </div>
                )}
              </div>
            )}

            <ul aria-label="Chat messages" className="mx-auto w-full min-w-0 max-w-[72ch] space-y-4 sm:space-y-5" aria-live="polite">
              {messages.map(({ role, content }, index) => renderMessage(role, content, index))}
              {pending && renderMessage("user", pending, "pending")}
              {pending && <li role="status" className="rounded-[28px] bg-[#eef2ff] p-4">ThermaBot is responding...</li>}
            </ul>
            {error && (
              <div role="alert" className="mx-auto mt-4 max-w-[1350px] rounded-2xl bg-[#fff4eb] p-4 text-sm">
                {error.message}
                {error.status === 401 && (
                  <button type="button" onClick={returnToSignIn} className="ml-2 font-semibold text-blue-700 underline">
                    Return to sign in
                  </button>
                )}
              </div>
            )}
          </div>

          <form
            className="shrink-0 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6"
            onSubmit={(event) => {
              event.preventDefault();
              send(draft);
            }}
          >
            <div className="flex min-h-12 items-center gap-2 rounded-[40px] border border-gray-200 bg-white px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
              <input
                aria-label="Message ThermaBot"
                placeholder="Message ThermaBot..."
                value={draft}
                maxLength={MAX_CHAT_MESSAGE}
                onChange={(event) => setDraft(event.target.value)}
                className="min-w-0 flex-1 text-base outline-none"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim() || Boolean(pending) || error?.status === 401}
                className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-600 text-xl text-white disabled:opacity-50"
              >
                <span aria-hidden="true">➤</span>
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-600">Advisory only. Follow site procedures and keep credentials out of chat.</p>
          </form>
        </section>
      </div>
    </PageShell>
  );
}

export default Support;
