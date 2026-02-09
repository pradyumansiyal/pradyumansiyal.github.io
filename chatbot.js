const toggleBtn = document.getElementById("chatbot-toggle");
const chatbot = document.getElementById("chatbot");
const closeBtn = document.getElementById("close-chat");
const messages = document.getElementById("chatbot-messages");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

toggleBtn.onclick = () => chatbot.style.display = "flex";
closeBtn.onclick = () => chatbot.style.display = "none";

const qa = [
  {
    keywords: ["skills", "tech", "stack"],
    answer: "I work with HTML, CSS, JavaScript, React, and basic backend concepts."
  },
  {
    keywords: ["projects", "experience", "work"],
    answer: "I’ve built frontend projects including my portfolio and other web applications."
  },
  {
    keywords: ["resume", "cv"],
    answer: "📄 <a href='resume.pdf' download>Download my resume</a>"
  },
  {
    keywords: ["contact", "email", "phone"],
    answer: `
      📧 pradyumansiyal01@gmail.com<br>
      📞 +917056949880<br>
      📄 <a href='resume.pdf' download>Resume</a>
    `
  }
];

function addMessage(text, className) {
  const div = document.createElement("div");
  div.className = className;
  div.innerHTML = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function getBotReply(userText) {
  userText = userText.toLowerCase();
  for (let item of qa) {
    if (item.keywords.some(k => userText.includes(k))) {
      return item.answer;
    }
  }
  return "You can ask about my skills, projects, resume, or contact details.";
}

sendBtn.onclick = () => {
  if (!input.value.trim()) return;
  addMessage(input.value, "user");
  addMessage(getBotReply(input.value), "bot");
  input.value = "";
};
