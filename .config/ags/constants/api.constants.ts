import { Api } from "../interfaces/api.interface";

export const chatBotApis: Api[] = [
  {
    name: "Pollinations",
    value: "pollinations",
    icon: "Po",
    description: "Completely free, default model is gpt-4o",
    imageGenerationSupport: true,
  },
  {
    name: "Phind",
    value: "phind",
    icon: "Ph",
    description: "Uses Phind Model. Great for developers",
  },
];
