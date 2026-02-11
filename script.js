
  /* ── Nav scroll ── */
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  /* ── Chat toggle ── */
  const fab        = document.getElementById('chatFab');
  const chatWindow = document.getElementById('chatWindow');
  const chatClose  = document.getElementById('chatClose');
  const openChatBtn= document.getElementById('openChat');

  function openChat() {
    chatWindow.classList.add('open');
    fab.querySelector('.badge').style.display = 'none';
    if (!chatWindow.dataset.greeted) {
      chatWindow.dataset.greeted = '1';
      setTimeout(() => {
        addBotMessage(
          "Hey! 👋 I'm Pradyuman's AI assistant. I know everything about his skills, projects, and experience.\n\nWhat would you like to know?",
          []
        );
      }, 400);
    }
  }
  fab.addEventListener('click', () => chatWindow.classList.contains('open') ? chatWindow.classList.remove('open') : openChat());
  chatClose.addEventListener('click', () => chatWindow.classList.remove('open'));
  openChatBtn.addEventListener('click', openChat);

  /* ── Quick chips ── */
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sendMessage(chip.dataset.q);
    });
  });

  /* ── Messaging ── */
  const msgs   = document.getElementById('chatMessages');
  const input  = document.getElementById('chatInput');
  const sendBtn= document.getElementById('chatSend');
  let   isBusy = false;

  function addBotMessage(text, actions = []) {
    const div = document.createElement('div');
    div.className = 'msg msg-bot';

    // linkify contact info
    const linkified = text
      .replace(/pradyumansiyal01@gmail\.com/g, '<a href="mailto:pradyumansiyal01@gmail.com" style="color:var(--accent)">pradyumansiyal01@gmail.com</a>')
      .replace(/linkedin\.com\/in\/pradyumansiyal/g, '<a href="https://linkedin.com/in/pradyumansiyal" target="_blank" style="color:var(--accent)">linkedin.com/in/pradyumansiyal</a>')
      .replace(/github\.com\/pradyumansiyal/g, '<a href="https://github.com/pradyumansiyal" target="_blank" style="color:var(--accent)">github.com/pradyumansiyal</a>')
      .replace(/leetcode\.com\/u\/pradyumansiyal/g, '<a href="https://leetcode.com/u/pradyumansiyal" target="_blank" style="color:var(--accent)">leetcode.com/u/pradyumansiyal</a>');

    div.innerHTML = linkified.replace(/\n/g, '<br/>');

    if (actions.length) {
      const row = document.createElement('div');
      row.className = 'msg-actions';
      actions.forEach(a => {
        const btn = document.createElement('button');
        btn.className = 'msg-action-btn' + (a.ghost ? ' ghost' : '');
        btn.textContent = a.label;
        btn.onclick = () => sendMessage(a.prompt || a.label);
        row.appendChild(btn);
      });
      div.appendChild(row);
    }

    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'msg msg-user';
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'typing'; t.id = 'typingIndicator';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
    return t;
  }

  function removeTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
  }

  /* ── AI Call ── */
  const SYSTEM_PROMPT = `You are a helpful, friendly assistant embedded on Pradyuman Siyal's personal portfolio website. Your job is to answer any questions a recruiter, collaborator, or visitor might have about Pradyuman.

Here is everything you know about him:

NAME: Pradyuman Siyal
ROLE: Frontend Developer
EMAIL: pradyumansiyal01@gmail.com
LINKEDIN: https://linkedin.com/in/pradyumansiyal
GITHUB: https://github.com/pradyumansiyal
LEETCODE: https://leetcode.com/u/pradyumansiyal
TAGLINE: Crafting intuitive, responsive web interfaces with modern frontend tools.
STATUS: Available for work / open to frontend roles and freelance projects.

PROJECTS:
1. Harmoniq — Web-Based Music Player
   - Tech: HTML, CSS, JavaScript, ReactJS
   - Built a responsive music player with playlist browsing and audio controls
   - Play/pause, next/prev, seek bar, volume control via JS event listeners
   - State management for track, playback, and progress
   - Dynamically rendered playlists from JS objects — 40% fewer DOM updates
   - Smooth transitions — 30% reduced perceived interaction latency
   - GitHub: https://github.com/pradyumansiyal

2. Personal Finance Tracker
   - Tech: HTML, CSS, JavaScript, Firebase
   - Records, categorizes, and manages income and expenses
   - Dynamic form validation — 50% reduction in invalid entries
   - Real-time balance and spending summaries using JS data structures
   - localStorage for session persistence
   - Optimized DOM updates for large datasets
   - GitHub: https://github.com/pradyumansiyal

SKILLS:
- Programming: Python, Java, C++, JavaScript
- CS Core: Data Structures & Algorithms, OOP, Recursion, Time/Space Complexity
- Frontend: HTML, CSS, JavaScript, ReactJS, Responsive Design, DOM Manipulation, Event-Driven Programming
- Databases: MySQL (CRUD, joins, query optimization)
- Tools: Git, GitHub, VS Code
- AI/GenAI: Model Inference, Prompt-based LLM usage

RESUME: Pradyuman's resume is available on request. When someone asks for the resume, tell them they can reach out via email at pradyumansiyal01@gmail.com and he will respond within 24 hours with his latest resume. Also give them his LinkedIn link as an alternative.

PERSONALITY NOTES:
- Respond in a friendly, concise, conversational tone
- Keep answers short unless depth is needed
- When asked about contact or resume, always provide all relevant links clearly
- If someone seems like a recruiter, offer to share contact details proactively
- Use line breaks for readability
- Never make up skills or projects he doesn't have
- If asked something you don't know, say so and redirect to his email`;

  async function callAI(userMessage, history) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage }
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_OPENAI_API_KEY"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.6,
      max_tokens: 600
    })
  });

  if (!response.ok) {
    throw new Error("OpenAI API request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}


  /* ── Send message ── */
  const chatHistory = [];

  async function sendMessage(text) {
    if (isBusy || !text.trim()) return;
    isBusy = true;
    sendBtn.disabled = true;
    input.value = '';

    // hide chips after first use
    document.getElementById('chatChips').style.display = 'none';

    addUserMessage(text);
    const typing = showTyping();

    try {
      const reply = await callAI(text, chatHistory);
      removeTyping();

      chatHistory.push({ role: 'user', content: text });
      chatHistory.push({ role: 'assistant', content: reply });

      // detect if reply involves contact/resume — add action buttons
      const lowerReply  = reply.toLowerCase();
      const lowerInput  = text.toLowerCase();
      const isContact   = lowerReply.includes('email') || lowerReply.includes('linkedin') || lowerInput.includes('contact') || lowerInput.includes('resume') || lowerInput.includes('hire');

      const actions = isContact ? [
        { label: '✉ Email Pradyuman', prompt: null, ghost: false, href: 'mailto:pradyumansiyal01@gmail.com' },
        { label: '🔗 LinkedIn',        prompt: null, ghost: true,  href: 'https://linkedin.com/in/pradyumansiyal' },
      ] : [];

      addBotMessage(reply, []);

      // if contact-related, append inline action links
      if (isContact) {
        const div = document.createElement('div');
        div.className = 'msg msg-bot';
        div.innerHTML = '<div class="msg-actions">' +
          '<a href="mailto:pradyumansiyal01@gmail.com" class="msg-action-btn" style="display:inline-flex;align-items:center;gap:.3rem;text-decoration:none;">✉ Email him</a>' +
          '<a href="https://linkedin.com/in/pradyumansiyal" target="_blank" class="msg-action-btn ghost" style="display:inline-flex;align-items:center;gap:.3rem;text-decoration:none;">🔗 LinkedIn</a>' +
          '<a href="https://github.com/pradyumansiyal" target="_blank" class="msg-action-btn ghost" style="display:inline-flex;align-items:center;gap:.3rem;text-decoration:none;">GitHub</a>' +
          '</div>';
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
      }

    } catch (e) {
      removeTyping();
      addBotMessage('Hmm, I ran into an issue connecting. Please reach out directly at pradyumansiyal01@gmail.com 🙏');
    }

    isBusy = false;
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value.trim()));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value.trim()); }
  });

  /* ── Scroll animations ── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.proj-card, .skill-card, .contact-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
    observer.observe(el);
  });