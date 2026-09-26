/**
 * YoungFire Ecosystem - Enhanced Features Suite
 * 1. Gemini Live API Voice Conversations
 * 2. User Progress Tracker (Activities, Reflections, Achievements)
 * 3. Content Management System (CMS for Articles, Media, Events)
 * 4. User Authentication System (Email & Password, Login, Logout)
 */

(function () {
  'use strict';

  // --- AUDIO HELPER: PCM CONVERTER FOR GEMINI LIVE ---
  function floatTo16BitPCM(input) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  function base64EncodeAudio(int16Array) {
    let binary = '';
    const bytes = new Uint8Array(int16Array.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function playPCMChunk(audioCtx, base64Pcm, sampleRate = 24000) {
    try {
      const binaryString = atob(base64Pcm);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }
      const audioBuffer = audioCtx.createBuffer(1, float32.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    } catch (e) {
      console.warn("Error playing PCM chunk:", e);
    }
  }

  // ==========================================
  // 1. GEMINI LIVE API VOICE CONVERSATIONS
  // ==========================================
  let liveWs = null;
  let inputAudioCtx = null;
  let outputAudioCtx = null;
  let micStream = null;
  let scriptProcessor = null;
  let isVoiceSessionActive = false;
  let isMicMuted = false;
  let selectedVoice = 'Zephyr';

  function openVoiceSanctuaryModal() {
    let modal = document.getElementById('yf-voice-sanctuary-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'yf-voice-sanctuary-modal';
      modal.className = 'fixed inset-0 z-[100060] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fadeIn overflow-y-auto';
      modal.innerHTML = `
        <div class="relative w-full max-w-2xl bg-[#070D1E] border-2 border-amber-500/70 rounded-3xl p-5 sm:p-7 shadow-[0_25px_90px_rgba(0,0,0,0.98),0_0_50px_rgba(245,158,11,0.3)] text-slate-100 flex flex-col space-y-4 max-h-[92vh] overflow-y-auto">
          <!-- Close Button -->
          <button id="yf-voice-close-btn" class="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-mono cursor-pointer" title="Close Voice Sanctuary">✕</button>

          <!-- Header -->
          <div class="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0 animate-pulse">
              🎙️
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg sm:text-xl font-serif font-black text-white font-['Cinzel'] tracking-wide">Live Voice Sanctuary</h3>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">Gemini Live API</span>
              </div>
              <p class="text-xs text-amber-300/80 font-mono">Real-time Conversational Pastoral Counseling • Joshua House of Worship</p>
            </div>
          </div>

          <!-- Status Indicator & Voice Picker -->
          <div class="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
            <div class="flex items-center gap-2">
              <span id="yf-voice-status-dot" class="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <span id="yf-voice-status-text" class="text-slate-300">Ready to connect</span>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-[11px] text-slate-400 font-bold">Pastoral Voice:</label>
              <select id="yf-voice-persona-select" class="bg-slate-900 text-amber-300 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold focus:outline-none cursor-pointer">
                <option value="Zephyr" selected>Zephyr (Pastoral & Warm)</option>
                <option value="Kore">Kore (Gentle & Wise)</option>
                <option value="Puck">Puck (Dynamic & Youthful)</option>
                <option value="Fenrir">Fenrir (Deep & Resonant)</option>
              </select>
            </div>
          </div>

          <!-- Animated Audio Visualizer Aura -->
          <div class="relative w-full h-40 rounded-2xl bg-gradient-to-b from-slate-950 to-[#0B132B] border border-amber-500/30 flex flex-col items-center justify-center overflow-hidden p-4">
            <canvas id="yf-voice-visualizer" class="w-full h-24" width="500" height="96"></canvas>
            <div id="yf-voice-hint" class="text-[11px] font-mono text-amber-400/90 pt-1 tracking-wider text-center">
              Tap "Start Live Conversation" and speak naturally into your microphone
            </div>
          </div>

          <!-- Controls: Start / Mute / End -->
          <div class="flex items-center gap-3">
            <button id="yf-voice-btn-toggle" type="button" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-mono text-xs sm:text-sm uppercase tracking-wider shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2">
              <span>🎙️</span>
              <span id="yf-voice-btn-text">Start Live Conversation</span>
            </button>
            <button id="yf-voice-btn-mute" type="button" class="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold cursor-pointer transition-all disabled:opacity-40" disabled>
              <span id="yf-voice-mute-icon">🎤 Mute</span>
            </button>
          </div>

          <!-- Conversation Transcript Area -->
          <div class="space-y-1.5 pt-1">
            <div class="flex items-center justify-between text-xs font-mono text-slate-400">
              <span class="uppercase tracking-wider font-bold">Live Transcript:</span>
              <button id="yf-voice-clear-transcript" class="hover:text-white text-[10px] cursor-pointer">Clear</button>
            </div>
            <div id="yf-voice-transcript-feed" class="w-full h-44 overflow-y-auto p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs font-serif space-y-2.5">
              <p class="text-slate-400 italic text-center py-6 font-mono text-[11px]">
                "Speak, LORD; for thy servant heareth." (1 Samuel 3:9)<br>
                Start a conversation to hear biblical counsel spoken directly to your spirit.
              </p>
            </div>
          </div>

          <!-- Quick Text-to-Voice Counselor Fallback -->
          <div class="pt-2 border-t border-slate-800 flex items-center gap-2">
            <input id="yf-voice-text-input" type="text" placeholder="Or type any prayer question to hear spoken counsel..." class="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono" />
            <button id="yf-voice-btn-send-text" type="button" class="py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold cursor-pointer transition-all">
              Ask & Speak 🔊
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Wire close
      modal.querySelector('#yf-voice-close-btn').onclick = () => {
        stopVoiceSession();
        modal.style.display = 'none';
      };
      modal.onclick = (e) => {
        if (e.target === modal) {
          stopVoiceSession();
          modal.style.display = 'none';
        }
      };

      // Voice Persona
      modal.querySelector('#yf-voice-persona-select').onchange = (e) => {
        selectedVoice = e.target.value;
      };

      // Toggle live conversation
      const toggleBtn = modal.querySelector('#yf-voice-btn-toggle');
      toggleBtn.onclick = () => {
        if (isVoiceSessionActive) {
          stopVoiceSession();
        } else {
          startVoiceSession();
        }
      };

      // Mute toggle
      const muteBtn = modal.querySelector('#yf-voice-btn-mute');
      muteBtn.onclick = () => {
        isMicMuted = !isMicMuted;
        muteBtn.innerHTML = isMicMuted ? '🔇 Unmute' : '🎤 Mute';
        muteBtn.className = isMicMuted 
          ? 'py-3 px-4 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-mono font-bold cursor-pointer transition-all'
          : 'py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold cursor-pointer transition-all';
      };

      // Clear transcript
      modal.querySelector('#yf-voice-clear-transcript').onclick = () => {
        const feed = modal.querySelector('#yf-voice-transcript-feed');
        feed.innerHTML = '';
      };

      // Text send with audio fallback
      const textInput = modal.querySelector('#yf-voice-text-input');
      const textBtn = modal.querySelector('#yf-voice-btn-send-text');
      const sendTextCounsel = async () => {
        const prompt = textInput.value.trim();
        if (!prompt) return;
        textInput.value = '';
        appendTranscript('You', prompt, 'user');
        appendTranscript('Pastoral AI Counselor', 'Reflecting on Scripture and preparing counsel...', 'system');

        try {
          const res = await fetch('/api/voice/counselor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, voiceName: selectedVoice })
          });
          if (res.ok) {
            const data = await res.json();
            // Remove waiting message
            const feed = modal.querySelector('#yf-voice-transcript-feed');
            const lastChild = feed.lastElementChild;
            if (lastChild && lastChild.textContent.includes('Reflecting on Scripture')) {
              lastChild.remove();
            }
            appendTranscript('Pastoral Counselor', data.text, 'counselor');

            if (data.audioBase64) {
              if (!outputAudioCtx) outputAudioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
              if (outputAudioCtx.state === 'suspended') await outputAudioCtx.resume();
              playPCMChunk(outputAudioCtx, data.audioBase64, 24000);
            }
          }
        } catch (e) {
          console.warn("Voice counsel error:", e);
        }
      };

      textBtn.onclick = sendTextCounsel;
      textInput.onkeydown = (e) => { if (e.key === 'Enter') sendTextCounsel(); };
    }

    modal.style.display = 'flex';
  }

  function appendTranscript(speaker, text, role = 'counselor') {
    const feed = document.getElementById('yf-voice-transcript-feed');
    if (!feed) return;
    const msgEl = document.createElement('div');
    if (role === 'user') {
      msgEl.className = 'p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-100 ml-6';
      msgEl.innerHTML = `<span class="text-[10px] font-mono text-amber-400 font-bold uppercase block">${speaker}:</span><p class="leading-relaxed mt-0.5">${text}</p>`;
    } else if (role === 'system') {
      msgEl.className = 'p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 italic text-[11px] font-mono text-center';
      msgEl.textContent = text;
    } else {
      msgEl.className = 'p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 mr-6';
      msgEl.innerHTML = `<span class="text-[10px] font-mono text-emerald-400 font-bold uppercase block">🕊️ ${speaker}:</span><p class="leading-relaxed mt-0.5 font-serif">${text}</p>`;
    }
    feed.appendChild(msgEl);
    feed.scrollTop = feed.scrollHeight;
  }

  async function startVoiceSession() {
    const statusDot = document.getElementById('yf-voice-status-dot');
    const statusText = document.getElementById('yf-voice-status-text');
    const toggleBtnText = document.getElementById('yf-voice-btn-text');
    const muteBtn = document.getElementById('yf-voice-btn-mute');
    const hint = document.getElementById('yf-voice-hint');

    try {
      if (statusText) statusText.textContent = 'Connecting to Gemini Live...';
      if (statusDot) statusDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping';

      // 1. Establish Web Audio contexts
      inputAudioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outputAudioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

      if (inputAudioCtx.state === 'suspended') await inputAudioCtx.resume();
      if (outputAudioCtx.state === 'suspended') await outputAudioCtx.resume();

      // 2. Connect WebSocket
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${location.host}/live`;
      liveWs = new WebSocket(wsUrl);

      liveWs.onopen = async () => {
        console.log("🎙️ [Gemini Live] WebSocket connected");
        if (statusText) statusText.textContent = `Connected with ${selectedVoice} • Listening...`;
        if (statusDot) statusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400';
        if (toggleBtnText) toggleBtnText.textContent = 'End Voice Conversation';
        if (muteBtn) muteBtn.disabled = false;
        if (hint) hint.textContent = 'Connected! Speak into your microphone to consult with Pastoral AI.';
        isVoiceSessionActive = true;

        // 3. Request Mic Audio
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
          const source = inputAudioCtx.createMediaStreamSource(micStream);
          scriptProcessor = inputAudioCtx.createScriptProcessor(4096, 1, 1);

          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioCtx.destination);

          scriptProcessor.onaudioprocess = (e) => {
            if (!isVoiceSessionActive || isMicMuted || !liveWs || liveWs.readyState !== WebSocket.OPEN) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = floatTo16BitPCM(inputData);
            const base64Audio = base64EncodeAudio(pcm16);
            liveWs.send(JSON.stringify({ type: 'audio', audio: base64Audio }));
          };
        } catch (micErr) {
          console.warn("Microphone access notice:", micErr);
          if (hint) hint.textContent = 'Microphone permission not granted. You can type below to hear spoken responses!';
        }
      };

      liveWs.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'audio' && msg.audio) {
            playPCMChunk(outputAudioCtx, msg.audio, 24000);
            if (statusText) statusText.textContent = `${selectedVoice} is speaking...`;
            if (statusDot) statusDot.className = 'w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse';
            setTimeout(() => {
              if (isVoiceSessionActive) {
                if (statusText) statusText.textContent = `Connected with ${selectedVoice} • Listening...`;
                if (statusDot) statusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400';
              }
            }, 2000);
          }
          if (msg.text) {
            appendTranscript(selectedVoice, msg.text, 'counselor');
          }
        } catch (e) {
          console.warn("Error receiving live message:", e);
        }
      };

      liveWs.onerror = (err) => {
        console.warn("WebSocket error in live voice:", err);
        if (statusText) statusText.textContent = 'Voice server connection failed, using audio fallback';
        if (statusDot) statusDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-500';
      };

      liveWs.onclose = () => {
        stopVoiceSession();
      };

      startVisualizer();
    } catch (e) {
      console.warn("Failed starting voice session:", e);
      if (statusText) statusText.textContent = 'Voice unavailable. Use Ask & Speak below.';
      if (statusDot) statusDot.className = 'w-2.5 h-2.5 rounded-full bg-rose-500';
    }
  }

  function stopVoiceSession() {
    isVoiceSessionActive = false;
    const statusDot = document.getElementById('yf-voice-status-dot');
    const statusText = document.getElementById('yf-voice-status-text');
    const toggleBtnText = document.getElementById('yf-voice-btn-text');
    const muteBtn = document.getElementById('yf-voice-btn-mute');
    const hint = document.getElementById('yf-voice-hint');

    if (statusText) statusText.textContent = 'Session ended';
    if (statusDot) statusDot.className = 'w-2.5 h-2.5 rounded-full bg-slate-500';
    if (toggleBtnText) toggleBtnText.textContent = 'Start Live Conversation';
    if (muteBtn) {
      muteBtn.disabled = true;
      muteBtn.innerHTML = '🎤 Mute';
    }
    if (hint) hint.textContent = 'Tap "Start Live Conversation" and speak naturally into your microphone';

    if (liveWs) {
      try { liveWs.close(); } catch {}
      liveWs = null;
    }
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      micStream = null;
    }
    if (scriptProcessor) {
      try { scriptProcessor.disconnect(); } catch {}
      scriptProcessor = null;
    }
    if (inputAudioCtx) {
      try { inputAudioCtx.close(); } catch {}
      inputAudioCtx = null;
    }
  }

  function startVisualizer() {
    const canvas = document.getElementById('yf-voice-visualizer');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    function render() {
      if (!isVoiceSessionActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      ctx.beginPath();
      ctx.strokeStyle = isMicMuted ? '#f43f5e' : '#f59e0b';
      ctx.lineWidth = 3;

      for (let x = 0; x < width; x++) {
        const wave1 = Math.sin((x * 0.04) + phase) * 16;
        const wave2 = Math.cos((x * 0.02) - phase) * 8;
        const y = midY + wave1 + wave2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.08;
      requestAnimationFrame(render);
    }
    render();
  }

  // ==========================================
  // 2. USER PROGRESS TRACKER (ACTIVITIES, REFLECTIONS, ACHIEVEMENTS)
  // ==========================================
  async function openProgressTrackerModal() {
    let modal = document.getElementById('yf-progress-tracker-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'yf-progress-tracker-modal';
      modal.className = 'fixed inset-0 z-[100060] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fadeIn overflow-y-auto';
      modal.innerHTML = `
        <div class="relative w-full max-w-3xl bg-[#080D1D] border-2 border-amber-500/70 rounded-3xl p-5 sm:p-7 shadow-[0_25px_90px_rgba(0,0,0,0.98),0_0_50px_rgba(245,158,11,0.25)] text-slate-100 flex flex-col space-y-4 max-h-[92vh] overflow-y-auto">
          <!-- Close Button -->
          <button id="yf-prog-close-btn" class="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-mono cursor-pointer" title="Close">✕</button>

          <!-- Header -->
          <div class="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
              📊
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg sm:text-xl font-serif font-black text-white font-['Cinzel'] tracking-wide">Discipleship Progress Tracker</h3>
                <span id="yf-prog-streak-badge" class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">🔥 5-Day Streak</span>
              </div>
              <p class="text-xs text-amber-300/80 font-mono">Log Scripture Readings, Heart Audits, Service Acts & View Milestones</p>
            </div>
          </div>

          <!-- KPI Summary Strip -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="yf-prog-kpis">
            <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span class="text-[10px] font-mono text-slate-400 uppercase block font-bold">Chapters Read</span>
              <span id="kpi-scripture" class="text-xl font-mono font-black text-amber-400">12</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span class="text-[10px] font-mono text-slate-400 uppercase block font-bold">Prayer Hours</span>
              <span id="kpi-prayer" class="text-xl font-mono font-black text-emerald-400">4.5h</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span class="text-[10px] font-mono text-slate-400 uppercase block font-bold">Gatherings</span>
              <span id="kpi-gatherings" class="text-xl font-mono font-black text-sky-400">6</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span class="text-[10px] font-mono text-slate-400 uppercase block font-bold">Reflections</span>
              <span id="kpi-reflections" class="text-xl font-mono font-black text-purple-400">5</span>
            </div>
          </div>

          <!-- Tabs: Activities vs Reflections vs Achievements -->
          <div class="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-mono font-bold">
            <button id="yf-prog-tab-act" type="button" class="flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all cursor-pointer shadow-sm">
              ⚡ Log Activities
            </button>
            <button id="yf-prog-tab-ref" type="button" class="flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">
              ✍️ Reflections Journal
            </button>
            <button id="yf-prog-tab-ach" type="button" class="flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">
              🏆 Achievements & Badges
            </button>
          </div>

          <!-- Pane 1: Log Activities -->
          <div id="yf-prog-pane-act" class="space-y-4">
            <!-- Quick Log Buttons -->
            <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <span class="text-xs font-mono font-bold text-amber-300 uppercase block">Quick Log Discipleship Action:</span>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button type="button" data-act-type="scripture" class="yf-quick-act-btn p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 text-xs font-mono text-slate-200 text-left cursor-pointer transition-all">
                  📖 Read Scripture (+1)
                </button>
                <button type="button" data-act-type="prayer" class="yf-quick-act-btn p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-400 text-xs font-mono text-slate-200 text-left cursor-pointer transition-all">
                  🙏 Prayer Watch (30m)
                </button>
                <button type="button" data-act-type="fellowship" class="yf-quick-act-btn p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-400 text-xs font-mono text-slate-200 text-left cursor-pointer transition-all">
                  🤝 Small Group Attended
                </button>
                <button type="button" data-act-type="service" class="yf-quick-act-btn p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-400 text-xs font-mono text-slate-200 text-left cursor-pointer transition-all">
                  🕊️ Community Serve Act
                </button>
              </div>
            </div>

            <!-- Custom Activity Input -->
            <form id="yf-prog-act-form" class="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <input id="yf-act-title" type="text" placeholder="Activity Title (e.g. Genesis 1-3, Fasting)" class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" required />
              <select id="yf-act-type" class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold outline-none font-mono cursor-pointer">
                <option value="scripture">📖 Scripture Reading</option>
                <option value="prayer">🙏 Prayer & Intercession</option>
                <option value="fellowship">🤝 Fellowship Gathering</option>
                <option value="service">🕊️ Ministry Outreach & Service</option>
              </select>
              <button type="submit" class="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider cursor-pointer transition-all">
                + Log Custom Activity
              </button>
            </form>

            <!-- Activity Stream List -->
            <div class="space-y-2">
              <span class="text-xs font-mono text-slate-400 font-bold uppercase block">Recent Logged Activities:</span>
              <div id="yf-prog-act-list" class="space-y-2 max-h-52 overflow-y-auto pr-1"></div>
            </div>
          </div>

          <!-- Pane 2: Reflections Journal -->
          <div id="yf-prog-pane-ref" class="space-y-4" style="display: none;">
            <form id="yf-prog-ref-form" class="space-y-2.5 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <span class="text-xs font-mono font-bold text-amber-400 uppercase block">✍️ New Heart Audit & Reflection</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input id="yf-ref-scripture" type="text" placeholder="Scripture Reference (e.g. John 15:5, Psalm 23)" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" />
                <input id="yf-ref-prompt" type="text" placeholder="Focus Theme (e.g. Purity, Obedience, God's Call)" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" />
              </div>
              <textarea id="yf-ref-notes" rows="3" placeholder="What is the Holy Spirit speaking to your heart today? Note your prayer, conviction, or praise..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none font-serif focus:border-amber-400 leading-relaxed" required></textarea>
              <button type="submit" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs font-mono uppercase tracking-wider shadow cursor-pointer transition-all">
                Save Reflection to Journal 🛡️
              </button>
            </form>

            <div class="space-y-2">
              <span class="text-xs font-mono text-slate-400 font-bold uppercase block">Saved Reflections & Audits:</span>
              <div id="yf-prog-ref-list" class="space-y-2 max-h-56 overflow-y-auto pr-1"></div>
            </div>
          </div>

          <!-- Pane 3: Achievements & Badges -->
          <div id="yf-prog-pane-ach" class="space-y-3" style="display: none;">
            <div id="yf-prog-badges-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Close handlers
      modal.querySelector('#yf-prog-close-btn').onclick = () => { modal.style.display = 'none'; };
      modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

      // Tab switcher
      const tabAct = modal.querySelector('#yf-prog-tab-act');
      const tabRef = modal.querySelector('#yf-prog-tab-ref');
      const tabAch = modal.querySelector('#yf-prog-tab-ach');
      const paneAct = modal.querySelector('#yf-prog-pane-act');
      const paneRef = modal.querySelector('#yf-prog-pane-ref');
      const paneAch = modal.querySelector('#yf-prog-pane-ach');

      tabAct.onclick = () => {
        tabAct.className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all cursor-pointer shadow-sm';
        tabRef.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
        tabAch.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
        paneAct.style.display = 'block';
        paneRef.style.display = 'none';
        paneAch.style.display = 'none';
      };

      tabRef.onclick = () => {
        tabRef.className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all cursor-pointer shadow-sm';
        tabAct.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
        tabAch.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
        paneRef.style.display = 'block';
        paneAct.style.display = 'none';
        paneAch.style.display = 'none';
      };

      tabAch.onclick = () => {
        tabAch.className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all cursor-pointer shadow-sm';
        tabAct.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
        tabRef.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
        paneAch.style.display = 'block';
        paneAct.style.display = 'none';
        paneRef.style.display = 'none';
      };

      // Quick Action Buttons
      modal.querySelectorAll('.yf-quick-act-btn').forEach(btn => {
        btn.onclick = async () => {
          const type = btn.dataset.actType;
          let title = 'Scripture Reading Passage';
          let metric = 1;
          if (type === 'prayer') { title = '30-Minute Prayer & Worship Watch'; metric = 30; }
          else if (type === 'fellowship') { title = 'YoungFire Small Group Fellowship'; metric = 1; }
          else if (type === 'service') { title = 'Kingdom Outreach & Acts of Kindness'; metric = 1; }
          
          await logProgressActivity(type, title, metric);
          await refreshProgressData();
        };
      });

      // Custom Activity Submit
      modal.querySelector('#yf-prog-act-form').onsubmit = async (e) => {
        e.preventDefault();
        const title = modal.querySelector('#yf-act-title').value.trim();
        const type = modal.querySelector('#yf-act-type').value;
        if (!title) return;
        await logProgressActivity(type, title, 1);
        modal.querySelector('#yf-act-title').value = '';
        await refreshProgressData();
      };

      // Reflection Submit
      modal.querySelector('#yf-prog-ref-form').onsubmit = async (e) => {
        e.preventDefault();
        const scriptureRef = modal.querySelector('#yf-ref-scripture').value.trim();
        const prompt = modal.querySelector('#yf-ref-prompt').value.trim();
        const notes = modal.querySelector('#yf-ref-notes').value.trim();
        if (!notes) return;
        await saveProgressReflection(scriptureRef, prompt, notes);
        modal.querySelector('#yf-ref-notes').value = '';
        modal.querySelector('#yf-ref-scripture').value = '';
        modal.querySelector('#yf-ref-prompt').value = '';
        await refreshProgressData();
      };
    }

    modal.style.display = 'flex';
    await refreshProgressData();
  }

  async function logProgressActivity(type, title, metricCount = 1) {
    const user = localStorage.getItem('yf_acting_user') || 'YoungFire Disciple';
    const act = {
      id: `act_${Date.now()}`,
      userId: user,
      userName: user,
      type,
      title,
      metricCount,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };
    try {
      await fetch('/api/progress/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(act)
      });
    } catch {}
  }

  async function saveProgressReflection(scriptureRef, prompt, notes) {
    const user = localStorage.getItem('yf_acting_user') || 'YoungFire Disciple';
    const ref = {
      id: `ref_${Date.now()}`,
      userId: user,
      userName: user,
      scriptureRef: scriptureRef || 'Scripture Anchor',
      prompt: prompt || 'Heart Audit',
      notes,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };
    try {
      await fetch('/api/progress/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ref)
      });
    } catch {}
  }

  async function refreshProgressData() {
    try {
      const [statsRes, actsRes, refsRes] = await Promise.all([
        fetch('/api/progress/stats'),
        fetch('/api/progress/activities'),
        fetch('/api/progress/reflections')
      ]);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        const kpiScripture = document.getElementById('kpi-scripture');
        const kpiPrayer = document.getElementById('kpi-prayer');
        const kpiGatherings = document.getElementById('kpi-gatherings');
        const kpiReflections = document.getElementById('kpi-reflections');
        const streakBadge = document.getElementById('yf-prog-streak-badge');

        if (kpiScripture) kpiScripture.textContent = stats.scriptureCount || 0;
        if (kpiPrayer) kpiPrayer.textContent = `${stats.prayerHours || 0}h`;
        if (kpiGatherings) kpiGatherings.textContent = (stats.fellowshipCount || 0) + (stats.serviceCount || 0);
        if (kpiReflections) kpiReflections.textContent = stats.reflectionsCount || 0;
        if (streakBadge) streakBadge.textContent = `🔥 ${stats.streak || 1}-Day Streak`;

        // Render Achievements Grid
        const badgesGrid = document.getElementById('yf-prog-badges-grid');
        if (badgesGrid && Array.isArray(stats.achievements)) {
          badgesGrid.innerHTML = stats.achievements.map(a => `
            <div class="p-4 rounded-2xl border transition-all ${a.unlocked ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-950/60 border-slate-800 opacity-60'} flex items-start gap-3">
              <span class="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-800">${a.icon}</span>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-mono font-bold text-sm text-white">${a.title}</h4>
                  <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${a.unlocked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">${a.unlocked ? 'UNLOCKED' : 'IN PROGRESS'}</span>
                </div>
                <p class="text-xs text-slate-300 font-serif mt-0.5">${a.desc}</p>
              </div>
            </div>
          `).join('');
        }
      }

      if (actsRes.ok) {
        const actsData = await actsRes.json();
        const actList = document.getElementById('yf-prog-act-list');
        if (actList) {
          const list = actsData.activities || [];
          if (list.length === 0) {
            actList.innerHTML = `<p class="text-slate-500 text-xs font-mono italic text-center py-4">No activities logged yet today. Use the buttons above!</p>`;
          } else {
            actList.innerHTML = list.map(a => `
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div class="flex items-center gap-2">
                  <span>${a.type === 'scripture' ? '📖' : a.type === 'prayer' ? '🙏' : a.type === 'fellowship' ? '🤝' : '🕊️'}</span>
                  <div>
                    <span class="font-bold text-white block">${a.title}</span>
                    <span class="text-[10px] text-slate-500">${a.date}</span>
                  </div>
                </div>
                <button type="button" class="yf-del-act-btn text-slate-500 hover:text-rose-400 cursor-pointer p-1" data-id="${a.id}">✕</button>
              </div>
            `).join('');

            actList.querySelectorAll('.yf-del-act-btn').forEach(btn => {
              btn.onclick = async () => {
                await fetch(`/api/progress/activities/${btn.dataset.id}`, { method: 'DELETE' });
                await refreshProgressData();
              };
            });
          }
        }
      }

      if (refsRes.ok) {
        const refsData = await refsRes.json();
        const refList = document.getElementById('yf-prog-ref-list');
        if (refList) {
          const list = refsData.reflections || [];
          if (list.length === 0) {
            refList.innerHTML = `<p class="text-slate-500 text-xs font-mono italic text-center py-4">No saved reflections yet. Record what God is speaking to you!</p>`;
          } else {
            refList.innerHTML = list.map(r => `
              <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div class="flex items-center justify-between text-xs font-mono">
                  <span class="font-bold text-amber-400">📖 ${r.scriptureRef} • ${r.prompt}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-slate-500">${r.date}</span>
                    <button type="button" class="yf-del-ref-btn text-slate-500 hover:text-rose-400 cursor-pointer" data-id="${r.id}">✕</button>
                  </div>
                </div>
                <p class="text-xs text-slate-200 font-serif leading-relaxed">${r.notes}</p>
              </div>
            `).join('');

            refList.querySelectorAll('.yf-del-ref-btn').forEach(btn => {
              btn.onclick = async () => {
                await fetch(`/api/progress/reflections/${btn.dataset.id}`, { method: 'DELETE' });
                await refreshProgressData();
              };
            });
          }
        }
      }
    } catch (e) {
      console.warn("Failed refreshing progress data:", e);
    }
  }

  // ==========================================
  // 3. CONTENT MANAGEMENT SYSTEM (CMS)
  // ==========================================
  async function openAdminCMSModal() {
    let modal = document.getElementById('yf-admin-cms-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'yf-admin-cms-modal';
      modal.className = 'fixed inset-0 z-[100060] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fadeIn overflow-y-auto';
      modal.innerHTML = `
        <div class="relative w-full max-w-4xl bg-[#070D1E] border-2 border-amber-500/70 rounded-3xl p-5 sm:p-7 shadow-[0_25px_90px_rgba(0,0,0,0.98),0_0_50px_rgba(245,158,11,0.3)] text-slate-100 flex flex-col space-y-4 max-h-[92vh] overflow-y-auto">
          <!-- Close Button -->
          <button id="yf-cms-close-btn" class="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-mono cursor-pointer" title="Close CMS">✕</button>

          <!-- Header -->
          <div class="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
              👑
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg sm:text-xl font-serif font-black text-white font-['Cinzel'] tracking-wide">Administrator CMS Portal</h3>
                <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">Content Management</span>
              </div>
              <p class="text-xs text-amber-300/80 font-mono">Create, Edit, & Delete Articles, Image Vault Galleries, & Fellowship Gatherings</p>
            </div>
          </div>

          <!-- Tabs: Articles vs Media vs Events -->
          <div class="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-mono font-bold">
            <button id="yf-cms-tab-art" type="button" class="flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all cursor-pointer shadow-sm">
              📝 Articles & Devotionals
            </button>
            <button id="yf-cms-tab-med" type="button" class="flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">
              🖼️ Media Vault & Images
            </button>
            <button id="yf-cms-tab-eve" type="button" class="flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">
              📅 Fellowship Events
            </button>
          </div>

          <!-- Pane 1: Articles CMS -->
          <div id="yf-cms-pane-art" class="space-y-4">
            <!-- Add Article Form -->
            <form id="yf-cms-art-form" class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-amber-400 uppercase">➕ Create New Article / Study</span>
                <span class="text-[10px] font-mono text-slate-500">Live published to ecosystem</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input id="yf-art-title" type="text" placeholder="Article Title *" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" required />
                <input id="yf-art-category" type="text" placeholder="Category (e.g. Discipleship, Faith & Culture)" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" required />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input id="yf-art-author" type="text" placeholder="Author (e.g. Pastor Trent White)" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" />
                <input id="yf-art-passage" type="text" placeholder="Scripture Anchor (e.g. Romans 12:1-2)" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" />
                <input id="yf-art-image" type="url" placeholder="Cover Image URL (https://...)" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" />
              </div>
              <textarea id="yf-art-content" rows="4" placeholder="Article Content & Teaching (Markdown/paragraphs)..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none font-serif focus:border-amber-400 leading-relaxed" required></textarea>
              <button type="submit" class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider cursor-pointer transition-all shadow">
                Publish Article to YoungFire CMS
              </button>
            </form>

            <!-- Articles List -->
            <div class="space-y-2">
              <span class="text-xs font-mono text-slate-400 font-bold uppercase block">Current Articles:</span>
              <div id="yf-cms-art-list" class="space-y-2.5 max-h-60 overflow-y-auto pr-1"></div>
            </div>
          </div>

          <!-- Pane 2: Media Vault CMS -->
          <div id="yf-cms-pane-med" class="space-y-4" style="display: none;">
            <form id="yf-cms-med-form" class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <span class="text-xs font-mono font-bold text-amber-400 uppercase block">➕ Add Image / Media to Gallery Vault</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input id="yf-med-title" type="text" placeholder="Media Title *" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" required />
                <select id="yf-med-category" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-bold outline-none font-mono cursor-pointer">
                  <option value="Worship Nights">Worship Nights</option>
                  <option value="Outreach & Missions">Outreach & Missions</option>
                  <option value="Fellowship Gatherings">Fellowship Gatherings</option>
                  <option value="Sanctuary Highlights">Sanctuary Highlights</option>
                </select>
              </div>
              <input id="yf-med-url" type="url" placeholder="Direct Image URL (https://...)" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" required />
              <input id="yf-med-caption" type="text" placeholder="Caption & Historical Context" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" />
              <button type="submit" class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider cursor-pointer transition-all shadow">
                Upload & Save Media to Vault
              </button>
            </form>

            <div class="space-y-2">
              <span class="text-xs font-mono text-slate-400 font-bold uppercase block">Vault Media Gallery:</span>
              <div id="yf-cms-med-list" class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1"></div>
            </div>
          </div>

          <!-- Pane 3: Events CMS -->
          <div id="yf-cms-pane-eve" class="space-y-4" style="display: none;">
            <form id="yf-cms-eve-form" class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <span class="text-xs font-mono font-bold text-amber-400 uppercase block">➕ Create Community Event Itinerary</span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input id="yf-eve-title" type="text" placeholder="Event Title *" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" required />
                <input id="yf-eve-date" type="date" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" required />
                <input id="yf-eve-time" type="text" placeholder="Time (e.g. 6:30 PM CST)" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input id="yf-eve-location" type="text" placeholder="Location Name (e.g. Joshua House Sanctuary Annex)" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" />
                <input id="yf-eve-address" type="text" placeholder="Address (San Antonio, TX)" class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono focus:border-amber-400" />
              </div>
              <textarea id="yf-eve-desc" rows="2" placeholder="Event Description & Theme..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none font-serif focus:border-amber-400"></textarea>
              <button type="submit" class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider cursor-pointer transition-all shadow">
                Save & Broadcast Gathering to Calendar
              </button>
            </form>

            <div class="space-y-2">
              <span class="text-xs font-mono text-slate-400 font-bold uppercase block">Scheduled Events & Gatherings:</span>
              <div id="yf-cms-eve-list" class="space-y-2.5 max-h-60 overflow-y-auto pr-1"></div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#yf-cms-close-btn').onclick = () => { modal.style.display = 'none'; };
      modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

      // Tabs
      const tabArt = modal.querySelector('#yf-cms-tab-art');
      const tabMed = modal.querySelector('#yf-cms-tab-med');
      const tabEve = modal.querySelector('#yf-cms-tab-eve');
      const paneArt = modal.querySelector('#yf-cms-pane-art');
      const paneMed = modal.querySelector('#yf-cms-pane-med');
      const paneEve = modal.querySelector('#yf-cms-pane-eve');

      tabArt.onclick = () => {
        tabArt.className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all cursor-pointer shadow-sm';
        tabMed.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
        tabEve.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
        paneArt.style.display = 'block';
        paneMed.style.display = 'none';
        paneEve.style.display = 'none';
      };

      tabMed.onclick = () => {
        tabMed.className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all cursor-pointer shadow-sm';
        tabArt.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
        tabEve.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
        paneMed.style.display = 'block';
        paneArt.style.display = 'none';
        paneEve.style.display = 'none';
      };

      tabEve.onclick = () => {
        tabEve.className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all cursor-pointer shadow-sm';
        tabArt.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
        tabMed.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
        paneEve.style.display = 'block';
        paneArt.style.display = 'none';
        paneMed.style.display = 'none';
      };

      let editingArticleId = null;
      let editingMediaId = null;
      let editingEventId = null;

      // Article Form Submit (Create or Update)
      modal.querySelector('#yf-cms-art-form').onsubmit = async (e) => {
        e.preventDefault();
        const title = modal.querySelector('#yf-art-title').value.trim();
        const category = modal.querySelector('#yf-art-category').value.trim();
        const author = modal.querySelector('#yf-art-author').value.trim() || 'YoungFire Ministry';
        const scriptureAnchor = modal.querySelector('#yf-art-passage').value.trim();
        const coverImage = modal.querySelector('#yf-art-image').value.trim() || '/image_5.png';
        const content = modal.querySelector('#yf-art-content').value.trim();

        if (!title || !content) return;

        const payload = { title, category, author, scriptureAnchor, coverImage, content, status: 'Published' };

        if (editingArticleId) {
          await fetch(`/api/cms/articles/${editingArticleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          editingArticleId = null;
          const submitBtn = modal.querySelector('#yf-cms-art-form button[type="submit"]');
          if (submitBtn) submitBtn.textContent = 'Publish Article to YoungFire CMS';
        } else {
          await fetch('/api/cms/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        modal.querySelector('#yf-cms-art-form').reset();
        await refreshCMSData();
      };

      // Media Form Submit (Create or Update)
      modal.querySelector('#yf-cms-med-form').onsubmit = async (e) => {
        e.preventDefault();
        const title = modal.querySelector('#yf-med-title').value.trim();
        const category = modal.querySelector('#yf-med-category').value;
        const imageUrl = modal.querySelector('#yf-med-url').value.trim();
        const caption = modal.querySelector('#yf-med-caption').value.trim();

        if (!title || !imageUrl) return;
        const payload = { title, category, imageUrl, caption, tags: [category] };

        if (editingMediaId) {
          await fetch(`/api/cms/media/${editingMediaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          editingMediaId = null;
          const submitBtn = modal.querySelector('#yf-cms-med-form button[type="submit"]');
          if (submitBtn) submitBtn.textContent = 'Upload & Save Media to Vault';
        } else {
          await fetch('/api/cms/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        modal.querySelector('#yf-cms-med-form').reset();
        await refreshCMSData();
      };

      // Events Form Submit (Create or Update)
      modal.querySelector('#yf-cms-eve-form').onsubmit = async (e) => {
        e.preventDefault();
        const title = modal.querySelector('#yf-eve-title').value.trim();
        const date = modal.querySelector('#yf-eve-date').value;
        const time = modal.querySelector('#yf-eve-time').value.trim() || '6:30 PM CST';
        const locationName = modal.querySelector('#yf-eve-location').value.trim() || 'Joshua House of Worship';
        const address = modal.querySelector('#yf-eve-address').value.trim() || 'San Antonio, TX';
        const description = modal.querySelector('#yf-eve-desc').value.trim() || 'Fellowship & Small Group Discussion';

        if (!title || !date) return;
        const payload = { title, date, time, locationName, address, description, activity: 'Community Fellowship' };

        if (editingEventId) {
          await fetch(`/api/cms/events/${editingEventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          editingEventId = null;
          const submitBtn = modal.querySelector('#yf-cms-eve-form button[type="submit"]');
          if (submitBtn) submitBtn.textContent = 'Save & Broadcast Gathering to Calendar';
        } else {
          await fetch('/api/cms/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        modal.querySelector('#yf-cms-eve-form').reset();
        await refreshCMSData();
      };
    }

    modal.style.display = 'flex';
    await refreshCMSData();
  }

  async function refreshCMSData() {
    try {
      const [artRes, medRes, eveRes] = await Promise.all([
        fetch('/api/cms/articles'),
        fetch('/api/cms/media'),
        fetch('/api/cms/events')
      ]);

      if (artRes.ok) {
        const data = await artRes.json();
        const listEl = document.getElementById('yf-cms-art-list');
        if (listEl) {
          const articles = data.articles || [];
          listEl.innerHTML = articles.length === 0 ? `<p class="text-slate-500 text-xs italic">No articles published yet.</p>` : articles.map(a => `
            <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-3 min-w-0">
                <img src="${a.coverImage}" class="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-700" onerror="this.src='/image_5.png'" />
                <div class="min-w-0">
                  <h4 class="font-bold text-white truncate">${a.title}</h4>
                  <span class="text-[10px] font-mono text-amber-400 block">${a.category} • ${a.author || 'Author'}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button type="button" class="yf-edit-art-btn px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono cursor-pointer" data-id="${a.id}">Edit</button>
                <button type="button" class="yf-del-art-btn px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-mono cursor-pointer" data-id="${a.id}">Delete</button>
              </div>
            </div>
          `).join('');

          listEl.querySelectorAll('.yf-edit-art-btn').forEach(btn => {
            btn.onclick = () => {
              const a = articles.find(x => x.id === btn.dataset.id);
              if (!a) return;
              const modal = document.getElementById('yf-admin-cms-modal');
              if (modal) {
                modal.querySelector('#yf-art-title').value = a.title || '';
                modal.querySelector('#yf-art-category').value = a.category || '';
                modal.querySelector('#yf-art-author').value = a.author || '';
                modal.querySelector('#yf-art-passage').value = a.scriptureAnchor || '';
                modal.querySelector('#yf-art-image').value = a.coverImage || '';
                modal.querySelector('#yf-art-content').value = a.content || '';
                const submitBtn = modal.querySelector('#yf-cms-art-form button[type="submit"]');
                if (submitBtn) submitBtn.textContent = '💾 Update Article (Save Changes)';
                modal.querySelector('#yf-cms-art-form').scrollIntoView({ behavior: 'smooth' });
              }
            };
          });

          listEl.querySelectorAll('.yf-del-art-btn').forEach(btn => {
            btn.onclick = async () => {
              await fetch(`/api/cms/articles/${btn.dataset.id}`, { method: 'DELETE' });
              await refreshCMSData();
            };
          });
        }
      }

      if (medRes.ok) {
        const data = await medRes.json();
        const listEl = document.getElementById('yf-cms-med-list');
        if (listEl) {
          const media = data.media || [];
          listEl.innerHTML = media.length === 0 ? `<p class="text-slate-500 text-xs italic">No media items in vault.</p>` : media.map(m => `
            <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <img src="${m.imageUrl}" class="w-full h-28 rounded-xl object-cover border border-slate-700" onerror="this.src='/image_6.png'" />
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-white">${m.title}</h4>
                  <span class="text-[10px] font-mono text-amber-400">${m.category}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <button type="button" class="yf-edit-med-btn px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono cursor-pointer" data-id="${m.id}">Edit</button>
                  <button type="button" class="yf-del-med-btn px-2 py-1 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-mono cursor-pointer" data-id="${m.id}">Delete</button>
                </div>
              </div>
            </div>
          `).join('');

          listEl.querySelectorAll('.yf-edit-med-btn').forEach(btn => {
            btn.onclick = () => {
              const m = media.find(x => x.id === btn.dataset.id);
              if (!m) return;
              const modal = document.getElementById('yf-admin-cms-modal');
              if (modal) {
                modal.querySelector('#yf-med-title').value = m.title || '';
                modal.querySelector('#yf-med-category').value = m.category || 'Worship Nights';
                modal.querySelector('#yf-med-url').value = m.imageUrl || '';
                modal.querySelector('#yf-med-caption').value = m.caption || '';
                const submitBtn = modal.querySelector('#yf-cms-med-form button[type="submit"]');
                if (submitBtn) submitBtn.textContent = '💾 Update Media Item (Save Changes)';
                modal.querySelector('#yf-cms-med-form').scrollIntoView({ behavior: 'smooth' });
              }
            };
          });

          listEl.querySelectorAll('.yf-del-med-btn').forEach(btn => {
            btn.onclick = async () => {
              await fetch(`/api/cms/media/${btn.dataset.id}`, { method: 'DELETE' });
              await refreshCMSData();
            };
          });
        }
      }

      if (eveRes.ok) {
        const data = await eveRes.json();
        const listEl = document.getElementById('yf-cms-eve-list');
        if (listEl) {
          const events = data.events || [];
          listEl.innerHTML = events.length === 0 ? `<p class="text-slate-500 text-xs italic">No events scheduled.</p>` : events.map(e => `
            <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <span class="font-bold text-white block">${e.title}</span>
                <span class="text-[10px] text-amber-400">${e.date} • ${e.time || '6:30 PM'} • ${e.locationName || 'Joshua House'}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <button type="button" class="yf-edit-eve-btn px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono cursor-pointer" data-id="${e.id}">Edit</button>
                <button type="button" class="yf-del-eve-btn px-2.5 py-1 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 text-xs font-mono cursor-pointer" data-id="${e.id}">Delete</button>
              </div>
            </div>
          `).join('');

          listEl.querySelectorAll('.yf-edit-eve-btn').forEach(btn => {
            btn.onclick = () => {
              const e = events.find(x => x.id === btn.dataset.id);
              if (!e) return;
              const modal = document.getElementById('yf-admin-cms-modal');
              if (modal) {
                modal.querySelector('#yf-eve-title').value = e.title || '';
                modal.querySelector('#yf-eve-date').value = e.date || '';
                modal.querySelector('#yf-eve-time').value = e.time || '';
                modal.querySelector('#yf-eve-location').value = e.locationName || '';
                modal.querySelector('#yf-eve-address').value = e.address || '';
                modal.querySelector('#yf-eve-desc').value = e.description || '';
                const submitBtn = modal.querySelector('#yf-cms-eve-form button[type="submit"]');
                if (submitBtn) submitBtn.textContent = '💾 Update Event (Save Changes)';
                modal.querySelector('#yf-cms-eve-form').scrollIntoView({ behavior: 'smooth' });
              }
            };
          });

          listEl.querySelectorAll('.yf-del-eve-btn').forEach(btn => {
            btn.onclick = async () => {
              await fetch(`/api/cms/events/${btn.dataset.id}`, { method: 'DELETE' });
              await refreshCMSData();
            };
          });
        }
      }
    } catch (e) {
      console.warn("Failed refreshing CMS data:", e);
    }
  }

  // ==========================================
  // 4. USER AUTHENTICATION & LOGOUT CONTROLS
  // ==========================================
  function performUserLogout() {
    localStorage.removeItem('yf_acting_user');
    localStorage.removeItem('yf_current_user');
    localStorage.removeItem('yf_member_name');
    localStorage.removeItem('yf_chat_name');
    localStorage.removeItem('yf_is_admin');
    
    if (window.__firebaseSignOut) {
      try { window.__firebaseSignOut(); } catch {}
    }
    try { fetch('/api/auth/logout', { method: 'POST' }); } catch {}

    window.dispatchEvent(new CustomEvent('yf_acting_user_changed', { detail: { user: null } }));
    location.reload();
  }

  // ==========================================
  // 5. GLOBAL NAVIGATION INJECTION
  // ==========================================
  function ensureTopFeaturePills() {
    const topBar = document.querySelector('div.flex.items-center.justify-between.pb-2.border-b');
    if (!topBar || topBar.querySelector('#yf-top-features-container')) return;

    const container = document.createElement('div');
    container.id = 'yf-top-features-container';
    container.className = 'flex items-center gap-1.5 overflow-x-auto py-1 text-xs font-mono';

    const curUser = localStorage.getItem('yf_acting_user');
    const isAdmin = localStorage.getItem('yf_is_admin') === 'true' || (curUser && curUser.toLowerCase().includes('admin'));

    container.innerHTML = `
      <!-- Live Voice Sanctuary -->
      <button id="yf-btn-nav-voice" type="button" class="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm">
        <span>🎙️</span>
        <span>Voice Live</span>
      </button>

      <!-- Progress Tracker -->
      <button id="yf-btn-nav-progress" type="button" class="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm">
        <span>📊</span>
        <span>Progress</span>
      </button>

      <!-- Admin CMS -->
      <button id="yf-btn-nav-cms" type="button" class="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm">
        <span>👑</span>
        <span>Admin CMS</span>
      </button>

      <!-- Auth / Logout -->
      ${curUser ? `
        <div class="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
          <span class="text-amber-400 font-bold">👤 ${curUser.split(' ')[0]}</span>
          <button id="yf-btn-nav-logout" type="button" class="text-[10px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer ml-1">Log Out</button>
        </div>
      ` : `
        <button id="yf-btn-nav-login" type="button" class="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold flex items-center gap-1 cursor-pointer transition-all">
          <span>🔐</span>
          <span>Sign In</span>
        </button>
      `}
    `;

    topBar.appendChild(container);

    const btnVoice = container.querySelector('#yf-btn-nav-voice');
    if (btnVoice) btnVoice.onclick = openVoiceSanctuaryModal;

    const btnProg = container.querySelector('#yf-btn-nav-progress');
    if (btnProg) btnProg.onclick = openProgressTrackerModal;

    const btnCms = container.querySelector('#yf-btn-nav-cms');
    if (btnCms) btnCms.onclick = openAdminCMSModal;

    const btnLogout = container.querySelector('#yf-btn-nav-logout');
    if (btnLogout) btnLogout.onclick = performUserLogout;

    const btnLogin = container.querySelector('#yf-btn-nav-login');
    if (btnLogin) btnLogin.onclick = () => window.dispatchEvent(new CustomEvent('yf_open_security_login'));
  }

  // Expose on window
  window.openVoiceSanctuaryModal = openVoiceSanctuaryModal;
  window.openProgressTrackerModal = openProgressTrackerModal;
  window.openAdminCMSModal = openAdminCMSModal;
  window.performUserLogout = performUserLogout;

  // Periodic navigation checks
  setInterval(ensureTopFeaturePills, 1500);
})();
