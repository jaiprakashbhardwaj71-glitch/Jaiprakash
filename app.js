const elements = {
  apiBase: document.getElementById("api-base"),
  apiKey: document.getElementById("api-key"),
  model: document.getElementById("model"),
  channelName: document.getElementById("channel-name"),
  niche: document.getElementById("niche"),
  audience: document.getElementById("audience"),
  videoTopic: document.getElementById("video-topic"),
  output: document.getElementById("output"),
  saveConfig: document.getElementById("save-config"),
  copyOutput: document.getElementById("copy-output"),
  themeToggle: document.getElementById("theme-toggle"),
  loadingTemplate: document.getElementById("loading-template"),
};

const prompts = {
  ideas: "Create 10 high-potential YouTube video ideas with hook angle, target emotion, and short rationale.",
  titles: "Generate 15 high-CTR YouTube titles with different styles (curiosity, authority, urgency, contrarian).",
  script:
    "Write a complete 8-12 minute YouTube script with hook, value delivery, pattern interrupts, CTA, and retention boosters.",
  thumbnail: "Give thumbnail concept ideas with composition, text options, color strategy, and an image-generation prompt.",
  chapters: "Create an engaging hook plan and timestamp-ready chapter outline for this video topic.",
  engagement: "Create a community engagement plan: comment prompts, pinned comment ideas, community post ideas, and short clips strategy.",
};

function loadConfig() {
  const saved = JSON.parse(localStorage.getItem("yt_ai_config") || "{}");
  elements.apiBase.value = saved.apiBase || elements.apiBase.value;
  elements.apiKey.value = saved.apiKey || "";
  elements.model.value = saved.model || elements.model.value;

  const theme = localStorage.getItem("yt_ai_theme") || "dark";
  document.body.classList.toggle("light", theme === "light");
  elements.themeToggle.textContent = theme === "light" ? "🌞" : "🌙";
}

function saveConfig() {
  localStorage.setItem(
    "yt_ai_config",
    JSON.stringify({
      apiBase: elements.apiBase.value.trim(),
      apiKey: elements.apiKey.value.trim(),
      model: elements.model.value.trim(),
    })
  );
  renderOutput("✅ Configuration saved.");
}

function renderOutput(text) {
  elements.output.textContent = text;
}

function setLoading() {
  const loadingNode = elements.loadingTemplate.content.cloneNode(true);
  elements.output.innerHTML = "";
  elements.output.appendChild(loadingNode);
}

function buildContext() {
  const channel = elements.channelName.value.trim() || "Unknown channel";
  const niche = elements.niche.value.trim() || "General content";
  const audience = elements.audience.value.trim() || "General audience";
  const topic = elements.videoTopic.value.trim() || "Not specified";

  return `Channel name: ${channel}\nNiche: ${niche}\nAudience: ${audience}\nCurrent video topic: ${topic}`;
}

async function runTool(tool) {
  const apiKey = elements.apiKey.value.trim();
  if (!apiKey) {
    renderOutput("Please add your API key first.");
    return;
  }

  const task = prompts[tool];
  if (!task) {
    renderOutput("Unknown tool selected.");
    return;
  }

  setLoading();

  const apiBase = elements.apiBase.value.trim().replace(/\/$/, "");
  const model = elements.model.value.trim();

  const systemPrompt =
    "You are an expert YouTube growth strategist, script writer, and AI content optimizer. Provide structured, practical, and highly actionable outputs.";

  const userPrompt = `${buildContext()}\n\nTask: ${task}\n\nFormat with clear headings and bullet points where useful.`;

  try {
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    renderOutput(text || "No content returned by model.");
  } catch (error) {
    renderOutput(`Error: ${error.message}`);
  }
}

function copyOutput() {
  navigator.clipboard
    .writeText(elements.output.textContent || "")
    .then(() => {
      elements.copyOutput.textContent = "Copied!";
      setTimeout(() => {
        elements.copyOutput.textContent = "Copy";
      }, 1200);
    })
    .catch(() => {
      renderOutput("Clipboard copy failed. You can manually select and copy the output.");
    });
}

function toggleTheme() {
  const light = document.body.classList.toggle("light");
  localStorage.setItem("yt_ai_theme", light ? "light" : "dark");
  elements.themeToggle.textContent = light ? "🌞" : "🌙";
}

loadConfig();

for (const button of document.querySelectorAll("[data-tool]")) {
  button.addEventListener("click", () => runTool(button.dataset.tool));
}

elements.saveConfig.addEventListener("click", saveConfig);
elements.copyOutput.addEventListener("click", copyOutput);
elements.themeToggle.addEventListener("click", toggleTheme);
