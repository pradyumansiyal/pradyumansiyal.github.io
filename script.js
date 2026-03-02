/* ── Nav scroll ── */
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── Chat toggle ── */
const fab = document.getElementById('chatFab');
const chatWindow = document.getElementById('chatWindow');
const chatClose = document.getElementById('chatClose');
const openChatBtn = document.getElementById('openChat');

function openChat() {
  chatWindow.classList.add('open');
  fab.querySelector('.badge').style.display = 'none';
  if (!chatWindow.dataset.greeted) {
    chatWindow.dataset.greeted = '1';
    setTimeout(() => {
      addBotMessage(
        "Hey! 👋 I'm Pradyuman's AI assistant. I can help with his projects, skills, and contact details.\n\nWhat would you like to know?",
        []
      );
    }, 400);
  }
}

fab.addEventListener('click', () =>
  chatWindow.classList.contains('open') ? chatWindow.classList.remove('open') : openChat()
);
chatClose.addEventListener('click', () => chatWindow.classList.remove('open'));
openChatBtn.addEventListener('click', openChat);

/* ── Quick chips ── */
document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    sendMessage(chip.dataset.q);
  });
});

/* ── Messaging ── */
const msgs = document.getElementById('chatMessages');
const input = document.getElementById('chatInput');
const sendBtn = document.getElementById('chatSend');
let isBusy = false;

function addBotMessage(text, actions = []) {
  const div = document.createElement('div');
  div.className = 'msg msg-bot';

  const linkified = text
    .replace(
      /pradyumansiyal01@gmail\.com/g,
      '<a href="mailto:pradyumansiyal01@gmail.com" style="color:var(--accent)">pradyumansiyal01@gmail.com</a>'
    )
    .replace(
      /linkedin\.com\/in\/pradyumansiyal/g,
      '<a href="https://linkedin.com/in/pradyumansiyal" target="_blank" style="color:var(--accent)">linkedin.com/in/pradyumansiyal</a>'
    )
    .replace(
      /github\.com\/pradyumansiyal/g,
      '<a href="https://github.com/pradyumansiyal" target="_blank" style="color:var(--accent)">github.com/pradyumansiyal</a>'
    )
    .replace(
      /leetcode\.com\/u\/pradyumansiyal/g,
      '<a href="https://leetcode.com/u/pradyumansiyal" target="_blank" style="color:var(--accent)">leetcode.com/u/pradyumansiyal</a>'
    );

  div.innerHTML = linkified.replace(/\n/g, '<br/>');

  if (actions.length) {
    const row = document.createElement('div');
    row.className = 'msg-actions';
    actions.forEach((a) => {
      if (a.href) {
        const link = document.createElement('a');
        link.className = 'msg-action-btn' + (a.ghost ? ' ghost' : '');
        link.href = a.href;
        link.target = a.href.startsWith('http') ? '_blank' : '_self';
        link.rel = 'noreferrer noopener';
        link.textContent = a.label;
        row.appendChild(link);
      } else {
        const btn = document.createElement('button');
        btn.className = 'msg-action-btn' + (a.ghost ? ' ghost' : '');
        btn.textContent = a.label;
        btn.onclick = () => sendMessage(a.prompt || a.label);
        row.appendChild(btn);
      }
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
  t.className = 'typing';
  t.id = 'typingIndicator';
  t.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(t);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

const KNOWLEDGE = {
  intro:
    "Pradyuman Siyal is a Frontend Developer focused on clean UI, smooth UX, and responsive web apps. He's available for frontend roles and freelance work.",
  contact:
    'You can contact him at:\n• pradyumansiyal01@gmail.com\n• linkedin.com/in/pradyumansiyal\n• github.com/pradyumansiyal\n• leetcode.com/u/pradyumansiyal',
  resume:
    "For the latest resume, email pradyumansiyal01@gmail.com — he usually responds within 24 hours. You can also connect via linkedin.com/in/pradyumansiyal.",
  projects:
    'Featured projects:\n1) Harmoniq (React music player): playlist browsing, audio controls, 40% fewer DOM updates, 30% lower perceived latency.\n2) Personal Finance Tracker (Firebase): income/expense tracking, real-time summaries, 50% fewer invalid entries through validation.\n3) Personal Portfolio Website: custom domain + SSL deployment and modern responsive UI.',
  skills:
    'Core skills:\n• Frontend: HTML, CSS, JavaScript, ReactJS, responsive design, DOM manipulation\n• Programming: Python, Java, C++, JavaScript\n• CS: DSA, OOP, recursion, complexity analysis\n• Tools: Git, GitHub, VS Code\n• Database: MySQL',
};

function getLocalReply(rawInput) {
  const text = rawInput.toLowerCase();

  if (/\b(hi|hello|hey)\b/.test(text)) {
    return `${KNOWLEDGE.intro}\n\n${KNOWLEDGE.contact}`;
  }

  if (/(resume|cv)/.test(text)) return KNOWLEDGE.resume;
  if (/(contact|email|linkedin|github|leetcode|hire|reach)/.test(text)) return KNOWLEDGE.contact;
  if (/(project|portfolio|harmoniq|finance)/.test(text)) return KNOWLEDGE.projects;
  if (/(skill|stack|technology|tech|tools|language)/.test(text)) return KNOWLEDGE.skills;
  if (/(about|who|experience|introduce)/.test(text)) return KNOWLEDGE.intro;

  return (
    "I can help with Pradyuman's projects, skills, contact details, and resume info.\n\n" +
    "Try asking:\n• 'What projects has he built?'\n• 'How can I contact him?'\n• 'What are his skills?'"
  );
}

/* ── AI Call (optional) ── */
const SYSTEM_PROMPT = `You are a helpful, friendly assistant embedded on Pradyuman Siyal's personal portfolio website. Answer questions about his projects, skills, and contact details. Keep responses concise and accurate. Do not invent details.`;

const OPENAI_API_KEY = window.OPENAI_API_KEY || '';

async function callAI(userMessage, history) {
  if (!OPENAI_API_KEY) {
    return getLocalReply(userMessage);
  }
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.5,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      return getLocalReply(userMessage);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || getLocalReply(userMessage);
  } catch {
    return getLocalReply(userMessage);
  }
}

/* ── Send message ── */
const chatHistory = [];

async function sendMessage(text) {
  if (isBusy || !text.trim()) return;
  isBusy = true;
  sendBtn.disabled = true;
  input.value = '';

  document.getElementById('chatChips').style.display = 'none';

  addUserMessage(text);
  showTyping();

  try {
    const reply = await callAI(text, chatHistory);
    removeTyping();

    chatHistory.push({ role: 'user', content: text });
    chatHistory.push({ role: 'assistant', content: reply });

    const lowerReply = reply.toLowerCase();
    const lowerInput = text.toLowerCase();
    const isContact =
      lowerReply.includes('email') ||
      lowerReply.includes('linkedin') ||
      lowerInput.includes('contact') ||
      lowerInput.includes('resume') ||
      lowerInput.includes('hire');

    const actions = isContact
      ? [
          { label: '✉ Email Pradyuman', href: 'mailto:pradyumansiyal01@gmail.com' },
          { label: '🔗 LinkedIn', href: 'https://linkedin.com/in/pradyumansiyal', ghost: true },
          { label: 'GitHub', href: 'https://github.com/pradyumansiyal', ghost: true },
        ]
      : [];

    addBotMessage(reply, actions);
  } catch (e) {
    removeTyping();
    addBotMessage(getLocalReply(text));
  }

  isBusy = false;
  sendBtn.disabled = false;
  input.focus();
}

sendBtn.addEventListener('click', () => sendMessage(input.value.trim()));
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(input.value.trim());
  }
});

/* ── Scroll animations ── */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.proj-card, .skill-card, .contact-item').forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  observer.observe(el);
});
