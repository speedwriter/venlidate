import { buildRoadmapGenerationPrompt } from '../lib/prompts/roadmap-generator';
import { buildNextSprintPrompt } from '../lib/prompts/sprint-generator';

const mockScoreBreakdown = {
  problem_clarity: 7,
  market_size: 4,
  competitive_advantage: 5,
  technical_feasibility: 8,
  go_to_market: 8,
  founder_fit: 9,
  market_timing: 6,
};

console.log("=== Testing Roadmap Prompt Generator ===");
const roadmapPrompt = buildRoadmapGenerationPrompt(
  "AI Prompt Builder",
  "A SaaS tool that helps founders generate personalized LLM prompts based on their product descriptions and target audience.",
  mockScoreBreakdown
);
console.log(roadmapPrompt);
console.log("\n");

console.log("=== Testing Sprint Prompt Generator ===");
const sprintPrompt = buildNextSprintPrompt(
  "AI Prompt Builder",
  "A SaaS tool that helps founders generate personalized LLM prompts based on their product descriptions and target audience.",
  mockScoreBreakdown,
  2, // Phase 2
  1, // Sprint 1
  [
    {
      task_title: "Interview 5 potential users",
      reflection: "Users loved the idea but were confused about pricing."
    }
  ]
);
console.log(sprintPrompt);
